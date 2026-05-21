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
      const a = (alpha: number) => `rgba(${fr},${fg},${fb},${isDark ? alpha : alpha * 2.2})`;

      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;

      // -- Main crosshair lines --
      ctx.strokeStyle = a(isDark ? 0.22 : 0.18);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(W, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
      ctx.stroke();

      // -- Diagonal lines --
      ctx.strokeStyle = a(isDark ? 0.09 : 0.07);
      ctx.lineWidth = 0.6;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(W, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W, 0); ctx.lineTo(0, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // -- Tick marks along horizontal axis --
      const MAJOR_TICK = 80;
      const MINOR_TICK = 20;
      const MAJOR_H = 12;
      const MINOR_H = 6;

      ctx.lineWidth = 0.8;
      for (let x = 0; x <= W; x += MINOR_TICK) {
        const isMajor = x % MAJOR_TICK === 0;
        const tickH = isMajor ? MAJOR_H : MINOR_H;
        const alpha = isMajor ? (isDark ? 0.28 : 0.22) : (isDark ? 0.13 : 0.1);
        ctx.strokeStyle = a(alpha);
        ctx.beginPath();
        ctx.moveTo(x, cy - tickH / 2);
        ctx.lineTo(x, cy + tickH / 2);
        ctx.stroke();
      }

      // -- Tick marks along vertical axis --
      for (let y = 0; y <= H; y += MINOR_TICK) {
        const isMajor = y % MAJOR_TICK === 0;
        const tickH = isMajor ? MAJOR_H : MINOR_H;
        const alpha = isMajor ? (isDark ? 0.28 : 0.22) : (isDark ? 0.13 : 0.1);
        ctx.strokeStyle = a(alpha);
        ctx.beginPath();
        ctx.moveTo(cx - tickH / 2, y);
        ctx.lineTo(cx + tickH / 2, y);
        ctx.stroke();
      }

      // -- Concentric reference circles --
      const radii = [60, 140, 240, 360];
      for (const rad of radii) {
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.strokeStyle = a(isDark ? 0.1 : 0.08);
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // -- Corner bracket marks --
      const bSize = 28;
      const bOffset = 28;
      const corners: [number, number, number, number][] = [
        [bOffset, bOffset, 1, 1],
        [W - bOffset, bOffset, -1, 1],
        [bOffset, H - bOffset, 1, -1],
        [W - bOffset, H - bOffset, -1, -1],
      ];
      ctx.strokeStyle = a(isDark ? 0.28 : 0.24);
      ctx.lineWidth = 1;
      for (const [x, y, sx, sy] of corners) {
        ctx.beginPath();
        ctx.moveTo(x + sx * bSize, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + sy * bSize);
        ctx.stroke();
      }

      // -- Center reticle --
      const reticleR = 16;
      ctx.beginPath();
      ctx.arc(cx, cy, reticleR, 0, Math.PI * 2);
      ctx.strokeStyle = a(isDark ? 0.15 : 0.12);
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fillStyle = a(isDark ? 0.22 : 0.18);
      ctx.fill();

      // Gap lines through reticle
      ctx.strokeStyle = a(isDark ? 0.15 : 0.12);
      ctx.lineWidth = 0.8;
      const gap = reticleR + 6;
      const ext = 32;
      ctx.beginPath(); ctx.moveTo(cx - gap - ext, cy); ctx.lineTo(cx - gap, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + gap + ext, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - gap - ext); ctx.lineTo(cx, cy - gap); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + gap + ext); ctx.stroke();

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
        style={{ height: "50%", background: "linear-gradient(to bottom, transparent, rgb(var(--bg)))", zIndex: 2 }} />
      <div className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: "15%", background: "linear-gradient(to top, transparent, rgb(var(--bg)))", zIndex: 2 }} />
      <div className="pointer-events-none absolute inset-y-0 left-0"
        style={{ width: "8%", background: "linear-gradient(to right, rgb(var(--bg)), transparent)", zIndex: 2 }} />
      <div className="pointer-events-none absolute inset-y-0 right-0"
        style={{ width: "8%", background: "linear-gradient(to left, rgb(var(--bg)), transparent)", zIndex: 2 }} />
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
