"use client";

import { useState } from "react";

// The questions people ask before buying, each folded until asked. One
// opens at a time; its answer unfolds under it (.ae-q in globals.css).
export function Questions({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <ul className="ae-q">
      {items.map((it, i) => {
        const on = open === i;
        return (
          <li key={it.q} className="ae-q__item" data-open={on || undefined}>
            <button type="button" className="ae-q__ask" aria-expanded={on} onClick={() => setOpen(on ? null : i)}>
              <span>{it.q}</span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="ae-q__icon" aria-hidden="true">
                <path d="M3 8h10" />
                <path d="M8 3v10" className="ae-q__icon-v" />
              </svg>
            </button>
            <div className="ae-q__answer">
              <p>{it.a}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
