"use client";

import { useEffect, useRef, useState } from "react";

// Lengths: right(6), fast(5), properly(9), yours(6), clean(6), built(6) — reordered so no two adjacent share length
// fast(5) -> right(6) -> properly(9) -> clean(6) -> built(5) -> yours(6)
const ROTATE_WORDS = ["fast.", "right.", "properly.", "clean.", "built.", "yours."];
const HOLD_MS = 2400;
const CHAR_STAGGER = 42;
const FILL_MS = 800;
const FILL_DELAY = 300; // delay after word finishes entering before gradient sweeps

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [fillKey, setFillKey] = useState(0);
  // containerWidth drives the outer span width — animates to next word during exit
  const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);
  const wordSizerRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const word = ROTATE_WORDS[index];
  const nextIndex = (index + 1) % ROTATE_WORDS.length;
  const enterDuration = word.length * CHAR_STAGGER + 120;
  const exitDuration  = word.length * CHAR_STAGGER + 80;

  // On mount, set container to current word width
  useEffect(() => {
    const t = setTimeout(() => {
      const el = wordSizerRefs.current[0];
      if (el) setContainerWidth(el.offsetWidth);
    }, 32);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When exit starts, animate container width to next word's width
  // so the whole line recenters before the new word enters
  useEffect(() => {
    if (phase !== "exit") return;
    const t = setTimeout(() => {
      const el = wordSizerRefs.current[nextIndex];
      if (el) setContainerWidth(el.offsetWidth);
    }, 16);
    return () => clearTimeout(t);
  }, [phase, nextIndex]);

  // After new word index is set, confirm container width matches
  useEffect(() => {
    const t = setTimeout(() => {
      const el = wordSizerRefs.current[index];
      if (el) setContainerWidth(el.offsetWidth);
    }, 16);
    return () => clearTimeout(t);
  }, [index]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "enter") {
      t = setTimeout(() => setPhase("hold"), enterDuration);
    } else if (phase === "hold") {
      t = setTimeout(() => setPhase("exit"), HOLD_MS);
    } else {
      t = setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATE_WORDS.length);
        setFillKey((k) => k + 1);
        setPhase("enter");
      }, exitDuration);
    }
    return () => clearTimeout(t);
  }, [phase, enterDuration, exitDuration]);

  const RESIZE_EASE = "cubic-bezier(0.22,1,0.36,1)";

  return (
    <span style={{
      display: "inline-block",
      position: "relative",
      verticalAlign: "baseline",
      width: containerWidth,
      transition: containerWidth ? `width ${exitDuration * 0.75}ms ${RESIZE_EASE}` : "none",
    }}>
      {/* One hidden sizer per word — all absolute, no layout impact */}
      {ROTATE_WORDS.map((w, wi) => (
        <span
          key={wi}
          ref={(el) => { wordSizerRefs.current[wi] = el; }}
          aria-hidden="true"
          style={{ position: "absolute", visibility: "hidden", whiteSpace: "nowrap", pointerEvents: "none" }}
        >{w}</span>
      ))}

      {/* Letters in normal flow, centered */}
      <span
        aria-live="polite"
        style={{ display: "flex", justifyContent: "center", whiteSpace: "nowrap" }}
      >
        {word.split("").map((ch, i) => {
          const exitDelay = (word.length - 1 - i) * CHAR_STAGGER;
          return phase === "exit" ? (
            <span
              key={`${index}-${i}-exit`}
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: ch === " " ? "0.28em" : undefined,
                opacity: 0,
                transform: "translateY(-10px)",
                transition: `opacity 80ms linear ${exitDelay}ms, transform 100ms cubic-bezier(0.4,0,1,1) ${exitDelay}ms`,
              }}
            >{ch}</span>
          ) : (
            <span
              key={`${index}-${i}-enter`}
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: ch === " " ? "0.28em" : undefined,
                opacity: 0,
                transform: "translateY(10px)",
                animation: `char-in 160ms cubic-bezier(0.22,1,0.36,1) ${i * CHAR_STAGGER}ms forwards`,
              }}
            >{ch}</span>
          );
        })}
      </span>

      {/* Underline — width matches container, centered */}
      <span style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "-0.14em",
        height: "3px",
        borderRadius: "2px",
        background: "rgb(var(--fg) / 0.13)",
        overflow: "hidden",
        display: "block",
      }}>
        <span
          key={fillKey}
          style={{
            display: "block",
            position: "absolute",
            inset: 0,
            borderRadius: "2px",
            opacity: 0,
            background: "linear-gradient(to right, transparent, rgb(var(--accent)), rgb(88,200,255), transparent)",
            animation: `underline-fill ${FILL_MS * 2}ms linear ${enterDuration + FILL_DELAY}ms`,
          }}
        />
      </span>
    </span>
  );
}

export function SoundwaveHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let W = 0, H = 0;

    // Wave origins — multiple sources moving slowly across the canvas
    type WaveOrigin = { x: number; y: number; vx: number; vy: number; phase: number; speed: number };
    const origins: WaveOrigin[] = Array.from({ length: 3 }, (_, i) => ({
      x: Math.random() * 1000,
      y: Math.random() * 600,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.12,
      phase: (i / 3) * Math.PI * 2,
      speed: 0.55 + Math.random() * 0.35,
    }));

    const SPACING = 24; // dot grid spacing px
    let cols = 0, rows = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * devicePixelRatio);
      canvas.height = Math.round(H * devicePixelRatio);
      cols = Math.ceil(W / SPACING) + 1;
      rows = Math.ceil(H / SPACING) + 1;
    };

    const draw = (t: number) => {
      const ts = t * 0.001;
      const isDark = document.documentElement.classList.contains("dark");
      const [fr, fg, fb] = isDark ? [170, 195, 255] : [34, 62, 200];

      // Move wave origins
      for (const o of origins) {
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < -200) o.x = W + 200;
        if (o.x > W + 200) o.x = -200;
        if (o.y < -200) o.y = H + 200;
        if (o.y > H + 200) o.y = -200;
      }

      // Clear zone for text
      const clearW = Math.min(W * 0.58, 480);
      const clearH = 180;
      const clearX = (W - clearW) / 2;
      const clearY = (H - clearH) / 2;
      const clearPad = 32;

      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, W, H);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const bx = col * SPACING;
          const by = row * SPACING;

          // Sum displacement from all wave origins
          let dx = 0, dy = 0;
          for (const o of origins) {
            const ddx = bx - o.x;
            const ddy = by - o.y;
            const dist = Math.sqrt(ddx * ddx + ddy * ddy);
            const wave = Math.sin(dist * 0.045 - ts * o.speed + o.phase);
            const falloff = Math.max(0, 1 - dist / (W * 0.7));
            dx += wave * falloff * 5.5;
            dy += wave * falloff * 5.5;
          }

          const x = bx + dx;
          const y = by + dy;

          // Skip dots inside text clear zone
          const inClearX = x > clearX - clearPad && x < clearX + clearW + clearPad;
          const inClearY = y > clearY - clearPad && y < clearY + clearH + clearPad;
          if (inClearX && inClearY) continue;

          // Fade near clear zone edges
          const distToClearX = inClearY ? Math.min(Math.abs(x - clearX + clearPad), Math.abs(x - clearX - clearW - clearPad)) : Infinity;
          const distToClearY = inClearX ? Math.min(Math.abs(y - clearY + clearPad), Math.abs(y - clearY - clearH - clearPad)) : Infinity;
          const distToClear = Math.min(distToClearX, distToClearY);
          const clearFade = Math.min(1, distToClear / 48);

          // Fade canvas edges — tighter so dots stay visible near bottom on mobile
          const edgeFadeX = Math.min(x / 20, (W - x) / 20, 1);
          const edgeFadeY = Math.min(y / 16, (H - y) / 16, 1);
          const edgeFade = Math.min(edgeFadeX, edgeFadeY, 1);

          // Dot brightness driven by wave displacement magnitude
          const mag = Math.sqrt(dx * dx + dy * dy) / 5.5;
          const baseAlpha = isDark ? 0.32 : 0.38;
          // Bottom-half boost: lower dots get extra visibility on mobile
          const bottomBoost = 1 + Math.max(0, (by / H - 0.5) * 0.7);
          const alpha = baseAlpha * (0.45 + 0.55 * mag) * clearFade * edgeFade * bottomBoost;
          if (alpha < 0.02) continue;

          // Dot radius: slightly larger when displaced
          const radius = 1.2 + mag * 1.0;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${fr},${fg},${fb},${Math.min(1, alpha)})`;
          ctx.fill();
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    };

    resize();
    rafId = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const mo = new MutationObserver(resize);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      mo.disconnect();
    };
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
          {["Your digital presence,", "done "].map((line, li) =>
            <span key={li} style={{ display: "flex", justifyContent: "center", alignItems: "baseline" }}>
              {line.split("").map((ch, i) => (
                <span key={i} aria-hidden="true" style={{ display: "inline-block", width: ch === " " ? "0.28em" : undefined, opacity: 0, animation: `char-in 80ms linear ${160 + li * 80 + i * 22}ms forwards` }}>
                  {ch}
                </span>
              ))}
              {li === 1 && <RotatingWord />}
            </span>
          )}
        </h1>

        <div className="pointer-events-auto flex items-center gap-3 flex-wrap justify-center" style={{ opacity: 0, animation: "hero-line 600ms cubic-bezier(0.16,1,0.3,1) 600ms forwards" }}>
          <a href="https://www.instagram.com/by.inertia/" target="_blank" rel="noreferrer"
            className="rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-[14px] sm:text-[15px] font-medium tracking-tight transition-opacity hover:opacity-75"
            style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}>
            Start a project ↗
          </a>
          <a href="/aether"
            className="rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-[14px] sm:text-[15px] font-medium tracking-tight transition-opacity hover:opacity-75"
            style={{ background: "transparent", color: "rgb(var(--fg))", border: "1px solid rgb(var(--fg) / 0.35)" }}>
            See Aether →
          </a>
        </div>
      </div>
    </section>
  );
}
