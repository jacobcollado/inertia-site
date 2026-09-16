import type { Metadata } from "next";
import { AetherHero } from "./aether-hero";
import { HeroRule } from "./hero-rule";
import { FeaturesScroll } from "./features-scroll";
import { ConversionFeatures } from "./conversion-features";
import { VariationsScroll } from "./variations-scroll";
import { InlinePricing } from "./inline-pricing";
import { AetherFaq } from "./faq";
import { SecondaryFeatures } from "./secondary-features";

export const metadata: Metadata = {
  title: "Aether",
  description: "Aether is a premium Shopify theme built for conversion and brand presence. 41 sections, dark mode, sticky cart, mega menu, and live in under an hour. $125 once.",
  alternates: { canonical: "https://byinertia.com/aether" },
  openGraph: {
    type: "website",
    url: "https://byinertia.com/aether",
    title: "Aether - Premium Shopify Theme for Independent Brands",
    description: "Aether is a premium Shopify theme built for conversion and brand presence. 41 sections, dark mode, sticky cart, mega menu, and live in under an hour. $125 once.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Aether Shopify Theme" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aether - Premium Shopify Theme for Independent Brands",
    description: "Aether is a premium Shopify theme built for conversion and brand presence. 41 sections, dark mode, sticky cart, mega menu, and live in under an hour. $125 once.",
    images: ["/og.png"],
  },
};

const KEY_FEATURES = [
  {
    title: "Guided format",
    desc: "Guide every visit toward checkout.",
    visual: "guided",
    image: "/aether/guided.jpg",
    imageMobile: "/aether/hero-mobile-mockup.png",
    flip: false,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path key="a" d="M3 3h18v4H3z"/><path key="b" d="M3 10h11v4H3z"/><path key="c" d="M3 17h7v4H3z"/></svg>,
  },
  {
    title: "Upsell",
    desc: "Raise order value without the hard sell.",
    visual: "upsell",
    image: "/aether/upsell.png",
    imageMobile: "/aether/hero-mobile-cart.png",
    flip: false,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><polyline key="a" points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline key="b" points="16 7 22 7 22 13"/></svg>,
  },
  {
    title: "Scarcity",
    desc: "Show low stock when urgency is real.",
    visual: "scarcity",
    image: "/aether/scarcity.png",
    imageMobile: "/aether/hero-mobile-jacket.png",
    flip: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><circle key="a" cx="12" cy="12" r="10"/><polyline key="b" points="12 6 12 12 16 14"/></svg>,
  },
];

const SECONDARY_FEATURES = [
  { name: "Sticky cart", desc: "Add to cart follows the scroll, so the decision never goes cold", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><rect key="a" x="2" y="2.5" width="12" height="7" rx="1.5"/><rect key="b" x="1.5" y="9" width="13" height="4.5" rx="1.2"/><circle key="c" cx="5" cy="11.25" r="0.85" fill="currentColor" stroke="none"/><path key="d" d="M7.5 11.25h4.5"/></svg> },
  { name: "Quick buy", desc: "Straight from the collection grid, no detour", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><circle key="a" cx="8" cy="8" r="7"/><polyline key="b" points="5 8 7 10 11 6"/></svg> },
  { name: "Mobile optimised", desc: "Designed thumb-first, then scaled up to desktop", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><rect key="a" x="4" y="1" width="8" height="14" rx="1.5"/><line key="b" x1="8" y1="12" x2="8" y2="12.5" strokeWidth="1.8"/></svg> },
  { name: "Mega menu", desc: "Deep catalogues, organised at a glance", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><rect key="a" x="1" y="1" width="14" height="2.5" rx="0.5"/><rect key="b" x="1" y="5.5" width="6.5" height="9" rx="0.5"/><rect key="c" x="8.5" y="5.5" width="6.5" height="9" rx="0.5"/></svg> },
  { name: "SMS + email capture", desc: "Corner widget and popup, styled to match, built in", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><rect key="a" x="1" y="3" width="14" height="10" rx="1.5"/><polyline key="b" points="1 3 8 9 15 3"/></svg> },
  { name: "41 sections", desc: "Every layout a store actually uses, none it doesn't", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><rect key="a" x="1" y="2" width="14" height="3" rx="1"/><rect key="b" x="1" y="7" width="9" height="3" rx="1"/><rect key="c" x="1" y="12" width="6" height="3" rx="1"/></svg> },
];

const DEMO_URL = "https://aether-starter.myshopify.com";

const CONVERSION_MOMENTS = [
  {
    outcome: "First impression",
    headline: "Look like a brand, not a template.",
    detail:
      "Strong imagery, type, and spacing earn attention from the first scroll.",
    image: "/aether/first-impression-runway.jpg",
    alt: "Aether storefront first impression",
  },
  {
    outcome: "Product decision",
    headline: "Make every product easy to choose.",
    detail:
      "Clear galleries, variants, and trust signals keep shoppers moving toward the cart.",
    image: "/aether/product-page-jacket.png",
    alt: "Aether product page with size selector and add to cart",
  },
  {
    outcome: "Path to checkout",
    headline: "Make buying feel effortless.",
    detail:
      "Sticky cart and quick buy shorten the path from browsing to checkout.",
    image: "/aether/checkout-cart-drawer.png",
    alt: "Aether cart drawer with upsells and checkout",
  },
];

const THEME_VARIATIONS = [
  { name: "Dark Mountains", image: "/aether/dark-mountains.jpg" },
  { name: "Runway", image: "/aether/runway-fashion.jpg" },
  { name: "Auditorium", image: "/aether/auditorium-editorial.jpg" },
  { name: "Ocean", image: "/aether/ocean-waves.jpg" },
];

export default function AetherPage() {
  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      <AetherHero demoUrl={DEMO_URL} />

      <HeroRule />

      {/* Key features — carousel */}
      <FeaturesScroll features={KEY_FEATURES} demoUrl={DEMO_URL} />

      <ConversionFeatures moments={CONVERSION_MOMENTS} />

      <div className="grid-rule" aria-hidden="true" />

      <VariationsScroll variations={THEME_VARIATIONS} />

      <div className="grid-rule" aria-hidden="true" />

      {/* Secondary features */}
      <div className="px-3 pt-16 sm:pt-24 pb-16 sm:pb-24">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-10 text-center rise rise--liquid">And the rest of it</p>
        <SecondaryFeatures features={SECONDARY_FEATURES} />
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Pricing */}
      <div id="pricing" className="px-3 pt-16 sm:pt-24 pb-16 sm:pb-24 scroll-mt-16 w-full">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-10 text-center rise rise--liquid">
          What&apos;s <span className="shimmer-word shimmer-word--warm">included</span>
        </p>

        <InlinePricing />
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* FAQ */}
      <AetherFaq />

    </main>
  );
}

