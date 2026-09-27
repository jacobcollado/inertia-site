import type { ReactNode } from "react";

/* The extras that come with a license: guides for getting the most out of the
 * store, and short lists of people we'd send a buyer to. Sits right before
 * pricing, so the value is stacked at the moment the price is read.
 *
 * Each card carries a small drawn "cover" so the bonuses read as real things
 * you get, not another feature list: guides as a sheet peeking up from the
 * card, lists as a short roster. Cards match the pricing include cards.
 */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

type Bonus = {
  title: string;
  desc: string;
  kind: "guide" | "list";
  icon: ReactNode;
  // Lists only: how many rows the roster cover shows.
  rows?: number;
};

const ICON = "size-4 shrink-0";

const BONUSES: Bonus[] = [
  {
    title: "Getting the most from Aether",
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

const BAR = "block h-[5px] rounded-full bg-[rgb(var(--fg)/0.12)]";

// A sheet peeking up from the bottom of the cover, with a second one fanned
// out behind it. The front sheet lifts a little when the card is hovered.
function GuideCover({ icon }: { icon: ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-7 h-[140%] w-[58%] -translate-x-1/2 rotate-[-5deg] rounded-lg bg-[rgb(var(--bg)/0.6)] shadow-[0_0_0_1px_rgb(var(--line))]"
      />
      <div
        className="absolute left-1/2 top-5 h-[140%] w-[58%] -translate-x-1/2 rounded-lg bg-[rgb(var(--bg))] p-3.5 shadow-[0_0_0_1px_rgb(var(--line)),0_10px_24px_-12px_rgb(0_0_0/0.25)] motion-safe:group-hover:-translate-y-1.5"
        style={{ transition: `transform 500ms ${EASE}` }}
      >
        <span className="flex size-7 items-center justify-center rounded-md bg-[rgb(var(--surface))] text-[rgb(var(--fg))]">
          {icon}
        </span>
        <span className={`${BAR} mt-3.5 w-[80%] !bg-[rgb(var(--fg)/0.22)]`} />
        <span className={`${BAR} mt-2 w-full`} />
        <span className={`${BAR} mt-1.5 w-[92%]`} />
        <span className={`${BAR} mt-1.5 w-[70%]`} />
      </div>
    </div>
  );
}

// A short roster: one row per entry, each with a mark, a name bar and a
// small check. The rows slide apart slightly on hover.
function ListCover({ icon, rows }: { icon: ReactNode; rows: number }) {
  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      <div className="flex w-full max-w-[15rem] flex-col gap-0.5 motion-safe:group-hover:gap-1.5 rounded-lg bg-[rgb(var(--bg))] p-2 shadow-[0_0_0_1px_rgb(var(--line)),0_10px_24px_-12px_rgb(0_0_0/0.25)]"
        style={{ transition: `gap 500ms ${EASE}` }}
      >
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-md px-2 py-2"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--surface))] text-[rgb(var(--fg))] [&_svg]:size-3">
              {icon}
            </span>
            <span className="flex-1">
              <span className={`${BAR} !bg-[rgb(var(--fg)/0.22)]`} style={{ width: `${[64, 48, 56][i % 3]}%` }} />
              <span className={`${BAR} mt-1.5`} style={{ width: `${[40, 52, 36][i % 3]}%` }} />
            </span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 shrink-0 text-[rgb(var(--muted))]" aria-hidden="true">
              <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

function BonusCard({ bonus, index }: { bonus: Bonus; index: number }) {
  const guide = bonus.kind === "guide";
  return (
    <li
      className={`group rise rise--liquid flex flex-col overflow-hidden rounded-xl bg-[rgb(var(--surface)/0.45)] ${
        guide ? "sm:col-span-2" : "sm:col-span-3"
      }`}
      style={{ "--rise-delay": `${80 + index * 60}ms` } as React.CSSProperties}
    >
      <div className="h-32 sm:h-36 overflow-hidden" aria-hidden="true">
        {guide ? <GuideCover icon={bonus.icon} /> : <ListCover icon={bonus.icon} rows={bonus.rows ?? 2} />}
      </div>
      <div className="flex flex-1 flex-col border-t border-[rgb(var(--line))] px-4 pt-4 pb-5 sm:px-5">
        <span className="text-[12px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))]">
          {guide ? "Guide" : "List"}
        </span>
        <p className="mt-1 text-[16px] sm:text-[17px] tracking-tight leading-snug text-[rgb(var(--fg))]">{bonus.title}</p>
        <p className="mt-1 text-[14px] sm:text-[15px] tracking-tight leading-snug text-[rgb(var(--muted))] [text-wrap:pretty]">
          {bonus.desc}
        </p>
      </div>
    </li>
  );
}

export function Bonuses() {
  return (
    <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-6">
      {BONUSES.map((b, i) => (
        <BonusCard key={b.title} bonus={b} index={i} />
      ))}
    </ul>
  );
}
