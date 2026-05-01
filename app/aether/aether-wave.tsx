"use client";

import { useEffect, useRef } from "react";

const DARK_COLORS: [number, number, number][] = [
  [56, 180, 255],
  [24, 220, 200],
  [80, 140, 255],
  [0, 200, 180],
  [100, 160, 255],
  [32, 210, 220],
  [60, 120, 255],
  [0, 190, 200],
];

const LIGHT_COLORS: [number, number, number][] = [
  [0, 140, 255],
  [0, 180, 200],
  [60, 100, 255],
  [0, 160, 180],
  [80, 120, 255],
  [0, 200, 180],
  [40, 110, 255],
  [0, 170, 210],
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getColor(col: number, isDark: boolean): [number, number, number] {
  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;
  const i = Math.floor(col / 3) % palette.length;
  const j = (i + 1) % palette.length;
  const t = (col % 3) / 3;
  return [
    lerp(palette[i][0], palette[j][0], t),
    lerp(palette[i][1], palette[j][1], t),
    lerp(palette[i][2], palette[j][2], t),
  ];
}

const CELL_W = 9;
const CELL_MAX_H = 52;
const GAP = 3;
const WAVE_SPEED = 55;
const FADE_MS = 2800;
const HOVER_FADE_MS = 1000;
const HOVER_RADIUS = 6;
const RADIUS = 3; // bar corner radius

type Cell = { born: number; col: number; height: number; hover?: boolean; layer?: number };

function drawRoundedBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const clampR = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + clampR, y);
  ctx.lineTo(x + w - clampR, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + clampR);
  ctx.lineTo(x + w, y + h - clampR);
  ctx.quadraticCurveTo(x + w, y + h, x + w - clampR, y + h);
  ctx.lineTo(x + clampR, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - clampR);
  ctx.lineTo(x, y + clampR);
  ctx.quadraticCurveTo(x, y, x + clampR, y);
  ctx.closePath();
  ctx.fill();
}

export function AetherWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number } | null>(null);
  const lastHoverColRef = useRef(-999);
  const touchActiveRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    let lastWave = 0;
    let waveFront = 0;
    const active = new Map<string, Cell>();

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * devicePixelRatio);
      canvas.height = Math.round(r.height * devicePixelRatio);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const isDark = () => document.documentElement.classList.contains("dark");

    const setX = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: clientX - rect.left };
    };

    const onMouseMove = (e: MouseEvent) => setX(e.clientX);
    const onMouseLeave = () => { if (!touchActiveRef.current) mouseRef.current = null; };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      touchActiveRef.current = true;
      setX(e.clientX);
      canvas.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && !touchActiveRef.current) return;
      setX(e.clientX);
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
      const stride = CELL_W + GAP;
      const totalCols = Math.ceil(W / stride) + 2;

      if (now - lastWave > WAVE_SPEED) {
        lastWave = now;
        const col = waveFront % totalCols;
        // Primary wave: smooth organic shape
        const p = (waveFront / 10) * Math.PI;
        const amp = 0.18 + 0.82 * Math.abs(Math.sin(p) * Math.cos(p * 0.38) + 0.15 * Math.sin(p * 2.3));
        const clampedAmp = Math.min(1, amp);
        active.set(`w-${col}`, { born: now, col, height: clampedAmp });

        // Secondary offset wave — softer, slightly different phase
        const p2 = ((waveFront + 4) / 10) * Math.PI;
        const amp2 = 0.1 + 0.45 * Math.abs(Math.sin(p2 * 1.3));
        const col2 = (waveFront + 2) % totalCols;
        const existing = active.get(`w-${col2}`);
        if (!existing) {
          active.set(`s-${col2}`, { born: now, col: col2, height: amp2, layer: 1 });
        }

        waveFront++;
      }

      // Hover ripple
      if (mouseRef.current) {
        const cursorCol = Math.floor(mouseRef.current.x / stride);
        if (cursorCol !== lastHoverColRef.current) {
          lastHoverColRef.current = cursorCol;
          for (let dc = -HOVER_RADIUS; dc <= HOVER_RADIUS; dc++) {
            const col = cursorCol + dc;
            if (col < 0 || col >= totalCols) continue;
            const dist = Math.abs(dc);
            const amp = Math.max(0.12, 1 - (dist / (HOVER_RADIUS + 1)) * 0.85);
            active.set(`h-${col}`, { born: now, col, height: amp, hover: true });
          }
        }
      } else {
        lastHoverColRef.current = -999;
      }

      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, W, H);

      const dark = isDark();
      const colCount = Math.ceil(W / stride) + 1;

      // Base dots — tiny rounded rests
      ctx.fillStyle = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
      for (let c = 0; c < colCount; c++) {
        const x = c * stride;
        const dotH = 5;
        drawRoundedBar(ctx, x, H / 2 - dotH / 2, CELL_W, dotH, 2);
      }

      // Active bars
      const expired: string[] = [];
      active.forEach((cell, key) => {
        const fadeDur = cell.hover ? HOVER_FADE_MS : FADE_MS;
        const age = now - cell.born;
        if (age > fadeDur) { expired.push(key); return; }

        const t = age / fadeDur;
        // Smooth in/out: fast bloom, slow fade
        const fade = t < 0.07 ? t / 0.07 : 1 - Math.pow((t - 0.07) / 0.93, 0.48);
        const isSecondary = cell.layer === 1;
        const maxAlpha = cell.hover
          ? (dark ? 0.95 : 0.9)
          : isSecondary
          ? (dark ? 0.38 : 0.3)
          : (dark ? 0.78 : 0.72);
        const alpha = fade * maxAlpha;

        const barH = Math.max(5, cell.height * CELL_MAX_H);
        const x = cell.col * stride;
        const y = H / 2 - barH / 2;

        const colorCol = cell.col + Math.floor(waveFront / 3) + (isSecondary ? 4 : 0);
        const [r, g, b] = getColor(colorCol, dark);
        ctx.fillStyle = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`;
        drawRoundedBar(ctx, x, y, CELL_W, barH, RADIUS);
      });
      expired.forEach((k) => active.delete(k));

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
    <div className="relative w-full overflow-hidden" style={{ height: 96, touchAction: "none" }}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10" style={{ background: "linear-gradient(to right, rgb(var(--bg)), transparent)" }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10" style={{ background: "linear-gradient(to left, rgb(var(--bg)), transparent)" }} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" style={{ display: "block" }} />
    </div>
  );
}
