"use client";

import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { ShapeProvider } from "@/lib/shape-context";
import { AskUserQuestions, type AskUserQuestion, type AskUserAnswer } from "@/components/ui/ask-user-questions";
import { ctaScaleHoverOnParent, ctaScaleHoverOnSelf, CTA_SCALE_PRESS, CTA_SCALE_RESET, CTA_SCALE_SPRING } from "@/lib/cta-hover-motion";
import {
  ACTION_RADIUS_CLASS,
  ACTION_RADIUS_PX,
  CTA_FILL,
  CTA_INSET_SHADOW,
  CTA_OUTER_SHADOW,
  CTA_PILL_CLASS,
  CtaGrain,
} from "@/lib/cta-chrome";
import type { PostMeta } from "@/lib/posts";

export type ClientCarouselItem = {
  slug: string;
  client: string;
  blurb?: string;
  logo?: string;
  service?: string;
  year?: string;
  summary?: string;
  image?: string;
};

export default function Home({
  initialWork,
  initialPosts,
}: {
  initialWork: ClientCarouselItem[];
  initialPosts: PostMeta[];
}) {
  return <VisualLayout initialWork={initialWork} initialPosts={initialPosts} />;
}

const LIQUID_REVEAL = "rise rise--liquid";

function liquidRevealDelay(ms: number): React.CSSProperties {
  return { "--rise-delay": `${ms}ms` } as React.CSSProperties;
}

function useLiquidReveal(active: boolean, delayMs = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;

    el.classList.remove("is-visible");

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let outerRaf = 0;
    let innerRaf = 0;

    const reveal = () => {
      outerRaf = requestAnimationFrame(() => {
        innerRaf = requestAnimationFrame(() => el.classList.add("is-visible"));
      });
    };

    if (delayMs > 0) timeoutId = setTimeout(reveal, delayMs);
    else reveal();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
    };
  }, [active, delayMs]);

  return ref;
}

function ServicesSection() {
  return (
    <section className="w-full max-w-[80rem] mx-auto px-6 sm:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <p
          className="rise rise--liquid text-[clamp(1.8rem,4vw,2.5rem)] font-normal tracking-tight max-sm:tracking-[-0.05em] sm:tracking-tight leading-snug text-[rgb(var(--fg))]"
          style={{ fontVariationSettings: "'wght' 400, 'opsz' 32" }}
        >
          We build the version of your business (and product){" "}
          <span className="box-decoration-clone border-b border-dashed border-[rgb(var(--fg))]/50 [border-bottom-width:1px] pb-[0.12em]">
            people fall
          </span>{" "}
          for.
        </p>
      </div>
    </section>
  );
}

type Plan = "free" | "service";

function DashboardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [plan, setPlan] = useState<Plan>("free");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // The reset is deferred so the form doesn't visibly clear mid close
    // animation. Track the timer so it's cancelled on unmount — otherwise it
    // fires setState on an unmounted component when the modal closes and the
    // tree tears down inside the 300ms window.
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    if (!open) {
      resetTimer = setTimeout(() => { setDone(false); setError(""); setEmail(""); setName(""); setPlan("free"); }, 300);
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) { document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden"; }
    return () => {
      if (resetTimer) clearTimeout(resetTimer);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: err } = await supabase.from("dashboard_waitlist").insert({ name, email, plan });
      if (err) throw err;
      setDone(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const accent = "rgb(var(--blue))";
  const inputBase = "w-full bg-transparent border-0 border-b py-3 text-[16px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none transition-colors duration-200";

  const PLANS = [
    { key: "free" as Plan, label: "Get early access", sub: "Free, no commitment" },
    { key: "service" as Plan, label: "Work with us", sub: "Already a client or ready to start" },
  ];

  const modal = (
    <div
      ref={backdropRef}
      className="fixed z-50 flex items-end sm:items-center justify-center"
      style={{
        inset: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: "100dvh",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 220ms ease",
      }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className="relative w-full sm:max-w-[420px] bg-[rgb(var(--bg))] border border-[rgb(var(--line))] rounded-t-2xl sm:rounded-sm mx-0 sm:mx-4 overflow-y-auto overscroll-contain"
        style={{
          maxHeight: "90dvh",
          animation: open ? "modal-up 320ms cubic-bezier(0.22,1,0.36,1) both" : "none",
        }}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-[rgb(var(--line))]" />
        </div>

        <button
          onClick={onClose}
          className="hidden sm:flex absolute top-4 right-4 w-7 h-7 items-center justify-center text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          aria-label="Close"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>

        <div className="px-6 sm:px-8 pt-5 sm:pt-7 pb-8 sm:pb-8">
          {done ? (
            <div style={{ animation: "liquid-in 680ms cubic-bezier(0.22,0.61,0.36,1) both" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-4" style={{ background: "rgb(var(--blue)/0.1)" }}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: accent }}>
                  <polyline points="2 8 6 12 14 4" />
                </svg>
              </div>
              <p className="text-[20px] font-normal tracking-tight text-[rgb(var(--fg))] leading-snug mb-2">
                {plan === "service" ? "We'll be in touch soon." : "You're on the list."}
              </p>
              <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                {plan === "service"
                  ? "We'll review your details and reach out within a day to get things moving."
                  : "Access is limited while we build. We'll email you when your spot is ready."}
              </p>
              <button onClick={onClose} className="mt-6 text-[13px] tracking-tight transition-colors hover:text-[rgb(var(--fg))]" style={{ color: accent }}>
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] mb-3">Inertia Dashboard</p>
              <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-normal tracking-tight text-[rgb(var(--fg))] leading-snug mb-2">
                Your project, all in one place
              </h2>
              <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed mb-7">
                Status updates, files, invoices, and support. Built for clients who want visibility without the back-and-forth.
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-7">
                {PLANS.map(({ key, label, sub }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPlan(key)}
                    className="flex flex-col gap-1 p-3.5 border text-left transition-all duration-150 rounded-[6px]"
                    style={{
                      borderColor: plan === key ? accent : "rgb(var(--line))",
                      background: plan === key ? "rgb(var(--blue)/0.07)" : "transparent",
                    }}
                  >
                    <span className="text-[13px] font-medium tracking-tight" style={{ color: plan === key ? accent : "rgb(var(--fg))" }}>{label}</span>
                    <span className="text-[11.5px] tracking-tight text-[rgb(var(--muted))] leading-snug">{sub}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="your name" autoComplete="name" className={inputBase}
                  style={{ borderColor: name ? accent : "rgb(var(--line))" }}
                  onFocus={(e) => { e.target.style.borderColor = accent; }}
                  onBlur={(e) => { e.target.style.borderColor = name ? accent : "rgb(var(--line))"; }}
                />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="email address" autoComplete="email" className={inputBase}
                  style={{ borderColor: email ? accent : "rgb(var(--line))" }}
                  onFocus={(e) => { e.target.style.borderColor = accent; }}
                  onBlur={(e) => { e.target.style.borderColor = email ? accent : "rgb(var(--line))"; }}
                />
                {plan === "service" && (
                  <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] -mt-2 leading-relaxed">
                    Tell us a bit about your project in the next step and we'll take it from there.
                  </p>
                )}
                {error && <p className="text-[13px] tracking-tight text-red-500 -mt-1">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-[15px] tracking-tight font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed mt-1"
                  style={{ background: "var(--accent-gradient)", color: "white" }}
                >
                  {loading ? "Sending..." : plan === "free" ? "Get early access" : "Start the conversation"}
                  {!loading && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}

// The "anti [!] slow" eyebrow's centre mark: a small squared, outline-only
// container holding a warning sign rendered as dots — a dotted triangle
// outline with a dotted exclamation inside. Sits inline between the two words.
function AntiSlowMark({ color }: { color: string }) {
  // Build an equilateral-ish warning triangle (apex at top) from three
  // corners, then place dots at EVEN intervals along each edge so the outline
  // is symmetric and correctly aligned. Corner dots are shared between edges
  // (deduped) so they aren't doubled up.
  const apex: [number, number] = [12, 4];
  const left: [number, number] = [4.5, 19];
  const right: [number, number] = [19.5, 19];
  const perEdge = 4; // dots per edge including both endpoints

  const edge = (a: [number, number], b: [number, number]) =>
    Array.from({ length: perEdge }, (_, i) => {
      const t = i / (perEdge - 1);
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] as [number, number];
    });

  const raw = [...edge(apex, right), ...edge(right, left), ...edge(left, apex)];
  // Dedupe shared corner points.
  const outline = raw.filter(
    ([x, y], i) => raw.findIndex(([px, py]) => Math.abs(px - x) < 0.01 && Math.abs(py - y) < 0.01) === i
  );

  // Exclamation, centred on x=12, within the triangle's vertical span. Stem of
  // two dots plus a gapped point below.
  const bang: [number, number][] = [
    [12, 11],
    [12, 14],
    [12, 16.8],
  ];
  const R = 1.05;

  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "1.5em",
        height: "1.5em",
        borderRadius: "0.28em",
        background: "transparent",
        border: "0.09em solid currentColor",
        verticalAlign: "-0.34em",
        margin: "0 0.34em",
        boxSizing: "border-box",
      }}
    >
      {/* The danger icon dots take the active thumbnail's accent color; the
          pill outline stays currentColor. Each dot runs a gentle scale/opacity
          pulse, staggered by its position so a fluid wave travels through the
          sign — the outline ripples clockwise from the apex, then the
          exclamation follows. */}
      <svg viewBox="0 0 24 24" width="76%" height="76%" style={{ display: "block", color, transition: "color 700ms ease" }}>
        {outline.map(([cx, cy], i) => (
          <circle
            key={`o${i}`}
            cx={cx}
            cy={cy}
            r={R}
            fill="currentColor"
            className="antislow-dot"
            style={{ animationDelay: `${i * 130}ms`, transformOrigin: "center" }}
          />
        ))}
        {bang.map(([cx, cy], i) => (
          <circle
            key={`b${i}`}
            cx={cx}
            cy={cy}
            r={R}
            fill="currentColor"
            className="antislow-dot"
            style={{ animationDelay: `${(outline.length + i) * 130}ms`, transformOrigin: "center" }}
          />
        ))}
      </svg>
    </span>
  );
}

// A continuous, fluid light sweep across neutral text — no color cycling,
// just a soft diagonal band of brightness drifting left to right on a loop.
// Runs purely on CSS (background-position animation on a background-clip:
// text gradient), so it's smooth and consistent regardless of anything else
// happening on the page, unlike the old per-character ripple this replaced.
function ShimmerWord({ children, italic, variant }: { children: string; italic?: boolean; variant?: "warm" | "cta" }) {
  // "Inertia" gets the "r" pulled into the "t" so they read as touching —
  // a one-off tight-kern, not a general per-word behavior, so it's keyed
  // off the exact string rather than a prop.
  const isInertia = children === "Inertia";
  const content = isInertia ? (
    <>
      Ine
      <span style={{ marginRight: "-0.05em" }}>r</span>
      tia
    </>
  ) : (
    children
  );
  const wordStyle: React.CSSProperties = {
    fontWeight: 450,
    fontStyle: italic ? "italic" : undefined,
    letterSpacing: "-0.03em",
    fontSize: isInertia ? "1.16em" : undefined,
  };
  const className = variant ? `shimmer-word shimmer-word--${variant}` : "shimmer-word";

  if (!isInertia) {
    return (
      <span aria-label={children} className={className} style={wordStyle}>
        {content}
      </span>
    );
  }

  // Bloom is a blurred duplicate of the same gradient-clipped text sitting
  // behind the crisp copy, sharing the identical class/animation so the glow
  // color drifts in lockstep with the shimmer instead of a fixed drop-shadow
  // color that can't track the animated gradient.
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        aria-hidden="true"
        className={className}
        style={{ ...wordStyle, position: "absolute", inset: 0, filter: "blur(5px) saturate(1.6)", opacity: 0.5 }}
      >
        {content}
      </span>
      <span aria-label={children} className={className} style={{ ...wordStyle, position: "relative" }}>
        {content}
      </span>
    </span>
  );
}

const INQUIRY_CTA_OUTER_SHADOW =
  "0 2px 4px rgba(0,0,0,0.18)," +
  "0 10px 28px rgba(0,0,0,0.14)," +
  "0 24px 56px -10px rgba(0,0,0,0.12)";


const HERO_LIQUID_MS = 680;
const HERO_LIQUID_EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
const HERO_WORD_STEP = 90;
const HERO_START = 90;
// Pill grows its own width (a rounded droplet, not a rectangular clip of a
// full-size chip — that clip read as a white bar sliding over the pill).
// The cloud condenses after the vessel has mostly formed.
const HERO_PILL_SLOT_MS = 860;
const HERO_PILL_FADE_MS = 540;
const HERO_PILL_SCALE_MS = 800;
const HERO_PILL_BLUR_MS = 960;
const HERO_PILL_GLYPH_LAG = 280;

function heroLiquidStyle(
  visible: boolean,
  delay: number,
  opts?: { blur?: number; scaleFrom?: number },
) {
  const blur = opts?.blur ?? 10;
  const scaleFrom = opts?.scaleFrom ?? 0.992;
  return {
    display: "inline-block" as const,
    willChange: "opacity, transform, filter",
    opacity: visible ? 1 : 0,
    transform: visible ? "scale(1)" : `scale(${scaleFrom})`,
    filter: visible ? "blur(0px)" : `blur(${blur}px)`,
    transition: [
      `opacity ${HERO_LIQUID_MS}ms ${HERO_LIQUID_EASE} ${delay}ms`,
      `transform ${HERO_LIQUID_MS}ms ${HERO_LIQUID_EASE} ${delay}ms`,
      `filter ${HERO_LIQUID_MS}ms ${HERO_LIQUID_EASE} ${delay}ms`,
    ].join(", "),
  };
}

// Figma-style selection chrome around a word: a 1px accent frame that draws
// itself in clockwise from the top-left, then pops the four square resize
// handles. Rendered as an inset overlay so it never affects the heading's
// layout or the per-word reveal transform.
// Figma's own selection blue, so the affordance reads as the tool it's
// quoting rather than as a brand accent. (The earlier neutral grey was chosen
// to stay clear of the antislow mark above; the mark is currently hidden, and
// the blue is distinct enough from the work accents not to read as one.)
const SELECTION_FRAME_COLOR = "#6bb8ef";
const SELECTION_EDGE_MS = 170;
const SELECTION_HANDLE_MS = 160;

// After the handles pop, the frame performs a resize gesture: it's dragged
// out past the word, pulled back in under it, then released to its true
// bounds. Reads as someone sizing the selection rather than a decorative
// pulse. Only the overlay scales, never the word, so the heading never
// reflows. Timings are the beats of that gesture, in order.
const SELECTION_RESIZE_HOLD_MS = 520;   // beat before the drag starts
const SELECTION_RESIZE_OUT_MS = 900;    // drag outward
const SELECTION_RESIZE_IN_MS = 800;     // pull back in past the resting size
const SELECTION_RESIZE_BACK_MS = 900;   // settle to the real bounds
const SELECTION_RESIZE_SETTLE_MS = 500; // pause at each extreme before moving on
const SELECTION_RESIZE_GROW = 1.14;     // how far past the word it's dragged
const SELECTION_RESIZE_SHRINK = 0.9;    // how far under it's pulled
const SELECTION_SOLID_AFTER_RESIZE_MS = 240;
const SELECTION_SOLID_EDGE_MS = 320;
const SELECTION_SOLID_EDGES = ["top", "left"] as const;

// Drives the resize gesture. Lifted out of SelectionBox so the word and the
// frame around it read from one source of truth and scale in lockstep — the
// selection is sizing the word, so the two must never drift apart.
function useSelectionResize(visible: boolean, delay: number) {
  // motion/react returns null until it has read the media query; treat that
  // as "not reduced" so the gesture behaves normally on first paint.
  const reduced = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<"idle" | "out" | "in" | "rest">("idle");

  // 4 edges draw in sequence, then the handles pop.
  const handlesDone = delay + 4 * SELECTION_EDGE_MS + SELECTION_HANDLE_MS;

  useEffect(() => {
    if (!visible || reduced) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const startAt = handlesDone + SELECTION_RESIZE_HOLD_MS;
    const inAt = startAt + SELECTION_RESIZE_OUT_MS + SELECTION_RESIZE_SETTLE_MS;
    const restAt = inAt + SELECTION_RESIZE_IN_MS + SELECTION_RESIZE_SETTLE_MS;
    timers.push(setTimeout(() => setPhase("out"), startAt));
    timers.push(setTimeout(() => setPhase("in"), inAt));
    timers.push(setTimeout(() => setPhase("rest"), restAt));
    return () => timers.forEach(clearTimeout);
  }, [visible, reduced, handlesDone]);

  const scale =
    reduced || phase === "idle" || phase === "rest"
      ? 1
      : phase === "out"
        ? SELECTION_RESIZE_GROW
        : SELECTION_RESIZE_SHRINK;
  const resizeMs =
    phase === "out"
      ? SELECTION_RESIZE_OUT_MS
      : phase === "in"
        ? SELECTION_RESIZE_IN_MS
        : SELECTION_RESIZE_BACK_MS;

  return { phase, scale, resizeMs, reduced };
}

function SelectionBox({
  color,
  visible,
  delay,
  phase,
  scale,
  resizeMs,
  reduced,
}: {
  color: string;
  visible: boolean;
  delay: number;
  phase: "idle" | "out" | "in" | "rest";
  scale: number;
  resizeMs: number;
  reduced: boolean;
}) {
  const HANDLE = 5;

  // The word and this frame are both scaled by a shared parent, so the frame
  // itself no longer scales. It only needs to undo that parent scale on its
  // 1px edges and square handles, so the stroke weight and handle size stay
  // true at every step of the resize.
  const sx = scale;
  const sy = scale;

  // Each edge scales from the corner the previous edge finished at, so the
  // line reads as one continuous stroke travelling around the box.
  const edges = [
    { side: "top", origin: "left center", axis: "scaleX" },
    { side: "right", origin: "center top", axis: "scaleY" },
    { side: "bottom", origin: "right center", axis: "scaleX" },
    { side: "left", origin: "center bottom", axis: "scaleY" },
  ] as const;

  const dashGradient = (side: string) => {
    const horizontal = side === "top" || side === "bottom";
    return horizontal
      ? `repeating-linear-gradient(to right, ${color} 0, ${color} 3px, transparent 3px, transparent 7px)`
      : `repeating-linear-gradient(to bottom, ${color} 0, ${color} 3px, transparent 3px, transparent 7px)`;
  };

  const edgeBase = (side: string): React.CSSProperties => {
    const t = { position: "absolute" as const, backgroundImage: dashGradient(side) };
    if (side === "top") return { ...t, top: 0, left: 0, right: 0, height: 1 };
    if (side === "bottom") return { ...t, bottom: 0, left: 0, right: 0, height: 1 };
    if (side === "left") return { ...t, left: 0, top: 0, bottom: 0, width: 1 };
    return { ...t, right: 0, top: 0, bottom: 0, width: 1 };
  };

  const corners = [
    { top: -HANDLE / 2, left: -HANDLE / 2 },
    { top: -HANDLE / 2, right: -HANDLE / 2 },
    { bottom: -HANDLE / 2, right: -HANDLE / 2 },
    { bottom: -HANDLE / 2, left: -HANDLE / 2 },
  ];

  const handlesDelay = delay + edges.length * SELECTION_EDGE_MS;
  const [solidEdges, setSolidEdges] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    if (!visible || reduced) {
      setSolidEdges(new Set());
      return;
    }
    if (phase !== "rest") return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const solidStart = SELECTION_RESIZE_BACK_MS + SELECTION_SOLID_AFTER_RESIZE_MS;
    SELECTION_SOLID_EDGES.forEach((side, i) => {
      timers.push(
        setTimeout(() => {
          setSolidEdges((prev) => new Set(prev).add(side));
        }, solidStart + i * SELECTION_SOLID_EDGE_MS),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [visible, reduced, phase]);

  const edgeTransform = (edge: (typeof edges)[number], draw: number) => {
    const counter = edge.axis === "scaleX" ? 1 / sy : 1 / sx;
    return edge.axis === "scaleX"
      ? `scaleX(${draw}) scaleY(${counter})`
      : `scaleY(${draw}) scaleX(${counter})`;
  };

  const edgeTransition = (i: number, ms: number) =>
    reduced
      ? "none"
      : phase === "idle"
        ? `transform ${ms}ms linear ${delay + i * SELECTION_EDGE_MS}ms`
        : `transform ${resizeMs}ms ${HERO_LIQUID_EASE}`;

  const solidEdgeTransition = () =>
    reduced
      ? "none"
      : `transform ${SELECTION_SOLID_EDGE_MS}ms ${HERO_LIQUID_EASE}, opacity ${SELECTION_SOLID_EDGE_MS}ms ${HERO_LIQUID_EASE}`;

  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "-0.08em",
        right: "-0.1em",
        bottom: "-0.2em",
        left: "-0.1em",
        pointerEvents: "none",
      }}
    >
      {edges.map((edge, i) => {
        const dashedDraw = visible || reduced ? 1 : 0;
        const solidDraw = solidEdges.has(edge.side) || reduced ? 1 : 0;
        const solidEligible = (SELECTION_SOLID_EDGES as readonly string[]).includes(edge.side);

        return (
          <span key={edge.side} aria-hidden="true">
            <span
              style={{
                ...edgeBase(edge.side),
                transformOrigin: edge.origin,
                transform: edgeTransform(edge, dashedDraw),
                opacity: solidEligible && solidDraw ? 0.35 : 1,
                transition: [
                  edgeTransition(i, SELECTION_EDGE_MS),
                  solidEligible ? `opacity ${SELECTION_SOLID_EDGE_MS}ms ${HERO_LIQUID_EASE}` : "none",
                ].join(", "),
              }}
            />
            {solidEligible && (
              <span
                style={{
                  ...edgeBase(edge.side),
                  background: color,
                  transformOrigin: edge.origin,
                  transform: edgeTransform(edge, solidDraw),
                  opacity: solidDraw,
                  transition: solidEdgeTransition(),
                }}
              />
            )}
          </span>
        );
      })}
      {corners.map((pos, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            width: HANDLE,
            height: HANDLE,
            background: "#fff",
            border: `1px solid ${color}`,
            ...pos,
            opacity: visible || reduced ? 1 : 0,
            // Counter-scale keeps the square 5px and un-stretched while the
            // box around it is being resized.
            transform: `${visible || reduced ? "scale(1)" : "scale(0.4)"} scale(${1 / sx}, ${1 / sy})`,
            transition: reduced
              ? "none"
              : phase === "idle"
                ? [
                    `opacity ${SELECTION_HANDLE_MS}ms ${HERO_LIQUID_EASE} ${handlesDelay}ms`,
                    `transform ${SELECTION_HANDLE_MS}ms ${HERO_LIQUID_EASE} ${handlesDelay}ms`,
                  ].join(", ")
                : `transform ${resizeMs}ms ${HERO_LIQUID_EASE}`,
          }}
        />
      ))}
    </span>
  );
}

// How far the frame sits outside the word box (SelectionBox's insets), in em.
// The neighbours are pushed by how far the frame edges travel, not the glyphs.
const SELECTION_INSET_X_EM = 0.1;
const SELECTION_INSET_BOTTOM_EM = 0.2;

// How far the line under "design" moves while the frame resizes, so the
// frame's bottom edge never runs into it. The heading is leading-none, so the
// word box is 1em tall and its bottom edge sits half of that below centre.
function selectionPushBelowEm(scale: number) {
  return (scale - 1) * (0.5 + SELECTION_INSET_BOTTOM_EM);
}

// "design" plus its selection frame, scaled as one unit so the word is
// visibly being sized by the selection rather than sitting inert inside it.
//
// Layout note: the scaled copy is absolutely positioned over an invisible
// spacer that holds the word's resting footprint. The spacer's side margins
// then grow and shrink with the frame, so the words either side are pushed
// away as it's dragged out and follow it back in, instead of the frame
// sliding over them. The resize state lives in the hero, which also moves the
// line below by selectionPushBelowEm.
function DesignSelectionWord({
  visible,
  delay,
  word,
  selection,
}: {
  visible: boolean;
  delay: number;
  word: string;
  selection: ReturnType<typeof useSelectionResize>;
}) {
  const { phase, scale, resizeMs, reduced } = selection;
  const spacerRef = useRef<HTMLSpanElement>(null);
  // Half the resting word width, in em, so the push is right at any size.
  const [halfWidthEm, setHalfWidthEm] = useState(0);

  useLayoutEffect(() => {
    const el = spacerRef.current;
    if (!el) return;
    const measure = () => {
      const fontSize = parseFloat(getComputedStyle(el).fontSize) || 16;
      setHalfWidthEm(el.offsetWidth / fontSize / 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pushSideEm = (scale - 1) * (halfWidthEm + SELECTION_INSET_X_EM);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        marginInline: `${pushSideEm}em`,
        transition: reduced ? "none" : `margin ${resizeMs}ms ${HERO_LIQUID_EASE}`,
      }}
    >
      {/* Spacer: holds the line's true width at rest. */}
      <span ref={spacerRef} style={{ visibility: "hidden" }} aria-hidden="true">
        {word}
      </span>

      {/* The part that actually moves. Centre origin so it grows and shrinks
          around the word rather than dragging off one edge. */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "inline-block",
          // The absolute box is exactly the resting word width, so without
          // this the glyphs can wrap inside it at narrow widths.
          whiteSpace: "nowrap",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          transition: reduced ? "none" : `transform ${resizeMs}ms ${HERO_LIQUID_EASE}`,
          willChange: "transform",
        }}
      >
        {word}
        <SelectionBox
          color={SELECTION_FRAME_COLOR}
          visible={visible}
          delay={delay}
          phase={phase}
          scale={scale}
          resizeMs={resizeMs}
          reduced={reduced}
        />
      </span>
    </span>
  );
}

// Static Figma-style frame — same stroke and corner handles as the hero's
// "design" selection, without the draw-in or resize animation.
function FigmaSelectionFrame({
  children,
  className,
  frameRef,
  style,
  strokeColor = SELECTION_FRAME_COLOR,
  handleFill = "#fff",
}: {
  children: React.ReactNode;
  className?: string;
  frameRef?: React.RefObject<HTMLDivElement | null>;
  style?: React.CSSProperties;
  strokeColor?: string;
  handleFill?: string;
}) {
  const color = strokeColor;
  const HANDLE = 5;
  const corners = [
    { top: -HANDLE / 2, left: -HANDLE / 2 },
    { top: -HANDLE / 2, right: -HANDLE / 2 },
    { bottom: -HANDLE / 2, right: -HANDLE / 2 },
    { bottom: -HANDLE / 2, left: -HANDLE / 2 },
  ] as const;

  return (
    <div
      ref={frameRef}
      className={cn("relative w-full", className)}
      style={{ border: `1px solid ${color}`, ...style }}
    >
      {children}
      {corners.map((pos, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            position: "absolute",
            width: HANDLE,
            height: HANDLE,
            background: handleFill,
            border: `1px solid ${color}`,
            pointerEvents: "none",
            ...pos,
          }}
        />
      ))}
    </div>
  );
}

function FigmaHorizontalRule({
  strokeColor = SELECTION_FRAME_COLOR,
  handleFill = "rgb(var(--bg))",
}: {
  strokeColor?: string;
  handleFill?: string;
}) {
  const color = strokeColor;
  const HANDLE = 5;
  const handleStyle: React.CSSProperties = {
    position: "absolute",
    top: -HANDLE / 2,
    width: HANDLE,
    height: HANDLE,
    background: handleFill,
    border: `1px solid ${color}`,
    pointerEvents: "none",
    zIndex: 2,
  };

  return (
    <div
      className="relative z-20 w-full shrink-0"
      aria-hidden="true"
      style={{ borderTop: `1px solid ${color}` }}
    >
      <span style={{ ...handleStyle, left: -HANDLE / 2 }} />
      <span style={{ ...handleStyle, right: -HANDLE / 2 }} />
    </div>
  );
}

function sampleImageAmbientTone(data: Uint8ClampedArray) {
  let r = 0;
  let g = 0;
  let b = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  // Pull dark screenshot averages toward a light wash while keeping hue.
  let rr = r / n;
  let gg = g / n;
  let bb = b / n;
  const lift = 0.55;
  rr += (255 - rr) * lift;
  gg += (255 - gg) * lift;
  bb += (255 - bb) * lift;

  const gray = (rr + gg + bb) / 3;
  const satBoost = 1.45;
  rr = gray + (rr - gray) * satBoost;
  gg = gray + (gg - gray) * satBoost;
  bb = gray + (bb - gray) * satBoost;

  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `rgb(${clamp(rr)}, ${clamp(gg)}, ${clamp(bb)})`;
}

function clientAmbientSolid(color: string) {
  return {
    field: `radial-gradient(ellipse 110% 95% at 50% 36%, ${color} 0%, transparent 74%)`,
    fade: "linear-gradient(to bottom, transparent 0%, transparent 50%, rgb(var(--bg) / 0.42) 78%, rgb(var(--bg)) 100%)",
  };
}

const CLIENT_DIALOG_STROKE = "rgb(var(--line))";

const CLIENT_DIALOG_AMBIENT: Record<string, { field: string; fade: string }> = {
  "mood-swings": clientAmbientSolid("rgb(106 34 53 / 0.44)"),
  "trippie-redd": clientAmbientSolid("rgb(20 31 82 / 0.46)"),
  inboundly: clientAmbientSolid("rgb(74 45 122 / 0.44)"),
  "allure-new-york": clientAmbientSolid("rgb(155 45 63 / 0.42)"),
};

function resolveClientDialogAmbient(slug: string, sampled: string) {
  const custom = CLIENT_DIALOG_AMBIENT[slug];
  if (custom) return custom;
  return {
    field: `radial-gradient(ellipse 95% 75% at 50% 18%, ${sampled} 0%, transparent 68%), radial-gradient(ellipse 90% 70% at 72% 72%, ${sampled} 0%, transparent 70%)`,
    fade: `linear-gradient(to bottom, transparent 0%, transparent 40%, rgb(var(--bg) / 0.6) 74%, rgb(var(--bg)) 100%)`,
  };
}

function useImageAmbientTone(src: string | undefined) {
  const [tone, setTone] = useState("rgb(var(--bg))");

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const img = document.createElement("img");
    img.decoding = "async";
    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement("canvas");
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        setTone(sampleImageAmbientTone(data));
      } catch {
        // Same-origin only; fall back to page background.
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return tone;
}

function ClientDialogDragHandle({
  dragging,
  dragY,
}: {
  dragging: boolean;
  dragY: number;
}) {
  const progress = Math.min(Math.max(dragY, 0) / 110, 1);
  const active = dragging || progress > 0;

  return (
    <div className="sm:hidden flex justify-center pt-4 pb-2.5 cursor-grab active:cursor-grabbing touch-none">
      <div
        className="rounded-full"
        style={{
          width: 36 + progress * 32,
          height: active ? 5 : 4,
          background:
            progress > 0.45
              ? `rgb(var(--fg) / ${0.28 + progress * 0.42})`
              : active
                ? "rgb(var(--muted))"
                : "rgb(var(--line))",
          opacity: 0.55 + progress * 0.45,
          transition: dragging
            ? "none"
            : "width 280ms cubic-bezier(0.22,1,0.36,1), height 180ms ease, background-color 180ms ease, opacity 180ms ease",
        }}
      />
    </div>
  );
}

function ClientDialogMediaBlock({
  slug,
  src,
  dragging,
  dragY,
}: {
  slug: string;
  src: string;
  dragging: boolean;
  dragY: number;
}) {
  const sampled = useImageAmbientTone(src);
  const ambient = resolveClientDialogAmbient(slug, sampled);
  const customAmbient = Boolean(CLIENT_DIALOG_AMBIENT[slug]);

  return (
    <>
      <div className="relative overflow-hidden sm:overflow-visible">
        <div className="sm:hidden absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <img
            src={src}
            alt=""
            className="absolute left-1/2 top-1/2 h-[165%] w-[165%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover blur-[40px] saturate-135"
            style={{ opacity: customAmbient ? 0.68 : 0.74 }}
            draggable={false}
          />
          <div
            className="absolute inset-0"
            style={{ background: ambient.field }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 120% 90% at 50% 40%, rgb(var(--bg) / 0.02) 0%, rgb(var(--bg) / 0.18) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: ambient.fade }}
          />
        </div>

        <ClientDialogDragHandle dragging={dragging} dragY={dragY} />

        <div className="relative px-3 pb-3 sm:px-0 sm:pb-4">
          <div
            className="relative w-full overflow-hidden rounded-2xl sm:rounded-none aspect-[16/10]"
            style={{ background: "#0a0a0a" }}
          >
            <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          </div>
        </div>
      </div>
    </>
  );
}

function VercelHero({
  accentColor,
  ctaRef,
}: {
  accentColor: string;
  ctaRef?: React.RefObject<HTMLAnchorElement | null>;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        // Forcing setVisible onto its own rAF guarantees the hidden state
        // actually paints first.
        requestAnimationFrame(() => setVisible(true));
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const liquid = (delay: number, opts?: { blur?: number; scaleFrom?: number }) =>
    heroLiquidStyle(visible, delay, opts);

  // Heading words stagger with a soft blur+scale dissolve so each token
  // flows into focus rather than rising, building to "the development" as
  // the payoff line, then the CTA follows.
  const HEADING_LINE_ONE = ["We", "do", "the", "design"];
  const HEADING_LINE_TWO = ["and", "the", "development."];
  const HEADING_WORDS = [...HEADING_LINE_ONE, ...HEADING_LINE_TWO];
  // Heading itself no longer animates in — it's present immediately so the
  // page doesn't feel like it's waiting on text. The word-reveal stagger
  // stays available for other callers of heroLiquidStyle below.
  const wordReveal = (_i: number) => undefined;
  const headingEnd = HERO_START + HEADING_WORDS.length * HERO_WORD_STEP;
  const ctaFadeDelay = headingEnd + 644;
  // Cloud pill waits until the CTA has actually finished landing —
  // ctaFadeDelay is only when that transition *starts*.
  const cloudDelay = ctaFadeDelay + HERO_LIQUID_MS;
  // Selection chrome no longer waits on the heading/CTA/pill chain since the
  // heading is visible immediately — it only needs a short beat after mount
  // so the frame reads as drawing itself rather than appearing pre-formed.
  const selectionDelay = 260;
  const selection = useSelectionResize(visible, selectionDelay);

  useEffect(() => {
    if (!visible) return;
    router.prefetch("/aether");
  }, [visible, router]);

  return (
    <section
      ref={ref}
      className="relative"
      style={{ color: "#1a1a1a" }}
    >
      <div
        className="relative flex items-center"
      >
        {/* Vertically centered in the space BELOW the header.
            .site-header is `position: static` — it sits in normal flow and is
            72px tall — so a plain 100dvh box here starts 72px down and its
            centre lands ~36px below the viewport's true centre. That offset
            is what read as "not nicely centered"; the flex centering itself
            was always working. Subtracting the header height makes the box
            occupy exactly the visible area under it.

            Desktop padding is deliberately ASYMMETRIC (pt-0 / pb-18dvh): in a
            justify-center box, extra bottom padding lifts the visible content
            above the geometric centre. Dead centre read as too low here, which
            is the usual optical-centring result — a headline sits better a bit
            above the true middle. Raise sm:pb-[18dvh] to lift it further.

            max-sm:pb-[40dvh] scopes the large mobile bottom pad to
            mobile only — as a bare pb-[40dvh] it applied at every width and
            pulled desktop content off centre, and a later sm:pb-10 does not
            reliably beat it (Tailwind orders utilities itself, so arbitrary
            value vs. responsive variant is not settled by source order). */}
        <div className="relative max-w-[80rem] mx-auto w-full px-3 sm:px-8 max-sm:pt-16 sm:pt-0 max-sm:pb-[40dvh] sm:pb-[18dvh] flex flex-col items-center text-center gap-10 min-h-[100dvh] justify-center sm:min-h-[calc(100dvh-72px)] sm:justify-center">
          {false && (
          <span
            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[14px] tracking-tight"
            style={{
              ...liquid(0),
              background: "rgba(26,26,26,0.06)",
              color: "rgba(26,26,26,0.7)",
            }}
          >
            900+ clients served since 2022
          </span>
          )}

          {/* Hidden for now — flip to `true` to bring the eyebrow back. The
              negative bottom margin only exists to pull the heading up under
              it, so it comes along with the toggle. */}
          {false && (
          <p
            className="inline-flex items-center text-[19px] sm:text-[22px] tracking-tight -mb-4 sm:-mb-6"
            style={{ ...liquid(60), color: "#1a1a1a" }}
          >
            anti<AntiSlowMark color={accentColor} />slow
          </p>
          )}

          <h1
            className="tracking-tight max-sm:tracking-[-0.05em] leading-none max-w-2xl text-[clamp(2.5rem,7.8vw,3.55rem)] sm:tracking-tight sm:text-[clamp(2.6rem,6vw,4.2rem)] flex flex-col items-center"
            style={{ color: "#1a1a1a", fontWeight: 450 }}
          >
            <span className="flex flex-wrap justify-center items-baseline" style={{ columnGap: "0.3em" }}>
              {HEADING_LINE_ONE.map((word, i) => (
                <span key={word + i} style={wordReveal(i)}>
                  {word === "design" ? (
                    <DesignSelectionWord visible={visible} delay={selectionDelay} word={word} selection={selection} />
                  ) : (
                    word
                  )}
                </span>
              ))}
            </span>
            {/* Moves with the bottom edge of the "design" frame above it, as a
                transform so the rest of the hero doesn't shift with it. */}
            <span
              className="mt-1.5 sm:mt-2 flex flex-wrap justify-center"
              style={{
                columnGap: "0.3em",
                transform: `translateY(${selectionPushBelowEm(selection.scale)}em)`,
                transition: selection.reduced ? "none" : `transform ${selection.resizeMs}ms ${HERO_LIQUID_EASE}`,
              }}
            >
              {HEADING_LINE_TWO.map((word, i) => (
                <span key={word + i} style={wordReveal(HEADING_LINE_ONE.length + i)}>{word}</span>
              ))}
            </span>
          </h1>

          <p
            className="max-w-md sm:max-w-xl -mt-4 sm:-mt-5 text-[16.5px] sm:text-[19px] leading-relaxed tracking-tight"
            style={{ ...liquid(120), color: "#5c5c5c" }}
          >
            For brand owners and startups.
          </p>

          {false && (
          <div className="hidden sm:flex flex-col gap-5 max-w-md absolute inset-y-0 right-0 justify-center">
            <p
              className="text-[16.5px] sm:text-[21px] leading-relaxed tracking-tight text-right"
              style={{ ...liquid(300), color: "#5c5c5c" }}
            >
              We do design and development ourselves, so you're not stuck explaining your vision twice.
            </p>
          </div>
          )}

          {false && (
          <div className="flex flex-col gap-5 max-w-lg sm:hidden">
            <p
              className="text-[16.5px] leading-relaxed tracking-tight"
              style={{ ...liquid(300), color: "#5c5c5c" }}
            >
              We do design and development ourselves, so you're not stuck explaining your vision twice.
            </p>
          </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Points at the quiz at the foot of the page rather than straight
                to Cal: answering a few questions is a lower commitment than
                putting a meeting on the calendar, and the quiz hands off to
                booking itself once it knows what the project is. Stays a real
                href so it still works without JS and offers a normal link
                context menu; the handler only takes over to match the site's
                Lenis smooth scrolling. */}
            <span
              className="relative inline-flex rounded-[6px]"
              style={{
                boxShadow: CTA_OUTER_SHADOW,
                transformOrigin: "center",
              }}
            >
              <a
                ref={ctaRef}
                href="#start"
                aria-label="Reach out"
                onClick={e => {
                  const el = document.getElementById("start");
                  if (!el) return; // let the browser handle the hash
                  e.preventDefault();
                  const targetY = window.scrollY + el.getBoundingClientRect().top - 40;
                  const lenis = window.__lenis;
                  if (lenis) lenis.scrollTo(targetY, { duration: 1.1 });
                  else window.scrollTo({ top: targetY, behavior: "smooth" });
                }}
                className={CTA_PILL_CLASS}
                style={{
                  background: CTA_FILL,
                  color: "#fff",
                  boxShadow: CTA_INSET_SHADOW,
                  fontWeight: 450,
                }}
                {...ctaScaleHoverOnParent}
              >
                <CtaGrain />
                <span className="relative whitespace-nowrap">Reach out</span>
              </a>
            </span>
            <span
              className="relative inline-flex rounded-[6px]"
              style={{
                boxShadow: CTA_OUTER_SHADOW,
                transformOrigin: "center",
              }}
            >
              <Link
                href="/aether"
                aria-label="View Aether"
                className={CTA_PILL_CLASS}
                style={{
                  background: "#f0f0f0",
                  color: "#1a1a1a",
                  boxShadow: CTA_INSET_SHADOW,
                  fontWeight: 450,
                }}
                {...ctaScaleHoverOnParent}
              >
                <span className="relative whitespace-nowrap">View Aether</span>
              </Link>
            </span>
            {false && (
            <a
              href="https://t.me/kayzxyz"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full px-4 py-2 text-[15px] font-medium tracking-tight"
              style={{ ...liquid(720), background: "#f0f0f0", color: "#1a1a1a" }}
              onMouseEnter={e => { e.currentTarget.style.transition = "opacity 150ms ease, transform 150ms ease"; e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
              onMouseDown={e => { e.currentTarget.style.transform = "translateY(0px)"; }}
            >
              Send a message
            </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// A short, opinionated questionnaire that replaces the old Cal.com embed at
// the foot of the homepage. It's not a real qualifier — it's a tone check.
// The questions surface how someone thinks about design so the visitor either
// nods along (and reaches for the CTA) or realizes we're not their studio. The
// stepped flow itself is the shadcn `ask-user-questions` component; no data is
// stored — onComplete just reflects the first answer back and offers the CTA
// that opens the existing contact modal.
// NB: `skippable` defaults to true in the component (`skippable !== false`), so
// each question opts out explicitly — it's a three-question tone check, and a
// skipped first answer would leave the result with nothing to reflect back.
const QUIZ_QUESTIONS: AskUserQuestion[] = [
  {
    id: "ownership",
    title: "The site went live and it doesn't feel like your brand. Whose problem is it?",
    skippable: false,
    chipPosition: "left",
    options: [
      { id: "designer", title: "The designer's. That was the whole job." },
      { id: "team", title: "Everyone's. Identity slips one decision at a time." },
      { id: "ship", title: "Nobody's. It works, that's what counts." },
    ],
  },
  {
    id: "detail",
    title: "A detail is off by two pixels. Nobody will consciously notice. You...",
    skippable: false,
    chipPosition: "left",
    options: [
      { id: "fix", title: "Fix it. Effortless is built out of invisible calls like this." },
      { id: "leave", title: "Leave it. Perfection is procrastination." },
      { id: "depends", title: "Depends what else is on fire." },
    ],
  },
  {
    id: "taste",
    title: "What separates a good site from a great one?",
    skippable: false,
    chipPosition: "left",
    options: [
      { id: "convert", title: "The numbers. Great means it converts." },
      { id: "feel", title: "It feels inevitable, like it couldn't be any other way." },
      { id: "different", title: "It refuses to look like everyone else." },
    ],
  },
];

// Result copy keyed off the first answer — enough to feel like it read you,
// without pretending to be a real assessment.
const QUIZ_RESULTS: Record<string, { title: string; body: string }> = {
  designer: {
    title: "So you'd expect the designer to own it.",
    body: "So would we. Carrying your identity through is the whole job, and when the work ships under our name, it's ours to answer for.",
  },
  team: {
    title: "So you see identity as a shared standard.",
    body: "We agree, though someone still has to hold the line. That's usually what we're brought in for.",
  },
  ship: {
    title: "So you'd rather move than fuss.",
    body: "Speed matters and we move fast too. But a site that works and doesn't feel like you is half done. We ship both.",
  },
};

const QUIZ_RESULT_FALLBACK = {
  title: "Sounds like we'd get along.",
  body: "The way you think about the work lines up with how we approach it.",
};

// Stage two: once the tone-check questions are answered, the same component
// collects the details we actually need. Free-text where the answer is theirs
// to write, single-select where we're qualifying.
const INTAKE_QUESTIONS: AskUserQuestion[] = [
  {
    id: "name",
    title: "First, what's your name?",
    skippable: false,
    freeText: true,
    freeTextMultiline: false,
    freeTextPlaceholder: "Your name",
    freeTextValidate: (v) => (v.trim().length < 2 ? "Please enter your name." : null),
  },
  {
    id: "email",
    title: "Where can we reach you?",
    skippable: false,
    freeText: true,
    freeTextMultiline: false,
    freeTextPlaceholder: "you@company.com",
    freeTextValidate: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : "Please enter a valid email.",
  },
  {
    id: "referral_source",
    title: "How did you find us?",
    skippable: false,
    // allowOther appends a free-text row beneath the options, so "somewhere
    // else" is typed rather than picked.
    allowOther: true,
    otherPlaceholder: "Somewhere else...",
    chipPosition: "left",
    options: [
      { id: "twitter", title: "X (Twitter)" },
      { id: "recommendation", title: "Someone recommended us" },
      { id: "search", title: "Google or search" },
      { id: "instagram", title: "Instagram" },
    ],
  },
  {
    id: "role",
    title: "What's your role?",
    skippable: false,
    chipPosition: "left",
    options: [
      { id: "founder", title: "Founder or co-founder" },
      { id: "exec", title: "Exec or department lead" },
      { id: "product", title: "Product or engineering" },
      { id: "other", title: "Something else" },
    ],
  },
  {
    id: "company_stage",
    title: "Where's the company right now?",
    skippable: false,
    chipPosition: "left",
    options: [
      { id: "idea", title: "Pre-seed or idea stage" },
      { id: "bootstrapped", title: "Bootstrapped" },
      { id: "funded", title: "Funded" },
      { id: "established", title: "Established" },
    ],
  },
  {
    id: "website",
    title: "Do you have a site today?",
    skippable: false,
    freeText: true,
    freeTextMultiline: false,
    freeTextPlaceholder: "yoursite.com, or 'none yet'",
  },
  {
    id: "goals",
    title: "What do you want to be true when we're done?",
    skippable: false,
    freeText: true,
    freeTextPlaceholder: "The outcome you're actually after, not just the deliverable.",
  },
  {
    id: "readiness",
    title: "Which sounds most like you?",
    skippable: false,
    chipPosition: "left",
    options: [
      { id: "allocated", title: "Budget's allocated and I'm ready to move" },
      { id: "unlockable", title: "I'm serious and can unlock a budget" },
      { id: "exploring", title: "Exploring what this would take" },
    ],
  },
];

// Turn the component's {questionId: {selectedIds, otherText}} answer map into
// readable "question -> answer" pairs for the transcript and the emailed
// payload, resolving option ids back to their labels.
function readableAnswers(
  questions: AskUserQuestion[],
  answers: Record<string, AskUserAnswer>
): { question: string; answer: string }[] {
  return questions
    .map((q) => {
      const a = answers[q.id ?? ""];
      if (!a) return null;
      const labels = a.selectedIds
        .map((id) => q.options?.find((o) => o.id === id)?.title)
        .filter(Boolean) as string[];
      const answer = a.otherText?.trim() || labels.join(", ");
      return answer ? { question: q.title, answer } : null;
    })
    .filter(Boolean) as { question: string; answer: string }[];
}

// Types `text` out character by character once `active` flips true. Steps on a
// timer rather than per-frame so the pace stays the same regardless of refresh
// rate, and honours prefers-reduced-motion by landing on the full string.
function useTypewriter(text: string, active: boolean, speed = 18) {
  const [shown, setShown] = useState("");
  const doneRef = useRef(false);

  useEffect(() => {
    if (!active || !text) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(text);
      doneRef.current = true;
      return;
    }
    setShown("");
    doneRef.current = false;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        doneRef.current = true;
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, active, speed]);

  return { shown, done: shown.length >= text.length && text.length > 0 };
}

// "typing" sits between the quiz and the intake questions: the transcript has
// collapsed, the response is typing itself out, and the input below is a inert
// chat box that becomes the real question component once the text lands.
type Stage = "quiz" | "typing" | "intake" | "done";

const QUIZ_FRAME_INNER_CLASS = "mx-auto max-w-none border-0 bg-transparent rounded-none";

function Questionnaire({ onStartConversation }: { onStartConversation: () => void }) {
  const [disclosed, setDisclosed] = useState(false);
  const [stage, setStage] = useState<Stage>("quiz");
  const [result, setResult] = useState<{ title: string; body: string } | null>(null);
  const [transcript, setTranscript] = useState<{ question: string; answer: string }[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const intakeRef = useRef<HTMLDivElement>(null);
  const inquiryBorderRef = useRef<HTMLDivElement>(null);

  const flowRevealRef = useLiquidReveal(disclosed, 60);
  const transcriptRevealRef = useLiquidReveal(disclosed && stage !== "quiz");
  const typingRevealRef = useLiquidReveal(stage === "typing");
  const intakeRevealRef = useLiquidReveal(stage === "intake");
  const doneRevealRef = useLiquidReveal(stage === "done");

  const scaleInquiryBorder = (transform: string, transition: string) => {
    const el = inquiryBorderRef.current;
    if (!el) return;
    el.style.transition = transition;
    el.style.transform = transform;
  };

  const inquiryCtaHover = {
    onMouseEnter(e: React.MouseEvent<HTMLButtonElement>) {
      ctaScaleHoverOnSelf.onMouseEnter(e);
      scaleInquiryBorder("scale(1.015)", CTA_SCALE_SPRING);
    },
    onMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
      ctaScaleHoverOnSelf.onMouseLeave(e);
      scaleInquiryBorder("scale(1)", CTA_SCALE_RESET);
    },
    onMouseDown(e: React.MouseEvent<HTMLButtonElement>) {
      ctaScaleHoverOnSelf.onMouseDown(e);
      scaleInquiryBorder("scale(0.992)", CTA_SCALE_PRESS);
    },
    onMouseUp(e: React.MouseEvent<HTMLButtonElement>) {
      ctaScaleHoverOnSelf.onMouseUp(e);
      scaleInquiryBorder("scale(1.015)", CTA_SCALE_SPRING);
    },
  };

  const onQuizComplete = (answers: Record<string, AskUserAnswer>) => {
    const first = answers["ownership"]?.selectedIds[0];
    setResult((first && QUIZ_RESULTS[first]) || QUIZ_RESULT_FALLBACK);
    const pairs = readableAnswers(QUIZ_QUESTIONS, answers);
    setTranscript(pairs);
    setQuizAnswers(
      Object.fromEntries(pairs.map((p) => [p.question, p.answer]))
    );
    setStage("typing");
  };

  // Full response text, typed out during the "typing" stage.
  const responseText = result
    ? `${result.title} ${result.body} A few quick questions so we can tell if we're a fit.`
    : "";
  const { shown: typedResponse, done: typingDone } = useTypewriter(
    responseText,
    stage === "typing"
  );

  // Hand off to the real questions once the response has finished typing.
  useEffect(() => {
    if (stage !== "typing" || !typingDone) return;
    const t = setTimeout(() => setStage("intake"), 450);
    return () => clearTimeout(t);
  }, [stage, typingDone]);

  // When the intake questions appear, bring them into view if they landed below
  // the fold (common on mobile, where the transcript + reply push them down).
  // Uses Lenis if present so it matches the site's smooth scrolling, and only
  // scrolls when the block's top actually sits past the viewport bottom.
  useEffect(() => {
    if (stage !== "intake") return;
    const el = intakeRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const belowFold = rect.top > window.innerHeight - 120;
      if (!belowFold) return;
      const targetY = window.scrollY + rect.top - 80;
      const lenis = window.__lenis;
      if (lenis) lenis.scrollTo(targetY, { duration: 0.9 });
      else window.scrollTo({ top: targetY, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(raf);
  }, [stage]);

  const onBegin = () => {
    flushSync(() => setDisclosed(true));

    // Two frames: first lets the quiz mount, second lets Lenis pick up the
    // taller page after resize() (see route-fade.tsx).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById("questionnaire-flow");
        if (!el) return;

        const isMobile = window.matchMedia("(max-width: 639px)").matches;
        const offset = isMobile ? 24 : 80;
        const rect = el.getBoundingClientRect();
        const needsScroll =
          isMobile ||
          rect.top > offset ||
          rect.bottom > window.innerHeight - 40;
        if (!needsScroll) return;

        const lenis = window.__lenis;
        if (lenis) {
          lenis.resize();
          lenis.scrollTo(el, { offset: -offset, duration: 1.1 });
        } else {
          window.scrollTo({
            top: window.scrollY + rect.top - offset,
            behavior: "smooth",
          });
        }
      });
    });
  };

  const setIntakeRef = (node: HTMLDivElement | null) => {
    intakeRef.current = node;
    intakeRevealRef.current = node;
  };

  const onIntakeComplete = async (answers: Record<string, AskUserAnswer>) => {
    // Flatten to the API's field names. Free-text (and allowOther's typed row)
    // lands in otherText; picked options land in selectedIds, which are option
    // IDs — resolve those back to their labels so the stored/emailed value is
    // readable ("X (Twitter)", not "twitter").
    const value = (id: string) => {
      const a = answers[id];
      if (!a) return "";
      const typed = a.otherText?.trim();
      if (typed) return typed;
      const q = INTAKE_QUESTIONS.find((x) => x.id === id);
      return a.selectedIds
        .map((sid) => q?.options?.find((o) => o.id === sid)?.title ?? sid)
        .join(", ");
    };

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value("name"),
          email: value("email"),
          role: value("role"),
          company_stage: value("company_stage"),
          website: value("website"),
          goals: value("goals"),
          readiness: value("readiness"),
          referral_source: value("referral_source"),
          quiz_answers: quizAnswers,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStage("done");
    } catch {
      setSubmitError("Something went wrong. Try again, or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStage("quiz");
    setResult(null);
    setTranscript([]);
    setQuizAnswers({});
    setSubmitError("");
    setResetKey((k) => k + 1);
  };

  return (
    <section id="start" className="w-full max-w-[80rem] mx-auto px-6 sm:px-8">
      <div className="relative max-w-3xl mx-auto">
      <FigmaSelectionFrame
        frameRef={inquiryBorderRef}
        className={cn("origin-center py-8 sm:py-10 px-6 sm:px-10", LIQUID_REVEAL)}
        style={{ background: "transparent" }}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className={`min-w-0 text-center ${LIQUID_REVEAL}`} style={liquidRevealDelay(0)}>
            {/* Transparent fill now, so the card sits on the dark zone's own
                ground and takes the zone's ink — the hardcoded near-black
                these used while the card was white would be invisible here. */}
            <h2
              className="text-[clamp(1.35rem,3.2vw,2.05rem)] font-normal tracking-[-0.025em] leading-tight"
              style={{ color: "rgb(var(--fg))" }}
            >
              What are you building?
            </h2>
            <p
              className="mt-3.5 sm:mt-4 text-[15px] sm:text-[16.5px] leading-relaxed tracking-tight"
              style={{ color: "rgb(var(--muted))" }}
            >
              Three quick questions to start. We&rsquo;ll take it from there.
            </p>
          </div>

        {!disclosed && (
          <span
            className={`relative w-full sm:w-auto self-stretch sm:self-center shrink-0 flex sm:inline-flex ${ACTION_RADIUS_CLASS} ${LIQUID_REVEAL}`}
            style={{ ...liquidRevealDelay(80), transformOrigin: "center" }}
          >
            <button
              type="button"
              onClick={onBegin}
              aria-expanded="false"
              aria-controls="questionnaire-flow"
              className={`relative w-full sm:w-auto inline-flex items-center justify-center overflow-hidden ${ACTION_RADIUS_CLASS} h-11 sm:h-12 px-6 sm:px-7 text-[17px] sm:text-[18px] tracking-tight leading-none [-webkit-tap-highlight-color:transparent]`}
              // White rather than the shared black CTA_FILL. This one sits on
              // the light page rather than inside the dark quiz card, so it
              // needs a hairline to hold its edge - a borderless white pill on
              // a near-white ground has nothing to read against.
              style={{
                background: "#ffffff",
                color: "#1a1a1a",
                border: "1px solid rgb(var(--line))",
                fontWeight: 450,
              }}
              {...inquiryCtaHover}
            >
              Begin
            </button>
          </span>
        )}
        </div>
      </FigmaSelectionFrame>
      </div>

      {disclosed && (
        <div
          id="questionnaire-flow"
          ref={flowRevealRef}
          className={cn(
            "quiz-dark mt-10 sm:mt-12 w-full mx-auto transition-[max-width] duration-500 ease-out",
            LIQUID_REVEAL,
            // Narrow on mobile so the options stay in an easy column; from sm
            // up both stages match the begin card's max-w-3xl, so the flow
            // sits in the same measure as the card it opened from.
            stage === "quiz" ? "max-w-md sm:max-w-3xl" : "max-w-2xl sm:max-w-3xl"
          )}
        >
        <ShapeProvider defaultShape="action">
        {stage !== "quiz" && (
          <div ref={transcriptRevealRef} className={`flex justify-end ${LIQUID_REVEAL}`}>
            {/* --sh-muted, not --sh-card: the card token is pure white in
                light mode, which made this read as a lit panel rather than a
                quiet transcript. Muted is the neutral step and resolves
                correctly in both themes. */}
            <div
              className="max-w-[85%] sm:max-w-[80%] rounded-3xl px-5 py-5 sm:px-6 sm:py-6 flex flex-col gap-4"
              style={{ background: "var(--sh-muted)" }}
            >
              {transcript.map((t) => (
                <div key={t.question}>
                  <p className="text-[14.5px] sm:text-[15px] tracking-tight text-foreground leading-snug">
                    {t.question}
                  </p>
                  <p className="mt-1 text-[14.5px] sm:text-[15px] tracking-tight text-muted-foreground leading-snug">
                    {t.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Our reply, aligned to the LEFT edge. During "typing" it fills in a
            character at a time with a caret; afterwards it just sits there. */}
        {stage !== "quiz" && result && (
          <div className={`flex justify-start ${LIQUID_REVEAL}`} style={liquidRevealDelay(80)}>
            <p className="mt-6 sm:mt-7 max-w-[92%] sm:max-w-[85%] text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-foreground">
              {stage === "typing" ? typedResponse : responseText}
              {stage === "typing" && !typingDone && (
                <span
                  aria-hidden
                  className="inline-block w-[2px] h-[1em] align-text-bottom ml-0.5"
                  style={{ background: "currentColor", opacity: 0.6 }}
                />
              )}
            </p>
          </div>
        )}

        {stage === "quiz" && (
          <FigmaSelectionFrame>
            <AskUserQuestions
              key={`quiz-${resetKey}`}
              questions={QUIZ_QUESTIONS}
              onComplete={onQuizComplete}
              className={QUIZ_FRAME_INNER_CLASS}
            />
          </FigmaSelectionFrame>
        )}

        {/* Inert chat input while the reply types: it holds the space the real
            questions are about to occupy, so the swap doesn't jump. */}
        {stage === "typing" && (
          <div
            ref={typingRevealRef}
            aria-hidden
            className={`mt-8 sm:mt-10 w-full rounded-[6px] border border-border px-4 py-3 flex items-center gap-3 ${LIQUID_REVEAL}`}
            style={{ background: "var(--sh-card)", opacity: 0.55 }}
          >
            <span className="text-[14px] tracking-tight text-muted-foreground flex-1">
              Type your answer...
            </span>
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] shrink-0"
              style={{ background: "var(--sh-muted)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-muted-foreground">
                <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
              </svg>
            </span>
          </div>
        )}

        {stage === "intake" && (
          <div ref={setIntakeRef} className={`mt-8 sm:mt-10 ${LIQUID_REVEAL}`}>
            <FigmaSelectionFrame>
              <AskUserQuestions
                key={`intake-${resetKey}`}
                questions={INTAKE_QUESTIONS}
                onComplete={onIntakeComplete}
                className={QUIZ_FRAME_INNER_CLASS}
              />
            </FigmaSelectionFrame>
            {submitting && (
              <p className="mt-4 text-[13px] tracking-tight text-muted-foreground text-center">
                Sending...
              </p>
            )}
            {submitError && (
              <p className="mt-4 text-[13px] tracking-tight text-center" style={{ color: "var(--sh-destructive)" }}>
                {submitError}
              </p>
            )}
          </div>
        )}

        {stage === "done" && (
          <div
            ref={doneRevealRef}
            className={`mt-8 sm:mt-10 w-full rounded-3xl border border-border px-6 py-8 sm:px-8 sm:py-9 ${LIQUID_REVEAL}`}
            style={{ background: "var(--sh-card)" }}
          >
            <p className="text-[20px] sm:text-[22px] font-normal tracking-tight text-foreground leading-snug mb-2.5">
              That&rsquo;s everything. Thanks.
            </p>
            <p className="text-[14.5px] sm:text-[15px] tracking-tight text-muted-foreground leading-relaxed mb-7">
              We read every one of these ourselves. If it looks like a fit you&rsquo;ll
              hear from us within a couple of days to set up a call.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={onStartConversation}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] tracking-tight font-medium transition-opacity duration-200 hover:opacity-90"
                style={{ background: "var(--sh-primary)", color: "var(--sh-primary-foreground)" }}
              >
                Start the conversation
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <button
                type="button"
                onClick={reset}
                className="text-[13px] tracking-tight text-muted-foreground hover:text-foreground transition-colors self-center sm:self-auto"
              >
                Start over
              </button>
            </div>
          </div>
        )}
        </ShapeProvider>
        </div>
      )}
    </section>
  );
}

const WORK_ITEMS = [
  { src: "/work/inboundly-1.png", title: "Inboundly", category: "Landing page", accent: "#6a6dff", logo: "/work-logos/inboundly.png" },
  { src: "/work/inboundly-2.png", title: "Inboundly", category: "Pricing", accent: "#6f72ff", logo: "/work-logos/inboundly.png" },
  { src: "/work/inboundly-3.png", title: "Inboundly", category: "Product design", accent: "#6a6dff", logo: "/work-logos/inboundly.png" },
  { src: "/work/aether-1.webp", title: "Aether Theme", category: "Shopify theme", accent: "#39637e", logo: "/work-logos/aether.png" },
  { src: "/work/aether-2.webp", title: "Aether Theme", category: "Cart design", accent: "#5b7496", logo: "/work-logos/aether.png" },
  { src: "/work/ellora-la/1.webp", title: "Ellora LA", category: "Shopify storefront", accent: "#cb591b", logo: "/work-logos/ellora-la.png" },
  { src: "/work/inertia-site.png", title: "Inertia", category: "Web design", accent: "#154365" },
  { src: "/work/ftgioo-1.png", title: "FT.GIOO", category: "Shopify storefront", accent: "#b8433a", logo: "/work-logos/ft-gioo.png" },
  { src: "/work/ftgioo-2.png", title: "FT.GIOO", category: "Shop page", accent: "#b8433a", logo: "/work-logos/ft-gioo.png" },
  { src: "/work/ftgioo-3.png", title: "FT.GIOO", category: "Collection page", accent: "#b8433a", logo: "/work-logos/ft-gioo.png" },
  { src: "/work/subtle-goods/1.png", title: "Subtle Goods", category: "Shopify storefront", accent: "#3a627c", logo: "/work-logos/subtle-goods.png" },
  { src: "/work/subtle-goods/2.png", title: "Subtle Goods", category: "Coming soon page", accent: "#4a5a2c", logo: "/work-logos/subtle-goods.png" },
  { src: "/work/trippie-1.png", title: "Trippie Redd", category: "Merch store", accent: "#9c0000", logo: "/work-logos/1400.png" },
  { src: "/work/trippie-2.png", title: "Trippie Redd", category: "Music page", accent: "#0d1b3e", logo: "/work-logos/1400.png" },
  { src: "/work/trippie-3.png", title: "Trippie Redd", category: "Product page", accent: "#a50000", logo: "/work-logos/1400.png" },
  { src: "/work/ellora-la/2.png", title: "Ellora LA", category: "Collection page", accent: "#6f283c", logo: "/work-logos/ellora-la.png" },
];

// Per-mark optical sizing. Tint is handled separately by CLIENT_LOGO_TINT —
// the mark is a mask, so the source artwork's own colour no longer matters.
const CAROUSEL_LOGO_WIDTH: Record<string, string> = {
  aether: "71.5%",
  inboundly: "38%",
  "trippie-redd": "48%",
  "ellora-la": "56%",
  "allure-new-york": "58%",
  "mood-swings": "62%",
  "subtle-goods": "46%",
  "ft-gioo": "44%",
  "samuel-norris": "68%",
};

function carouselLogoStyle(slug: string) {
  return { width: CAROUSEL_LOGO_WIDTH[slug] ?? "52%" };
}

// One representative shot per client, in WORK_ITEMS order, with the /work/[slug]
// case-study route resolved from content/work/*.mdx filenames. "Inertia" has no
// case-study file (it's the site itself), so it falls back to the /work index.
const WORK_CLIENT_SLUGS: Record<string, string> = {
  "Inboundly": "inboundly",
  "Aether Theme": "aether",
  "Ellora LA": "ellora-la",
  "FT.GIOO": "ft-gioo",
  "Subtle Goods": "subtle-goods",
  "Trippie Redd": "trippie-redd",
};

// Launch month per client, kept in sync with the year/month overrides on
// /work (see WORK_LINKS in work-index-client.tsx) so the two surfaces agree.
// Month is 1-12; "Early 2026" (Ellora LA) reads as January. Drives the
// timeline's month rail; "Inertia" has none (it's the site itself, not a
// dated engagement) and sits at the end unpinned to a date.
const WORK_CLIENT_DATES: Record<string, { year: number; month: number }> = {
  "Aether Theme": { year: 2023, month: 1 },
  "FT.GIOO": { year: 2025, month: 6 },
  "Trippie Redd": { year: 2025, month: 6 },
  "Ellora LA": { year: 2026, month: 1 },
  "Inboundly": { year: 2026, month: 5 },
  "Subtle Goods": { year: 2026, month: 6 },
};

function dateKey(year: number, month: number) {
  return year * 12 + month;
}

const WORK_CLIENTS = (() => {
  const seen = new Set<string>();
  return WORK_ITEMS.filter((w) => {
    if (seen.has(w.title)) return false;
    seen.add(w.title);
    return true;
  }).map((w) => ({
    ...w,
    href: WORK_CLIENT_SLUGS[w.title] ? `/work/${WORK_CLIENT_SLUGS[w.title]}` : "/work",
    date: WORK_CLIENT_DATES[w.title],
    // Undated (Inertia, the site itself) sorts to the end rather than the
    // front, so the timeline reads oldest-to-newest left to right with the
    // one undated entry trailing rather than jumping the queue.
  })).sort((a, b) => {
    const ak = a.date ? dateKey(a.date.year, a.date.month) : Infinity;
    const bk = b.date ? dateKey(b.date.year, b.date.month) : Infinity;
    return ak - bk;
  });
})();

// Scroll-jacked horizontal gallery, styled after Apple's product pages
// (AirPods Pro, Vision Pro): the section is tall and its inner frame sticks
// to the viewport while scrolling through it, and that vertical scroll
// distance is read as progress and mapped onto a horizontal translateX
// across the panel track. No wheel/touch interception anywhere - native
// scroll produces the horizontal motion purely through the sticky frame, the
// same trick Apple's own pages use, which is why trackpad momentum and
// scrollbar dragging both keep working here instead of behaving like a
// separate captured input mode.
//
// Progress is polled on rAF against the section's own bounding rect rather
// than driven by scroll or resize events, matching LightCard's scrollScale
// effect elsewhere in this file: Lenis (this site's smooth-scroll library)
// advances scroll through its own rAF loop and never fires native `scroll`
// events, so an event listener here would just never fire.
const GALLERY_VH_PER_PANEL = 60; // scroll budget per panel, in vh - "short and snappy"

function WorkScrollGallery({ onActiveAccent }: { onActiveAccent?: (color: string) => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const total = WORK_CLIENTS.length;
  const lastActiveRef = useRef(-1);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const apply = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // The section is (total panels worth of scroll budget) + one extra
      // viewport tall; progress 0 the instant its top reaches the top of the
      // viewport, progress 1 once it's scrolled up by its own scrollable
      // range (own height minus one viewport, since the sticky frame holds
      // the last viewport-height in place).
      const scrollRange = rect.height - vh;
      const progress = scrollRange > 0
        ? Math.min(1, Math.max(0, -rect.top / scrollRange))
        : 0;
      const maxTranslate = track.scrollWidth - (track.parentElement?.clientWidth ?? 0);
      track.style.transform = `translateX(-${progress * Math.max(0, maxTranslate)}px)`;

      const active = Math.min(total - 1, Math.floor(progress * total));
      if (active !== lastActiveRef.current) {
        lastActiveRef.current = active;
        onActiveAccent?.(WORK_CLIENTS[active].accent);
      }
      rafRef.current = requestAnimationFrame(apply);
    };
    rafRef.current = requestAnimationFrame(apply);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Desktop: the scroll-jacked sticky gallery. Mobile drops it for a
          plain swipeable row below - a sticky-frame scrollytelling effect
          depends on precise scroll-distance math that touch scrolling (with
          its own momentum/rubber-banding) doesn't reproduce reliably, and
          native horizontal swipe is the more honest mobile pattern anyway. */}
      <section
        ref={sectionRef}
        className="relative hidden sm:block"
        style={{ height: `${100 + GALLERY_VH_PER_PANEL * total}vh` }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
          <div ref={trackRef} className="flex" style={{ willChange: "transform" }}>
            {WORK_CLIENTS.map((w) => (
              <Link
                key={w.title}
                href={w.href}
                className="relative shrink-0 w-screen h-screen flex items-center justify-center px-6 sm:px-10"
              >
                <div
                  className="relative w-full h-full overflow-hidden"
                  style={{ borderRadius: 24, maxHeight: "82vh", margin: "auto" }}
                >
                  <Image
                    src={w.src}
                    alt={w.title}
                    fill
                    draggable={false}
                    quality={85}
                    sizes="100vw"
                    className="object-cover object-top"
                  />
                  {/* Minimal caption, bottom-left - the image does the work,
                      this just names it. */}
                  <div className="absolute inset-x-0 bottom-0 px-6 sm:px-10 py-6 sm:py-8 pointer-events-none">
                    <p className="text-[22px] sm:text-[28px] font-medium tracking-tight text-white leading-none">
                      {w.title}
                    </p>
                    <p className="mt-1.5 text-[13px] sm:text-[14px] tracking-tight text-white/70">
                      {w.category}
                    </p>
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile: plain native horizontal swipe, snap-to-panel. */}
      <div className="sm:hidden flex gap-3 overflow-x-auto px-6 pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
        {WORK_CLIENTS.map((w) => (
          <Link
            key={w.title}
            href={w.href}
            className="relative shrink-0 snap-start overflow-hidden"
            style={{ width: "82vw", aspectRatio: "4 / 3", borderRadius: 18 }}
            onClick={() => onActiveAccent?.(w.accent)}
          >
            <Image
              src={w.src}
              alt={w.title}
              fill
              draggable={false}
              quality={75}
              sizes="82vw"
              className="object-cover object-top"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}
            />
            <div className="absolute inset-x-0 bottom-0 px-4 py-4 pointer-events-none">
              <p className="text-[18px] font-medium tracking-tight text-white leading-none">{w.title}</p>
              <p className="mt-1 text-[12.5px] tracking-tight text-white/70">{w.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

// Neutral-toned pill for emphasising a phrase inline in body copy. Grey on a
// soft grey wash rather than an accent colour, so it reads as a highlight
// without competing with the work thumbnails' accent tinting.
//
// Inline (not inline-flex): flex centering + align-middle sit the pill below
// the paragraph baseline. inherit keeps the highlight the same tone as body copy.
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline rounded-[6px] px-[0.4em] py-px whitespace-nowrap align-baseline leading-none"
      style={{
        background: "rgba(26,26,26,0.06)",
        color: "inherit",
      }}
    >
      {children}
    </span>
  );
}

// Splits copy on [[double brackets]] into word-level tokens, wrapping
// bracketed phrases in a Pill. Pills stay as one atomic token (never split
// across words) so a highlighted phrase reveals as a single unit rather than
// word-by-word. Plain words are split on spaces so LiquidText can stagger
// them individually.
type CopyToken = { key: string; node: React.ReactNode };

function tokenizeCopy(text: string): CopyToken[] {
  const tokens: CopyToken[] = [];
  const parts = text.split(/\[\[(.+?)\]\]/g);
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      tokens.push({ key: `${i}`, node: <Pill>{part}</Pill> });
      return;
    }
    part.split(/(\s+)/).forEach((word, j) => {
      if (word === "" || /^\s+$/.test(word)) return;
      tokens.push({ key: `${i}-${j}`, node: word });
    });
  });
  return tokens;
}

// Per-paragraph liquid dissolve — blur clears and type settles into focus,
// consistent with the hero and .rise--liquid scroll reveals rather than
// sliding up from below.
function LiquidText({
  text,
  className,
  style,
  pRef,
  delayMs = 0,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  pRef?: React.RefObject<HTMLParagraphElement | null>;
  delayMs?: number;
}) {
  const ownRef = useRef<HTMLParagraphElement>(null);
  const ref = pRef ?? ownRef;
  const [visible, setVisible] = useState(false);
  const tokens = React.useMemo(() => tokenizeCopy(text), [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        const id = setTimeout(() => setVisible(true), delayMs);
        return () => clearTimeout(id);
      },
      { threshold: 0.06, rootMargin: "0px 0px -32px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delayMs]);

  const DURATION = 680;

  return (
    <p
      ref={ref}
      className={className}
      style={{
        ...style,
        willChange: "opacity, transform, filter",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.992)",
        filter: visible ? "blur(0px)" : "blur(10px)",
        transition: [
          `opacity ${DURATION}ms cubic-bezier(0.22,0.61,0.36,1)`,
          `transform ${DURATION}ms cubic-bezier(0.22,0.61,0.36,1)`,
          `filter ${DURATION}ms cubic-bezier(0.22,0.61,0.36,1)`,
        ].join(", "),
      }}
    >
      {tokens.map((token, i) => (
        <React.Fragment key={token.key}>
          {token.node}
          {i < tokens.length - 1 ? " " : ""}
        </React.Fragment>
      ))}
    </p>
  );
}

function DesignPhilosophy({ introRef }: { introRef?: React.RefObject<HTMLParagraphElement | null> }) {
  const [active, setActive] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const intro =
    "Ideas and identity are rarely the problem. Execution is. We take what a company, brand, or person stands for and carry it through every [[detail]], until the result feels effortless to the people moving through it.";
  // Each segment is one way of finishing "how we think about execution" — the
  // label names the idea, the panel argues it. Kept parallel in length so the
  // panel height barely moves between segments.
  const segments = [
    {
      label: "Restraint",
      text: "The best design disappears into the experience. Nobody applauds the [[restraint]], and that's exactly how you know it landed.",
    },
    {
      label: "Agreement",
      text: "Identity isn't expressed in one big gesture. It's carried in a hundred small decisions that all [[agree]] with each other.",
    },
    {
      label: "Follow-through",
      text: "Taste sets the direction, but finishing is what people actually feel. We stay on a thing until the last [[detail]] stops asking for attention.",
    },
  ];

  // Drive the sliding pill off measured tab geometry rather than percentages,
  // so it stays correct with variable-width labels and after a font swap.
  useLayoutEffect(() => {
    const el = tabRefs.current[active];
    if (!el) return;
    const measure = () => setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, [active]);

  // Animate the panel between segment heights instead of letting the section
  // jump — measure the new content, then settle back to auto so a resize or
  // font swap can still reflow it.
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const next = el.scrollHeight;
    setHeight(prev => (prev === "auto" ? next : prev));
    const id = requestAnimationFrame(() => setHeight(next));
    return () => cancelAnimationFrame(id);
  }, [active]);

  // Roving arrow-key navigation, which is what makes this read as a real
  // tablist to a keyboard or screen reader rather than a row of buttons.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = segments.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="rise rise--liquid w-full max-w-[80rem] mx-auto px-6 sm:px-8">
      <div className="max-w-2xl sm:max-w-3xl sm:mx-auto">
        <h2 className="mb-5 sm:mb-6 text-center">
          <span
            className="inline-block rounded-[6px] px-3 py-1 text-[clamp(1.35rem,3.2vw,2.05rem)] font-normal tracking-[-0.025em] leading-tight text-white"
            style={{ background: "#1a1a1a" }}
          >
            How we think about execution
          </span>
        </h2>
        <LiquidText
          pRef={introRef}
          text={intro}
          className="text-[16.5px] sm:text-[21px] leading-relaxed tracking-tight text-left"
          style={{ color: "#5c5c5c" }}
        />
        <div className="mt-8">
          {/* Segmented control: one bordered track, a sliding fill behind the
              active segment. The track is the affordance — it reads as a
              control at a glance, before anything is hovered. */}
          <div
            role="tablist"
            aria-label="How we think about execution"
            onKeyDown={onKeyDown}
            className={`relative inline-flex items-stretch p-[3px] ${ACTION_RADIUS_CLASS} max-w-full overflow-x-auto`}
            style={{
              background: "rgba(26,26,26,0.04)",
              boxShadow: "inset 0 0 0 1px rgba(26,26,26,0.08)",
            }}
          >
            {indicator && (
              <span
                aria-hidden="true"
                className={`absolute top-[3px] bottom-[3px] ${ACTION_RADIUS_CLASS}`}
                style={{
                  left: indicator.left,
                  width: indicator.width,
                  background: "#ffffff",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(26,26,26,0.06)",
                  transition:
                    "left 320ms cubic-bezier(0.22,1,0.36,1), width 320ms cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            )}
            {segments.map((seg, i) => {
              const selected = i === active;
              return (
                <button
                  key={seg.label}
                  ref={el => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`execution-tab-${i}`}
                  aria-selected={selected}
                  aria-controls="execution-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  className="relative z-[1] whitespace-nowrap px-3.5 sm:px-4 py-1.5 text-[14px] sm:text-[17px] tracking-tight leading-none transition-colors duration-200"
                  style={{
                    color: selected ? "#1a1a1a" : "#7a7a7a",
                    fontWeight: selected ? 450 : 400,
                    borderRadius: ACTION_RADIUS_PX,
                  }}
                >
                  {seg.label}
                </button>
              );
            })}
          </div>
          <div
            style={{
              height,
              overflow: "hidden",
              transition: "height 320ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div
              ref={bodyRef}
              id="execution-panel"
              role="tabpanel"
              aria-labelledby={`execution-tab-${active}`}
              className="pt-4 sm:max-w-xl"
            >
              <LiquidText
                key={segments[active].label}
                text={segments[active].text}
                className="text-[16.5px] sm:text-[21px] leading-relaxed tracking-tight text-left"
                style={{ color: "#5c5c5c" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Ramps up smoothly rather than moving fastest right at t=0, so a release
// glide starts unhurried instead of snapping off abruptly the instant you
// let go.
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const WHAT_WE_DO_ITEMS = [
  {
    label: "Direction",
    description: "We figure out what the product or brand actually needs to be before anything gets designed.",
    image: "/what-we-do/direction.png",
    bentoClass: "sm:col-span-2 sm:row-span-2 sm:min-h-[28rem] lg:min-h-[32rem]",
  },
  {
    label: "Design",
    description: "Interfaces, identity, and the small decisions in between, held to one standard of taste.",
    image: "/what-we-do/design.png",
    bentoClass: "sm:col-span-2 sm:row-span-1",
  },
  {
    label: "Development",
    description: "We build what we design ourselves, so nothing is lost translating one team's vision to another's code.",
    image: "/what-we-do/development.png",
    bentoClass: "sm:col-span-1 sm:row-span-1",
  },
  {
    label: "Launch",
    description: "We ship what we build and stay through launch, so what goes live matches what was designed.",
    image: "/what-we-do/launch.png",
    bentoClass: "sm:col-span-1 sm:row-span-1",
  },
] as const;

const WHAT_WE_DO_CELL =
  "flex flex-col rounded-[6px] p-4 sm:p-5 min-h-[168px] sm:min-h-0 h-full";
const WHAT_WE_DO_CELL_STYLE = {
  background: "rgba(26,26,26,0.03)",
  boxShadow: "inset 0 0 0 1px rgba(26,26,26,0.08)",
} as const;

const WHAT_WE_DO_LABEL_CLASS =
  "text-[16.5px] sm:text-[21px] leading-relaxed tracking-tight";
const WHAT_WE_DO_LABEL_STYLE = { color: "#1a1a1a", fontWeight: 500 } as const;
const WHAT_WE_DO_DESC_STYLE = { color: "#5c5c5c" } as const;

function WhatWeDoDirectionCell() {
  const item = WHAT_WE_DO_ITEMS[0];

  return (
    <div className="what-we-do-direction">
      <div className="what-we-do-direction__mobile">
        <p className={WHAT_WE_DO_LABEL_CLASS} style={WHAT_WE_DO_LABEL_STYLE}>
          {item.label}
        </p>
        <p className={cn(WHAT_WE_DO_LABEL_CLASS, "mt-2")} style={WHAT_WE_DO_DESC_STYLE}>
          {item.description}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt="" aria-hidden="true" />
      </div>

      <div className="what-we-do-direction__desktop">
        <div className="what-we-do-direction__desktop-copy">
          <p className={WHAT_WE_DO_LABEL_CLASS} style={WHAT_WE_DO_LABEL_STYLE}>
            {item.label}
          </p>
          <p className={cn(WHAT_WE_DO_LABEL_CLASS, "mt-2")} style={WHAT_WE_DO_DESC_STYLE}>
            {item.description}
          </p>
        </div>
        <div className="what-we-do-direction__desktop-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt="" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function WhatWeDoStandardCell({
  item,
}: {
  item: (typeof WHAT_WE_DO_ITEMS)[number];
}) {
  const hasImage = "image" in item && item.image;

  return (
    <div
      className={cn(WHAT_WE_DO_CELL, item.bentoClass)}
      style={WHAT_WE_DO_CELL_STYLE}
    >
      <p className={WHAT_WE_DO_LABEL_CLASS} style={WHAT_WE_DO_LABEL_STYLE}>
        {item.label}
      </p>
      <p className={cn(WHAT_WE_DO_LABEL_CLASS, "mt-2")} style={WHAT_WE_DO_DESC_STYLE}>
        {item.description}
      </p>
      {hasImage ? (
        <div className="mt-auto flex min-h-[120px] w-full min-w-0 flex-1 items-end justify-center pt-4 sm:min-h-[140px] sm:pt-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt=""
            aria-hidden="true"
            // Portrait art (Launch) would run ~1.5x taller than the box if it
            // were sized by width like the landscape pieces, dragging its card
            // past the neighbour sharing its row. Cap the height instead and
            // let width follow, so every cell lands at the same art height.
            className="h-auto max-h-[120px] w-auto max-w-[160px] object-contain sm:max-h-[140px] sm:max-w-[200px]"
          />
        </div>
      ) : null}
    </div>
  );
}

function WhatWeDo() {
  return (
    <section className="rise rise--liquid w-full max-w-[80rem] mx-auto px-6 sm:px-8">
      <div className="max-w-2xl sm:max-w-none sm:mx-auto">
        <div
          className="rounded-[6px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10"
          style={{
            background: "rgba(26,26,26,0.04)",
            boxShadow: "inset 0 0 0 1px rgba(26,26,26,0.08)",
          }}
        >
          <h2 className="mb-8 sm:mb-10 text-center">
            <span
              className="inline-block rounded-[6px] px-3 py-1 text-[clamp(1.35rem,3.2vw,2.05rem)] font-normal tracking-[-0.025em] leading-tight text-white"
              style={{ background: "#1a1a1a" }}
            >
              What we do
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 sm:auto-rows-[minmax(11rem,auto)] gap-3 sm:gap-4">
            <WhatWeDoDirectionCell />
            {WHAT_WE_DO_ITEMS.filter((item) => item.label !== "Direction").map((item) => (
              <WhatWeDoStandardCell key={item.label} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AiApproach({ posts }: { posts: PostMeta[] }) {
  const first =
    "AI hasn't changed what we believe about execution; it's changed how much of it we can afford. A studio our size can now explore [[more]] directions, discard the wrong ones sooner, and spend the saved time where it counts: on the version worth shipping.";
  const second =
    "None of that works without judgment, and judgment comes from reps. Years of projects have built our grip on the [[fundamentals]]: design systems that hold up as a brand grows, infrastructure that stays out of the way, and details people feel before they notice.";
  return (
    <>
      <section className="rise rise--liquid w-full max-w-[80rem] mx-auto px-6 sm:px-8">
        <div className="max-w-2xl sm:max-w-3xl sm:mx-auto">
            <h2 className="mb-5 sm:mb-6 text-center">
              <span
                className="inline-block rounded-[6px] px-3 py-1 text-[clamp(1.35rem,3.2vw,2.05rem)] font-normal tracking-[-0.025em] leading-tight text-white"
                style={{ background: "#1a1a1a" }}
              >
                How we think about AI
              </span>
            </h2>
            <LiquidText
              text={first}
              className="text-[16.5px] sm:text-[21px] leading-relaxed tracking-tight text-left"
              style={{ color: "#5c5c5c" }}
            />
            <LiquidText
              text={second}
              delayMs={160}
              className="text-[16.5px] sm:text-[21px] leading-relaxed tracking-tight text-left mt-5"
              style={{ color: "#5c5c5c" }}
            />
        </div>
      </section>
      <div className="py-16 sm:py-24" />
      <WhatWeDo />
      <div className="py-16 sm:py-24" />
      <BlogCarousel posts={posts} />
    </>
  );
}

// Wraps everything from the hero through AiApproach in a white "card" that
// sits on the page's true (black) canvas. As the card's own bottom edge
// approaches and crosses into the viewport, it eases into a slightly
// smaller, more tightly rounded shape — like it's settling back and away —
// instead of just cutting to black the instant its flow position ends.
// Tracks scroll position directly (same pattern as WorkThumbnails'
// scrollScale effect) rather than a fixed-duration animation, so the motion
// stays tied 1:1 to how far the user has scrolled and reverses cleanly.
function LightCard({ children }: { children: React.ReactNode }) {
  // Measured on a sentinel at the very end of the card's content, not the
  // scaling element itself — reading getBoundingClientRect() off an element
  // whose own transform you're about to update from that same read creates
  // a feedback loop (the scaled position feeds back into the next scroll
  // tick's measurement instead of tracking real scroll distance).
  const sentinelRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const card = cardRef.current;
    if (!sentinel || !card) return;

    // Polled every animation frame rather than driven off scroll events —
    // Lenis (this site's smooth-scroll library) advances the real scroll
    // position through its own RAF loop, not in lockstep with native
    // `scroll` events, so an event-driven listener here was reading a
    // position that lagged behind what was actually on screen, which is
    // what read as snapping instead of tracking the wheel/swipe input.
    // Polling directly every frame keeps this locked to the exact position
    // Lenis is rendering right now.
    const apply = () => {
      const rect = sentinel.getBoundingClientRect();
      const vh = window.innerHeight;
      // Ramps across a full viewport height of scrolling, starting the
      // instant the sentinel (end of the card's content) crosses the
      // bottom of the viewport, finishing once it's scrolled a full
      // viewport height past that — a wide, generous window so the motion
      // reads as continuous rather than resolving over a few px of scroll.
      let progress = Math.min(1, Math.max(0, (vh - rect.bottom) / vh));
      // Below this, the visual difference is imperceptible but a non-zero
      // scale() value still forces the card onto its own GPU-composited
      // layer — which is what caused a faint line to reappear right at the
      // resting (should-be-untransformed) state: floating-point noise from
      // getBoundingClientRect() rarely lands on exactly 0, so the `=== 1`
      // check below almost never actually held even when nothing should be
      // visually scaling yet. Snapping the whole low end to 0 first means
      // the transform is genuinely omitted, not just visually close to it.
      if (progress < 0.01) progress = 0;
      const scale = 1 - progress * 0.08;
      // On mobile the corner radius reads too large against the narrow
      // viewport, so keep its ramp under 25px; desktop keeps the fuller
      // 32→60 ramp.
      const isMobile = window.innerWidth < 640;
      const radius = isMobile ? 12 + progress * 13 : 32 + progress * 28;
      card.style.transform = progress === 0 ? "" : `scale(${scale})`;
      card.style.borderBottomLeftRadius = `${radius}px`;
      card.style.borderBottomRightRadius = `${radius}px`;
      rafRef.current = requestAnimationFrame(apply);
    };
    rafRef.current = requestAnimationFrame(apply);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    // The wrapper is the black backdrop the card scales away from. The card
    // itself is normal document flow (its natural height determines the
    // wrapper's height) but visually pinned flush to the wrapper via a
    // second, absolutely-positioned "top pad" strip that always stays
    // exactly full-width/full-black-free at the top — see below — so
    // nothing at the very top edge (where the card never actually needs to
    // shrink) can ever expose the black wrapper behind it, regardless of
    // any sub-pixel rounding the scale()'d bottom edge introduces.
    <div
      className="relative"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", background: "#0a0a0a" }}
    >
      <div
        ref={cardRef}
        className="relative"
        style={{
          background: "#fff",
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          overflow: "hidden",
          transformOrigin: "center top",
        }}
      >
        {children}
        <div ref={sentinelRef} />
      </div>
      {/* Covers exactly the sliver a scale()'d box can expose right at its
          own top edge from sub-pixel rounding — a fixed-height white strip
          that never moves or scales, so there's nothing dynamic left to
          misalign against the wrapper's black background. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: 6, background: "#fff", zIndex: 1 }} />
    </div>
  );
}

// Every client card sits on the same near-black field; the brand colour is
// carried by the mark instead. Logos are alpha PNGs, so they're tinted by
// masking a solid colour block with the artwork rather than by filtering it —
// a filter chain can't reach an arbitrary hue from an unknown source colour.
// Slugs with no entry fall back to white.
const CLIENT_CARD_BG = "#0a0a0a";
const CLIENT_LOGO_TINT_DEFAULT = "#ffffff";
const CLIENT_LOGO_TINT: Record<string, string> = {
  aether: "#5fa8d8",
  inboundly: "#8f7cf5",
  "trippie-redd": "#d4484f",
  "ellora-la": "#e0762f",
  "allure-new-york": "#d9c39c",
};

// Client detail dialog, opened from a name in the type list. Lenis drives the
// page scroll, so a plain body-overflow lock isn't enough — the wheel has to be
// handed to the dialog via lenis:lock plus data-lenis-prevent, or the panel
// won't scroll internally.
function ClientDialog({
  item,
  onClose,
}: {
  item: ClientCarouselItem | null;
  onClose: () => void;
}) {
  const open = item !== null;
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Live swipe offset, in px. Written during a drag and animated back to 0 (or
  // out) on release.
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  // Mirrors dragY for the touch handlers: touchend needs the latest offset
  // synchronously, and reading the state variable there would close over the
  // value from the render that installed the handler.
  const dragYRef = useRef(0);
  const dragRef = useRef<{ startY: number; startX: number; active: boolean } | null>(null);
  // Single writer for the offset, so the ref can never drift from the state.
  const applyDragY = (v: number) => { dragYRef.current = v; setDragY(v); };
  // The portal target only exists on the client. Gating on `typeof document`
  // renders null on the server but a real portal on the very first client
  // render, which is a hydration mismatch — so gate on an effect instead, and
  // let the first client render agree with the server's null.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Reset the sheet position whenever it reopens, so a previous swipe doesn't
  // leave the next open offset.
  useEffect(() => {
    if (open) {
      applyDragY(0);
      setDragging(false);
      setDismissing(false);
      dismissDoneRef.current = false;
      dragRef.current = null;
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    }
  }, [open]);

  useEffect(() => () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
  }, []);

  const dismissDoneRef = useRef(false);
  const finishDismiss = () => {
    if (dismissDoneRef.current) return;
    dismissDoneRef.current = true;
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    onClose();
  };

  const CLOSE_THRESHOLD = 110;
  const DISMISS_MS = 420;
  // Finger has to travel this far down before the touch is treated as a
  // dismiss drag at all. Below it the gesture stays a candidate: nothing
  // moves, no transform is written, and a tap on a link or button inside the
  // sheet behaves like a plain tap. Without this, touchstart alone armed the
  // drag, so every press read as "about to close".
  const DRAG_SLOP = 8;
  // Past the slop, a gesture is only a dismiss if it is mostly vertical.
  // A mostly-horizontal swipe keeps the sheet still.
  const DIRECTION_RATIO = 1.2;

  const onTouchStart = (e: React.TouchEvent) => {
    // Only a drag that begins at the very top of the scroll area can dismiss;
    // otherwise a normal upward scroll inside the panel would read as one.
    const textScroll = panelRef.current?.querySelector("[data-client-dialog-text]");
    if ((textScroll instanceof HTMLElement ? textScroll.scrollTop : 0) > 0) return;
    const t = e.touches[0];
    // `active` starts false: this is a candidate, not yet a drag. It is
    // promoted in touchmove once the finger clears the slop downward.
    dragRef.current = { startY: t.clientY, startX: t.clientX, active: false };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const t = e.touches[0];
    const delta = t.clientY - d.startY;

    if (!d.active) {
      const absY = Math.abs(delta);
      const absX = Math.abs(t.clientX - d.startX);
      // Not moved enough yet — stay a tap.
      if (absY < DRAG_SLOP) return;
      // Moved, but sideways or upward: this gesture is not a dismiss. Drop the
      // candidate so the rest of the touch is left alone.
      if (delta < 0 || absY < absX * DIRECTION_RATIO) {
        dragRef.current = null;
        return;
      }
      d.active = true;
      setDragging(true);
    }

    // Measure from where the drag was promoted, not from touchstart, so the
    // sheet does not jump by DRAG_SLOP the moment it engages.
    const dragDelta = delta - DRAG_SLOP;
    applyDragY(dragDelta > 0 ? dragDelta : dragDelta * 0.2);
  };

  const onTouchEnd = () => {
    const d = dragRef.current;
    dragRef.current = null;
    // Never became a real drag (a tap, or a sideways swipe): leave the sheet
    // exactly as it was rather than running a settle animation.
    if (!d?.active) return;
    setDragging(false);
    // Read the committed offset rather than deciding inside a setDragY
    // updater. React treats updaters as pure and may run them during render,
    // so calling onClose() in there sets state on the parent mid-render
    // ("Cannot update a component while rendering a different component").
    if (dragYRef.current > CLOSE_THRESHOLD) {
      setDismissing(true);
      const rect = sheetRef.current?.getBoundingClientRect();
      // translateY is measured from rest, not from the current drag offset — add
      // the remaining distance from the finger-released position to off-screen.
      const exitY = rect
        ? dragYRef.current + (window.innerHeight - rect.top) + 56
        : window.innerHeight;
      requestAnimationFrame(() => applyDragY(exitY));
      dismissTimerRef.current = setTimeout(finishDismiss, DISMISS_MS + 80);
      return;
    }
    applyDragY(0);
  };

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("lenis:lock"));
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("lenis:unlock"));
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;
  // Idle: render nothing at all. The container below is fixed/inset-0/100dvh,
  // so leaving it mounted with an invisible backdrop still parks a painted
  // layer against the bottom viewport edge — and iOS 26 Safari tints its
  // toolbar from fixed elements near that edge in preference to the body,
  // finding no colour here and falling back to white. `dismissing` keeps it
  // alive through the exit animation.
  // See .home-dark-root in globals.css and
  // https://nasedk.in/blog/ios26-safari-toolbar-colors/
  if (!open && !dismissing) return null;

  const dragFade = Math.min(Math.max(dragY, 0) / 280, 0.45);

  return createPortal(
    <div
      className="fixed z-50 flex items-end sm:items-center justify-center px-4 pt-6 pb-4 sm:p-6"
      style={{ inset: 0, height: "100dvh", pointerEvents: open && !dismissing ? "auto" : "none" }}
    >
      <div
        ref={backdropRef}
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: open ? (dismissing ? 0 : 1 - dragFade) : 0,
          transition: dismissing
            ? `opacity ${DISMISS_MS}ms ease`
            : dragging
              ? "none"
              : "opacity 220ms ease",
        }}
        onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      />
      {item && (
        <div
          ref={sheetRef}
          className="relative w-full min-w-0 max-w-[520px] p-[3px] max-h-[calc(100dvh-2.5rem)] sm:max-h-none"
          onTransitionEnd={(e) => {
            if (e.target !== e.currentTarget || e.propertyName !== "transform" || !dismissing) return;
            finishDismiss();
          }}
          style={{
            animation: open && dragY === 0 && !dragging && !dismissing
              ? "modal-up 320ms cubic-bezier(0.22,1,0.36,1) both"
              : "none",
            transform: dragY !== 0 ? `translateY(${dragY}px)` : undefined,
            transition: dragging
              ? "none"
              : dismissing
                ? `transform ${DISMISS_MS}ms cubic-bezier(0.32, 0, 0.67, 0)`
                : "transform 420ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <FigmaSelectionFrame
            className="bg-[rgb(var(--bg))] min-w-0 flex max-h-[calc(100dvh-3rem-6px)] flex-col sm:max-h-none"
            strokeColor={CLIENT_DIALOG_STROKE}
            handleFill="rgb(var(--bg))"
          >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={item.client}
            data-lenis-prevent
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
            className="relative flex min-h-0 min-w-0 max-w-full flex-1 flex-col"
            style={{
              touchAction: "pan-y",
              WebkitUserSelect: dragging ? "none" : undefined,
              userSelect: dragging ? "none" : undefined,
            }}
          >
          {item.image ? (
            <ClientDialogMediaBlock slug={item.slug} src={item.image} dragging={dragging} dragY={dragY} />
          ) : (
            <ClientDialogDragHandle dragging={dragging} dragY={dragY} />
          )}

          {item.image && (
            <FigmaHorizontalRule strokeColor={CLIENT_DIALOG_STROKE} handleFill="rgb(var(--bg))" />
          )}

          <button
            onClick={onClose}
            className="absolute sm:top-4 sm:right-4 z-10 w-8 h-8 hidden sm:flex items-center justify-center rounded-full text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
            style={{ background: "rgb(var(--fg)/0.06)" }}
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3.5 h-3.5">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>

          <div
            data-client-dialog-text
            className="min-h-0 min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-6 sm:overflow-visible sm:px-6 sm:py-5"
          >
            <p
              className="min-w-0 break-words text-[clamp(1.6rem,5vw,2.1rem)] tracking-tight leading-none text-[rgb(var(--fg))]"
              style={{ fontWeight: 450, overflowWrap: "anywhere" }}
            >
              {item.client}
            </p>

            {(item.service || item.year) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] tracking-tight min-w-0">
                {item.service && (
                  <span
                    className="inline-flex items-center rounded-[6px] px-2.5 py-1 leading-none"
                    style={{ background: "rgb(var(--fg) / 0.06)", color: "rgb(var(--muted))" }}
                  >
                    {item.service}
                  </span>
                )}
                {item.year && (
                  <span style={{ color: "rgb(var(--muted))" }}>{item.year}</span>
                )}
              </div>
            )}

            {item.summary && (
              <p className="mt-4 sm:mt-3 min-w-0 break-words text-[15px] sm:text-[16px] leading-relaxed tracking-[-0.02em]" style={{ color: "rgb(var(--muted))", overflowWrap: "anywhere" }}>
                {item.summary}
              </p>
            )}

            <Link
              href={`/work/${item.slug}`}
              className={`mt-6 sm:mt-5 inline-flex items-center ${ACTION_RADIUS_CLASS} px-5 h-10 text-[15px] tracking-tight`}
              style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))", fontWeight: 450 }}
            >
              View case study
            </Link>
          </div>
          </div>
          </FigmaSelectionFrame>
        </div>
      )}
    </div>,
    document.body,
  );
}

// Type-only client list. No logos, no cards: the names carry it, which
// sidesteps the whole class of logo problems (mismatched source artwork,
// per-mark optical sizing, tinting an alpha PNG). Each row is a link to the
// case study; the brand colour shows up only on hover so the resting state
// stays quiet.
const CLIENT_NAME_ACCENT: Record<string, string> = {
  aether: "#5fa8d8",
  inboundly: "#8f7cf5",
  "trippie-redd": "#d4484f",
  "ellora-la": "#e0762f",
  "allure-new-york": "#c2a878",
  "mood-swings": "#3f8f6a",
  "samuel-norris": "#b8353c",
  "subtle-goods": "#6aa9d9",
};

// Darker than the global --line token: a 1px dashed rule at 225 grey nearly
// disappears, and this grid is built from rails so they have to read.
const CLIENT_GRID_LINE = `1px solid ${SELECTION_FRAME_COLOR}`;

function ClientName({ name, slug, onDark = false }: { name: string; slug: string; onDark?: boolean }) {
  const accent = CLIENT_NAME_ACCENT[slug] ?? "#1a1a1a";
  return (
    <span
      className="block text-[clamp(1.15rem,4.6vw,1.75rem)] tracking-tight leading-none min-w-0 hyphens-none transition-colors duration-200 group-hover:text-[color:var(--client-accent)]"
      style={{
        fontWeight: 450,
        color: onDark ? "rgb(var(--fg))" : "#1a1a1a",
        overflowWrap: "break-word",
        ["--client-accent" as string]: accent,
      }}
    >
      {name}
    </span>
  );
}

function ClientTypeList({ items, onDark = false }: { items: ClientCarouselItem[]; onDark?: boolean }) {
  const [openItem, setOpenItem] = useState<ClientCarouselItem | null>(null);

  return (
    <section className="w-full max-w-[80rem] mx-auto px-6 sm:px-8">
      <div className="max-w-2xl sm:max-w-3xl sm:mx-auto">
      <p
        className="mb-6 sm:mb-8 text-center text-[13px] sm:text-[14px] leading-snug tracking-tight text-balance"
        style={{ color: onDark ? "rgb(var(--muted))" : "#5c5c5c" }}
      >
        Some names we&rsquo;ve worked with.
      </p>
      <FigmaSelectionFrame handleFill={onDark ? "rgb(var(--bg))" : "#fff"}>
      <ul className="grid grid-cols-2">
        {items.map((item, i) => {
          return (
            <li
              key={item.slug}
              className="px-4 sm:px-6"
              style={{
                borderTop: i >= 2 ? CLIENT_GRID_LINE : undefined,
                borderRight: i % 2 === 0 ? CLIENT_GRID_LINE : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => setOpenItem(item)}
                aria-haspopup="dialog"
                className="group flex items-baseline py-4 sm:py-7 min-w-0 w-full text-left"
              >
                <ClientName name={item.client} slug={item.slug} onDark={onDark} />
              </button>
            </li>
          );
        })}
      </ul>
      </FigmaSelectionFrame>
      </div>
      <ClientDialog item={openItem} onClose={() => setOpenItem(null)} />
    </section>
  );
}

function ClientCarousel({ initialItems }: { initialItems: ClientCarouselItem[] }) {
  const [items] = useState<ClientCarouselItem[]>(initialItems);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const padRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Desktop hover index. The card's transform is driven inline (for the mobile
  // active state and live swipe), and an inline transform overrides a Tailwind
  // `sm:hover:scale` class, so the desktop hover lift has to be folded into the
  // same inline transform rather than relying on CSS :hover.
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mirrors isTouching in a ref too — the scroll listener's closure below is
  // set up once (deps: [items]) rather than re-subscribing on every touch
  // start/end, so it needs a ref to read the live value instead of a stale
  // one captured at mount.
  const isTouchingRef = useRef(false);
  const liveTouchRafRef = useRef<number | null>(null);
  const liveNearestRef = useRef<number | null>(null);
  // Each card's offset within the scrollable track, cached once (cards don't
  // move relative to each other — only the whole track scrolls), so the
  // live path never needs a per-card getBoundingClientRect() call, just
  // this fixed offset minus el.scrollLeft. scrollLeft is the browser's own
  // authoritative, always-current scroll position — reading it directly
  // sidesteps both problems the earlier attempts ran into: computing from
  // getBoundingClientRect() every frame (correct but was lagging behind a
  // fast native flick) and computing from raw finger delta (fast, but wrong
  // whenever native scroll applied any resistance/edge behavior the model
  // didn't account for, which broke the slow-drag case that used to work).
  const cardOffsetsRef = useRef<number[]>([]);
  const [isTouching, setIsTouching] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Desktop drag state. Position is tracked as a plain translateX offset
  // (<= 0, more negative reveals cards further right) applied directly to
  // the DOM node via a ref rather than React state, so drag frames never
  // wait on a render. The section's left padding follows the same drag 1:1
  // (collapsing toward full-bleed as you pull left) rather than transitioning
  // on a timer, so the width change tracks the cursor exactly like the
  // cards do. It only eases back (via a CSS transition, drag released) once
  // translateX has returned all the way to 0.
  const translateRef = useRef(0);
  const padRest = useRef(0);
  const collapseDistance = 160; // px of drag needed to fully reach full-bleed
  const dragEase = 0.6; // <1 softens the drag so it doesn't track the cursor 1:1
  const dragRef = useRef<{ startX: number; startTranslate: number; dragging: boolean; moved: boolean } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Liquid entrance: cards cascade in left to right with the same blur+scale
  // dissolve as the hero, rather than popping in as one flat block with the
  // section's own .rise fade. Gated on the section actually scrolling into
  // view, same trigger point as .rise elsewhere.
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        requestAnimationFrame(() => setRevealed(true));
      },
      { threshold: 0.06, rootMargin: "0px 0px -32px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const measure = () => setIsDesktop(window.innerWidth >= 640);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Mobile only: whichever card sits nearest the track's center gets the
  // "active" hover-style treatment (scale + shadow), so it applies whether
  // you got there by touch, drag, or the arrow buttons — not just touch
  // events on that specific card. This drives the settled/at-rest state via
  // React (activeIndex), which the CSS transition eases into smoothly.
  const updateActiveCard = () => {
    if (window.innerWidth >= 640) { setActiveIndex(null); return; }
    const el = scrollRef.current;
    const cards = cardRefs.current;
    if (!el) return;
    const trackRect = el.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let nearest: number | null = null;
    let nearestDist = Infinity;
    cards.forEach((card, i) => {
      if (!card) return;
      const r = card.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - center);
      if (dist < nearestDist) { nearestDist = dist; nearest = i; }
    });
    setActiveIndex(nearest);
  };

  // Caches each card's position within the scrollable content (left edge
  // relative to the track's own coordinate space, i.e. independent of the
  // current scroll position) — cards don't move relative to each other, so
  // this only needs recomputing when the item list or layout changes, not
  // on every frame of a gesture.
  const measureCardOffsets = () => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    cardOffsetsRef.current = cardRefs.current.map((card) => {
      if (!card) return 0;
      return card.getBoundingClientRect().left - el.getBoundingClientRect().left + scrollLeft;
    });
  };

  // While actively swiping, each card's scale/lift is a continuous function
  // of its own live distance from the track's center — not a binary flip
  // once some threshold is crossed — so the outgoing card visibly shrinks
  // and the incoming one visibly grows in lockstep with the finger, the
  // whole way between them. Written straight to each card's DOM node
  // (bypassing React state) so there's no render latency between the
  // finger's position this frame and what's painted.
  //
  // Driven off el.scrollLeft — the browser's own authoritative, always-
  // current scroll position — rather than re-querying getBoundingClientRect()
  // per card every frame (correct, but reads as laggy since that query
  // reflects wherever the DOM happened to have last painted) or the raw
  // finger position (fast, but the touch-to-scroll relationship isn't
  // guaranteed 1:1 once native resistance/edge behavior kicks in). Combined
  // with the cached per-card offsets above, this is just arithmetic — no
  // DOM reads at all in the hot path.
  const applyLiveCardScale = () => {
    const el = scrollRef.current;
    const cards = cardRefs.current;
    const offsets = cardOffsetsRef.current;
    if (!el || offsets.length === 0) return;
    const scrollLeft = el.scrollLeft;
    const viewportCenter = el.clientWidth / 2;
    const slot = cards[0]?.getBoundingClientRect().width ?? 300;
    let nearest: number | null = null;
    let nearestDist = Infinity;
    cards.forEach((card, i) => {
      if (!card) return;
      const cardCenter = (offsets[i] ?? 0) - scrollLeft + (card.clientWidth / 2);
      const dist = Math.abs(cardCenter - viewportCenter);
      if (dist < nearestDist) { nearestDist = dist; nearest = i; }
      const proximity = Math.max(0, 1 - dist / slot);
      const scale = 1 + 0.05 * proximity;
      const translateY = 6 - 12 * proximity; // +6px inactive -> -6px active
      card.style.transform = `translateY(${translateY}px) scale(${scale})`;
      card.style.boxShadow = proximity > 0.01 ? `0 ${2 * proximity}px ${8 * proximity}px 0px rgba(0,0,0,${0.07 * proximity})` : "none";
    });
    liveNearestRef.current = nearest;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let liveRaf: number | null = null;
    const onScroll = () => {
      // Live-scale for as long as the position is actually changing —
      // including the momentum/deceleration phase after a quick flick,
      // where the finger has already lifted (isTouchingRef is false) but
      // the browser is still animating the scroll on its own. Gating this
      // on isTouchingRef meant a fast swipe produced zero visible scaling
      // during that glide — momentum scroll events landed in the settle-
      // only branch below and just sat there until scrolling fully stopped,
      // which read as "nothing happens until it's already on the next
      // card." isTouching (the state, driving the fast/no-transition CSS
      // below) is kept true through this whole active-scroll window too,
      // for the same reason — it only flips back once the settle timer
      // actually fires, meaning scrolling has genuinely stopped.
      setIsTouching(true);
      if (liveRaf === null) {
        liveRaf = requestAnimationFrame(() => {
          liveRaf = null;
          applyLiveCardScale();
        });
      }
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(() => {
        setIsTouching(false);
        updateActiveCard();
      }, 20);
    };
    updateActiveCard();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      if (liveRaf !== null) cancelAnimationFrame(liveRaf);
    };
  }, [items]);

  // Desktop drag-to-reveal: rather than native overflow scrolling, the track
  // is positioned with a plain translateX. The section's left padding is a
  // pure function of that same translateX (interpolated from its aligned
  // resting value down to full-bleed over `collapseDistance` px), so the
  // width change tracks the drag 1:1 in both directions instead of easing
  // in on a timer — it only transitions once the drag ends and the padding
  // needs to ease the rest of the way back to aligned.
  const trackMinTranslate = () => {
    const track = trackRef.current;
    const viewport = scrollRef.current;
    if (!track || !viewport) return 0;
    // A little extra slack past where the last card's trailing edge would
    // naturally land, so dragging all the way to the end lets it keep
    // sliding a bit further inward instead of stopping dead right at the
    // content's actual boundary.
    const overdrag = 200;
    return Math.min(0, viewport.clientWidth - track.scrollWidth - overdrag);
  };

  const applyPadForTranslate = (x: number) => {
    const pad = padRef.current;
    if (!pad) return;
    const t = Math.max(0, Math.min(1, -x / collapseDistance));
    pad.style.paddingLeft = `${padRest.current + (6 - padRest.current) * t}px`;
  };

  const onPointerDownDrag = (e: React.PointerEvent) => {
    if (!isDesktop || e.button !== 0) return;
    const viewport = scrollRef.current;
    if (!viewport) return;
    // Only arm the gesture here — don't touch isDragging/isExpanded, the
    // padding, or pointer capture yet. A plain click is a pointerdown with
    // no movement at all, and flipping those on every down (even one that
    // never becomes a real drag) was visibly bouncing the padding/cards out
    // and back on every single card click. Capturing the pointer here was
    // worse: browsers can fail to dispatch the resulting click event to the
    // original target (a card's <Link>) once an ancestor has taken pointer
    // capture, even if the capture only lasted a few milliseconds — which
    // is exactly why cards stopped being clickable. All of this now only
    // happens once real movement is confirmed, in onPointerMoveDrag below.
    dragRef.current = { startX: e.clientX, startTranslate: translateRef.current, dragging: true, moved: false };
  };
  const onPointerMoveDrag = (e: React.PointerEvent) => {
    const d = dragRef.current;
    const track = trackRef.current;
    const pad = padRef.current;
    const viewport = scrollRef.current;
    if (!d?.dragging || !track || !pad) return;
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) <= 3) return;
      d.moved = true;
      e.preventDefault();
      viewport?.setPointerCapture(e.pointerId);
      // First confirmed movement — now it's a real drag. Pin the padding to
      // its current rendered value before flipping state, same reasoning as
      // before: isDragging/isExpanded swap the wrapper's class to its
      // collapsed variant instantly, and without anchoring the inline style
      // to today's real value first, that class swap alone would snap the
      // padding to full-bleed the moment the drag is confirmed.
      const currentPad = parseFloat(getComputedStyle(pad).paddingLeft) || 0;
      pad.style.paddingLeft = `${currentPad}px`;
      if (translateRef.current === 0) padRest.current = currentPad;
      setIsDragging(true);
      setIsExpanded(true);
    } else {
      e.preventDefault();
    }
    // Hard-clamped to the actual bounds — no rubber-band overshoot. Dragging
    // past either end just stops there, same as every other position in the
    // carousel stays exactly where you leave it, with nothing left to glide
    // or bounce back from on release.
    const min = trackMinTranslate();
    const next = Math.max(min, Math.min(0, d.startTranslate + dx * dragEase));
    translateRef.current = next;
    track.style.transform = `translateX(${next}px)`;
    applyPadForTranslate(next);
  };
  const endDragDesktop = (e: React.PointerEvent) => {
    const d = dragRef.current;
    const viewport = scrollRef.current;
    const pad = padRef.current;
    dragRef.current = null;
    // A plain click never crossed the movement threshold, so isDragging/
    // isExpanded/padding were never touched — nothing to unwind, and
    // releasing the pointer capture (if any was actually set) is all that's
    // needed before letting the click proceed normally.
    if (!d?.moved) {
      if (viewport?.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
      return;
    }
    setIsDragging(false);
    // Only ease the padding all the way back to aligned once you've dragged
    // back to the very first card — anywhere past that, it settles at
    // full-bleed. Either way, the padding was tracking the drag fluidly
    // (partially collapsed, not just 0%/100%) right up until release, so
    // clearing the inline value immediately and handing off to the CSS
    // class snapped it straight to that class's binary target — a real jump
    // whenever release happened at a partial value, which is exactly the
    // first few cards' region (past that, the drag has already fully
    // collapsed the padding, so there was nothing left to jump). Instead,
    // animate the inline value the rest of the way to its resting target,
    // then hand off to the class only once they already match.
    const nextExpanded = translateRef.current < 0;
    if (pad) {
      const from = parseFloat(pad.style.paddingLeft) || padRest.current;
      const to = nextExpanded ? 6 : padRest.current;
      if (Math.abs(to - from) > 0.5) {
        const startTime = performance.now();
        const duration = 450;
        const stepPad = (now: number) => {
          const t = Math.min(1, (now - startTime) / duration);
          pad.style.paddingLeft = `${from + (to - from) * easeInOutCubic(t)}px`;
          if (t < 1) requestAnimationFrame(stepPad);
          else pad.style.paddingLeft = "";
        };
        requestAnimationFrame(stepPad);
      } else {
        pad.style.paddingLeft = "";
      }
    }
    setIsExpanded(nextExpanded);
    if (viewport?.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
  };

  // While the section's padding eases back to its resting (aligned) value —
  // which only happens once translateX has returned to 0 — the viewport's
  // width doesn't actually change here (translateX is already 0, so there's
  // nothing to re-clamp). This still guards against the general case of the
  // viewport resizing (e.g. window resize) while settled at the aligned width.
  useEffect(() => {
    if (isDragging || isExpanded || !isDesktop) return;
    const track = trackRef.current;
    if (!track) return;
    let raf: number;
    const clampDuringReturn = () => {
      const min = trackMinTranslate();
      if (translateRef.current < min) {
        translateRef.current = min;
        track.style.transform = `translateX(${min}px)`;
      }
      raf = requestAnimationFrame(clampDuringReturn);
    };
    raf = requestAnimationFrame(clampDuringReturn);
    const stop = setTimeout(() => cancelAnimationFrame(raf), 350);
    return () => { cancelAnimationFrame(raf); clearTimeout(stop); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, isExpanded, isDesktop]);

  // On mobile, the track's own CSS scroll-snap (snap-x snap-mandatory +
  // snap-center per card) handles the actual snapping natively — most
  // mobile browsers apply that snap tension live, during the drag itself,
  // which reads as a fluid magnetic pull toward the nearest card rather
  // than a free scroll that only corrects itself after you let go. All
  // that's needed here is tracking whether a finger is down, to pick the
  // fast/live vs. slow/settled transition speed on the active card's scale.
  const onTouchStart = () => {
    if (window.innerWidth >= 640) return;
    measureCardOffsets();
    isTouchingRef.current = true;
    setIsTouching(true);
  };
  // Some mobile browsers throttle/coalesce the `scroll` event during a
  // touch-driven drag rather than firing it every frame, so relying on it
  // alone left the active-card update visibly lagging behind the finger
  // instead of tracking it live. touchmove fires reliably on the actual
  // gesture regardless of scroll-event throttling, so it drives the same
  // rAF-throttled update independent of whether a scroll event happened to
  // land this frame.
  const onTouchMove = () => {
    if (!isTouchingRef.current || liveTouchRafRef.current !== null) return;
    liveTouchRafRef.current = requestAnimationFrame(() => {
      liveTouchRafRef.current = null;
      applyLiveCardScale();
    });
  };
  const onTouchEnd = () => {
    // Only clears the finger-is-down flag that gates touchmove's own
    // scheduling — NOT the isTouching state that drives the fast/no-
    // transition CSS. That one stays true through any momentum scrolling
    // that continues after the finger lifts (owned by the scroll listener's
    // settle timer above), otherwise it would flip back to the slow eased
    // transition right as momentum begins, which is the same "laggy during
    // the glide" problem this was meant to fix.
    isTouchingRef.current = false;
    // The live scale already knows exactly which card is nearest as of the
    // last frame — hand that straight to React so the settle transition
    // starts from the same place the live phase left off, rather than
    // waiting on the debounced re-measurement (which re-derives the same
    // answer a beat later, reading as a pause before the "final" snap).
    // Momentum scrolling after this (if any) will keep correcting it live.
    if (liveNearestRef.current !== null) setActiveIndex(liveNearestRef.current);
  };

  if (items.length === 0) return null;

  return (
    <section ref={sectionRef} className="w-[100vw] ml-[calc(50%-50vw)] sm:mr-[calc(50%-50vw)]">
      <div
        ref={padRef}
        className={`px-1.5 sm:pr-0 ${isDragging ? "" : "sm:transition-[padding-left] sm:duration-300 sm:ease-out"} ${isDragging || isExpanded ? "sm:pl-1.5" : "sm:pl-[calc(50vw-384px)]"}`}
      >
      <div className="relative">
        <div
          ref={scrollRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onPointerDown={onPointerDownDrag}
          onPointerMove={onPointerMoveDrag}
          onPointerUp={endDragDesktop}
          onPointerCancel={endDragDesktop}
          className={`overflow-x-auto sm:overflow-x-hidden touch-pan-x touch-pan-y snap-x snap-mandatory sm:snap-none scroll-smooth py-6 sm:pb-10 sm:-ml-5 sm:pl-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]${isDragging ? " select-none" : ""}`}
          style={{ cursor: isDragging ? "grabbing" : undefined }}
        >
          <div
            ref={trackRef}
            className="flex items-start gap-5 sm:gap-4 sm:w-max"
            style={isDesktop ? { transform: `translateX(${translateRef.current}px)` } : undefined}
          >
            <div className="shrink-0 sm:hidden" style={{ width: 6 }} aria-hidden="true" />
            {items.map((item, i) => (
              <div
                key={item.slug}
                className="shrink-0 flex flex-col gap-3 sm:w-[420px]"
                style={{
                  willChange: "opacity, transform, filter",
                  opacity: revealed ? 1 : 0,
                  transform: revealed ? "scale(1)" : "scale(0.992)",
                  filter: revealed ? "blur(0px)" : "blur(10px)",
                  transition: revealed
                    ? `opacity 780ms cubic-bezier(0.22,0.61,0.36,1) ${i * 90}ms, transform 780ms cubic-bezier(0.22,0.61,0.36,1) ${i * 90}ms, filter 780ms cubic-bezier(0.22,0.61,0.36,1) ${i * 90}ms`
                    : "none",
                }}
              >
                <Link
                  ref={(el) => { cardRefs.current[i] = el; }}
                  href="/work"
                  draggable={false}
                  onClick={(e) => { if (dragRef.current?.moved) e.preventDefault(); }}
                  className="relative block shrink-0 snap-center sm:snap-align-none rounded-lg overflow-hidden group w-[300px] sm:w-[420px] sm:cursor-grab"
                  style={{
                    aspectRatio: "4 / 5",
                    // While actively swiping, applyLiveCardScale writes
                    // transform/boxShadow straight to the DOM every frame —
                    // a CSS transition here would keep trying to animate
                    // between each of those rapid targets and never catch
                    // up, reading as laggy instead of tracking the finger
                    // 1:1. It only applies once the finger lifts, easing
                    // from wherever the live phase left off to the single
                    // settled state (activeIndex) below.
                    transition: isTouching
                      ? "none"
                      : "transform 750ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 750ms cubic-bezier(0.4,0,0.2,1)",
                    // Mobile settled state (activeIndex) and desktop hover
                    // (hoveredIndex) both drive the lift via this one inline
                    // transform, since an inline transform overrides a CSS
                    // :hover scale class.
                    transform: activeIndex === i
                      ? "translateY(-6px) scale(1.05)"
                      : activeIndex !== null
                        ? "translateY(6px) scale(1)"
                        : hoveredIndex === i
                          ? "translateY(-4px) scale(1.02)"
                          : "translateY(0) scale(1)",
                    ...(activeIndex === i ? { boxShadow: "0 2px 8px 0px rgba(0,0,0,0.07)" } : {}),
                  }}
                  onMouseEnter={() => { setHoveredIndex(i); }}
                  onMouseLeave={() => { setHoveredIndex((prev) => (prev === i ? null : prev)); }}
                >
                  <>
                    <div className="absolute inset-0" style={{ backgroundColor: CLIENT_CARD_BG }} />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                        backgroundSize: "180px 180px",
                        mixBlendMode: "overlay",
                        opacity: 0.35,
                      }}
                    />
                  </>
                  {item.logo ? (
                    <div
                      className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none"
                      role="img"
                      aria-label={item.client}
                    >
                      <span
                        className="block"
                        style={{
                          width: carouselLogoStyle(item.slug).width,
                          aspectRatio: "180 / 180",
                          backgroundColor:
                            CLIENT_LOGO_TINT[item.slug] ?? CLIENT_LOGO_TINT_DEFAULT,
                          WebkitMaskImage: `url(${item.logo})`,
                          maskImage: `url(${item.logo})`,
                          WebkitMaskRepeat: "no-repeat",
                          maskRepeat: "no-repeat",
                          WebkitMaskPosition: "center",
                          maskPosition: "center",
                          WebkitMaskSize: "contain",
                          maskSize: "contain",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                      <p
                        className="text-[22px] sm:text-[26px] font-medium tracking-tight text-center leading-tight"
                        style={{ color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}
                      >
                        {item.client}
                      </p>
                    </div>
                  )}
                </Link>
                <div className="flex flex-col gap-1.5 w-[300px] sm:w-[420px]">
                  <Link
                    href="/work"
                    draggable={false}
                    onClick={(e) => { if (dragRef.current?.moved) e.preventDefault(); }}
                    className="flex items-center justify-between gap-2 pt-3 sm:pt-0 group/cta"
                  >
                    <p className="text-[18px] tracking-tight" style={{ color: "rgb(var(--fg))" }}>{item.client}</p>
                    <span
                      className="flex items-center justify-center w-7 h-7 sm:w-6 sm:h-6 rounded-full shrink-0"
                      style={{ background: "rgb(var(--fg) / 0.06)" }}
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 sm:w-3 sm:h-3 shrink-0 transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" style={{ color: "rgb(var(--muted))" }}>
                        <line x1="4" y1="12" x2="12" y2="4" /><polyline points="5 4 12 4 12 11" />
                      </svg>
                    </span>
                  </Link>
                  {item.blurb && (
                    <p
                      className="max-w-[85%] sm:max-w-[75%] text-[15px] sm:text-[16px] leading-snug tracking-[-0.035em] w-full"
                      style={{ color: "rgb(var(--muted))" }}
                    >
                      {item.blurb}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>

    </section>
  );
}

function formatPostDate(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  // Front-matter dates are calendar days parsed as UTC midnight, so format in
  // UTC or they slip back a day west of Greenwich (and mismatch on hydrate).
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[clamp(0.7rem,1.6vw,0.8rem)] leading-snug tracking-tight"
      style={{
        color: "#5c5c5c",
        background: "rgba(26,26,26,0.04)",
        boxShadow: "inset 0 1px 2px rgba(26,26,26,0.05), inset 0 0 0 1px rgba(26,26,26,0.08)",
      }}
    >
      {tag}
    </span>
  );
}

function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 8h10" />
      <path d="M9 4l4 4-4 4" />
    </svg>
  );
}

// Newest essay leads as a quote card, the rest follow as a numbered index.
function BlogCarousel({ posts }: { posts: PostMeta[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        requestAnimationFrame(() => setRevealed(true));
      },
      { threshold: 0.06, rootMargin: "0px 0px -32px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (posts.length === 0) return null;
  const [featured, ...rest] = posts;

  const rowReveal = (i: number): React.CSSProperties => ({
    willChange: "opacity, transform, filter",
    opacity: revealed ? 1 : 0,
    transform: revealed ? "translateY(0)" : "translateY(6px)",
    filter: revealed ? "blur(0px)" : "blur(8px)",
    transition: revealed
      ? `opacity 680ms cubic-bezier(0.22,0.61,0.36,1) ${i * 70}ms, transform 680ms cubic-bezier(0.22,0.61,0.36,1) ${i * 70}ms, filter 680ms cubic-bezier(0.22,0.61,0.36,1) ${i * 70}ms`
      : "none",
  });

  return (
    <section ref={sectionRef} className="w-full max-w-[80rem] mx-auto px-6 sm:px-8">
      <div className="max-w-3xl sm:mx-auto">
        <header
          className="mb-8 sm:mb-10 text-center"
          style={rowReveal(0)}
        >
          <h2>
            <span
              className="inline-block rounded-[6px] px-3 py-1 text-[clamp(1.35rem,3.2vw,2.05rem)] font-normal tracking-[-0.025em] leading-tight text-white"
              style={{ background: "#1a1a1a" }}
            >
              Our thoughts
            </span>
          </h2>
        </header>

        <div style={rowReveal(1)}>
          <Link
            href={`/blog/${featured.slug}`}
            className="group block rounded-[6px] px-5 sm:px-8 py-6 sm:py-8 transition-colors duration-200 hover:bg-[rgba(26,26,26,0.05)]"
            style={{
              background: "rgba(26,26,26,0.03)",
              boxShadow: "inset 0 0 0 1px rgba(26,26,26,0.07)",
            }}
          >
            <div
              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[clamp(0.75rem,1.8vw,0.875rem)] tracking-tight"
              style={{ color: "#8a8a8a" }}
            >
              {featured.tag && <TagPill tag={featured.tag} />}
              <span>{formatPostDate(featured.date)}</span>
              <span aria-hidden>·</span>
              <span>{featured.readMinutes} min read</span>
            </div>
            <p
              className="mt-4 text-[clamp(1.35rem,3.6vw,2rem)] tracking-[-0.03em] leading-[1.15] text-pretty"
              style={{ color: "#1a1a1a" }}
            >
              {featured.title}
            </p>
            {featured.excerpt && (
              <p
                className="mt-4 pl-4 text-[clamp(0.95rem,2.2vw,1.125rem)] leading-relaxed tracking-tight text-pretty"
                style={{ color: "#5c5c5c", borderLeft: "2px solid rgba(26,26,26,0.12)" }}
              >
                {featured.excerpt}
              </p>
            )}
            <span
              className="mt-6 inline-flex items-center gap-1.5 text-[clamp(0.875rem,2vw,1rem)] tracking-tight"
              style={{ color: "#1a1a1a" }}
            >
              Read essay
              <ArrowGlyph className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>

        {rest.length > 0 && (
          <ol className="mt-4 sm:mt-6">
            {rest.map((post, i) => (
              <li
                key={post.slug}
                style={{ ...rowReveal(i + 2), borderTop: "1px solid rgba(26,26,26,0.08)" }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[2.5rem_1fr_7rem_4rem] items-baseline gap-x-3 px-2 sm:px-3 py-4 sm:py-5 rounded-[6px] transition-colors duration-200 hover:bg-[rgba(26,26,26,0.03)]"
                >
                  <span
                    className="text-[clamp(0.8rem,1.8vw,0.9rem)] tabular-nums tracking-tight"
                    style={{ color: "#a3a3a3" }}
                  >
                    {String(i + 2).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span
                      className="block text-[clamp(1rem,2.4vw,1.2rem)] tracking-[-0.025em] leading-snug text-pretty"
                      style={{ color: "#1a1a1a" }}
                    >
                      {post.title}
                    </span>
                    {post.tag && (
                      <span
                        className="sm:hidden mt-1 block text-[0.8rem] tracking-tight"
                        style={{ color: "#8a8a8a" }}
                      >
                        {post.tag}
                      </span>
                    )}
                  </span>
                  <span
                    className="hidden sm:block text-[0.875rem] tracking-tight"
                    style={{ color: "#8a8a8a" }}
                  >
                    {post.tag}
                  </span>
                  <span
                    className="text-right text-[clamp(0.8rem,1.8vw,0.875rem)] tabular-nums tracking-tight whitespace-nowrap"
                    style={{ color: "#8a8a8a" }}
                  >
                    {formatPostDate(post.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}

        <div
          className="pt-4 text-center"
          style={{ ...rowReveal(rest.length + 2), borderTop: "1px solid rgba(26,26,26,0.08)" }}
        >
          <Link
            href="/blog"
            className="group inline-flex items-center gap-1.5 text-[clamp(0.875rem,2vw,1rem)] tracking-tight transition-colors duration-200 hover:text-[#1a1a1a]"
            style={{ color: "#5c5c5c" }}
          >
            All essays
            <ArrowGlyph className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Dashed trunk-and-branches connector from the hero's CTA down to the intro
// paragraph below it: a single vertical line drops from the CTA to a split
// point just above the paragraph, then 2 outer arms curve away from that
// same point to 2 of 3 evenly-spaced x-positions across the paragraph's
// width (the center position is just the trunk's own straight end). The
// whole shape — trunk + both arms — draws in as one single ConnectorPath
// once the CTA's own entrance transition finishes. The vertical gap and the
// paragraph's width
// aren't fixed — the hero's own bottom padding differs mobile/desktop and
// the paragraph reflows with viewport/copy — so this measures both
// elements' actual position rather than assuming a distance. Coordinates
// are relative to this component's own positioned container (measured via
// containerRef): it renders as an absolutely-positioned child of <main>, so
// its own top/left have to be subtracted rather than assuming main sits at
// the document origin.
function HeroToIntroLine({
  fromRef,
  toRef,
}: {
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<{
    trunkTop: number;
    splitY: number;
    trunkX: number;
    armEndY: number;
    armTargets: number[];
    width: number;
    height: number;
  } | null>(null);
  // Gates the draw-in animation. Starts false so the connector's first paint
  // is fully undrawn, then flips once the CTA's own liquid reveal transition
  // (see VercelHero's fade()) actually finishes — listening for that
  // transitionend rather than guessing a matching delay keeps this in sync
  // even if the hero's own timing changes later.
  const [drawn, setDrawn] = useState(false);
  // Mirrors `drawn` for the measurement effect's long-lived poll loop below,
  // which reads it every frame — a plain closure over the state variable
  // would only ever see the value from when that effect last ran (mount),
  // since drawn isn't (and shouldn't be) one of its own effect dependencies.
  const drawnRef = useRef(false);

  useEffect(() => {
    const cta = fromRef.current;
    if (!cta) return;
    const onDone = (e: TransitionEvent) => {
      if (e.propertyName === "opacity") { drawnRef.current = true; setDrawn(true); }
    };
    cta.addEventListener("transitionend", onDone);
    return () => cta.removeEventListener("transitionend", onDone);
  }, [fromRef]);

  useEffect(() => {
    // Tracks the last two committed heights so polling can stop once the
    // measurement has genuinely settled (two matching frames in a row) AND
    // the CTA's own entrance transition has actually finished (`drawn`) —
    // stability alone isn't enough, since two frames read back-to-back while
    // the CTA sits mid-transition (or hasn't started animating yet) can look
    // "stable" for a tick without being its true resting position. Without
    // waiting on `drawn` too, the trunk could lock onto the CTA's pre-
    // animation position and only ever correct itself on the next resize.
    let lastHeight: number | null = null;
    let stableFrames = 0;

    const measure = () => {
      const from = fromRef.current;
      const to = toRef.current;
      const container = containerRef.current;
      if (!from || !to || !container) return;
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      // Guard against a frame caught mid-layout (zero-size rects, e.g. before
      // the element has painted, or between LightCard's own transform
      // mutations): skip committing this frame rather than drawing off a
      // nonsensical measurement, and let the next rAF tick try again.
      if (fromRect.width === 0 || fromRect.height === 0 || toRect.width === 0 || toRect.height === 0) {
        stableFrames = 0;
        return;
      }
      const trunkTop = fromRect.bottom - containerRect.top;
      const trunkX = fromRect.left + fromRect.width / 2 - containerRect.left;
      // A few px of clearance above the paragraph's true top rather than
      // landing exactly on it — right on the edge, the stroke's own width
      // could still visually touch the first line of text.
      const armEndY = toRect.top - containerRect.top - 4;
      const paraLeft = toRect.left - containerRect.left;
      // The paragraph must sit below the CTA for this to make sense at all;
      // during the CTA's own liquid reveal it's briefly offset, which could
      // otherwise transiently invert this.
      if (armEndY <= trunkTop) { stableFrames = 0; return; }
      // Split point sits a fraction of the CTA-to-paragraph gap above the
      // paragraph (clamped to a sane range), rather than a fixed pixel
      // distance: a fixed offset either clamped away to nothing on a short
      // mobile gap (leaving the split sitting right at the CTA with no room
      // for the arms to fan out before turning) or sat too close to the
      // paragraph on a tall desktop gap. Scaling with the gap keeps the split
      // sitting a consistent, proportionally higher point in the middle of it
      // at any gap size.
      const gap = armEndY - trunkTop;
      const ARM_RISE = Math.min(60, Math.max(20, gap * 0.45));
      const splitY = Math.max(trunkTop, armEndY - ARM_RISE);
      // 3 arms land at even fifths across the paragraph's width (1/5, 1/2,
      // 4/5) rather than sixths, pulling the outer two in a bit further from
      // the paragraph's actual left/right edges — at 1/6 and 5/6 the right
      // arm in particular landed close enough to the edge that its final
      // vertical drop visually crossed into the paragraph's own text instead
      // of clearing it.
      const armTargets = [1 / 5, 1 / 2, 4 / 5].map((f) => paraLeft + toRect.width * f);
      const height = Math.max(splitY, armEndY) + 1;
      // Only commit once the same height has been read on back-to-back
      // frames — a single matching frame could still be a coincidence mid
      // transition, two in a row is a real settle.
      if (lastHeight !== null && Math.abs(height - lastHeight) < 0.5) {
        stableFrames++;
      } else {
        stableFrames = 0;
      }
      lastHeight = height;
      setGeo({ trunkTop, splitY, trunkX, armEndY, armTargets, width: containerRect.width, height });
    };
    // Only a WIDTH change (real device rotation or a breakpoint change)
    // should trigger a re-measure — a height-only change is almost always a
    // mobile browser's toolbar/address bar collapsing or expanding on
    // scroll, not a real layout change worth reacting to. The hero uses
    // 100dvh, so that toolbar move does genuinely shift its real height and
    // the paragraph's position along with it, but redrawing the connector to
    // track that made it visibly slide down and overlap the paragraph while
    // scrolling, then slide back on scrolling the other way — exactly the
    // kind of viewport-chrome noise the line should just ignore and stay put
    // through instead.
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      stableFrames = 0;
      measure();
    };
    measure();
    window.addEventListener("resize", onResize);
    // The CTA only reaches its resting position once the hero's own
    // IntersectionObserver-driven entrance (opacity/translateY transition)
    // finishes, which can land well after this component's first mount, and
    // LightCard mutates the shared ancestor's transform on its own scroll-
    // driven rAF loop independent of this one. Polling until two consecutive
    // frames agree (capped at 4s so a genuinely never-settling layout doesn't
    // spin forever) rides out both instead of trusting a single early read.
    let raf = 0;
    const start = performance.now();
    const poll = (now: number) => {
      measure();
      const settled = stableFrames >= 2 && drawnRef.current;
      if (!settled && now - start < 4000) raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [fromRef, toRef]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {geo && geo.splitY > geo.trunkTop && (
        <svg
          className="absolute top-0 left-0 overflow-visible"
          width={geo.width}
          height={geo.height}
          style={{ color: "rgb(var(--muted))" }}
        >
          {/* One single path: trunk straight down from the CTA to the split
              point, then both outer arms curving away from that same split
              point down to the paragraph — the center trunk IS the shared
              start of both curves rather than a separate line the arms
              happen to sit next to. Built as one `d` string (with `M` moves
              back to the split point between arms) so the whole shape shares
              one stroke-dasharray and one grow-in animation. */}
          <ConnectorPath geo={geo} drawn={drawn} />
        </svg>
      )}
    </div>
  );
}

// Builds one arm's sub-path — down from the split point, rounded corner,
// across, rounded corner, down to the paragraph — as a string of path
// commands to be appended after an `M` back to the split point. Shared by
// ConnectorPath for both the left and right arm.
function elbowSubpath(trunkX: number, splitY: number, turnY: number, armX: number, armEndY: number): string {
  const dir = armX > trunkX ? 1 : -1;
  const vertLeg1 = turnY - splitY;
  const vertLeg2 = armEndY - turnY;
  const horizLeg = Math.abs(armX - trunkX);
  const radius = Math.max(0, Math.min(14, vertLeg1 * 0.9, vertLeg2 * 0.9, horizLeg * 0.4));

  const c1StartY = turnY - radius;
  const c1EndX = trunkX + dir * radius;
  const c2StartX = armX - dir * radius;
  const c2EndY = turnY + radius;

  const sweep1 = dir > 0 ? 0 : 1;
  const sweep2 = dir > 0 ? 1 : 0;

  return (
    `L ${trunkX} ${c1StartY} ` +
    `A ${radius} ${radius} 0 0 ${sweep1} ${c1EndX} ${turnY} ` +
    `L ${c2StartX} ${turnY} ` +
    `A ${radius} ${radius} 0 0 ${sweep2} ${armX} ${c2EndY} ` +
    `L ${armX} ${armEndY}`
  );
}

// The whole connector — trunk straight down from the CTA to the split point,
// then both outer arms curving away from that SAME split point — as one
// single SVG path rather than a trunk line plus two separate arm paths that
// only visually happened to share a start point. Built as one `d` string:
// trunk down, then an `M` back to the split point before each arm's own
// curve+drop. A single path means a single stroke-dasharray and a single
// stroke-dashoffset grow-in animation for the ENTIRE shape — the trunk and
// both arms all draw in together as one continuous stroke, rather than the
// trunk and each arm being independently-timed pieces that could drift out
// of sync or read as separate lines.
function ConnectorPath({
  geo,
  drawn,
}: {
  geo: { trunkTop: number; splitY: number; trunkX: number; armEndY: number; armTargets: number[] };
  drawn: boolean;
}) {
  const { trunkTop, splitY, trunkX, armEndY, armTargets } = geo;
  const turnY = splitY + (armEndY - splitY) * 0.2;

  let d = `M ${trunkX} ${trunkTop} L ${trunkX} ${splitY}`;
  armTargets.forEach((x, i) => {
    // Middle target (index 1) is the trunk's own end — already drawn above,
    // nothing more to add there. See the caller for why index (not value)
    // is what's checked.
    if (i === 1) return;
    d += ` M ${trunkX} ${splitY} ${elbowSubpath(trunkX, splitY, turnY, x, armEndY)}`;
  });

  return <ArcGrowSegment d={d} drawn={drawn} delayMs={0} />;
}

// An arbitrary SVG path (straight and/or curved segments combined) that
// grows in as one continuous stroke via stroke-dashoffset over its own
// measured total length. Used for ConnectorPath's whole trunk+arms shape as
// a single path, rather than separate elements stitched together to look
// like one line.
function ArcGrowSegment({ d, drawn, delayMs }: { d: string; drawn: boolean; delayMs: number }) {
  const ref = useRef<SVGPathElement>(null);
  // Starts null rather than 0 — 0 is indistinguishable from "measured and
  // genuinely zero-length," so on the very first render (before the
  // useLayoutEffect below has run) strokeDashoffset would evaluate to
  // -length = -0 = 0, the SAME value as the fully-drawn (drawn=true) state.
  const [length, setLength] = useState<number | null>(null);
  // stroke-dashoffset alone never actually hides a path — with a small fixed
  // dasharray like "3 4", shifting the offset just cycles which pixels the
  // existing dashes land on; the dashes stay visible everywhere along the
  // path the whole time, which is why this read as "always visible"
  // regardless of `drawn`. The real grow-in trick needs the dash pattern
  // itself to be ONE dash the size of the entire path, paired with ONE gap
  // the same size — offsetting by -length then pushes that single dash
  // fully past the path's end (nothing on-path = fully hidden), and
  // animating the offset back to 0 sweeps it back on as one solid reveal.
  // Once that reveal finishes, swap to the real cosmetic "3 4" dasharray so
  // it reads as a dashed line at rest instead of a solid one.
  const [settled, setSettled] = useState(false);

  // useLayoutEffect (not useEffect) so the real length is measured and
  // committed BEFORE the browser paints the first frame — with useEffect,
  // that first paint briefly renders with length still null/unmeasured,
  // which is exactly the gap that let the path render fully visible before
  // it had a real length to animate its dashoffset from.
  useLayoutEffect(() => {
    if (ref.current) setLength(ref.current.getTotalLength());
  }, [d]);

  useEffect(() => {
    if (!drawn || length === null) { setSettled(false); return; }
    const t = setTimeout(() => setSettled(true), delayMs + 660);
    return () => clearTimeout(t);
  }, [drawn, length, delayMs]);

  const revealDasharray = length === null ? "0 0" : `${length} ${length}`;

  return (
    <path
      ref={ref}
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeDasharray={settled ? "3 4" : revealDasharray}
      style={{
        strokeDashoffset: length === null ? 0 : drawn ? 0 : -length,
        transition: length === null ? "none" : `stroke-dashoffset 640ms cubic-bezier(0.22,1,0.36,1) ${delayMs}ms`,
      }}
    />
  );
}

function VisualLayout({
  initialWork,
  initialPosts,
}: {
  initialWork: ClientCarouselItem[];
  initialPosts: PostMeta[];
}) {
  const [dashboardModalOpen, setDashboardModalOpen] = useState(false);
  const [accentColor, setAccentColor] = useState(WORK_ITEMS[0].accent);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  return (
    <>
    <DashboardModal open={dashboardModalOpen} onClose={() => setDashboardModalOpen(false)} />
    <main className="page-container relative mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] flex flex-col">
      <LightCard>
        <div className="mx-auto w-full max-w-[80rem] flex flex-col">
          <VercelHero accentColor={accentColor} ctaRef={ctaRef} />

          {/* Work thumbnail section (WorkScrollGallery) temporarily hidden
              while its format is still being decided. accentColor stays fed
              by WORK_ITEMS[0] via its initial state below, so the hero tint
              still has a value. Restore by uncommenting these two lines. */}
          {/* <div className="py-1 sm:py-0" />
          <WorkScrollGallery onActiveAccent={(c) => setAccentColor(c)} /> */}

          {/* The hero carries its own large bottom padding (pb-[18dvh]
              desktop / pb-[40dvh] mobile) meant to be reclaimed by whatever
              follows — the work gallery normally did that with its own
              negative top margin. With it hidden, pull DesignPhilosophy back
              up toward the hero, but not all the way — a full reclaim sat
              too close underneath it. */}
          <div className="py-10 sm:py-16 max-sm:-mt-[18dvh] sm:-mt-[7dvh]" />

          <DesignPhilosophy introRef={introRef} />

          <div className="py-16 sm:py-24" />

          <AiApproach posts={initialPosts} />

          <div className="py-16 sm:py-28" />
        </div>
      </LightCard>

      {/* Rendered after LightCard (not before) so it paints on top of the
          card's opaque white background rather than underneath it — same
          stacking context, sibling elements paint in DOM order. main is the
          positioned ancestor HeroToIntroLine measures itself against, so its
          coordinates stay correct regardless of where main sits on the page.
          Hidden for now — flip back on once the draw-in timing is right. */}
      {false && <HeroToIntroLine fromRef={ctaRef} toRef={introRef} />}

      <div className="homepage-dark-zone" style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", background: "rgb(var(--bg))", marginTop: -2 }}>
        <div className="mx-auto w-full max-w-[80rem] flex flex-col">
          <div className="py-6 sm:py-10" />

          <ServicesSection />

          <div className="py-16 sm:py-28" />

          <Questionnaire onStartConversation={() => setDashboardModalOpen(true)} />

          <div className="py-16 sm:py-24" />

          <ClientTypeList items={initialWork} onDark />

          <div className="py-24 sm:py-28" />
        </div>
      </div>

    </main>
    </>
  );
}
