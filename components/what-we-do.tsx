"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { ACCENT_ID, AZIMUTH, ELEVATION, ease, easeInOut, lineDrawing, type LineDrawing } from "@/components/line-drawing";
import { useReveal, Words } from "@/components/reveal";
import { TAU, circle, hull, partsKit, toothDepth, type V2 } from "@/components/watch-parts";

// What we do, as a drawing sheet: three figures side by side (stacked on
// phones), each a small mechanism from the same watch as the opening plate,
// drawn the same way (line-drawing.ts, watch-parts.ts), with what it stands
// for centred under it. Each mechanism is mounted on a base, the same slab
// under all three and framed the same, so the bases line up across the row
// like the work's: the figures stand on something, and read as one set
// while staying three. Each says its line without a caption:
//
// - Up to date: a dial showing the visitor's own time, its seconds hand
//   sweeping, in the signal blue: the section's one blue part.
// - In one piece: two wheels in mesh, turning together; one can't move
//   without the other.
// - What's next: an escapement, the lever rocking and the escape wheel
//   stepping on a tooth at a time, once a second.
//
// Each mechanism is put together on its base as it comes up the screen,
// following the scroll (and taken apart again going back): its pieces come
// down from the lowest level up in one motion, the figures on the left a
// little ahead, while its line rises in (reveal.tsx). Each figure
// draws only while it's on screen; with reduced motion they hold still,
// already set down (the dial still shows the time it was drawn at).

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

// The base every figure is mounted on, in mm: width, depth and height. Every
// figure is framed on it alike, so the three bases match across the row.
const BASE_W = 40;
const BASE_D = 30;
const BASE_H = 1.6;
// How much of the paper each figure's frame takes in, in mm, and the height
// it looks at.
const FRAME_W = BASE_W * Math.cos(AZIMUTH) + BASE_D * Math.abs(Math.sin(AZIMUTH));
const FRAME_H = BASE_D * Math.sin(ELEVATION) + 8 * Math.cos(ELEVATION);
const FRAME_LOOK = 2.4;

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
  // Drawn larger than life, so it fills its base like the other two.
  root.scale.setScalar(1.4);
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

// Taken apart, a mechanism stands above its base the way the opening plate
// shows its movement: each piece lifted LIFT, and STEP more for every level
// it stands above the lowest, in mm.
const LIFT = 2.4;
const STEP = 0.8;
// How far up the screen a figure's top has come when it's put together, as
// a share of the screen's height; how quickly it follows the scroll; and how
// far behind its neighbour on the left it runs, side by side.
const ASSEMBLED_AT = 0.5;
const FOLLOW = 7;
const LAG = 0.08;

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
      const art = lineDrawing(THREE, host, () => draw(performance.now()), { smooth: true });
      const figure = build(THREE, art, partsKit(THREE, art));
      // Mounted on its base: the mechanism stands on the slab's top.
      for (const child of art.scene.children) child.position.y += BASE_H;
      // Its pieces, each on a level by the height it stands at.
      const pieces = art.scene.children.flatMap((root) => root.children.map((o) => ({ o, y: o.position.y })));
      const levels = [...new Set(pieces.map((p) => p.y))].sort((a, b) => a - b);
      const level = pieces.map((p) => levels.indexOf(p.y));
      const base = new THREE.Mesh(art.keep(new THREE.BoxGeometry(BASE_W, BASE_H, BASE_D).translate(0, BASE_H / 2, 0)), art.surface(50));
      art.scene.add(base);
      const start = performance.now();
      const item: HTMLElement = host;
      // Its place in the row (--i, side by side only), and how put together
      // it is, easing after where the scroll says it should be.
      let order = 0;
      let together = reduce ? 1 : 0;
      let last = 0;
      let width = 0;
      let height = 0;

      function draw(now: number) {
        if (!width || !height) return;
        if (!reduce) {
          const top = item.getBoundingClientRect().top;
          const want = Math.min(1, Math.max(0, (innerHeight - top) / (innerHeight * (1 - ASSEMBLED_AT)) - order * LAG));
          const dt = last ? Math.min(0.05, (now - last) / 1000) : 1;
          together += (want - together) * (1 - Math.exp(-dt * FOLLOW));
          last = now;
        }
        // Put together from the lowest level up: each level leads the one
        // above it, all in one motion.
        const highest = Math.max(1, levels.length - 1);
        pieces.forEach((p, j) => {
          const k = easeInOut((together - (level[j] / highest) * 0.3) / 0.7);
          p.o.position.y = p.y + (1 - k) * (LIFT + level[j] * STEP);
        });
        figure.tick(reduce ? 0 : (now - start) / 1000);
        art.render();
      }
      const fit = () => {
        width = host.clientWidth;
        height = host.clientHeight;
        if (!width || !height) return;
        order = parseFloat(getComputedStyle(item).getPropertyValue("--i")) || 0;
        art.setSize(width, height);
        const scale = Math.min((width * 0.82) / FRAME_W, (height * 0.82) / FRAME_H);
        art.aim(new THREE.Vector3(0, FRAME_LOOK, 0), width, height, scale);
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

const FIGURES: { build: Build; line: string }[] = [
  { build: dial, line: "We bring how you look up to date with the company you are now." },
  { build: mesh, line: "Your identity and your site, made together so they read as one." },
  { build: escapement, line: "We try new ideas on our own work first, so you get what’s next." },
];

// A figure and its line, revealed on its own: side by side, the three come
// in together, a beat apart; stacked on a phone, each as it's reached.
function FigureItem({ build, line, index }: { build: Build; line: string; index: number }) {
  const item = useReveal<HTMLLIElement>();

  return (
    <li ref={item} className="index-figs__item" style={{ "--n": index } as CSSProperties}>
      <FigureCanvas build={build} />
      <h3 className="index-figs__line">
        <Words text={line} />
      </h3>
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
        {FIGURES.map((f, i) => (
          <FigureItem key={f.line} build={f.build} line={f.line} index={i} />
        ))}
      </ol>
    </section>
  );
}
