"use client";

import { useEffect, useRef } from "react";
import type * as Three from "three";
import { ACCENT_ID, INK_FILL_ID, easeInOut, lineDrawing } from "@/components/line-drawing";
import { circle, rounded, type V2 } from "@/components/watch-parts";

// What we do's figures, drawn the way the chip is (line-drawing.ts): real
// solids, in a hidden-line drawing, so they have the chip's depth.
//
// Colour, in one moment: the identity marks, filled in heather and ink; the
// rest in ink.
//
// - identity: a mark standing upright, turning a little this way and that.
//   Every few seconds it turns edge on and comes back round as the next: a
//   cloud, a sprout and a ghost, each filled in heather with an ink face.
// - website: three plates in an exploded stack, the top one tiled in a grid,
//   that close onto one another and open again, guides at their corners.
// - system: two rings linked through each other, one standing and one
//   lying flat, turning slowly together.
//
// Rendering pauses off screen and in hidden tabs; three.js is imported on
// mount. With reduced motion each holds still on its first form.

export type FigureKind = "identity" | "website" | "system";

// How long a mark holds before turning to the next, and the turn, in s.
const MARK_HOLD = 3.4;
const MARK_TURN = 1.1;
// The plates: how long they hold open and shut, and the move, in s.
const PLATE_HOLD = 2.4;
const PLATE_MOVE = 1.4;

// The marks' outlines, about 12 across, in the plane of the mark (y up).
const line = (x0: number, y0: number, x1: number, y1: number, w: number): V2[] => {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const len = Math.hypot(x1 - x0, y1 - y0);
  return rounded(len, w, w / 2, 0, 0, 8).map(([x, y]) => [
    (x0 + x1) / 2 + x * Math.cos(a) - y * Math.sin(a),
    (y0 + y1) / 2 + x * Math.sin(a) + y * Math.cos(a),
  ]);
};
// A ghost's outline: a domed head, straight sides and a hem of three
// scallops.
const ghost = (): V2[] => {
  const out: V2[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI;
    out.push([4.6 * Math.cos(a), 1 + 4.6 * Math.sin(a)]);
  }
  for (const cx of [-3.07, 0, 3.07])
    for (let i = 0; i <= 24; i++) {
      const a = Math.PI + (i / 24) * Math.PI;
      out.push([cx + 1.53 * Math.cos(a), -4.4 + 1.53 * Math.sin(a)]);
    }
  return out;
};

// A cloud's outline: round puffs over a flatter base, traced as the far
// edge of their union along rays from the middle.
const PUFFS: [number, number, number][] = [
  [-3.6, -0.9, 2.5],
  [-1.6, 1.1, 2.9],
  [1.7, 1.9, 3.2],
  [4, -0.6, 2.4],
  [0.2, -1.4, 2.8],
  [-2, -1.6, 2.4],
  [2.4, -1.6, 2.4],
];
const cloud = (): V2[] =>
  Array.from({ length: 240 }, (_, i): V2 => {
    const a = (i / 240) * Math.PI * 2;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    let far = 0;
    for (const [cx, cy, r] of PUFFS) {
      const along = dx * cx + dy * cy;
      const off = cx * cx + cy * cy - along * along;
      if (off <= r * r) far = Math.max(far, along + Math.sqrt(r * r - off));
    }
    return [dx * far, dy * far];
  });
type Part = { outline: V2[]; holes?: V2[][]; z?: number; depth?: number; kind?: number };

// Drawn lines, for the face: a cubic curve as points, and a stroke `w`
// wide along points as one outline with round ends.
type Bez = [V2, V2, V2, V2];
const bez = ([p0, c1, c2, p3]: Bez, n = 24): V2[] =>
  Array.from({ length: n + 1 }, (_, i): V2 => {
    const t = i / n;
    const k = 1 - t;
    return [
      k ** 3 * p0[0] + 3 * k * k * t * c1[0] + 3 * k * t * t * c2[0] + t ** 3 * p3[0],
      k ** 3 * p0[1] + 3 * k * k * t * c1[1] + 3 * k * t * t * c2[1] + t ** 3 * p3[1],
    ];
  });
function stroke(pts: V2[], w: number): V2[] {
  const h = w / 2;
  const normal = (i: number): V2 => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
  };
  const left = pts.map((p, i): V2 => [p[0] + normal(i)[0] * h, p[1] + normal(i)[1] * h]);
  const right = pts.map((p, i): V2 => [p[0] - normal(i)[0] * h, p[1] - normal(i)[1] * h]);
  // A round end: half a circle from one side of the line to the other.
  const cap = (p: V2, n: V2, sign: number): V2[] =>
    Array.from({ length: 9 }, (_, i): V2 => {
      const a = Math.atan2(n[1], n[0]) - (sign * Math.PI * (i + 1)) / 10;
      return [p[0] + Math.cos(a) * h, p[1] + Math.sin(a) * h];
    });
  const end = pts.length - 1;
  return [...left, ...cap(pts[end], normal(end), 1), ...right.reverse(), ...cap(pts[0], [-normal(0)[0], -normal(0)[1]], 1)];
}
// How a part is filled: tinted in heather (the body of a mark) or solid
// ink (eyes, a mouth, a stem). The kind is the part's id.
const TINT = ACCENT_ID;
const INK = INK_FILL_ID;
const MARK_DEPTH = 1.4;
// Features stand in shallow relief on a mark's face.
const RELIEF = 0.24;
const on = (front: number, layer = 1) => front + RELIEF * (layer - 0.5);

// The cloud and the ghost: heather solids with their faces in ink.
const arcPts = (cx: number, cy: number, r: number, a0: number, a1: number): V2[] =>
  Array.from({ length: 25 }, (_, i): V2 => {
    const a = a0 + ((a1 - a0) * i) / 24;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
const FRONT = MARK_DEPTH / 2;
const CLOUD: Part[] = [
  { outline: cloud(), kind: TINT },
  { outline: circle(-1.6, 0.5, 0.62, 32), depth: RELIEF, z: on(FRONT), kind: INK },
  { outline: circle(1.6, 0.5, 0.62, 32), depth: RELIEF, z: on(FRONT), kind: INK },
  { outline: stroke(arcPts(0, -0.1, 1.25, Math.PI * 1.15, Math.PI * 1.85), 0.5), depth: RELIEF, z: on(FRONT), kind: INK },
];
// The sprout: a soft pebble with a face, a stem and two leaves coming up
// out of its crown.
const pebble = (): V2[] =>
  Array.from({ length: 120 }, (_, i): V2 => {
    const t = (i / 120) * Math.PI * 2;
    return [4.6 * Math.cos(t), -1.4 + (Math.sin(t) > 0 ? 4.2 : 3.6) * Math.sin(t)];
  });
const leaf = (base: V2, c1: V2, c2: V2, tip: V2, c3: V2, c4: V2): V2[] => [...bez([base, c1, c2, tip]), ...bez([tip, c3, c4, base]).slice(1, -1)];
const SPROUT: Part[] = [
  { outline: stroke(bez([[0, 2.2], [0, 3.4], [0.3, 4], [0.2, 4.8]], 12), 0.55), depth: 0.6, kind: INK },
  { outline: leaf([0.2, 4.6], [0.9, 6.3], [2.8, 6.6], [3.8, 5.9], [2.8, 4.6], [1.2, 4.2]), depth: 0.8, kind: TINT },
  { outline: leaf([0.1, 4.7], [-0.6, 5.9], [-2, 6.2], [-2.9, 5.6], [-2, 4.6], [-0.9, 4.4]), depth: 0.8, kind: TINT },
  { outline: pebble(), kind: TINT },
  { outline: circle(-1.6, -0.6, 0.6, 32), depth: RELIEF, z: on(FRONT), kind: INK },
  { outline: circle(1.6, -0.6, 0.6, 32), depth: RELIEF, z: on(FRONT), kind: INK },
  { outline: stroke(arcPts(0, -1.3, 1.15, Math.PI * 1.15, Math.PI * 1.85), 0.5), depth: RELIEF, z: on(FRONT), kind: INK },
];
const GHOST: Part[] = [
  { outline: ghost(), kind: TINT },
  { outline: rounded(1.3, 2, 0.65, -1.6, 1.3, 8), depth: RELIEF, z: on(FRONT), kind: INK },
  { outline: rounded(1.3, 2, 0.65, 1.6, 1.3, 8), depth: RELIEF, z: on(FRONT), kind: INK },
  { outline: circle(0, -1.1, 0.55, 32), depth: RELIEF, z: on(FRONT), kind: INK },
];

// The marks, in turn: a cloud, a sprout, a ghost.
const MARKS: Part[][] = [CLOUD, SPROUT, GHOST];

// What fills the box, in units, for each figure.
const EXTENT: Record<FigureKind, number> = { identity: 15, website: 25, system: 17 };

export function FigureDrawing({ kind, className }: { kind: FigureKind; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let raf = 0;
    let visible = false;
    let onWake = () => {};
    let onResize = () => {};
    let dispose = () => {};
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      onWake();
    });
    io.observe(host);
    const ro = new ResizeObserver(() => onResize());
    ro.observe(host);
    const wake = () => onWake();
    document.addEventListener("visibilitychange", wake);

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const art = lineDrawing(THREE, host, () => frame(), { smooth: true, accent: "--heather", fill: true });
      const root = new THREE.Group();
      art.scene.add(root);

      // A solid from an outline with holes, extruded `depth`: lying flat
      // (rising from y) or, `upright`, standing in the view's plane, centred
      // on its depth.
      const solid = (parent: Three.Object3D, o: { outline: V2[]; holes?: V2[][] }, depth: number, id: number, upright = false) => {
        const shape = new THREE.Shape(o.outline.map(([x, y]) => new THREE.Vector2(x, y)));
        for (const h of o.holes ?? []) shape.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
        const g = art.keep(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 }));
        if (upright) g.translate(0, 0, -depth / 2);
        else g.rotateX(-Math.PI / 2);
        const m = new THREE.Mesh(g, art.surface(id));
        parent.add(m);
        return m;
      };

      let look = new THREE.Vector3();
      let animate: (t: number) => void = () => {};

      if (kind === "identity") {
        const marks = MARKS.map((parts, i) => {
          const g = new THREE.Group();
          // One part id to a mark, so where its pieces cross, their flush
          // faces read as one surface.
          parts.forEach((p) => (solid(g, p, p.depth ?? MARK_DEPTH, p.kind ?? TINT, true).position.z = p.z ?? 0));
          g.visible = i === 0;
          root.add(g);
          return g;
        });
        look = new THREE.Vector3(0, 0, 0);
        animate = (t) => {
          // Each cycle: hold, swaying, then turn edge on, change, and come
          // round; the sway carries on through it.
          const cycle = MARK_HOLD + MARK_TURN;
          const n = Math.floor(t / cycle);
          const into = t - n * cycle - MARK_HOLD;
          let turn = 0;
          let shown = n % marks.length;
          if (into > 0) {
            const k = easeInOut(into / MARK_TURN);
            if (k < 0.5) turn = k * Math.PI;
            else {
              turn = (k - 1) * Math.PI;
              shown = (n + 1) % marks.length;
            }
          }
          marks.forEach((g, i) => (g.visible = i === shown));
          root.rotation.y = Math.sin(t * 0.5) * 0.32 + turn;
        };
      }

      if (kind === "website") {
        // Three plates, bottom up; the top one carries a grid of tiles.
        const THICK = 0.9;
        const GAP = 4.2;
        const W = 20;
        const D = 14;
        const plates = [0, 1, 2].map((i) => {
          const g = new THREE.Group();
          solid(g, { outline: rounded(W, D, 1.2) }, THICK, i + 1);
          root.add(g);
          return g;
        });
        const top = plates[2];
        for (let a = 0; a < 4; a++)
          for (let b = 0; b < 3; b++) {
            const tile = solid(top, { outline: rounded(4, 3.4, 0.4, (a - 1.5) * 4.6, (b - 1) * 4) }, 0.2, 4);
            tile.position.y = THICK;
          }
        // Guides at the corners, from the bottom plate up to the top.
        const guideMat = art.lineMat(0.2);
        const c = W / 2 - 1.2 + 1.2 * Math.SQRT1_2;
        const e = D / 2 - 1.2 + 1.2 * Math.SQRT1_2;
        const guides = [
          [-c, -e],
          [c, -e],
          [-c, e],
          [c, e],
        ].map(([x, z]) => {
          const geo = art.keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)]));
          const l = new THREE.Line(geo, guideMat);
          l.layers.set(1);
          l.frustumCulled = false;
          l.position.set(x, THICK, z);
          root.add(l);
          return l;
        });
        animate = (t) => {
          // Open, hold, close, hold.
          const cycle = 2 * (PLATE_HOLD + PLATE_MOVE);
          const into = t % cycle;
          const half = PLATE_HOLD + PLATE_MOVE;
          const open = into < half ? 1 - easeInOut((into - PLATE_HOLD) / PLATE_MOVE) : easeInOut((into - half - PLATE_HOLD) / PLATE_MOVE);
          plates.forEach((g, i) => (g.position.y = i * (THICK + GAP * open)));
          const rise = THICK + 2 * GAP * open;
          for (const l of guides) l.scale.y = Math.max(0.001, rise);
          look = new THREE.Vector3(0, (2 * THICK + 2 * GAP * open) / 2, 0);
          root.rotation.y = Math.sin(t * 0.3) * 0.2;
        };
      }

      if (kind === "system") {
        // Two rings, each through the other: one standing, one lying flat
        // with its centre on the first's line.
        const R = 5.2;
        const ring = { outline: circle(0, 0, R + 0.7, 96), holes: [circle(0, 0, R - 0.7, 96)] };
        const standing = solid(root, ring, 1.2, 1, true);
        standing.position.x = -R / 2;
        const flat = new THREE.Group();
        flat.position.set(R / 2, -0.6, 0);
        solid(flat, ring, 1.2, 2);
        root.add(flat);
        animate = (t) => {
          root.rotation.y = t * 0.16;
        };
      }

      let width = 0;
      let height = 0;
      let scale = 1;
      const fit = () => {
        width = host.clientWidth;
        height = host.clientHeight;
        if (!width || !height) return;
        art.setSize(width, height);
        scale = (Math.min(width, height) * 0.86) / EXTENT[kind];
        frame();
      };

      const start = performance.now();
      function frame(now = performance.now()) {
        if (!width || !height) return;
        animate(reduce ? 0 : (now - start) / 1000);
        art.aim(look, width, height, scale);
        root.updateMatrixWorld();
        art.render();
      }

      const loop = (now: number) => {
        raf = 0;
        frame(now);
        if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(loop);
      };
      onWake = () => {
        if (!raf && !reduce && visible && !document.hidden) raf = requestAnimationFrame(loop);
      };
      onResize = fit;
      dispose = () => art.dispose();
      fit();
      onWake();
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", wake);
      dispose();
    };
  }, [kind]);

  return <div ref={hostRef} className={className} aria-hidden />;
}
