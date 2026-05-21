"use client";

import { useEffect, useRef } from "react";

export function SoundwaveHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const r = canvas.getBoundingClientRect();
      const W = r.width, H = r.height;
      canvas.width = Math.round(W * devicePixelRatio);
      canvas.height = Math.round(H * devicePixelRatio);

      const isDark = document.documentElement.classList.contains("dark");
      const [fr, fg, fb] = isDark ? [160, 185, 255] : [15, 35, 150];
      const a = (alpha: number) => `rgba(${fr},${fg},${fb},${isDark ? alpha : alpha * 2.0})`;

      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, W, H);

      // Clear zone — text lives here, nothing draws inside
      const clearW = Math.min(W * 0.62, 520);
      const clearH = 200;
      const clearX = (W - clearW) / 2;
      const clearY = (H - clearH) / 2;

      // Memory map parameters
      const CELL_W = 38;
      const CELL_H = 14;
      const GAP_X = 3;
      const GAP_Y = 3;
      const COLS = Math.ceil(W / (CELL_W + GAP_X)) + 1;
      const ROWS = Math.ceil(H / (CELL_H + GAP_Y)) + 1;

      // Seeded random for stable hex values
      let seed = 7;
      const rand = () => {
        seed = (seed * 1664525 + 1013904223) & 0xffffffff;
        return (seed >>> 0) / 0xffffffff;
      };
      const hex = () => Math.floor(rand() * 0x100).toString(16).toUpperCase().padStart(2, "0");

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const x = col * (CELL_W + GAP_X);
          const y = row * (CELL_H + GAP_Y);

          // Skip cells that overlap the clear zone (with padding)
          const pad = 18;
          const overlapX = x + CELL_W > clearX - pad && x < clearX + clearW + pad;
          const overlapY = y + CELL_H > clearY - pad && y < clearY + clearH + pad;
          if (overlapX && overlapY) continue;

          // Fade alpha based on distance from clear zone edges
          const distX = Math.max(0, overlapY ? (x < clearX ? clearX - pad - x - CELL_W : x - (clearX + clearW + pad)) : 0);
          const distY = Math.max(0, overlapX ? (y < clearY ? clearY - pad - y - CELL_H : y - (clearY + clearH + pad)) : 0);
          const dist = Math.sqrt(distX * distX + distY * distY);
          const fade = Math.min(1, dist / 60);

          // Also fade toward canvas edges
          const edgeFadeX = Math.min(x / 40, (W - x - CELL_W) / 40, 1);
          const edgeFadeY = Math.min(y / 40, (H - y - CELL_H) / 40, 1);
          const edgeFade = Math.min(edgeFadeX, edgeFadeY, 1);

          const alpha = fade * edgeFade * (isDark ? 0.22 : 0.18);
          if (alpha < 0.02) continue;

          // Hex cell: address-like value
          const value = `${hex()} ${hex()}`;

          // Occasionally show a "highlighted" cell (like an active address)
          const isActive = rand() > 0.94;

          ctx.font = `${isActive ? "500" : "400"} 9px monospace`;
          ctx.fillStyle = a(isActive ? alpha * 1.8 : alpha);
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText(value, x, y);
        }
      }

      ctx.restore();
    };

    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    draw();
    return () => { ro.disconnect(); mo.disconnect(); };
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{ width: "100%", height: "520px", zIndex: 1 }}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{ height: "30%", background: "linear-gradient(to bottom, transparent, rgb(var(--bg)))", zIndex: 2 }} />
      <div className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: "12%", background: "linear-gradient(to top, transparent, rgb(var(--bg)))", zIndex: 2 }} />
      <div className="pointer-events-none absolute inset-y-0 left-0"
        style={{ width: "6%", background: "linear-gradient(to right, rgb(var(--bg)), transparent)", zIndex: 2 }} />
      <div className="pointer-events-none absolute inset-y-0 right-0"
        style={{ width: "6%", background: "linear-gradient(to left, rgb(var(--bg)), transparent)", zIndex: 2 }} />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block", opacity: 0, animation: "hero-canvas 1100ms cubic-bezier(0.16,1,0.3,1) 60ms forwards" }}
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-5" style={{ zIndex: 3 }}>
        <div className="flex items-center gap-2" style={{ opacity: 0, animation: "hero-line 600ms cubic-bezier(0.16,1,0.3,1) 80ms forwards" }}>
          <span className="rounded-full px-2.5 py-0.5 text-[12px] font-medium tracking-tight" style={{ background: "rgb(60,100,255)", color: "#fff" }}>New</span>
          <span className="text-[15px] tracking-tight" style={{ color: "rgb(var(--fg) / 0.5)" }}>The digital half of your business.</span>
        </div>

        <h1
          className="text-[clamp(2.4rem,5vw,4rem)] font-[400] tracking-[-0.04em] leading-[1.05] text-[rgb(var(--fg))] text-center pointer-events-none relative w-[86%] sm:w-auto mx-auto"
          aria-label="Your digital presence, done right."
        >
          {["Your digital presence,", "done right."].map((line, li) =>
            <span key={li} style={{ display: "block" }}>
              {line.split("").map((ch, i) => (
                <span key={i} aria-hidden="true" style={{ display: "inline-block", width: ch === " " ? "0.28em" : undefined, opacity: 0, animation: `char-in 80ms linear ${160 + li * 80 + i * 22}ms forwards` }}>
                  {ch}
                </span>
              ))}
            </span>
          )}
        </h1>

        <div className="pointer-events-auto flex items-center gap-3 flex-wrap justify-center" style={{ opacity: 0, animation: "hero-line 600ms cubic-bezier(0.16,1,0.3,1) 600ms forwards" }}>
          <a href="https://www.instagram.com/by.inertia/" target="_blank" rel="noreferrer"
            className="rounded-full px-5 py-2.5 text-[15px] font-medium tracking-tight transition-opacity hover:opacity-75"
            style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}>
            Start a project ↗
          </a>
          <a href="/aether"
            className="rounded-full px-5 py-2.5 text-[15px] font-medium tracking-tight transition-opacity hover:opacity-75"
            style={{ background: "transparent", color: "rgb(var(--fg))", border: "1px solid rgb(var(--fg) / 0.35)" }}>
            See Aether →
          </a>
        </div>
      </div>
    </section>
  );
}
