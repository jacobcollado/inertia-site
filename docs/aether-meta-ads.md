# Aether Meta ads tracker

Running log of paid traffic to /aether. Update the snapshot table whenever you check Ads Manager, and add a line to the log for every change you make to a campaign, so results can be tied back to what changed.

## Funnel and tracking

| Step | Meta event | Where it fires |
| --- | --- | --- |
| Lands on /aether | PageView, ViewContent | `app/meta-pixel.tsx`, `app/aether/track-view-content.tsx` |
| Clicks buy on inline pricing or /aether/buy | InitiateCheckout | `app/aether/inline-pricing.tsx`, `app/aether/buy/buy-form.tsx` |
| Pays on Stripe | Purchase (browser + CAPI, deduped by Stripe session id) | `app/aether/buy/success/track-purchase.tsx`, `app/api/stripe-webhook/route.ts` |

Product: Aether Shopify theme, $125 once ($135 with SMS setup).

## Current setup

- Campaign objective:
- Optimization event:
- Daily budget:
- Audience:
- Placements:
- Creatives running:
- Start date:

## Snapshots

Pull these from Ads Manager (add the Landing page views, ViewContent and Initiate checkout columns) plus PostHog for on-site behavior.

| Date | Spend | Impressions | Link clicks | CPC | Landing page views | ViewContent | Demo opens | InitiateCheckout | Purchases | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-25 | | | ~40-50 | | | | | | 0 | First check-in, no conversions yet |

## Change log

- 2026-09-25: Started this tracker.
- 2026-09-25: Fixed PostHog dropping the landing pageview for visitors who accept cookies on their first page. PostHog data before this date undercounts /aether entries. PostHog only sees visitors who accept cookies, so treat it as a sample, not a total. Meta's numbers will always be higher.
- 2026-09-25: /aether conversion pass. Hero now leads with same-day install and "$125 once, no renewals, full refund if we can't get it working". Checkout disclaimer, refund policy and terms switched from "not refundable" to a 14-day works-on-your-store guarantee. Added two real reviews (vora.archive, defy.ca). Compare conversion before and after this date.
- 2026-09-25: Cookie banner removed on /aether, visitors there are auto opted in to PostHog (`app/cookie-banner.tsx`). PostHog visit counts jump from this date because of tracking, not traffic.

## Benchmarks to judge against

- A $125 product from cold Meta traffic typically converts at 0.5 to 2% of landing page views. That means roughly 50 to 200 visits per sale, so fewer than about 200 visits is not enough data to call a campaign failed.
- Link clicks to landing page views should be above about 70%. Lower means people bounce before the page loads (slow mobile load, in-app browser issues).
- Landing page view to InitiateCheckout above 3 to 5% means the page is doing its job and the problem is checkout or price. Below 1% means the page or the audience is the problem.

## Open questions and next steps

- [ ] Confirm Purchase and InitiateCheckout show as active in Events Manager with a test purchase or a promo code.
- [ ] Confirm `META_CAPI_TEST_EVENT_CODE` is not set in Vercel production (it would route real purchases to Test Events).
- [ ] If the campaign optimizes for Purchase, switch to InitiateCheckout or Landing page views until there are some purchases for Meta to learn from.
- [ ] Record landing page views, not just clicks.
- [ ] Check PostHog for scroll depth and where visitors drop on /aether from ad traffic (filter on `utm_source` or `fbclid`).
- [ ] Set up a retargeting ad set for /aether visitors who did not purchase.
