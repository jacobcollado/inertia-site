import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { renderLicenseEmail } from "@/lib/license-email";
import { sendMetaEvent } from "@/lib/meta-capi";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

/* Stripe's hosted receipt lives on the charge, not the Checkout session, so
 * it takes one expand to reach it. A missing receipt is not fatal: the license
 * is still valid, the portal just omits the link. */
async function fetchReceiptUrl(session: Stripe.Checkout.Session): Promise<string | null> {
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!paymentIntentId) return null;

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });
    const charge = intent.latest_charge as Stripe.Charge | null;
    return charge?.receipt_url ?? null;
  } catch (err) {
    console.error("[stripe-webhook] could not fetch receipt url", err);
    return null;
  }
}

function generateLicenseKey(): string {
  const part = () => randomBytes(2).toString("hex").toUpperCase();
  return `AETH-${part()}-${part()}-${part()}`;
}

async function sendLicenseEmail(email: string, key: string, tier: string, sessionId: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn("[stripe-webhook] RESEND_API_KEY not set, skipping email");
    return;
  }

  const { subject, html, text } = renderLicenseEmail({ key, tier, sessionId });

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Inertia <hello@byinertia.com>",
      to: [email],
      subject,
      html,
      text,
    }),
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const email = session.customer_details?.email ?? "";
  const tier  = (session.metadata?.tier ?? "standard") as string;

  const supabase = supabaseAdmin();

  // Stripe retries on any non-2xx and also redelivers on its own schedule, so
  // this handler can run more than once for one payment. Bail before minting a
  // key if this session already has a license.
  const { data: existing } = await supabase
    .from("licenses")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const receiptUrl = await fetchReceiptUrl(session);
  const key = generateLicenseKey();

  const { error } = await supabase.from("licenses").insert({
    key,
    email,
    tier,
    status: "active",
    stripe_session_id: session.id,
    theme_file_path: "theme/aether-v1.5.zip",
    amount_total: session.amount_total,
    currency: session.currency,
    receipt_url: receiptUrl,
    paid_at: new Date().toISOString(),
  });

  if (error) {
    // 23505 is the unique index on stripe_session_id: a concurrent delivery of
    // the same event won the race. That license exists, so this is a success.
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[stripe-webhook] failed to insert license", error);
    return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
  }

  try {
    await sendLicenseEmail(email, key, tier, session.id);
  } catch (err) {
    // Don't fail the webhook if email fails — license is already saved
    console.error("[stripe-webhook] email send failed", err);
  }

  /* Meta Purchase, sent from here rather than the browser: this is the only
   * place the settled amount and the buyer's email are both authoritative,
   * and it still fires when the visitor closes the tab on Stripe's page or
   * runs an ad blocker. It sits after the duplicate guard above, so a Stripe
   * redelivery can't send it twice — and the session id doubles as the
   * dedup event_id against any browser-side Purchase. */
  await sendMetaEvent({
    eventName: "Purchase",
    eventId: session.id,
    eventSourceUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://byinertia.com"}/aether/buy/success`,
    user: {
      email,
      fbp: session.metadata?.fbp || null,
      fbc: session.metadata?.fbc || null,
    },
    customData: {
      // amount_total is in cents.
      value: (session.amount_total ?? 0) / 100,
      currency: (session.currency ?? "usd").toUpperCase(),
      content_name: "Aether Shopify Theme",
      content_ids: [tier],
      content_type: "product",
      num_items: 1,
    },
  });

  return NextResponse.json({ received: true });
}
