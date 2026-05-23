import type { Metadata } from "next";
import Link from "next/link";
import { DemoButton } from "./demo-button";
import { FitQuiz } from "./fit-quiz";
import { AetherContour } from "./aether-contour";
import { MobilePricing } from "./mobile-pricing";

export const metadata: Metadata = {
  title: "Aether Shopify Theme",
  description:
    "Aether is a premium Shopify theme built for conversion and brand presence. 35 sections, dark mode, sticky cart, mega menu. From $85.",
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
  const blue = "rgb(60,100,255)";
  return (
    <svg viewBox="0 0 200 148" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Product image area */}
      <rect x="20" y="10" width="160" height="80" rx="2" fill={g(0.04)} stroke={g(0.14)} strokeWidth="0.7" />
      {/* Subtle image hint */}
      <rect x="20" y="10" width="160" height="80" rx="2" fill="rgb(60,100,255)" fillOpacity="0.04" />
      <line x1="20" y1="56" x2="180" y2="56" stroke={g(0.06)} strokeWidth="0.5" />
      {/* Product title */}
      <rect x="20" y="100" width="88" height="7" rx="1.5" fill={g(0.55)} />
      {/* Price */}
      <rect x="20" y="113" width="44" height="5.5" rx="1" fill={g(0.25)} />
      {/* Blue CTA pill */}
      <rect x="116" y="108" width="64" height="18" rx="9" fill={blue} fillOpacity="0.9" />
      <rect x="130" y="115" width="36" height="4" rx="1" fill="#fff" fillOpacity="0.8" />
      {/* Urgency badge */}
      <rect x="144" y="13" width="32" height="13" rx="2" fill={blue} fillOpacity="0.12" stroke={blue} strokeOpacity="0.3" strokeWidth="0.6" />
      <rect x="148" y="17" width="24" height="3" rx="1" fill={blue} fillOpacity="0.5" />
    </svg>
  );
}

function SketchTimeline() {
  const blue = "rgb(60,100,255)";
  const nodes = [
    { x: 28,  done: true  },
    { x: 76,  done: true  },
    { x: 124, done: false, active: true },
    { x: 172, done: false },
  ];
  const cy = 74;
  return (
    <svg viewBox="0 0 200 148" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Track */}
      <line x1={nodes[0].x} y1={cy} x2={nodes[3].x} y2={cy} stroke={g(0.1)} strokeWidth="1.2" />
      {/* Completed segment */}
      <line x1={nodes[0].x} y1={cy} x2={nodes[2].x} y2={cy} stroke={blue} strokeWidth="1.2" strokeOpacity="0.5" />
      {nodes.map((n, i) => (
        <g key={i}>
          {n.active ? (
            <>
              <circle cx={n.x} cy={cy} r="9" fill={blue} fillOpacity="0.1" stroke={blue} strokeOpacity="0.5" strokeWidth="1" />
              <circle cx={n.x} cy={cy} r="4" fill={blue} fillOpacity="0.9" />
            </>
          ) : n.done ? (
            <>
              <circle cx={n.x} cy={cy} r="5" fill={blue} fillOpacity="0.15" stroke={blue} strokeOpacity="0.4" strokeWidth="0.8" />
              <polyline points={`${n.x - 2.5},${cy} ${n.x - 0.5},${cy + 2.5} ${n.x + 3},${cy - 2.5}`} stroke={blue} strokeOpacity="0.7" strokeWidth="1.1" />
            </>
          ) : (
            <circle cx={n.x} cy={cy} r="5" fill="none" stroke={g(0.18)} strokeWidth="0.8" />
          )}
          <rect x={n.x - 12} y={cy + 14} width="24" height="4" rx="1" fill={g(n.done || n.active ? 0.22 : 0.1)} />
        </g>
      ))}
    </svg>
  );
}

function SketchConversion() {
  const blue = "rgb(60,100,255)";
  const pts: [number, number][] = [
    [20, 118], [52, 104], [84, 88], [116, 68], [148, 44], [180, 20],
  ];
  const area = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ") + ` L180,118 L20,118 Z`;
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const [px, py] = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 200 148" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Grid lines */}
      {[40, 70, 100].map(y => (
        <line key={y} x1="20" y1={y} x2="180" y2={y} stroke={g(0.05)} strokeWidth="0.5" />
      ))}
      {/* Area fill */}
      <path d={area} fill={blue} fillOpacity="0.06" />
      {/* Rising line */}
      <path d={line} stroke={blue} strokeWidth="1.6" strokeOpacity="0.7" fill="none" />
      {/* Peak dot */}
      <circle cx={px} cy={py} r="4" fill={blue} fillOpacity="0.9" />
      <circle cx={px} cy={py} r="8" stroke={blue} strokeOpacity="0.2" strokeWidth="0.8" />
      {/* Drop line */}
      <line x1={px} y1={py + 9} x2={px} y2="118" stroke={blue} strokeOpacity="0.15" strokeWidth="0.7" strokeDasharray="3 3" />
      {/* Axes */}
      <line x1="20" y1="118" x2="180" y2="118" stroke={g(0.14)} strokeWidth="0.7" />
      <line x1="20" y1="20" x2="20" y2="118" stroke={g(0.14)} strokeWidth="0.7" />
    </svg>
  );
}

export default function AetherPage() {
  return (
    <main className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-6xl min-h-screen flex flex-col pb-16 sm:pb-20">

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
          <h1 className="text-[clamp(3rem,8vw,5.5rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">
            Aether
          </h1>
          <p className="text-[clamp(1rem,1.8vw,1.1rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm sm:max-w-md">
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
      <p className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-normal tracking-tight text-center text-[rgb(var(--muted))] py-10 sm:py-14 px-6 sm:px-8 rise leading-snug">
        Why brands <span className="inline-block" style={{ background: "rgb(60,100,255)", color: "#fff", padding: "0.05em 0.25em 0.1em", borderRadius: "6px" }}>choose it</span> over anything else
      </p>

      <GridRule />

      {/* Features */}
      <div className="flex flex-col sm:flex-row">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="flex-1 flex flex-col gap-5 px-6 sm:px-8 pt-8 pb-8 sm:pt-12 sm:pb-12 rise"
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
              <h3 className="text-[clamp(1.1rem,2vw,1.25rem)] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">
                {f.title}
              </h3>
              <p className="text-[clamp(0.9rem,1.5vw,1rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
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
      <p className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-normal tracking-tight text-center text-[rgb(var(--muted))] py-10 sm:py-14 px-6 sm:px-8 rise leading-snug">
        Is Aether <span className="inline-block" style={{ background: "rgb(60,100,255)", color: "#fff", padding: "0.05em 0.25em 0.1em", borderRadius: "6px" }}>the right fit?</span> Four questions.
      </p>

      <GridRule />

      {/* Fit quiz -- inline, edge-to-edge */}
      <FitQuiz />

      <GridRule />

      {/* Section label -- pricing */}
      <p id="pricing" className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-normal tracking-tight text-center text-[rgb(var(--muted))] py-10 sm:py-14 px-6 sm:px-8 rise leading-snug scroll-mt-16">
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
              <th className="w-[36%] px-8 py-6 text-left border-b border-[rgb(var(--line))]">
                <span className="text-[11px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.35 }}>What's included</span>
              </th>
              {TIERS.map((t, i) => (
                <th key={t.name} className="px-6 py-6 text-left border-b border-[rgb(var(--line))]" style={{
                  borderLeft: "1px solid rgb(var(--line))",
                  background: i === 1 ? "rgb(var(--fg) / 0.025)" : undefined,
                }}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] tracking-tight font-medium text-[rgb(var(--fg))]">{t.name}</span>
                      {t.badge && (
                        <span className="text-[10px] tracking-tight font-medium px-2 py-0.5 rounded-full" style={{ background: "rgb(60,100,255)", color: "#fff" }}>{t.badge}</span>
                      )}
                    </div>
                    <span className="text-[2rem] font-[350] tracking-[-0.04em] leading-none tabular-nums text-[rgb(var(--fg))]">{t.price}</span>
                    <span className="text-[11px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.4 }}>{t.term}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRICING_ROWS.map((f) => (
              <tr key={f.label} className="group hover:bg-[rgb(var(--fg)/0.02)] transition-colors">
                <td className="px-8 py-3 text-[12px] tracking-tight text-[rgb(var(--muted))] border-b border-[rgb(var(--line))]" style={{ opacity: 0.6 }}>
                  {f.label}
                </td>
                {([f.standard, f.lifetime, f.enterprise] as (boolean | string)[]).map((val, ci) => (
                  <td key={ci} className="px-6 py-3 border-b border-[rgb(var(--line))]" style={{
                    borderLeft: "1px solid rgb(var(--line))",
                    background: ci === 1 ? "rgb(var(--fg) / 0.025)" : undefined,
                  }}>
                    {val === true ? (
                      <svg viewBox="0 0 16 16" fill="none" stroke="rgb(60,100,255)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" style={{ opacity: 0.7 }} aria-hidden="true">
                        <polyline points="2 8 6 12 14 4" />
                      </svg>
                    ) : val === false ? (
                      <span className="block w-3 h-px" style={{ background: "rgb(var(--line))" }} />
                    ) : (
                      <span className="text-[12px] tracking-tight text-[rgb(var(--fg))]" style={{ opacity: 0.65 }}>{val}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="px-8 py-6" />
              {TIERS.map((t, i) => (
                <td key={t.name} className="px-6 py-6" style={{
                  borderLeft: "1px solid rgb(var(--line))",
                  background: i === 1 ? "rgb(var(--fg) / 0.025)" : undefined,
                }}>
                  <Link
                    href={t.name === "Enterprise" ? "/aether/enterprise" : `/aether/buy?tier=${t.name.toLowerCase()}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[13px] tracking-tight font-medium transition-opacity hover:opacity-80"
                    style={i === 1
                      ? { background: "rgb(60,100,255)", color: "#fff" }
                      : { border: "1px solid rgb(var(--line))", color: "rgb(var(--fg))" }
                    }
                  >
                    {t.name === "Enterprise" ? "Learn more" : "Get Aether"}
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

    </main>
  );
}

