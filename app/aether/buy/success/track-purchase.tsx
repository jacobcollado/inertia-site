"use client";

import { useEffect, useRef } from "react";
import { trackMeta } from "../../../meta-pixel";

/* Browser-side Purchase, paired with the Conversions API event the Stripe
 * webhook sends. Both carry the same id — eventID here, event_id there — so
 * Meta keeps whichever arrives first and discards the other. The browser
 * event usually wins; the server event covers ad blockers, iOS, and visitors
 * who never make it back from Stripe's hosted page.
 *
 * value and currency are required on Purchase, and they come from the server
 * component, which reads the settled amount off the Stripe session. Deriving
 * them client-side would guess wrong whenever a promo code applied, and a
 * wrong value on the winning half of a deduped pair poisons ROAS.
 *
 * Nothing is sent without an id and a value: that means the page was opened
 * directly rather than through Stripe's redirect, so there was no purchase.
 */
export function TrackPurchase({
  sessionId,
  value,
  currency,
  tier,
}: {
  sessionId?: string;
  value?: number;
  currency?: string;
  tier?: string;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (!sessionId || typeof value !== "number" || sent.current) return;
    sent.current = true;
    trackMeta(
      "Purchase",
      {
        value,
        currency: currency ?? "USD",
        content_name: "Aether Shopify Theme",
        content_ids: [tier ?? "lifetime"],
        content_type: "product",
        num_items: 1,
      },
      { eventID: sessionId },
    );
  }, [sessionId, value, currency, tier]);

  return null;
}
