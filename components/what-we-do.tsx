"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { DecryptText } from "@/components/decrypt-text";
import { FigureDrawing, type FigureKind } from "@/components/figure-drawing";
import { useReveal, Words } from "@/components/reveal";

// What we do (styles are .index-figs in globals.css): the three things we
// make, each a figure drawn the way the chip is (figure-drawing.tsx), with
// its name and one line centred under it; the name decrypts
// (decrypt-text.tsx) as the item comes into view.

const ITEMS: { kind: FigureKind; title: string; line: string }[] = [
  {
    kind: "identity",
    title: "Identity",
    line: "A mark, type and colour that are unmistakably yours.",
  },
  {
    kind: "website",
    title: "Website",
    line: "Designed and built around it, down to the grid.",
  },
  {
    kind: "system",
    title: "One system",
    line: "Made together, so the two never drift apart.",
  },
];

// A tile, its name and its line, revealed together, a beat after the tile
// before it.
function Item({
  kind,
  title,
  line,
  index,
  seen,
}: {
  kind: FigureKind;
  title: string;
  line: string;
  index: number;
  seen: boolean;
}) {
  return (
    <li
      className="index-figs__item reveal-draw"
      style={{ "--i": index } as CSSProperties}
    >
      <div className="index-figs__tile">
        <FigureDrawing kind={kind} className="index-figs__field" />
      </div>
      <div className="index-figs__info">
        <DecryptText
          as="h3"
          className="index-figs__title"
          text={title}
          on={seen}
          cursor
        />
        <p className="index-figs__line">
          <Words text={line} />
        </p>
      </div>
    </li>
  );
}

// The items reveal together as the list comes into view, each a beat after
// the one before, the carousel's next card on phones too, so it's plain there's
// more to swipe to.
export function WhatWeDo() {
  const list = useReveal<HTMLOListElement>();
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }
    // The names decrypt once the list is well in view.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.4) return;
        io.disconnect();
        setSeen(true);
      },
      { threshold: [0, 0.4] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [list]);
  return (
    <section className="index-col index-figs" aria-labelledby="what-we-do">
      <h2 id="what-we-do" className="sr-only">
        What we do
      </h2>
      <ol ref={list} className="index-figs__list">
        {ITEMS.map((it, i) => (
          <Item key={it.title} {...it} index={i} seen={seen} />
        ))}
      </ol>
    </section>
  );
}
