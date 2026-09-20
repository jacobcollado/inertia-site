"use client";

import { type ReactNode } from "react";

/* Aether against the two things a buyer is actually choosing between: the
 * free theme their store ships with, and the paid themes they're browsing.
 * Neither is named. A named competitor's feature set changes without warning,
 * which turns an accurate table into an inaccurate claim about a real company.
 */

type Cell = boolean | string;

interface Row {
  label: string;
  detail: string;
  aether: Cell;
  others: Cell;
  shopify: Cell;
}

const ROWS: Row[] = [
  {
    label: "Price",
    detail: "What you pay to start",
    aether: "$125 once",
    others: "$180–400",
    shopify: "Free",
  },
  {
    label: "Updates",
    detail: "When the next version ships",
    aether: "Lifetime",
    others: "Paid",
    shopify: "Included",
  },
  {
    label: "Subscription",
    detail: "Recurring cost to keep using it",
    aether: false,
    others: "Sometimes",
    shopify: false,
  },
  {
    label: "Sections",
    detail: "Layouts available out of the box",
    aether: "41",
    others: "15–25",
    shopify: "12",
  },
  {
    label: "Sticky cart",
    detail: "Add to cart follows the scroll",
    aether: true,
    others: "Varies",
    shopify: false,
  },
  {
    label: "Upsell in cart",
    detail: "Raise order value at the decision",
    aether: true,
    others: "Paid app",
    shopify: "Paid app",
  },
  {
    label: "SMS + email capture",
    detail: "Built in, styled to match",
    aether: true,
    others: "Paid app",
    shopify: "Paid app",
  },
  {
    label: "Support",
    detail: "Who answers when it breaks",
    aether: "The builders",
    others: "Tickets",
    shopify: "Forum",
  },
];

function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
      <polyline points="2.5 8.5 6 12 13.5 4.5" />
    </svg>
  );
}

function Dash() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="size-4" aria-hidden="true">
      <line x1="4" y1="8" x2="12" y2="8" />
    </svg>
  );
}

/* A cell renders as a mark when the answer is simply yes or no, and as text
 * when the honest answer is a number or a qualifier. Mixing the two in one
 * column is deliberate: a table of all checkmarks reads as marketing, a table
 * that says "Varies" where it varies reads as true. */
function Value({ value, emphasis }: { value: Cell; emphasis?: boolean }) {
  if (value === true) {
    return (
      <span className={emphasis ? "text-[rgb(var(--green))]" : "text-[rgb(var(--muted))]"}>
        <Check />
        <span className="sr-only">Yes</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="text-[rgb(var(--muted))] opacity-40">
        <Dash />
        <span className="sr-only">No</span>
      </span>
    );
  }
  return (
    <span
      className={`text-center text-[12px] leading-tight tracking-tight [text-wrap:balance] sm:text-[15px] ${
        emphasis ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))]"
      }`}
    >
      {value}
    </span>
  );
}

function HeadCell({ children, emphasis }: { children: ReactNode; emphasis?: boolean }) {
  return (
    <div
      className={`px-1 pb-4 text-center text-[12px] leading-tight tracking-tight [text-wrap:balance] sm:px-4 sm:text-[15px] ${
        emphasis ? "font-medium text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))]"
      }`}
    >
      {children}
    </div>
  );
}

export function Comparison() {
  return (
    <div className="mx-auto w-full max-w-[56rem]">
      {/* One grid, not a <table>: the row labels need to sit in a left column
          that collapses to a narrower share on mobile, and the Aether column
          needs a continuous highlight running the full height behind it,
          which table cells can't carry without per-cell backgrounds.

          The column ratios live in CSS variables so the highlight below can be
          positioned from the same numbers the grid is built from, rather than
          duplicating them as literals that drift apart on the next edit. */}
      <div
        className={
          // Ratios are declared once per breakpoint as variables, then consumed
          // by both the track and the highlight, so the two can't drift.
          "relative grid " +
          // Mobile gives the label column less room than desktop: the values
          // are short but fixed, whereas the label can wrap to two lines
          // gracefully. 1.1 + 3x1 keeps every value on one line at 360px.
          "[--c-label:1.1fr] [--c-col:1fr] [--col-w:calc(1/4.1*100%)] [--col-x:calc(1.1/4.1*100%)] " +
          "sm:[--c-label:1.8fr] sm:[--c-col:1fr] sm:[--col-w:calc(1/4.8*100%)] sm:[--col-x:calc(1.8/4.8*100%)] " +
          "[grid-template-columns:var(--c-label)_var(--c-col)_var(--c-col)_var(--c-col)]"
        }
      >
        {/* The Aether column's highlight, drawn once behind all rows so its
            edges stay unbroken instead of stacking per-row seams. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-[var(--col-x)] w-[var(--col-w)] rounded-xl bg-[rgb(var(--surface)/0.5)]"
        />

        {/* Header */}
        <div className="rise rise--liquid" />
        <div className="rise rise--liquid relative" style={{ "--rise-delay": "80ms" } as React.CSSProperties}>
          <HeadCell emphasis>Aether</HeadCell>
        </div>
        <div className="rise rise--liquid" style={{ "--rise-delay": "120ms" } as React.CSSProperties}>
          <HeadCell>Others</HeadCell>
        </div>
        <div className="rise rise--liquid" style={{ "--rise-delay": "160ms" } as React.CSSProperties}>
          <HeadCell>Default</HeadCell>
        </div>

        {ROWS.map((row, i) => {
          const delay = 180 + i * 45;
          const cellBase =
            "relative flex items-center justify-center border-t border-[rgb(var(--line))] px-1 py-4 sm:px-4 sm:py-5";
          return (
            <div key={row.label} className="contents">
              <div
                className={`rise rise--liquid border-t border-[rgb(var(--line))] py-4 pr-2 sm:py-5 sm:pr-4`}
                style={{ "--rise-delay": `${delay}ms` } as React.CSSProperties}
              >
                <p className="text-[14px] sm:text-[16px] tracking-tight text-[rgb(var(--fg))]">{row.label}</p>
                <p className="mt-0.5 hidden text-[13px] tracking-tight leading-snug text-[rgb(var(--muted))] sm:block" style={{ opacity: 0.7 }}>
                  {row.detail}
                </p>
              </div>
              <div className={`rise rise--liquid ${cellBase}`} style={{ "--rise-delay": `${delay + 20}ms` } as React.CSSProperties}>
                <Value value={row.aether} emphasis />
              </div>
              <div className={`rise rise--liquid ${cellBase}`} style={{ "--rise-delay": `${delay + 40}ms` } as React.CSSProperties}>
                <Value value={row.others} />
              </div>
              <div className={`rise rise--liquid ${cellBase}`} style={{ "--rise-delay": `${delay + 60}ms` } as React.CSSProperties}>
                <Value value={row.shopify} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[12px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.55 }}>
        Comparison reflects common paid Shopify themes and the default Shopify theme as of September 2026.
      </p>
    </div>
  );
}
