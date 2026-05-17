import type { Metadata } from "next";
import Link from "next/link";
import { DemoButton } from "./demo-button";
import { FitQuiz } from "./fit-quiz";
import { AetherContour } from "./aether-contour";

export const metadata: Metadata = {
  title: "Aether Theme -- Inertia",
  description:
    "A high-end Shopify theme built for conversion, flow, and presence.",
};

const FEATURES = [
  {
    title: "Built like a $150+ theme",
    body: "Aether ships with an experience usually reserved for themes at the very top of the market. Every interaction is considered, every transition earned.",
  },
  {
    title: "Guided, end to end",
    body: "There isn't a single moment the customer doesn't see your product. The layout pulls them through, quietly, from landing to checkout.",
  },
  {
    title: "Up to 6x conversion",
    body: "Layout is the lever. Aether's structure is tuned to lift conversion by up to 6x compared to the defaults most stores launch with.",
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
    term: "1 year . single store",
    description: "The full theme, licensed for a year. Good for testing the waters.",
    includes: ["Full Aether theme", "1 year of updates", "Single store license", "Email support"],
  },
  {
    name: "Lifetime",
    price: "$105",
    term: "Forever . single store",
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


function g(a: number) {
  return `rgba(120,120,120,${a})`;
}

function SketchStorefront() {
  return (
    <svg viewBox="0 0 200 148" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Card outline */}
      <rect x="44" y="12" width="112" height="124" rx="3" stroke={g(0.18)} strokeWidth="0.8" />
      {/* Image area */}
      <rect x="44" y="12" width="112" height="72" rx="3" fill={g(0.05)} stroke={g(0.2)} strokeWidth="0.8" />
      {/* Image crosshair */}
      <line x1="100" y1="34" x2="100" y2="62" stroke={g(0.18)} strokeWidth="0.8" />
      <line x1="86" y1="48" x2="114" y2="48" stroke={g(0.18)} strokeWidth="0.8" />
      <circle cx="100" cy="48" r="9" stroke={g(0.25)} strokeWidth="0.8" />
      {/* Title stub */}
      <line x1="60" y1="92" x2="140" y2="92" stroke={g(0.5)} strokeWidth="1.4" />
      {/* Price stub */}
      <line x1="60" y1="103" x2="106" y2="103" stroke={g(0.28)} strokeWidth="0.9" />
      {/* CTA button */}
      <rect x="60" y="116" width="80" height="14" rx="2" fill={g(0.18)} stroke={g(0.35)} strokeWidth="0.8" />
      <line x1="80" y1="123" x2="120" y2="123" stroke={g(0.7)} strokeWidth="1.3" />
    </svg>
  );
}

function SketchTimeline() {
  const steps = [24, 76, 128, 176];
  const cy = 74;

  return (
    <svg viewBox="0 0 200 148" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Connecting line */}
      <line x1={steps[0]} y1={cy} x2={steps[3]} y2={cy} stroke={g(0.15)} strokeWidth="0.8" />
      {/* Progress fill */}
      <line x1={steps[0]} y1={cy} x2={steps[2]} y2={cy} stroke={g(0.4)} strokeWidth="0.8" />

      {steps.map((x, i) => {
        const isActive = i < 3;
        const isCurrent = i === 0;
        return (
          <g key={i}>
            <circle cx={x} cy={cy} r={isCurrent ? 8 : 5}
              fill={isCurrent ? g(0.12) : "none"}
              stroke={isActive ? g(isCurrent ? 0.6 : 0.3) : g(0.15)}
              strokeWidth={isCurrent ? 1.2 : 0.8} />
            {isCurrent && <circle cx={x} cy={cy} r="3.5" fill={g(0.65)} />}
            <line x1={x - (isCurrent ? 10 : 7)} y1={cy + 18} x2={x + (isCurrent ? 10 : 7)} y2={cy + 18}
              stroke={isActive ? g(isCurrent ? 0.4 : 0.2) : g(0.12)}
              strokeWidth={isCurrent ? 1.0 : 0.65} />
            {isCurrent && (
              <line x1={x - 6} y1={cy + 24} x2={x + 6} y2={cy + 24}
                stroke={g(0.22)} strokeWidth="0.65" />
            )}
          </g>
        );
      })}

      <polyline points={`${steps[3] + 7},${cy - 4} ${steps[3] + 12},${cy} ${steps[3] + 7},${cy + 4}`}
        stroke={g(0.18)} strokeWidth="0.8" fill="none" />
    </svg>
  );
}

function SketchConversion() {
  const pts: [number, number][] = [
    [22, 110], [52, 98], [84, 84], [116, 65], [148, 42], [176, 22],
  ];
  const pathD = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const [px, py] = pts[pts.length - 1];

  return (
    <svg viewBox="0 0 200 148" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Axes */}
      <line x1="22" y1="22" x2="22" y2="118" stroke={g(0.18)} strokeWidth="0.8" />
      <line x1="22" y1="118" x2="184" y2="118" stroke={g(0.18)} strokeWidth="0.8" />

      {/* Subtle grid */}
      {[0.33, 0.66, 1].map((t) => (
        <line key={t} x1="22" y1={118 - 96 * t} x2="184" y2={118 - 96 * t}
          stroke={g(0.07)} strokeWidth="0.5" strokeDasharray="3 3" />
      ))}

      {/* Rising line */}
      <path d={pathD} stroke={g(0.45)} strokeWidth="1.4" fill="none" />

      {/* Peak callout */}
      <circle cx={px} cy={py} r="5" fill={g(0.1)} stroke={g(0.55)} strokeWidth="1.0" />
      <circle cx={px} cy={py} r="2.5" fill={g(0.7)} />

      {/* Dashed drop line */}
      <line x1={px} y1={py + 6} x2={px} y2="118"
        stroke={g(0.18)} strokeWidth="0.7" strokeDasharray="3 3" />

      {/* Label stub near peak */}
      <line x1={px + 10} y1={py - 6} x2={px + 22} y2={py - 6}
        stroke={g(0.5)} strokeWidth="1.1" />
      <line x1={px + 10} y1={py - 1} x2={px + 18} y2={py - 1}
        stroke={g(0.3)} strokeWidth="0.8" />
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

      {/* Hero with full-background contour field */}
      <section className="relative overflow-hidden rise" style={{ height: 420, touchAction: "pan-y" }}>
        {/* Contour canvas fills the entire hero */}
        <AetherContour />
        {/* Top + bottom fades handled inside AetherContour, but add side breathing room via z-layered content */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10"
          style={{ height: 60, background: "linear-gradient(to bottom, rgb(var(--bg)), transparent)" }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{ height: 60, background: "linear-gradient(to top, rgb(var(--bg)), transparent)" }} />
        {/* Centered content */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 px-6 text-center">
          <h1 className="text-[clamp(3.5rem,10vw,6.5rem)] font-medium tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">
            Aether
          </h1>
          <p className="text-[1rem] leading-[1.7] tracking-tight text-[rgb(var(--muted))] max-w-sm sm:max-w-md">
            A Shopify theme for brands that treat the storefront as the product.
          </p>
          <div className="pointer-events-auto flex flex-row items-center justify-center gap-2 text-[13px] tracking-tight">
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
        </div>
      </section>

      <GridRule />

      {/* Section label */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-5 sm:py-6 px-6 sm:px-8 rise">
        <span className="text-[16px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">Why brands</span>
        <span className="inline-flex items-center gap-1.5 border border-[rgb(var(--fg)/0.12)] bg-[rgb(var(--fg)/0.04)] rounded-full px-3 py-1 shrink-0">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[rgb(var(--fg))] opacity-50" aria-hidden="true">
            <path d="M9 2L5 9h4l-2 5 6-7H9l2-5z" />
          </svg>
          <span className="text-[14px] sm:text-[17px] font-medium tracking-tight text-[rgb(var(--fg))] whitespace-nowrap">choose it</span>
        </span>
        <span className="text-[16px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">over anything else</span>
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
              {i === 0 && <SketchStorefront />}
              {i === 1 && <SketchTimeline />}
              {i === 2 && <SketchConversion />}
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

      {/* Section label -- fit quiz */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-5 sm:py-6 px-6 sm:px-8 rise">
        <span className="inline-flex items-center gap-1.5 border border-[rgb(var(--fg)/0.12)] bg-[rgb(var(--fg)/0.04)] rounded-full px-3 py-1 shrink-0">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[rgb(var(--fg))] opacity-50" aria-hidden="true">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5.5c0-1 1.5-1 1.5 0S8 7 8 8M8 10.5v.5" />
          </svg>
          <span className="text-[14px] sm:text-[17px] font-medium tracking-tight text-[rgb(var(--fg))] whitespace-nowrap">Does it fit?</span>
        </span>
        <span className="text-[16px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">Four questions.</span>
      </div>

      <GridRule />

      {/* Fit quiz -- inline, edge-to-edge */}
      <FitQuiz />

      <GridRule />

      {/* Section label -- pricing */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-5 sm:py-6 px-6 sm:px-8 rise">
        <span className="inline-flex items-center gap-1.5 border border-[rgb(var(--fg)/0.12)] bg-[rgb(var(--fg)/0.04)] rounded-full px-3 py-1 shrink-0">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[rgb(var(--fg))] opacity-50" aria-hidden="true">
            <rect x="2" y="4" width="12" height="9" rx="1.5" />
            <path d="M2 7h12" />
            <path d="M5 10h2" />
          </svg>
          <span className="text-[14px] sm:text-[17px] font-medium tracking-tight text-[rgb(var(--fg))] whitespace-nowrap">One payment.</span>
        </span>
        <span className="text-[16px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))] whitespace-nowrap">Yours forever.</span>
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
                  <span className="inline-flex items-center rounded-full border border-[rgb(var(--fg)/0.15)] bg-[rgb(var(--fg)/0.05)] text-[rgb(var(--fg))] px-2 pt-[3px] pb-[4px] text-[10px] font-medium tracking-tight leading-none opacity-70">
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
          <Link href="/contact" className="hover:text-[rgb(var(--fg))] transition-colors">Questions? Get in touch &rarr;</Link>
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

