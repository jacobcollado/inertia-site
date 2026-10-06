import { INK } from "@/components/material-art";
import { Box, LINE, LineBoard } from "@/components/line-art";

/* The extras that come with a license: guides for getting the most out of the
 * store, and short lists of people we'd send a buyer to. Sits right before
 * pricing, so the value is stacked at the moment the price is read.
 *
 * Laid out like the sections above it: the heading and one line (with the
 * total) on the left, then each bonus as a line drawing on a plain tile (the
 * site's line kit, components/line-art.tsx) with its title and worth under
 * it and the description below. Guides are drawn as booklets with their
 * subject on the cover, lists as a short stack of people, each checked.
 */

type Bonus = {
  title: string;
  desc: string;
  kind: "guide" | "list";
  /** What it would cost on its own, in USD. Summed into BONUS_TOTAL, which
   * the pricing block also shows. */
  worth: number;
  // Lists only: how many rows the drawing shows.
  rows?: number;
  // Guides only: the word on the booklet's cover.
  cover?: string;
};

const BONUSES: Bonus[] = [
  {
    title: "Getting the most from Aether",
    worth: 29,
    desc: "Which sections to use where, and the settings most stores never touch.",
    kind: "guide",
    cover: "Aether",
  },
  {
    title: "Shooting your products",
    worth: 39,
    desc: "Lighting, angles and backgrounds for clean shots, on a phone or a camera.",
    kind: "guide",
    cover: "Product photos",
  },
  {
    title: "Imagery that converts",
    worth: 39,
    desc: "The kinds of photos that sell best on product and collection pages, and why.",
    kind: "guide",
    cover: "Imagery",
  },
  {
    title: "Manufacturers we trust",
    worth: 39,
    desc: "The two manufacturers we've worked with and can recommend.",
    kind: "list",
    rows: 2,
  },
  {
    title: "Designers we trust",
    worth: 44,
    desc: "Designers for your logo, graphics and product artwork.",
    kind: "list",
    rows: 3,
  },
];

const FONT = { fontFamily: "var(--font-satoshi), sans-serif", fontWeight: 450 } as const;

// A guide: a booklet standing on the tile, its subject on the cover over a
// few lines of contents.
function Booklet({ title }: { title: string }) {
  return (
    <LineBoard>
      <Box x={128} y={84} w={144} h={168} d={0.05} light />
      <Box x={120} y={92} w={144} h={168} d={0.05} />
      <text x={136} y={124} fontSize={15} fill={INK} style={FONT}>{title}</text>
      {[150, 162, 174].map((y, i) => (
        <line key={y} x1={136} y1={y} x2={136 + [96, 108, 70][i]} y2={y} {...LINE} strokeOpacity={0.32} />
      ))}
    </LineBoard>
  );
}

// A list: a short stack of people, each with an avatar, a name line and a
// check.
function Roster({ rows }: { rows: number }) {
  const H = 34, G = 10;
  const top = 150 - (rows * H + (rows - 1) * G) / 2;
  return (
    <LineBoard>
      {Array.from({ length: rows }, (_, i) => {
        const y = top + i * (H + G);
        return (
          <g key={i}>
            <Box x={96} y={y} w={208} h={H} d={0.04} />
            <circle cx={116} cy={y + H / 2} r={8} fill="none" {...LINE} />
            <line x1={134} y1={y + H / 2} x2={214} y2={y + H / 2} {...LINE} strokeOpacity={0.4} />
            <polyline points={`${276},${y + H / 2} ${281},${y + H / 2 + 5} ${290},${y + H / 2 - 5}`} fill="none" {...LINE} />
          </g>
        );
      })}
    </LineBoard>
  );
}

function BonusCard({ bonus }: { bonus: Bonus }) {
  const guide = bonus.kind === "guide";
  return (
    <li className={`flex w-[80%] shrink-0 snap-start flex-col sm:w-auto ${guide ? "sm:col-span-2" : "sm:col-span-3"}`}>
      <div className={`overflow-hidden rounded-[6px] bg-[var(--tile)] ${guide ? "aspect-[4/3]" : "aspect-[4/3] sm:aspect-[2/1]"}`}>
        {guide ? <Booklet title={bonus.cover ?? bonus.title} /> : <Roster rows={bonus.rows ?? 2} />}
      </div>
      <div className="mt-4 flex items-baseline gap-3">
        <p className="flex-1 text-[17px] sm:text-[19px] tracking-[-0.02em] leading-snug text-[rgb(var(--fg))]" style={{ fontWeight: 500 }}>
          {bonus.title}
        </p>
        <span className="shrink-0 text-[13px] sm:text-[14px] tabular-nums tracking-tight text-[rgb(var(--muted))]">Worth ${bonus.worth}</span>
      </div>
      <p className="mt-1 text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
        <span className="text-[rgb(var(--fg))] opacity-60">{guide ? "Guide" : "List"} · </span>
        {bonus.desc}
      </p>
    </li>
  );
}

export const BONUS_TOTAL = BONUSES.reduce((sum, b) => sum + b.worth, 0);

export function Bonuses() {
  return (
    <section className="rise rise-stagger mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] py-16 sm:py-24">
      <div className="mb-10 sm:mb-12">
        <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-[1.1] text-[rgb(var(--fg))]">
          Bonuses, included with purchase
        </h2>
        <p className="mt-2 max-w-lg text-[15.5px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
          <span className="tabular-nums text-[rgb(var(--fg))]">${BONUS_TOTAL}</span> in guides and lists, free with every license.
        </p>
      </div>
      {/* Three guides across, then the two lists across, from sm up. Phones:
          one row that swipes sideways, each bonus most of the screen wide so
          the next one peeks in. */}
      <ul data-stagger className="no-scrollbar -mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-3 px-3 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:grid-cols-6 sm:gap-x-4 sm:gap-y-10">
        {BONUSES.map((b) => (
          <BonusCard key={b.title} bonus={b} />
        ))}
      </ul>
    </section>
  );
}
