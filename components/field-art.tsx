"use client";

import { useEffect, useRef } from "react";

// The hero's visual: a still, exact lattice of points, and an unseen mass
// that bends it. The mass follows the pointer, but it has weight of its own,
// so it trails behind and carries on a moment when the pointer stops. Each
// point is held to its place by a spring, so where the mass passes the
// lattice draws in, darkens, and when it moves on the points overshoot a
// touch before they settle. Nothing is drawn but the points. With no pointer
// the mass drifts slowly on its own, so the field is never quite at rest.
//
// On arrival the lattice settles into place from the centre out. It sits
// straight on the page, fading out toward its edges. Colour is the page's ink, read from the stylesheet, so it follows light and dark.
// It pauses off screen and in hidden tabs; with reduced motion it holds
// still.

const K = 0.055; // spring back to rest, per frame
const DAMP = 0.86; // velocity kept per frame: a little under critical, so it rings once
// The mass's softening radius (where its pull peaks) and strength, for a
// desktop panel; a phone panel gets a smaller, tighter well to match.
const SOFT = 90;
const PULL = 150;
const BASE_R = 1; // px, a point at rest
const ALPHA = 0.2; // a point at rest
const BUCKETS = 8; // alpha levels drawn as one path each
const HOT_FROM = 0.86; // how hard a point must be pulled to take the signal colour
// The field's edge: solid through the middle, gone by the panel's bounds.
const FIELD_FADE = "radial-gradient(ellipse 50% 50% at 50% 50%, black 55%, transparent 100%)";

export function FieldArt({ className = "", play = true, delay = 0 }: { className?: string; play?: boolean; delay?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !play) return;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let n = 0;
    let rx = new Float32Array(0); // rest
    let ry = new Float32Array(0);
    let dx = new Float32Array(0); // displacement
    let dy = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let born = new Float32Array(0); // ms after start that each point appears
    let ink = "26 26 26";
    let signal = "255 90 31";
    let soft = SOFT;
    let pullK = PULL;

    const readInk = () => {
      const cs = getComputedStyle(canvas);
      ink = cs.getPropertyValue("--ink-rgb").trim() || ink;
      signal = cs.getPropertyValue("--signal-rgb").trim() || signal;
    };

    // Lays the lattice out to fill the panel with even margins. Each point
    // starts pushed a little out from the centre, so it springs into place.
    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const gap = w < 640 ? 18 : 22;
      const fit = Math.min(1, Math.max(0.62, w / 1100));
      soft = SOFT * fit;
      pullK = PULL * fit;
      const cols = Math.floor(w / gap);
      const rows = Math.floor(h / gap);
      const ox = (w - (cols - 1) * gap) / 2;
      const oy = (h - (rows - 1) * gap) / 2;
      n = cols * rows;
      rx = new Float32Array(n);
      ry = new Float32Array(n);
      dx = new Float32Array(n);
      dy = new Float32Array(n);
      vx = new Float32Array(n);
      vy = new Float32Array(n);
      born = new Float32Array(n);
      const cx = w / 2;
      const cy = h / 2;
      const far = Math.hypot(cx, cy);
      for (let r = 0, i = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++, i++) {
          const x = ox + c * gap;
          const y = oy + r * gap;
          rx[i] = x;
          ry[i] = y;
          const d = Math.hypot(x - cx, y - cy) / far;
          born[i] = d * 900;
          if (!reduced) {
            dx[i] = (x - cx) * 0.035;
            dy[i] = (y - cy) * 0.035;
          }
        }
      }
    };

    // The mass: where it is, how fast it's going, how heavy it is now. It
    // chases its target on a soft spring of its own, which is what gives it
    // weight. `weight` eases between the pointer's full pull and the
    // lighter idle drift.
    const mass = { x: 0, y: 0, vx: 0, vy: 0, weight: 0 };
    let pointer: { x: number; y: number } | null = null;

    let t0 = 0;
    const draw = (now: number) => {
      const t = now - t0;
      ctx.clearRect(0, 0, w, h);
      const paths: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
      // The points pulled in hardest, at the crest of the well, take the
      // signal colour instead of ink, stronger the harder they're pulled.
      // At rest nothing is pulled that far, so the field stays grey.
      const hot: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
      for (let i = 0; i < n; i++) {
        const appear = Math.min(1, Math.max(0, (t - born[i]) / 500));
        if (appear <= 0) continue;
        const ease = 1 - Math.pow(1 - appear, 3);
        const off = Math.hypot(dx[i], dy[i]);
        // Points drawn in by the mass grow and darken a little, so its well
        // reads without anything being drawn at its centre.
        const pull = Math.min(1, off / 16);
        const r = BASE_R * (1 + pull * 0.9);
        const x = rx[i] + dx[i];
        const y = ry[i] + dy[i];
        const heat = (pull - HOT_FROM) / (1 - HOT_FROM);
        if (heat > 0) {
          const b = Math.min(BUCKETS - 1, Math.floor(heat * ease * BUCKETS));
          hot[b].moveTo(x + r, y);
          hot[b].arc(x, y, r, 0, Math.PI * 2);
          continue;
        }
        const a = (ALPHA + pull * 0.5) * ease;
        const b = Math.min(BUCKETS - 1, Math.floor((a / 0.7) * BUCKETS));
        paths[b].moveTo(x + r, y);
        paths[b].arc(x, y, r, 0, Math.PI * 2);
      }
      for (let b = 0; b < BUCKETS; b++) {
        ctx.fillStyle = `rgb(${ink} / ${((b + 0.5) / BUCKETS) * 0.7})`;
        ctx.fill(paths[b]);
        ctx.fillStyle = `rgb(${signal} / ${0.3 + ((b + 0.5) / BUCKETS) * 0.6})`;
        ctx.fill(hot[b]);
      }
    };

    const step = (now: number) => {
      const t = now - t0;
      // Idle drift: a slow figure across the panel, never repeating quickly.
      const ix = w * (0.5 + 0.3 * Math.sin(t * 0.00011));
      const iy = h * (0.5 + 0.28 * Math.sin(t * 0.00017 + 1.3));
      const tx = pointer ? pointer.x : ix;
      const ty = pointer ? pointer.y : iy;
      const want = pointer ? 1 : 0.7;
      mass.weight += (want - mass.weight) * 0.04;
      mass.vx = (mass.vx + (tx - mass.x) * 0.012) * 0.88;
      mass.vy = (mass.vy + (ty - mass.y) * 0.012) * 0.88;
      mass.x += mass.vx;
      mass.y += mass.vy;

      const s = pullK * mass.weight;
      const s2 = soft * soft;
      for (let i = 0; i < n; i++) {
        const px = rx[i] + dx[i];
        const py = ry[i] + dy[i];
        const ax = mass.x - px;
        const ay = mass.y - py;
        const f = s / (ax * ax + ay * ay + s2);
        vx[i] = (vx[i] + ax * f - dx[i] * K) * DAMP;
        vy[i] = (vy[i] + ay * f - dy[i] * K) * DAMP;
        dx[i] += vx[i];
        dy[i] += vy[i];
      }
    };

    readInk();
    layout();
    mass.x = w * 0.5;
    mass.y = h * 0.5;

    // Follows the theme toggle without a reload.
    const themeWatch = new MutationObserver(() => {
      readInk();
      if (reduced || !running) draw(performance.now());
    });
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const leave = () => {
      pointer = null;
    };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerdown", move);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("pointercancel", leave);
    // A finger lifting ends its pull; a mouse keeps hovering.
    const up = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") leave();
    };
    canvas.addEventListener("pointerup", up);

    const ro = new ResizeObserver(() => {
      if (Math.abs(canvas.clientWidth - w) < 1 && Math.abs(canvas.clientHeight - h) < 1) return;
      layout();
      born.fill(0);
      if (reduced || !running) draw(performance.now() + 1e6);
    });
    ro.observe(canvas);

    let raf = 0;
    let running = false;
    let visible = false;
    let started = false;
    const frame = (now: number) => {
      step(now);
      draw(now);
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      const should = started && visible && !document.hidden && !reduced;
      if (should && !running) {
        running = true;
        raf = requestAnimationFrame(frame);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);

    const timer = setTimeout(() => {
      started = true;
      t0 = performance.now();
      if (reduced) draw(t0 + 1e6);
      sync();
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      themeWatch.disconnect();
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerdown", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointercancel", leave);
      canvas.removeEventListener("pointerup", up);
    };
  }, [play, delay]);

  return (
    <div className={className}>
      {/* No tile: the field sits on the page itself and fades out toward
          its edges, so there's no box around it. */}
      <div className="relative aspect-[4/3] w-full sm:aspect-[12/5]">
        {/* pan-y keeps vertical swipes scrolling the page on phones; a
            sideways drag moves the mass. */}
        <canvas
          ref={ref}
          aria-label="A field of points, bent by an unseen mass that follows the pointer."
          className="h-full w-full touch-pan-y"
          style={{ WebkitMaskImage: FIELD_FADE, maskImage: FIELD_FADE }}
        />
      </div>
    </div>
  );
}
