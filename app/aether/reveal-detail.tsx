"use client";

import { useId, useState, type ReactNode } from "react";
import { AETHER_LIQUID_EASE, AETHER_LIQUID_MS } from "./motion";

/* Keeps supporting copy out of the first glance. A small plus toggle opens it
 * in place; height animates via grid rows (0fr to 1fr) so no measuring. */
export function RevealDetail({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const transition = `${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`;

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="group inline-flex items-center gap-2 text-[14px] tracking-tight text-[rgb(var(--muted))] transition-colors hover:text-[rgb(var(--fg))] [-webkit-tap-highlight-color:transparent] sm:text-[15px]"
      >
        <span
          aria-hidden="true"
          className="flex size-5 items-center justify-center rounded-full bg-[rgb(var(--fg)/0.07)] motion-reduce:transition-none"
          style={{ transform: open ? "rotate(45deg)" : "none", transition: `transform ${transition}` }}
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-2.5">
            <line x1="6" y1="2" x2="6" y2="10" />
            <line x1="2" y1="6" x2="10" y2="6" />
          </svg>
        </span>
        {label}
      </button>
      <div
        id={id}
        className="grid motion-reduce:transition-none"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transition: `grid-template-rows ${transition}, opacity ${transition}`,
        }}
      >
        <div className="overflow-hidden" inert={!open}>
          {children}
        </div>
      </div>
    </div>
  );
}
