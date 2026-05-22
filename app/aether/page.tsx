import type { Metadata } from "next";
import Link from "next/link";
import { DemoButton } from "./demo-button";
import { FitQuiz } from "./fit-quiz";
import { AetherContour } from "./aether-contour";
import { MobilePricing } from "./mobile-pricing";

export const metadata: Metadata = {
  title: "Aether",
  description:
    "A high-end Shopify theme built for conversion, flow, and presence.",
};

const FEATURES = [
  {
    title: "Built to convert",
    body: "Urgency indicators, low stock counters, free shipping thresholds. Every section is designed to move the customer toward a decision, not away from it.",
  },
  {
    title: "Guided, start to finish",
    body: "The layout never lets go. From the first scroll to checkout, every section pulls the customer forward. No dead ends, no dropped conversions.",
  },
  {
    title: "35 sections. Yours in minutes.",
    body: "Everything ships in the box. Fully customizable, easy to set up. Full guides and support included through the client portal the moment you're in.",
  },
];

const TIERS = [
  { name: "Standard", price: "$85",      term: "1 year / single store",      badge: ""           },
  { name: "Lifetime", price: "$105",     term: "One time / single store",     badge: "Best value" },
  { name: "Enterprise", price: "From $59", term: "Per store or unlimited",    badge: ""           },
];

const PRICING_ROWS: { label: string; standard: boolean | string; lifetime: boolean | string; enterprise: boolean | string }[] = [
  { label: "Full Aether theme",          standard: true,             lifetime: true,              enterprise: true             },
  { label: "All 35 sections",            standard: true,             lifetime: true,              enterprise: true             },
  { label: "Updates",                    standard: "1 year",         lifetime: "Forever",         enterprise: "Forever"        },
  { label: "Store license",              standard: "Single",         lifetime: "Single",          enterprise: "Multi-store"    },
  { label: "Support via client portal",  standard: true,             lifetime: true,              enterprise: true             },
  { label: "Priority support",           standard: false,            lifetime: true,              enterprise: true             },
  { label: "Commercial deployment",      standard: false,            lifetime: false,             enterprise: true             },
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
          className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors rounded-full px-3.5 py-1.5"
          style={{ border: "1px solid rgb(var(--fg) / 0.25)" }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
          Home
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
          <h1 className="text-[clamp(3.5rem,10vw,6.5rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">
            Aether
          </h1>
          <p className="text-[1rem] leading-[1.7] tracking-tight text-[rgb(var(--muted))] max-w-sm sm:max-w-md">
            A Shopify theme built around the customer experience. From landing to checkout, it guides them through.
          </p>
          <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-center gap-2 w-full px-2 sm:px-0 text-[13px] tracking-tight">
            <Link
              href="/aether/buy"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-5 py-2.5 text-[13px] font-medium tracking-tight hover:opacity-85 transition-opacity"
            >
              Buy a license
            </Link>
            <div className="w-full sm:w-auto flex gap-2">
              <div className="flex-[2] sm:flex-none">
                <DemoButton href={DEMO_URL} password="aether" />
              </div>
              <Link
                href="/docs"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-full border border-[rgb(var(--line))] px-5 py-2 text-[13px] font-medium tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg))/0.3] transition-colors"
              >
                Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <GridRule />

      {/* Section label */}
      <p className="text-[clamp(2rem,5vw,3rem)] font-normal tracking-tight text-center text-[rgb(var(--muted))] py-6 sm:py-8 px-6 sm:px-8 rise leading-snug">
        Why brands <span className="inline-block" style={{ background: "rgb(60,100,255)", color: "#fff", padding: "0.05em 0.25em 0.1em", borderRadius: "6px" }}>choose it</span> over anything else
      </p>

      <GridRule />

      {/* Features */}
      <div className="flex flex-col sm:flex-row">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="flex-1 flex flex-col gap-4 px-6 sm:px-8 pt-6 pb-6 sm:pt-8 sm:pb-8 rise"
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
              <h3 className="text-[17px] sm:text-[19px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">
                {f.title}
              </h3>
              <p className="text-[13px] sm:text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
                {f.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <GridRule />

      {/* Storefront showcase */}
      <div className="flex flex-col rise">
        {/* Label row */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-[rgb(var(--line))]">
          <span className="text-[12px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>Built on Aether</span>
          <a href="https://allurenewyork.com" target="_blank" rel="noreferrer" className="text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.5 }}>
            allurenewyork.com ↗
          </a>
        </div>

        {/* Mobile: phone mockup */}
        <div className="flex sm:hidden justify-center py-10 px-10">
          <div className="overflow-hidden" style={{ width: "100%", maxWidth: 220, borderRadius: 36, border: "6px solid rgb(var(--line))" }}>
            <img
              src="/allurephone.png"
              alt="Allure New York on mobile, built on Aether"
              className="w-full block"
              draggable={false}
            />
          </div>
        </div>

        {/* Desktop: browser chrome */}
        <div className="hidden sm:block mx-auto my-8 overflow-hidden border border-[rgb(var(--line))]" style={{ maxWidth: 720 }}>
          {/* Chrome bar */}
          <div className="flex items-center gap-2 px-3 border-b border-[rgb(var(--line))]" style={{ height: "30px", background: "rgb(var(--bg))" }}>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: "rgb(var(--line))" }} />
              <span className="w-2 h-2 rounded-full" style={{ background: "rgb(var(--line))" }} />
              <span className="w-2 h-2 rounded-full" style={{ background: "rgb(var(--line))" }} />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] tracking-tight text-[rgb(var(--muted))]" style={{ background: "rgb(var(--line) / 0.4)", opacity: 0.7 }}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-2 h-2 shrink-0" aria-hidden="true">
                  <rect x="2" y="4" width="12" height="9" rx="1.5" /><path d="M5 4V3a3 3 0 0 1 6 0v1" />
                </svg>
                allurenewyork.com
              </div>
            </div>
          </div>
          <img
            src="/allurescreen.png"
            alt="Allure New York storefront built on Aether"
            className="w-full block"
            style={{ aspectRatio: "1365 / 681", objectFit: "cover", objectPosition: "top" }}
            draggable={false}
          />
        </div>
      </div>

      <GridRule />

      {/* Section label -- fit quiz */}
      <p className="text-[clamp(2rem,5vw,3rem)] font-normal tracking-tight text-center text-[rgb(var(--muted))] py-6 sm:py-8 px-6 sm:px-8 rise leading-snug">
        Is Aether <span className="inline-block" style={{ background: "rgb(60,100,255)", color: "#fff", padding: "0.05em 0.25em 0.1em", borderRadius: "6px" }}>the right fit?</span> Four questions.
      </p>

      <GridRule />

      {/* Fit quiz -- inline, edge-to-edge */}
      <FitQuiz />

      <GridRule />

      {/* Section label -- pricing */}
      <p id="pricing" className="text-[clamp(2rem,5vw,3rem)] font-normal tracking-tight text-center text-[rgb(var(--muted))] py-6 sm:py-8 px-6 sm:px-8 rise leading-snug scroll-mt-16">
        $85 for a year. <span className="inline-block" style={{ background: "rgb(60,100,255)", color: "#fff", padding: "0.05em 0.25em 0.1em", borderRadius: "6px" }}>$105 to own it.</span>
      </p>

      <GridRule />

      {/* Pricing - mobile stacked cards */}
      <MobilePricing tiers={TIERS} rows={PRICING_ROWS} />

      {/* Pricing - desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[540px] border-collapse">
          <thead>
            <tr>
              {/* Feature label column */}
              <th className="w-[38%] px-6 sm:px-8 py-5 text-left border-b border-[rgb(var(--line))]">
                <span className="text-[11px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.4 }}>What's included</span>
              </th>
              {TIERS.map((t, i) => (
                <th key={t.name} className="px-5 py-5 text-left border-b border-[rgb(var(--line))]" style={{ borderLeft: "1px solid rgb(var(--line))" }}>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] tracking-tight font-medium text-[rgb(var(--fg))]">{t.name}</span>
                      {t.badge && (
                        <span className="text-[10px] tracking-tight font-medium px-1.5 py-0.5 text-[rgb(var(--bg))]" style={{ background: "rgb(var(--fg))", borderRadius: 3 }}>{t.badge}</span>
                      )}
                    </div>
                    <span className="text-[clamp(1.4rem,3vw,2rem)] font-[400] tracking-[-0.04em] leading-none tabular-nums text-[rgb(var(--fg))]">{t.price}</span>
                    <span className="text-[11px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.45 }}>{t.term}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRICING_ROWS.map((f, fi) => (
              <tr key={f.label} className="group">
                <td className="px-6 sm:px-8 py-3.5 text-[12.5px] tracking-tight text-[rgb(var(--muted))] border-b border-[rgb(var(--line))]" style={{ opacity: 0.65 }}>
                  {f.label}
                </td>
                {([f.standard, f.lifetime, f.enterprise] as (boolean | string)[]).map((val, ci) => (
                  <td key={ci} className="px-5 py-3.5 border-b border-[rgb(var(--line))]" style={{ borderLeft: "1px solid rgb(var(--line))", background: ci === 1 ? "rgb(var(--fg) / 0.02)" : undefined }}>
                    {val === true ? (
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[rgb(var(--fg))]" style={{ opacity: 0.55 }} aria-hidden="true">
                        <polyline points="2 8 6 12 14 4" />
                      </svg>
                    ) : val === false ? (
                      <span className="block w-3 h-px" style={{ background: "rgb(var(--line))" }} />
                    ) : (
                      <span className="text-[12px] tracking-tight text-[rgb(var(--fg))]" style={{ opacity: 0.7 }}>{val}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {/* CTA row */}
            <tr>
              <td className="px-6 sm:px-8 py-5" />
              {TIERS.map((t, i) => (
                <td key={t.name} className="px-5 py-5" style={{ borderLeft: "1px solid rgb(var(--line))", background: i === 1 ? "rgb(var(--fg) / 0.02)" : undefined }}>
                  <Link
                    href={t.name === "Enterprise" ? "/aether/enterprise" : `/aether/buy?tier=${t.name.toLowerCase()}`}
                    className="inline-flex items-center gap-1.5 text-[13px] tracking-tight font-medium transition-opacity hover:opacity-60"
                    style={{ color: "rgb(var(--fg))" }}
                  >
                    {t.name === "Enterprise" ? "Learn more" : "Get Aether"}
                    <span aria-hidden="true">&#8594;</span>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <GridRule />

      {/* Footer */}
      <footer className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13px] tracking-tight" style={{ color: "rgb(var(--muted))", opacity: 0.6 }}>
        <div className="flex items-center gap-5">
          <Link href="/" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.7 }}>Inertia</Link>
          <span style={{ opacity: 0.25 }}>.</span>
          <div className="flex items-center gap-1.5">
            <ShopifyLogo />
            <span className="text-[11px] tracking-tight">Shopify theme</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/aether/changelog" className="text-[12px] hover:opacity-100 transition-opacity">Changelog</Link>
          <Link href="/docs" className="text-[12px] hover:opacity-100 transition-opacity">Docs</Link>
          <Link href="/contact" className="text-[12px] hover:opacity-100 transition-opacity">Contact</Link>
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

