"use client";

import { useEffect, useRef } from "react";

// Dark: subtle blue-grey, nearly monochrome
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

// Light: cool mid-greys on white — no colour cast
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
const ROWS = 10;
const WAVE_SPEED = 55;
const FADE_MS = 1200;
// Hover ripple: how many cols wide and how long cells stay lit
const HOVER_FADE_MS = 800;
const HOVER_RADIUS = 3; // columns each side of cursor

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

export function SoundwaveHero() {
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

    // Mouse handlers
    const onMouseMove = (e: MouseEvent) => {
      setPointFromEvent(e.clientX, e.clientY);
    };
    const onMouseLeave = () => {
      if (!touchActiveRef.current) mouseRef.current = null;
    };

    // Pointer handlers let touch users slide across the wave like hover.
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      touchActiveRef.current = true;
      setPointFromEvent(e.clientX, e.clientY);
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && !touchActiveRef.current) return;
      setPointFromEvent(e.clientX, e.clientY);
    };

    const clearPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        touchActiveRef.current = false;
        mouseRef.current = null;
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
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

      // Advance wave
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

      // Hover ripple — light up cells around cursor column at full height
      if (mouseRef.current) {
        const mx = mouseRef.current.x;
        const cursorCol = Math.floor(mx / CELL_SIZE);
        if (cursorCol !== lastHoverColRef.current) {
          lastHoverColRef.current = cursorCol;
          for (let dc = -HOVER_RADIUS; dc <= HOVER_RADIUS; dc++) {
            const col = cursorCol + dc;
            if (col < 0 || col >= totalCols) continue;
            // Height tapers away from cursor
            const dist = Math.abs(dc);
            const amp = 1 - dist / (HOVER_RADIUS + 1);
            const barH = Math.max(1, Math.round(ROWS * amp));
            for (let r = ROWS - 1; r >= ROWS - barH; r--) {
              const key = `h-${col}-${r}`;
              active.set(key, { born: now, col, row: r, hover: true });
            }
          }
        }
      } else {
        lastHoverColRef.current = -999;
      }

      // Draw
      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, W, H);

      const dark = isDark();
      const colCount = Math.ceil(W / CELL_SIZE) + 1;

      // Grid base
      ctx.fillStyle = dark ? "rgba(255,255,255,0.038)" : "rgba(15,23,42,0.048)";
      for (let c = 0; c < colCount; c++) {
        for (let r = 0; r < ROWS; r++) {
          ctx.fillRect(c * CELL_SIZE + GAP / 2, r * cellH + GAP / 2, CELL_SIZE - GAP, cellH - GAP);
        }
      }

      // Active cells
      const expired: string[] = [];
      active.forEach((cell, key) => {
        const fadeDur = cell.hover ? HOVER_FADE_MS : FADE_MS;
        const age = now - cell.born;
        if (age > fadeDur) { expired.push(key); return; }

        const t = age / fadeDur;
        const fade = t < 0.08 ? t / 0.08 : 1 - Math.pow((t - 0.08) / 0.92, 0.55);
        const fromBottom = ROWS - 1 - cell.row;
        const brightBoost = 0.45 + 0.55 * (fromBottom / (ROWS - 1));
        // Hover cells are brighter
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
    <section
      className="relative overflow-hidden cursor-crosshair"
      style={{ width: "100%", height: "380px", zIndex: 1, touchAction: "none" }}
      aria-hidden="true"
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{ height: "45%", background: "linear-gradient(to bottom, transparent, rgb(var(--bg)))", zIndex: 2 }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: "20%", background: "linear-gradient(to top, transparent, rgb(var(--bg)))", zIndex: 2 }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: "block" }} />
    </section>
  );
}
