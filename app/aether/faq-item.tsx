"use client";

import { useId, useState } from "react";
import { AETHER_LIQUID_EASE, AETHER_LIQUID_MS } from "./motion";

/* One FAQ question as a hairline row: the question at body size on the
 * left, a plus on the right that turns into a close mark, and the answer
 * opening under it in place. Height animates via grid rows (0fr to 1fr) so
 * there's no measuring, same as RevealDetail. */
export function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const transition = `${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`;

  return (
    <div className="border-b border-[rgb(var(--fg)/0.08)]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between gap-6 py-5 text-left text-[16px] sm:text-[18px] tracking-tight leading-snug text-[rgb(var(--fg))] [-webkit-tap-highlight-color:transparent]"
      >
        {q}
        <span
          aria-hidden="true"
          className="flex size-5 shrink-0 items-center justify-center text-[rgb(var(--muted))] transition-colors group-hover:text-[rgb(var(--fg))] motion-reduce:transition-none"
          style={{ transform: open ? "rotate(45deg)" : "none", transition: `transform ${transition}` }}
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="size-3.5">
            <line x1="6" y1="1.5" x2="6" y2="10.5" />
            <line x1="1.5" y1="6" x2="10.5" y2="6" />
          </svg>
        </span>
      </button>
      <div
        id={id}
        role="region"
        className="grid motion-reduce:transition-none"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transition: `grid-template-rows ${transition}, opacity ${transition}`,
        }}
      >
        <div className="overflow-hidden" inert={!open}>
          <p className="max-w-2xl pb-5 pr-10 text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

/* The questions split by topic, one topic at a time, so the section shows
 * three or four questions instead of the whole list. The topics are a
 * vertical list in the left column from lg up (pass `aside` for what sits
 * under them), and a sideways row of text tabs above the questions below
 * that. */
export function FaqTabs({
  groups,
  questions,
  intro,
  aside,
}: {
  groups: readonly string[];
  questions: { q: string; a: string; group: string }[];
  intro: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const [active, setActive] = useState(groups[0]);
  const id = useId();
  const count = (g: string) => questions.filter((x) => x.group === g).length;

  const tab = (g: string, vertical: boolean) => {
    const selected = g === active;
    return (
      <button
        key={g}
        type="button"
        role="tab"
        id={vertical ? `${id}-${g}` : undefined}
        aria-selected={selected}
        aria-controls={`${id}-panel`}
        onClick={() => setActive(g)}
        className={`flex shrink-0 items-baseline justify-between gap-6 whitespace-nowrap tracking-tight transition-colors duration-200 [-webkit-tap-highlight-color:transparent] ${
          vertical ? "py-2 text-[17px] text-left" : "pb-2 text-[15px] border-b"
        } ${selected ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"} ${
          !vertical ? (selected ? "border-[rgb(var(--fg))]" : "border-transparent") : ""
        }`}
      >
        {g}
        {vertical && <span className="tabular-nums text-[13px] text-[rgb(var(--muted))] opacity-70">{count(g)}</span>}
      </button>
    );
  };

  return (
    <div className="grid w-full items-start gap-8 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-20">
      <div>
        {intro}
        <div role="tablist" aria-label="Question topics" aria-orientation="vertical" className="mt-8 hidden flex-col border-t border-[rgb(var(--fg)/0.08)] pt-3 lg:flex">
          {groups.map((g) => tab(g, true))}
        </div>
        {aside && <div className="mt-8 hidden lg:block">{aside}</div>}
      </div>

      <div className="min-w-0">
        <div role="tablist" aria-label="Question topics" className="no-scrollbar -mx-3 flex gap-5 overflow-x-auto px-3 lg:hidden">
          {groups.map((g) => tab(g, false))}
        </div>
        <div
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-${active}`}
          className="mt-2 border-t border-[rgb(var(--fg)/0.08)] lg:mt-0"
        >
          {questions
            .filter((x) => x.group === active)
            .map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
        </div>
        {aside && <div className="mt-8 lg:hidden">{aside}</div>}
      </div>
    </div>
  );
}
