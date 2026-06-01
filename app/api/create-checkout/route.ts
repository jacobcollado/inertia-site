import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });

const PRICES: Record<string, string> = {
  standard: process.env.STRIPE_PRICE_STANDARD!,
  lifetime:  process.env.STRIPE_PRICE_LIFETIME!,
};

export async function POST(req: Request) {
  try {
    const { tier } = await req.json();
    if (tier !== "standard" && tier !== "lifetime") {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const priceId = PRICES[tier];
    if (!priceId) {
      return NextResponse.json({ error: "Price not configured" }, { status: 500 });
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://byinertia.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/aether/buy/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/aether/buy`,
      allow_promotion_codes: true,
      metadata: { tier },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[create-checkout]", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
