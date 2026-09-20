import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });

const PRICES: Record<string, string> = {
  standard: process.env.STRIPE_PRICE_STANDARD!,
  lifetime: process.env.STRIPE_PRICE_LIFETIME!,
  lifetime_sms: process.env.STRIPE_PRICE_LIFETIME_SMS!,
};

/* Meta weights the _fbp / _fbc browser cookies heavily when attributing a
 * server-side conversion, but the Stripe webhook is a server-to-server call
 * with no access to them. Stashing them on the session metadata at creation
 * is the only way they survive the trip through Stripe's hosted checkout.
 * Metadata values are capped at 500 chars; both cookies are far shorter. */
function readFbCookies(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const get = (name: string) =>
    cookie.match(new RegExp(`(?:^|;\s*)${name}=([^;]*)`))?.[1] ?? "";
  return { fbp: get("_fbp").slice(0, 500), fbc: get("_fbc").slice(0, 500) };
}

export async function POST(req: Request) {
  try {
    const { tier, smsSetup } = await req.json();
    if (tier !== "standard" && tier !== "lifetime") {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const priceKey = tier === "lifetime" && smsSetup ? "lifetime_sms" : tier;
    const priceId = PRICES[priceKey];
    if (!priceId) {
      return NextResponse.json({ error: "Price not configured" }, { status: 500 });
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://byinertia.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/aether/buy/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/aether#pricing`,
      allow_promotion_codes: true,
      metadata: {
        tier,
        sms_setup: smsSetup ? "true" : "false",
        ...readFbCookies(req),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[create-checkout]", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
