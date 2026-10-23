"use client";

import { useEffect, useRef } from "react";
import type * as Three from "three";
import { ELEVATION, easeInOut, lineDrawing } from "@/components/line-drawing";
import { partsKit, type V2 } from "@/components/watch-parts";

// The homepage's opening plate: an AI accelerator package drawn as an
// exploded axonometric, the way hardware teardowns show one. Real geometry
// (three.js), modelled in millimetres and rendered as a hidden-line drawing
// (line-drawing.ts), from the bottom up: a section of the board it's
// soldered to, the grid of solder balls, the package substrate with its
// capacitors, the silicon interposer, the compute die between four
// high-bandwidth memory stacks (each a tower of thin dies), the thermal
// interface sheet and the heat spreader's lid. All in ink; the compute die
// carries a grid of core tiles, the finest detail in the drawing, so the
// eye lands there.
//
// On arrival the closed package is drawn in from the board up, framed
// close; a breath later it opens into its exploded stack, the lid lifting
// first, as the camera eases back to take it all in; then it sways very
// slowly. With reduced motion it is drawn open and holds still.
//
// With `assemble` (the close every page ends on) it runs the other way: it
// waits open, and once it's well in view the layers come down onto one
// another, the board's first and the lid last, as the camera eases in on
// the closed package. With reduced motion it's drawn closed.
//
// Rendering pauses off screen and in hidden tabs; three.js is imported on
// mount.

// The air under every layer when opened, in mm.
const GAP = 6.5;

// A rounded rectangle centred on (cx, cy), w by h, corner radius r. Its
// corners are fine enough (16 facets) that the drawing reads them as one
// curve, not a row of small edges.
function rounded(w: number, h: number, r: number, cx = 0, cy = 0, n = 16): V2[] {
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

type Layer = { group: Three.Group; seat: number; lift: number; order: number };

export function ChipPlate({ assemble = false }: { assemble?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    // Owned here, so they're always torn down; wired to the drawing once
    // three.js is in (the latest sighting is kept until then).
    let raf = 0;
    let seen: IntersectionObserverEntry | null = null;
    let onSeen = (_entry: IntersectionObserverEntry) => {};
    let onResize = () => {};
    let onVisibility = () => {};
    let dispose = () => {};
    const io = new IntersectionObserver(
      ([entry]) => {
        seen = entry;
        onSeen(entry);
      },
      { threshold: [0, 0.5] },
    );
    io.observe(host);
    const ro = new ResizeObserver(() => onResize());
    ro.observe(host);
    const visibility = () => onVisibility();
    document.addEventListener("visibilitychange", visibility);

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Drawn smooth: antialiased, at twice the density.
      const art = lineDrawing(THREE, host, () => frame(), { smooth: true });
      const root = new THREE.Group();
      art.scene.add(root);
      const axisMat = art.lineMat(0.2);
      const { extrude, solid } = partsKit(THREE, art);
      let nextId = 1;

      // The layers, bottom up, each with its own height when closed; opened,
      // each stands GAP clear of the top of the one under it. `seat`
      // overrides where it rests closed (the lid's skirt reaches past the
      // dies to the substrate). `order` is when it opens, the lid first.
      const layers: Layer[] = [];
      let closedTop = 0;
      let openTop = 0;
      const layer = (thick: number, build: (g: Three.Group) => void, seat = closedTop) => {
        const group = new THREE.Group();
        root.add(group);
        build(group);
        const lift = layers.length ? openTop + GAP : seat;
        layers.push({ group, seat, lift, order: 0 });
        closedTop = Math.max(closedTop, seat + thick);
        openTop = lift + thick;
      };
      const box = (g: Three.Group, w: number, d: number, h: number, y: number, id: number, x = 0, z = 0, r = 0.15) =>
        solid(g, extrude(rounded(w, d, Math.min(r, w / 2 - 0.01, d / 2 - 0.01)), [], h), y, id, x, z);

      // The board: a section of the card, with the package's footprint and a
      // few parts around it.
      layer(1.6, (g) => {
        const id = nextId++;
        box(g, 40, 34, 1.6, -1.6, id, 0, 0, 0.6);
        for (const [x, z, w, d] of [
          [-17, 13, 2.4, 1.4],
          [-17, 10.6, 2.4, 1.4],
          [16.6, -13, 3.2, 2],
          [16.6, 12.4, 3.2, 2],
          [-16.6, -12.8, 1.6, 3.2],
        ] as const)
          box(g, w, d, 0.9, 0, id, x, z, 0.1);
      });

      // The solder balls, a full grid under the substrate.
      layer(0.5, (g) => {
        const id = nextId++;
        const ball = extrude(rounded(0.62, 0.62, 0.3, 0, 0, 6), [], 0.5);
        const n = 13;
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) solid(g, ball, 0, id, (i - (n - 1) / 2) * 2, (j - (n - 1) / 2) * 2);
      });

      // The package substrate, with its decoupling capacitors in rows along
      // two edges.
      const substrateTop = closedTop + 1.1;
      layer(1.1, (g) => {
        const id = nextId++;
        box(g, 30, 30, 1.1, 0, id, 0, 0, 0.8);
        for (let i = 0; i < 9; i++) {
          box(g, 0.9, 1.6, 0.6, 1.1, id, -12.6, (i - 4) * 2.4, 0.08);
          box(g, 0.9, 1.6, 0.6, 1.1, id, 12.6, (i - 4) * 2.4, 0.08);
        }
      });

      // The silicon interposer.
      layer(0.4, (g) => box(g, 22, 18, 0.4, 0, nextId++, 0, 0, 0.1));

      // The compute die, its face a grid of core tiles, between four memory
      // stacks, each four thin dies on a base die.
      layer(1.4, (g) => {
        box(g, 10, 13, 0.7, 0, nextId++, 0, 0, 0.1);
        const cores = nextId++;
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 5; j++) box(g, 2, 2.2, 0.08, 0.7, cores, (i - 1.5) * 2.3, (j - 2) * 2.5, 0.05);
        const id = nextId++;
        for (const x of [-8, 8])
          for (const z of [-3.6, 3.6])
            for (let s = 0; s < 5; s++) box(g, 4.2, 6.2, 0.18, s * 0.28, id, x, z, 0.08);
      });

      // The thermal interface sheet.
      layer(0.2, (g) => box(g, 22, 18, 0.12, 0, nextId++, 0, 0, 0.4));

      // The lid: one block over the whole substrate, from its edge up past
      // the dies (the drawing looks down on it, so its hollow underside never
      // shows, and as one solid it has no coincident faces to flicker), with
      // a raised land over the die. It stands a hair inside the substrate's
      // edge, so their walls never share a plane.
      const skirt = closedTop - substrateTop;
      layer(
        skirt + 1.05,
        (g) => {
          const id = nextId++;
          box(g, 29.6, 29.6, skirt + 0.8, 0, id, 0, 0, 0.6);
          box(g, 18, 16, 0.25, skirt + 0.8, id, 0, 0, 0.6);
        },
        substrateTop,
      );

      // The lid opens first, the board last.
      layers.forEach((l, i) => (l.order = layers.length - 1 - i));
      openTop += 0.5;

      // Guides from the substrate's corners up to the lid's, where the lid
      // seats when closed: the two parts that latch, shown meeting. Each
      // runs on the corner's curve, so it leaves one corner and lands on the
      // other.
      const substrate = layers[2].group;
      const lid = layers[layers.length - 1].group;
      const c = 15 - 0.8 + 0.8 * Math.SQRT1_2;
      const guides: Three.Line[] = [];
      for (const [x, z] of [
        [-c, -c],
        [c, -c],
        [-c, c],
        [c, c],
      ]) {
        const geo = art.keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)]));
        const l = new THREE.Line(geo, axisMat);
        l.layers.set(1);
        l.frustumCulled = false;
        l.position.set(x, 0, z);
        root.add(l);
        guides.push(l);
      }

      // Framing: close on the shut package, back far enough for the open
      // stack.
      let width = 0;
      let height = 0;
      const EXTENT = 56;
      const openFrame = { y: openTop / 2, scale: 1 };
      const shutFrame = { y: closedTop / 2, scale: 1 };
      const fit = () => {
        width = host.clientWidth;
        height = host.clientHeight;
        if (!width || !height) return;
        art.setSize(width, height);
        const tall = (h: number) => h * Math.cos(ELEVATION) + EXTENT * Math.sin(ELEVATION);
        openFrame.scale = Math.min((height * 0.92) / tall(openTop), (width * 0.9) / EXTENT);
        // Closed in the close, it fills its shorter box; closed in the hero,
        // it leaves room to open into.
        shutFrame.scale = assemble
          ? Math.min((height * 0.82) / tall(closedTop), (width * 0.7) / EXTENT)
          : Math.min((height * 0.62) / tall(closedTop), (width * 0.66) / EXTENT);
        // In the close it's seated at the foot of its box, so it stands just
        // over the line under it however the box's width limits its size:
        // the camera's aim rises by the spare height, in the drawing's units.
        shutFrame.y = closedTop / 2;
        if (assemble) {
          const spare = (height - tall(closedTop) * shutFrame.scale) / 2 - 8;
          if (spare > 0) shutFrame.y += spare / (shutFrame.scale * Math.cos(ELEVATION));
        }
        frame();
      };

      const OPEN = 2.6;
      const STAGGER = 0.09;
      const DRAW_IN = 1.2;
      const OPEN_AT = DRAW_IN + 0.3;
      const start = performance.now();
      // Assembling: when it began, once the chip was well in view.
      let begun = 0;

      function frame(now = performance.now()) {
        if (!width || !height) return;
        const t = reduce ? 1e6 : (now - start) / 1000;
        // How open each layer is: opening, the lid lifts first; assembling,
        // the board's layers settle first and the lid comes down last.
        const since = reduce ? 1e6 : begun ? (now - begun) / 1000 : -1;
        for (const l of layers) {
          const k = assemble
            ? since < 0
              ? 1
              : 1 - easeInOut((since - (layers.length - 1 - l.order) * STAGGER) / OPEN)
            : easeInOut((t - OPEN_AT - l.order * STAGGER) / OPEN);
          l.group.position.y = l.seat + (l.lift - l.seat) * k;
        }
        const from = substrate.position.y + 1.1;
        for (const g of guides) {
          g.position.y = from;
          g.scale.y = Math.max(0.001, lid.position.y - from);
        }

        // Opening, it's drawn in from the board up, under a soft edge rising
        // through the box, and the camera eases back as it opens; assembling,
        // the camera eases in as it closes.
        let back: number;
        if (assemble) {
          back = since < 0 ? 1 : 1 - easeInOut(since / (OPEN + (layers.length - 1) * STAGGER));
        } else {
          const drawn = easeInOut(t / DRAW_IN);
          const edge = drawn < 1 ? `linear-gradient(to top, #000 ${drawn * 130 - 30}%, transparent ${drawn * 130}%)` : "";
          host!.style.setProperty("mask-image", edge);
          host!.style.setProperty("-webkit-mask-image", edge);
          back = easeInOut((t - OPEN_AT) / OPEN);
        }
        art.aim(
          new THREE.Vector3(0, shutFrame.y + (openFrame.y - shutFrame.y) * back, 0),
          width,
          height,
          shutFrame.scale + (openFrame.scale - shutFrame.scale) * back,
        );
        if (!reduce) root.rotation.y = Math.sin((t / 48) * Math.PI * 2) * 0.16;
        root.updateMatrixWorld();
        art.render();
      }

      let visible = true;
      const loop = (now: number) => {
        raf = 0;
        frame(now);
        if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(loop);
      };
      const resume = () => {
        if (!raf && !reduce && visible && !document.hidden) raf = requestAnimationFrame(loop);
      };
      onSeen = (entry) => {
        visible = entry.isIntersecting;
        if (assemble && !begun && entry.intersectionRatio >= 0.5) begun = performance.now();
        resume();
      };
      onResize = fit;
      onVisibility = resume;
      dispose = () => art.dispose();
      fit();
      if (seen) onSeen(seen);
      resume();
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      dispose();
    };
  }, [assemble]);

  return <div ref={hostRef} className="movement-plate" aria-hidden />;
}
