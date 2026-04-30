import type { Metadata } from "next";
import Link from "next/link";
import { CopyPassword } from "./copy-password";
import { FitQuiz } from "./fit-quiz";

export const metadata: Metadata = {
  title: "Aether Theme — Inertia",
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

// Storefront blueprint — hero section wireframe
function SketchStorefront() {
  return (
    <svg viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full text-[rgb(var(--muted))] opacity-[0.18]" aria-hidden="true">
      <rect x="8" y="8" width="184" height="104" rx="2" strokeWidth="0.9" />
      <line x1="8" y1="20" x2="192" y2="20" strokeWidth="0.7" />
      <rect x="40" y="13" width="120" height="5" rx="1.5" strokeWidth="0.5" />
      <line x1="16" y1="30" x2="44" y2="30" strokeWidth="0.8" />
      <line x1="80" y1="30" x2="96" y2="30" strokeWidth="0.5" />
      <line x1="102" y1="30" x2="118" y2="30" strokeWidth="0.5" />
      <line x1="124" y1="30" x2="140" y2="30" strokeWidth="0.5" />
      <rect x="158" y="27" width="26" height="6" rx="2" strokeWidth="0.6" />
      <rect x="16" y="38" width="112" height="52" rx="1" strokeWidth="0.7" />
      <line x1="16" y1="38" x2="128" y2="90" strokeWidth="0.35" />
      <line x1="128" y1="38" x2="16" y2="90" strokeWidth="0.35" />
      <line x1="138" y1="42" x2="184" y2="42" strokeWidth="1.1" />
      <line x1="138" y1="49" x2="176" y2="49" strokeWidth="0.9" />
      <line x1="138" y1="56" x2="164" y2="56" strokeWidth="0.6" />
      <line x1="138" y1="62" x2="180" y2="62" strokeWidth="0.5" />
      <line x1="138" y1="67" x2="170" y2="67" strokeWidth="0.5" />
      <rect x="138" y="74" width="46" height="8" rx="2" strokeWidth="0.7" />
      <circle cx="140" cy="86" r="2.5" strokeWidth="0.6" />
      <circle cx="148" cy="86" r="2.5" strokeWidth="0.6" />
      <circle cx="156" cy="86" r="2.5" strokeWidth="0.6" />
      <circle cx="164" cy="86" r="2.5" strokeWidth="0.6" />
      <line x1="8" y1="115" x2="192" y2="115" strokeWidth="0.35" />
      <line x1="8" y1="113" x2="8" y2="117" strokeWidth="0.5" />
      <line x1="192" y1="113" x2="192" y2="117" strokeWidth="0.5" />
    </svg>
  );
}

// Interaction timeline — transitions, polish
function SketchTimeline() {
  return (
    <svg viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full text-[rgb(var(--muted))] opacity-[0.18]" aria-hidden="true">
      <line x1="16" y1="60" x2="184" y2="60" strokeWidth="0.7" />
      <line x1="16" y1="56" x2="16" y2="64" strokeWidth="0.8" />
      <polyline points="180,56 184,60 180,64" strokeWidth="0.7" />
      <circle cx="42" cy="60" r="3" strokeWidth="0.8" />
      <line x1="42" y1="57" x2="42" y2="38" strokeWidth="0.6" />
      <line x1="32" y1="38" x2="72" y2="38" strokeWidth="0.8" />
      <line x1="32" y1="34" x2="60" y2="34" strokeWidth="0.5" />
      <line x1="32" y1="30" x2="52" y2="30" strokeWidth="0.4" />
      <path d="M 32 48 Q 40 44 48 38" strokeWidth="0.5" strokeDasharray="1.5 2" />
      <circle cx="90" cy="60" r="3" strokeWidth="0.8" />
      <line x1="90" y1="63" x2="90" y2="84" strokeWidth="0.6" />
      <line x1="78" y1="84" x2="118" y2="84" strokeWidth="0.8" />
      <line x1="78" y1="88" x2="108" y2="88" strokeWidth="0.5" />
      <line x1="78" y1="92" x2="96" y2="92" strokeWidth="0.4" />
      <circle cx="142" cy="60" r="3" strokeWidth="0.8" />
      <line x1="142" y1="57" x2="142" y2="42" strokeWidth="0.6" />
      <line x1="130" y1="42" x2="168" y2="42" strokeWidth="0.8" />
      <line x1="130" y1="38" x2="158" y2="38" strokeWidth="0.5" />
      <line x1="130" y1="34" x2="148" y2="34" strokeWidth="0.4" />
      <line x1="42" y1="108" x2="142" y2="108" strokeWidth="0.5" />
      <line x1="42" y1="105" x2="42" y2="111" strokeWidth="0.6" />
      <line x1="142" y1="105" x2="142" y2="111" strokeWidth="0.6" />
    </svg>
  );
}

// Conversion funnel — flow diagram
function SketchFunnel() {
  return (
    <svg viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full text-[rgb(var(--muted))] opacity-[0.18]" aria-hidden="true">
      <rect x="20" y="10" width="160" height="14" rx="1" strokeWidth="0.8" />
      <line x1="100" y1="24" x2="100" y2="33" strokeWidth="0.6" />
      <polyline points="96,30 100,34 104,30" strokeWidth="0.6" />
      <rect x="40" y="34" width="120" height="14" rx="1" strokeWidth="0.8" />
      <line x1="100" y1="48" x2="100" y2="57" strokeWidth="0.6" />
      <polyline points="96,54 100,58 104,54" strokeWidth="0.6" />
      <rect x="60" y="58" width="80" height="14" rx="1" strokeWidth="0.8" />
      <line x1="100" y1="72" x2="100" y2="81" strokeWidth="0.6" />
      <polyline points="96,78 100,82 104,78" strokeWidth="0.6" />
      <rect x="76" y="82" width="48" height="14" rx="1" strokeWidth="1.0" />
      <line x1="12" y1="10" x2="12" y2="24" strokeWidth="0.5" />
      <line x1="8" y1="10" x2="16" y2="10" strokeWidth="0.5" />
      <line x1="8" y1="24" x2="16" y2="24" strokeWidth="0.5" />
      <line x1="12" y1="82" x2="12" y2="96" strokeWidth="0.5" />
      <line x1="8" y1="82" x2="16" y2="82" strokeWidth="0.5" />
      <line x1="8" y1="96" x2="16" y2="96" strokeWidth="0.5" />
      <line x1="140" y1="89" x2="180" y2="89" strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="180" y1="82" x2="180" y2="96" strokeWidth="0.6" />
      <line x1="176" y1="82" x2="184" y2="82" strokeWidth="0.5" />
      <line x1="176" y1="96" x2="184" y2="96" strokeWidth="0.5" />
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
          className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← back
        </Link>
      </div>

      <GridRule />

      {/* Hero */}
      <section className="px-6 sm:px-8 pt-12 pb-14 flex flex-col items-center text-center rise" style={{ ["--rise-delay" as any]: "60ms" }}>
        <p className="inline-flex items-center gap-1.5 text-[12px] tracking-tight text-[rgb(var(--muted))] mb-6">
          <ShopifyLogo />
          <span>Shopify theme by Inertia</span>
        </p>
        <h1 className="text-[clamp(3.5rem,10vw,6.5rem)] font-medium tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-4">
          Aether
        </h1>
        <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] mb-3">
          High-conversion. Prestige design. Ships in days.
        </p>
        <p className="text-[1rem] leading-[1.75] tracking-tight text-[rgb(var(--muted))] mb-10 max-w-sm sm:max-w-lg">
          Built for brands that treat the storefront as product — not just a place to list SKUs.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 text-[13px] tracking-tight w-full">
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-5 py-2.5 hover:opacity-90 transition-opacity"
          >
            View live demo
            <span aria-hidden="true">↗</span>
          </a>
          <CopyPassword password="aether" />
          <div className="flex items-center gap-4">
            <Link
              href="/aether/buy"
              className="text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
            >
              Buy a license
            </Link>
            <span className="text-[rgb(var(--line))]">·</span>
            <Link
              href="/aether/changelog"
              className="text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
            >
              Changelog
            </Link>
          </div>
        </div>
      </section>

      <GridRule />

      {/* Section label — what makes it different */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-5 sm:py-6 px-6 sm:px-8 rise" style={{ ["--rise-delay" as any]: "100ms" }}>
        <span className="text-[16px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))]">Three things that make it</span>
        <div className="flex items-center gap-2 border border-[rgb(var(--line))] rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[rgb(var(--fg))]" aria-hidden="true">
            <polygon points="8,2 14,12 2,12" />
          </svg>
          <span className="text-[14px] sm:text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">worth it</span>
        </div>
        <span className="text-[16px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))]">over anything else</span>
      </div>

      <GridRule />

      {/* Features — 3 col on desktop, stacked on mobile */}
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
              {i === 0 && <SketchStorefront />}
              {i === 1 && <SketchTimeline />}
              {i === 2 && <SketchFunnel />}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">
                {f.title}
              </h3>
              <p className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
                {f.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <GridRule />

      {/* Section label — before you buy */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-5 sm:py-6 px-6 sm:px-8 rise" style={{ ["--rise-delay" as any]: "180ms" }}>
        <span className="text-[16px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))]">Four questions.</span>
        <div className="flex items-center gap-2 border border-[rgb(var(--line))] rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[rgb(var(--fg))]" aria-hidden="true">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5.5c0-1 1.5-1 1.5 0S8 7 8 8M8 10.5v.5" />
          </svg>
          <span className="text-[14px] sm:text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">Twenty seconds.</span>
        </div>
        <span className="text-[16px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))]">Find out if it fits.</span>
      </div>

      <GridRule />

      {/* Fit quiz */}
      <div className="px-6 sm:px-8 py-10 rise" style={{ ["--rise-delay" as any]: "220ms" }}>
        <FitQuiz />
      </div>

      <GridRule />

      {/* Section label — pricing */}
      <div className="relative flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-5 sm:py-6 px-6 sm:px-8 rise" style={{ ["--rise-delay" as any]: "260ms" }}>
        <span className="text-[16px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))]">One payment.</span>
        <div className="flex items-center gap-2 border border-[rgb(var(--line))] rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[rgb(var(--fg))]" aria-hidden="true">
            <rect x="2" y="4" width="12" height="9" rx="1.5" />
            <path d="M2 7h12" />
            <path d="M5 10h2" />
          </svg>
          <span className="text-[14px] sm:text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">Pick your license.</span>
        </div>
        <span className="text-[16px] sm:text-[19px] tracking-tight text-[rgb(var(--muted))]">Own it forever.</span>
      </div>

      <GridRule />

      {/* Pricing — 3 col desktop, stacked mobile */}
      <div id="pricing" className="flex flex-col sm:flex-row scroll-mt-20 rise" style={{ ["--rise-delay" as any]: "300ms" }}>
        {TIERS.map((t, i) => (
          <Link
            key={t.name}
            href={`/aether/buy?tier=${t.name.toLowerCase()}`}
            className="group flex-1 flex flex-col justify-between gap-6 px-6 sm:px-8 pt-8 pb-8 transition-colors hover:bg-[rgb(var(--line))/0.1]"
            style={{
              borderLeft: i > 0 ? "1px solid rgb(var(--line))" : undefined,
              borderTop: i > 0 ? "1px solid rgb(var(--line))" : undefined,
            }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))] leading-none">{t.name}</span>
                {t.badge && (
                  <span className="inline-flex items-center rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-2 pt-[3px] pb-[4px] text-[10.5px] font-medium tracking-tight leading-none">
                    {t.badge}
                  </span>
                )}
              </div>
              <p className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{t.description}</p>
              <ul className="space-y-2">
                {t.includes.map((line) => (
                  <li key={line} className="flex items-center gap-1.5 text-[12px] tracking-tight text-[rgb(var(--fg))]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0 text-[rgb(var(--muted))]" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-end justify-between gap-4 mt-auto">
              <div>
                <p className="text-[2rem] font-medium tracking-[-0.04em] text-[rgb(var(--fg))] tabular-nums leading-none">
                  {t.price}
                </p>
                <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] mt-1.5">{t.term}</p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1.5 text-[12px] tracking-tight text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] transition-colors">
                {t.price === "On request" ? "Enquire" : "Choose"}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <GridRule />

      {/* Footer */}
      <footer className="px-6 sm:px-8 py-8 flex items-center justify-between gap-6 text-[13px] tracking-tight text-[rgb(var(--muted))]">
        <Link href="/" className="hover:text-[rgb(var(--fg))] transition-colors">← Inertia</Link>
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
