"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatedNumber } from "@/components/animated-number";
import { PaymentMethodIcons } from "@/components/payment-method-icons";
import { AETHER_CHECKOUT_ID } from "@/lib/scroll-to-hash";
import { AETHER_PRICE, SMS_PRICE } from "@/lib/aether-price";
import { trackMeta } from "../meta-pixel";

// The price and the way to pay, as one decision: the amount (and the
// Klarna split), what comes with it, the SMS add-on as a row you tick, and
// the button carrying the live total. The add-on is off until chosen; the
// amount, the split and the button count to the new total when it changes.
// Styles are .ae-pay in globals.css.

const LICENSE_ID = "lifetime" as const;

const INCLUDES = [
  "The full theme, all 41 sections",
  "Installed by us, the same day",
  "Updates for life, no renewals",
  "5 guides on photos, suppliers and selling",
];

function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ae-check" aria-hidden="true">
      <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" pathLength={1} />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="size-4 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Checkout() {
  const [sms, setSms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const total = AETHER_PRICE + (sms ? SMS_PRICE : 0);

  // The card's arrival: the price counts up and what comes with it checks
  // off line by line.
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setOn(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setOn(true);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const buy = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    // Before the request, not after: the success path replaces the document
    // with Stripe's, and an event fired at that point can be cut off mid-send.
    trackMeta("InitiateCheckout", {
      content_name: "Aether Shopify Theme",
      content_ids: [sms ? "lifetime_sms" : LICENSE_ID],
      content_type: "product",
      value: total,
      currency: "USD",
      num_items: 1,
    });
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: LICENSE_ID, smsSetup: sms }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Could not start checkout");
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err: unknown) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div ref={ref} className="ae-pay" data-on={on || undefined}>
      <p className="ae-pay__amount">
        {/* Proportional digits at this size: Geist's tabular 1 has serifs.
            Counts up to the price as the card arrives. */}
        $<AnimatedNumber value={on ? total : 0} className="normal-nums" />
        <span> once</span>
      </p>
      <p className="ae-pay__klarna">
        or 4 payments of $<AnimatedNumber value={total / 4} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} /> with
        Klarna, no interest
      </p>

      <ul className="ae-pay__includes">
        {INCLUDES.map((line, i) => (
          <li key={line} style={{ "--i": i } as CSSProperties}>
            <Check />
            {line}
          </li>
        ))}
      </ul>

      <label className="ae-addon" data-on={sms || undefined}>
        <input type="checkbox" checked={sms} disabled={busy} onChange={(e) => setSms(e.target.checked)} className="sr-only" />
        <span className="ae-addon__box" aria-hidden>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
          </svg>
        </span>
        <span className="ae-addon__text">
          <span className="ae-addon__title">Add SMS setup</span>
          <span className="ae-addon__desc">We set up text signups, so you can message customers about drops and restocks.</span>
        </span>
        <span className="ae-addon__price">+${SMS_PRICE}</span>
      </label>

      <button id={AETHER_CHECKOUT_ID} type="button" onClick={buy} disabled={busy} data-aether-cta className="ae-buy ae-pay__buy">
        {busy ? (
          <>
            <Spinner />
            Opening checkout
          </>
        ) : (
          // Laid out like a checkout bar: what you get on the left, the live
          // total and the way forward on the right.
          <>
            <span>Get Aether</span>
            <span className="ae-pay__total">
              <span>
                $<AnimatedNumber value={total} className="normal-nums" />
              </span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ae-buy__arrow" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </span>
          </>
        )}
      </button>
      {error && (
        <p role="alert" className="ae-buy__error">
          {error}
        </p>
      )}

      <div className="ae-pay__small">
        {/* Too narrow for one row of six: two even rows of three. */}
        <PaymentMethodIcons className="justify-center max-[399px]:grid max-[399px]:grid-cols-3 max-[399px]:justify-items-center" />
      </div>
    </div>
  );
}
