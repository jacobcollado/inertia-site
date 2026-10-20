"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type * as Three from "three";
import { useReveal, Words } from "@/components/reveal";
import { ACCENT_ID, AZIMUTH, ELEVATION, ease, easeInOut, lineDrawing } from "@/components/line-drawing";
import { TAU, circle, partsKit, tooth, teeth, toothDepth, windows } from "@/components/watch-parts";

// Why us: the reasons, beside a drawing that acts them out. A wheel from the
// opening plate stands over its plate, and a spot on it is called out the
// way engineering drawings call out a detail: a small circle round it on the
// part, and the same spot drawn again, much larger, in a big circle beside
// it, joined by two lines. Scrolling through the section plays three beats,
// one per reason, the reason being played lit in ink and the others resting:
//
// - Finding: the callout travels round the rim, looking, and stops on the
//   one tooth standing out of true.
// - Finishing: the tooth eases back into line and turns blue, the one fix
//   on the page; in the small drawing it's barely visible, which is the point.
// - Making: the callout goes down through a window of the wheel to the plate
//   under it, where the maker's mark (the Inertia mark) is drawn in, signed
//   the way watchmakers sign a movement.
//
// The beats follow the scroll, eased, and run back going up. With reduced
// motion it's drawn finished: the tooth true, the mark signed, every reason
// in ink.
//
// The part and the detail are two drawings of the same model (line-drawing.ts,
// watch-parts.ts); the circles and the lines joining them are an SVG over
// both.

const R = 12;
const N = 40;
// The tooth called out: front right, toward the viewer.
const CALLED = 33;
// How much of the part the detail shows across, in mm: about three teeth,
// so the one out of true stands clearly among its neighbours.
const DETAIL = 6;
// The base the wheel stands over, like the figures of what we do: round and
// only just wider than the wheel, so it grounds it without taking more of the
// width. The wheel stands just above it on its arbor, as it would in a
// movement.
const PLATE_R = R + 1.5;
const PLATE_H = 1.1;
const LIFT = PLATE_H + 0.7;
// The wheel's windows, and the one toward the viewer the mark is seen
// through: where on the plate the mark is engraved, and how wide, in mm.
// Lying on the plate, seen from above at the one angle, it would read
// squashed, so it's engraved drawn out toward the viewer by as much, the
// way lettering on a road is, and reads upright.
const SPOKES = 5;
const PHASE = 0.3;
const MARK_AT = { a: PHASE + 3.5 * (TAU / SPOKES), r: 5.2 };
const MARK_W = 3.4;
const MARK_DRAWN_OUT = 1 / Math.sin(ELEVATION);
// Where the search starts, round the rim before the called tooth, in
// radians.
const SEARCH = 1.4;

const REASONS = [
  "We find what feels off before anyone can say why.",
  "Nothing is finished until every detail looks right.",
  "The people you talk to are the people who make it.",
];

// The Inertia mark's stroke (inertia-mark.tsx), in its own 30.1 by 24
// units: the arc round from the right, then the tangent off the top.
function markPath(): [number, number][] {
  const pts: [number, number][] = [];
  const a0 = Math.atan2(8.37 - 12, 21.98 - 12);
  const a1 = (3 * Math.PI) / 2;
  for (let i = 0; i <= 64; i++) {
    const a = a0 + ((a1 - a0) * i) / 64;
    pts.push([12 + Math.cos(a) * 10.62, 12 + Math.sin(a) * 10.62]);
  }
  pts.push([28.69, 1.38]);
  return pts;
}

// The wheel over its plate, with its called-out tooth on a group of its own
// and the maker's mark engraved on the plate; returns the tooth, the mark,
// and the places the callout visits.
function model(THREE: typeof import("three"), art: ReturnType<typeof lineDrawing>) {
  const { extrude, solid, disc } = partsKit(THREE, art);
  const scene = art.scene;
  const depth = toothDepth(R, N) * 1.6;
  const t = 0.6;
  const rim = R - depth - 1.4;
  solid(scene, extrude(circle(0, 0, PLATE_R, 128), [], PLATE_H), 0, 3);
  const root = new THREE.Group();
  root.position.y = LIFT;
  scene.add(root);
  solid(root, extrude(teeth(R, N, depth, false, CALLED), [...windows(2.4, rim, SPOKES, 1.1, PHASE), circle(0, 0, 0.45, 32)], t), 0, 1);
  solid(root, extrude(teeth(1.8, 8, 0.6), [], 1.8), -1.8, 1);
  solid(root, disc(0.45, 5), -2.6, 1);
  // The called-out tooth, pivoting at its root.
  const mid = ((CALLED + 0.64) / N) * TAU;
  const pivot = [Math.cos(mid) * (R - depth), Math.sin(mid) * (R - depth)];
  const fix = new THREE.Group();
  fix.position.set(pivot[0], 0, -pivot[1]);
  root.add(fix);
  const g = extrude(tooth(R, N, depth, CALLED, 0), [], t);
  g.translate(-pivot[0], 0, pivot[1]);
  const piece = solid(fix, g, 0, 2);
  // A tooth's tip, at any angle round the rim.
  const rimAt = (a: number) => new THREE.Vector3(Math.cos(a) * (R - depth * 0.5), LIFT + t, -Math.sin(a) * (R - depth * 0.5));
  // The maker's mark, engraved in the plate: the mark's stroke at its own
  // weight, a shallow solid the drawing outlines like any other edge. It's
  // set square to the viewer (across the screen, and toward the viewer for
  // down), so it reads upright, not skewed by the one angle. `sign` cuts it
  // as far along its stroke as asked, from the start.
  const centre = new THREE.Vector3(Math.cos(MARK_AT.a) * MARK_AT.r, PLATE_H, -Math.sin(MARK_AT.a) * MARK_AT.r);
  const s = MARK_W / 30.1;
  const across = new THREE.Vector3(Math.cos(AZIMUTH), 0, -Math.sin(AZIMUTH));
  const toward = new THREE.Vector3(Math.sin(AZIMUTH), 0, Math.cos(AZIMUTH));
  const path = markPath();
  // A point of the mark, in its own units, as plate coordinates.
  const onPlate = ([x, y]: [number, number]): [number, number] => {
    const p = centre.clone().addScaledVector(across, (x - 15.05) * s).addScaledVector(toward, (y - 12) * s * MARK_DRAWN_OUT);
    return [p.x, -p.z];
  };
  const markMat = art.surface(4);
  let mark: Three.Mesh | null = null;
  let cut = -1;
  const sign = (f: number) => {
    const k = Math.round(f * (path.length - 1));
    if (k === cut) return;
    cut = k;
    if (mark) {
      scene.remove(mark);
      mark.geometry.dispose();
      mark = null;
    }
    if (k < 1) return;
    // Either side of the stroke, half its weight out from the line.
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    for (let i = 0; i <= k; i++) {
      const [x0, y0] = path[Math.max(0, i - 1)];
      const [x1, y1] = path[Math.min(k, i + 1)];
      const l = Math.hypot(x1 - x0, y1 - y0) || 1;
      const nx = (-(y1 - y0) / l) * 1.38;
      const ny = ((x1 - x0) / l) * 1.38;
      left.push(onPlate([path[i][0] + nx, path[i][1] + ny]));
      right.push(onPlate([path[i][0] - nx, path[i][1] - ny]));
    }
    const outline = [...left, ...right.reverse()];
    const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    mark = new THREE.Mesh(g, markMat);
    mark.position.y = PLATE_H;
    scene.add(mark);
  };
  return { fix, piece, sign, rimAt, tip: rimAt(mid), mid, centre };
}

export function WhyUs() {
  const figRef = useRef<HTMLDivElement>(null);
  const partRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const list = useReveal<HTMLUListElement>();

  useEffect(() => {
    const fig = figRef.current;
    const partHost = partRef.current;
    const detailHost = detailRef.current;
    const svg = svgRef.current;
    const reasons = list.current;
    if (!fig || !partHost || !detailHost || !svg || !reasons) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const part = lineDrawing(THREE, partHost, () => draw());
      const detail = lineDrawing(THREE, detailHost, () => draw(), { smooth: true });
      const a = model(THREE, part);
      const b = model(THREE, detail);

      // How far through the three beats the drawing is, 0 to 1, easing
      // after where the scroll says it should be.
      let played = reduce ? 1 : 0;
      let last = 0;
      // Which reason is lit; none marked until the beats run, so all three
      // stay in ink without them.
      let lit = -1;
      if (!reduce) reasons.dataset.beats = "";
      const items = Array.from(reasons.children) as HTMLElement[];

      const clamp = (x: number) => Math.min(1, Math.max(0, x));
      const look = new THREE.Vector3();

      // Sets the drawing for how far it's played: where the callout looks,
      // how true the tooth is, how much of the mark is drawn.
      const pose = () => {
        const seek = easeInOut(clamp(played / 0.3));
        const truth = clamp((played - 0.36) / 0.24);
        const down = easeInOut(clamp((played - 0.68) / 0.14));
        const sign = clamp((played - 0.78) / 0.16);
        if (down > 0) look.copy(a.tip).lerp(a.centre, down);
        else look.copy(a.rimAt(a.mid - SEARCH * (1 - seek)));
        const k = ease(truth);
        for (const m of [a, b]) {
          m.fix.rotation.y = 0.5 * (1 - k);
          m.fix.position.y = 0.6 * (1 - k);
          // Ink while it's out, blue once it's true.
          (m.piece.material as Three.ShaderMaterial).uniforms.uId.value = truth >= 0.7 ? ACCENT_ID : 2;
        }
        a.sign(sign);
        b.sign(sign);
        const now = played < 0.34 ? 0 : played < 0.7 ? 1 : 2;
        if (!reduce && now !== lit) {
          lit = now;
          items.forEach((li, i) => li.toggleAttribute("data-lit", i === lit));
        }
      };

      const v = new THREE.Vector3();
      let partScale = 1;
      // Where the part and the detail sit in the figure, from fit().
      const at = { pw: 0, ph: 0, px: 0, py: 0, dw: 0, dh: 0, dx: 0, dy: 0, fw: 0, fh: 0 };

      const NS = "http://www.w3.org/2000/svg";
      const small = document.createElementNS(NS, "circle");
      const big = document.createElementNS(NS, "circle");
      const l1 = document.createElementNS(NS, "line");
      const l2 = document.createElementNS(NS, "line");
      svg.append(l1, l2, small, big);

      // The callout: where it looks on the part, the detail's circle, and
      // the two lines that touch both from outside.
      const callout = () => {
        v.copy(look).project(part.camera);
        const c1 = { x: at.px + (v.x * 0.5 + 0.5) * at.pw, y: at.py + (-v.y * 0.5 + 0.5) * at.ph, r: (DETAIL / 2) * partScale };
        const c2 = { x: at.dx + at.dw / 2, y: at.dy + at.dh / 2, r: at.dw / 2 };
        svg.setAttribute("viewBox", `0 0 ${at.fw} ${at.fh}`);
        small.setAttribute("cx", String(c1.x));
        small.setAttribute("cy", String(c1.y));
        small.setAttribute("r", String(c1.r));
        big.setAttribute("cx", String(c2.x));
        big.setAttribute("cy", String(c2.y));
        big.setAttribute("r", String(c2.r));
        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const d = Math.hypot(dx, dy);
        const base = Math.atan2(dy, dx);
        const off = Math.acos(Math.max(-1, Math.min(1, (c1.r - c2.r) / d)));
        for (const [line, s] of [
          [l1, 1],
          [l2, -1],
        ] as const) {
          const ang = base + s * off;
          line.setAttribute("x1", String(c1.x + Math.cos(ang) * c1.r));
          line.setAttribute("y1", String(c1.y + Math.sin(ang) * c1.r));
          line.setAttribute("x2", String(c2.x + Math.cos(ang) * c2.r));
          line.setAttribute("y2", String(c2.y + Math.sin(ang) * c2.r));
        }
      };

      function draw() {
        if (!at.pw || !at.dw) return;
        pose();
        detail.aim(look, at.dw, at.dh, at.dw / DETAIL);
        callout();
        part.render();
        detail.render();
      }

      const fit = () => {
        at.pw = partHost.clientWidth;
        at.ph = partHost.clientHeight;
        at.dw = detailHost.clientWidth;
        at.dh = detailHost.clientHeight;
        if (!at.pw || !at.ph || !at.dw || !at.dh) return;
        part.setSize(at.pw, at.ph);
        detail.setSize(at.dw, at.dh);
        partScale = Math.min((at.pw * 0.86) / (R * 2 + 2), (at.ph * 0.86) / (R + 6));
        part.aim(new THREE.Vector3(0, (LIFT + 0.6) / 2, 0), at.pw, at.ph, partScale);
        const fr = fig.getBoundingClientRect();
        const pr = partHost.getBoundingClientRect();
        const dr = detailHost.getBoundingClientRect();
        Object.assign(at, { px: pr.left - fr.left, py: pr.top - fr.top, dx: dr.left - fr.left, dy: dr.top - fr.top, fw: fr.width, fh: fr.height });
        draw();
      };

      // The beats follow the figure up the screen: begun once a good part
      // of it is in view, played through by the time its top nears the top.
      let raf = 0;
      let visible = false;
      const loop = (now: number) => {
        raf = 0;
        const top = fig.getBoundingClientRect().top;
        const want = clamp((innerHeight * 0.62 - top) / (innerHeight * 0.5));
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
        last = now;
        played += (want - played) * (1 - Math.exp(-dt * 6));
        if (Math.abs(want - played) < 0.0005) played = want;
        draw();
        if (visible) raf = requestAnimationFrame(loop);
        else last = 0;
      };
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(loop);
      });
      if (!reduce) io.observe(fig);
      const ro = new ResizeObserver(fit);
      ro.observe(fig);
      fit();

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        // Unsigned, so the mark's geometry goes too.
        a.sign(0);
        b.sign(0);
        part.dispose();
        detail.dispose();
        svg.replaceChildren();
        delete reasons.dataset.beats;
        items.forEach((li) => li.removeAttribute("data-lit"));
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
    // The reasons' list ref is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="index-col why" aria-labelledby="why-label">
      <h2 id="why-label" className="sr-only">
        Why us
      </h2>
      <ul ref={list} className="why__list">
        {REASONS.map((r, i) => (
          <li key={r} className="why__item" style={{ "--i": i } as CSSProperties}>
            <h3 className="why__line">
              <Words text={r} />
            </h3>
          </li>
        ))}
      </ul>
      <div ref={figRef} className="why__fig" aria-hidden>
        <div ref={partRef} className="why__part" />
        <div ref={detailRef} className="why__detail" />
        <svg ref={svgRef} className="why__callout" />
      </div>
    </section>
  );
}
