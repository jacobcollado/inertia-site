import type { ReactNode } from "react";
import { IllustratedCard, RosterCover, SheetCover } from "@/components/illustrated-card";

/* The extras that come with a license: guides for getting the most out of the
 * store, and short lists of people we'd send a buyer to. Sits right before
 * pricing, so the value is stacked at the moment the price is read.
 *
 * Each card carries a small drawn "cover" so the bonuses read as real things
 * you get, not another feature list: guides as a sheet peeking up from the
 * card, lists as a short roster. Cards match the pricing include cards.
 * The card and covers live in components/illustrated-card.
 */

type Bonus = {
  title: string;
  desc: string;
  kind: "guide" | "list";
  /** What it would cost on its own, in USD. Summed into BONUS_TOTAL, which
   * the pricing block also shows. */
  worth: number;
  icon: ReactNode;
  // Lists only: how many rows the roster cover shows.
  rows?: number;
};

// Sized by the chip that holds it, see components/illustrated-card.
const ICON = "shrink-0";

const BONUSES: Bonus[] = [
  {
    title: "Getting the most from Aether",
    worth: 29,
    desc: "Which sections to use where, and the settings most stores never touch.",
    kind: "guide",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={ICON} aria-hidden="true">
        <path d="M8 1.5 9.6 6.4 14.5 8 9.6 9.6 8 14.5 6.4 9.6 1.5 8 6.4 6.4Z" />
      </svg>
    ),
  },
  {
    title: "Shooting your products",
    worth: 39,
    desc: "Lighting, angles and backgrounds for clean shots, on a phone or a camera.",
    kind: "guide",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={ICON} aria-hidden="true">
        <path d="M1.5 5.5A1.5 1.5 0 0 1 3 4h1.8l1.2-1.8h4l1.2 1.8H13a1.5 1.5 0 0 1 1.5 1.5v6.5A1.5 1.5 0 0 1 13 13.5H3A1.5 1.5 0 0 1 1.5 12Z" />
        <circle cx="8" cy="8.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Imagery that converts",
    worth: 39,
    desc: "The kinds of photos that sell best on product and collection pages, and why.",
    kind: "guide",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={ICON} aria-hidden="true">
        <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
        <circle cx="5.5" cy="6" r="1.2" />
        <path d="m14.5 10.5-3.5-3.5-7.5 6.5" />
      </svg>
    ),
  },
  {
    title: "Manufacturers we trust",
    worth: 39,
    desc: "The two manufacturers we've worked with and can recommend.",
    kind: "list",
    rows: 2,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={ICON} aria-hidden="true">
        <path d="M1.5 14.5V7l4 2.5V7l4 2.5V3.5h5v11Z" />
      </svg>
    ),
  },
  {
    title: "Designers we trust",
    worth: 44,
    desc: "Designers for your logo, graphics and product artwork.",
    kind: "list",
    rows: 3,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={ICON} aria-hidden="true">
        <path d="M11 1.8 14.2 5 5.5 13.7l-3.9.7.7-3.9Z" />
      </svg>
    ),
  },
];

function BonusCard({ bonus, index }: { bonus: Bonus; index: number }) {
  const guide = bonus.kind === "guide";
  return (
    <IllustratedCard
      as="li"
      compactOnMobile
      className={`rise rise--liquid ${index === 0 ? "col-span-2" : ""} ${guide ? "sm:col-span-2" : "sm:col-span-3"}`}
      style={{ "--rise-delay": `${80 + index * 60}ms` } as React.CSSProperties}
      cover={guide ? <SheetCover icon={bonus.icon} /> : <RosterCover icon={bonus.icon} rows={bonus.rows ?? 2} />}
      eyebrow={guide ? "Guide" : "List"}
      meta={`Worth $${bonus.worth}`}
      title={bonus.title}
      desc={bonus.desc}
    />
  );
}

export const BONUS_TOTAL = BONUSES.reduce((sum, b) => sum + b.worth, 0);

export function Bonuses() {
  return (
    <div className="w-full">
      {/* Phones: two up, the first guide full width so the five fill three
          rows (one, then two guides, then two lists). */}
      <ul className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-6 sm:gap-3">
        {BONUSES.map((b, i) => (
          <BonusCard key={b.title} bonus={b} index={i} />
        ))}
      </ul>
      <p
        className="rise rise--liquid mt-6 text-center text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))]"
        style={{ "--rise-delay": "400ms" } as React.CSSProperties}
      >
        <span className="tabular-nums text-[rgb(var(--fg))]">${BONUS_TOTAL}</span> in bonuses, free with every license.
      </p>
    </div>
  );
}
