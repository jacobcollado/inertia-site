import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderReviewEmail } from "@/lib/review-email";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
/* Ask a week in, once the theme has had time to go live. */
const ASK_AFTER_DAYS = 7;
/* Licenses older than this are skipped, so the first run after deploy
 * doesn't email every past buyer at once. */
const ASK_BEFORE_DAYS = 30;

/* Daily Vercel cron (see vercel.json). Sends the review request email once
 * per active license, 7 to 30 days after purchase.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` on cron calls, so the
 * route refuses anything without it. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn("[review-requests] RESEND_API_KEY not set, skipping run");
    return NextResponse.json({ sent: 0 });
  }

  const admin = createAdminClient();
  const now = Date.now();

  const { data: due, error } = await admin
    .from("licenses")
    .select("id, email")
    .eq("status", "active")
    .is("review_requested_at", null)
    .lte("paid_at", new Date(now - ASK_AFTER_DAYS * DAY_MS).toISOString())
    .gte("paid_at", new Date(now - ASK_BEFORE_DAYS * DAY_MS).toISOString())
    .limit(50);

  if (error) {
    console.error("[review-requests] query failed", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  const { subject, html, text } = renderReviewEmail();
  const emailed = new Set<string>();
  let sent = 0;

  for (const license of due ?? []) {
    // Claim the row first. If another run already claimed it, the update
    // matches nothing and this one moves on.
    const { data: claimed } = await admin
      .from("licenses")
      .update({ review_requested_at: new Date().toISOString() })
      .eq("id", license.id)
      .is("review_requested_at", null)
      .select("id");

    if (!claimed?.length) continue;

    // Someone with two licenses gets one email. The second row is still
    // marked above so it isn't picked up tomorrow.
    const email = license.email?.trim().toLowerCase();
    if (!email || emailed.has(email)) continue;
    emailed.add(email);

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Inertia <hello@byinertia.com>",
          to: [license.email],
          subject,
          html,
          text,
        }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text().catch(() => "")}`);
      sent++;
    } catch (err) {
      // Release the claim so tomorrow's run tries again.
      console.error("[review-requests] send failed", license.id, err);
      await admin.from("licenses").update({ review_requested_at: null }).eq("id", license.id);
    }
  }

  return NextResponse.json({ sent });
}
