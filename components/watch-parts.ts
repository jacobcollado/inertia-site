import type * as Three from "three";
import type { LineDrawing } from "@/components/line-drawing";

// Watch parts for the site's drawings: the outlines (circles, the hull of a
// bridge or lever, toothed rims, spoke windows) and a kit that turns them
// into solids for a line drawing (line-drawing.ts). Shared by the opening
// plate (movement-plate.tsx) and the figures of what we do (what-we-do.tsx),
// so every part is cut the same way. Everything is in millimetres; shapes
// are drawn in plate coordinates, y toward 12 o'clock, and extruded up, so
// plate (x, y) becomes world (x, -z).

export type V2 = [number, number];

export const TAU = Math.PI * 2;

export function circle(cx: number, cy: number, r: number, n = 96): V2[] {
  const pts: V2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

// The convex hull of a set of circles: the outline of a bridge or a lever.
export function hull(circles: [number, number, number][]): V2[] {
  const pts: V2[] = circles.flatMap(([x, y, r]) => circle(x, y, r, 64));
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: V2, a: V2, b: V2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: V2[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: V2[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// A toothed outline. `ratchet` gives the hooked, one-way teeth of an escape
// or ratchet wheel instead of the symmetric teeth of the train. A tooth of
// the train is centred 0.64 of a pitch round from its start, and the gap
// before the next 0.14 of a pitch round.
// With `skip`, that tooth is left off, its place cut down to the root.
export function teeth(r: number, n: number, depth: number, ratchet = false, skip = -1): V2[] {
  const pts: V2[] = [];
  const root = r - depth;
  const profile: [number, number][] = ratchet
    ? [
        [0, root],
        [0.28, root],
        [0.34, r],
        [0.46, r],
        [0.98, root + depth * 0.08],
      ]
    : TRAIN_TOOTH.map(([f, k]) => [f, root + depth * k]);
  for (let i = 0; i < n; i++) {
    for (const [f, rad] of profile) {
      const a = ((i + f) / n) * TAU;
      const at = i === skip ? root : rad;
      pts.push([Math.cos(a) * at, Math.sin(a) * at]);
    }
  }
  return pts;
}

// A train tooth's profile: fraction of a pitch round, and height as a share
// of its depth.
const TRAIN_TOOTH: [number, number][] = [
  [0, 0],
  [0.38, 0],
  [0.48, 0.88],
  [0.53, 1],
  [0.75, 1],
  [0.8, 0.88],
  [0.9, 0],
];

// Tooth i of a train wheel on its own, reaching `into` below the root so it
// sits in the rim like it was cut with it.
export function tooth(r: number, n: number, depth: number, i: number, into = 0.5): V2[] {
  const root = r - depth;
  const at = (f: number, rad: number): V2 => {
    const a = ((i + f) / n) * TAU;
    return [Math.cos(a) * rad, Math.sin(a) * rad];
  };
  return [at(0.38, root - into), ...TRAIN_TOOTH.slice(1, -1).map(([f, k]) => at(f, root + depth * k)), at(0.9, root - into)];
}

// The windows between a wheel's spokes, from its hub out to its rim.
export function windows(hub: number, rim: number, spokes: number, width: number, phase = 0): V2[][] {
  const out: V2[][] = [];
  const inner = Math.asin(Math.min(0.95, width / 2 / hub));
  const outer = Math.asin(Math.min(0.95, width / 2 / rim));
  for (let k = 0; k < spokes; k++) {
    const a0 = phase + (k / spokes) * TAU;
    const a1 = phase + ((k + 1) / spokes) * TAU;
    const pts: V2[] = [];
    const steps = 32;
    for (let i = 0; i <= steps; i++) {
      const a = a0 + outer + ((a1 - outer - (a0 + outer)) * i) / steps;
      pts.push([Math.cos(a) * rim, Math.sin(a) * rim]);
    }
    for (let i = steps / 4; i >= 0; i--) {
      const a = a0 + inner + ((a1 - inner - (a0 + inner)) * i) / (steps / 4);
      pts.push([Math.cos(a) * hub, Math.sin(a) * hub]);
    }
    out.push(pts);
  }
  return out;
}

// How deep a wheel's teeth are cut, for its size and count.
export function toothDepth(r: number, n: number) {
  return Math.min(0.42, (TAU * r) / n / 1.6);
}

// The kit: outlines into solids, in a drawing.
// A rounded rectangle centred on (cx, cy), w by h, corner radius r. Its
// corners are fine enough (16 facets by default) that the drawing reads each
// as one curve, not a row of small edges.
export function rounded(w: number, h: number, r: number, cx = 0, cy = 0, n = 16): V2[] {
  const pts: V2[] = [];
  const corners: [number, number, number][] = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, Math.PI / 2],
    [-w / 2 + r, -h / 2 + r, Math.PI],
    [w / 2 - r, -h / 2 + r, (3 * Math.PI) / 2],
  ];
  for (const [x, y, a0] of corners)
    for (let i = 0; i <= n; i++) {
      const a = a0 + (Math.PI / 2) * (i / n);
      pts.push([cx + x + Math.cos(a) * r, cy + y + Math.sin(a) * r]);
    }
  return pts;
}

export function partsKit(THREE: typeof import("three"), art: LineDrawing) {
  const extrude = (outline: V2[], holes: V2[][], h: number) => {
    const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
    for (const hole of holes) shape.holes.push(new THREE.Path(hole.map(([x, y]) => new THREE.Vector2(x, y))));
    const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    return art.keep(g);
  };
  // A solid in a part's colour (its id), standing at height y, at plate
  // position (x, py).
  const solid = (parent: Three.Object3D, g: Three.BufferGeometry, y: number, id: number, x = 0, py = 0) => {
    const m = new THREE.Mesh(g, art.surface(id));
    m.position.set(x, y, -py);
    parent.add(m);
    return m;
  };
  const ring = (r: number, inner: number, h: number) => extrude(circle(0, 0, r), inner > 0 ? [circle(0, 0, inner, 48)] : [], h);
  const disc = (r: number, h: number) => extrude(circle(0, 0, r), [], h);
  // A true line, hidden behind surfaces.
  const polyline = (parent: Three.Object3D, pts: Three.Vector3[], mat: Three.ShaderMaterial) => {
    const g = art.keep(new THREE.BufferGeometry().setFromPoints(pts));
    const l = new THREE.Line(g, mat);
    l.layers.set(1);
    l.frustumCulled = false;
    parent.add(l);
    return l;
  };
  // A wheel of a train: toothed rim, spoked, on a pinion and arbor.
  const wheel = (
    parent: Three.Object3D,
    o: { r: number; n: number; spokes: number; pinion: number; ratchet?: boolean; t?: number; id: number },
  ) => {
    const t = o.t ?? 0.32;
    const depth = toothDepth(o.r, o.n);
    const rim = o.r - depth - Math.max(0.5, o.r * 0.12);
    solid(parent, extrude(teeth(o.r, o.n, depth, o.ratchet), [...windows(Math.max(0.7, o.r * 0.2), rim, o.spokes, Math.max(0.32, o.r * 0.09), 0.3), circle(0, 0, 0.2, 24)], t), 0, o.id);
    solid(parent, extrude(teeth(o.pinion, 8, o.pinion * 0.32), [], 1.1), -1.1, o.id);
    solid(parent, disc(0.2, 3.2), -1.7, o.id);
  };
  return { extrude, solid, ring, disc, polyline, wheel };
}
