"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/* Illustrated card: a card with a small drawn cover on top and a text block
 * underneath. The cover is an abstract UI illustration built from skeleton
 * bars, so the card reads as a real thing you get rather than a feature
 * bullet. First used for the Aether bonuses. See docs/design-system.md.
 *
 * Covers:
 * - SheetCover: a document peeking up from the bottom, with a second sheet
 *   fanned out behind it. The front sheet lifts on hover.
 * - RosterCover: a short list, one row per entry with a mark, two bars and a
 *   check. The rows spread apart on hover.
 *
 * Cover motion keys off the card's `group` class: `group-hover` with a
 * pointer, and `group-data-[play]` on touch screens, where the card sets
 * data-play while it's mostly in view. So covers only animate inside an
 * IllustratedCard (or any other `group` parent that does the same).
 */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** One skeleton line. Pair with a width and, for headings, the stronger fill. */
export const ILLUSTRATION_BAR = "block h-[5px] rounded-full bg-[rgb(var(--fg)/0.12)]";
const BAR_STRONG = "!bg-[rgb(var(--fg)/0.22)]";

const PANEL_SHADOW = "shadow-[0_0_0_1px_rgb(var(--line)),0_10px_24px_-12px_rgb(0_0_0/0.25)]";

export function SheetCover({ icon }: { icon: ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-7 h-[140%] w-[58%] -translate-x-1/2 rotate-[-5deg] rounded-[6px] bg-[rgb(var(--bg)/0.6)] shadow-[0_0_0_1px_rgb(var(--line))]"
      />
      <div
        className={`absolute left-1/2 top-5 h-[140%] w-[58%] -translate-x-1/2 rounded-[6px] bg-[rgb(var(--bg))] p-3.5 ${PANEL_SHADOW} motion-safe:group-hover:-translate-y-1.5 motion-safe:group-data-[play]:-translate-y-1.5`}
        style={{ transition: `transform 500ms ${EASE}` }}
      >
        <span className="flex size-7 items-center justify-center rounded-[6px] [&_svg]:size-[57%] bg-[rgb(var(--surface))] text-[rgb(var(--fg))]">
          {icon}
        </span>
        <span className={`${ILLUSTRATION_BAR} mt-3.5 w-[80%] ${BAR_STRONG}`} />
        <span className={`${ILLUSTRATION_BAR} mt-2 w-full`} />
        <span className={`${ILLUSTRATION_BAR} mt-1.5 w-[92%]`} />
        <span className={`${ILLUSTRATION_BAR} mt-1.5 w-[70%]`} />
      </div>
    </div>
  );
}

export function RosterCover({ icon, rows = 2 }: { icon: ReactNode; rows?: number }) {
  return (
    <div className="flex h-full w-full items-center justify-center px-3 sm:px-6">
      <div
        className={`flex w-full max-w-[15rem] flex-col gap-0.5 motion-safe:group-hover:gap-1.5 motion-safe:group-data-[play]:gap-1.5 rounded-[6px] bg-[rgb(var(--bg))] p-2 ${PANEL_SHADOW}`}
        style={{ transition: `gap 500ms ${EASE}` }}
      >
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-2.5 rounded-[6px] px-1.5 py-1 sm:px-2 sm:py-2">
            <span className="flex size-5 sm:size-6 shrink-0 items-center justify-center rounded-[6px] bg-[rgb(var(--surface))] text-[rgb(var(--fg))] [&_svg]:size-[50%]">
              {icon}
            </span>
            <span className="flex-1">
              <span className={`${ILLUSTRATION_BAR} ${BAR_STRONG}`} style={{ width: `${[64, 48, 56][i % 3]}%` }} />
              <span className={`${ILLUSTRATION_BAR} mt-1.5`} style={{ width: `${[40, 52, 36][i % 3]}%` }} />
            </span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[1em] shrink-0 text-[14px] text-[rgb(var(--muted))]" aria-hidden="true">
              <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

type IllustratedCardProps = {
  cover: ReactNode;
  title: ReactNode;
  desc?: ReactNode;
  /** Small muted label above the title, left side (e.g. "Guide"). */
  eyebrow?: ReactNode;
  /** Small muted label above the title, right side (e.g. "Worth $29"). */
  meta?: ReactNode;
  /** Below sm: shorter cover, tighter padding, description hidden. For
   * cards laid out two up on phones. */
  compactOnMobile?: boolean;
  as?: "li" | "div" | "article";
  className?: string;
  style?: CSSProperties;
};

export function IllustratedCard({
  cover,
  title,
  desc,
  eyebrow,
  meta,
  compactOnMobile = false,
  as: Tag = "div",
  className = "",
  style,
}: IllustratedCardProps) {
  const ref = useRef<HTMLElement>(null);

  // Touch screens can't hover, so play the hover state as the card scrolls
  // in, and reset it once the card is fully out so it plays again.
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: none)").matches) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (entry.intersectionRatio >= 0.6) {
          // A beat after it settles, so the resting state is seen first.
          timer = window.setTimeout(() => el.setAttribute("data-play", ""), 250);
        } else if (!entry.isIntersecting) {
          el.removeAttribute("data-play");
        }
      },
      { threshold: [0, 0.6] },
    );
    io.observe(el);
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`group flex flex-col overflow-hidden rounded-[6px] bg-[rgb(var(--surface)/0.45)] ${className}`}
      style={style}
    >
      <div className={`${compactOnMobile ? "h-28" : "h-32"} sm:h-36 overflow-hidden`} aria-hidden="true">
        {cover}
      </div>
      <div className={`flex flex-1 flex-col border-t border-[rgb(var(--line))] sm:px-5 sm:pt-4 sm:pb-5 ${compactOnMobile ? "px-3.5 pt-3 pb-4" : "px-4 pt-4 pb-5"}`}>
        {(eyebrow || meta) && (
          <span className="flex items-center justify-between gap-3 text-[12px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))]">
            <span>{eyebrow}</span>
            {meta && <span className="tabular-nums">{meta}</span>}
          </span>
        )}
        <p className={`mt-1 ${compactOnMobile ? "text-[15px]" : "text-[16px]"} sm:text-[17px] tracking-tight leading-snug text-[rgb(var(--fg))] [text-wrap:pretty]`}>{title}</p>
        {desc && (
          <p className={`mt-1 text-[14px] sm:text-[15px] tracking-tight leading-snug text-[rgb(var(--muted))] [text-wrap:pretty] ${compactOnMobile ? "hidden sm:block" : ""}`}>
            {desc}
          </p>
        )}
      </div>
    </Tag>
  );
}
