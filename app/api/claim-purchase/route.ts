import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });

/* Turns a completed Checkout session into a portal account.
 *
 * The Stripe session id is the only credential the caller supplies, and it's
 * verified against Stripe here — a forged or unpaid id gets nothing. The
 * account email always comes from Stripe's customer_details, never from the
 * request body, so the new account is guaranteed to match the email the
 * licenses row was written with (the portal looks licenses up by email string,
 * with no normalization).
 *
 * Why this has to insert a clients row: /auth/callback treats a missing
 * clients row as proof the user was never invited and DELETES the auth user.
 * A purchaser who signed up without one would pay, confirm their email, and
 * be locked out. The clients row has to exist before they finish auth.
 */

type ClaimState = "created" | "invite_sent" | "already_claimed" | "unpaid" | "no_license";

export async function POST(req: Request) {
  try {
    const { session_id } = await req.json();
    if (!session_id || typeof session_id !== "string") {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.retrieve(session_id);
    } catch {
      return NextResponse.json({ error: "Unknown session" }, { status: 404 });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json({ state: "unpaid" satisfies ClaimState }, { status: 402 });
    }

    const email = session.customer_details?.email?.trim();
    if (!email) {
      return NextResponse.json({ error: "No email on session" }, { status: 409 });
    }

    const admin = createAdminClient();

    // The license is written by the Stripe webhook, which may not have landed
    // yet (or may have failed). Without it there's nothing to claim, and
    // creating an account here would produce one with no license attached.
    const { data: license } = await admin
      .from("licenses")
      .select("id, email")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (!license) {
      return NextResponse.json({ state: "no_license" satisfies ClaimState }, { status: 409 });
    }

    // Already claimed? A clients row at this email means the account exists,
    // so this is a refresh or a second visit to the success page.
    const { data: existingClient } = await admin
      .from("clients")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingClient) {
      return NextResponse.json({ state: "already_claimed" satisfies ClaimState, email });
    }

    // Invite rather than createUser: the emailed link lands on /accept-invite,
    // which already handles Supabase's implicit-flow hash tokens correctly.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/accept-invite`,
    });

    if (inviteError || !invited?.user) {
      // An existing auth user with no clients row reaches here. That's the
      // dangerous case /auth/callback would delete, so repair it below rather
      // than leaving them stranded.
      const { data: list } = await admin.auth.admin.listUsers();
      const match = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!match) {
        return NextResponse.json({ error: inviteError?.message ?? "Could not create account" }, { status: 500 });
      }
      await admin.from("clients").upsert({ id: match.id, email }, { onConflict: "id" });
      await admin.from("profiles").upsert({ id: match.id, role: "client" }, { onConflict: "id" });
      return NextResponse.json({ state: "already_claimed" satisfies ClaimState, email });
    }

    const userId = invited.user.id;

    // clients must exist before they complete auth (see header comment).
    const { error: clientError } = await admin.from("clients").insert({ id: userId, email });
    if (clientError) {
      return NextResponse.json({ error: "Could not set up account" }, { status: 500 });
    }

    // handle_new_user already inserted this row via trigger with role
    // 'client'; upsert so the redundant write can't error the request.
    await admin.from("profiles").upsert({ id: userId, role: "client" }, { onConflict: "id" });

    // Point the license at the account's email if the webhook recorded a
    // different casing, so /portal/licenses finds it.
    if (license.email !== email) {
      await admin.from("licenses").update({ email }).eq("id", license.id);
    }

    return NextResponse.json({ state: "invite_sent" satisfies ClaimState, email });
  } catch (err) {
    console.error("[claim-purchase]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
