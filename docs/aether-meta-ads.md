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

- Campaign objective: Sales, budget set at the ad set level (Advantage+ campaign budget off)
- Optimization event: InitiateCheckout, maximize number of conversions. Fall back to Traffic optimized for Landing page views if InitiateCheckout isn't showing as active in Events Manager. Switch to Purchase once there are 10+ purchases.
- Attribution: 7-day click, 1-day view
- Daily budget: $15, no edits for the first 5 to 7 days so learning isn't reset
- Audience: US, Canada, UK, Australia, ages 20 to 45. Advantage+ audience with suggestions: Shopify, streetwear, fashion design, e-commerce interests, plus Small business owners and Facebook page admins behaviors.
- Placements: manual, 9:16 only. Instagram Reels and Stories, Facebook Reels and Stories. Feed off until there's a 1080x1350 version, Audience Network off.
- Creatives running:
  - `vora-testimonial`: vora.archive review quote ("Super happy with how our website turned out and how quickly you were able to do everything."), their live storefront in a phone mockup, "Aether theme" pill with Shopify bag. No price on the image.
  - `phone-mockup`: original "Stop looking like every other Shopify store" creative with Aether demo content. Still running in its own ad set at $15/day, separate from the vora ad set's $15/day ($30/day total across both).
  - `laptop-voiceover-a` / `laptop-voiceover-b` (prepared 2026-10-03, not live yet): 36s 9:16 video, voiceover with captions over a laptop showing the Aether demo store under changing colored light. "Aether, your new favorite theme" title throughout. Same video in both, only the copy differs (see below). Source file: `Desktop/Youtube Videos/Meta.mp4`.
- Ad copy:
  - Primary text: "Aether is a premium Shopify theme for fashion and streetwear brands. $125 once, no monthly fees. We install it on your store the same day, and if we can't get it working, you get a full refund."
  - Headline: "The Shopify theme for fashion brands"
  - Description: "Installed same day. 14-day guarantee."
  - CTA: Learn More
- Ad copy, `laptop-voiceover-a` (product-led, the main pick):
  - Primary text: "Run a fashion brand on Shopify? Your store should look as good as your product. / Aether is a Shopify theme for brands that care how they look. Clean, simple, and every page guides shoppers to a product, so nobody gets lost. / $125 once, no monthly fees. We install it on your store the same day, and if we can't get it working, you get a full refund." (slashes are paragraph breaks)
  - Headline: "Look as good as your product"
  - Description: "$125 once. Installed same day."
  - CTA: Learn More
- Ad copy, `laptop-voiceover-b` (offer-led):
  - Primary text: "$125 once and it's on your Shopify store today. / Aether is a clean, simple theme for fashion brands that care how their store looks. We install it for you, and if we can't get it working, you get a full refund."
  - Headline: "Installed on your store today"
  - Description: "$125 once. Installed same day."
  - CTA: Learn More
- URL: `https://byinertia.com/aether`, with URL parameters `utm_source=meta&utm_medium=paid&utm_campaign=aether-cold&utm_content={{ad.name}}`. In PostHog, filter `$pageview` on `utm_content`, or `$session_entry_utm_content` for later events in the same visit.
- Start date: 2026-09-26

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
- 2026-09-26: Launched new ad set at $15/day with the `vora-testimonial` creative (see Current setup). The old `phone-mockup` ad is still running in its own separate ad set. Optimizing for InitiateCheckout instead of Purchase, 9:16 placements only, UTMs tagged per ad via `{{ad.name}}`. Reason: the old creative got a decent CTR but no purchases, likely because it read as a clothing ad and drew shoppers instead of store owners. Judge on cost per InitiateCheckout, not CTR.

- 2026-10-03: Prepared the `laptop-voiceover` video ad with two copy variants (a: product-led, b: offer-led), same video, same UTMs. Both name Shopify store owners in the first line and show the price early, to keep filtering out shoppers. Known gaps in the video: the voiceover says setup "literally takes 30 minutes" while the page promises same-day install done for you, and it has no end card with price and URL. Judge a vs b on cost per InitiateCheckout once each has 200+ landing page views.

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
- [ ] Remove the "Get 10% off" popup from the vora creative's phone screenshot.
- [ ] Check the vora creative in Reels and Stories placement previews, move the top text down if the pill is covered.
- [ ] Get vora's okay to use their store and review in paid ads.
- [ ] Make a 1080x1350 version of the vora creative so Feed placements can be turned on.
