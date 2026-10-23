"use client";

import { useEffect, useRef } from "react";

// A field of ink points on a canvas, the homepage's one visual language after
// the opening plate (what-we-do.tsx, why-us.tsx). The points are pulled
// toward a form, a set of targets in a unit box (-1 to 1), and cycle through
// the forms they're given: each holds a while, the points let go and drift a
// little on paths of their own, and the next is found (or, without `drift`,
// step straight on to it, so the change itself is what's seen). When the forms change
// (a new reason lit) the same points glide on to them, so the field never
// resets. It draws only while it's on screen; with reduced motion it holds
// its first form, settled.

export type V = [number, number];
export type Form = (n: number) => V[];

// Points spread evenly along a polyline.
export function along(path: V[], n: number): V[] {
  const len: number[] = [0];
  for (let i = 1; i < path.length; i++) len.push(len[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
  const total = len[len.length - 1];
  const out: V[] = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const d = (k / n) * total;
    while (j < len.length - 1 && len[j] < d) j++;
    const f = (d - len[j - 1]) / (len[j] - len[j - 1] || 1);
    out.push([path[j - 1][0] + (path[j][0] - path[j - 1][0]) * f, path[j - 1][1] + (path[j][1] - path[j - 1][1]) * f]);
  }
  return out;
}

export const arc = (cx: number, cy: number, r: number, a0: number, a1: number, steps = 96): V[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / steps;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });

export function roundedRect(x0: number, y0: number, x1: number, y1: number, r: number): V[] {
  return [
    ...arc(x1 - r, y0 + r, r, -Math.PI / 2, 0, 12),
    ...arc(x1 - r, y1 - r, r, 0, Math.PI / 2, 12),
    ...arc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, 12),
    ...arc(x0 + r, y0 + r, r, Math.PI, (3 * Math.PI) / 2, 12),
    [x1 - r, y0],
  ];
}

// An upright triangle, radius `r` to its corners, its corners rounded by `c`.
export function roundedTriangle(r: number, c: number): V[] {
  const corners = [0, 1, 2].map((i): V => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
    return [Math.cos(a) * r, Math.sin(a) * r + r * 0.15];
  });
  const out: V[] = [];
  corners.forEach((p, i) => {
    const towards = (q: V, d: number): V => {
      const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
      return [p[0] + ((q[0] - p[0]) * d) / l, p[1] + ((q[1] - p[1]) * d) / l];
    };
    const a = towards(corners[(i + 2) % 3], c * 1.7);
    const b = towards(corners[(i + 1) % 3], c * 1.7);
    for (let k = 0; k <= 8; k++) {
      const f = k / 8;
      // A quadratic round through the corner.
      out.push([(1 - f) ** 2 * a[0] + 2 * (1 - f) * f * p[0] + f ** 2 * b[0], (1 - f) ** 2 * a[1] + 2 * (1 - f) * f * p[1] + f ** 2 * b[1]]);
    }
  });
  out.push(out[0]);
  return out;
}

// Splits n points across several outlines by their lengths.
export function across(paths: V[][], n: number): V[] {
  const lens = paths.map((p) => p.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0));
  const total = lens.reduce((a, b) => a + b, 0);
  let left = n;
  return paths.flatMap((p, i) => {
    const k = i === paths.length - 1 ? left : Math.round((lens[i] / total) * n);
    left -= k;
    return along(p, k);
  });
}

// How many points; how long a form holds and how long the drift between
// lasts, in seconds; and how firmly the points are pulled home.
const COUNT = 150;
const HOLD = 2.6;
const DRIFT = 1.4;
const PULL = 5;

export function PointField({ forms, drift: drifts = true, className }: { forms: Form[]; drift?: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Read each frame, so new forms are glided to without a reset.
  const formsRef = useRef(forms);
  useEffect(() => {
    formsRef.current = forms;
  }, [forms]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let shown = formsRef.current;
    let targets = shown.map((f) => f(COUNT));
    // Each point's place, and a seed for its own wander in the drift.
    const pts = targets[0].map(([x, y], i) => ({ x, y, seed: i * 12.9898 }));
    let w = 0;
    let h = 0;
    let ink = "#1a1a1a";

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = ink;
      const s = Math.min(w, h) / 2.3;
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(w / 2 + p.x * s, h / 2 + p.y * s, 1.35, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const fit = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ink = getComputedStyle(canvas).color;
      if (reduce) {
        targets = formsRef.current.map((f) => f(COUNT));
        targets[targets.length - 1].forEach(([x, y], i) => Object.assign(pts[i], { x, y }));
      }
      draw();
    };

    let raf = 0;
    let last = 0;
    let visible = false;
    let start = performance.now();
    const step = (now: number) => {
      raf = 0;
      if (formsRef.current !== shown) {
        // New forms: start their cycle from the first, gliding there.
        shown = formsRef.current;
        targets = shown.map((f) => f(COUNT));
        start = now;
      }
      const t = (now - start) / 1000;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      const cycle = HOLD + DRIFT;
      const k = Math.floor(t / cycle);
      const inCycle = t - k * cycle;
      const form = targets[k % targets.length];
      const drift = drifts && inCycle > HOLD ? Math.sin(((inCycle - HOLD) / DRIFT) * Math.PI) : 0;
      const pull = 1 - Math.exp(-dt * PULL);
      pts.forEach((p, i) => {
        let [tx, ty] = form[i];
        if (drift) {
          // Let go: each point wanders off a little on its own path.
          const a = p.seed + t * 0.9;
          tx += (Math.cos(a) * 0.34 + Math.sin(a * 1.7) * 0.12) * drift;
          ty += Math.sin(a * 1.3) * 0.34 * drift;
        }
        p.x += (tx - p.x) * pull;
        p.y += (ty - p.y) * pull;
      });
      draw();
      if (visible && !document.hidden) raf = requestAnimationFrame(step);
    };
    const resume = () => {
      if (!raf && !reduce && visible && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(step);
      }
    };

    // Before it plays the points lie scattered, so the first form is found.
    if (!reduce)
      for (const p of pts) {
        p.x = Math.cos(p.seed) * 0.9;
        p.y = Math.sin(p.seed * 1.3) * 0.9;
      }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      resume();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", resume);
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    fit();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", resume);
    };
  }, [drifts]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
