import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });

export const dynamic = "force-dynamic";

/* How long after purchase the emailed setup link keeps working. */
const SETUP_LINK_DAYS = 30;

/* The "Choose a password" link in the setup email points here, not at
 * Supabase directly.
 *
 * Supabase's invite links are single use and expire on the project's short
 * OTP timer, so a buyer who didn't open the email straight away hit "Link
 * expired" with no way to get another: the account already existed, so the
 * success page only offered sign in, and they had no password to sign in
 * with. This route mints a fresh Supabase link at click time and redirects
 * into it, so the emailed link works for as long as the account still needs
 * setting up.
 *
 * The Stripe session id is the credential, the same one the license email's
 * claim link already carries. It stops working once setup is finished (the
 * accept-invite form saves a name) or after SETUP_LINK_DAYS, so it can't
 * become a permanent way into the account. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  // /accept-invite with no tokens renders its "Link expired" state.
  const expired = () => NextResponse.redirect(`${siteUrl}/accept-invite`);

  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) return expired();

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return expired();
  }

  const email = session.customer_details?.email?.trim();
  if (session.payment_status !== "paid" || !email) return expired();

  const admin = createAdminClient();

  const { data: license } = await admin
    .from("licenses")
    .select("status, paid_at")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (!license || license.status !== "active") return expired();

  const paidAt = license.paid_at ? new Date(license.paid_at).getTime() : 0;
  if (Date.now() - paidAt > SETUP_LINK_DAYS * 24 * 60 * 60 * 1000) {
    return NextResponse.redirect(`${siteUrl}/login`);
  }

  const { data: client } = await admin
    .from("clients")
    .select("id, name")
    .eq("email", email)
    .maybeSingle();

  // No account yet: the claim page creates one and sends the setup email.
  if (!client) {
    return NextResponse.redirect(`${siteUrl}/aether/buy/claim?session_id=${encodeURIComponent(session.id)}`);
  }

  // A name is saved when the accept-invite form is submitted (or synced from
  // Google), so its presence means setup is done and they sign in normally.
  if (client.name) return NextResponse.redirect(`${siteUrl}/login`);

  // An invite link only works while the email is unconfirmed. If the old
  // link was opened (or prefetched by a mail scanner) the email is now
  // confirmed, and a magic link signs them in instead. Both land on
  // /accept-invite with a session, which shows the set-password form.
  const { data: user } = await admin.auth.admin.getUserById(client.id);
  const type = user?.user?.email_confirmed_at ? "magiclink" : "invite";

  const { data: link, error } = await admin.auth.admin.generateLink({
    type,
    email,
    options: { redirectTo: `${siteUrl}/accept-invite` },
  });

  const actionLink = link?.properties?.action_link;
  if (error || !actionLink) {
    console.error("[claim-link] could not generate setup link", error);
    return expired();
  }

  return NextResponse.redirect(actionLink);
}
