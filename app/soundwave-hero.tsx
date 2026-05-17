"use client";

import { useEffect, useRef } from "react";

// Noise field: sum of rotated sine waves at different frequencies and speeds
const FIELD_WAVES = [
  { kx: 0.0042, ky: 0.0028, speed: 0.00031, phase: 0.0  },
  { kx: -0.003, ky: 0.0051, speed: 0.00024, phase: 1.7  },
  { kx: 0.0061, ky: -0.002, speed: 0.00019, phase: 3.3  },
  { kx: -0.002, ky: -0.004, speed: 0.00027, phase: 5.1  },
  { kx: 0.0018, ky: 0.0065, speed: 0.00035, phase: 2.2  },
];

// Number of contour levels
const LEVELS = 14;
// Marching squares resolution (px per cell, CSS pixels)
const CELL = 10;
// Mouse influence radius (CSS px)
const MOUSE_R = 300;
const MOUSE_STRENGTH = 0.28;

function fieldAt(x: number, y: number, t: number, mx: number | null, my: number | null): number {
  let v = 0;
  for (const w of FIELD_WAVES) {
    v += Math.sin(w.kx * x + w.ky * y + w.speed * t + w.phase);
  }
  v /= FIELD_WAVES.length;

  if (mx !== null && my !== null) {
    const dx = x - mx;
    const dy = y - my;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < MOUSE_R) {
      const falloff = 1 - d / MOUSE_R;
      v += MOUSE_STRENGTH * falloff * falloff * falloff;
    }
  }

  return v;
}

// Linearly interpolate where the contour crosses an edge
function interp(va: number, vb: number, level: number): number {
  if (Math.abs(vb - va) < 1e-10) return 0.5;
  return (level - va) / (vb - va);
}

export function SoundwaveHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const touchActiveRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * devicePixelRatio);
      canvas.height = Math.round(r.height * devicePixelRatio);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const isDark = () => document.documentElement.classList.contains("dark");

    const setPoint = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onMouseMove = (e: MouseEvent) => setPoint(e.clientX, e.clientY);
    const onMouseLeave = () => { if (!touchActiveRef.current) mouseRef.current = null; };

    const touchStart = { x: 0, y: 0 };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      touchStart.x = e.clientX; touchStart.y = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") { setPoint(e.clientX, e.clientY); return; }
      const dx = Math.abs(e.clientX - touchStart.x);
      const dy = Math.abs(e.clientY - touchStart.y);
      if (!touchActiveRef.current && dy > dx) return;
      if (!touchActiveRef.current && dx > 8) {
        touchActiveRef.current = true;
        canvas.setPointerCapture(e.pointerId);
      }
      if (touchActiveRef.current) setPoint(e.clientX, e.clientY);
    };
    const clearPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        touchActiveRef.current = false;
        mouseRef.current = null;
        if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      }
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", clearPointer);
    canvas.addEventListener("pointercancel", clearPointer);

    const frame = (now: number) => {
      if (!running) return;

      const W = canvas.width / devicePixelRatio;
      const H = canvas.height / devicePixelRatio;
      const dark = isDark();

      const mx = mouseRef.current?.x ?? null;
      const my = mouseRef.current?.y ?? null;

      // Slow pan: terrain origin drifts at ~0.4px/sec horizontally, ~0.15px/sec vertically
      const panX = now * 0.00042;
      const panY = now * 0.00016;

      // Build scalar field on grid
      const cols = Math.ceil(W / CELL) + 2;
      const rows = Math.ceil(H / CELL) + 2;
      const field: number[] = new Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          field[r * cols + c] = fieldAt(c * CELL + panX, r * CELL + panY, now, mx, my);
        }
      }

      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, W, H);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Field range is roughly [-1, 1]; spread levels evenly
      const minVal = -1.1;
      const maxVal = 1.1 + MOUSE_STRENGTH;
      const step = (maxVal - minVal) / (LEVELS + 1);

      // Accent line: the middle contour level, slowly cycles through levels over time
      const accentLi = Math.floor((now * 0.00008) % LEVELS);

      for (let li = 0; li < LEVELS; li++) {
        const level = minVal + step * (li + 1);
        const isAccent = li === accentLi;

        // Occasional heavier lines: primes-ish offsets so it never feels periodic
        const isMajor = li === 2 || li === 6 || li === 11;

        if (isAccent) {
          ctx.strokeStyle = dark ? `rgba(100,160,255,0.7)` : `rgba(60,100,255,0.45)`;
          ctx.lineWidth = 1.6;
        } else if (isMajor) {
          const majorAlpha = dark ? 0.44 : 0.34;
          ctx.strokeStyle = dark
            ? `rgba(237,237,237,${majorAlpha})`
            : `rgba(14,14,14,${majorAlpha})`;
          ctx.lineWidth = 1.4;
        } else {
          const baseAlpha = dark ? 0.22 : 0.16;
          ctx.strokeStyle = dark
            ? `rgba(237,237,237,${baseAlpha})`
            : `rgba(14,14,14,${baseAlpha})`;
          ctx.lineWidth = 0.75;
        }

        ctx.beginPath();

        // Marching squares
        for (let r = 0; r < rows - 1; r++) {
          for (let c = 0; c < cols - 1; c++) {
            const x0 = c * CELL;
            const y0 = r * CELL;
            const x1 = x0 + CELL;
            const y1 = y0 + CELL;

            const v00 = field[r * cols + c];
            const v10 = field[r * cols + c + 1];
            const v01 = field[(r + 1) * cols + c];
            const v11 = field[(r + 1) * cols + c + 1];

            const idx =
              (v00 > level ? 8 : 0) |
              (v10 > level ? 4 : 0) |
              (v11 > level ? 2 : 0) |
              (v01 > level ? 1 : 0);

            if (idx === 0 || idx === 15) continue;

            // Edge midpoints
            const top    = { x: x0 + interp(v00, v10, level) * CELL, y: y0 };
            const right  = { x: x1, y: y0 + interp(v10, v11, level) * CELL };
            const bottom = { x: x0 + interp(v01, v11, level) * CELL, y: y1 };
            const left   = { x: x0, y: y0 + interp(v00, v01, level) * CELL };

            switch (idx) {
              case 1:  case 14: ctx.moveTo(left.x, left.y);   ctx.lineTo(bottom.x, bottom.y); break;
              case 2:  case 13: ctx.moveTo(bottom.x, bottom.y); ctx.lineTo(right.x, right.y);  break;
              case 3:  case 12: ctx.moveTo(left.x, left.y);   ctx.lineTo(right.x, right.y);   break;
              case 4:  case 11: ctx.moveTo(top.x, top.y);     ctx.lineTo(right.x, right.y);   break;
              case 6:  case 9:  ctx.moveTo(top.x, top.y);     ctx.lineTo(bottom.x, bottom.y); break;
              case 7:  case 8:  ctx.moveTo(left.x, left.y);   ctx.lineTo(top.x, top.y);       break;
              // Saddle cases
              case 5:
                ctx.moveTo(left.x, left.y);   ctx.lineTo(top.x, top.y);
                ctx.moveTo(bottom.x, bottom.y); ctx.lineTo(right.x, right.y);
                break;
              case 10:
                ctx.moveTo(top.x, top.y);     ctx.lineTo(right.x, right.y);
                ctx.moveTo(bottom.x, bottom.y); ctx.lineTo(left.x, left.y);
                break;
            }
          }
        }

        ctx.stroke();
      }

      ctx.restore();
      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);

    return () => {
      running = false;
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", clearPointer);
      canvas.removeEventListener("pointercancel", clearPointer);
    };
  }, []);

  return (
    <section
      className="relative overflow-hidden cursor-crosshair"
      style={{ width: "100%", height: "520px", zIndex: 1, touchAction: "pan-y" }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{ height: "45%", background: "linear-gradient(to bottom, transparent, rgb(var(--bg)))", zIndex: 2 }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: "20%", background: "linear-gradient(to top, transparent, rgb(var(--bg)))", zIndex: 2 }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          display: "block",
          opacity: 0,
          animation: "hero-canvas 1100ms cubic-bezier(0.16,1,0.3,1) 60ms forwards",
        }}
      />

      {/* Centered tagline */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-5"
        style={{ zIndex: 3 }}
      >
        {/* Label */}
        <div
          className="flex items-center gap-2"
          style={{
            opacity: 0,
            animation: "hero-line 600ms cubic-bezier(0.16,1,0.3,1) 80ms forwards",
          }}
        >
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-medium tracking-tight"
            style={{
              background: "rgb(60,100,255)",
              color: "#fff",
            }}
          >
            New
          </span>
          <span
            className="text-[13px] tracking-tight"
            style={{ color: "rgb(var(--fg) / 0.5)" }}
          >
            A sharper process, better outcomes.
          </span>
        </div>

        <h1
          className="text-[clamp(1.95rem,5vw,3.5rem)] font-[400] tracking-[-0.04em] leading-[1.05] text-[rgb(var(--fg))] text-center pointer-events-none relative w-[86%] sm:w-auto mx-auto"
          aria-label="We build the infrastructure that keeps you moving."
        >
          {["We build the infrastructure", "that keeps you moving."].map((line, li) =>
            <span key={li} style={{ display: "block" }}>
              {line.split("").map((ch, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: ch === " " ? "0.28em" : undefined,
                    opacity: 0,
                    animation: `char-in 80ms linear ${160 + li * 80 + i * 22}ms forwards`,
                  }}
                >
                  {ch}
                </span>
              ))}
            </span>
          )}
        </h1>

        {/* CTAs */}
        <div
          className="pointer-events-auto flex items-center gap-3 flex-wrap justify-center"
          style={{
            opacity: 0,
            animation: "hero-line 600ms cubic-bezier(0.16,1,0.3,1) 600ms forwards",
          }}
        >
          <a
            href="https://www.instagram.com/by.inertia/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight transition-opacity hover:opacity-75"
            style={{
              background: "rgb(var(--fg))",
              color: "rgb(var(--bg))",
            }}
          >
            Start a project ↗
          </a>
          <a
            href="/aether"
            className="rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight transition-opacity hover:opacity-75"
            style={{
              background: "rgb(var(--fg) / 0.12)",
              color: "rgb(var(--fg))",
              border: "1px solid rgb(var(--fg) / 0.18)",
            }}
          >
            See Aether →
          </a>
        </div>

      </div>
    </section>
  );
}
