import type { Metadata } from "next";
import { AetherHero } from "./aether-hero";
import { HeroRule } from "./hero-rule";
import { FeaturesScroll } from "./features-scroll";
import { ProcessSteps } from "./process-steps";
import { InlinePricing } from "./inline-pricing";
import { AetherFaq } from "./faq";

export const metadata: Metadata = {
  title: "Aether",
  description: "Aether is a premium Shopify theme built for conversion and brand presence. 41 sections, dark mode, sticky cart, mega menu, and live in under an hour. From $85.",
  alternates: { canonical: "https://byinertia.com/aether" },
  openGraph: {
    type: "website",
    url: "https://byinertia.com/aether",
    title: "Aether - Premium Shopify Theme for Independent Brands",
    description: "Aether is a premium Shopify theme built for conversion and brand presence. 41 sections, dark mode, sticky cart, mega menu, and live in under an hour. From $85.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Aether Shopify Theme" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aether - Premium Shopify Theme for Independent Brands",
    description: "Aether is a premium Shopify theme built for conversion and brand presence. 41 sections, dark mode, sticky cart, mega menu, and live in under an hour. From $85.",
    images: ["/og.png"],
  },
};

const KEY_FEATURES = [
  {
    title: "Upsell",
    desc: "More per order, without the hard sell. Bundles and add-ons appear at the moments they make sense and stay out of the way the rest of the time.",
    points: ["Post-purchase offer block", "Bundle builder section", "Frequently bought together rail"],
    visual: "upsell",
    image: "/aether/upsell.png",
    flip: false,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><polyline key="a" points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline key="b" points="16 7 22 7 22 13"/></svg>,
  },
  {
    title: "Scarcity",
    desc: "When there are four left, say four. Aether treats scarcity as honesty, which is why it converts for brands that can't afford to look desperate.",
    points: ["Live inventory counter", "Countdown timer block", "Designed sold-out states"],
    visual: "scarcity",
    image: "/aether/scarcity.png",
    flip: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><circle key="a" cx="12" cy="12" r="10"/><polyline key="b" points="12 6 12 12 16 14"/></svg>,
  },
  {
    title: "Guided format",
    desc: "No dead ends anywhere in the store. Each section leads into the next, so a browser is always one scroll away from becoming a buyer.",
    points: ["Sticky add-to-cart bar", "Progress indicators through checkout", "Cart drawer with built-in upsells"],
    visual: "guided",
    image: "/aether/guided.png",
    flip: false,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path key="a" d="M3 3h18v4H3z"/><path key="b" d="M3 10h11v4H3z"/><path key="c" d="M3 17h7v4H3z"/></svg>,
  },
];

const SECONDARY_FEATURES = [
  { name: "41 sections", desc: "Every layout a store actually uses, none it doesn't", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><rect key="a" x="1" y="2" width="14" height="3" rx="1"/><rect key="b" x="1" y="7" width="9" height="3" rx="1"/><rect key="c" x="1" y="12" width="6" height="3" rx="1"/></svg> },
  { name: "Dark mode", desc: "A full dark palette, not an inverted afterthought", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><path d="M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5z"/></svg> },
  { name: "Mega menu", desc: "Deep catalogues, organised at a glance", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><rect key="a" x="1" y="1" width="14" height="2.5" rx="0.5"/><rect key="b" x="1" y="5.5" width="6.5" height="9" rx="0.5"/><rect key="c" x="8.5" y="5.5" width="6.5" height="9" rx="0.5"/></svg> },
  { name: "Sticky cart", desc: "Add to cart follows the scroll, so the decision never goes cold", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><path key="a" d="M1 1h2l1.5 7.5h7L13 4H4"/><circle key="b" cx="6.5" cy="13" r="1"/><circle key="c" cx="11" cy="13" r="1"/></svg> },
  { name: "Mobile optimised", desc: "Designed thumb-first, then scaled up to desktop", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><rect key="a" x="4" y="1" width="8" height="14" rx="1.5"/><line key="b" x1="8" y1="12" x2="8" y2="12.5" strokeWidth="1.8"/></svg> },
  { name: "Quick buy", desc: "Straight from the collection grid, no detour", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><circle key="a" cx="8" cy="8" r="7"/><polyline key="b" points="5 8 7 10 11 6"/></svg> },
  { name: "Video hero", desc: "Open on motion, muted, instant", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><rect key="a" x="1" y="2" width="14" height="12" rx="1.5"/><polygon key="b" points="6 5.5 11 8 6 10.5" fill="currentColor" opacity="0.5"/></svg> },
  { name: "Lookbook", desc: "Magazine-style layouts for campaigns and drops", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><rect key="a" x="1" y="1" width="6.5" height="14" rx="1"/><rect key="b" x="8.5" y="1" width="6.5" height="8" rx="1"/><rect key="c" x="8.5" y="10" width="6.5" height="5" rx="1"/></svg> },
  { name: "SMS + email capture", desc: "Corner widget and popup, styled to match, built in", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><rect key="a" x="1" y="3" width="14" height="10" rx="1.5"/><polyline key="b" points="1 3 8 9 15 3"/></svg> },
  { name: "Music player", desc: "Optional ambient audio, because a brand can have a soundtrack", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><circle key="a" cx="5" cy="13" r="2"/><circle key="b" cx="12" cy="11" r="2"/><path key="c" d="M7 13V4l7-2v9"/></svg> },
  { name: "Custom fonts", desc: "Upload your own type files straight into the editor", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><path key="a" d="M2 13L6 3l4 10M3.5 9.5h5"/><path key="b" d="M11 5v8M11 5c0-1.1.9-2 2-2s2 .9 2 2"/></svg> },
  { name: "FAQs", desc: "Accordion answers wherever the doubts show up", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><circle key="a" cx="8" cy="8" r="7"/><path key="b" d="M6 6a2 2 0 1 1 2 2v1"/><circle key="c" cx="8" cy="12" r="0.5" fill="currentColor"/></svg> },
];

const DEMO_URL = "https://aether-starter.myshopify.com";



export default function AetherPage() {
  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      <AetherHero demoUrl={DEMO_URL} />

      <HeroRule />

      {/* Key features — sticky scroll */}
      <FeaturesScroll features={KEY_FEATURES} />

      {/* Secondary features */}
      <div className="px-3 pb-16 sm:pb-24">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-3 rise rise--liquid">And the rest of it</p>
        <div className="mb-10 rise rise--liquid" style={{ "--rise-delay": "60ms" } as React.CSSProperties}>
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] sm:text-[13px] font-normal tracking-tight bg-[rgb(var(--fg)/0.06)] text-[rgb(var(--fg))]">
            Everything included
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
          {SECONDARY_FEATURES.map((f, i) => (
            <div
              key={f.name}
              className="flex items-start py-4 rise rise--liquid"
              style={{ "--rise-delay": `${120 + i * 40}ms` } as React.CSSProperties}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] tracking-tight font-medium text-[rgb(var(--fg))]">{f.name}</span>
                <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Process steps */}
      <ProcessSteps />

      <div className="grid-rule" aria-hidden="true" />

      {/* FAQ */}
      <AetherFaq />

      {/* Pricing */}
      <div id="pricing" className="px-3 pt-16 sm:pt-24 pb-4 scroll-mt-16 w-full">
        <p className="text-[clamp(2.2rem,4vw,3.2rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-10 text-center rise rise--liquid">
          Pick a <span className="shimmer-word shimmer-word--warm">license</span>
        </p>

        <InlinePricing />
      </div>

    </main>
  );
}

