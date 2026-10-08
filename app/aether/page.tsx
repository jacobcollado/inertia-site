import type { Metadata } from "next";
import { AetherHero } from "./aether-hero";
import { AetherDemoBanner } from "./demo-banner";
import { ChapterMark, Values } from "./values";
import { SwitchToAether } from "./switch";
import { FeaturesScroll } from "./features-scroll";
import { StoresOnAether } from "./stores-on-aether";
import { VariationsScroll } from "./variations-scroll";
import { InlinePricing } from "./inline-pricing";
import { AetherAskAi, AetherFaq, QUESTIONS } from "./faq";
import { SetupSteps } from "./setup-steps";
import { Testimonials } from "./testimonials";
import { TrackAetherViewContent } from "./track-view-content";
import { AETHER_PRICING_ID } from "@/lib/scroll-to-hash";

export const metadata: Metadata = {
  title: { absolute: "Aether, a Shopify theme by Inertia" },
  description: "Aether is a Shopify theme for brands that care how their store looks. 41 sections, dark mode, sticky cart and mega menu, installed for you the same day. $125 once.",
  alternates: { canonical: "https://byinertia.com/aether" },
  openGraph: {
    type: "website",
    url: "https://byinertia.com/aether",
    title: { absolute: "Aether, a Shopify theme by Inertia" },
    description: "Aether is a Shopify theme for brands that care how their store looks. 41 sections, dark mode, sticky cart and mega menu, installed for you the same day. $125 once.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Aether Shopify Theme" }],
  },
  twitter: {
    card: "summary_large_image",
    title: { absolute: "Aether, a Shopify theme by Inertia" },
    description: "Aether is a Shopify theme for brands that care how their store looks. 41 sections, dark mode, sticky cart and mega menu, installed for you the same day. $125 once.",
    images: ["/og.png"],
  },
};

const KEY_FEATURES = [
  {
    title: "Guided format",
    desc: "Every page points shoppers to the next step.",
    visual: "guided",
    image: "/aether/guided.jpg",
    imageMobile: "/aether/feature-mobile-guided.png",
    flip: false,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path key="a" d="M3 3h18v4H3z"/><path key="b" d="M3 10h11v4H3z"/><path key="c" d="M3 17h7v4H3z"/></svg>,
  },
  {
    title: "Upsell",
    desc: "Picks in the cart and a free shipping bar get shoppers to add one more item.",
    visual: "upsell",
    image: "/aether/upsell.png",
    imageMobile: "/aether/feature-mobile-upsell.png",
    flip: false,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><polyline key="a" points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline key="b" points="16 7 22 7 22 13"/></svg>,
  },
  {
    title: "Scarcity",
    desc: "Sold-out sizes show at a glance, and a back-in-stock alert keeps the sale.",
    visual: "scarcity",
    image: "/aether/scarcity.png",
    imageMobile: "/aether/feature-mobile-scarcity.png",
    flip: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><circle key="a" cx="12" cy="12" r="10"/><polyline key="b" points="12 6 12 12 16 14"/></svg>,
  },
];

const SECONDARY_FEATURES = [
  { name: "Sticky cart", desc: "Add to cart follows the scroll, so the decision never goes cold", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><path key="a" d="M1.5 6h8.5l-.8 8H2.3Z"/><path key="b" d="M3.8 6V4.8a2 2 0 0 1 4 0V6"/><circle key="c" cx="13" cy="3.3" r="1.8"/><path key="d" d="M13 5.1V8.5"/></svg> },
  { name: "Quick buy", desc: "Straight from the collection grid, no detour", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><circle key="a" cx="8" cy="8" r="7"/><polyline key="b" points="5 8 7 10 11 6"/></svg> },
  { name: "Mobile optimised", desc: "Designed thumb-first, then scaled up to desktop", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><rect key="a" x="4" y="1" width="8" height="14" rx="1.5"/><line key="b" x1="8" y1="12" x2="8" y2="12.5" strokeWidth="1.8"/></svg> },
  { name: "Mega menu", desc: "Deep catalogues, organised at a glance", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><path key="a" d="M1.5 2.5h3M6.5 2.5h3M11.5 2.5h3"/><rect key="b" x="1" y="5" width="14" height="9.5" rx="1.5"/><path key="c" d="M4 8.5h3M4 11.5h2M9 8.5h3M9 11.5h2"/></svg> },
  { name: "SMS + email capture", desc: "Corner widget and popup, styled to match, built in", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><path key="a" d="M6.5 9.5H2.5A1.5 1.5 0 0 1 1 8V4a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 11 4v1.5"/><polyline key="b" points="1.4 3.1 6 6.3 10.6 3.1"/><path key="c" d="M9 7h5a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1h-1.5L11 14v-1.5H9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/></svg> },
  { name: "41 sections", desc: "Every layout a store actually uses, none it doesn't", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><path key="a" d="M8 1.5 14.5 5 8 8.5 1.5 5Z"/><path key="b" d="M1.5 8 8 11.5 14.5 8"/><path key="c" d="M1.5 11 8 14.5 14.5 11"/></svg> },
];

const DEMO_URL = "https://aether-starter.myshopify.com";

// Structured data for this page only: the product, and the FAQ as questions
// and answers. Lived in the root layout before, which put a product offer on
// every page of the studio site.
const AETHER_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Aether",
    "alternateName": "Aether Shopify Theme",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Shopify",
    "url": "https://byinertia.com/aether",
    "description": "A Shopify theme for brands that care how their store looks. 41 sections, dark mode, sticky cart and mega menu, installed for you the same day.",
    "offers": {
      "@type": "Offer",
      "price": "125",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://byinertia.com/aether#pricing",
    },
    "publisher": { "@id": "https://byinertia.com/#organization" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": QUESTIONS.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  },
];

const THEME_VARIATIONS = [
  { name: "Rosso", image: "/aether/rosso-macbook-v2.png", imageMobile: "/aether/rosso-mobile.png" },
  { name: "Argent", image: "/aether/argent-macbook.png", imageMobile: "/aether/argent-mobile-v2.png" },
  { name: "After Hours", image: "/aether/after-hours-macbook.png", imageMobile: "/aether/after-hours-mobile.png" },
  { name: "Relics", image: "/aether/relics-macbook.png", imageMobile: "/aether/relics-mobile.png" },
];

export default function AetherPage() {
  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col pb-16 sm:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(AETHER_JSON_LD) }}
      />
      <TrackAetherViewContent />
      <AetherDemoBanner />

      <AetherHero demoUrl={DEMO_URL} />

      {/* Proof first, and light: real stores before anything is claimed. */}
      <StoresOnAether />

      {/* The spine: three values, said once and drawn. Each one links to the
          chapter below that proves it. Chapters are set apart by space and
          their chapter mark rather than rules; rules only mark the turns
          from values to chapters to the close. */}
      <div className="grid-rule grid-rule--dashed" aria-hidden="true" />
      <Values />

      <div className="grid-rule grid-rule--dashed" aria-hidden="true" />
      <div id="customer" className="scroll-mt-16">
        <FeaturesScroll features={KEY_FEATURES} demoUrl={DEMO_URL} eyebrow={<ChapterMark value="customer" />} />
        <Testimonials />
      </div>

      <div className="grid-rule grid-rule--dashed" aria-hidden="true" />
      <div id="speed" className="scroll-mt-16">
        {/* Setup speed, the service half of the value. The demo recording
            is a tap away on every View demo button, so it isn't inline. */}
        <SetupSteps eyebrow={<ChapterMark value="speed" />} />
      </div>

      <div className="grid-rule grid-rule--dashed" aria-hidden="true" />
      <div id="identity" className="scroll-mt-16">
        <VariationsScroll variations={THEME_VARIATIONS} initial="Relics" eyebrow={<ChapterMark value="identity" />} />
      </div>

      <div className="grid-rule grid-rule--dashed" aria-hidden="true" />

      {/* The closing argument for anyone already on a theme: Aether beside
          a typical premium one, and what stays safe when they switch. */}
      <SwitchToAether />

      <section id={AETHER_PRICING_ID} className="py-16 sm:py-24 scroll-mt-16 w-full">
        <InlinePricing />
      </section>

      <div className="grid-rule grid-rule--dashed" aria-hidden="true" />

      <AetherFaq />
      <AetherAskAi />

    </main>
  );
}

