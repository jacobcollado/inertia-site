import type { Metadata } from "next";
import Link from "next/link";
import { CopyPassword } from "./copy-password";
import { FitQuiz } from "./fit-quiz";

export const metadata: Metadata = {
  title: "Aether Theme — Jacob Collado",
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
    term: "1 year, single store",
    description: "The full theme, licensed for a year. Good for testing the waters.",
    includes: ["Full Aether theme", "1 year of updates", "Single store license", "Email support"],
  },
  {
    name: "Lifetime",
    price: "$105",
    term: "Forever, single store",
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
    includes: ["Bespoke design pass", "Custom sections", "Brand-tuned interactions", "Direct line to me"],
  },
];

const DEMO_URL = "https://aether-starter.myshopify.com";

export default function AetherPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-8 pt-6 pb-16 sm:pt-8 sm:pb-20 min-h-screen flex flex-col">
      <header
        className="flex items-center mb-12 rise"
        style={{ ["--rise-delay" as any]: "0ms" }}
      >
        <Link
          href="/"
          className="text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← back
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-14">

        {/* Hero — full width */}
        <section className="md:col-span-12 rise" style={{ ["--rise-delay" as any]: "100ms" }}>
          <p className="inline-flex items-center gap-1.5 text-sm tracking-tight text-[rgb(var(--muted))] mb-4">
            <ShopifyLogo />
            <span>Shopify theme</span>
          </p>
          <h1 className="text-5xl sm:text-6xl font-medium tracking-tighter leading-none mb-6">
            Aether
          </h1>
          <p className="text-xl sm:text-2xl leading-[1.35] tracking-tight text-[rgb(var(--muted))] mb-8 max-w-2xl">
            A high-end Shopify theme built for flow, presence, and conversion. Designed for brands that treat the storefront as product.
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm tracking-tight">
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-5 py-2.5 hover:opacity-90 transition-opacity"
            >
              View live demo
              <span aria-hidden="true">↗</span>
            </a>
            <CopyPassword password="aether" />
            <Link
              href="/aether/buy"
              className="text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
            >
              Buy a license
            </Link>
            <Link
              href="/aether/changelog"
              className="text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
            >
              Changelog
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="md:col-span-7 rise" style={{ ["--rise-delay" as any]: "200ms" }}>
          <h2 className="text-sm tracking-tight text-[rgb(var(--muted))] mb-6">What makes it different</h2>
          <ul className="space-y-8">
            {FEATURES.map((f) => (
              <li key={f.title}>
                <h3 className="text-xl font-medium tracking-tighter mb-2 text-[rgb(var(--fg))]">
                  {f.title}
                </h3>
                <p className="text-base leading-relaxed tracking-tight text-[rgb(var(--muted))]">
                  {f.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Fit quiz */}
        <section className="md:col-span-5 rise" style={{ ["--rise-delay" as any]: "280ms" }}>
          <h2 className="text-sm tracking-tight text-[rgb(var(--muted))] mb-6">Before you buy</h2>
          <FitQuiz />
        </section>

        {/* Pricing — full width */}
        <section id="pricing" className="md:col-span-12 rise scroll-mt-20" style={{ ["--rise-delay" as any]: "360ms" }}>
          <div className="flex items-baseline justify-between gap-6 mb-6">
            <h2 className="text-sm tracking-tight text-[rgb(var(--muted))]">Pricing</h2>
            <span className="text-xs tracking-tight text-[rgb(var(--muted))]">One payment. No subscription.</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIERS.map((t) => (
              <li key={t.name}>
                <Link
                  href={`/aether/buy?tier=${t.name.toLowerCase()}`}
                  className={`group relative flex flex-col h-full rounded-2xl border p-6 transition-all duration-300 hover:border-[rgb(var(--fg))] ${
                    t.featured
                      ? "border-[rgb(var(--fg))] bg-[rgb(var(--line))]/20"
                      : "border-[rgb(var(--line))]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <p className="text-base font-medium tracking-tight text-[rgb(var(--fg))]">{t.name}</p>
                    {t.badge && (
                      <span className="inline-flex items-center rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-2 pt-[3px] pb-[4px] text-[10.5px] font-medium tracking-tight leading-none">
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-5">{t.description}</p>
                  <ul className="space-y-2 mb-8">
                    {t.includes.map((line) => (
                      <li key={line} className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--fg))] w-full">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0 text-[rgb(var(--muted))]" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {line}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-end justify-between gap-4">
                    <div>
                      <p className="text-2xl font-medium tracking-tighter text-[rgb(var(--fg))] tabular-nums leading-none">
                        {t.price}
                      </p>
                      <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] mt-1.5">{t.term}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-sm tracking-tight shrink-0 transition-all ${
                      t.featured
                        ? "bg-[rgb(var(--fg))] text-[rgb(var(--bg))] group-hover:opacity-90"
                        : "border border-[rgb(var(--line))] text-[rgb(var(--fg))] group-hover:border-[rgb(var(--fg))]"
                    }`}>
                      {t.price === "On request" ? "Enquire" : "Choose"}
                      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </main>
  );
}

function ShopifyLogo() {
  return (
    <svg
      viewBox="0 0 256 292"
      aria-hidden="true"
      className="h-[22px] w-auto shrink-0"
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
