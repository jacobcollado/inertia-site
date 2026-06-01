import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

function generateLicenseKey(): string {
  const part = () => randomBytes(2).toString("hex").toUpperCase();
  return `AETH-${part()}-${part()}-${part()}`;
}

async function sendLicenseEmail(email: string, key: string, tier: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn("[stripe-webhook] RESEND_API_KEY not set, skipping email");
    return;
  }

  const tierLabel = tier === "lifetime" ? "Lifetime" : "Standard";

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Inertia <hello@byinertia.com>",
      to: [email],
      subject: "Your Aether license key",
      text: [
        `Thanks for purchasing Aether ${tierLabel}.`,
        "",
        `Your license key: ${key}`,
        "",
        "You can view and manage your license at https://byinertia.com/portal/licenses",
        "",
        "To activate your license, install the Aether theme on your Shopify store, then enter the key in the theme settings.",
        "",
        "Reply to this email if you need any help.",
        "",
        "— Inertia",
      ].join("\n"),
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

  const domainField = session.custom_fields?.find(
    (f) => f.key === "shopify_domain",
  );
  const domain = domainField?.text?.value?.trim() || null;

  const key = generateLicenseKey();
  const supabase = supabaseAdmin();

  const { error } = await supabase.from("licenses").insert({
    key,
    email,
    domain,
    tier,
    status: "active",
    stripe_session_id: session.id,
  });

  if (error) {
    console.error("[stripe-webhook] failed to insert license", error);
    return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
  }

  try {
    await sendLicenseEmail(email, key, tier);
  } catch (err) {
    // Don't fail the webhook if email fails — license is already saved
    console.error("[stripe-webhook] email send failed", err);
  }

  return NextResponse.json({ received: true });
}
