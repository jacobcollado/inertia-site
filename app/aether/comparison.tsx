"use client";

import { useState } from "react";
import { AETHER_LIQUID_EASE, AETHER_LIQUID_MS } from "./motion";

/* Aether against one alternative at a time: the paid themes a buyer is
 * browsing, or the free theme their store ships with. Showing both at once
 * turned into a long checklist that repeated the features and pricing around
 * it, so each view keeps only the rows where that alternative actually
 * differs. Neither alternative is named. A named competitor's feature set
 * changes without warning, which turns an accurate table into an inaccurate
 * claim about a real company.
 */

interface Row {
  label: string;
  aether: string;
  them: string;
}

const VIEWS = [
  {
    id: "paid",
    tab: "Paid themes",
    rows: [
      { label: "Price", aether: "$125 once", them: "$180–400" },
      { label: "Sections", aether: "41", them: "15–25" },
      { label: "Updates", aether: "Included for life", them: "Paid" },
      { label: "Upsells and SMS/email capture", aether: "Built in", them: "Paid apps" },
      { label: "Support", aether: "The people who built it", them: "Ticket queue" },
    ],
  },
  {
    id: "default",
    tab: "Shopify's free theme",
    rows: [
      { label: "Sections", aether: "41", them: "12" },
      { label: "Sticky add to cart", aether: "Built in", them: "Not included" },
      { label: "Upsells and SMS/email capture", aether: "Built in", them: "Paid apps" },
      { label: "Support", aether: "The people who built it", them: "Community forum" },
    ],
  },
] as const satisfies readonly { id: string; tab: string; rows: readonly Row[] }[];

export function Comparison() {
  const [index, setIndex] = useState(0);
  const view = VIEWS[index];

  return (
    <div className="mx-auto w-full max-w-[44rem]">
      <div className="rise rise--liquid flex justify-center">
        <div
          role="tablist"
          aria-label="Compare Aether with"
          className="relative grid grid-cols-2 rounded-full bg-[rgb(var(--surface)/0.45)] p-1"
        >
          {/* Sliding indicator: both tabs share one width, so it only needs to
              move by its own width. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-[rgb(var(--bg))] motion-reduce:transition-none"
            style={{
              transform: `translateX(${index * 100}%)`,
              transition: `transform ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`,
            }}
          />
          {VIEWS.map((v, i) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              id={`compare-tab-${v.id}`}
              aria-selected={i === index}
              aria-controls="compare-panel"
              onClick={() => setIndex(i)}
              className={`relative h-9 whitespace-nowrap px-4 text-[13px] tracking-tight transition-colors [-webkit-tap-highlight-color:transparent] sm:px-5 sm:text-[14px] ${
                i === index ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
              }`}
            >
              {v.tab}
            </button>
          ))}
        </div>
      </div>

      <div
        id="compare-panel"
        role="tabpanel"
        aria-labelledby={`compare-tab-${view.id}`}
        className="rise rise--liquid mt-10"
        style={{ "--rise-delay": "80ms" } as React.CSSProperties}
      >
        <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-3 pb-3 text-[12px] tracking-tight text-[rgb(var(--muted))] sm:gap-x-6 sm:text-[13px]">
          <span />
          <span className="text-[rgb(var(--fg))]">Aether</span>
          <span>{view.tab}</span>
        </div>
        {/* Keyed by view so the rows fade in fresh on each switch. */}
        <div key={view.id} className="animate-in fade-in duration-500 motion-reduce:animate-none">
          {view.rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-3 border-t border-[rgb(var(--line))] py-4 text-[14px] leading-snug tracking-tight sm:gap-x-6 sm:py-5 sm:text-[16px]"
            >
              <span className="text-[rgb(var(--muted))]">{row.label}</span>
              <span className="text-[rgb(var(--fg))]">{row.aether}</span>
              <span className="text-[rgb(var(--muted))]">{row.them}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-[12px] tracking-tight text-[rgb(var(--muted))] sm:text-[13px]" style={{ opacity: 0.55 }}>
        Comparison reflects common paid Shopify themes and the default Shopify theme as of September 2026.
      </p>
    </div>
  );
}
