"use client";

import { useEffect, useRef } from "react";
import type * as Three from "three";
import { ACCENT_ID, ease, lineDrawing } from "@/components/line-drawing";
import { TAU, circle, partsKit, tooth, teeth, toothDepth, windows } from "@/components/watch-parts";

// Why us: the reasons, beside a drawing of how we look at work. A wheel from
// the opening plate lies on the paper, and one of its teeth is called out
// the way engineering drawings call out a detail: a small circle round it on
// the part, and the same spot drawn again, much larger, in a big circle
// beside it, joined by two lines. In the detail, the tooth stands a little
// out of true. As the section comes into view it eases back into line and
// turns blue, the one fix on the page; in the small drawing it's barely
// visible, which is the point. With reduced motion it's drawn already true.
//
// The part and the detail are two drawings of the same model (line-drawing.ts,
// watch-parts.ts); the circles and the lines joining them are an SVG over
// both.

const R = 12;
const N = 40;
// The tooth called out: front right, toward the viewer.
const CALLED = 33;
// How much of the part the detail shows across, in mm.
const DETAIL = 7.5;
// The base the wheel stands over, like the figures of what we do: round and
// only just wider than the wheel, so it grounds it without taking more of the
// width. The wheel stands just above it on its arbor, as it would in a
// movement.
const PLATE_R = R + 1.5;
const PLATE_H = 1.1;
const LIFT = PLATE_H + 0.7;

const REASONS = [
  "We find what feels off before anyone can say why.",
  "Nothing is finished until every detail looks right.",
  "The people you talk to are the people who make it.",
];

// The wheel, with its called-out tooth on a group of its own; returns the
// tooth's group and where the tooth's tip stands.
function model(THREE: typeof import("three"), kit: ReturnType<typeof partsKit>, scene: Three.Scene) {
  const { extrude, solid, disc } = kit;
  const depth = toothDepth(R, N) * 1.6;
  const t = 0.6;
  const rim = R - depth - 1.4;
  solid(scene, extrude(circle(0, 0, PLATE_R, 128), [], PLATE_H), 0, 3);
  const root = new THREE.Group();
  root.position.y = LIFT;
  scene.add(root);
  solid(root, extrude(teeth(R, N, depth, false, CALLED), [...windows(2.4, rim, 5, 1.1, 0.3), circle(0, 0, 0.45, 32)], t), 0, 1);
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
  const tip = new THREE.Vector3(Math.cos(mid) * (R - depth * 0.5), LIFT + t, -Math.sin(mid) * (R - depth * 0.5));
  return { fix, piece, tip };
}

export function WhyUs() {
  const figRef = useRef<HTMLDivElement>(null);
  const partRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const fig = figRef.current;
    const partHost = partRef.current;
    const detailHost = detailRef.current;
    const svg = svgRef.current;
    if (!fig || !partHost || !detailHost || !svg) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const part = lineDrawing(THREE, partHost, () => draw());
      const detail = lineDrawing(THREE, detailHost, () => draw());
      const a = model(THREE, partsKit(THREE, part), part.scene);
      const b = model(THREE, partsKit(THREE, detail), detail.scene);

      // How true the tooth is: 0 bent out of line, 1 in line.
      let truth = reduce ? 1 : 0;
      const pose = () => {
        const k = ease(truth);
        for (const m of [a, b]) {
          m.fix.rotation.y = 0.32 * (1 - k);
          m.fix.position.y = 0.35 * (1 - k);
          // Ink while it's out, blue once it's true.
          (m.piece.material as Three.ShaderMaterial).uniforms.uId.value = truth >= 0.7 ? ACCENT_ID : 2;
        }
      };

      const v = new THREE.Vector3();
      let partScale = 1;
      function draw() {
        pose();
        part.render();
        detail.render();
      }

      const NS = "http://www.w3.org/2000/svg";
      const small = document.createElementNS(NS, "circle");
      const big = document.createElementNS(NS, "circle");
      const l1 = document.createElementNS(NS, "line");
      const l2 = document.createElementNS(NS, "line");
      svg.append(l1, l2, small, big);

      const fit = () => {
        const pw = partHost.clientWidth;
        const ph = partHost.clientHeight;
        const dw = detailHost.clientWidth;
        const dh = detailHost.clientHeight;
        if (!pw || !ph || !dw || !dh) return;
        part.setSize(pw, ph);
        detail.setSize(dw, dh);
        partScale = Math.min((pw * 0.86) / (R * 2 + 2), (ph * 0.86) / (R + 6));
        part.aim(new THREE.Vector3(0, (LIFT + 0.6) / 2, 0), pw, ph, partScale);
        detail.aim(a.tip.clone(), dw, dh, dw / DETAIL);

        // The callout: where the tooth is on the part, the detail's circle,
        // and the two lines that touch both from outside.
        const fr = fig.getBoundingClientRect();
        const pr = partHost.getBoundingClientRect();
        const dr = detailHost.getBoundingClientRect();
        v.copy(a.tip).project(part.camera);
        const c1 = { x: pr.left - fr.left + (v.x * 0.5 + 0.5) * pw, y: pr.top - fr.top + (-v.y * 0.5 + 0.5) * ph, r: (DETAIL / 2) * partScale };
        const c2 = { x: dr.left - fr.left + dw / 2, y: dr.top - fr.top + dh / 2, r: dw / 2 };
        svg.setAttribute("viewBox", `0 0 ${fr.width} ${fr.height}`);
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
        draw();
      };

      // The fix, once, as the drawing comes into view.
      let raf = 0;
      let started = 0;
      const step = (now: number) => {
        raf = 0;
        if (!started) started = now;
        truth = Math.min(1, (now - started) / 1400);
        draw();
        if (truth < 1) raf = requestAnimationFrame(step);
      };
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || truth >= 1 || raf) return;
          // A moment to see it out of line first.
          window.setTimeout(() => {
            if (!disposed) raf = requestAnimationFrame(step);
          }, 700);
          io.disconnect();
        },
        { threshold: 0.6 },
      );
      if (!reduce) io.observe(fig);
      const ro = new ResizeObserver(fit);
      ro.observe(fig);
      fit();

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        part.dispose();
        detail.dispose();
        svg.replaceChildren();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <section className="index-col why" aria-labelledby="why-label">
      <h2 id="why-label" className="sr-only">
        Why us
      </h2>
      <ul className="why__list">
        {REASONS.map((r) => (
          <li key={r} className="why__item">
            <h3 className="why__line">{r}</h3>
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
