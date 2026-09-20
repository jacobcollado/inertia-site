import { createHash } from "crypto";

/* Meta Conversions API.
 *
 * The browser pixel can't be trusted for Purchase here: the payment completes
 * on Stripe's hosted page, and the visitor lands back on /aether/buy/success
 * where a refresh would re-fire the event and the real amount isn't available
 * client-side. So Purchase is sent from the Stripe webhook instead, where the
 * amount, currency and email are authoritative.
 *
 * Deduplication: both halves send the same event_name + event_id, and Meta
 * collapses them. The Stripe Checkout session id is the event id, since it's
 * the one value both the webhook and the success page hold.
 */

const API_VERSION = "v21.0";

type UserData = {
  email?: string | null;
  /* _fbp / _fbc cookies, when we have them. Meta weights these heavily for
   * attribution, so a server event carrying them matches far better than one
   * with a hashed email alone. */
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
};

// Meta requires SHA-256 of the normalized (trimmed, lowercased) value.
function hash(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function buildUserData(user: UserData) {
  const data: Record<string, unknown> = {};
  if (user.email) data.em = [hash(user.email)];
  if (user.fbp) data.fbp = user.fbp;
  if (user.fbc) data.fbc = user.fbc;
  if (user.clientIp) data.client_ip_address = user.clientIp;
  if (user.userAgent) data.client_user_agent = user.userAgent;
  return data;
}

export type CapiEvent = {
  eventName: string;
  /* Dedup key shared with the browser pixel's eventID. */
  eventId: string;
  eventSourceUrl?: string;
  /* Seconds, not ms. Defaults to now. Meta rejects events older than 7 days. */
  eventTime?: number;
  user: UserData;
  customData?: Record<string, unknown>;
};

/* Sends one event. Never throws: a Meta outage must not fail the Stripe
 * webhook, because a non-2xx there makes Stripe retry and we'd re-issue work
 * that already succeeded. Failures are logged and swallowed. */
export async function sendMetaEvent(event: CapiEvent): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID ?? process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn("[meta-capi] pixel id or access token not set, skipping event", event.eventName);
    return;
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl,
        action_source: "website",
        user_data: buildUserData(event.user),
        custom_data: event.customData ?? {},
      },
    ],
  };

  // Routes the event to Test Events in Events Manager instead of live data.
  if (process.env.META_CAPI_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_CAPI_TEST_EVENT_CODE;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      console.error("[meta-capi] rejected", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[meta-capi] send failed", err);
  }
}
