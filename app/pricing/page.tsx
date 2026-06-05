"use client";

import Link from "next/link";
import { useState } from "react";

const AETHER_TIERS = [
  {
    key: "standard",
    name: "Standard",
    price: "$85",
    term: "per year, single store",
    desc: "Everything you need to launch a high-converting Shopify store. Renews annually.",
    includes: [
      "Full Aether theme",
      "All 35 sections",
      "1 year of updates",
      "Single store licence",
      "Support via client portal",
    ],
    href: "/aether/buy?tier=standard",
    cta: "Get Standard",
  },
  {
    key: "lifetime",
    name: "Lifetime",
    price: "$105",
    term: "one-time, single store",
    desc: "Pay once, own it forever. Every update we ever ship, included at no extra cost.",
    includes: [
      "Full Aether theme",
      "All 35 sections",
      "Lifetime updates",
      "Single store licence",
      "Priority support",
    ],
    href: "/aether/buy?tier=lifetime",
    cta: "Get Lifetime",
    badge: "Best value",
  },
];

const SERVICES = [
  { name: "Custom Shopify store",  desc: "Full storefront design and development. Brand, content, and launch included.",      tags: ["Shopify", "Design", "Dev"] },
  { name: "Brand + web project",   desc: "Identity, positioning, and a web presence built around it. Logo to live site.",      tags: ["Brand", "Web"] },
  { name: "Framer site",           desc: "Fast, polished marketing sites. Ideal for startups and product launches.",           tags: ["Framer", "Web"] },
  { name: "Mobile app",            desc: "iOS and Android apps designed and built to production. Custom builds only.",         tags: ["iOS", "Android"] },
];

export default function PricingPage() {
  const [active, setActive] = useState<"standard" | "lifetime">("lifetime");
  const tier = AETHER_TIERS.find((t) => t.key === active)!;

  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-3 pt-16 sm:pt-24 pb-14 rise">
        <h1 className="text-[clamp(2.6rem,6vw,4rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-4">
          Pricing
        </h1>
        <p className="text-[clamp(1rem,1.8vw,1.15rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md mb-8" style={{ opacity: 0.7 }}>
          Set prices for Aether. Quote-based for everything else.
        </p>

        {/* Toggle */}
        <div className="inline-flex items-center rounded-full border border-[rgb(var(--line))] p-1 gap-1">
          {AETHER_TIERS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key as "standard" | "lifetime")}
              className="rounded-full px-5 py-2 text-[13px] tracking-tight font-medium transition-all duration-200"
              style={{
                background: active === t.key ? "rgb(var(--fg))" : "transparent",
                color: active === t.key ? "rgb(var(--bg))" : "rgb(var(--muted))",
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Aether tier card */}
      <section className="px-3 pt-16 sm:pt-24 pb-14 rise">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl border border-[rgb(var(--line))] p-8 sm:p-12 flex flex-col gap-8"
            style={{ background: "rgb(var(--surface))" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">{tier.name}</span>
                  {tier.badge && (
                    <span className="text-[10px] tracking-tight font-medium px-2 py-1 rounded-full text-[rgb(var(--bg))]" style={{ background: "var(--accent-gradient)" }}>{tier.badge}</span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[3.5rem] font-normal tracking-[-0.05em] leading-none tabular-nums text-[rgb(var(--fg))]">{tier.price}</span>
                  <span className="text-[14px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>{tier.term}</span>
                </div>
                <p className="text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm">{tier.desc}</p>
              </div>
              <Link
                href={tier.href}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium tracking-tight text-[rgb(var(--bg))] hover:opacity-85 transition-opacity shrink-0"
                style={{ background: "var(--accent-gradient)" }}
              >
                {tier.cta}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>

            <div className="border-t border-[rgb(var(--line))] pt-6">
              <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] mb-4" style={{ opacity: 0.45 }}>What&apos;s included</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tier.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[14px] tracking-tight text-[rgb(var(--muted))]">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0" style={{ color: "rgb(var(--accent))" }}><polyline points="2 8 6 12 14 4" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Services + Enterprise */}
      <section className="px-3 pt-16 sm:pt-24 pb-14 rise">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10">
          <div className="flex flex-col gap-2">
            <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">Services</p>
            <p className="text-[15px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.6 }}>Custom work, priced per project.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight text-[rgb(var(--bg))] hover:opacity-85 transition-opacity shrink-0"
            style={{ background: "var(--accent-gradient)" }}
          >
            Get a quote
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[rgb(var(--line))]">
          {SERVICES.map((s) => (
            <div key={s.name} className="flex flex-col gap-3 p-7 bg-[rgb(var(--bg))] hover:bg-[rgb(var(--surface))] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <p className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))]">{s.name}</p>
                <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] shrink-0 mt-0.5" style={{ opacity: 0.45 }}>Quote-based</span>
              </div>
              <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{s.desc}</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {s.tags.map((tag) => (
                  <span key={tag} className="text-[11px] tracking-tight text-[rgb(var(--muted))] border border-[rgb(var(--line))] rounded-full px-2.5 py-1">{tag}</span>
                ))}
              </div>
            </div>
          ))}
          {/* Enterprise cell */}
          <Link href="/aether/enterprise" className="group flex flex-col gap-3 p-7 bg-[rgb(var(--bg))] hover:bg-[rgb(var(--surface))] transition-colors">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))]">Aether Enterprise</p>
              <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] shrink-0 mt-0.5" style={{ opacity: 0.45 }}>From $59 / store</span>
            </div>
            <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">Per-store or unlimited licensing for agencies and studios deploying Aether at scale.</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {["Commercial rights", "Unlimited option", "Dedicated support"].map((tag) => (
                <span key={tag} className="text-[11px] tracking-tight text-[rgb(var(--muted))] border border-[rgb(var(--line))] rounded-full px-2.5 py-1">{tag}</span>
              ))}
            </div>
          </Link>
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* CTA */}
      <section className="flex flex-col items-center text-center px-3 py-16 sm:py-24 gap-5 rise">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">Not sure where to start?</p>
        <p className="text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm" style={{ opacity: 0.6 }}>
          Tell us what you're building and we'll figure out the right fit together.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight text-[rgb(var(--bg))] hover:opacity-85 transition-opacity"
            style={{ background: "var(--accent-gradient)" }}
          >
            Start a conversation
          </Link>
          <Link
            href="/aether"
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line))] px-5 py-2.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          >
            Explore Aether
          </Link>
        </div>
      </section>

    </main>
  );
}
