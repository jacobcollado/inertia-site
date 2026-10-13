"use client";

import { useEffect, useRef } from "react";

// The hero's visual: a run of rooms seen down their doorways, in the line
// style of the homepage sketches (components/line-art.tsx). Each doorway is
// a frame with a little depth to its reveal, standing on one floor that runs
// back to a plain wall, and in the last room stands the flag. An experience
// is moving through spaces that agree with each other; this is that, drawn
// with nothing else in it.
//
// On arrival the view flies in from further back and settles. Scrolling
// carries you forward through the doorways, with a little weight so it
// glides rather than tracks the scrollbar, and the pointer turns the view a
// touch. Frames you pass fade out before they reach you, and the drawing
// fades into the paper at its edges. Colour is the page's ink, read from
// the stylesheet, so it follows light and dark; the flag is the signal
// colour. It pauses off screen, only draws while something is moving, and
// with reduced motion holds still at rest.

const DOORS = 4;
const GAP = 1.7; // world units between doorways
const REVEAL = 0.12; // depth of each frame
const HALF_W = 1; // half the corridor's width
const HALF_H = 0.6; // half the frame's height
const EYE = -0.08; // eye a touch above the middle, so the floor shows
const BACK = DOORS * GAP + 0.6; // the end wall
const REST = -1.5; // where the camera stands at rest, in front of the first door
const TRAVEL = BACK - 2.1 - REST; // how far scrolling carries it
const FLY_IN = 2.6; // how far back the arrival starts
const INTRO_MS = 1900;
const FLAG_MS = 560;
const FLAG_H = 0.3;
const LINE_W = 1.1;
// Solid through the middle, gone by the board's edges.
const EDGE = "linear-gradient(to right, transparent, black 14%, black 86%, transparent), linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// `frame` sets the board's shape (the hero's by default). `advance`, 0 to 1,
// walks the view forward through the doorways on its own, whatever the
// scroll: the login page sends it to 1 while signing in, so you step
// through as you enter.
export function RoomsArt({
  className = "",
  play = true,
  delay = 0,
  frame = "aspect-[4/3] w-full sm:aspect-[12/5]",
  advance = 0,
}: {
  className?: string;
  play?: boolean;
  delay?: number;
  frame?: string;
  advance?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const advanceRef = useRef(advance);
  const wakeRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    advanceRef.current = advance;
    wakeRef.current?.();
  }, [advance]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !play) return;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let focal = 0;
    let inView = true;
    let raf = 0;
    const start = performance.now() + delay;
    // The camera, and where it's heading.
    const cam = { x: 0, y: EYE, z: REST - (reduced ? 0 : FLY_IN) };
    const aim = { x: 0, y: EYE, z: REST };
    let scrollT = 0;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // At rest the first doorway fills about three quarters of the board.
      const d = -REST;
      focal = Math.min((w * 0.74) / (2 * HALF_W), (h * 0.74) / (2 * HALF_H)) * d;
    };

    const readScroll = () => {
      // Forward with the page, from the top until the board is mostly past.
      const r = canvas.getBoundingClientRect();
      const span = Math.max(240, r.top + window.scrollY + r.height * 0.5 - window.innerHeight * 0.2);
      scrollT = clamp(window.scrollY / span);
      const t = Math.max(easeOut(scrollT), clamp(advanceRef.current));
      aim.z = REST + (reduced ? 0 : t * TRAVEL);
    };

    const project = (x: number, y: number, z: number): [number, number] | null => {
      const dz = z - cam.z;
      if (dz < 0.05) return null;
      const k = focal / dz;
      return [w / 2 + (x - cam.x) * k, h / 2 + (y - cam.y) * k];
    };

    const rect = (z: number, top: number, bottom: number) => {
      const a = project(-HALF_W, top, z);
      const b = project(HALF_W, bottom, z);
      if (!a || !b) return false;
      ctx.rect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
      return true;
    };

    const draw = (now: number) => {
      const cs = getComputedStyle(canvas);
      const ink = cs.getPropertyValue("--ink-rgb").trim() || "26 26 26";
      const signal = cs.getPropertyValue("--signal").trim() || "#2a5cff";
      const t = reduced ? 1 : clamp((now - start) / INTRO_MS);
      const intro = easeOut(t);

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = LINE_W;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      const top = -HALF_H;
      const floor = HALF_H;

      // Fades a line in on arrival, back with distance, and out as you
      // walk up to it so nothing ever hits the lens.
      const alpha = (z: number, i: number) => {
        const dz = z - cam.z;
        const near = clamp((dz - 0.35) / 0.9);
        const far = 1 - clamp((dz - 1.2) / (BACK + 1)) * 0.55;
        const arrive = reduced ? 1 : clamp(intro * 1.6 - i * 0.1);
        return near * far * arrive;
      };
      const stroke = (a: number) => {
        ctx.strokeStyle = `rgb(${ink} / ${a.toFixed(3)})`;
        ctx.stroke();
      };

      // The floor's two edges, from just ahead of the camera to the end wall.
      for (const side of [-1, 1]) {
        const steps = 24;
        const z0 = Math.max(cam.z + 0.3, -1);
        for (let s = 0; s < steps; s++) {
          const za = z0 + ((BACK - z0) * s) / steps;
          const zb = z0 + ((BACK - z0) * (s + 1)) / steps;
          const p = project(side * HALF_W, floor, za);
          const q = project(side * HALF_W, floor, zb);
          if (!p || !q) continue;
          ctx.beginPath();
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(q[0], q[1]);
          stroke(alpha(za, 0));
        }
      }

      // The end wall: a plain, calm room.
      ctx.beginPath();
      if (rect(BACK, top, floor)) stroke(alpha(BACK, DOORS));

      // The doorways, far to near so nearer lines sit on top.
      for (let i = DOORS - 1; i >= 0; i--) {
        const z = i * GAP;
        const a = alpha(z, i);
        if (a <= 0.002) continue;
        ctx.beginPath();
        const front = rect(z, top, floor);
        const back = rect(z + REVEAL, top, floor);
        if (front && back) {
          for (const [x, y] of [[-HALF_W, top], [HALF_W, top], [HALF_W, floor], [-HALF_W, floor]] as const) {
            const p = project(x, y, z)!;
            const q = project(x, y, z + REVEAL)!;
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(q[0], q[1]);
          }
        }
        stroke(a);
      }

      // The flag, standing in the last room once the view has arrived.
      const flagT = reduced ? 1 : clamp((now - start - INTRO_MS * 0.8) / FLAG_MS);
      const grow = easeOut(flagT);
      const fz = BACK - 0.03;
      // Pole and pennant centred together on the room's middle.
      const foot = project(-FLAG_H * 0.2, floor, fz);
      const fa = alpha(fz, 0);
      if (foot && grow > 0 && fa > 0) {
        const k = focal / (fz - cam.z);
        const ph = FLAG_H * k * grow;
        const [fx, fy] = foot;
        ctx.globalAlpha = Math.min(1, fa * 1.4);
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx, fy - ph);
        ctx.strokeStyle = `rgb(${ink})`;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fx, fy - ph);
        ctx.lineTo(fx + ph * 0.4, fy - ph * 0.86);
        ctx.lineTo(fx, fy - ph * 0.72);
        ctx.closePath();
        ctx.fillStyle = signal;
        ctx.strokeStyle = signal;
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      return t < 1 || flagT < 1;
    };

    const tick = (now: number) => {
      raf = 0;
      // The camera carries weight: it eases toward where it's heading.
      const k = reduced ? 1 : 0.075;
      cam.x += (aim.x - cam.x) * k;
      cam.y += (aim.y - cam.y) * k;
      cam.z += (aim.z - cam.z) * k;
      const busy = draw(now);
      const moving = Math.abs(aim.x - cam.x) + Math.abs(aim.y - cam.y) + Math.abs(aim.z - cam.z) > 0.0005;
      if ((busy || moving || now < start) && inView) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf && inView && !document.hidden) raf = requestAnimationFrame(tick);
    };
    wakeRef.current = () => {
      readScroll();
      wake();
    };

    layout();
    readScroll();
    if (reduced) {
      cam.z = aim.z;
    }
    wake();

    const onScroll = () => {
      readScroll();
      wake();
    };
    const onPointer = (e: PointerEvent) => {
      if (reduced || e.pointerType !== "mouse") return;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      aim.x = nx * 0.32;
      aim.y = EYE + ny * 0.12;
      wake();
    };
    const ro = new ResizeObserver(() => {
      layout();
      readScroll();
      if (!raf) draw(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      wake();
    });
    io.observe(canvas);
    // Redraw when the theme flips, so the ink follows it.
    const mo = new MutationObserver(() => {
      if (!raf) draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      if (!raf) draw(performance.now());
    };
    scheme.addEventListener("change", onScheme);
    const onVisible = () => wake();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      wakeRef.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      scheme.removeEventListener("change", onScheme);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [play, delay]);

  return (
    <div className={className}>
      <div className={`relative ${frame}`}>
        <canvas
          ref={ref}
          role="img"
          aria-label="A run of doorways in one-point perspective, leading back to a calm, empty room with a flag in it."
          className="h-full w-full"
          style={{
            WebkitMaskImage: EDGE,
            maskImage: EDGE,
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        />
      </div>
    </div>
  );
}
