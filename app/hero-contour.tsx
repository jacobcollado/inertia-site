"use client";

import { useEffect, useRef } from "react";

// Generative topographic contour field for the hero centerpiece. Same marching-
// squares engine as ContourCanvas, but tuned for the dark hero: lines are mostly
// neutral, and the highest contour levels (the peaks/ridges) bloom into a soft
// spectrum. Mouse-reactive. Self-contained, no assets.

// Primary field waves. Mixed directions/frequencies so ridges rarely align into
// long straight bands.
const FIELD_WAVES = [
  { kx: 0.0052, ky: 0.0031, speed: 0.00031, phase: 0.0 },
  { kx: -0.0034, ky: 0.0058, speed: 0.00024, phase: 1.7 },
  { kx: 0.0071, ky: -0.0026, speed: 0.00019, phase: 3.3 },
  { kx: -0.0026, ky: -0.0049, speed: 0.00027, phase: 5.1 },
  { kx: 0.0021, ky: 0.0076, speed: 0.00035, phase: 2.2 },
  { kx: 0.0094, ky: 0.0067, speed: 0.00041, phase: 4.0 },
];

// Domain-warp waves. These bend the sample coordinates before the field is read,
// turning straight ridges into curved, swirling topography. This is the main
// lever for the organic feel.
const WARP_WAVES = [
  { kx: 0.0061, ky: 0.0039, speed: 0.00022, phase: 0.6, amp: 26 },
  { kx: -0.0048, ky: 0.0072, speed: 0.00017, phase: 2.9, amp: 22 },
];

const LEVELS = 16;
const CELL = 9;
const MOUSE_R = 280;
const MOUSE_STRENGTH = 0.3;

// Spectrum ramp applied to the top contour levels (the peaks). Lower levels stay
// neutral white. index 0 = lowest spectrum band, last = highest peak.
const SPECTRUM = [
  "255,94,94",   // red
  "255,178,77",  // amber
  "94,217,138",  // green
  "77,184,255",  // blue
  "176,124,255", // violet
];

function fieldAt(x: number, y: number, t: number, mx: number | null, my: number | null): number {
  // Domain warp: displace the sample point using slow waves of the *other* axis
  // so the field curves and swirls instead of forming straight parallel ridges.
  let wx = 0;
  let wy = 0;
  for (const w of WARP_WAVES) {
    wx += w.amp * Math.sin(w.kx * y + w.speed * t + w.phase);
    wy += w.amp * Math.sin(w.ky * x + w.speed * t + w.phase * 1.3);
  }
  const sx = x + wx;
  const sy = y + wy;

  let v = 0;
  for (const w of FIELD_WAVES) {
    v += Math.sin(w.kx * sx + w.ky * sy + w.speed * t + w.phase);
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

function interp(va: number, vb: number, level: number): number {
  if (Math.abs(vb - va) < 1e-10) return 0.5;
  return (level - va) / (vb - va);
}

export function HeroContour() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

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

    const setPoint = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: clientX - rect.left, y: clientY - rect.top };
    };
    const onMove = (e: MouseEvent) => setPoint(e.clientX, e.clientY);
    const onLeave = () => { mouseRef.current = null; };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    const frame = (now: number) => {
      if (!running) return;

      const W = canvas.width / devicePixelRatio;
      const H = canvas.height / devicePixelRatio;

      const mx = mouseRef.current?.x ?? null;
      const my = mouseRef.current?.y ?? null;

      const panX = now * 0.00042;
      const panY = now * 0.00016;

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

      const minVal = -1.1;
      const maxVal = 1.1 + MOUSE_STRENGTH;
      const step = (maxVal - minVal) / (LEVELS + 1);

      const drawLevel = (li: number) => {
        const level = minVal + step * (li + 1);
        ctx.beginPath();
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
            const top    = { x: x0 + interp(v00, v10, level) * CELL, y: y0 };
            const right  = { x: x1, y: y0 + interp(v10, v11, level) * CELL };
            const bottom = { x: x0 + interp(v01, v11, level) * CELL, y: y1 };
            const left   = { x: x0, y: y0 + interp(v00, v01, level) * CELL };
            switch (idx) {
              case 1:  case 14: ctx.moveTo(left.x, left.y);     ctx.lineTo(bottom.x, bottom.y); break;
              case 2:  case 13: ctx.moveTo(bottom.x, bottom.y); ctx.lineTo(right.x, right.y);   break;
              case 3:  case 12: ctx.moveTo(left.x, left.y);     ctx.lineTo(right.x, right.y);   break;
              case 4:  case 11: ctx.moveTo(top.x, top.y);       ctx.lineTo(right.x, right.y);   break;
              case 6:  case 9:  ctx.moveTo(top.x, top.y);       ctx.lineTo(bottom.x, bottom.y); break;
              case 7:  case 8:  ctx.moveTo(left.x, left.y);     ctx.lineTo(top.x, top.y);       break;
              case 5:
                ctx.moveTo(left.x, left.y);     ctx.lineTo(top.x, top.y);
                ctx.moveTo(bottom.x, bottom.y); ctx.lineTo(right.x, right.y);
                break;
              case 10:
                ctx.moveTo(top.x, top.y);       ctx.lineTo(right.x, right.y);
                ctx.moveTo(bottom.x, bottom.y); ctx.lineTo(left.x, left.y);
                break;
            }
          }
        }
        ctx.stroke();
      };

      // The top SPECTRUM.length levels are the peaks → spectrum. Everything below
      // stays neutral, getting subtly brighter toward the higher levels.
      const spectrumStart = LEVELS - SPECTRUM.length;

      for (let li = 0; li < LEVELS; li++) {
        if (li >= spectrumStart) {
          const s = SPECTRUM[li - spectrumStart];
          // Glow pass
          ctx.save();
          ctx.filter = "blur(5px)";
          ctx.strokeStyle = `rgba(${s},0.4)`;
          ctx.lineWidth = 5;
          drawLevel(li);
          ctx.filter = "none";
          ctx.restore();
          // Sharp pass
          ctx.strokeStyle = `rgba(${s},0.95)`;
          ctx.lineWidth = 1.7;
        } else {
          // Neutral lines, fading toward the lower (outer/valley) levels.
          const t = li / spectrumStart;             // 0..1 up to spectrum
          const alpha = 0.08 + t * 0.22;            // 0.08 → 0.30
          ctx.strokeStyle = `rgba(237,237,237,${alpha})`;
          ctx.lineWidth = 0.7 + t * 0.7;            // thin → slightly thicker
        }
        drawLevel(li);
      }

      ctx.restore();
      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);

    return () => {
      running = false;
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
      aria-hidden="true"
    />
  );
}
