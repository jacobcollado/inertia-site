import type { Metadata } from "next";
import Link from "next/link";
import { DemoButton } from "./demo-button";
import { FitQuiz } from "./fit-quiz";
import { AetherWave } from "./aether-wave";

export const metadata: Metadata = {
  title: "Aether Theme â€” Inertia",
  description:
    "A high-end Shopify theme built for conversion, flow, and presence.",
};

const FEATURES = [
  {
    title: "Built like a $150+ theme",
    body: "Aether ships with an experience usually reserved for themes at the very top of the market. Every interaction is considered, every transition earned.",
    accent: [14, 120, 220] as [number, number, number],
  },
  {
    title: "Guided, end to end",
    body: "There isn't a single moment the customer doesn't see your product. The layout pulls them through, quietly, from landing to checkout.",
    accent: [0, 148, 130] as [number, number, number],
  },
  {
    title: "Up to 6x conversion",
    body: "Layout is the lever. Aether's structure is tuned to lift conversion by up to 6x compared to the defaults most stores launch with.",
    accent: [88, 72, 220] as [number, number, number],
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
    term: "1 year Â· single store",
    description: "The full theme, licensed for a year. Good for testing the waters.",
    includes: ["Full Aether theme", "1 year of updates", "Single store license", "Email support"],
  },
  {
    name: "Lifetime",
    price: "$105",
    term: "Forever Â· single store",
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
  const g = (a: number) => rgb([120,120,120], a);
  return (
    <svg viewBox="0 0 200 148" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Full-bleed product image â€” left 52% */}
      <rect x="0" y="0" width="104" height="148" fill={rgb(accent, 0.09)} />
      {/* Image center cross-hairs */}
      <line x1="52" y1="46" x2="52" y2="96" stroke={rgb(accent, 0.25)} strokeWidth="0.9" />
      <line x1="26" y1="71" x2="78" y2="71" stroke={rgb(accent, 0.25)} strokeWidth="0.9" />
      <circle cx="52" cy="71" r="11" stroke={rgb(accent, 0.35)} strokeWidth="0.9" />
      {/* Thumbnail strip â€” bottom of image */}
      <line x1="0" y1="120" x2="104" y2="120" stroke={g(0.18)} strokeWidth="0.5" />
      {[0,1,2,3].map(i => (
        <rect key={i} x={6 + i * 24} y="125" width="18" height="16" rx="1.5"
          fill={i === 0 ? rgb(accent, 0.22) : g(0.08)}
          stroke={i === 0 ? rgb(accent, 0.6) : g(0.22)}
          strokeWidth={i === 0 ? 0.9 : 0.6} />
      ))}
      {/* Right col divider */}
      <line x1="104" y1="0" x2="104" y2="148" stroke={g(0.18)} strokeWidth="0.6" />
      {/* Nav strip top */}
      <rect x="104" y="0" width="96" height="11" fill={g(0.06)} />
      <line x1="104" y1="11" x2="200" y2="11" stroke={g(0.15)} strokeWidth="0.5" />
      {/* Product name */}
      <rect x="114" y="20" width="72" height="8" rx="2" fill={rgb(accent, 0.75)} />
      <rect x="114" y="32" width="52" height="5.5" rx="1.5" fill={rgb(accent, 0.4)} />
      {/* Price */}
      <rect x="114" y="46" width="40" height="9" rx="2" fill={g(0.18)} />
      {/* Swatches */}
      {[0,1,2,3].map(i => (
        <circle key={i} cx={118 + i * 14} cy="72" r="5"
          fill={i < 2 ? rgb(accent, i === 0 ? 0.75 : 0.35) : "none"}
          stroke={i >= 2 ? g(0.3) : "none"}
          strokeWidth="0.9" />
      ))}
      {/* Size row */}
      {[0,1,2].map(i => (
        <rect key={i} x={114 + i * 22} y="85" width="18" height="10" rx="2"
          fill={i === 1 ? rgb(accent, 0.18) : "none"}
          stroke={i === 1 ? rgb(accent, 0.65) : g(0.25)}
          strokeWidth={i === 1 ? 1.0 : 0.6} />
      ))}
      {/* Add to cart â€” full width, bold */}
      <rect x="114" y="104" width="78" height="18" rx="2.5" fill={rgb(accent, 1)} />
      <line x1="134" y1="113" x2="176" y2="113" stroke="white" strokeWidth="1.6" opacity="0.9" />
    </svg>
  );
}

function SketchTimeline({ accent }: { accent: [number, number, number] }) {
  const g = (a: number) => rgb([120,120,120], a);
  // Four panels side-by-side: Landing â†’ Product â†’ Cart â†’ Checkout
  const panels = [
    { x: 0,   w: 56  },
    { x: 56,  w: 50  },
    { x: 106, w: 44  },
    { x: 150, w: 50  },
  ];
  const panelH = 112;
  const panelY = 12;

  return (
    <svg viewBox="0 0 200 148" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Panels */}
      {panels.map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={panelY} width={p.w - 1} height={panelH} rx="2"
            fill={i < 3 ? rgb(accent, i === 0 ? 0.1 : 0.05) : g(0.05)}
            stroke={i < 3 ? rgb(accent, i === 0 ? 0.45 : 0.22) : g(0.18)}
            strokeWidth={i === 0 ? 1.0 : 0.65} />
          {/* Chevron connector */}
          {i < 3 && (
            <polyline
              points={`${p.x + p.w - 1},${panelY + panelH * 0.4} ${p.x + p.w + 4},${panelY + panelH * 0.5} ${p.x + p.w - 1},${panelY + panelH * 0.6}`}
              stroke={i < 2 ? rgb(accent, 0.38) : g(0.22)}
              strokeWidth="0.75" fill="none" />
          )}
        </g>
      ))}

      {/* Panel 0: Landing â€” hero image block + headline + CTA */}
      <rect x="5" y={panelY + 7} width="46" height="30" rx="1.5" fill={rgb(accent, 0.18)} />
      <line x1="5" y1={panelY + 44} x2="44" y2={panelY + 44} stroke={rgb(accent, 0.6)} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="5" y1={panelY + 52} x2="36" y2={panelY + 52} stroke={rgb(accent, 0.32)} strokeWidth="1.0" strokeLinecap="round" />
      <rect x="5" y={panelY + 64} width="28" height="10" rx="2" fill={rgb(accent, 0.85)} />
      <line x1="11" y1={panelY + 69} x2="27" y2={panelY + 69} stroke="white" strokeWidth="1.3" opacity="0.9" />

      {/* Panel 1: Product â€” image left, details right */}
      <rect x="59" y={panelY + 7} width="22" height="42" rx="1.5" fill={rgb(accent, 0.15)} />
      <line x1="85" y1={panelY + 12} x2="103" y2={panelY + 12} stroke={rgb(accent, 0.5)} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="85" y1={panelY + 20} x2="101" y2={panelY + 20} stroke={rgb(accent, 0.28)} strokeWidth="0.9" strokeLinecap="round" />
      {[0,1,2].map(j => (
        <circle key={j} cx={85 + j * 7} cy={panelY + 33} r="2.8"
          fill={j === 0 ? rgb(accent, 0.75) : g(0.18)}
          stroke={j === 0 ? "none" : g(0.28)} strokeWidth="0.6" />
      ))}
      <rect x="85" y={panelY + 42} width="18" height="8" rx="2" fill={rgb(accent, 0.8)} />

      {/* Panel 2: Cart â€” item rows + total + checkout btn */}
      <rect x="110" y={panelY + 9} width="36" height="11" rx="1.5" fill={rgb(accent, 0.12)} stroke={rgb(accent, 0.35)} strokeWidth="0.7" />
      <rect x="110" y={panelY + 24} width="36" height="11" rx="1.5" fill={g(0.07)} stroke={g(0.2)} strokeWidth="0.55" />
      <line x1="110" y1={panelY + 44} x2="146" y2={panelY + 44} stroke={g(0.2)} strokeWidth="0.5" />
      <line x1="110" y1={panelY + 52} x2="138" y2={panelY + 52} stroke={rgb(accent, 0.45)} strokeWidth="1.1" strokeLinecap="round" />
      <rect x="110" y={panelY + 62} width="36" height="10" rx="2" fill={rgb(accent, 0.75)} />
      <line x1="118" y1={panelY + 67} x2="137" y2={panelY + 67} stroke="white" strokeWidth="1.2" opacity="0.88" />

      {/* Panel 3: Checkout â€” form fields + pay button */}
      <rect x="153" y={panelY + 8} width="43" height="8" rx="1.5" fill="none" stroke={g(0.25)} strokeWidth="0.55" />
      <rect x="153" y={panelY + 20} width="43" height="8" rx="1.5" fill="none" stroke={g(0.25)} strokeWidth="0.55" />
      <rect x="153" y={panelY + 32} width="20" height="8" rx="1.5" fill="none" stroke={g(0.25)} strokeWidth="0.55" />
      <rect x="176" y={panelY + 32} width="20" height="8" rx="1.5" fill="none" stroke={g(0.25)} strokeWidth="0.55" />
      <rect x="153" y={panelY + 48} width="43" height="11" rx="2" fill={rgb(accent, 0.14)} stroke={rgb(accent, 0.4)} strokeWidth="0.85" />
      <line x1="163" y1={panelY + 53.5} x2="186" y2={panelY + 53.5} stroke={rgb(accent, 0.65)} strokeWidth="1.2" strokeLinecap="round" />
      <rect x="153" y={panelY + 64} width="43" height="11" rx="2.5" fill={rgb(accent, 0.9)} />
      <line x1="164" y1={panelY + 69.5} x2="184" y2={panelY + 69.5} stroke="white" strokeWidth="1.4" opacity="0.9" />

      {/* Step dots below */}
      <line x1="24" y1="138" x2="176" y2="138" stroke={g(0.14)} strokeWidth="0.6" />
      {[28, 81, 128, 174].map((cx, i) => (
        <circle key={i} cx={cx} cy="138" r={i === 0 ? 3.5 : 2.5}
          fill={i === 0 ? rgb(accent, 0.9) : i < 3 ? rgb(accent, 0.35) : g(0.18)}
          stroke="none" />
      ))}
    </svg>
  );
}

function SketchConversion({ accent }: { accent: [number, number, number] }) {
  const g = (a: number) => rgb([120,120,120], a);
  const baseline = 116;
  const maxH = 90;
  const barW = 22;

  const bars = [
    { x: 28,  h: 11 },
    { x: 58,  h: 20 },
    { x: 88,  h: 34 },
    { x: 118, h: 54 },
    { x: 152, h: maxH },
  ];

  return (
    <svg viewBox="0 0 200 148" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = baseline - maxH * t;
        return <line key={t} x1="14" y1={y} x2="186" y2={y} stroke={g(0.1)} strokeWidth="0.5" strokeDasharray="3 3" />;
      })}
      {/* Baseline */}
      <line x1="14" y1={baseline} x2="186" y2={baseline} stroke={g(0.3)} strokeWidth="0.8" />

      {/* Bars */}
      {bars.map((b, i) => {
        const isAether = i === 4;
        return (
          <g key={b.x}>
            {/* Main bar fill */}
            <rect x={b.x - barW / 2} y={baseline - b.h} width={barW} height={b.h} rx="2"
              fill={isAether ? rgb(accent, 0.22) : g(0.1)}
              stroke={isAether ? rgb(accent, 0.6) : g(0.25)}
              strokeWidth={isAether ? 1.1 : 0.6} />
            {/* Filled top cap */}
            <rect x={b.x - barW / 2} y={baseline - b.h} width={barW} height={Math.min(b.h, 10)} rx="2"
              fill={isAether ? rgb(accent, 0.95) : g(0.28)} />
            {/* Bottom of cap â€” square corners to blend into bar */}
            {b.h > 10 && (
              <rect x={b.x - barW / 2} y={baseline - b.h + 5} width={barW} height={5}
                fill={isAether ? rgb(accent, 0.95) : g(0.28)} />
            )}
          </g>
        );
      })}

      {/* Trend line */}
      <polyline
        points={bars.map(b => `${b.x},${baseline - b.h}`).join(" ")}
        stroke={rgb(accent, 0.3)} strokeWidth="0.9" strokeDasharray="2.5 2.5" fill="none" />

      {/* 6Ã— badge anchored to top of Aether bar */}
      <line x1="163" y1={baseline - maxH} x2="172" y2={baseline - maxH - 6}
        stroke={rgb(accent, 0.35)} strokeWidth="0.6" strokeDasharray="2 2" />
      <rect x="172" y={baseline - maxH - 16} width="24" height="14" rx="3"
        fill={rgb(accent, 0.14)} stroke={rgb(accent, 0.55)} strokeWidth="0.8" />
      {/* "6Ã—" strokes */}
      <line x1="175" y1={baseline - maxH - 10} x2="182" y2={baseline - maxH - 10} stroke={rgb(accent, 0.85)} strokeWidth="1.2" />
      <line x1="175" y1={baseline - maxH - 6}  x2="182" y2={baseline - maxH - 6}  stroke={rgb(accent, 0.5)} strokeWidth="0.8" />
      <line x1="185" y1={baseline - maxH - 12} x2="191" y2={baseline - maxH - 4}  stroke={rgb(accent, 0.85)} strokeWidth="1.1" />
      <line x1="185" y1={baseline - maxH - 4}  x2="191" y2={baseline - maxH - 12} stroke={rgb(accent, 0.85)} strokeWidth="1.1" />

      {/* X-axis label stubs */}
      {bars.map((b, i) => (
        <g key={`lbl-${b.x}`}>
          <line x1={b.x} y1={baseline + 2} x2={b.x} y2={baseline + 5} stroke={i === 4 ? rgb(accent, 0.5) : g(0.2)} strokeWidth="0.6" />
          <line x1={b.x - (i === 4 ? 12 : 8)} y1={baseline + 9} x2={b.x + (i === 4 ? 12 : 8)} y2={baseline + 9}
            stroke={i === 4 ? rgb(accent, 0.6) : g(0.22)} strokeWidth={i === 4 ? 1.0 : 0.6} />
          {i === 4 && <line x1={b.x - 8} y1={baseline + 13} x2={b.x + 8} y2={baseline + 13} stroke={rgb(accent, 0.35)} strokeWidth="0.6" />}
        </g>
      ))}
    </svg>
  );
}

export default function AetherPage() {
  return (
    <main className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-6xl min-h-screen flex flex-col pb-16 sm:pb-20">

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
        <span className="text-[17px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">Why brands</span>
        <span className="inline-flex items-center gap-2 border border-[rgb(var(--blue)/0.4)] rounded-full px-3 py-1.5 shrink-0">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[rgb(var(--blue))]" aria-hidden="true">
            <path d="M9 2L5 9h4l-2 5 6-7H9l2-5z" />
          </svg>
          <span className="text-[15px] sm:text-[17px] font-medium tracking-tight text-[rgb(var(--blue))] whitespace-nowrap">choose it</span>
        </span>
        <span className="text-[17px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">over anything else</span>
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

      {/* Section label â€” fit quiz */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-5 sm:py-6 px-6 sm:px-8 rise">
        <span className="inline-flex items-center gap-2 border border-[rgb(var(--blue)/0.4)] rounded-full px-3 py-1.5 shrink-0">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[rgb(var(--blue))]" aria-hidden="true">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5.5c0-1 1.5-1 1.5 0S8 7 8 8M8 10.5v.5" />
          </svg>
          <span className="text-[15px] sm:text-[17px] font-medium tracking-tight text-[rgb(var(--blue))] whitespace-nowrap">Does it fit?</span>
        </span>
        <span className="text-[17px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">Four questions.</span>
      </div>

      <GridRule />

      {/* Fit quiz â€” inline, edge-to-edge */}
      <FitQuiz />

      <GridRule />

      {/* Section label â€” pricing */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-5 sm:py-6 px-6 sm:px-8 rise">
        <span className="inline-flex items-center gap-2 border border-[rgb(var(--blue)/0.4)] rounded-full px-3 py-1.5 shrink-0">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[rgb(var(--blue))]" aria-hidden="true">
            <rect x="2" y="4" width="12" height="9" rx="1.5" />
            <path d="M2 7h12" />
            <path d="M5 10h2" />
          </svg>
          <span className="text-[15px] sm:text-[17px] font-medium tracking-tight text-[rgb(var(--blue))] whitespace-nowrap">One payment.</span>
        </span>
        <span className="text-[17px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">Yours forever.</span>
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
          <Link href="/contact" className="hover:text-[rgb(var(--fg))] transition-colors">Questions? Get in touch â†’</Link>
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

