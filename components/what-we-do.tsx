"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { DecryptText } from "@/components/decrypt-text";
import { PointField } from "@/components/point-field";
import { across, along, arc, roundedRect, roundedTriangle, type Form, type V } from "@/components/point-forms";
import { useReveal, Words } from "@/components/reveal";

// What we do (styles are .index-figs in globals.css): the three things we
// make, each a field of ink points on the paper, with its name and one line
// centred under it; the name decrypts (decrypt-text.tsx) as the item comes
// into view. The points drift, then find a form and settle into it,
// hold, and let go to look again:
//
// - Identity: a ring, a rounded square, a rounded triangle, in turn: a mark
//   being searched for.
// - Website: an exploded stack of three plates, the way the chip is drawn,
//   closing into one slab with a grid across its top.
// - One system: two loops drawn as one continuous line.
//
// The points are point-field.tsx's.

const IDENTITY: Form[] = [
  (n) => along(arc(0, 0, 0.62, 0, Math.PI * 2), n),
  (n) => along(roundedRect(-0.56, -0.56, 0.56, 0.56, 0.2), n),
  (n) => along(roundedTriangle(0.7, 0.14), n),
];

// Plates seen from above at the drawings' angle, the way the chip is: a
// plate's square face, x and z from -1 to 1, as a diamond centred at height
// y, K across per unit.
const K = 0.46;
const iso = (x: number, z: number, y: number): V => [(x - z) * K * Math.cos(Math.PI / 6), (x + z) * 0.5 * K + y];
const face = (y: number): V[] => [iso(-1, -1, y), iso(1, -1, y), iso(1, 1, y), iso(-1, 1, y), iso(-1, -1, y)];
// Whether a point is under the face of a plate at height y.
const under = ([x, y]: V, at: number) => Math.abs(x) / (2 * K * Math.cos(Math.PI / 6)) + Math.abs(y - at) / K < 0.98;
// The runs of a path a set of plates above it leave in view, so hidden
// lines drop out as in the drawings.
function seen(path: V[], above: number[]): V[][] {
  const runs: V[][] = [];
  let run: V[] = [];
  for (let i = 1; i < path.length; i++)
    for (let k = 0; k < 60; k++) {
      const f = k / 60;
      const p: V = [path[i - 1][0] + (path[i][0] - path[i - 1][0]) * f, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * f];
      if (above.some((at) => under(p, at))) {
        if (run.length > 1) runs.push(run);
        run = [];
      } else run.push(p);
    }
  if (run.length > 1) runs.push(run);
  return runs;
}

// Website: the site's layers apart, an exploded stack of three plates, then
// closed into one slab, a grid across its top.
const LAYERS = [-0.36, 0, 0.36];
const SLAB = 0.1;
const WEBSITE: Form[] = [
  (n) => across(LAYERS.flatMap((y, i) => seen(face(y), LAYERS.slice(0, i))), n),
  (n) =>
    across(
      [
        face(-SLAB),
        [iso(-1, 1, -SLAB), iso(-1, 1, SLAB), iso(1, 1, SLAB), iso(1, -1, SLAB), iso(1, -1, -SLAB)],
        [iso(1, 1, -SLAB), iso(1, 1, SLAB)],
        ...[-1 / 3, 1 / 3].flatMap((t) => [
          [iso(t, -1, -SLAB), iso(t, 1, -SLAB)],
          [iso(-1, t, -SLAB), iso(1, t, -SLAB)],
        ]),
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
  // The name decrypts once the item is well in view.
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = item.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.5) return;
        io.disconnect();
        setSeen(true);
      },
      { threshold: [0, 0.5] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [item]);
  return (
    <li ref={item} className="index-figs__item" style={{ "--i": index } as CSSProperties}>
      <div className="index-figs__tile">
        <PointField forms={forms} className="index-figs__field" />
      </div>
      <DecryptText as="h3" className="index-figs__title" text={title} on={seen} />
      <p className="index-figs__line">
        <Words text={line} />
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
