"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import type * as Three from "three";
import { ACCENT_ID, easeInOut, lineDrawing } from "@/components/line-drawing";
import { rounded } from "@/components/watch-parts";

// Why us's drawing: an AI accelerator package, open, drawn the way the
// opening plate is (line-drawing.ts), that the camera pushes into as the
// section is scrolled through. Three framings, one to a reason: the whole
// package (substrate, capacitors, interposer, memory stacks and the compute
// die), then the die with its grid of core tiles, then one tile, its cells
// and the rows inside them. However close it gets, it holds up.
//
// It's driven by `show(progress)`, 0 to 1 through the section; between
// framings the camera zooms about the next one's centre, so the eye stays on
// where it's going. Finer parts are only built into the drawing once they're
// big enough to read, so the far framings don't shimmer. three.js is
// imported on mount, and it draws only when the progress changes.

export type DieZoomHandle = { show(progress: number): void };

// Heights, in mm: the substrate, interposer and die stacked from 0.
const SUB = 1.1;
const INTERPOSER = SUB + 0.4;
const DIE_TOP = INTERPOSER + 0.7;
const TILE = 0.08;
const CELL = 0.025;

// The core tiles' grid on the die, and the one the camera goes into.
const tileAt = (i: number, j: number) => [(i - 1.5) * 2.3, (j - 2) * 2.5] as const;
const [FOCUS_X, FOCUS_Z] = tileAt(2, 2);

// The three framings: where the camera looks, and the size, in mm, of what
// should fill the box (across and down, as seen from the drawings' angle).
const FRAMES = [
  { x: 0, y: 1.2, z: 0, across: 34, down: 19 },
  { x: 0, y: DIE_TOP, z: 0, across: 13.5, down: 7.7 },
  { x: FOCUS_X, y: DIE_TOP + TILE, z: FOCUS_Z, across: 2.6, down: 1.4 },
];

// Through the section: a hold on each framing, the zooms between.
const KEYS = [
  [0.1, 0.42],
  [0.58, 0.9],
];

// The framing pair and how far between them, at some progress.
function framingAt(p: number): [number, number] {
  if (p <= KEYS[0][0]) return [0, 0];
  if (p < KEYS[0][1]) return [0, easeInOut((p - KEYS[0][0]) / (KEYS[0][1] - KEYS[0][0]))];
  if (p <= KEYS[1][0]) return [1, 0];
  if (p < KEYS[1][1]) return [1, easeInOut((p - KEYS[1][0]) / (KEYS[1][1] - KEYS[1][0]))];
  return [1, 1];
}

// How many CSS pixels to the mm before the cells, then the rows in them,
// are drawn.
const CELLS_FROM = 18;
const ROWS_FROM = 90;

export function DieZoom({ ref }: { ref?: Ref<DieZoomHandle> }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const redraw = useRef(() => {});

  useImperativeHandle(
    ref,
    () => ({
      show(p: number) {
        if (p === progress.current) return;
        progress.current = p;
        redraw.current();
      },
    }),
    [],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let raf = 0;
    let onResize = () => {};
    let dispose = () => {};
    const ro = new ResizeObserver(() => onResize());
    ro.observe(host);

    (async () => {
      const [THREE, { mergeGeometries }] = await Promise.all([import("three"), import("three/examples/jsm/utils/BufferGeometryUtils.js")]);
      if (disposed) return;

      // Antialiased where there's power to spare; on phones the plain
      // drawing, a quarter of the work, so the scroll stays smooth.
      const small = window.matchMedia("(max-width: 899px)").matches;
      const art = lineDrawing(THREE, host, () => frame(), { smooth: !small, accent: "--heather" });
      const root = new THREE.Group();
      art.scene.add(root);

      // One geometry per size, placed copies of it gathered by group and
      // part, and merged into one mesh each once everything is in: a few
      // draws a frame instead of hundreds.
      const geos = new Map<string, Three.BufferGeometry>();
      const parts = new Map<Three.Object3D, Map<number, Three.BufferGeometry[]>>();
      const box = (parent: Three.Object3D, w: number, d: number, h: number, x: number, y: number, z: number, id: number, r = 0.1, n = 16) => {
        const key = `${w} ${d} ${h} ${r} ${n}`;
        let g = geos.get(key);
        if (!g) {
          const shape = new THREE.Shape(rounded(w, d, Math.min(r, w / 2 - 0.001, d / 2 - 0.001), 0, 0, n).map(([a, b]) => new THREE.Vector2(a, b)));
          g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
          g.rotateX(-Math.PI / 2);
          geos.set(key, g);
        }
        const byId = parts.get(parent) ?? new Map<number, Three.BufferGeometry[]>();
        parts.set(parent, byId);
        const list = byId.get(id) ?? [];
        byId.set(id, list);
        list.push(g.clone().translate(x, y, z));
      };
      const merge = () => {
        for (const [parent, byId] of parts)
          for (const [id, list] of byId) {
            const merged = mergeGeometries(list);
            for (const g of list) g.dispose();
            if (merged) parent.add(new THREE.Mesh(art.keep(merged), art.surface(id)));
          }
        for (const g of geos.values()) g.dispose();
      };

      // The package substrate, with its capacitors in rows along two edges.
      box(root, 30, 30, SUB, 0, 0, 0, 1, 0.8);
      for (let i = 0; i < 9; i++)
        for (const x of [-12.6, 12.6]) box(root, 0.9, 1.6, 0.6, x, SUB, (i - 4) * 2.4, 1, 0.08, 4);
      // The interposer, and four memory stacks of five thin dies on it.
      box(root, 22, 18, 0.4, 0, SUB, 0, 2, 0.1);
      for (const x of [-8, 8])
        for (const z of [-3.6, 3.6])
          for (let s = 0; s < 5; s++) box(root, 4.2, 6.2, 0.18, x, INTERPOSER + s * 0.28, z, 3, 0.08, 8);
      // The compute die and its core tiles.
      box(root, 10, 13, 0.7, 0, INTERPOSER, 0, 4, 0.1);
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 5; j++) {
          const [x, z] = tileAt(i, j);
          box(root, 2, 2.2, TILE, x, DIE_TOP, z, 5, 0.05, 6);
        }
      // Each tile's four by four cells.
      const cells = new THREE.Group();
      const cellAt = (tx: number, tz: number, a: number, b: number) => [tx + (a - 1.5) * 0.48, tz + (b - 1.5) * 0.53] as const;
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 5; j++) {
          const [tx, tz] = tileAt(i, j);
          for (let a = 0; a < 4; a++)
            for (let b = 0; b < 4; b++) {
              const [x, z] = cellAt(tx, tz, a, b);
              box(cells, 0.4, 0.45, CELL, x, DIE_TOP + TILE, z, 6, 0.02, 3);
            }
        }
      // In the tile the camera goes into, the rows inside every cell, in
      // heather: the finest detail, where the zoom ends.
      const rows = new THREE.Group();
      for (let a = 0; a < 4; a++)
        for (let b = 0; b < 4; b++) {
          const [x, z] = cellAt(FOCUS_X, FOCUS_Z, a, b);
          for (let k = 0; k < 5; k++) box(rows, 0.32, 0.05, 0.01, x, DIE_TOP + TILE + CELL, z + (k - 2) * 0.085, ACCENT_ID, 0.01, 2);
        }
      merge();

      let width = 0;
      let height = 0;
      const scales = [1, 1, 1];
      const fit = () => {
        width = host.clientWidth;
        height = host.clientHeight;
        if (!width || !height) return;
        art.setSize(width, height);
        FRAMES.forEach((f, i) => (scales[i] = Math.min((width * 0.86) / f.across, (height * 0.86) / f.down)));
        frame();
      };

      const aim = new THREE.Vector3();
      function frame() {
        if (!width || !height) return;
        const [from, e] = framingAt(progress.current);
        const a = FRAMES[from];
        const b = FRAMES[Math.min(from + 1, FRAMES.length - 1)];
        const sa = scales[from];
        const sb = scales[Math.min(from + 1, FRAMES.length - 1)];
        // Zooming about where it's going: the scale grows evenly in ratio,
        // and the next framing's centre closes on the middle as it does.
        const s = sa * Math.pow(sb / sa, e);
        const k = (sa / s) * (1 - e);
        aim.set(b.x + (a.x - b.x) * k, b.y + (a.y - b.y) * k, b.z + (a.z - b.z) * k);
        const showCells = s >= CELLS_FROM;
        const showRows = s >= ROWS_FROM;
        if (showCells !== !!cells.parent) showCells ? root.add(cells) : root.remove(cells);
        if (showRows !== !!rows.parent) showRows ? root.add(rows) : root.remove(rows);
        art.aim(aim, width, height, s);
        root.updateMatrixWorld();
        art.render();
      }

      redraw.current = () => {
        if (!raf) raf = requestAnimationFrame(() => {
          raf = 0;
          frame();
        });
      };
      onResize = fit;
      dispose = () => art.dispose();
      fit();
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      redraw.current = () => {};
      dispose();
    };
  }, []);

  return <div ref={hostRef} className="die-zoom" aria-hidden />;
}
