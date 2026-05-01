import type { Metadata } from "next";
import Link from "next/link";
import { DemoButton } from "./demo-button";
import { FitQuiz } from "./fit-quiz";
import { AetherWave } from "./aether-wave";

export const metadata: Metadata = {
  title: "Aether Theme — Inertia",
  description:
    "A high-end Shopify theme built for conversion, flow, and presence.",
};

const FEATURES = [
  {
    title: "Built like a $150+ theme",
    body: "Aether ships with an experience usually reserved for themes at the very top of the market. Every interaction is considered, every transition earned.",
    accent: [56, 180, 255] as [number, number, number],
  },
  {
    title: "Guided, end to end",
    body: "There isn't a single moment the customer doesn't see your product. The layout pulls them through, quietly, from landing to checkout.",
    accent: [0, 210, 180] as [number, number, number],
  },
  {
    title: "Up to 6x conversion",
    body: "Layout is the lever. Aether's structure is tuned to lift conversion by up to 6x compared to the defaults most stores launch with.",
    accent: [110, 120, 255] as [number, number, number],
  },
];

const TIERS: {
  name: string;
  price: string;
  term: string;
  description: string;
  includes: string[];
  featured?: boolean;
  badge?: string;
}[] = [
  {
    name: "Standard",
    price: "$85",
    term: "1 year · single store",
    description: "The full theme, licensed for a year. Good for testing the waters.",
    includes: ["Full Aether theme", "1 year of updates", "Single store license", "Email support"],
  },
  {
    name: "Lifetime",
    price: "$105",
    term: "Forever · single store",
    description: "Own it outright. One store, no renewals, updates for life.",
    includes: ["Full Aether theme", "Lifetime updates", "Single store license", "Priority email support"],
    featured: true,
    badge: "Most popular",
  },
  {
    name: "Custom",
    price: "On request",
    term: "Foundation + bespoke build",
    description: "Aether as the base, tailored end to end around your brand.",
    includes: ["Bespoke design pass", "Custom sections", "Brand-tuned interactions", "Direct line to us"],
  },
];

const DEMO_URL = "https://aether-starter.myshopify.com";

function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}

function rgb([r, g, b]: [number, number, number], a = 1) {
  return `rgba(${r},${g},${b},${a})`;
}

function SketchStorefront({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 200 130" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Browser chrome */}
      <rect x="8" y="8" width="184" height="114" rx="3" stroke={rgb([160,160,160], 0.18)} strokeWidth="0.9" />
      {/* Nav */}
      <line x1="8" y1="22" x2="192" y2="22" stroke={rgb([160,160,160], 0.15)} strokeWidth="0.7" />
      <line x1="18" y1="33" x2="46" y2="33" stroke={rgb([160,160,160], 0.25)} strokeWidth="0.8" />
      <line x1="80" y1="33" x2="96" y2="33" stroke={rgb([160,160,160], 0.18)} strokeWidth="0.5" />
      <line x1="103" y1="33" x2="119" y2="33" stroke={rgb([160,160,160], 0.18)} strokeWidth="0.5" />
      <line x1="126" y1="33" x2="142" y2="33" stroke={rgb([160,160,160], 0.18)} strokeWidth="0.5" />
      {/* CTA button in nav — accent filled */}
      <rect x="158" y="28" width="28" height="8" rx="2.5" fill={rgb(accent, 0.22)} stroke={rgb(accent, 0.75)} strokeWidth="0.8" />
      {/* Hero image block */}
      <rect x="16" y="40" width="110" height="58" rx="2" fill={rgb(accent, 0.06)} stroke={rgb([160,160,160], 0.15)} strokeWidth="0.7" />
      <line x1="16" y1="40" x2="126" y2="98" stroke={rgb([160,160,160], 0.08)} strokeWidth="0.4" />
      <line x1="126" y1="40" x2="16" y2="98" stroke={rgb([160,160,160], 0.08)} strokeWidth="0.4" />
      {/* Product info — headline accent */}
      <line x1="140" y1="45" x2="186" y2="45" stroke={rgb(accent, 0.9)} strokeWidth="1.4" />
      <line x1="140" y1="52" x2="180" y2="52" stroke={rgb(accent, 0.6)} strokeWidth="1.0" />
      <line x1="140" y1="58" x2="164" y2="58" stroke={rgb([160,160,160], 0.3)} strokeWidth="0.6" />
      <line x1="140" y1="64" x2="176" y2="64" stroke={rgb([160,160,160], 0.25)} strokeWidth="0.5" />
      <line x1="140" y1="69" x2="168" y2="69" stroke={rgb([160,160,160], 0.22)} strokeWidth="0.5" />
      {/* Add to cart — filled accent */}
      <rect x="140" y="75" width="46" height="10" rx="3" fill={rgb(accent, 0.9)} stroke="none" />
      {/* Swatch dots */}
      <circle cx="141" cy="92" r="3" fill={rgb(accent, 0.35)} stroke="none" />
      <circle cx="150" cy="92" r="3" fill={rgb(accent, 0.2)} stroke="none" />
      <circle cx="159" cy="92" r="3" fill={rgb([160,160,160], 0.15)} stroke="none" />
      <circle cx="168" cy="92" r="3" fill={rgb([160,160,160], 0.15)} stroke="none" />
    </svg>
  );
}

function SketchTimeline({ accent }: { accent: [number, number, number] }) {
  return (
    <svg viewBox="0 0 200 130" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Timeline spine */}
      <line x1="20" y1="65" x2="180" y2="65" stroke={rgb([160,160,160], 0.2)} strokeWidth="0.8" />
      <line x1="20" y1="61" x2="20" y2="69" stroke={rgb([160,160,160], 0.25)} strokeWidth="0.9" />
      <polyline points="175,61 180,65 175,69" stroke={rgb([160,160,160], 0.25)} strokeWidth="0.8" />

      {/* Node 1 — active (accent) */}
      <circle cx="46" cy="65" r="5" fill={rgb(accent, 0.18)} stroke={rgb(accent, 0.85)} strokeWidth="1.2" />
      <line x1="46" y1="60" x2="46" y2="36" stroke={rgb(accent, 0.55)} strokeWidth="0.8" />
      <rect x="28" y="22" width="52" height="14" rx="2" fill={rgb(accent, 0.1)} stroke={rgb(accent, 0.45)} strokeWidth="0.7" />
      <line x1="32" y1="28" x2="68" y2="28" stroke={rgb(accent, 0.55)} strokeWidth="0.9" />
      <line x1="32" y1="32" x2="56" y2="32" stroke={rgb(accent, 0.3)} strokeWidth="0.5" />
      {/* Connector arc */}
      <path d="M 34 52 Q 42 44 50 36" stroke={rgb(accent, 0.3)} strokeWidth="0.6" strokeDasharray="2 2" />

      {/* Node 2 — passive */}
      <circle cx="100" cy="65" r="4" fill={rgb([160,160,160], 0.08)} stroke={rgb([160,160,160], 0.3)} strokeWidth="0.9" />
      <line x1="100" y1="70" x2="100" y2="94" stroke={rgb([160,160,160], 0.2)} strokeWidth="0.7" />
      <rect x="80" y="94" width="40" height="14" rx="2" fill="none" stroke={rgb([160,160,160], 0.2)} strokeWidth="0.6" />
      <line x1="84" y1="99" x2="116" y2="99" stroke={rgb([160,160,160], 0.25)} strokeWidth="0.7" />
      <line x1="84" y1="103" x2="106" y2="103" stroke={rgb([160,160,160], 0.18)} strokeWidth="0.5" />

      {/* Node 3 — passive */}
      <circle cx="154" cy="65" r="4" fill={rgb([160,160,160], 0.08)} stroke={rgb([160,160,160], 0.3)} strokeWidth="0.9" />
      <line x1="154" y1="60" x2="154" y2="40" stroke={rgb([160,160,160], 0.2)} strokeWidth="0.7" />
      <rect x="134" y="26" width="40" height="14" rx="2" fill="none" stroke={rgb([160,160,160], 0.2)} strokeWidth="0.6" />
      <line x1="138" y1="31" x2="170" y2="31" stroke={rgb([160,160,160], 0.25)} strokeWidth="0.7" />
      <line x1="138" y1="35" x2="158" y2="35" stroke={rgb([160,160,160], 0.18)} strokeWidth="0.5" />

      {/* Duration bracket */}
      <line x1="46" y1="114" x2="154" y2="114" stroke={rgb([160,160,160], 0.2)} strokeWidth="0.5" />
      <line x1="46" y1="111" x2="46" y2="117" stroke={rgb([160,160,160], 0.25)} strokeWidth="0.6" />
      <line x1="154" y1="111" x2="154" y2="117" stroke={rgb([160,160,160], 0.25)} strokeWidth="0.6" />
    </svg>
  );
}

function SketchConversion({ accent }: { accent: [number, number, number] }) {
  // Bar chart: "default store" vs "Aether" — showing ~6x lift
  // Baseline at y=112, chart top at y=14. Total height = 98px.
  const baseline = 112;
  const chartH = 92;
  // Bar dims
  const defaultH = 14; // ~15% — typical default CR
  const aetherH  = 84; // ~91% of chart height — 6x
  const barW = 28;

  // Default bar: centered around x=62
  const dx = 62;
  // Aether bar: centered around x=138
  const ax = 138;

  return (
    <svg viewBox="0 0 200 130" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Horizontal grid lines */}
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = baseline - chartH * t;
        return <line key={t} x1="30" y1={y} x2="170" y2={y} stroke={rgb([160,160,160], 0.1)} strokeWidth="0.6" strokeDasharray="3 3" />;
      })}

      {/* Baseline */}
      <line x1="30" y1={baseline} x2="170" y2={baseline} stroke={rgb([160,160,160], 0.25)} strokeWidth="0.8" />

      {/* Default bar — muted, short */}
      <rect
        x={dx - barW / 2} y={baseline - defaultH}
        width={barW} height={defaultH}
        rx="2"
        fill={rgb([160,160,160], 0.14)}
        stroke={rgb([160,160,160], 0.3)}
        strokeWidth="0.7"
      />

      {/* Aether bar — accent, tall */}
      <rect
        x={ax - barW / 2} y={baseline - aetherH}
        width={barW} height={aetherH}
        rx="2"
        fill={rgb(accent, 0.18)}
        stroke={rgb(accent, 0.7)}
        strokeWidth="0.9"
      />
      {/* Accent fill top cap to make it pop */}
      <rect
        x={ax - barW / 2} y={baseline - aetherH}
        width={barW} height={8}
        rx="2"
        fill={rgb(accent, 0.85)}
        stroke="none"
      />

      {/* Labels below baseline */}
      <line x1={dx} y1={baseline + 2} x2={dx} y2={baseline + 6} stroke={rgb([160,160,160], 0.3)} strokeWidth="0.6" />
      <line x1={ax} y1={baseline + 2} x2={ax} y2={baseline + 6} stroke={rgb(accent, 0.5)} strokeWidth="0.6" />
      {/* Default label line */}
      <line x1={dx - 10} y1={baseline + 10} x2={dx + 10} y2={baseline + 10} stroke={rgb([160,160,160], 0.3)} strokeWidth="0.7" />
      <line x1={dx - 6}  y1={baseline + 13} x2={dx + 6}  y2={baseline + 13} stroke={rgb([160,160,160], 0.2)} strokeWidth="0.5" />
      {/* Aether label line */}
      <line x1={ax - 10} y1={baseline + 10} x2={ax + 10} y2={baseline + 10} stroke={rgb(accent, 0.6)} strokeWidth="0.9" />
      <line x1={ax - 6}  y1={baseline + 13} x2={ax + 6}  y2={baseline + 13} stroke={rgb(accent, 0.35)} strokeWidth="0.5" />

      {/* 6x callout badge anchored to Aether bar top */}
      <line
        x1={ax + barW / 2 + 2} y1={baseline - aetherH + 4}
        x2={ax + barW / 2 + 18} y2={baseline - aetherH + 4}
        stroke={rgb(accent, 0.4)} strokeWidth="0.6" strokeDasharray="2 2"
      />
      <rect
        x={ax + barW / 2 + 18} y={baseline - aetherH - 2}
        width={22} height={13}
        rx="3"
        fill={rgb(accent, 0.15)}
        stroke={rgb(accent, 0.55)}
        strokeWidth="0.7"
      />
      {/* "6x" text rendered as lines */}
      <line x1={ax + barW / 2 + 22} y1={baseline - aetherH + 3} x2={ax + barW / 2 + 26} y2={baseline - aetherH + 3} stroke={rgb(accent, 0.8)} strokeWidth="1.0" />
      <line x1={ax + barW / 2 + 22} y1={baseline - aetherH + 6} x2={ax + barW / 2 + 26} y2={baseline - aetherH + 6} stroke={rgb(accent, 0.5)} strokeWidth="0.7" />
      <line x1={ax + barW / 2 + 28} y1={baseline - aetherH + 2} x2={ax + barW / 2 + 32} y2={baseline - aetherH + 8} stroke={rgb(accent, 0.75)} strokeWidth="0.9" />
      <line x1={ax + barW / 2 + 28} y1={baseline - aetherH + 8} x2={ax + barW / 2 + 32} y2={baseline - aetherH + 2} stroke={rgb(accent, 0.75)} strokeWidth="0.9" />

      {/* Vertical lift arrow between bars */}
      <line x1="100" y1={baseline - defaultH - 3} x2="100" y2={baseline - aetherH + 3} stroke={rgb([160,160,160], 0.15)} strokeWidth="0.6" strokeDasharray="2 3" />
    </svg>
  );
}

export default function AetherPage() {
  return (
    <main className="page-container mx-auto w-full max-w-5xl min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Back nav */}
      <div className="px-6 sm:px-8 py-5 rise" style={{ ["--rise-delay" as any]: "0ms" }}>
        <Link
          href="/"
          className="text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← back
        </Link>
      </div>

      <GridRule />

      {/* Hero */}
      <section className="px-6 sm:px-8 pt-12 pb-10 flex flex-col items-center text-center rise" style={{ ["--rise-delay" as any]: "60ms" }}>
        <p className="inline-flex items-center gap-1.5 text-[12px] tracking-tight text-[rgb(var(--muted))] mb-6">
          <ShopifyLogo />
          <span>Shopify theme by Inertia</span>
        </p>
        <h1 className="text-[clamp(3.5rem,10vw,6.5rem)] font-medium tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-5">
          Aether
        </h1>
        <p className="text-[1rem] leading-[1.7] tracking-tight text-[rgb(var(--muted))] mb-10 max-w-sm sm:max-w-md">
          A Shopify theme for brands that treat the storefront as the product.
        </p>
        <div className="flex flex-col items-center gap-4 w-full text-[13px] tracking-tight">
          <div className="flex flex-row items-center justify-center gap-2.5">
            <Link
              href="/aether/buy"
              className="inline-flex items-center justify-center gap-2 bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-6 py-2.5 text-[13px] font-medium tracking-tight hover:opacity-85 transition-opacity"
            >
              Buy a license
            </Link>
            <DemoButton href={DEMO_URL} password="aether" />
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 border border-[rgb(var(--line))] px-3.5 py-1.5 text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg))/0.3] transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                <path d="M3 4h10M3 8h7M3 12h5" />
              </svg>
              Docs
            </Link>
            <Link
              href="/aether/changelog"
              className="inline-flex items-center gap-1.5 border border-[rgb(var(--line))] px-3.5 py-1.5 text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg))/0.3] transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                <circle cx="8" cy="8" r="5.5" /><line x1="8" y1="5" x2="8" y2="8.5" /><line x1="8" y1="8.5" x2="10.5" y2="8.5" />
              </svg>
              Changelog
            </Link>
          </div>
        </div>
      </section>

      {/* Animated wave */}
      <div className="rise" style={{ ["--rise-delay" as any]: "80ms" }}>
        <AetherWave />
      </div>

      <GridRule />

      {/* Section label */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-5 sm:py-6 px-6 sm:px-8 rise" style={{ ["--rise-delay" as any]: "100ms" }}>
        <span className="text-[19px] sm:text-[21px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">Why brands</span>
        <div className="flex items-center gap-2 border border-[rgb(var(--line))] rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shrink-0">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[rgb(var(--fg))]" aria-hidden="true">
            <path d="M8 2l1.8 3.6L14 6.5l-3 2.9.7 4.1L8 11.4l-3.7 2 .7-4.1-3-2.9 4.2-.9z" />
          </svg>
          <span className="text-[17px] sm:text-[19px] font-medium tracking-tight text-[rgb(var(--fg))] whitespace-nowrap">choose it</span>
        </div>
        <span className="text-[19px] sm:text-[21px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">over anything else</span>
      </div>

      <GridRule />

      {/* Features */}
      <div className="flex flex-col sm:flex-row rise" style={{ ["--rise-delay" as any]: "140ms" }}>
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="flex-1 flex flex-col gap-5 px-6 sm:px-8 pt-8 pb-8"
            style={{
              borderLeft: i > 0 ? "1px solid rgb(var(--line))" : undefined,
              borderTop: i > 0 ? "1px solid rgb(var(--line))" : undefined,
            }}
          >
            <div className="w-full">
              {i === 0 && <SketchStorefront accent={f.accent} />}
              {i === 1 && <SketchTimeline accent={f.accent} />}
              {i === 2 && <SketchConversion accent={f.accent} />}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-[18px] sm:text-[19px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">
                {f.title}
              </h3>
              <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
                {f.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <GridRule />

      {/* Section label — fit quiz */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-5 sm:py-6 px-6 sm:px-8 rise" style={{ ["--rise-delay" as any]: "180ms" }}>
        <div className="flex items-center gap-2 border border-[rgb(var(--line))] rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shrink-0">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[rgb(var(--fg))]" aria-hidden="true">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5.5c0-1 1.5-1 1.5 0S8 7 8 8M8 10.5v.5" />
          </svg>
          <span className="text-[17px] sm:text-[19px] font-medium tracking-tight text-[rgb(var(--fg))] whitespace-nowrap">Does it fit?</span>
        </div>
        <span className="text-[19px] sm:text-[21px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">Four questions.</span>
      </div>

      <GridRule />

      {/* Fit quiz — inline, edge-to-edge */}
      <div className="py-8 sm:py-10 rise" style={{ ["--rise-delay" as any]: "220ms" }}>
        <FitQuiz />
      </div>

      <GridRule />

      {/* Section label — pricing */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-5 sm:py-6 px-6 sm:px-8 rise" style={{ ["--rise-delay" as any]: "260ms" }}>
        <div className="flex items-center gap-2 border border-[rgb(var(--line))] rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shrink-0">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[rgb(var(--fg))]" aria-hidden="true">
            <rect x="2" y="4" width="12" height="9" rx="1.5" />
            <path d="M2 7h12" />
            <path d="M5 10h2" />
          </svg>
          <span className="text-[17px] sm:text-[19px] font-medium tracking-tight text-[rgb(var(--fg))] whitespace-nowrap">One payment.</span>
        </div>
        <span className="text-[19px] sm:text-[21px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">Yours forever.</span>
      </div>

      <GridRule />

      {/* Pricing */}
      <div id="pricing" className="flex flex-col sm:flex-row scroll-mt-20 rise" style={{ ["--rise-delay" as any]: "300ms" }}>
        {TIERS.map((t, i) => (
          <Link
            key={t.name}
            href={`/aether/buy?tier=${t.name.toLowerCase()}`}
            className="group flex-1 flex flex-col justify-between gap-8 px-6 sm:px-8 pt-8 pb-8 transition-colors hover:bg-[rgb(var(--line))/0.06]"
            style={{
              borderLeft: i > 0 ? "1px solid rgb(var(--line))" : undefined,
              borderTop: i > 0 ? "1px solid rgb(var(--line))" : undefined,
              background: t.featured ? "rgba(56,180,255,0.035)" : undefined,
            }}
          >
            <div className="flex flex-col gap-5">
              {/* Name + badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">{t.name}</span>
                {t.badge && (
                  <span className="inline-flex items-center rounded-full border border-[rgb(56,180,255,0.5)] text-[rgb(56,180,255)] px-2 pt-[3px] pb-[4px] text-[10px] font-medium tracking-tight leading-none">
                    {t.badge}
                  </span>
                )}
              </div>

              {/* Price */}
              <div>
                <p className="text-[2.6rem] font-medium tracking-[-0.05em] leading-none tabular-nums"
                  style={{ color: t.featured ? "rgb(56,180,255)" : "rgb(var(--fg))" }}>
                  {t.price}
                </p>
                <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] mt-2">{t.term}</p>
              </div>

              {/* Description */}
              <p className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))] border-t border-[rgb(var(--line))] pt-4">{t.description}</p>

              {/* Includes */}
              <ul className="space-y-2.5">
                {t.includes.map((line) => (
                  <li key={line} className="flex items-center gap-2 text-[12.5px] tracking-tight text-[rgb(var(--fg))]">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                      className="h-3 w-3 shrink-0"
                      style={{ color: t.featured ? "rgb(56,180,255)" : "rgb(var(--muted))" }}
                      aria-hidden="true">
                      <polyline points="2 8 6 12 14 4" />
                    </svg>
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA row */}
            <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-[rgb(var(--line))]">
              <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] transition-colors">
                {t.price === "On request" ? "Get in touch" : "Get Aether"}
              </span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="w-3.5 h-3.5 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200"
                style={{ color: t.featured ? "rgb(56,180,255)" : "rgb(var(--fg))" }}
                aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <GridRule />

      {/* Footer */}
      <footer className="px-6 sm:px-8 py-8 flex items-center justify-between gap-6 text-[13px] tracking-tight text-[rgb(var(--muted))]">
        <Link href="/" className="hover:text-[rgb(var(--fg))] transition-colors">Inertia</Link>
        <Link href="/contact" className="hover:text-[rgb(var(--fg))] transition-colors">Questions? Get in touch →</Link>
      </footer>

    </main>
  );
}

function ShopifyLogo() {
  return (
    <svg
      viewBox="0 0 256 292"
      aria-hidden="true"
      className="h-[18px] w-auto shrink-0"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        fill="#95BF47"
        d="M223.8 57.3c-.2-1.4-1.5-2.2-2.5-2.3-1-.1-21.4-1.6-21.4-1.6s-14.2-14.1-15.7-15.7c-1.6-1.6-4.7-1.1-5.9-.7 0 0-3 .9-7.9 2.4-.8-2.7-2.1-6-3.8-9.3-5.7-10.8-14-16.5-24-16.5h-.1c-.7 0-1.4 0-2.1.2-.3-.4-.6-.7-.9-1C135.2 8.1 129.5 6 122.6 6.2c-13.3.4-26.5 10-37.2 27-7.6 12-13.3 27-14.9 38.6-15.2 4.7-25.9 8-26.2 8.1C36.7 83 36.5 83.2 35.5 90.4 34.7 95.9 15 246.8 15 246.8L178.7 275l70.9-17.6c.1 0-25.6-198.6-25.8-200.1ZM166.7 42.9c-3.7 1.2-8 2.5-12.5 3.9 0-6.5-.8-15.5-3.8-23.3 9.7 1.8 14.5 12.8 16.3 19.4Zm-21 6.5c-8.6 2.7-18 5.6-27.4 8.5 2.6-10.1 7.6-20.1 13.7-26.7 2.3-2.4 5.5-5.2 9.2-6.7 3.6 7.4 4.4 17.9 4.5 24.9Zm-17.4-33.7c3 0 5.5.6 7.6 2-3.5 1.8-6.9 4.5-10.1 7.9-8.2 8.8-14.5 22.5-17 35.7-7.8 2.4-15.4 4.8-22.5 7 4.5-20.8 22-52 42-52.6Z"
      />
      <path
        fill="#5E8E3E"
        d="M221.3 55c-1-.1-21.4-1.6-21.4-1.6s-14.2-14.1-15.7-15.7c-.6-.6-1.4-.9-2.2-1L178.7 275l70.9-17.6S224 58.7 223.8 57.3c-.2-1.4-1.5-2.2-2.5-2.3Z"
      />
      <path
        fill="#fff"
        d="M150.4 92.5 142.1 123.4s-9.2-4.2-20.1-3.5c-16 1-16.2 11.1-16 13.6.9 13.8 37.3 16.8 39.3 49.2 1.6 25.5-13.5 42.9-35.2 44.3-26.1 1.6-40.5-13.8-40.5-13.8l5.5-23.5s14.5 10.9 26 10.2c7.5-.5 10.3-6.6 9.9-11-1.1-18-30.8-16.9-32.7-46.6-1.5-24.9 14.8-50.2 51-52.5 13.9-.9 21.1 3.7 21.1 3.7Z"
      />
    </svg>
  );
}
