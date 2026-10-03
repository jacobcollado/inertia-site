"use client";

import { useId, useState } from "react";
import { AETHER_LIQUID_EASE, AETHER_LIQUID_MS } from "./motion";

/* One FAQ question as a full-width card: the question reads at body size on
 * the left, a plus on the right turns into a close mark, and the answer opens
 * under it in place. Height animates via grid rows (0fr to 1fr) so there's no
 * measuring, same as RevealDetail. */
export function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const transition = `${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`;

  return (
    <div
      className="rounded-[6px] bg-[rgb(var(--surface)/0.45)] transition-colors hover:bg-[rgb(var(--surface)/0.8)]"
      style={{ transitionDuration: "200ms" }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-[16px] sm:px-5 sm:text-[17px] tracking-tight leading-snug text-[rgb(var(--fg))] [-webkit-tap-highlight-color:transparent]"
      >
        {q}
        <span
          aria-hidden="true"
          className="flex size-[1.4em] shrink-0 items-center justify-center rounded-[6px] bg-[rgb(var(--bg))] text-[rgb(var(--muted))] shadow-[0_0_0_1px_rgb(var(--line))] motion-reduce:transition-none [&_svg]:size-[50%]"
          style={{ transform: open ? "rotate(45deg)" : "none", transition: `transform ${transition}` }}
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="6" y1="2" x2="6" y2="10" />
            <line x1="2" y1="6" x2="10" y2="6" />
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
          <p className="px-4 pb-4 text-[15px] sm:px-5 sm:pb-5 sm:text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

/* The questions split by topic, one topic at a time, so the section shows
 * three or four questions instead of the whole list. A segmented control
 * picks the topic; the first one is open by default. */
export function FaqTabs({
  groups,
  questions,
}: {
  groups: readonly string[];
  questions: { q: string; a: string; group: string }[];
}) {
  const [active, setActive] = useState(groups[0]);
  const id = useId();

  return (
    <div className="w-full">
      <div
        role="tablist"
        aria-label="Question topics"
        className="no-scrollbar mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-[6px] bg-[rgb(var(--surface)/0.6)] p-1"
      >
        {groups.map((g) => {
          const selected = g === active;
          return (
            <button
              key={g}
              type="button"
              role="tab"
              id={`${id}-${g}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              onClick={() => setActive(g)}
              className={`shrink-0 whitespace-nowrap rounded-[6px] px-3 py-1.5 text-[14px] sm:px-4 sm:text-[15px] tracking-tight transition-colors duration-200 [-webkit-tap-highlight-color:transparent] ${
                selected
                  ? "bg-[rgb(var(--bg))] text-[rgb(var(--fg))] shadow-[0_0_0_1px_rgb(var(--line)),0_1px_2px_rgb(0_0_0/0.06)]"
                  : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-${active}`}
        className="mt-6 flex flex-col gap-2"
      >
        {questions
          .filter((x) => x.group === active)
          .map(({ q, a }) => (
            <FaqItem key={q} q={q} a={a} />
          ))}
      </div>
    </div>
  );
}