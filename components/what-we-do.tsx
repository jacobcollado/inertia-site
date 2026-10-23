"use client";

import { type CSSProperties } from "react";
import { PointField } from "@/components/point-field";
import { across, along, arc, roundedRect, roundedTriangle, type Form, type V } from "@/components/point-forms";
import { useReveal, Words } from "@/components/reveal";

// What we do (styles are .index-figs in globals.css): the three things we
// make, each a small field of ink points on a quiet tile, with its name and
// one line under it. The points drift, then find a form and settle into it,
// hold, and let go to look again:
//
// - Identity: a ring, a rounded square, a rounded triangle, in turn: a mark
//   being searched for.
// - Website: a page's layout, a bar over a large block over three columns.
// - One system: two loops drawn as one continuous line.
//
// The points are point-field.tsx's.

const IDENTITY: Form[] = [
  (n) => along(arc(0, 0, 0.62, 0, Math.PI * 2), n),
  (n) => along(roundedRect(-0.56, -0.56, 0.56, 0.56, 0.2), n),
  (n) => along(roundedTriangle(0.7, 0.14), n),
];

const WEBSITE: Form[] = [
  (n) =>
    across(
      [
        roundedRect(-0.78, -0.72, 0.78, -0.56, 0.04),
        roundedRect(-0.78, -0.42, 0.78, 0.18, 0.04),
        roundedRect(-0.78, 0.32, -0.3, 0.72, 0.04),
        roundedRect(-0.24, 0.32, 0.24, 0.72, 0.04),
        roundedRect(0.3, 0.32, 0.78, 0.72, 0.04),
      ],
      n,
    ),
];

const SYSTEM: Form[] = [
  (n) =>
    along(
      Array.from({ length: 241 }, (_, i): V => {
        const t = (i / 240) * Math.PI * 2;
        const d = 1 + Math.sin(t) ** 2;
        return [(0.82 * Math.cos(t)) / d, (0.82 * Math.sin(t) * Math.cos(t)) / d];
      }),
      n,
    ),
];

const ITEMS: { forms: Form[]; title: string; line: string }[] = [
  { forms: IDENTITY, title: "Identity", line: "A mark, type and colour that are unmistakably yours." },
  { forms: WEBSITE, title: "Website", line: "Designed and built around it, down to the grid." },
  { forms: SYSTEM, title: "One system", line: "Made together, so the two never drift apart." },
];

// A tile, its name and its line, revealed together, a beat after the tile
// before it.
function Item({ forms, title, line, index }: { forms: Form[]; title: string; line: string; index: number }) {
  const item = useReveal<HTMLLIElement>();
  return (
    <li ref={item} className="index-figs__item" style={{ "--i": index } as CSSProperties}>
      <div className="index-figs__tile">
        <PointField forms={forms} className="index-figs__field" />
      </div>
      <h3 className="index-figs__title">
        <Words text={title} />
      </h3>
      <p className="index-figs__line">
        <Words text={line} from={title.split(" ").length} />
      </p>
    </li>
  );
}

export function WhatWeDo() {
  return (
    <section className="index-col index-figs" aria-labelledby="what-we-do">
      <h2 id="what-we-do" className="sr-only">
        What we do
      </h2>
      <ol className="index-figs__list">
        {ITEMS.map((it, i) => (
          <Item key={it.title} {...it} index={i} />
        ))}
      </ol>
    </section>
  );
}
