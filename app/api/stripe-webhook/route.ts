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
  const logoUrl = "https://REDACTED_SUPABASE_PROJECT_REF.supabase.co/storage/v1/object/public/assets/inertia-logo.png";

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:32px;">
          <img src="${logoUrl}" alt="Inertia" width="48" height="48" style="border-radius:12px;display:block;">
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:40px 36px;">

          <p style="margin:0 0 6px;font-size:13px;font-weight:400;letter-spacing:-0.01em;color:rgba(255,255,255,0.4);">Aether ${tierLabel}</p>
          <h1 style="margin:0 0 24px;font-size:24px;font-weight:400;letter-spacing:-0.04em;line-height:1.2;color:#fff;">Your license key</h1>

          <!-- Key box -->
          <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px 20px;margin-bottom:28px;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.3);">License key</p>
            <p style="margin:0;font-family:'Courier New',monospace;font-size:17px;font-weight:500;letter-spacing:0.04em;color:#fff;">${key}</p>
          </div>

          <!-- Steps -->
          <p style="margin:0 0 12px;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.6;letter-spacing:-0.01em;">To activate, install Aether on your Shopify store and enter this key in <strong style="color:rgba(255,255,255,0.7);">Theme Settings → License Key</strong>. Your store domain will be assigned automatically on first activation.</p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
            <tr><td style="border-radius:50px;background:#fff;">
              <a href="https://byinertia.com/dashboard" style="display:inline-block;padding:11px 24px;font-size:13px;font-weight:500;letter-spacing:-0.01em;color:#000;text-decoration:none;">View my licenses</a>
            </td></tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:28px;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);letter-spacing:-0.01em;">Reply to this email if you need help. &mdash; Inertia</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

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
      html,
      text: `Thanks for purchasing Aether ${tierLabel}.\n\nYour license key: ${key}\n\nInstall Aether on your Shopify store and enter this key in Theme Settings → License Key.\n\nView your licenses at https://byinertia.com/dashboard\n\n— Inertia`,
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

  const key = generateLicenseKey();
  const supabase = supabaseAdmin();

  const { error } = await supabase.from("licenses").insert({
    key,
    email,
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
