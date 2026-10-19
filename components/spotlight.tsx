"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

// Shared by the homepage's "What we do" and Aether's "What it does".
// Styles are .index-spot in globals.css.

// Three words, large and centred. The one nearest the middle of the screen
// is lit and its line rises in under it; the others wait in pale grey. Each
// line keeps its space while hidden, so nothing moves as they change. Without
// motion (or before JS), all three are lit.
export function Spotlight({ label, items }: { label: string; items: { word: string; line: string }[] }) {
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (reduce !== false) {
      setActive(null);
      return;
    }
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const pick = () => {
      frame = 0;
      // Just above the middle, where the eye rests.
      const focus = window.innerHeight * 0.45;
      let best = 0;
      let bestDist = Infinity;
      Array.from(list.children).forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - focus);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(pick);
    };
    pick();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [reduce]);

  return (
    <section className="index-col index-spot" data-spot={active === null ? undefined : ""}>
      <h2 className="index-spot__label">{label}</h2>
      <ol ref={listRef} className="index-spot__list">
        {items.map((it, i) => (
          <li key={it.word} className="index-spot__item" data-on={active === null || active === i ? "" : undefined}>
            <span className="index-spot__word">{it.word}</span>
            <span className="index-spot__line">{it.line}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
