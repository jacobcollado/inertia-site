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
};

export function MobilePricing({
  tiers,
  rows,
}: {
  tiers: Tier[];
  rows: PricingRow[];
}) {
  const [active, setActive] = useState(0);
  const tier = tiers[active];
  const vals = [
    (r: PricingRow) => r.standard,
    (r: PricingRow) => r.lifetime,
    (r: PricingRow) => r.enterprise,
  ];
  const getVal = vals[active];

  return (
    <div className="flex flex-col sm:hidden">
      {/* Tab switcher */}
      <div className="flex border-b border-[rgb(var(--line))] relative">
        {tiers.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setActive(i)}
            className="flex-1 py-3 text-[12px] tracking-tight transition-colors [-webkit-tap-highlight-color:transparent]"
            style={{
              color: active === i ? "rgb(var(--fg))" : "rgb(var(--muted))",
              opacity: active === i ? 1 : 0.45,
              borderBottom: active === i ? "1px solid rgb(var(--fg))" : undefined,
              marginBottom: active === i ? -1 : undefined,
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Tier header */}
      <div className="px-6 py-6 flex flex-col gap-1 border-b border-[rgb(var(--line))]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] tracking-tight font-medium text-[rgb(var(--fg))]">{tier.name}</span>
          {tier.badge && (
            <span
              className="text-[10px] tracking-tight font-medium px-1.5 py-0.5 text-[rgb(var(--bg))]"
              style={{ background: "rgb(var(--fg))", borderRadius: 3 }}
            >
              {tier.badge}
            </span>
          )}
        </div>
        <span className="text-[2.2rem] font-[400] tracking-[-0.04em] leading-none tabular-nums text-[rgb(var(--fg))]">
          {tier.price}
        </span>
        <span className="text-[11px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.45 }}>
          {tier.term}
        </span>
      </div>

      {/* Feature rows */}
      <div className="flex flex-col">
        {rows.map((r) => {
          const val = getVal(r);
          return (
            <div
              key={r.label}
              className="flex items-center justify-between px-6 py-3.5 border-b border-[rgb(var(--line))]"
            >
              <span className="text-[12.5px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.65 }}>
                {r.label}
              </span>
              <span className="shrink-0 ml-4">
                {val === true ? (
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[rgb(var(--fg))]" style={{ opacity: 0.55 }} aria-hidden="true">
                    <polyline points="2 8 6 12 14 4" />
                  </svg>
                ) : val === false ? (
                  <span className="block w-3 h-px" style={{ background: "rgb(var(--line))" }} />
                ) : (
                  <span className="text-[12px] tracking-tight text-[rgb(var(--fg))]" style={{ opacity: 0.7 }}>
                    {val}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="px-6 py-6">
        <Link
          href={tier.name === "Enterprise" ? "/aether/enterprise" : `/aether/buy?tier=${tier.name.toLowerCase()}`}
          className="flex items-center justify-center gap-1.5 py-3 w-full text-[13px] tracking-tight font-medium border border-[rgb(var(--fg))] text-[rgb(var(--fg))] hover:opacity-60 transition-opacity"
        >
          {tier.name === "Enterprise" ? "Learn more" : "Get Aether"}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
