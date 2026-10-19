"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type * as Three from "three";
import type { TileWork } from "@/components/work-tile";
import { AZIMUTH, ELEVATION, ease, lineDrawing } from "@/components/line-drawing";

// The work as a row of pieces on stands, drawn in the same set as the
// homepage's opening plate (line-drawing.ts): each client's logo cut from a
// thin plate, stood upright on a low base, seen from the same angle, in
// hairline ink, with the client's name on a tag under it. The outlines are traced from the logo marks (scripts/trace-marks.py
// writes public/work/marks/*.json).
//
// At rest the pieces stand in an even row: one size, even gaps. On a
// desktop, pointing at the row makes it bloom: the piece under the pointer
// grows to full size, its neighbours a little less, and the bloom follows
// the pointer along the row; that plate also rises off its base on a faint
// axis, and its tag fills with ink and turns to "View case study", which is
// what a click does. Leaving the row lets it settle back to even. On a phone the row is
// wider than the screen, always blooms on the middle piece, and swiping
// moves it through. Each piece is a real link laid over the drawing, so
// keyboard focus and opening in a new tab work as they should. As the row
// first comes into view, the plates are set down onto their bases one after
// another.

// A plate's height at full size, in mm, for a square logo; wider logos
// stand shorter (see presence()). Its thickness; its base's margin around
// it, depth and height; and the gap between pieces at full size.
const BASE = 24;
const THICK = 0.8;
const PAD = 4;
const DEPTH = 14;
const SLAB = 1.4;
const GAP = 10;
// Room under the drawing for the tags, in px.
const CAPTION = 40;
// The plates' size at rest, as a share of full, and how far the bloom
// reaches either side of the plate it's on.
const REST = 0.78;
const SPREAD = 1.3;
// How far a hovered plate rises, as a share of its height.
const RISE = 0.22;

type Outline = { ratio: number; shapes: { o: [number, number][]; h: [number, number][][] }[] };

// A plate's size `d` places from the bloom, with the bloom `b` of the way
// open (0 is the even row at rest).
function bloom(d: number, b: number) {
  return REST + (1 - REST) * b * Math.exp(-((d / SPREAD) ** 2));
}

// Logos are sized by presence, not by height: a wide wordmark stands
// shorter than a square mark, so each carries about the same weight.
function presence(ratio: number) {
  return ratio ** -0.4;
}

export function WorkPlates({ work }: { work: TileWork[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const items = work.filter((w) => w.mark);

  useEffect(() => {
    const host = hostRef.current;
    const n = items.length;
    if (!host || !n) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [THREE, outlines] = await Promise.all([
        import("three"),
        Promise.all(
          items.map((w) =>
            fetch(w.mark!.src.replace(/\.png$/, ".json")).then((r) => r.json() as Promise<Outline>),
          ),
        ),
      ]);
      if (disposed) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const art = lineDrawing(THREE, host, () => paint());
      const axisMat = art.lineMat(0.2);
      // The row runs straight across the screen; each piece is set square
      // to the paper like the parts of the opening plate, so it's seen a
      // little from the side.
      const across = new THREE.Vector3(Math.cos(AZIMUTH), 0, -Math.sin(AZIMUTH));

      const plates = outlines.map((outline, i) => {
        const h = BASE * presence(outline.ratio);
        const w = h * outline.ratio;
        const shapes = outline.shapes.map((s) => {
          const shape = new THREE.Shape(s.o.map(([x, y]) => new THREE.Vector2(x * h - w / 2, y * h)));
          for (const hole of s.h) shape.holes.push(new THREE.Path(hole.map(([x, y]) => new THREE.Vector2(x * h - w / 2, y * h))));
          return shape;
        });
        const g = art.keep(new THREE.ExtrudeGeometry(shapes, { depth: THICK, bevelEnabled: false, curveSegments: 1 }));
        g.translate(0, 0, -THICK / 2);
        // The piece: its base, and the plate on a riser that lifts it.
        const unit = new THREE.Group();
        const sw = w + PAD * 2;
        const slab = new THREE.Mesh(art.keep(new THREE.BoxGeometry(sw, SLAB, DEPTH).translate(0, SLAB / 2, 0)), art.surface(i + 1));
        const riser = new THREE.Group();
        riser.add(new THREE.Mesh(g, art.surface(i + 101)));
        // The axis it rises on, from its base to its foot.
        const axis = new THREE.Line(art.keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)])), axisMat);
        axis.position.y = SLAB;
        axis.layers.set(1);
        axis.frustumCulled = false;
        unit.add(slab, riser, axis);
        art.scene.add(unit);
        // How wide it stands on screen, base and all.
        const foot = sw * Math.cos(AZIMUTH) + DEPTH * Math.abs(Math.sin(AZIMUTH));
        return { unit, riser, axis, h, w, foot, lift: 0, settle: reduce ? 1 : 0 };
      });

      // The bloom's centre, as a place in the row (fractional while it
      // moves), where it's heading, and which plate is raised.
      const middle = (n - 1) / 2;
      let focus = middle;
      let aim = middle;
      // How open the bloom is, and where that's heading.
      let open = 0;
      let openAim = 0;
      let raised = -1;
      let width = 0;
      let height = 0;
      let scale = 1;
      // Wider than the screen (phones): the bloom stays in the middle and the
      // row moves under it.
      let overflow = false;
      // The narrowest each piece may stand, in mm, so its caption never
      // runs into the next one's.
      let least = plates.map(() => 0);

      // Lays the row out around the bloom: each plate's scale, and its
      // centre along the row in mm.
      const slot = (i: number, s: number) => Math.max(plates[i].foot * s, least[i]);
      const layout = (f: number, b: number) => {
        const s = plates.map((_, i) => bloom(i - f, b));
        const x: number[] = [];
        let at = 0;
        plates.forEach((p, i) => {
          if (i > 0) at += slot(i - 1, s[i - 1]) / 2 + (GAP * (s[i - 1] + s[i])) / 2 + slot(i, s[i]) / 2;
          x.push(at);
        });
        const shift = overflow ? -(x[Math.floor(f)] + (x[Math.min(n - 1, Math.floor(f) + 1)] - x[Math.floor(f)]) * (f - Math.floor(f))) : -(x[0] + x[n - 1]) / 2;
        return { s, x: x.map((v) => v + shift), span: x[n - 1] - x[0] + slot(0, s[0]) / 2 + slot(n - 1, s[n - 1]) / 2 };
      };

      const v = new THREE.Vector3();
      const box = new THREE.Box3();
      const project = (p: Three.Vector3) => {
        v.copy(p).project(art.camera);
        return [(v.x * 0.5 + 0.5) * width, (-v.y * 0.5 + 0.5) * height] as const;
      };

      // Each piece's box on screen: left, top, right, bottom.
      const bounds = plates.map(() => [0, 0, 0, 0]);

      // Places the plates and their links, and draws.
      function paint() {
        if (!width || !height) return;
        const { s, x } = layout(focus, overflow ? 1 : open);
        plates.forEach((p, i) => {
          const set = ease(p.settle);
          const lift = (p.lift * RISE + (1 - set) * 0.5) * p.h;
          p.unit.position.copy(across).multiplyScalar(x[i]);
          p.unit.scale.setScalar(s[i]);
          p.riser.position.y = SLAB + lift;
          p.axis.scale.y = Math.max(0.001, lift);
          p.axis.visible = lift > 0.05 && p.settle >= 1;
          p.unit.updateMatrixWorld();
          // Where it stands on screen.
          box.setFromObject(p.unit);
          const r = bounds[i];
          r[0] = r[1] = Infinity;
          r[2] = r[3] = -Infinity;
          for (const cx of [box.min.x, box.max.x])
            for (const cy of [box.min.y, box.max.y])
              for (const cz of [box.min.z, box.max.z]) {
                const [sx, sy] = project(new THREE.Vector3(cx, cy, cz));
                r[0] = Math.min(r[0], sx);
                r[1] = Math.min(r[1], sy);
                r[2] = Math.max(r[2], sx);
                r[3] = Math.max(r[3], sy);
              }
        });
        // Each link covers its piece, down to the captions, which all sit on
        // one line under the lowest base.
        const floor = Math.max(...bounds.map((r) => r[3]));
        bounds.forEach(([x0, y0, x1], i) => {
          const link = linkRefs.current[i];
          if (!link) return;
          link.style.transform = `translate(${x0 - 6}px, ${y0 - 6}px)`;
          link.style.width = `${x1 - x0 + 12}px`;
          link.style.height = `${floor - y0 + 12 + CAPTION}px`;
        });
        art.render();
      }

      // The row at its widest, bloomed anywhere along it, so it never runs
      // off the screen while it follows the pointer.
      const widestRow = () => {
        let most = 0;
        for (let f = 0; f <= n - 1; f += 0.25) most = Math.max(most, layout(f, 1).span);
        return most;
      };

      const fit = () => {
        width = host.clientWidth;
        height = host.clientHeight;
        if (!width || !height) return;
        art.setSize(width, height);
        // How tall the drawing stands on screen, in mm: a raised plate on
        // its base, and the base's depth seen from above.
        const up = SLAB + BASE * (1 + RISE);
        const tall = up * Math.cos(ELEVATION) + DEPTH * Math.sin(ELEVATION);
        const room = height - CAPTION;
        // On a narrow screen the pieces keep a readable size, the widest
        // fitting at full bloom, and the row runs off the edges.
        overflow = width < 768;
        const widest = Math.max(...plates.map((p) => p.foot));
        // The captions' widths depend on nothing, but the room they take in
        // mm depends on the scale, so it's settled in a few rounds.
        const captions = linkRefs.current.map((l) => (l?.querySelector(".work-plates__caption") as HTMLElement | null)?.offsetWidth ?? 0);
        least = plates.map(() => 0);
        for (let round = 0; round < 4; round++) {
          scale = overflow
            ? Math.min((width * 0.8) / widest, (room * 0.86) / tall)
            : Math.min((width * 0.86) / widestRow(), (room * 0.86) / tall);
          least = captions.map((c) => (c + 12) / scale);
        }
        // Centred in the room above the captions.
        const look = new THREE.Vector3(0, up / 2 - CAPTION / 2 / scale / Math.cos(ELEVATION), 0);
        art.aim(look, width, height, scale);
        paint();
      };

      // Motion: the bloom eases toward its aim, raised plates ease up and
      // down, and the plates settle in as the row arrives.
      let raf = 0;
      let last = 0;
      let arrived = reduce;
      const frame = (now: number) => {
        raf = 0;
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
        last = now;
        let moving = false;
        const k = reduce ? 1 : 1 - Math.exp(-dt * 7);
        focus += (aim - focus) * k;
        if (Math.abs(aim - focus) < 0.001) focus = aim;
        else moving = true;
        open += (openAim - open) * (reduce ? 1 : 1 - Math.exp(-dt * 5));
        if (Math.abs(openAim - open) < 0.001) open = openAim;
        else moving = true;
        plates.forEach((p, i) => {
          const want = i === raised ? 1 : 0;
          p.lift += (want - p.lift) * (reduce ? 1 : 1 - Math.exp(-dt * 9));
          if (Math.abs(want - p.lift) < 0.002) p.lift = want;
          else moving = true;
          if (arrived && p.settle < 1) {
            p.settle = Math.min(1, p.settle + dt / 0.9);
            if (p.settle < 1) moving = true;
          }
        });
        paint();
        if (moving) raf = requestAnimationFrame(frame);
        else last = 0;
      };
      const wake = () => {
        if (!raf) raf = requestAnimationFrame(frame);
      };

      // The row is set down one plate after another, the first time it
      // comes into view.
      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting || arrived) return;
        arrived = true;
        plates.forEach((p, i) => (p.settle = -i * 0.09));
        wake();
      }, { threshold: 0.35 });
      io.observe(host);

      // The bloom follows the pointer along the row.
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || overflow) return;
        const r = host.getBoundingClientRect();
        // Read against the even row, which doesn't move under the pointer.
        const { x, s } = layout(middle, 0);
        const first = x[0] * scale + width / 2;
        const last = x[n - 1] * scale + width / 2;
        const t = (e.clientX - r.left - first) / Math.max(1, last - first);
        // Off past either end of the row, the bloom lets go.
        const reach = (plates[0].w * s[0] * scale) / 2 + 24;
        const inside = e.clientX - r.left > first - reach && e.clientX - r.left < last + reach;
        aim = Math.max(0, Math.min(n - 1, t * (n - 1)));
        if (openAim === 0 && inside) focus = aim;
        openAim = inside ? 1 : 0;
        wake();
      };
      const onLeave = () => {
        if (overflow) return;
        openAim = 0;
        raised = -1;
        wake();
      };

      // On a phone, swiping moves the row under the bloom, and it settles
      // with a plate in the middle.
      let drag: { x: number; focus: number } | null = null;
      let swiped = false;
      const onDown = (e: PointerEvent) => {
        if (!overflow) return;
        drag = { x: e.clientX, focus };
        swiped = false;
      };
      const onDrag = (e: PointerEvent) => {
        if (!drag) return;
        if (Math.abs(e.clientX - drag.x) > 6) swiped = true;
        const step = (BASE + GAP) * scale;
        aim = focus = Math.max(-0.3, Math.min(n - 0.7, drag.focus - (e.clientX - drag.x) / step));
        paint();
      };
      const onUp = () => {
        if (!drag) return;
        drag = null;
        aim = Math.max(0, Math.min(n - 1, Math.round(focus)));
        wake();
      };

      // A plate rises while its link is hovered or focused; focusing one
      // from the keyboard also blooms the row on it.
      const raise = (i: number) => (e: Event) => {
        raised = i;
        if (e.type === "focus" && !overflow) {
          aim = i;
          openAim = 1;
        }
        wake();
      };
      const lower = (i: number) => (e: Event) => {
        if (raised === i) raised = -1;
        if (e.type === "blur" && !overflow && !host.contains((e as FocusEvent).relatedTarget as Node)) openAim = 0;
        wake();
      };
      const unbind: (() => void)[] = [];
      linkRefs.current.forEach((link, i) => {
        if (!link) return;
        const on = raise(i);
        const off = lower(i);
        link.addEventListener("pointerenter", on);
        link.addEventListener("pointerleave", off);
        link.addEventListener("focus", on);
        link.addEventListener("blur", off);
        unbind.push(() => {
          link.removeEventListener("pointerenter", on);
          link.removeEventListener("pointerleave", off);
          link.removeEventListener("focus", on);
          link.removeEventListener("blur", off);
        });
      });
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      host.addEventListener("pointerdown", onDown);
      // A swipe that ends on a plate doesn't open it.
      const onClick = (e: MouseEvent) => {
        if (!swiped) return;
        e.preventDefault();
        e.stopPropagation();
        swiped = false;
      };
      host.addEventListener("click", onClick, true);
      window.addEventListener("pointermove", onDrag);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      const ro = new ResizeObserver(fit);
      ro.observe(host);
      fit();

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        for (const u of unbind) u();
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
        host.removeEventListener("pointerdown", onDown);
        host.removeEventListener("click", onClick, true);
        window.removeEventListener("pointermove", onDrag);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        art.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
    // The work list is fixed for the page's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={hostRef} className="work-plates">
      {items.map((w, i) => (
        <Link
          key={w.slug}
          href={`/work/${w.slug}`}
          ref={(el) => {
            linkRefs.current[i] = el;
          }}
          className="work-plates__link"
          draggable={false}
        >
          <span className="work-plates__caption">
            <span className="work-plates__flip">
              <span>{w.client}</span>
              <span aria-hidden>
                View case study
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M5 11 11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
