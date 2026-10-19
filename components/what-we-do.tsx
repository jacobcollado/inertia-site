"use client";

import { useEffect, useRef } from "react";
import { ACCENT_ID, ease, lineDrawing, type LineDrawing } from "@/components/line-drawing";
import { TAU, circle, hull, partsKit, toothDepth, type V2 } from "@/components/watch-parts";

// What we do, as a drawing sheet: three figures side by side (stacked on
// phones), each a small mechanism from the same watch as the opening plate,
// drawn the same way (line-drawing.ts, watch-parts.ts), with what it stands
// for under it. Each says its line without a caption:
//
// - Up to date: a dial showing the visitor's own time, its seconds hand
//   sweeping, in the signal blue: the section's one blue part.
// - In one piece: two wheels in mesh, turning together; one can't move
//   without the other.
// - What's next: an escapement, the lever rocking and the escape wheel
//   stepping on a tooth at a time, once a second.
//
// Each figure draws only while it's on screen; with reduced motion they hold
// still (the dial still shows the time it was drawn at).

type Kit = ReturnType<typeof partsKit>;
type Figure = {
  // The figure's width and height on the paper in mm, and the height to
  // look at.
  extent: number;
  tall: number;
  look: number;
  // Sets the figure for a moment, `t` seconds in.
  tick: (t: number) => void;
};
type Build = (THREE: typeof import("three"), art: LineDrawing, kit: Kit) => Figure;

// A straight bar in plate coordinates, from one point to another, `w` wide.
function bar(a: V2, b: V2, w: number): V2[] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy);
  const nx = (-dy / l) * (w / 2);
  const ny = (dx / l) * (w / 2);
  return [
    [a[0] + nx, a[1] + ny],
    [b[0] + nx, b[1] + ny],
    [b[0] - nx, b[1] - ny],
    [a[0] - nx, a[1] - ny],
  ];
}

// Up to date: a dial in its case, with the visitor's own time on it.
const dial: Build = (THREE, art, { extrude, solid, ring, disc }) => {
  const root = new THREE.Group();
  art.scene.add(root);
  solid(root, ring(16, 14.2, 2.4), 0, 1);
  solid(root, disc(14.2, 1), 0, 2);
  // The hour batons, doubled at twelve.
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * TAU;
    const along: V2 = [Math.sin(a), Math.cos(a)];
    const at = (r: number, side: number): V2 => [along[0] * r + along[1] * side, along[1] * r - along[0] * side];
    const sides = k === 0 ? [-0.6, 0.6] : [0];
    for (const side of sides) solid(root, extrude(bar(at(10.4, side), at(13, side), 0.7), [], 0.35), 1, 3);
  }
  const hand = (outline: V2[], y: number, id: number) => {
    const g = new THREE.Group();
    g.position.y = y;
    root.add(g);
    solid(g, extrude(outline, [], 0.3), 0, id);
    return g;
  };
  const hour = hand(hull([[0, 0, 0.8], [0, 6.8, 0.36]]), 1.4, 4);
  const minute = hand(hull([[0, 0, 0.62], [0, 10.6, 0.26]]), 1.8, 5);
  const second = new THREE.Group();
  second.position.y = 2.2;
  root.add(second);
  solid(second, extrude(bar([0, -3], [0, 12.4], 0.24), [], 0.2), 0, ACCENT_ID);
  solid(second, disc(0.75, 0.2), 0, ACCENT_ID, 0, -2.4);
  solid(second, disc(0.55, 0.45), 0, ACCENT_ID);
  return {
    extent: 33,
    tall: 33 * 0.5 + 3,
    look: 1,
    tick: () => {
      const now = new Date();
      const s = now.getSeconds() + now.getMilliseconds() / 1000;
      const m = now.getMinutes() + s / 60;
      const h = (now.getHours() % 12) + m / 60;
      // Clockwise seen from above.
      second.rotation.y = -(s / 60) * TAU;
      minute.rotation.y = -(m / 60) * TAU;
      hour.rotation.y = -(h / 12) * TAU;
    },
  };
};

// In one piece: two wheels in mesh on one plate.
const mesh: Build = (THREE, art, { extrude, solid, ring, wheel }) => {
  const root = new THREE.Group();
  art.scene.add(root);
  const ra = 9;
  const na = 48;
  const rb = 6;
  const nb = 32;
  const gap = ra + rb - toothDepth(ra, na);
  // Placed so the pair is centred: the big wheel's far edge as far left as
  // the small one's is right.
  const a: V2 = [(ra - rb - gap) / 2, 0];
  const b: V2 = [a[0] + gap, 0];
  solid(root, extrude(hull([[a[0], 0, ra + 1.2], [b[0], 0, rb + 1.2]]), [circle(a[0], 0, 0.3, 24), circle(b[0], 0, 0.3, 24)], 1), 0, 1);
  for (const [x] of [a, b]) solid(root, ring(1, 0.3, 0.25), 1, 1, x, 0);
  const spin = (at: V2, r: number, n: number, spokes: number, id: number) => {
    const g = new THREE.Group();
    g.position.set(at[0], 2.3, -at[1]);
    root.add(g);
    wheel(g, { r, n, spokes, pinion: r * 0.14, id });
    return g;
  };
  const wa = spin(a, ra, na, 5, 2);
  const wb = spin(b, rb, nb, 4, 3);
  // A tooth of the big wheel points at the small one, into a gap of its.
  const a0 = -0.64 * (TAU / na);
  const b0 = Math.PI - 0.14 * (TAU / nb);
  return {
    extent: b[0] + rb + 1.2 - (a[0] - ra - 1.2),
    tall: (2 * (ra + 1.2)) * 0.5 + 4,
    look: 1.5,
    tick: (t) => {
      const turn = (t / 40) * TAU;
      wa.rotation.y = a0 + turn;
      wb.rotation.y = b0 - turn * (na / nb);
    },
  };
};

// What's next: an escapement, ticking once a second.
const escapement: Build = (THREE, art, { extrude, solid, ring, wheel }) => {
  const root = new THREE.Group();
  art.scene.add(root);
  const w: V2 = [0, -2.6];
  const p: V2 = [0, 6.4];
  const n = 15;
  solid(root, extrude(hull([[w[0], w[1], 8], [p[0], p[1], 2.4], [0, 11.6, 1.4]]), [circle(w[0], w[1], 0.3, 24), circle(p[0], p[1], 0.25, 24)], 1), 0, 1);
  solid(root, ring(1, 0.3, 0.25), 1, 1, w[0], w[1]);
  solid(root, ring(0.9, 0.25, 0.25), 1, 1, p[0], p[1]);
  const escape = new THREE.Group();
  escape.position.set(w[0], 2.3, -w[1]);
  root.add(escape);
  wheel(escape, { r: 6.5, n, spokes: 4, pinion: 0.8, ratchet: true, id: 2 });
  // The lever, pivoted at p: up toward the balance, and two arms over the
  // wheel carrying the pallet stones.
  const fork = new THREE.Group();
  fork.position.set(p[0], 2.9, -p[1]);
  root.add(fork);
  solid(fork, extrude(hull([[0, 0, 0.7], [0, 5, 0.32]]), [circle(0, 0, 0.18, 24)], 0.3), 0, 3);
  solid(fork, extrude(hull([[-0.55, 5.2, 0.32], [0.55, 5.2, 0.32]]), [], 0.3), 0, 3);
  for (const side of [-1, 1]) {
    const end: V2 = [side * 3.3, -2.9];
    solid(fork, extrude(hull([[0, 0, 0.5], [end[0], end[1], 0.32]]), [], 0.3), 0, 3);
    solid(fork, extrude(bar([end[0], end[1] + 0.3], [end[0] - side * 0.2, end[1] - 1.1], 0.55), [], 0.6), -0.3, 4);
  }
  const swing = 0.11;
  const step = TAU / n / 2;
  return {
    extent: 19,
    tall: 26 * 0.5 + 4,
    look: 1.5,
    tick: (t) => {
      const k = Math.floor(t);
      const f = ease(Math.min(1, (t - k) / 0.16));
      const from = k % 2 === 0 ? -swing : swing;
      fork.rotation.y = from + (-from - from) * f;
      // Clockwise seen from above, half a tooth a tick.
      escape.rotation.y = -(k + f) * step;
    },
  };
};

function FigureCanvas({ build }: { build: Build }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const art = lineDrawing(THREE, host, () => draw(performance.now()));
      const figure = build(THREE, art, partsKit(THREE, art));
      const start = performance.now();
      let width = 0;
      let height = 0;

      function draw(now: number) {
        if (!width || !height) return;
        figure.tick(reduce ? 0 : (now - start) / 1000);
        art.render();
      }
      const fit = () => {
        width = host.clientWidth;
        height = host.clientHeight;
        if (!width || !height) return;
        art.setSize(width, height);
        const scale = Math.min((width * 0.84) / figure.extent, (height * 0.84) / figure.tall);
        art.aim(new THREE.Vector3(0, figure.look, 0), width, height, scale);
        draw(performance.now());
      };

      let raf = 0;
      let visible = false;
      const loop = (now: number) => {
        raf = 0;
        draw(now);
        if (visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop);
      };
      const resume = () => {
        if (!raf && visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop);
      };
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        resume();
      });
      io.observe(host);
      document.addEventListener("visibilitychange", resume);
      const ro = new ResizeObserver(fit);
      ro.observe(host);
      fit();

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", resume);
        art.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [build]);

  return <div ref={hostRef} className="index-figs__art" aria-hidden />;
}

const FIGURES: { build: Build; word: string; line: string }[] = [
  {
    build: dial,
    word: "Up to date.",
    line: "Design dates within a year. We bring how you look back in line with the company you are now.",
  },
  {
    build: mesh,
    word: "In one piece.",
    line: "Your identity and your site are made together, so everywhere people meet you, it feels like the same company.",
  },
  {
    build: escapement,
    word: "What’s next.",
    line: "We try new ideas on our own work first, so you get what’s coming, not what everyone already has.",
  },
];

export function WhatWeDo() {
  return (
    <section className="index-col index-figs" aria-labelledby="what-we-do">
      <h2 id="what-we-do" className="sr-only">
        What we do
      </h2>
      <ol className="index-figs__list">
        {FIGURES.map((f) => (
          <li key={f.word} className="index-figs__item">
            <FigureCanvas build={f.build} />
            <h3 className="index-figs__word">{f.word}</h3>
            <p className="index-figs__line">{f.line}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
