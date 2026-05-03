"use client";

import { useEffect, useRef } from "react";

const DARK_COLORS: [number, number, number][] = [
  [56, 108, 255],
  [24, 214, 255],
  [122, 88, 255],
  [0, 164, 255],
  [82, 132, 255],
  [40, 196, 255],
  [146, 96, 255],
  [0, 142, 255],
  [0, 196, 168],
  [82, 90, 255],
  [32, 232, 255],
  [176, 96, 255],
];

const LIGHT_COLORS: [number, number, number][] = [
  [0, 116, 255],
  [0, 196, 255],
  [94, 72, 255],
  [0, 164, 232],
  [255, 86, 166],
  [0, 186, 140],
  [126, 56, 255],
  [0, 142, 255],
  [255, 124, 64],
  [0, 170, 204],
  [196, 72, 255],
  [32, 128, 255],
];

const CELL_SIZE = 48;
const GAP = 4;
const ROWS = 5;
const WAVE_SPEED = 90;
const FADE_MS = 2000;
const HOVER_FADE_MS = 1100;
const HOVER_RADIUS = 3;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getColor(col: number, isDark: boolean): [number, number, number] {
  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;
  const i = Math.floor(col / 4) % palette.length;
  const j = (i + 1) % palette.length;
  const t = (col % 4) / 4;
  return [
    lerp(palette[i][0], palette[j][0], t),
    lerp(palette[i][1], palette[j][1], t),
    lerp(palette[i][2], palette[j][2], t),
  ];
}

type CellState = { born: number; col: number; row: number; hover?: boolean };

export function AetherWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const lastHoverColRef = useRef<number>(-999);
  const touchActiveRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    let lastWave = 0;
    let waveFront = 0;
    const active = new Map<string, CellState>();

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * devicePixelRatio);
      canvas.height = Math.round(r.height * devicePixelRatio);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const isDark = () => document.documentElement.classList.contains("dark");

    const setPointFromEvent = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onMouseMove = (e: MouseEvent) => setPointFromEvent(e.clientX, e.clientY);
    const onMouseLeave = () => { if (!touchActiveRef.current) mouseRef.current = null; };

    const touchStartRef = { x: 0, y: 0 };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      touchStartRef.x = e.clientX;
      touchStartRef.y = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") { setPointFromEvent(e.clientX, e.clientY); return; }
      const dx = Math.abs(e.clientX - touchStartRef.x);
      const dy = Math.abs(e.clientY - touchStartRef.y);
      if (!touchActiveRef.current && dy > dx) return;
      if (!touchActiveRef.current && dx > 8) {
        touchActiveRef.current = true;
        canvas.setPointerCapture(e.pointerId);
      }
      if (touchActiveRef.current) setPointFromEvent(e.clientX, e.clientY);
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
      const totalCols = Math.ceil(W / CELL_SIZE) + 2;
      const cellH = H / ROWS;

      if (now - lastWave > WAVE_SPEED) {
        lastWave = now;
        const col = waveFront % totalCols;
        const phase = (waveFront / 12) * Math.PI;
        const amp = 0.35 + 0.65 * Math.abs(Math.sin(phase) * Math.cos(phase * 0.37));
        const barH = Math.max(1, Math.round(ROWS * amp));
        for (let r = ROWS - 1; r >= ROWS - barH; r--) {
          active.set(`${col}-${r}`, { born: now, col, row: r });
        }
        waveFront++;
      }

      if (mouseRef.current) {
        const cursorCol = Math.floor(mouseRef.current.x / CELL_SIZE);
        if (cursorCol !== lastHoverColRef.current) {
          lastHoverColRef.current = cursorCol;
          for (let dc = -HOVER_RADIUS; dc <= HOVER_RADIUS; dc++) {
            const col = cursorCol + dc;
            if (col < 0 || col >= totalCols) continue;
            const dist = Math.abs(dc);
            const amp = 1 - dist / (HOVER_RADIUS + 1);
            const barH = Math.max(1, Math.round(ROWS * amp));
            for (let r = ROWS - 1; r >= ROWS - barH; r--) {
              active.set(`h-${col}-${r}`, { born: now, col, row: r, hover: true });
            }
          }
        }
      } else {
        lastHoverColRef.current = -999;
      }

      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, W, H);

      const dark = isDark();
      const colCount = Math.ceil(W / CELL_SIZE) + 1;

      ctx.fillStyle = dark ? "rgba(255,255,255,0.038)" : "rgba(15,23,42,0.048)";
      for (let c = 0; c < colCount; c++) {
        for (let r = 0; r < ROWS; r++) {
          ctx.fillRect(c * CELL_SIZE + GAP / 2, r * cellH + GAP / 2, CELL_SIZE - GAP, cellH - GAP);
        }
      }

      const expired: string[] = [];
      active.forEach((cell, key) => {
        const fadeDur = cell.hover ? HOVER_FADE_MS : FADE_MS;
        const age = now - cell.born;
        if (age > fadeDur) { expired.push(key); return; }
        const t = age / fadeDur;
        const fade = t < 0.08 ? t / 0.08 : 1 - Math.pow((t - 0.08) / 0.92, 0.55);
        const fromBottom = ROWS - 1 - cell.row;
        const brightBoost = 0.45 + 0.55 * (fromBottom / (ROWS - 1));
        const maxAlpha = cell.hover ? (dark ? 1.0 : 0.98) : (dark ? 0.92 : 0.88);
        const alpha = fade * brightBoost * maxAlpha;
        const colorCol = cell.col + Math.floor(waveFront / 4);
        const [r, g, b] = getColor(colorCol, dark);
        ctx.fillStyle = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`;
        ctx.fillRect(cell.col * CELL_SIZE + GAP / 2, cell.row * cellH + GAP / 2, CELL_SIZE - GAP, cellH - GAP);
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
    <div
      className="relative w-full overflow-hidden cursor-crosshair"
      style={{ height: 160, touchAction: "pan-y" }}
    >
      {/* Left fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10"
        style={{ background: "linear-gradient(to right, rgb(var(--bg)), transparent)" }} />
      {/* Right fade */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10"
        style={{ background: "linear-gradient(to left, rgb(var(--bg)), transparent)" }} />
      {/* Top fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={{ height: 32, background: "linear-gradient(to bottom, rgb(var(--bg)), transparent)" }} />
      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{ height: 32, background: "linear-gradient(to top, rgb(var(--bg)), transparent)" }} />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
