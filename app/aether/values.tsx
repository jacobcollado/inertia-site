"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { CustomerArt, IdentityArt, SpeedArt } from "./values-art";
import { scrollToId } from "./motion";

/* What Aether stands on, said once and shown once. A single sentence names
 * the three values; its key phrases ink in one after another as it's read.
 * Under it, each value as a drawing that acts it out (values-art.tsx), its
 * name and one line, and a link down to the chapter that proves it. The
 * rest of the page is those three chapters, each opened by a ChapterMark. */

export const VALUES = [
  {
    id: "customer",
    name: "Customer",
    title: "Obsessed with your customer",
    desc: "Every page points the shopper to their next step. You get lifetime updates and real people on support.",
    Art: CustomerArt,
  },
  {
    id: "speed",
    name: "Speed",
    title: "Speed, first",
    desc: "Designed thumb-first, with quick buy and a cart that follows the scroll. Installed for you the same day.",
    Art: SpeedArt,
  },
  {
    id: "identity",
    name: "Identity",
    title: "An identity to grow into",
    desc: "Every color, font, layout and image is yours to set. No presets, no code, no limit on the look.",
    Art: IdentityArt,
  },
] as const;

type ValueId = (typeof VALUES)[number]["id"];

// The sentence, as runs of muted text and key phrases.
const STATEMENT: { t: string; key?: boolean }[] = [
  { t: "We " },
  { t: "obsess over your customer", key: true },
  { t: ", build every page for " },
  { t: "speed", key: true },
  { t: ", and give your brand " },
  { t: "the look of where it's going next", key: true },
  { t: "." },
];

// True while the element is at least `threshold` on screen.
function useOnScreen<T extends Element>(threshold = 0.5) {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, on] as const;
}

/** The value's number and name above a chapter's first heading, so each
 * chapter says which value it proves: a small chip on the tile colour, the
 * number in its own circle, the name beside it. */
export function ChapterMark({ value }: { value: ValueId }) {
  const i = VALUES.findIndex((v) => v.id === value);
  return (
    <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--tile)] py-1 pl-1 pr-3 text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--fg))]">
      <span className="flex size-5 items-center justify-center rounded-full bg-[rgb(var(--fg)/0.08)] text-[11px] tabular-nums text-[rgb(var(--muted))]">
        {i + 1}
      </span>
      {VALUES[i].name}
    </p>
  );
}

function ValueTile({ v, i, still }: { v: (typeof VALUES)[number]; i: number; still: boolean }) {
  const [ref, on] = useOnScreen<HTMLDivElement>(0.6);
  return (
    <li className="flex w-[82%] shrink-0 snap-start flex-col sm:w-auto">
      <div ref={ref} className="aspect-[4/3] overflow-hidden rounded-[6px] bg-[var(--tile)]">
        <v.Art play={on} still={still} />
      </div>
      <div className="mt-5 flex items-baseline gap-3">
        <span className="w-4 shrink-0 text-[14px] tabular-nums tracking-tight text-[rgb(var(--muted))] opacity-70">{i + 1}</span>
        <h3 className="text-[18px] sm:text-[21px] tracking-[-0.02em] leading-snug text-[rgb(var(--fg))]" style={{ fontWeight: 500 }}>
          {v.title}
        </h3>
      </div>
      <p className="mt-1 pl-7 text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
        {v.desc}
      </p>
      <a
        href={`#${v.id}`}
        onClick={(e) => scrollToId(v.id, e)}
        className="group mt-3 ml-7 inline-flex w-fit items-center gap-1 text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--fg))] [-webkit-tap-highlight-color:transparent]"
      >
        See how
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-[0.85em] transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true">
          <path d="M6 2.5v7M2.8 6.5 6 9.7l3.2-3.2" />
        </svg>
      </a>
    </li>
  );
}

export function Values() {
  const reduce = !!useReducedMotion();
  const [lineRef, read] = useOnScreen<HTMLHeadingElement>(0.8);
  // Once read, the phrases stay inked.
  const [inked, setInked] = useState(false);
  useEffect(() => {
    if (read) setInked(true);
  }, [read]);

  let k = 0;
  const statement: ReactNode = STATEMENT.map((run, i) => {
    if (!run.key) return <span key={i}>{run.t}</span>;
    const delay = reduce ? 0 : 150 + k++ * 420;
    return (
      <span
        key={i}
        className="motion-reduce:transition-none"
        style={{
          color: inked || reduce ? "rgb(var(--fg))" : "rgb(var(--muted) / 0.75)",
          transition: `color 900ms cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms`,
        }}
      >
        {run.t}
      </span>
    );
  });

  return (
    <section id="values" className="rise rise-stagger scroll-mt-16 mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] py-20 sm:py-32" aria-labelledby="values-title">
      <p className="mb-6 text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">Why Aether</p>
      <h2
        id="values-title"
        ref={lineRef}
        className="max-w-[56rem] text-[clamp(1.75rem,4.2vw,3.25rem)] font-normal leading-[1.12] tracking-[-0.035em] text-[rgb(var(--muted)/0.75)] [text-wrap:balance]"
      >
        {statement}
      </h2>

      {/* Phones: a row that swipes sideways, the next value peeking in.
          Three columns from sm up. */}
      <ul
        data-stagger
        className="no-scrollbar -mx-3 mt-14 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-3 px-3 sm:mx-0 sm:mt-20 sm:grid sm:grid-cols-3 sm:gap-x-4 sm:overflow-visible sm:px-0"
      >
        {VALUES.map((v, i) => (
          <ValueTile key={v.id} v={v} i={i} still={reduce} />
        ))}
      </ul>
    </section>
  );
}
