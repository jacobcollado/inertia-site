"use client";

import { useState } from "react";
import { trackMeta } from "../meta-pixel";

// The one way to buy Aether, used at the top of the page and at the price:
// straight to Stripe checkout, the price in the label so the click holds no
// surprise. Styles are .ae-buy in globals.css.

const PRICE = 125;
const LICENSE_ID = "lifetime" as const;

function Spinner() {
  return (
    <svg className="size-4 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function BuyButton({ id }: { id?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const buy = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    // Before the request, not after: the success path replaces the document
    // with Stripe's, and an event fired at that point can be cut off mid-send.
    trackMeta("InitiateCheckout", {
      content_name: "Aether Shopify Theme",
      content_ids: [LICENSE_ID],
      content_type: "product",
      value: PRICE,
      currency: "USD",
      num_items: 1,
    });
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: LICENSE_ID, smsSetup: false }),
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
    <div className="ae-buy-wrap">
      <button id={id} type="button" onClick={buy} disabled={busy} data-aether-cta className="ae-buy">
        {busy ? (
          <>
            <Spinner />
            Opening checkout
          </>
        ) : (
          <span>Get Aether for ${PRICE}</span>
        )}
      </button>
      {error && (
        <p role="alert" className="ae-buy__error">
          {error}
        </p>
      )}
    </div>
  );
}
