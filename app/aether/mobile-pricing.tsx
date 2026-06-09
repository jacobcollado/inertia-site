"use client";

import Link from "next/link";
import { useState } from "react";

type PricingRow = {
  label: string;
  standard: boolean | string;
  lifetime: boolean | string;
  enterprise: boolean | string;
};

type Tier = {
  name: string;
  price: string;
  term: string;
  badge?: string;
  color: string;
};

const TAGLINES: Record<string, string> = {
  Standard: "Everything you need to launch. Renews when you're ready.",
  Lifetime: "Pay once, own it forever. Every update we ever ship, included.",
  Enterprise: "Multi-store or custom deployment. Built around your operation.",
};

export function MobilePricing({
  tiers,
  rows,
}: {
  tiers: Tier[];
  rows: PricingRow[];
}) {
  const [active, setActive] = useState(1);
  const tier = tiers[active];
  const getVal = [
    (r: PricingRow) => r.standard,
    (r: PricingRow) => r.lifetime,
    (r: PricingRow) => r.enterprise,
  ][active];

  return (
    <div className="flex flex-col gap-4">
      {/* Pill tabs */}
      <div className="inline-flex items-center self-center rounded-full border border-[rgb(var(--line))] p-1 gap-1">
        {tiers.map((t, i) => {
          const isActive = active === i;
          return (
            <button
              key={t.name}
              onClick={() => setActive(i)}
              className="rounded-full px-4 py-1.5 text-[13px] sm:text-[14px] font-medium tracking-tight transition-all duration-200 [-webkit-tap-highlight-color:transparent]"
              style={{
                background: isActive ? "var(--accent-gradient)" : "transparent",
                color: isActive ? "#fff" : "rgb(var(--muted))",
              }}
            >
              {t.name}
            </button>
          );
        })}
      </div>

      {/* Card */}
      <div
        className="rounded-2xl border border-[rgb(var(--line))] p-6 sm:p-8 flex flex-col gap-5 sm:gap-6"
        style={{ background: "rgb(var(--surface))" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[15px] sm:text-[17px] font-medium tracking-tight text-[rgb(var(--accent))]">{tier.name}</span>
              {tier.badge && (
                <span className="text-[10px] font-medium tracking-tight px-2 py-0.5 rounded-full text-[rgb(var(--bg))]" style={{ background: "var(--accent-gradient)" }}>{tier.badge}</span>
              )}
            </div>
            <span className="text-[13px] sm:text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.65 }}>
              {TAGLINES[tier.name]}
            </span>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[2.4rem] sm:text-[3rem] font-normal tabular-nums tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">{tier.price}</span>
            <span className="text-[11px] sm:text-[12px] tracking-tight text-[rgb(var(--muted))] text-right leading-snug mt-1" style={{ opacity: 0.4 }}>{tier.term}</span>
          </div>
        </div>

        {/* Feature rows */}
        <ul className="flex flex-col gap-2.5 border-t border-[rgb(var(--line)/0.5)] pt-4 sm:pt-5">
          {rows.map((r) => {
            const val = getVal(r);
            return (
              <li key={r.label} className="flex items-center justify-between gap-4 py-0.5" style={{ opacity: val === false ? 0.3 : 1 }}>
                <span className="text-[13px] sm:text-[14px] tracking-tight" style={{ color: val === false ? "rgb(var(--muted))" : "rgb(var(--fg))" }}>{r.label}</span>
                <span className="shrink-0">
                  {val === true ? (
                    <svg viewBox="0 0 16 16" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[rgb(var(--accent))]">
                      <polyline points="2 8 6 12 14 4" />
                    </svg>
                  ) : val === false ? (
                    <svg viewBox="0 0 16 16" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[rgb(var(--muted))]">
                      <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
                    </svg>
                  ) : (
                    <span className="text-[12.5px] sm:text-[13px] tracking-tight font-medium text-[rgb(var(--fg))]">{val}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <Link
          href={tier.name === "Enterprise" ? "/aether/commercial" : "/aether/buy"}
          className="flex items-center justify-center gap-1.5 rounded-full py-3 text-[14px] font-medium tracking-tight transition-opacity hover:opacity-80 text-[rgb(var(--bg))]"
          style={{ background: "var(--accent-gradient)" }}
        >
          {tier.name === "Enterprise" ? "Contact us" : `Get ${tier.name}`}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/></svg>
        </Link>
      </div>
    </div>
  );
}
