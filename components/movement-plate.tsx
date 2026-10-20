"use client";

import { useEffect, useRef } from "react";
import type * as Three from "three";
import { ACCENT_ID, ELEVATION, ease, easeInOut, lineDrawing } from "@/components/line-drawing";
import { TAU, circle, hull, partsKit, teeth, windows, type V2 } from "@/components/watch-parts";

// The homepage's opening plate: a mechanical watch movement drawn as an
// exploded axonometric, the way service manuals and patent drawings show
// one. Every part is real geometry (three.js), modelled here in millimetres:
// a mainplate with its pillars and jewels, the barrel and the going train,
// the escapement, the balance and its hairspring, the bridges, their screws
// and the rotor. It is rendered as a hidden-line drawing (line-drawing.ts),
// so only the edges you could actually see are drawn; arbor axes and the
// hairspring are true lines, hidden where a part stands in front of them.
//
// On arrival the finished movement is drawn in from the plate up, framed
// close; a breath later it opens into its exploded stack, the top lifting
// first, as the camera eases back to take it all in.
// With `assemble` (the close every page ends on) it runs the other way: the
// parts wait above, out of frame, and once it's well in view they come down
// and are set into one another, the plate's own parts first, framed on the
// finished movement.
//
// With `opened` set, the page holds it: closed while it's false, and opened
// while it's true (the sign-in page opens it while you're signed in), the
// camera easing back from the finished movement to take in the open stack,
// and closing back the same way.
// After that it sways very slowly, the balance swings and the rotor turns on its bearing. The
// balance, the heart of the movement, is the one part in the signal blue.
// With reduced motion it is drawn exploded and holds still.
//
// Rendering pauses off screen and in hidden tabs; three.js is imported on
// mount.

// Where the parts sit on the plate, in mm from its centre (y toward 12
// o'clock): the barrel, the going train, the escapement and the balance.
const BARREL: V2 = [-4.9, 4.85];
const CENTER: V2 = [0, 0];
const THIRD: V2 = [5.15, -2.98];
const FOURTH: V2 = [3.41, -7.77];
const ESCAPE: V2 = [-0.91, -9.34];
const PALLET: V2 = [-4.0, -8.6];
const BALANCE: V2 = [-7.6, -6.6];
const COCK_FOOT: V2 = [-11.2, -1.8];
const SCREWS: V2[] = [
  [-9.8, 7.6],
  [-1.6, 9.5],
  [-1.2, 1.4],
  [2.6, -6.6],
  [5.9, -5.3],
  COCK_FOOT,
];

// The air under every part when opened, in mm.
const GAP = 2.4;

type Part = {
  // The order it opens in, top of the stack first.
  order: number;
  // Parts of one tier stand at one height: the bridges, on one plane.
  tier?: string;
  // How many gaps of air it takes, opened: the rotor, the cover over
  // everything, stands clear by more, so nothing under it reads as part of
  // it wherever it swings.
  air?: number;
  accent?: boolean;
  group: Three.Group;
  // Height of the part's base, closed and opened, in mm (set by stack()).
  seat: number;
  lift: number;
};

// A solid of a part, as the stack sees it: a circle on the plate (about its
// axis, for the parts that turn, so it clears wherever it swings), its box,
// and the heights it spans above the part's base.
type Extent = {
  x: number;
  z: number;
  r: number;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  lo: number;
  hi: number;
  // Arbors, staffs, shanks and stones: thin enough to pass through a
  // jewel, so a closed movement lets them through other parts.
  pin: boolean;
};

function overlaps(a: Extent, b: Extent) {
  const e = 0.05;
  return (
    Math.hypot(a.x - b.x, a.z - b.z) < a.r + b.r - e &&
    a.x0 < b.x1 - e &&
    b.x0 < a.x1 - e &&
    a.z0 < b.z1 - e &&
    b.z0 < a.z1 - e
  );
}

export function MovementPlate({ assemble = false, opened }: { assemble?: boolean; opened?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  // Held by the page: read each frame, so a change animates without
  // rebuilding the drawing.
  const held = opened !== undefined;
  const openedRef = useRef(opened ?? false);
  openedRef.current = opened ?? false;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // The camera's ends are set by fit(); the drawing redraws on a theme
      // change.
      const art = lineDrawing(THREE, host, () => frame());
      const { scene, lineMat } = art;
      const root = new THREE.Group();
      scene.add(root);
      const axisMat = lineMat(0.2);
      const springMat = lineMat(0.95, true);

      // Modelling (watch-parts.ts).
      const { extrude, solid, ring, disc, polyline, wheel } = partsKit(THREE, art);
      let nextId = 1;

      const parts: Part[] = [];
      const part = (p: Omit<Part, "group" | "seat" | "lift">) => {
        const group = new THREE.Group();
        root.add(group);
        const full: Part = { ...p, group, seat: 0, lift: 0 };
        parts.push(full);
        return full;
      };

      // The mainplate: notched for the winding stem, pierced at every
      // pivot, with a jewel at each and pillars where the bridges stand.
      {
        const p = part({ order: 13 });
        const id = nextId++;
        const notch = 0.9;
        const a = Math.asin(notch / 15);
        const outline: V2[] = [];
        for (let i = 0; i <= 120; i++) {
          const ang = a + ((TAU - 2 * a) * i) / 120;
          outline.push([Math.cos(ang) * 15, Math.sin(ang) * 15]);
        }
        outline.push([12.2, -notch], [12.2, notch]);
        const pivots: [V2, number][] = [
          [BARREL, 0.9],
          [CENTER, 0.55],
          [THIRD, 0.45],
          [FOURTH, 0.45],
          [ESCAPE, 0.4],
          [PALLET, 0.35],
          [BALANCE, 0.45],
        ];
        solid(p.group, extrude(outline, pivots.map(([[x, y], r]) => circle(x, y, r, 32)), 1.2), 0, id);
        for (const [[x, y], r] of pivots) solid(p.group, ring(r + 0.55, r, 0.22), 1.2, id, x, y);
        for (const [x, y] of SCREWS) solid(p.group, ring(0.95, 0.35, 1.6), 1.2, id, x, y);
      }

      // The barrel: the mainspring's drum on its toothed rim.
      {
        const p = part({ order: 12 });
        const g = new THREE.Group();
        g.position.set(BARREL[0], 0, -BARREL[1]);
        p.group.add(g);
        const id = nextId++;
        solid(g, extrude(teeth(6, 84, 0.34), [circle(0, 0, 0.9, 32)], 0.42), 0, id);
        solid(g, ring(5.5, 0.9, 1.8), 0.42, id);
        solid(g, ring(2.3, 0.9, 0.16), 2.22, id);
        solid(g, ring(1.25, 0.9, 0.5), 2.22, id);
      }

      // The going train, each wheel over the last.
      const train: [V2, number, number, number, number, number, boolean?][] = [
        // at, r, teeth, spokes, pinion, order, ratchet
        [CENTER, 5.2, 80, 4, 0.9, 11],
        [THIRD, 4.4, 75, 5, 0.75, 10],
        [FOURTH, 4.0, 70, 5, 0.7, 9],
        [ESCAPE, 2.6, 20, 4, 0.6, 8, true],
      ];
      for (const [at, r, n, spokes, pinion, order, ratchet] of train) {
        const p = part({ order });
        const g = new THREE.Group();
        g.position.set(at[0], 0, -at[1]);
        p.group.add(g);
        wheel(g, { r, n, spokes, pinion, ratchet, id: nextId++ });
      }

      // The pallet fork: a lever toward the balance, two arms carrying
      // the pallet stones over the escape wheel.
      {
        const p = part({ order: 7 });
        const id = nextId++;
        const toward = (from: V2, to: V2, len: number, turn = 0): V2 => {
          const ang = Math.atan2(to[1] - from[1], to[0] - from[0]) + turn;
          return [from[0] + Math.cos(ang) * len, from[1] + Math.sin(ang) * len];
        };
        const lever = toward(PALLET, BALANCE, 2.4);
        const armA = toward(PALLET, ESCAPE, 2.3, 0.62);
        const armB = toward(PALLET, ESCAPE, 2.3, -0.62);
        solid(p.group, extrude(hull([[PALLET[0], PALLET[1], 0.55], [lever[0], lever[1], 0.28]]), [circle(PALLET[0], PALLET[1], 0.18, 24)], 0.3), 0, id);
        for (const arm of [armA, armB]) {
          solid(p.group, extrude(hull([[PALLET[0], PALLET[1], 0.42], [arm[0], arm[1], 0.26]]), [], 0.3), 0, id);
          solid(p.group, extrude(circle(arm[0], arm[1], 0.22, 24), [], 0.55), 0.3, id);
        }
        const axis = new THREE.Group();
        axis.position.set(PALLET[0], -2.2, -PALLET[1]);
        p.group.add(axis);
        solid(axis, disc(0.15, 2.8), 0, id);
      }

      // The balance, with its hairspring: the one part in blue. It swings.
      let balanceSpin: Three.Group | null = null;
      {
        const p = part({ order: 6, accent: true });
        const id = ACCENT_ID;
        const g = new THREE.Group();
        g.position.set(BALANCE[0], 0, -BALANCE[1]);
        p.group.add(g);
        balanceSpin = g;
        solid(g, extrude(circle(0, 0, 4.2), [...windows(0.85, 3.6, 3, 0.5, 0.5), circle(0, 0, 0.2, 24)], 0.5), 0, id);
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU + 0.26;
          solid(g, disc(0.22, 0.28), 0.5, id, Math.cos(a) * 3.9, Math.sin(a) * 3.9);
        }
        solid(g, ring(1.05, 0.2, 0.3), -0.9, id);
        solid(g, disc(0.2, 4.4), -2.0, id);
        const spring: Three.Vector3[] = [];
        const turns = 11;
        for (let i = 0; i <= turns * 120; i++) {
          const f = i / (turns * 120);
          const a = f * turns * TAU;
          const r = 0.75 + f * 2.3;
          spring.push(new THREE.Vector3(Math.cos(a) * r, 1.05, -Math.sin(a) * r));
        }
        polyline(g, spring, springMat);
      }

      // The bridges: the balance cock, the train bridge, and the
      // barrel bridge, each pierced for its jewels and screws.
      const bridge = (outline: V2[], jewels: [V2, number][], screws: V2[], order: number) => {
        const p = part({ order, tier: "bridge" });
        const id = nextId++;
        solid(
          p.group,
          extrude(outline, [...jewels.map(([[x, y], r]) => circle(x, y, r, 32)), ...screws.map(([x, y]) => circle(x, y, 0.4, 24))], 0.9),
          0,
          id,
        );
        for (const [[x, y], r] of jewels) solid(p.group, ring(r + 0.5, r, 0.2), 0.9, id, x, y);
        return p;
      };
      bridge(hull([[BALANCE[0], BALANCE[1], 1.7], [COCK_FOOT[0], COCK_FOOT[1], 2.5]]), [[BALANCE, 0.4]], [COCK_FOOT], 5);
      bridge(
        hull([
          [THIRD[0], THIRD[1], 2.2],
          [FOURTH[0], FOURTH[1], 2.2],
          [ESCAPE[0], ESCAPE[1], 2.0],
        ]),
        [
          [THIRD, 0.4],
          [FOURTH, 0.4],
          [ESCAPE, 0.35],
        ],
        [SCREWS[3], SCREWS[4]],
        4,
      );
      bridge(
        hull([
          [BARREL[0], BARREL[1], 6.6],
          [CENTER[0], CENTER[1], 2.0],
        ]),
        [
          [BARREL, 0.9],
          [CENTER, 0.5],
        ],
        [SCREWS[0], SCREWS[1], SCREWS[2]],
        3,
      );

      // The ratchet wheel, which holds the mainspring wound.
      {
        const p = part({ order: 2 });
        const g = new THREE.Group();
        g.position.set(BARREL[0], 0, -BARREL[1]);
        p.group.add(g);
        const id = nextId++;
        solid(g, extrude(teeth(3.4, 42, 0.32, true), [circle(0, 0, 0.55, 24)], 0.5), 0, id);
        solid(g, ring(1.3, 0.55, 0.2), 0.5, id);
      }

      // The screws, each over the pillar it fastens to.
      {
        const p = part({ order: 1 });
        const id = nextId++;
        for (const [x, y] of SCREWS) {
          const g = new THREE.Group();
          g.position.set(x, 0, -y);
          g.rotation.y = (x * 7 + y * 3) % TAU;
          p.group.add(g);
          solid(g, disc(0.78, 0.18), 0, id);
          // The slotted head: two halves either side of the slot.
          const half: V2[] = [];
          for (let i = 0; i <= 24; i++) {
            const a = Math.asin(0.09 / 0.78) + ((Math.PI - 2 * Math.asin(0.09 / 0.78)) * i) / 24;
            half.push([Math.cos(a) * 0.78, Math.sin(a) * 0.78]);
          }
          const g1 = extrude(half, [], 0.3);
          solid(g, g1, 0.18, id);
          const m = solid(g, g1, 0.18, id);
          m.rotation.y = Math.PI;
          solid(g, disc(0.34, 1.7), -1.7, id);
        }
      }

      // The rotor: a heavy-rimmed half disc on a ball bearing. It turns.
      let rotorSpin: Three.Group | null = null;
      {
        const p = part({ order: 0, air: 3.5 });
        const g = new THREE.Group();
        p.group.add(g);
        rotorSpin = g;
        const id = nextId++;
        const sector = (r0: number, r1: number, a0: number, a1: number): V2[] => {
          const pts: V2[] = [];
          for (let i = 0; i <= 96; i++) {
            const a = a0 + ((a1 - a0) * i) / 96;
            pts.push([Math.cos(a) * r1, Math.sin(a) * r1]);
          }
          for (let i = 48; i >= 0; i--) {
            const a = a0 + ((a1 - a0) * i) / 48;
            pts.push([Math.cos(a) * r0, Math.sin(a) * r0]);
          }
          return pts;
        };
        const lights = [0.55, 1.05, 1.57, 2.09, 2.59].map((a) => circle(Math.cos(a) * 8, Math.sin(a) * 8, 1.15, 40));
        solid(g, extrude(sector(2.6, 12.4, 0.08, Math.PI - 0.08), lights, 0.5), 0.9, id);
        solid(g, extrude(sector(12.2, 14.3, 0.04, Math.PI - 0.04), [], 1.4), 0, id);
        solid(g, ring(2.8, 1.3, 1.4), 0, id);
        solid(g, ring(1.3, 0.5, 1.7), -0.15, id);
      }

      // Stacking, from the plate up: each part rests on the highest solid
      // beneath any of its own. Closed, flush, with the pins passing
      // through; opened, with the same air under every part, so the stack
      // reads in one rhythm and no part runs into another.
      root.updateMatrixWorld(true);
      const spins = [balanceSpin, rotorSpin] as Three.Object3D[];
      const extents = new Map<Part, Extent[]>();
      for (const p of parts) {
        const list: Extent[] = [];
        p.group.traverse((o) => {
          if (!(o instanceof THREE.Mesh)) return;
          const pos = o.geometry.getAttribute("position");
          const pts: Three.Vector3[] = [];
          for (let i = 0; i < pos.count; i++) pts.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld));
          const box = new THREE.Box3().setFromPoints(pts);
          let spin = o.parent;
          while (spin && !spins.includes(spin)) spin = spin.parent;
          const c = spin ? new THREE.Vector3().setFromMatrixPosition(spin.matrixWorld) : box.getCenter(new THREE.Vector3());
          const r = pts.reduce((m, q) => Math.max(m, Math.hypot(q.x - c.x, q.z - c.z)), 0);
          list.push({
            x: c.x,
            z: c.z,
            r,
            x0: spin ? c.x - r : box.min.x,
            x1: spin ? c.x + r : box.max.x,
            z0: spin ? c.z - r : box.min.z,
            z1: spin ? c.z + r : box.max.z,
            lo: box.min.y,
            hi: box.max.y,
            pin: r <= 0.4,
          });
        });
        extents.set(p, list);
      }
      const stack = (gap: number, pins: boolean) => {
        const at = new Map<Part, number>();
        const rest = (p: Part) => {
          let y = 0;
          for (const [q, y0] of at)
            for (const a of extents.get(p)!)
              for (const b of extents.get(q)!)
                if ((pins || !(a.pin || b.pin)) && overlaps(a, b)) y = Math.max(y, y0 + b.hi - a.lo + gap * (p.air ?? 1));
          return y;
        };
        const upward = [...parts].sort((a, b) => b.order - a.order);
        for (const p of upward) {
          if (at.has(p)) continue;
          const tier = p.tier ? upward.filter((q) => q.tier === p.tier) : [p];
          const y = Math.max(...tier.map(rest));
          for (const q of tier) at.set(q, y);
        }
        return at;
      };
      const closedAt = stack(0, false);
      const openAt = stack(GAP, true);
      for (const p of parts) {
        p.seat = closedAt.get(p)!;
        p.lift = openAt.get(p)!;
      }
      // The top of the stack, closed and opened, in mm.
      const topOf = (at: Map<Part, number>) =>
        Math.max(...parts.map((p) => at.get(p)! + Math.max(...extents.get(p)!.map((e) => e.hi))));
      const shutTop = topOf(closedAt);
      const openTop = topOf(openAt);

      // The axes the parts were lifted along, from the plate to the top of
      // each part's stack.
      const axes: { line: Three.Line; top: () => number }[] = [];
      const liftOf = (order: number) => parts.find((p) => p.order === order)!.group;
      const axisTo = (at: V2, top: () => number) => {
        const l = polyline(root, [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)], axisMat);
        l.position.set(at[0], 1.2, -at[1]);
        axes.push({ line: l, top });
      };
      axisTo(BARREL, () => liftOf(2).position.y);
      axisTo(CENTER, () => liftOf(0).position.y - 0.2);
      axisTo(THIRD, () => liftOf(4).position.y);
      axisTo(FOURTH, () => liftOf(4).position.y);
      axisTo(ESCAPE, () => liftOf(4).position.y);
      axisTo(PALLET, () => liftOf(7).position.y);
      axisTo(BALANCE, () => liftOf(5).position.y);
      for (const s of SCREWS) axisTo(s, () => liftOf(1).position.y - 1.7);

      // Fitting the stack to the box. The opening plate (neither held nor
      // assembling) starts framed close on the finished movement and eases
      // back as it opens, as a held one does.
      const hero = !held && !assemble;
      const box: HTMLElement = host;
      let width = 0;
      let height = 0;
      const fit = () => {
        width = host.clientWidth;
        height = host.clientHeight;
        if (!width || !height) return;
        art.setSize(width, height);
        const tall = openTop * Math.cos(ELEVATION) + 30 * Math.sin(ELEVATION);
        openFrame.scale = Math.min((height * 0.94) / tall, (width * 0.92) / 30);
        // The finished movement, framed close.
        const shut = shutTop;
        shutFrame.scale = Math.min(
          (height * (hero ? 0.64 : 0.82)) / (shut * Math.cos(ELEVATION) + 30 * Math.sin(ELEVATION)),
          (width * (assemble ? 0.9 : 0.68)) / 30,
        );
        shutFrame.y = shut / 2;
        // Assembling, it's framed on the finished movement and the open
        // stack runs off the top; held, frame() eases between the two.
        if (assemble) {
          // The finished movement stands in the lower part of the box; above
          // it is the air the parts come down through, which the close fades
          // in from the paper.
          const shutTall = shut * Math.cos(ELEVATION) + 30 * Math.sin(ELEVATION);
          const s = Math.min((height * 0.56) / shutTall, (width * 0.9) / 30);
          const lower = (0.18 * height) / (s * Math.cos(ELEVATION));
          art.aim(new THREE.Vector3(0, shut / 2 + lower, 0), width, height, s);
        } else {
          art.aim(new THREE.Vector3(0, openFrame.y, 0), width, height, openFrame.scale);
        }
        frame();
      };
      const openFrame = { y: openTop / 2 - 0.5, scale: 1 };
      const shutFrame = { y: 0, scale: 1 };

      const OPEN = 2.6;
      const STAGGER = 0.07;
      // The opening plate: how long it takes to draw in, and when, a breath
      // after, it starts to open, in seconds.
      const DRAW_IN = 1.2;
      const OPEN_AT = DRAW_IN + 0.3;
      const start = performance.now();
      // When the closing assembly began, once it was well in view.
      let begun = 0;
      // Held: where it was when it last turned, which way, and when.
      let heldFrom = openedRef.current ? 1 : 0;
      let heldTo = heldFrom;
      let heldAt = 0;
      let heldNow = heldFrom;

      function frame(now = performance.now()) {
        if (!width || !height) return;
        const t = reduce ? 1e6 : (now - start) / 1000;

        // Opening: the top of the stack lifts first. Assembling: the plate's
        // own parts settle first, the rotor last.
        if (held && (openedRef.current ? 1 : 0) !== heldTo) {
          heldFrom = heldNow;
          heldTo = openedRef.current ? 1 : 0;
          heldAt = now;
        }
        const heldSince = reduce ? 1e6 : (now - heldAt) / 1000;
        for (const p of parts) {
          let k: number;
          if (held) {
            // Opening, the top lifts first; closing, the bottom settles first.
            const delay = (heldTo > heldFrom ? p.order : 13 - p.order) * STAGGER;
            k = heldFrom + (heldTo - heldFrom) * ease((heldSince - delay) / OPEN);
          } else if (assemble) {
            const since = reduce ? 1e6 : begun ? (now - begun) / 1000 : -1;
            k = since < 0 ? 1 : 1 - ease((since - (13 - p.order) * STAGGER) / OPEN);
          } else {
            k = easeInOut((t - OPEN_AT - p.order * STAGGER) / OPEN);
          }
          p.group.position.y = p.seat + (p.lift - p.seat) * k;
        }
        for (const a of axes) a.line.scale.y = Math.max(0.001, a.top() - 1.2);
        if (hero) {
          // Drawn in from the plate up, under a soft edge rising through
          // the box; then, as it opens, the camera eases back from the
          // finished movement to take in the open stack.
          const drawn = easeInOut(t / DRAW_IN);
          const edge = drawn < 1 ? `linear-gradient(to top, #000 ${drawn * 130 - 30}%, transparent ${drawn * 130}%)` : "";
          box.style.setProperty("mask-image", edge);
          box.style.setProperty("-webkit-mask-image", edge);
          // In step with the rotor, the first and highest part, so the
          // stack never runs out of the frame.
          const back = easeInOut((t - OPEN_AT) / OPEN);
          art.aim(
            new THREE.Vector3(0, shutFrame.y + (openFrame.y - shutFrame.y) * back, 0),
            width,
            height,
            shutFrame.scale + (openFrame.scale - shutFrame.scale) * back,
          );
        }
        if (held) {
          // The camera eases back as it opens, in on it as it closes.
          heldNow = heldFrom + (heldTo - heldFrom) * ease(heldSince / (OPEN + 13 * STAGGER));
          art.aim(
            new THREE.Vector3(0, shutFrame.y + (openFrame.y - shutFrame.y) * heldNow, 0),
            width,
            height,
            shutFrame.scale + (openFrame.scale - shutFrame.scale) * heldNow,
          );
        }

        if (!reduce) {
          root.rotation.y = Math.sin((t / 48) * TAU) * 0.16;
          if (balanceSpin) balanceSpin.rotation.y = Math.sin((t / 3.2) * TAU) * 1.4;
          if (rotorSpin) rotorSpin.rotation.y = Math.sin((t / 22) * TAU) * 0.7;
        }
        root.updateMatrixWorld();
        art.render();
      }

      let raf = 0;
      let visible = true;
      const loop = (now: number) => {
        raf = 0;
        frame(now);
        if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(loop);
      };
      const resume = () => {
        if (!raf && !reduce && visible && !document.hidden) raf = requestAnimationFrame(loop);
      };
      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (assemble && !begun && entry.intersectionRatio >= 0.5) begun = performance.now();
          resume();
        },
        { threshold: [0, 0.5] },
      );
      io.observe(host);
      document.addEventListener("visibilitychange", resume);
      const ro = new ResizeObserver(fit);
      ro.observe(host);
      fit();
      resume();

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
    // `opened` is read through its ref; only whether it's held rebuilds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assemble, held]);

  return (
    <div ref={hostRef} className="movement-plate" aria-hidden />
  );
}
