import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aether Enterprise",
  description: "Scale Shopify stores faster using Aether as your foundation. Built for agencies, brand studios, and high-volume operators.",
};

const WHO = [
  { label: "Shopify agencies",  desc: "Deliver premium storefronts faster and at higher margin." },
  { label: "Brand studios",     desc: "A strong foundation that makes your design work shine." },
  { label: "E-com operators",   desc: "Scale multiple brands without rebuilding from scratch." },
  { label: "Holding companies", desc: "Standardise across your portfolio without locking brand identity." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Pick a licence",      body: "Choose per-store or unlimited. Both are one-time payments, no renewals." },
  { step: "02", title: "Get access",           body: "We send over the theme files and commercial licence within one business day." },
  { step: "03", title: "Configure and launch", body: "Use Aether as the foundation. Swap in your client's brand, content, and products." },
  { step: "04", title: "Hand it off",          body: "The licence covers client handoff. They own the store. You keep the margin." },
];

const INCLUDED = [
  "Commercial deployment rights",
  "Multi-store or unlimited store licences",
  "Lifetime updates across all deployments",
  "Priority and dedicated support",
  "Early access to new theme features",
  "Unlocked for client handoff",
];

const PLANS = [
  {
    name: "Per store",
    price: "$59",
    term: "per store, one-time",
    description: "Pay once per storefront. No renewals, no seat caps. Scales cleanly as your client list grows.",
    includes: ["Full Aether theme", "Lifetime updates for that store", "Commercial use licence", "Priority email support"],
    cta: "Get started",
    href: "/contact?ref=enterprise-per-store",
    featured: false,
  },
  {
    name: "Agency unlimited",
    price: "$449",
    term: "one-time, unlimited stores",
    description: "One payment covers every store you ever launch on Aether. Best for agencies deploying at volume.",
    includes: ["Full Aether theme", "Unlimited store deployments", "Lifetime updates on all stores", "Dedicated support channel", "Early access to new features"],
    cta: "Get unlimited",
    href: "/contact?ref=enterprise-unlimited",
    featured: true,
  },
];

export default function EnterprisePage() {
  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Hero */}
      <section className="px-3 pt-16 sm:pt-24 pb-14 flex flex-col items-center text-center rise">
        <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] flex items-center gap-2.5 mb-6">
          <span className="inline-flex items-center rounded-full px-2 py-1 text-[12px] tracking-tight leading-none text-[rgb(var(--bg))]" style={{ background: "var(--accent-gradient)" }}>Enterprise</span>
          <span className="w-px h-3.5 bg-[rgb(var(--line))]" aria-hidden="true" />
          Aether for teams
        </p>
        <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-5 max-w-2xl">
          Aether at scale.
        </h1>
        <p className="text-[clamp(1rem,1.8vw,1.15rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-8 max-w-md">
          A Shopify foundation for agencies and studios that ship stores for a living.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contact?ref=enterprise"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-80 transition-opacity"
          >
            Talk to us
          </Link>
          <Link
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line))] px-5 py-2.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          >
            See pricing
          </Link>
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Who it's for */}
      <section className="px-3 pt-16 sm:pt-24 pb-14 rise">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-3">Built for teams at scale</p>
        <p className="text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-10" style={{ opacity: 0.6 }}>Whoever you are, Aether gives you a head start.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {WHO.map((w, i) => (
            <div key={w.label} className="flex flex-col gap-2" style={{ ["--rise-delay" as any]: `${i * 60}ms` }}>
              <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">{w.label}</span>
              <span className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{w.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* How it works */}
      <section className="px-3 pt-16 sm:pt-24 pb-14 rise">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-3">How it works</p>
        <p className="text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-10" style={{ opacity: 0.6 }}>Four steps from purchase to handoff.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {HOW_IT_WORKS.map((h, i) => (
            <div key={h.step} className="flex gap-5" style={{ ["--rise-delay" as any]: `${i * 60}ms` }}>
              <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums mt-0.5" style={{ opacity: 0.3 }}>{h.step}</span>
              <div className="flex flex-col gap-1.5">
                <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">{h.title}</span>
                <span className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{h.body}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* What's included */}
      <section className="px-3 pt-16 sm:pt-24 pb-14 rise">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-3">And everything else</p>
        <p className="text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-10" style={{ opacity: 0.6 }}>Everything in the standard Aether theme, plus:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-3.5">
          {INCLUDED.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--muted))]" style={{ opacity: 0.5 }} aria-hidden="true">
                <polyline points="2 8 6 12 14 4" />
              </svg>
              <span className="text-[15px] tracking-tight text-[rgb(var(--fg))]">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Pricing */}
      <section id="pricing" className="px-3 pt-16 sm:pt-24 pb-14 scroll-mt-20 rise">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-3">Simple pricing</p>
        <p className="text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-10" style={{ opacity: 0.6 }}>No per-seat games. No renewals. One payment.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <Link
              key={plan.name}
              href={plan.href}
              className="group flex flex-col gap-6 rounded-xl border border-[rgb(var(--line))] px-6 py-7 hover:border-[rgb(var(--fg)/0.2)] transition-colors"
              style={{ background: plan.featured ? "rgb(var(--surface))" : undefined }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[14px] tracking-tight font-medium text-[rgb(var(--fg))]">{plan.name}</span>
                {plan.featured && (
                  <span className="text-[10px] tracking-tight font-medium px-2 py-1 rounded-full text-[rgb(var(--bg))]" style={{ background: "var(--accent-gradient)" }}>
                    Best value
                  </span>
                )}
              </div>
              <div>
                <p className="text-[2.8rem] font-normal tracking-[-0.05em] leading-none tabular-nums text-[rgb(var(--fg))]">{plan.price}</p>
                <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] mt-2" style={{ opacity: 0.5 }}>{plan.term}</p>
              </div>
              <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{plan.description}</p>
              <ul className="flex flex-col gap-2.5">
                {plan.includes.map((line) => (
                  <li key={line} className="flex items-center gap-2.5 text-[13px] tracking-tight text-[rgb(var(--muted))]">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0" style={{ opacity: 0.4 }} aria-hidden="true">
                      <polyline points="2 8 6 12 14 4" />
                    </svg>
                    {line}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[rgb(var(--line))] text-[13px] tracking-tight text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] transition-colors">
                {plan.cta}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60 transition-all duration-200" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Closing CTA */}
      <section className="px-3 pt-16 sm:pt-24 pb-14 flex flex-col items-center text-center rise">
        <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-normal tracking-[-0.04em] leading-[1.08] text-[rgb(var(--fg))] mb-4 max-w-lg">
          Ready to ship more, build less?
        </h2>
        <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] mb-8 max-w-xs leading-relaxed" style={{ opacity: 0.6 }}>
          We work with a small number of agencies. If you're serious about scaling, get in touch.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contact?ref=enterprise-cta"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-80 transition-opacity"
          >
            Talk to us
          </Link>
          <Link
            href="/aether"
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line))] px-5 py-2.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          >
            View standard plans
          </Link>
        </div>
      </section>

    </main>
  );
}
