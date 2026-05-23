"use client";

import { useEffect, useRef, useState } from "react";

// Lengths: right(6), fast(5), properly(9), yours(6), clean(6), built(6) — reordered so no two adjacent share length
// fast(5) -> right(6) -> properly(9) -> clean(6) -> built(5) -> yours(6)
const ROTATE_WORDS = ["fast", "right", "properly", "clean", "built", "yours"];
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

    // Three light blooms with independent breathing phases
    const blooms = [
      { nx: 0.18, ny: 0.22, phase: 0,           period: 7200, r: 0.55, h: 220, s: 80 },
      { nx: 0.82, ny: 0.30, phase: Math.PI * 0.7, period: 9100, r: 0.48, h: 200, s: 70 },
      { nx: 0.50, ny: 0.78, phase: Math.PI * 1.4, period: 8300, r: 0.42, h: 210, s: 60 },
    ];

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * devicePixelRatio);
      canvas.height = Math.round(H * devicePixelRatio);
    };

    const draw = (t: number) => {
      const isDark = document.documentElement.classList.contains("dark");

      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, W, H);

      for (const b of blooms) {
        const breath = 0.5 + 0.5 * Math.sin((t / b.period) * Math.PI * 2 + b.phase);
        const alpha = isDark
          ? 0.13 + 0.09 * breath
          : 0.07 + 0.05 * breath;
        const radius = (W * b.r) * (0.88 + 0.12 * breath);
        const cx = W * b.nx;
        const cy = H * b.ny;

        const hue = b.h + breath * 15;
        const sat = b.s + breath * 10;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0,   `hsla(${hue},${sat}%,${isDark ? 72 : 55}%,${alpha})`);
        grad.addColorStop(0.4, `hsla(${hue + 20},${sat - 10}%,${isDark ? 60 : 45}%,${alpha * 0.5})`);
        grad.addColorStop(1,   `hsla(${hue + 40},${sat - 20}%,${isDark ? 50 : 35}%,0)`);

        ctx.beginPath();
        ctx.ellipse(cx, cy, radius, radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    };

    resize();
    rafId = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const mo = new MutationObserver(() => {});
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
      style={{ width: "100%", height: "480px", zIndex: 1 }}
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
        style={{ display: "none" }}
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-5" style={{ zIndex: 3 }}>
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
              {li === 1 && <><RotatingWord /><span style={{ display: "inline-block" }}>.</span></>}
            </span>
          )}
        </h1>

        <div className="flex items-center gap-2" style={{ opacity: 0, animation: "hero-line 600ms cubic-bezier(0.16,1,0.3,1) 400ms forwards" }}>
          <span className="relative flex items-center justify-center w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "rgb(74,222,128)", animation: "ping 1.4s cubic-bezier(0,0,0.2,1) infinite" }} />
            <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "rgb(74,222,128)" }} />
          </span>
          <span className="text-[17px] tracking-tight" style={{ color: "rgb(var(--fg) / 0.5)" }}>Slots open. Come build with us.</span>
        </div>

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
