import type { Metadata } from "next";
import Link from "next/link";

const CAL_LINK = "https://cal.com/jacob-c-99otvp/15min";

export const metadata: Metadata = {
  title: "Aether commercial",
  description: "Ship client stores faster on Aether. Per-store or unlimited commercial licences, lifetime updates, and clean client handoff. Built for agencies, brand studios, and operators.",
};

const WHO = [
  { label: "Shopify agencies",  desc: "Ship premium storefronts in days, not weeks, and keep more of the margin." },
  { label: "Brand studios",     desc: "A clean foundation that stays out of the way and lets the design lead." },
  { label: "E-com operators",   desc: "Run multiple brands on one foundation instead of rebuilding for each." },
  { label: "Holding companies", desc: "One stack across the portfolio, with every brand keeping its own identity." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Pick a licence",    body: "Per store or unlimited. Both are one-time payments. Nothing renews." },
  { step: "02", title: "Get access",        body: "Theme files and your commercial licence land in your inbox within one business day." },
  { step: "03", title: "Build and launch",  body: "Start from Aether, drop in the client's brand, content, and products, and ship." },
  { step: "04", title: "Hand it off",       body: "Handoff is covered by the licence. The client owns their store. You keep the margin." },
];

const INCLUDED = [
  "Commercial deployment rights",
  "Per-store or unlimited licences",
  "Lifetime updates on every deployment",
  "Priority and dedicated support",
  "Early access to new theme features",
  "Clean client handoff, no strings",
];

const PLANS = [
  {
    name: "Per store",
    price: "$59",
    term: "per store, one-time",
    description: "Pay once for each storefront you launch. No renewals, no seat caps. Costs scale with your client list, nothing else.",
    includes: ["Full Aether theme", "Lifetime updates for that store", "Commercial use licence", "Priority email support"],
    cta: "Get started",
    href: CAL_LINK,
    featured: false,
  },
  {
    name: "Agency unlimited",
    price: "$449",
    term: "one-time, unlimited stores",
    description: "One payment covers every store you ever launch on Aether. The obvious pick if you ship at volume.",
    includes: ["Full Aether theme", "Unlimited store deployments", "Lifetime updates on all stores", "Dedicated support channel", "Early access to new features"],
    cta: "Get unlimited",
    href: CAL_LINK,
    featured: true,
  },
];

export default function CommercialPage() {
  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[88rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Hero */}
      <section className="px-3 flex flex-col items-center justify-center text-center rise" style={{ minHeight: 420, paddingTop: 80, paddingBottom: 40 }}>
        <p className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] tracking-tight text-[rgb(var(--fg))] mb-6" style={{ background: "rgb(var(--fg) / 0.06)" }}>
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] tracking-tight leading-none text-[rgb(var(--bg))]" style={{ background: "rgb(var(--fg) / 0.5)" }}>Commercial</span>
          Aether for client work
        </p>
        <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-5 max-w-2xl">
          Build client stores on Aether
        </h1>
        <p className="text-[clamp(1rem,1.8vw,1.2rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-8 max-w-md">
          One theme, every client. The foundation for agencies, studios, and operators who ship stores for a living.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={CAL_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-80 transition-opacity"
          >
            Talk to us
          </Link>
          <Link
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line))] px-5 py-2.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          >
            See pricing
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 opacity-60" aria-hidden="true"><line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/></svg>
          </Link>
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Who it's for */}
      <section className="px-3 pt-16 sm:pt-24 pb-14 rise">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-3">Who this is for</p>
        <p className="text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-10" style={{ opacity: 0.6 }}>If you build or run stores for other people, this licence is for you.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px border border-[rgb(var(--line))] rounded-2xl overflow-hidden" style={{ background: "rgb(var(--line))" }}>
          {WHO.map((w) => (
            <div key={w.label} className="flex flex-col gap-2 px-6 py-7" style={{ background: "rgb(var(--bg))" }}>
              <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">{w.label}</span>
              <span className="text-[13.5px] sm:text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.65 }}>{w.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* How it works */}
      <section className="px-3 pt-16 sm:pt-24 pb-14 rise">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-3">How it works</p>
        <p className="text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-10" style={{ opacity: 0.6 }}>From purchase to handoff in four steps.</p>
        <div className="flex flex-col border border-[rgb(var(--line))] rounded-2xl overflow-hidden px-6 py-2">
          {HOW_IT_WORKS.map((h, i) => {
            const isLast = i === HOW_IT_WORKS.length - 1;
            const nodeCenter = 39;
            return (
              <div key={h.step} className="flex items-stretch gap-5">
                <div className="relative flex flex-col items-center shrink-0" style={{ width: 28 }}>
                  <div className="absolute left-1/2" style={{ width: 1, top: -8, height: nodeCenter + 8, transform: "translateX(-50%)", background: "rgb(var(--line))" }} />
                  {!isLast && (
                    <div className="absolute left-1/2" style={{ width: 1, top: nodeCenter, bottom: 0, transform: "translateX(-50%)", background: "rgb(var(--line))" }} />
                  )}
                  <div className="relative z-10 flex items-center justify-center rounded-full border border-[rgb(var(--line))] text-[11px] tabular-nums text-[rgb(var(--muted))]" style={{ width: 28, height: 28, marginTop: 24, background: "rgb(var(--bg))" }}>
                    {i + 1}
                  </div>
                </div>
                <div className="flex flex-col gap-1 py-6">
                  <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">{h.title}</span>
                  <span className="text-[13.5px] sm:text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.65 }}>{h.body}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* What's included */}
      <section className="px-3 pt-16 sm:pt-24 pb-14 rise">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-3">What you get</p>
        <p className="text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-10" style={{ opacity: 0.6 }}>Everything in Aether standard, plus:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INCLUDED.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl px-5 py-4 border border-[rgb(var(--line))]">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--fg))]" style={{ opacity: 0.35 }} aria-hidden="true">
                <polyline points="2 8 6 12 14 4" />
              </svg>
              <span className="text-[14px] sm:text-[15.5px] tracking-tight text-[rgb(var(--fg))]">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Pricing */}
      <section id="pricing" className="px-3 pt-16 sm:pt-24 pb-14 scroll-mt-20 rise">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-3">Pricing</p>
        <p className="text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-10" style={{ opacity: 0.6 }}>One payment. No seats, no renewals, no surprises.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLANS.map((plan) => (
            <Link
              key={plan.name}
              href={plan.href}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col gap-6 rounded-2xl border px-7 py-8 transition-colors"
              style={{
                background: plan.featured ? "rgb(var(--surface-elevated))" : "rgb(var(--bg))",
                borderColor: plan.featured ? "rgb(var(--fg) / 0.15)" : "rgb(var(--line))",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.6 }}>{plan.name}</span>
                {plan.featured && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] tracking-tight leading-none text-[rgb(var(--bg))]" style={{ background: "rgb(var(--fg) / 0.8)" }}>
                    Best value
                  </span>
                )}
              </div>
              <div>
                <p className="text-[3rem] font-normal tracking-[-0.05em] leading-none tabular-nums text-[rgb(var(--fg))]">{plan.price}</p>
                <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] mt-2" style={{ opacity: 0.4 }}>{plan.term}</p>
              </div>
              <p className="text-[13.5px] sm:text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.7 }}>{plan.description}</p>
              <ul className="flex flex-col gap-2.5 border-t border-[rgb(var(--line))] pt-5">
                {plan.includes.map((line) => (
                  <li key={line} className="flex items-center gap-2.5 text-[13px] sm:text-[14.5px] tracking-tight text-[rgb(var(--muted))]">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0 text-[rgb(var(--fg))]" style={{ opacity: 0.3 }} aria-hidden="true">
                      <polyline points="2 8 6 12 14 4" />
                    </svg>
                    {line}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 mt-auto text-[13px] tracking-tight text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] transition-colors">
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
          Ship more, build less
        </h2>
        <p className="text-[15px] sm:text-[16px] tracking-tight text-[rgb(var(--muted))] mb-8 max-w-xs leading-relaxed" style={{ opacity: 0.6 }}>
          We keep the roster small. If you are serious about scaling client work, get in touch.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={CAL_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-80 transition-opacity"
          >
            Talk to us
          </Link>
          <Link
            href="/aether"
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line))] px-5 py-2.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          >
            View standard plans
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 opacity-60" aria-hidden="true"><line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/></svg>
          </Link>
        </div>
      </section>

    </main>
  );
}
