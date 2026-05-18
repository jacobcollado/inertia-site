"use client";

import { useEffect, useRef } from "react";

const FIELD_WAVES = [
  { kx: 0.0042, ky: 0.0028, speed: 0.00031, phase: 0.0 },
  { kx: -0.003, ky: 0.0051, speed: 0.00024, phase: 1.7 },
  { kx: 0.0061, ky: -0.002, speed: 0.00019, phase: 3.3 },
  { kx: -0.002, ky: -0.004, speed: 0.00027, phase: 5.1 },
  { kx: 0.0018, ky: 0.0065, speed: 0.00035, phase: 2.2 },
];

const LEVELS = 14;
const CELL = 10;
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

function interp(va: number, vb: number, level: number): number {
  if (Math.abs(vb - va) < 1e-10) return 0.5;
  return (level - va) / (vb - va);
}

export function ContourCanvas() {
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

    const getBlue = (alpha: number) => `rgba(37,99,235,${alpha})`;

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

      const accentIndices = new Set([2, 6, 11]);
      const majorIndices = new Set([0, 4, 9, 13]);

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

      for (let li = 0; li < LEVELS; li++) {
        const isAccent = accentIndices.has(li);
        const isMajor = majorIndices.has(li);

        if (isAccent) {
          // Glow pass
          ctx.save();
          ctx.filter = "blur(4px)";
          ctx.strokeStyle = getBlue(0.35);
          ctx.lineWidth = 5;
          drawLevel(li);
          ctx.filter = "none";
          ctx.restore();
          // Sharp pass
          ctx.strokeStyle = getBlue(0.9);
          ctx.lineWidth = 1.8;
        } else if (isMajor) {
          const majorAlpha = dark ? 0.44 : 0.34;
          ctx.strokeStyle = dark
            ? `rgba(237,237,237,${majorAlpha})`
            : `rgba(14,14,14,${majorAlpha})`;
          ctx.lineWidth = 1.4;
        } else {
          const baseAlpha = dark ? 0.18 : 0.13;
          ctx.strokeStyle = dark
            ? `rgba(237,237,237,${baseAlpha})`
            : `rgba(14,14,14,${baseAlpha})`;
          ctx.lineWidth = 0.65;
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
      className="absolute inset-0 cursor-crosshair"
      style={{ touchAction: "pan-y" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
