"use client";

import { useEffect, useRef } from "react";
import type { Form } from "@/components/point-forms";

// A field of ink points on a canvas, the homepage's one visual language after
// the opening plate (what-we-do.tsx, why-us.tsx). The points are pulled
// toward a form, a set of targets in a unit box (-1 to 1), and cycle through
// the forms they're given: each holds a while, the points let go and drift a
// little on paths of their own, and the next is found (or, without `drift`,
// step straight on to it, so the change itself is what's seen). When the forms change
// (a new reason lit) the same points glide on to them, so the field never
// resets. It draws only while it's on screen; with reduced motion it holds
// its first form, settled.

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
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = motion.matches;
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
      if (reduce) settle();
      draw();
    };
    // Reduced motion: the points simply at the last form.
    const settle = () => {
      targets = formsRef.current.map((f) => f(COUNT));
      targets[targets.length - 1].forEach(([x, y], i) => Object.assign(pts[i], { x, y }));
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

    // Before it plays the points lie scattered in a loose cloud, so the
    // first form is found. Hashed from the seed, so they fall at random
    // rather than into a lattice.
    const hash = (k: number) => {
      const v = Math.sin(k) * 43758.5453;
      return v - Math.floor(v);
    };
    if (!reduce)
      for (const p of pts) {
        const a = hash(p.seed) * Math.PI * 2;
        const r = Math.sqrt(hash(p.seed + 78.233)) * 0.85;
        p.x = Math.cos(a) * r;
        p.y = Math.sin(a) * r;
      }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      resume();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", resume);
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    // The preference changing while the page is open: settle, or start up.
    const onMotion = () => {
      reduce = motion.matches;
      if (reduce) {
        cancelAnimationFrame(raf);
        raf = 0;
        settle();
        draw();
      } else resume();
    };
    motion.addEventListener("change", onMotion);
    fit();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", resume);
      motion.removeEventListener("change", onMotion);
    };
  }, [drifts]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
