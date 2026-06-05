import type { Metadata } from "next";
import Link from "next/link";
import { DemoButton } from "./demo-button";
import { HeroRule } from "./hero-rule";
import { FeaturesScroll } from "./features-scroll";
import { ProcessSteps } from "./process-steps";
import { MobilePricing } from "./mobile-pricing";

export const metadata: Metadata = {
  title: "Aether - Premium Shopify Theme for Independent Brands",
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
    desc: "Surface related products, bundles, and add-ons at the right moment, without interrupting the buy.",
    points: ["Post-purchase upsell block", "Bundle builder section", "Frequently bought together"],
    visual: "upsell",
    image: "/aether/upsell.png",
    flip: false,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><g><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></g></svg>,
  },
  {
    title: "Scarcity",
    desc: "Low stock counters, countdown timers, and sold indicators. Built to create urgency without feeling cheap.",
    points: ["Live inventory counter", "Countdown timer block", "Sold-out state styling"],
    visual: "scarcity",
    image: "/aether/scarcity.png",
    flip: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><g><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></g></svg>,
  },
  {
    title: "Guided format",
    desc: "Every section pulls the customer forward. No dead ends. No dropped carts.",
    points: ["Sticky add-to-cart bar", "Progress indicators", "Cart drawer with upsells"],
    visual: "guided",
    image: "/aether/guided.png",
    flip: false,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><g><path d="M3 3h18v4H3z"/><path d="M3 10h11v4H3z"/><path d="M3 17h7v4H3z"/></g></svg>,
  },
];

const SECONDARY_FEATURES = [
  { name: "41 sections", desc: "Everything you need, nothing you don't", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><g><rect x="1" y="2" width="14" height="3" rx="1"/><rect x="1" y="7" width="9" height="3" rx="1"/><rect x="1" y="12" width="6" height="3" rx="1"/></g></svg> },
  { name: "Dark mode", desc: "Looks as good at midnight as midday", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><path d="M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5z"/></svg> },
  { name: "Mega menu", desc: "Navigation that handles large catalogues", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><g><rect x="1" y="1" width="14" height="2.5" rx="0.5"/><rect x="1" y="5.5" width="6.5" height="9" rx="0.5"/><rect x="8.5" y="5.5" width="6.5" height="9" rx="0.5"/></g></svg> },
  { name: "Sticky cart", desc: "Add to cart stays in reach at all times", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><g><path d="M1 1h2l1.5 7.5h7L13 4H4"/><circle cx="6.5" cy="13" r="1"/><circle cx="11" cy="13" r="1"/></g></svg> },
  { name: "Mobile optimised", desc: "Built for thumbs first", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><g><rect x="4" y="1" width="8" height="14" rx="1.5"/><line x1="8" y1="12" x2="8" y2="12.5" strokeWidth="1.8"/></g></svg> },
  { name: "Quick buy", desc: "Purchase without leaving the page", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><g><circle cx="8" cy="8" r="7"/><polyline points="5 8 7 10 11 6"/></g></svg> },
  { name: "Video hero", desc: "Autoplay video in the first section", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><g><rect x="1" y="2" width="14" height="12" rx="1.5"/><polygon points="6 5.5 11 8 6 10.5" fill="currentColor" opacity="0.5"/></g></svg> },
  { name: "Lookbook", desc: "Editorial layouts for campaign content", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><g><rect x="1" y="1" width="6.5" height="14" rx="1"/><rect x="8.5" y="1" width="6.5" height="8" rx="1"/><rect x="8.5" y="10" width="6.5" height="5" rx="1"/></g></svg> },
  { name: "SMS + email capture", desc: "Corner widget and popup, both built in", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><g><rect x="1" y="3" width="14" height="10" rx="1.5"/><polyline points="1 3 8 9 15 3"/></g></svg> },
  { name: "Music player", desc: "Ambient audio to set the brand mood", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><g><circle cx="5" cy="13" r="2"/><circle cx="12" cy="11" r="2"/><path d="M7 13V4l7-2v9"/></g></svg> },
  { name: "Custom fonts", desc: "Upload any font directly in the editor", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><g><path d="M2 13L6 3l4 10M3.5 9.5h5"/><path d="M11 5v8M11 5c0-1.1.9-2 2-2s2 .9 2 2"/></g></svg> },
  { name: "FAQs", desc: "Accordion answers on any page", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0"><g><circle cx="8" cy="8" r="7"/><path d="M6 6a2 2 0 1 1 2 2v1"/><circle cx="8" cy="12" r="0.5" fill="currentColor"/></g></svg> },
];

const TIERS = [
  { name: "Standard", price: "$85",       term: "1 year / single store",   badge: "",           color: "#6b8cff" },
  { name: "Lifetime", price: "$105",      term: "One-time / single store",  badge: "Best value", color: "#50b8a0" },
  { name: "Enterprise", price: "From $59", term: "Per store or unlimited",  badge: "",           color: "#c084fc" },
];

const PRICING_ROWS: { label: string; standard: boolean | string; lifetime: boolean | string; enterprise: boolean | string }[] = [
  { label: "Full Aether theme",          standard: true,        lifetime: true,       enterprise: true          },
  { label: "All 41 sections",            standard: true,        lifetime: true,       enterprise: true          },
  { label: "Updates",                    standard: "1 year",    lifetime: "Forever",  enterprise: "Forever"     },
  { label: "Store license",              standard: "Single",    lifetime: "Single",   enterprise: "Multi-store" },
  { label: "Support via client portal",  standard: true,        lifetime: true,       enterprise: true          },
  { label: "Priority support",           standard: false,       lifetime: true,       enterprise: true          },
  { label: "Commercial deployment",      standard: false,       lifetime: false,      enterprise: true          },
];

const DEMO_URL = "https://aether-starter.myshopify.com";



export default function AetherPage() {
  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-5 px-6 text-center rise" style={{ minHeight: 420 }}>
        <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] flex items-center gap-2.5">
          <span className="inline-flex items-center rounded-full px-2 py-1 text-[12px] tracking-tight leading-none text-white" style={{ background: "var(--accent-gradient)" }}>Aether</span>
          <span className="w-px h-3.5 bg-[rgb(var(--line))]" aria-hidden="true" />
          A Shopify theme by Inertia
        </p>
        <h1 className="text-[clamp(2.8rem,6vw,4rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">
          Design is the Product.
        </h1>
        <p className="text-[clamp(1rem,1.8vw,1.1rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm sm:max-w-md">
          A Shopify theme for independent brands that take how things look seriously.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full px-2 sm:px-0 text-[13px] tracking-tight">
          <Link
            href="/aether/buy"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity"
          >
            Buy a license
          </Link>
          <div className="w-full sm:w-auto flex gap-2">
            <div className="flex-[2] sm:flex-none">
              <DemoButton href={DEMO_URL} password="aether" />
            </div>
            <Link
              href="/docs?from=aether"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-full border border-[rgb(var(--line))] px-5 py-2 text-[13px] font-medium tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.3)] transition-colors"
            >
              Docs
            </Link>
          </div>
        </div>
      </section>

      <HeroRule />

      {/* Key features — sticky scroll */}
      <FeaturesScroll features={KEY_FEATURES} />

      {/* Secondary features */}
      <div className="px-3 pb-16 sm:pb-24 rise">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-3">And everything else</p>
        <p className="text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-10">41 sections, ready the moment you install</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
          {SECONDARY_FEATURES.map((f) => (
            <div key={f.name} className="flex items-start gap-3 py-4">
              <span className="text-[rgb(var(--muted))] mt-0.5" style={{ opacity: 0.5 }}>{f.icon}</span>
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

      {/* Pricing */}
      <div id="pricing" className="px-3 pt-16 sm:pt-24 pb-4 scroll-mt-16 max-w-2xl mx-auto w-full">
        <p className="text-[clamp(2.2rem,4vw,3.2rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-4 text-center">One price. Everything in.</p>
        <p className="text-[clamp(1rem,1.6vw,1.1rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-10 text-center max-w-sm mx-auto" style={{ opacity: 0.6 }}>No feature gates. No upsells. Pick the license that fits your store and get every section we've ever built.</p>

        <MobilePricing tiers={TIERS} rows={PRICING_ROWS} />
      </div>


    </main>
  );
}

