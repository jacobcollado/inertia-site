import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aether Enterprise",
  description:
    "Scale Shopify stores faster using Aether as your foundation. Built for agencies, brand studios, and high-volume operators.",
};

function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}

function rgba([r, g, b]: [number, number, number], a = 1) {
  return `rgba(${r},${g},${b},${a})`;
}

const ACCENT: [number, number, number] = [56, 180, 255];

function SketchMultiStore() {
  const g = (a: number) => rgba([160, 160, 160], a);
  const ac = (op: number) => rgba(ACCENT, op);
  const stores = [
    { x: 8,   y: 8,  w: 88, h: 60, active: true  },
    { x: 104, y: 8,  w: 88, h: 60, active: false },
    { x: 200, y: 8,  w: 88, h: 60, active: false },
    { x: 8,   y: 76, w: 88, h: 60, active: false },
    { x: 104, y: 76, w: 88, h: 60, active: false },
    { x: 200, y: 76, w: 88, h: 60, active: false },
  ];
  return (
    <svg viewBox="0 0 296 144" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {stores.map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="2"
            stroke={s.active ? ac(0.6) : g(0.18)} strokeWidth={s.active ? 0.9 : 0.6}
            fill={s.active ? ac(0.04) : "none"} />
          <line x1={s.x + 8} y1={s.y + 13} x2={s.x + 44} y2={s.y + 13}
            stroke={s.active ? ac(0.7) : g(0.28)} strokeWidth={s.active ? 1.2 : 0.8} />
          <line x1={s.x + 8} y1={s.y + 21} x2={s.x + 34} y2={s.y + 21}
            stroke={s.active ? ac(0.4) : g(0.18)} strokeWidth="0.6" />
          <line x1={s.x + 8} y1={s.y + 36} x2={s.x + 56} y2={s.y + 36}
            stroke={g(0.14)} strokeWidth="0.5" />
          <line x1={s.x + 8} y1={s.y + 43} x2={s.x + 48} y2={s.y + 43}
            stroke={g(0.12)} strokeWidth="0.5" />
          <rect x={s.x + 8} y={s.y + 48} width={s.w - 16} height="7" rx="1.5"
            fill={s.active ? ac(0.85) : g(0.1)} stroke={s.active ? "none" : g(0.18)} strokeWidth="0.5" />
          {s.active && <circle cx={s.x + s.w - 10} cy={s.y + 10} r="3" fill={ac(0.8)} />}
        </g>
      ))}
    </svg>
  );
}

function SketchLaunchSpeed() {
  const g = (a: number) => rgba([160, 160, 160], a);
  const ac = (op: number) => rgba(ACCENT, op);
  const phases = [{ x: 30 }, { x: 100 }, { x: 170 }, { x: 240 }];
  return (
    <svg viewBox="0 0 280 130" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="30" y1="65" x2="240" y2="65" stroke={g(0.15)} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="30" y1="65" x2="170" y2="65" stroke={ac(0.5)} strokeWidth="1.5" strokeLinecap="round" />
      {phases.map((p, i) => {
        const done = i < 3;
        const current = i === 2;
        return (
          <g key={p.x}>
            <circle cx={p.x} cy="65" r={current ? 7 : 5}
              fill={done ? ac(current ? 0.9 : 0.3) : g(0.08)}
              stroke={done ? ac(current ? 1 : 0.5) : g(0.25)}
              strokeWidth={current ? 1.5 : 1} />
            {done && !current && (
              <polyline points={`${p.x - 2.5},65 ${p.x - 0.5},67 ${p.x + 3},62`}
                stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            )}
            <line x1={p.x} y1={i % 2 === 0 ? 58 : 72} x2={p.x} y2={i % 2 === 0 ? 38 : 92}
              stroke={done ? ac(0.25) : g(0.15)} strokeWidth="0.6" strokeDasharray="2 2" />
            <rect x={p.x - 22} y={i % 2 === 0 ? 24 : 94} width="44" height="14" rx="2"
              fill={current ? ac(0.1) : "none"}
              stroke={done ? ac(current ? 0.55 : 0.28) : g(0.2)} strokeWidth={current ? 0.9 : 0.6} />
            <line x1={p.x - 13} y1={i % 2 === 0 ? 31 : 101} x2={p.x + 13} y2={i % 2 === 0 ? 31 : 101}
              stroke={done ? ac(current ? 0.6 : 0.32) : g(0.2)} strokeWidth={current ? 1.0 : 0.6} />
          </g>
        );
      })}
      <rect x="196" y="8" width="60" height="18" rx="3" fill={ac(0.08)} stroke={ac(0.35)} strokeWidth="0.8" />
      <line x1="206" y1="17" x2="220" y2="17" stroke={ac(0.65)} strokeWidth="1.1" />
      <line x1="224" y1="17" x2="248" y2="17" stroke={ac(0.35)} strokeWidth="0.7" />
    </svg>
  );
}

function SketchMargin() {
  const g = (a: number) => rgba([160, 160, 160], a);
  const ac = (op: number) => rgba(ACCENT, op);
  const baseline = 110;
  const bars = [
    { x: 40,  h: 18, highlight: false },
    { x: 90,  h: 38, highlight: false },
    { x: 140, h: 62, highlight: false },
    { x: 190, h: 90, highlight: true  },
  ];
  return (
    <svg viewBox="0 0 240 128" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="20" y1={baseline - 98} x2="20" y2={baseline} stroke={g(0.18)} strokeWidth="0.7" />
      {[0.33, 0.66, 1].map((t) => (
        <line key={t} x1="20" y1={baseline - 90 * t} x2="220" y2={baseline - 90 * t}
          stroke={g(0.07)} strokeWidth="0.5" strokeDasharray="3 3" />
      ))}
      <line x1="20" y1={baseline} x2="220" y2={baseline} stroke={g(0.2)} strokeWidth="0.7" />
      {bars.map((b) => (
        <g key={b.x}>
          <rect x={b.x - 18} y={baseline - b.h} width={36} height={b.h} rx="1.5"
            fill={b.highlight ? ac(0.18) : g(0.09)}
            stroke={b.highlight ? ac(0.65) : g(0.2)}
            strokeWidth={b.highlight ? 1.0 : 0.6} />
          {b.highlight && (
            <rect x={b.x - 18} y={baseline - b.h} width={36} height={8} rx="1.5" fill={ac(0.85)} />
          )}
        </g>
      ))}
      <line x1="40" y1={baseline - 18} x2="190" y2={baseline - 90}
        stroke={ac(0.22)} strokeWidth="0.8" strokeDasharray="2 3" />
    </svg>
  );
}

const STATS = [
  { value: "4 days", label: "avg time to launch" },
  { value: "6x",    label: "conversion vs default" },
  { value: "$59",   label: "per store, one-time" },
  { value: "100%",  label: "commercial rights included" },
];

const WHO = [
  { num: "01", label: "Shopify agencies",  desc: "Deliver premium storefronts faster and at higher margin." },
  { num: "02", label: "Brand studios",     desc: "A strong foundation that makes your design work shine." },
  { num: "03", label: "E-com operators",   desc: "Scale multiple brands without rebuilding from scratch each time." },
  { num: "04", label: "Holding companies", desc: "Standardise across your portfolio without locking brand identity." },
];

const VALUE_PROPS = [
  {
    title: "Deploy in days, not weeks",
    body: "Aether ships production-ready. Skip the build-from-scratch phase and go straight to brand configuration. Most agencies are live within 4 days.",
    sketch: <SketchLaunchSpeed />,
  },
  {
    title: "One foundation, unlimited stores",
    body: "Licence Aether once per client or roll it across your entire portfolio at a fraction of per-seat costs. No rebuilding the same thing twice.",
    sketch: <SketchMultiStore />,
  },
  {
    title: "Margin that compounds",
    body: "Less time building means more time selling. Enterprise pricing is structured so your margin grows with every store you ship.",
    sketch: <SketchMargin />,
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Pick a licence",       body: "Choose per-store or unlimited. Both are one-time payments with no renewals." },
  { step: "02", title: "Get access",            body: "We send over the theme files and commercial licence within one business day." },
  { step: "03", title: "Configure and launch",  body: "Use Aether as the foundation. Swap in your client's brand, content, and products." },
  { step: "04", title: "Hand it off",           body: "The licence covers client handoff. They own the store. You keep the margin." },
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
    includes: [
      "Full Aether theme",
      "Lifetime updates for that store",
      "Commercial use licence",
      "Priority email support",
    ],
    cta: "Get started",
    href: "/contact?ref=enterprise-per-store",
    featured: false,
  },
  {
    name: "Agency unlimited",
    price: "$449",
    term: "one-time, unlimited stores",
    description: "One payment covers every store you ever launch on Aether. Best for agencies deploying at volume.",
    includes: [
      "Full Aether theme",
      "Unlimited store deployments",
      "Lifetime updates on all stores",
      "Dedicated support channel",
      "Early access to new features",
    ],
    cta: "Get unlimited",
    href: "/contact?ref=enterprise-unlimited",
    featured: true,
  },
];

export default function EnterprisePage() {
  return (
    <main className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-6xl min-h-screen flex flex-col pb-16 sm:pb-20">

      <section className="px-6 sm:px-8 pt-14 pb-12 flex flex-col items-center text-center rise">
        <h1 className="text-[clamp(2.4rem,7vw,5rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-5 max-w-2xl">
          Scale faster. Keep more margin.
        </h1>
        <p className="text-[1rem] leading-[1.7] tracking-tight text-[rgb(var(--muted))] mb-8 max-w-sm">
          A Shopify foundation for agencies and studios that ship stores for a living.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contact?ref=enterprise"
            className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-5 py-2.5 text-[13px] font-medium tracking-tight hover:opacity-85 transition-opacity"
          >
            Talk to us
          </Link>
          <Link
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line))] px-5 py-2.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.3)] transition-colors"
          >
            See pricing
          </Link>
        </div>
      </section>

      <GridRule />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 rise">
        {STATS.map((s, i) => (
          <div key={s.label}
            className="flex flex-col items-center justify-center gap-1 py-7 px-4 text-center"
            style={{
              borderLeft: i % 2 !== 0 || i >= 2 ? "1px solid rgb(var(--line))" : undefined,
              borderTop: i >= 2 ? "1px solid rgb(var(--line))" : undefined,
            }}
          >
            <span className="text-[1.75rem] sm:text-[1.9rem] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">{s.value}</span>
            <span className="text-[11px] sm:text-[12px] tracking-tight text-[rgb(var(--muted))] mt-0.5" style={{ opacity: 0.6 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <GridRule />

      <p className="text-[clamp(2rem,5vw,3rem)] font-normal tracking-tight text-center text-[rgb(var(--muted))] py-6 sm:py-8 px-6 sm:px-8 rise leading-snug">
        Built for <span className="inline-block" style={{ background: "rgb(60,100,255)", color: "#fff", padding: "0.05em 0.25em 0.1em", borderRadius: "6px" }}>teams</span> at scale
      </p>

      <GridRule />

      <div className="grid grid-cols-2 sm:grid-cols-4">
        {WHO.map((w, i) => (
          <div key={w.label}
            className="flex flex-col gap-4 px-5 sm:px-8 pt-7 pb-7 rise"
            style={{
              borderLeft: i % 2 !== 0 || i >= 2 ? "1px solid rgb(var(--line))" : undefined,
              borderTop: i >= 2 ? "1px solid rgb(var(--line))" : undefined,
              ["--rise-delay" as any]: `${i * 60}ms`,
            }}
          >
            <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-30 tabular-nums">{w.num}</span>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-medium tracking-tight text-[rgb(var(--fg))]">{w.label}</span>
              <span className="text-[12px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{w.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <GridRule />

      <p className="text-[clamp(2rem,5vw,3rem)] font-normal tracking-tight text-center text-[rgb(var(--muted))] py-6 sm:py-8 px-6 sm:px-8 rise leading-snug">
        Why it <span className="inline-block" style={{ background: "rgb(60,100,255)", color: "#fff", padding: "0.05em 0.25em 0.1em", borderRadius: "6px" }}>works</span> for your business
      </p>

      <GridRule />

      <div className="flex flex-col sm:flex-row">
        {VALUE_PROPS.map((v, i) => (
          <div key={v.title}
            className="flex-1 flex flex-col gap-5 px-6 sm:px-8 pt-8 pb-8 rise"
            style={{
              borderLeft: i > 0 ? "1px solid rgb(var(--line))" : undefined,
              borderTop: i > 0 ? "1px solid rgb(var(--line))" : undefined,
              ["--rise-delay" as any]: `${i * 80}ms`,
            }}
          >
            <div className="w-full">{v.sketch}</div>
            <div className="flex flex-col gap-2">
              <h3 className="text-[17px] sm:text-[18px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">{v.title}</h3>
              <p className="text-[13.5px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{v.body}</p>
            </div>
          </div>
        ))}
      </div>

      <GridRule />

      <p className="text-[clamp(2rem,5vw,3rem)] font-normal tracking-tight text-center text-[rgb(var(--muted))] py-6 sm:py-8 px-6 sm:px-8 rise leading-snug">
        How it <span className="inline-block" style={{ background: "rgb(60,100,255)", color: "#fff", padding: "0.05em 0.25em 0.1em", borderRadius: "6px" }}>works.</span> Four steps.
      </p>

      <GridRule />

      <div className="grid grid-cols-2 sm:grid-cols-4">
        {HOW_IT_WORKS.map((h, i) => (
          <div key={h.step}
            className="flex flex-col gap-4 px-5 sm:px-8 py-7 rise"
            style={{
              borderLeft: i % 2 !== 0 || i >= 2 ? "1px solid rgb(var(--line))" : undefined,
              borderTop: i >= 2 ? "1px solid rgb(var(--line))" : undefined,
              ["--rise-delay" as any]: `${i * 60}ms`,
            }}
          >
            <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-30 tabular-nums">{h.step}</span>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-medium tracking-tight text-[rgb(var(--fg))]">{h.title}</span>
              <span className="text-[12px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{h.body}</span>
            </div>
          </div>
        ))}
      </div>

      <GridRule />

      {/* What's included */}
      <div className="px-6 sm:px-8 py-10 rise">
        <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] mb-6" style={{ opacity: 0.5 }}>Everything in the standard Aether theme, plus:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3.5">
          {INCLUDED.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0 text-[rgb(var(--muted))]" style={{ opacity: 0.4 }} aria-hidden="true">
                <polyline points="2 8 6 12 14 4" />
              </svg>
              <span className="text-[13.5px] tracking-tight text-[rgb(var(--fg))]">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <GridRule />

      <p id="pricing" className="text-[clamp(2rem,5vw,3rem)] font-normal tracking-tight text-center text-[rgb(var(--muted))] py-6 sm:py-8 px-6 sm:px-8 rise leading-snug scroll-mt-16">
        Simple <span className="inline-block" style={{ background: "rgb(60,100,255)", color: "#fff", padding: "0.05em 0.25em 0.1em", borderRadius: "6px" }}>pricing.</span> No per-seat games.
      </p>

      <GridRule />

      <div className="flex flex-col sm:flex-row">
        {PLANS.map((plan, i) => (
          <Link
            key={plan.name}
            href={plan.href}
            className="group flex-1 flex flex-col justify-between gap-8 px-6 sm:px-8 pt-8 pb-8 transition-colors hover:bg-[rgb(var(--line))/0.06] rise"
            style={{
              borderLeft: i > 0 ? "1px solid rgb(var(--line))" : undefined,
              borderTop: i > 0 ? "1px solid rgb(var(--line))" : undefined,
              ["--rise-delay" as any]: `${i * 80}ms`,
            }}
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">{plan.name}</span>
                {plan.featured && (
                  <span className="text-[10px] tracking-tight font-medium px-2 pt-[3px] pb-[4px] leading-none text-[rgb(var(--bg))]" style={{ background: "rgb(var(--fg))", borderRadius: 3 }}>
                    Best value
                  </span>
                )}
              </div>
              <div>
                <p className="text-[2.6rem] font-normal tracking-[-0.05em] leading-none tabular-nums text-[rgb(var(--fg))]">
                  {plan.price}
                </p>
                <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] mt-2" style={{ opacity: 0.5 }}>{plan.term}</p>
              </div>
              <p className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))] border-t border-[rgb(var(--line))] pt-4">
                {plan.description}
              </p>
              <ul className="space-y-2.5">
                {plan.includes.map((line) => (
                  <li key={line} className="flex items-center gap-2.5 text-[12.5px] tracking-tight text-[rgb(var(--fg))]">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0 text-[rgb(var(--muted))]" style={{ opacity: 0.4 }} aria-hidden="true">
                      <polyline points="2 8 6 12 14 4" />
                    </svg>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between gap-2 mt-auto pt-4 border-t border-[rgb(var(--line))]">
              <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] transition-colors">
                {plan.cta}
              </span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="w-3.5 h-3.5 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60 transition-all duration-200 text-[rgb(var(--fg))]"
                aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <GridRule />

      <div className="px-6 sm:px-8 py-14 sm:py-16 flex flex-col items-center text-center rise">
        <h2 className="text-[clamp(1.6rem,4vw,2.8rem)] font-normal tracking-[-0.04em] leading-[1.08] text-[rgb(var(--fg))] mb-5 max-w-lg">
          Ready to ship more, build less?
        </h2>
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] mb-8 max-w-xs leading-[1.7]">
          We work with a small number of agencies. Serious about scaling, get in touch.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contact?ref=enterprise-cta"
            className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-5 py-2.5 text-[13px] font-medium tracking-tight hover:opacity-85 transition-opacity"
          >
            Talk to us
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
          <Link
            href="/aether"
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line))] px-5 py-2.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.3)] transition-colors"
          >
            View standard plans
          </Link>
        </div>
      </div>

      <GridRule />

      <footer className="px-6 sm:px-8 py-8 flex items-center justify-between gap-6 text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.6 }}>
        <Link href="/aether" className="hover:opacity-100 transition-opacity">Aether</Link>
        <Link href="/contact" className="hover:opacity-100 transition-opacity">Questions? Get in touch</Link>
      </footer>

    </main>
  );
}
