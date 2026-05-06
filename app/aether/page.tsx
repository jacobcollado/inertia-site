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
    name: "Enterprise",
    price: "From $59",
    term: "Per store or unlimited",
    description: "Aether as a foundation for agencies, studios, and operators running multiple stores.",
    includes: ["Commercial deployment rights", "Multi-store licensing", "Lifetime updates", "Dedicated support"],
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
  const g = (a: number) => rgb([160,160,160], a);
  return (
    <svg viewBox="0 0 200 134" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Browser chrome */}
      <rect x="6" y="6" width="188" height="122" rx="3" stroke={g(0.16)} strokeWidth="0.9" />
      <rect x="6" y="6" width="188" height="18" rx="3" fill={g(0.05)} stroke={g(0.14)} strokeWidth="0.7" />
      {/* URL pill */}
      <rect x="62" y="10" width="76" height="9" rx="2.5" stroke={g(0.2)} strokeWidth="0.6" />
      <circle cx="20" cy="15" r="2.5" fill={g(0.18)} />
      <circle cx="29" cy="15" r="2.5" fill={g(0.12)} />
      <circle cx="38" cy="15" r="2.5" fill={g(0.1)} />
      {/* Nav bar */}
      <line x1="6" y1="24" x2="194" y2="24" stroke={g(0.12)} strokeWidth="0.6" />
      <line x1="16" y1="30" x2="34" y2="30" stroke={g(0.22)} strokeWidth="0.9" />
      <line x1="68" y1="30" x2="82" y2="30" stroke={g(0.14)} strokeWidth="0.5" />
      <line x1="88" y1="30" x2="102" y2="30" stroke={g(0.14)} strokeWidth="0.5" />
      <line x1="108" y1="30" x2="122" y2="30" stroke={g(0.14)} strokeWidth="0.5" />
      <rect x="152" y="26" width="32" height="9" rx="2" fill={rgb(accent, 0.18)} stroke={rgb(accent, 0.65)} strokeWidth="0.8" />
      {/* PDP layout — two column */}
      {/* Product image: left col */}
      <rect x="14" y="38" width="88" height="72" rx="2" fill={rgb(accent, 0.05)} stroke={g(0.14)} strokeWidth="0.7" />
      {/* Thumbnail strip */}
      <rect x="14" y="114" width="20" height="14" rx="1.5" fill={rgb(accent, 0.08)} stroke={rgb(accent, 0.3)} strokeWidth="0.7" />
      <rect x="38" y="114" width="20" height="14" rx="1.5" fill={g(0.05)} stroke={g(0.15)} strokeWidth="0.6" />
      <rect x="62" y="114" width="20" height="14" rx="1.5" fill={g(0.05)} stroke={g(0.15)} strokeWidth="0.6" />
      {/* Right col — product info */}
      <line x1="112" y1="44" x2="186" y2="44" stroke={rgb(accent, 0.85)} strokeWidth="1.5" />
      <line x1="112" y1="51" x2="176" y2="51" stroke={rgb(accent, 0.5)} strokeWidth="1.0" />
      <line x1="112" y1="58" x2="152" y2="58" stroke={g(0.3)} strokeWidth="0.6" />
      {/* Price */}
      <line x1="112" y1="66" x2="138" y2="66" stroke={rgb(accent, 0.7)} strokeWidth="1.2" />
      {/* Swatches */}
      <circle cx="115" cy="76" r="3.5" fill={rgb(accent, 0.5)} />
      <circle cx="125" cy="76" r="3.5" fill={rgb(accent, 0.25)} />
      <circle cx="135" cy="76" r="3.5" stroke={g(0.3)} strokeWidth="0.8" />
      <circle cx="145" cy="76" r="3.5" stroke={g(0.25)} strokeWidth="0.8" />
      {/* Size pills */}
      <rect x="112" y="84" width="14" height="8" rx="1.5" stroke={g(0.2)} strokeWidth="0.6" />
      <rect x="130" y="84" width="14" height="8" rx="1.5" fill={rgb(accent, 0.12)} stroke={rgb(accent, 0.5)} strokeWidth="0.7" />
      <rect x="148" y="84" width="14" height="8" rx="1.5" stroke={g(0.2)} strokeWidth="0.6" />
      {/* Add to cart */}
      <rect x="112" y="96" width="74" height="13" rx="2" fill={rgb(accent, 0.9)} />
      <line x1="136" y1="102" x2="162" y2="102" stroke="white" strokeWidth="1.2" opacity="0.7" />
    </svg>
  );
}

function SketchTimeline({ accent }: { accent: [number, number, number] }) {
  const g = (a: number) => rgb([160,160,160], a);
  // 4-step customer journey: Land → Browse → Product → Checkout
  const steps = [
    { x: 28,  label: "Land",     active: true  },
    { x: 78,  label: "Browse",   active: true  },
    { x: 128, label: "Product",  active: true  },
    { x: 178, label: "Checkout", active: false },
  ];
  return (
    <svg viewBox="0 0 206 134" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Progress track */}
      <line x1="28" y1="62" x2="178" y2="62" stroke={g(0.15)} strokeWidth="2" strokeLinecap="round" />
      {/* Filled progress — up to Product */}
      <line x1="28" y1="62" x2="128" y2="62" stroke={rgb(accent, 0.5)} strokeWidth="2" strokeLinecap="round" />

      {steps.map((s, i) => {
        const done = i < 3;
        const current = i === 2;
        return (
          <g key={s.x}>
            {/* Node */}
            <circle cx={s.x} cy="62" r={current ? 7 : 5}
              fill={done ? rgb(accent, current ? 0.9 : 0.25) : g(0.07)}
              stroke={done ? rgb(accent, current ? 1 : 0.6) : g(0.25)}
              strokeWidth={current ? 1.5 : 1} />
            {/* Check on completed past nodes */}
            {done && !current && (
              <polyline
                points={`${s.x-2.5},${62} ${s.x-0.5},${64} ${s.x+3},${59}`}
                stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {/* Stem */}
            <line x1={s.x} y1={i % 2 === 0 ? 55 : 69}
              x2={s.x} y2={i % 2 === 0 ? 32 : 92}
              stroke={done ? rgb(accent, 0.3) : g(0.15)} strokeWidth="0.7" strokeDasharray="2 2" />
            {/* Label card */}
            <rect
              x={s.x - 22} y={i % 2 === 0 ? 18 : 94}
              width="44" height="14" rx="2"
              fill={current ? rgb(accent, 0.1) : "none"}
              stroke={done ? rgb(accent, current ? 0.55 : 0.3) : g(0.2)}
              strokeWidth={current ? 0.9 : 0.6} />
            <line
              x1={s.x - 14} y1={i % 2 === 0 ? 25 : 101}
              x2={s.x + 14} y2={i % 2 === 0 ? 25 : 101}
              stroke={done ? rgb(accent, current ? 0.65 : 0.35) : g(0.2)}
              strokeWidth={current ? 1.0 : 0.6} />
          </g>
        );
      })}

      {/* Arrow at end of track */}
      <polyline points="176,58 181,62 176,66" stroke={g(0.2)} strokeWidth="0.8" />

      {/* Conversion rate badge — top right */}
      <rect x="152" y="6" width="48" height="14" rx="3" fill={rgb(accent, 0.1)} stroke={rgb(accent, 0.4)} strokeWidth="0.8" />
      <line x1="158" y1="13" x2="168" y2="13" stroke={rgb(accent, 0.6)} strokeWidth="1.0" />
      <line x1="172" y1="13" x2="194" y2="13" stroke={rgb(accent, 0.35)} strokeWidth="0.7" />
    </svg>
  );
}

function SketchConversion({ accent }: { accent: [number, number, number] }) {
  const g = (a: number) => rgb([160,160,160], a);
  const baseline = 108;
  const chartH = 86;
  const barW = 24;

  // 5 bars: Default → Theme A → Theme B → Aether prev → Aether
  const bars = [
    { x: 34,  h: 12, label: "default",  a: false },
    { x: 66,  h: 22, label: "",         a: false },
    { x: 98,  h: 30, label: "",         a: false },
    { x: 130, h: 44, label: "",         a: false },
    { x: 162, h: chartH, label: "Aether", a: true },
  ];

  return (
    <svg viewBox="0 0 200 130" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Y-axis */}
      <line x1="22" y1={baseline - chartH - 6} x2="22" y2={baseline} stroke={g(0.2)} strokeWidth="0.7" />
      {/* Grid lines */}
      {[0.33, 0.66, 1].map((t) => {
        const y = baseline - chartH * t;
        return <line key={t} x1="22" y1={y} x2="192" y2={y} stroke={g(0.08)} strokeWidth="0.5" strokeDasharray="3 3" />;
      })}
      {/* Baseline */}
      <line x1="22" y1={baseline} x2="192" y2={baseline} stroke={g(0.22)} strokeWidth="0.8" />

      {bars.map((b) => (
        <g key={b.x}>
          {/* Bar body */}
          <rect x={b.x - barW / 2} y={baseline - b.h} width={barW} height={b.h} rx="1.5"
            fill={b.a ? rgb(accent, 0.2) : g(0.1)}
            stroke={b.a ? rgb(accent, 0.65) : g(0.22)}
            strokeWidth={b.a ? 1.0 : 0.6} />
          {/* Top cap on Aether bar */}
          {b.a && (
            <rect x={b.x - barW / 2} y={baseline - b.h} width={barW} height={7} rx="1.5"
              fill={rgb(accent, 0.85)} />
          )}
        </g>
      ))}

      {/* 6x badge — top right of Aether bar */}
      <line x1={162 + barW / 2 + 3} y1={baseline - chartH + 5}
        x2={162 + barW / 2 + 14} y2={baseline - chartH + 5}
        stroke={rgb(accent, 0.4)} strokeWidth="0.6" strokeDasharray="2 2" />
      <rect x={162 + barW / 2 + 14} y={baseline - chartH}
        width={20} height={12} rx="2.5"
        fill={rgb(accent, 0.14)} stroke={rgb(accent, 0.5)} strokeWidth="0.7" />
      {/* "6×" as strokes */}
      <line x1={162 + barW / 2 + 17} y1={baseline - chartH + 4} x2={162 + barW / 2 + 21} y2={baseline - chartH + 4} stroke={rgb(accent, 0.85)} strokeWidth="1.1" />
      <line x1={162 + barW / 2 + 17} y1={baseline - chartH + 7} x2={162 + barW / 2 + 21} y2={baseline - chartH + 7} stroke={rgb(accent, 0.55)} strokeWidth="0.8" />
      <line x1={162 + barW / 2 + 24} y1={baseline - chartH + 2} x2={162 + barW / 2 + 30} y2={baseline - chartH + 9} stroke={rgb(accent, 0.8)} strokeWidth="1.0" />
      <line x1={162 + barW / 2 + 24} y1={baseline - chartH + 9} x2={162 + barW / 2 + 30} y2={baseline - chartH + 2} stroke={rgb(accent, 0.8)} strokeWidth="1.0" />

      {/* Trend arrow connecting bar tops */}
      <polyline
        points={`34,${baseline - 12} 66,${baseline - 22} 98,${baseline - 30} 130,${baseline - 44} 162,${baseline - chartH}`}
        stroke={rgb(accent, 0.25)} strokeWidth="0.8" strokeDasharray="2 3" fill="none" />

      {/* X-axis label stubs */}
      <line x1="34" y1={baseline + 2} x2="34" y2={baseline + 5} stroke={g(0.2)} strokeWidth="0.6" />
      <line x1="162" y1={baseline + 2} x2="162" y2={baseline + 5} stroke={rgb(accent, 0.5)} strokeWidth="0.6" />
      <line x1={34 - 10} y1={baseline + 9} x2={34 + 10} y2={baseline + 9} stroke={g(0.25)} strokeWidth="0.7" />
      <line x1={34 - 6}  y1={baseline + 12} x2={34 + 6}  y2={baseline + 12} stroke={g(0.15)} strokeWidth="0.5" />
      <line x1={162 - 12} y1={baseline + 9} x2={162 + 12} y2={baseline + 9} stroke={rgb(accent, 0.55)} strokeWidth="0.9" />
      <line x1={162 - 8}  y1={baseline + 12} x2={162 + 8}  y2={baseline + 12} stroke={rgb(accent, 0.3)} strokeWidth="0.6" />
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
          className="inline-flex items-center gap-1.5 text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
          back
        </Link>
      </div>

      <GridRule />

      {/* Hero */}
      <section className="px-6 sm:px-8 pt-10 pb-4 flex flex-col items-center text-center rise">
        <h1 className="text-[clamp(3.5rem,10vw,6.5rem)] font-medium tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-3">
          Aether
        </h1>
        <p className="text-[1rem] leading-[1.7] tracking-tight text-[rgb(var(--muted))] mb-6 max-w-sm sm:max-w-md">
          A Shopify theme for brands that treat the storefront as the product.
        </p>
        <div className="flex flex-row items-center justify-center gap-2 text-[13px] tracking-tight">
          <Link
            href="/aether/buy"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-5 py-2 text-[13px] font-medium tracking-tight hover:opacity-85 transition-opacity"
          >
            Buy a license
          </Link>
          <DemoButton href={DEMO_URL} password="aether" />
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--line))] px-4 py-2 text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg))/0.3] transition-colors"
          >
            Docs
          </Link>
        </div>
      </section>

      {/* Animated wave */}
      <div className="rise">
        <AetherWave />
      </div>

      <GridRule />

      {/* Section label */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-5 sm:py-6 px-6 sm:px-8 rise">
        <span className="text-[19px] sm:text-[21px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">Why brands</span>
        <div className="flex items-center gap-2 border border-[rgb(var(--blue)/0.4)] rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shrink-0">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[rgb(var(--blue))]" aria-hidden="true">
            <path d="M9 2L5 9h4l-2 5 6-7H9l2-5z" />
          </svg>
          <span className="text-[17px] sm:text-[19px] font-medium tracking-tight text-[rgb(var(--blue))] whitespace-nowrap">choose it</span>
        </div>
        <span className="text-[19px] sm:text-[21px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">over anything else</span>
      </div>

      <GridRule />

      {/* Features */}
      <div className="flex flex-col sm:flex-row">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="flex-1 flex flex-col gap-5 px-6 sm:px-8 pt-8 pb-8 rise"
            style={{
              borderLeft: i > 0 ? "1px solid rgb(var(--line))" : undefined,
              borderTop: i > 0 ? "1px solid rgb(var(--line))" : undefined,
              ["--rise-delay" as any]: `${i * 80}ms`,
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
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-5 sm:py-6 px-6 sm:px-8 rise">
        <div className="flex items-center gap-2 border border-[rgb(var(--blue)/0.35)] rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shrink-0">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[rgb(var(--blue))]" aria-hidden="true">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5.5c0-1 1.5-1 1.5 0S8 7 8 8M8 10.5v.5" />
          </svg>
          <span className="text-[17px] sm:text-[19px] font-medium tracking-tight text-[rgb(var(--blue))] whitespace-nowrap">Does it fit?</span>
        </div>
        <span className="text-[19px] sm:text-[21px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">Four questions.</span>
      </div>

      <GridRule />

      {/* Fit quiz — inline, edge-to-edge */}
      <FitQuiz />

      <GridRule />

      {/* Section label — pricing */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-5 sm:py-6 px-6 sm:px-8 rise">
        <div className="flex items-center gap-2 border border-[rgb(var(--blue)/0.35)] rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shrink-0">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[rgb(var(--blue))]" aria-hidden="true">
            <rect x="2" y="4" width="12" height="9" rx="1.5" />
            <path d="M2 7h12" />
            <path d="M5 10h2" />
          </svg>
          <span className="text-[17px] sm:text-[19px] font-medium tracking-tight text-[rgb(var(--blue))] whitespace-nowrap">One payment.</span>
        </div>
        <span className="text-[19px] sm:text-[21px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">Yours forever.</span>
      </div>

      <GridRule />

      {/* Pricing */}
      <div id="pricing" className="flex flex-col sm:flex-row scroll-mt-20">
        {TIERS.map((t, i) => (
          <Link
            key={t.name}
            href={t.name === "Enterprise" ? "/aether/enterprise" : `/aether/buy?tier=${t.name.toLowerCase()}`}
            className="group flex-1 flex flex-col justify-between gap-8 px-6 sm:px-8 pt-8 pb-8 transition-colors hover:bg-[rgb(var(--line))/0.06] rise"
            style={{
              borderLeft: i > 0 ? "1px solid rgb(var(--line))" : undefined,
              borderTop: i > 0 ? "1px solid rgb(var(--line))" : undefined,
              background: t.featured ? "rgba(56,180,255,0.035)" : undefined,
              ["--rise-delay" as any]: `${i * 80}ms`,
            }}
          >
            <div className="flex flex-col gap-5">
              {/* Name + badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">{t.name}</span>
                {t.badge && (
                  <span className="inline-flex items-center rounded-full border border-[rgb(var(--blue)/0.5)] text-[rgb(var(--blue))] px-2 pt-[3px] pb-[4px] text-[10px] font-medium tracking-tight leading-none">
                    {t.badge}
                  </span>
                )}
              </div>

              {/* Price */}
              <div>
                <p className="text-[2.6rem] font-medium tracking-[-0.05em] leading-none tabular-nums"
                  style={{ color: t.featured ? "rgb(var(--blue))" : "rgb(var(--fg))" }}>
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
                      style={{ color: t.featured ? "rgb(var(--blue))" : "rgb(var(--muted))" }}
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
                {t.name === "Enterprise" ? "See enterprise plans" : "Get Aether"}
              </span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="w-3.5 h-3.5 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200"
                style={{ color: t.featured ? "rgb(var(--blue))" : "rgb(var(--fg))" }}
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
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-[rgb(var(--fg))] transition-colors">Inertia</Link>
          <div className="flex items-center gap-1.5">
            <ShopifyLogo />
            <span className="text-[11px] tracking-tight">Shopify theme</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] tracking-tight">
            <svg viewBox="0 0 8 8" className="w-2 h-2 shrink-0" aria-hidden="true">
              <circle cx="4" cy="4" r="3" fill="rgb(var(--green))" />
            </svg>
            All systems operational
          </div>
          <Link href="/contact" className="hover:text-[rgb(var(--fg))] transition-colors">Questions? Get in touch →</Link>
        </div>
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
