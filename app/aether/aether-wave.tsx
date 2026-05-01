"use client";

import { useEffect, useRef } from "react";

// Blue-green palette echoing the Shopify/commerce feel
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

const CELL_W = 6;
const CELL_H = 32;
const GAP = 2;
const WAVE_SPEED = 60;
const FADE_MS = 2400;
const HOVER_FADE_MS = 900;
const HOVER_RADIUS = 5;

type Cell = { born: number; col: number; height: number; hover?: boolean };

export function AetherWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number } | null>(null);
  const lastHoverColRef = useRef(-999);

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

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left };
    };
    const onMouseLeave = () => { mouseRef.current = null; };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    const frame = (now: number) => {
      if (!running) return;

      const W = canvas.width / devicePixelRatio;
      const H = canvas.height / devicePixelRatio;
      const totalCols = Math.ceil(W / (CELL_W + GAP)) + 2;

      if (now - lastWave > WAVE_SPEED) {
        lastWave = now;
        const col = waveFront % totalCols;
        const phase = (waveFront / 8) * Math.PI;
        const amp = 0.2 + 0.8 * Math.abs(Math.sin(phase) * Math.cos(phase * 0.4));
        active.set(`w-${col}`, { born: now, col, height: amp });
        waveFront++;
      }

      if (mouseRef.current) {
        const cursorCol = Math.floor(mouseRef.current.x / (CELL_W + GAP));
        if (cursorCol !== lastHoverColRef.current) {
          lastHoverColRef.current = cursorCol;
          for (let dc = -HOVER_RADIUS; dc <= HOVER_RADIUS; dc++) {
            const col = cursorCol + dc;
            if (col < 0 || col >= totalCols) continue;
            const dist = Math.abs(dc);
            const amp = Math.max(0.15, 1 - dist / (HOVER_RADIUS + 1));
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

      // Draw base grid dots
      ctx.fillStyle = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
      const colCount = Math.ceil(W / (CELL_W + GAP)) + 1;
      for (let c = 0; c < colCount; c++) {
        const x = c * (CELL_W + GAP);
        const baseH = 4;
        ctx.fillRect(x, H / 2 - baseH / 2, CELL_W, baseH);
      }

      // Draw active bars (centered vertically)
      const expired: string[] = [];
      active.forEach((cell, key) => {
        const fadeDur = cell.hover ? HOVER_FADE_MS : FADE_MS;
        const age = now - cell.born;
        if (age > fadeDur) { expired.push(key); return; }

        const t = age / fadeDur;
        const fade = t < 0.06 ? t / 0.06 : 1 - Math.pow((t - 0.06) / 0.94, 0.5);
        const maxAlpha = cell.hover ? (dark ? 0.95 : 0.9) : (dark ? 0.75 : 0.7);
        const alpha = fade * maxAlpha;

        const barH = Math.max(4, cell.height * CELL_H);
        const x = cell.col * (CELL_W + GAP);
        const y = H / 2 - barH / 2;

        const colorCol = cell.col + Math.floor(waveFront / 3);
        const [r, g, b] = getColor(colorCol, dark);
        ctx.fillStyle = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`;
        ctx.fillRect(x, y, CELL_W, barH);
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
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 72 }}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10" style={{ background: "linear-gradient(to right, rgb(var(--bg)), transparent)" }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10" style={{ background: "linear-gradient(to left, rgb(var(--bg)), transparent)" }} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" style={{ display: "block" }} />
    </div>
  );
}
