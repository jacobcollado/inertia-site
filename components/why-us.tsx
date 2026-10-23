"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { PointField } from "@/components/point-field";
import { along, arc, type Form, type V } from "@/components/point-forms";
import { useReveal, Words } from "@/components/reveal";

// Why us (styles are .why in globals.css): the reasons, beside one field of
// points (point-field.tsx) that acts out whichever is lit. They take turns
// while the section's on screen, a reason every few seconds, and pointing at
// one lights it; the others rest in grey. Each reason is a pair of forms the
// points step between, so what changes is the point being made:
//
// - Noticing: a quiet grid with one point out of line, put back.
// - Finishing: a rough, uneven ring drawn true.
// - Making: two clusters apart, then joined by one straight line, nothing in
//   between.
//
// With reduced motion every reason is in ink and the field shows the last
// one, settled.

const N = 150;

// A seeded wobble, so the forms are the same on every load.
const wobble = (i: number) => Math.sin(i * 12.9898) * 43758.5453 % 1;

// A grid of 15 by 10 points, one of them (`off`) a little out of line.
function grid(off: boolean): Form {
  return () => {
    const out: V[] = [];
    for (let r = 0; r < 10; r++)
      for (let c = 0; c < 15; c++) out.push([-0.78 + (c * 1.56) / 14, -0.52 + (r * 1.04) / 9]);
    if (off) {
      out[77][0] += 0.05;
      out[77][1] -= 0.07;
    }
    return out;
  };
}

// A ring, rough or true.
function ring(rough: boolean): Form {
  return (n) =>
    along(arc(0, 0, 0.6, 0, Math.PI * 2), n).map(([x, y], i): V => {
      if (!rough) return [x, y];
      const k = 1 + wobble(i) * 0.14 + Math.sin(i * 0.31) * 0.05;
      return [x * k, y * k];
    });
}

// Two clusters, apart or joined by a straight line of points.
function pair(joined: boolean): Form {
  return (n) => {
    const each = 45;
    const left = along(arc(-0.56, 0, 0.14, 0, Math.PI * 2), each);
    const right = along(arc(0.56, 0, 0.14, 0, Math.PI * 2), each);
    const rest = n - each * 2;
    const line: V[] = joined
      ? Array.from({ length: rest }, (_, i): V => [-0.4 + (0.8 * (i + 0.5)) / rest, 0])
      : Array.from({ length: rest }, (_, i): V => {
          // Held inside the clusters until they're joined.
          const a = i * 2.39996;
          const r = 0.09 * Math.sqrt((i % (rest / 2)) / (rest / 2));
          return [(i < rest / 2 ? -0.56 : 0.56) + Math.cos(a) * r, Math.sin(a) * r];
        });
    return [...left, ...right, ...line];
  };
}

const REASONS: { line: string; forms: Form[] }[] = [
  { line: "We notice what feels off before anyone can say why.", forms: [grid(true), grid(false)] },
  { line: "Nothing ships until every detail is right.", forms: [ring(true), ring(false)] },
  { line: "The people you talk to are the people who make it.", forms: [pair(false), pair(true)] },
];

// How long each reason is lit before the next, in ms.
const TURN = 5200;

// Whether motion is reduced, read before first paint (and kept up to date).
const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (change: () => void) => {
  const q = window.matchMedia(REDUCE);
  q.addEventListener("change", change);
  return () => q.removeEventListener("change", change);
};

export function WhyUs() {
  const list = useReveal<HTMLUListElement>();
  const ref = useRef<HTMLElement>(null);
  const [lit, setLit] = useState(0);
  const [held, setHeld] = useState(false);
  const reduce = useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(REDUCE).matches,
    () => false,
  );

  // Taking turns while on screen, unless a reason is being pointed at.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    let timer = 0;
    let visible = false;
    const tick = () => {
      if (visible && !held) setLit((i) => (i + 1) % REASONS.length);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(el);
    timer = window.setInterval(tick, TURN);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, [held, reduce]);

  const shown = reduce ? REASONS.length - 1 : lit;

  return (
    <section ref={ref} className="index-col why" aria-labelledby="why-label">
      <h2 id="why-label" className="sr-only">
        Why us
      </h2>
      <ul ref={list} className="why__list" data-beats={reduce ? undefined : ""}>
        {REASONS.map((r, i) => (
          <li
            key={r.line}
            className="why__item"
            style={{ "--i": i } as CSSProperties}
            data-lit={i === shown ? "" : undefined}
            onPointerEnter={() => {
              setHeld(true);
              setLit(i);
            }}
            onPointerLeave={() => setHeld(false)}
          >
            <h3 className="why__line">
              <Words text={r.line} />
            </h3>
          </li>
        ))}
      </ul>
      <div className="why__fig">
        <PointField forms={REASONS[shown].forms} drift={false} className="why__field" />
      </div>
    </section>
  );
}
