"use client";

import { useEffect, useRef, useState } from "react";

// A generative piece drawn fresh for every visit. Over a few seconds,
// well over a thousand fine lines flow through an invisible current (two
// octaves of smooth noise: broad sweeps with a little finer drift), each in
// a colour from a palette picked for this visit, and build up into long,
// silky streams that run across the whole frame. Then it holds, finished.
// A new visit gets a new seed, so a new palette and a new current: no two
// people see the same one. With reduced motion it's drawn at once.

// Each palette is a family of neighbouring, saturated hues, so where lines
// overlap they blend into each other cleanly instead of turning muddy.
const PALETTES = [
  ["#0ea5e9", "#22d3ee", "#3b82f6", "#6366f1"], // ocean
  ["#f43f5e", "#fb7185", "#f97316", "#f59e0b"], // sunset
  ["#7c3aed", "#a855f7", "#d946ef", "#ec4899"], // violet
  ["#14b8a6", "#06b6d4", "#38bdf8", "#818cf8"], // lagoon
  ["#10b981", "#14b8a6", "#3b82f6", "#8b5cf6"], // aurora
  ["#ef4444", "#f97316", "#f59e0b", "#e11d48"], // ember
];

// A small seeded generator, so a seed always draws the same piece.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth 2D value noise on a seeded lattice.
function makeNoise(rand: () => number) {
  const size = 256;
  const perm = Array.from({ length: size }, (_, i) => i);
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const vals = Array.from({ length: size }, () => rand());
  const at = (x: number, y: number) => vals[perm[(perm[x & 255] + y) & 255]];
  const fade = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = fade(x - x0);
    const fy = fade(y - y0);
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * fx;
    const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * fx;
    return a + (b - a) * fy;
  };
}

// `play` and `delay` hold the build until the piece is actually showing:
// the hero fades its panel in after the page loads, and on phones the panel
// starts below the fold, so drawing waits for both, then for the panel to
// be on screen.
export function FingerprintArt({ className = "", play = true, delay = 0 }: { className?: string; play?: boolean; delay?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [seed] = useState(() => {
    const b = new Uint32Array(1);
    crypto.getRandomValues(b);
    return b[0];
  });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !play) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const rand = mulberry32(seed);
    const noise = makeNoise(rand);
    const palette = PALETTES[Math.floor(rand() * PALETTES.length)];
    // Sized partly to the panel: a narrow phone panel gets more, tighter
    // sweeps and shorter lines than pixel sizing would give it, so it fills
    // with several streams instead of pooling into one, but not so many that
    // the swirls turn thin. 1200 is the desktop panel's width.
    const fit = Math.pow(Math.max(1, 1200 / Math.max(w, 1)), 0.6);
    const scale = (0.0016 + rand() * 0.0014) * fit; // how broad the current's sweeps are
    const twist = 1.6 + rand() * 1.4; // how hard it turns
    const dark = document.documentElement.dataset.theme === "dark" && document.documentElement.classList.contains("themed");
    ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
    ctx.lineCap = "round";

    // Each line starts somewhere random and follows the current. Long
    // lives, so neighbouring lines run on together into streams that cross
    // the whole frame.
    const N = Math.round(1500 * Math.min(1, Math.max(0.7, (w * h) / (1200 * 500))));
    const WIDTHS = [0.7, 1.2, 1.8];
    const lines = Array.from({ length: N }, () => ({
      x: rand() * w,
      y: rand() * h,
      color: Math.floor(rand() * palette.length),
      width: Math.floor(rand() * WIDTHS.length),
      life: (260 + rand() * 340) / fit,
    }));
    const STEPS = Math.ceil(600 / fit);
    // One step moves every line along the current. Segments are batched into
    // one path per colour and width, so a step is a handful of draw calls
    // rather than one per line (it has to run smoothly on phones).
    const stepOnce = () => {
      ctx.globalAlpha = dark ? 0.06 : 0.13;
      for (let c = 0; c < palette.length; c++) {
        for (let k = 0; k < WIDTHS.length; k++) {
          ctx.beginPath();
          let any = false;
          for (const l of lines) {
            if (l.life <= 0 || l.color !== c || l.width !== k) continue;
            // Two octaves of noise: broad sweeps, with a little finer drift.
            const a = (noise(l.x * scale, l.y * scale) * 0.8 + noise(l.x * scale * 3, l.y * scale * 3) * 0.2) * Math.PI * 2 * twist;
            const nx = l.x + Math.cos(a) * 1.6;
            const ny = l.y + Math.sin(a) * 1.6;
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(nx, ny);
            l.x = nx;
            l.y = ny;
            l.life--;
            any = true;
          }
          if (!any) continue;
          ctx.strokeStyle = palette[c];
          ctx.lineWidth = WIDTHS[k];
          ctx.stroke();
        }
      }
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      for (let s = 0; s < STEPS; s++) stepOnce();
      return;
    }
    // Build it up over about four seconds, then hold. It starts once the
    // delay has passed and the panel is on screen.
    let s = 0;
    let raf = 0;
    const frame = () => {
      // About the same build time on any panel.
      for (let k = 0; k < Math.max(1, Math.round(4 / fit)) && s < STEPS; k++, s++) stepOnce();
      if (s < STEPS) raf = requestAnimationFrame(frame);
    };
    let io: IntersectionObserver | null = null;
    const timer = setTimeout(() => {
      io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io?.disconnect();
        raf = requestAnimationFrame(frame);
      }, { threshold: 0.35 });
      io.observe(canvas);
    }, delay);
    return () => {
      clearTimeout(timer);
      io?.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [seed, play, delay]);

  return (
    <div className={className}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[6px] bg-[var(--tile)] sm:aspect-[12/5]">
        <canvas ref={ref} aria-label="A pattern drawn for this visit" className="h-full w-full" />
      </div>
    </div>
  );
}
