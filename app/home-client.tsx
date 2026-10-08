"use client";

import React, { Fragment, useRef, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { FrameColumnRails, FrameRails, FrameRule } from "@/components/page-frame";
import { SELECTION_FRAME_COLOR } from "@/components/figma-frame";
import { HeroDragHeading } from "@/components/hero-drag-heading";
import { SectionHeading } from "@/components/section-heading";
import { WhatWeDoSketch } from "@/components/what-we-do-sketches";
import { HeroCanvas } from "@/components/hero-canvas";
import { MaterialCover } from "@/components/post-covers";
import { AgreementArt, FollowThroughArt, RestraintArt } from "@/components/execution-art";
import { SurfacingLine } from "@/components/surfacing-line";
import { useMounted } from "@/hooks/use-mounted";
import {
  AI_APPROACH,
  EXECUTION_INTRO,
  EXECUTION_PRINCIPLES,
  HERO_HEADING_LINES,
  HERO_HEADING_LINES_MOBILE,
  HERO_SUBLINE,
  HERO_SUBLINE_MOBILE,
  WHAT_WE_DO_ITEMS,
} from "@/lib/home-copy";
import type { AskUserQuestion, AskUserAnswer } from "@/components/ui/ask-user-questions";
import { InquirySteps } from "@/components/inquiry-steps";
import { ctaScaleHoverOnParent, ctaScaleHoverOnSelf } from "@/lib/cta-hover-motion";
import {
  ACTION_RADIUS_CLASS,
  CTA_FILL,
  CTA_INSET_SHADOW,
  CTA_OUTER_SHADOW,
  CTA_HEADER_PILL_CLASS,
  CTA_PILL_CLASS,
  CtaGrain,
} from "@/lib/cta-chrome";
import type { PostMeta as FullPostMeta } from "@/lib/posts";

// The fields of a post the homepage shows. app/page.tsx sends only these, so
// the rest of each post doesn't ride along in the page's HTML.
export type PostMeta = Pick<FullPostMeta, "slug" | "title" | "tag" | "excerpt">;

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

  // Fixed lines so the break is the same at every width and the lines stay
  // close in length. The words are draggable (see HeroDragHeading).
  // Two lines from sm up. Phones get the full sentence on four lines, sized
  // so the longest ("making websites people") fits a 360px screen.
  const HEADING_LINES = HERO_HEADING_LINES;
  const HEADING_LINES_MOBILE = HERO_HEADING_LINES_MOBILE;
  const HEADING_WORDS = HEADING_LINES.flat();
  const headingEnd = HERO_START + HEADING_WORDS.length * HERO_WORD_STEP;
  const ctaFadeDelay = headingEnd + 644;
  // The canvas comes in while the heading is still landing, about four words
  // in, so the hero reads as one fluid stagger rather than heading-then-art.
  const canvasDelay = HERO_START + HERO_WORD_STEP * 4;
  // Cloud pill waits until the CTA has actually finished landing —
  // ctaFadeDelay is only when that transition *starts*.
  const cloudDelay = ctaFadeDelay + HERO_LIQUID_MS;

  useEffect(() => {
    if (!visible) return;
    router.prefetch("/aether");
  }, [visible, router]);

  return (
    <section
      ref={ref}
      className="relative"
      style={{ color: "var(--ink)" }}
    >
      <div
        className="relative flex items-center"
      >
        {/* Heading, subline and buttons from the top, left-aligned on the
            same edge as the canvas under them, which runs off the bottom of
            the first screen so there's something to scroll into. */}
        {/* Top padding matches the FrameRule's below the canvas, so the
            hero sits evenly between the header line and the next rule. */}
        <div className="relative max-w-[80rem] mx-auto w-full px-6 sm:px-8 pt-16 sm:pt-24 flex flex-col items-start text-left gap-10">
          {false && (
          <span
            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[14px] tracking-tight"
            style={{
              ...liquid(0),
              background: "rgb(var(--ink-rgb) / 0.06)",
              color: "rgb(var(--ink-rgb) / 0.7)",
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
            style={{ ...liquid(60), color: "var(--ink)" }}
          >
            anti<AntiSlowMark color={accentColor} />slow
          </p>
          )}

          <h1
            className="tracking-[-0.05em] leading-[0.98] text-[clamp(1.9rem,9vw,2.5rem)] sm:tracking-[-0.045em] sm:text-[clamp(1.8rem,4.2vw,4rem)] flex flex-col items-start"
            style={{ color: "var(--ink)", fontWeight: 450 }}
          >
            <HeroDragHeading lines={HEADING_LINES} mobileLines={HEADING_LINES_MOBILE} align="left" />
          </h1>

          <p
            className="max-w-none sm:max-w-xl -mt-4 sm:-mt-5 text-[16.5px] sm:text-[19px] leading-relaxed tracking-tight text-pretty sm:text-balance"
            style={{ ...liquid(120), color: "var(--ink-2)" }}
          >
            <span className="sm:hidden">{HERO_SUBLINE_MOBILE}</span>
            <span className="hidden sm:inline">{HERO_SUBLINE}</span>
          </p>

          {false && (
          <div className="hidden sm:flex flex-col gap-5 max-w-md absolute inset-y-0 right-0 justify-center">
            <p
              className="text-[16.5px] sm:text-[21px] leading-relaxed tracking-tight text-right"
              style={{ ...liquid(300), color: "var(--ink-2)" }}
            >
              We do design and development ourselves, so you're not stuck explaining your vision twice.
            </p>
          </div>
          )}

          {false && (
          <div className="flex flex-col gap-5 max-w-lg sm:hidden">
            <p
              className="text-[16.5px] leading-relaxed tracking-tight"
              style={{ ...liquid(300), color: "var(--ink-2)" }}
            >
              We do design and development ourselves, so you're not stuck explaining your vision twice.
            </p>
          </div>
          )}

          {/* Buttons join the same liquid stagger as the heading and subline. */}
          <div className="flex flex-wrap items-center justify-start gap-3" style={{ ...liquid(240), display: "flex" }}>
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
                  const targetY = window.scrollY + el.getBoundingClientRect().top - 96; // 40px clear of the 56px sticky header
                  const lenis = window.__lenis;
                  if (lenis) lenis.scrollTo(targetY, { duration: 1.1 });
                  else window.scrollTo({ top: targetY, behavior: "smooth" });
                }}
                className={CTA_PILL_CLASS}
                style={{
                  background: CTA_FILL,
                  color: "var(--cta-fg)",
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
                  background: "var(--tile-2)",
                  color: "var(--ink)",
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
              style={{ ...liquid(720), background: "var(--tile-2)", color: "var(--ink)" }}
              onMouseEnter={e => { e.currentTarget.style.transition = "opacity 150ms ease, transform 150ms ease"; e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
              onMouseDown={e => { e.currentTarget.style.transform = "translateY(0px)"; }}
            >
              Send a message
            </a>
            )}
          </div>

          <HeroCanvas
            play={visible}
            delay={canvasDelay + 120}
            style={{
              marginTop: 8,
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(18px)",
              transition: `opacity 900ms ${HERO_LIQUID_EASE} ${canvasDelay}ms, transform 900ms ${HERO_LIQUID_EASE} ${canvasDelay}ms`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

// The enquiry flow at the foot of the homepage, in two stages. First three
// quick questions: what they're building first, then two that show how they think about the
// work. We reflect that back in a short typed reply, then collect the details
// we need to come back to them. Each stage is stepped through by InquirySteps
// (components/inquiry-steps.tsx); answers post to /api/inquiry.
// `skippable: false` is kept from the shared question type, which skips by
// default; InquirySteps never offers a skip either way.
const QUIZ_QUESTIONS: AskUserQuestion[] = [
  {
    id: "project",
    title: "What are you building?",
    skippable: false,
    allowOther: true,
    otherPlaceholder: "Something else...",
    chipPosition: "left",
    options: [
      { id: "new_site", title: "A new website" },
      { id: "redesign", title: "A redesign of the site we have" },
      { id: "store", title: "A Shopify store" },
      { id: "product", title: "A product or app" },
    ],
  },
  {
    id: "ownership",
    title: "Your site launches, but it doesn't feel like your brand. Whose problem is that?",
    skippable: false,
    chipPosition: "left",
    options: [
      { id: "designer", title: "The designer's. That was the job." },
      { id: "team", title: "Everyone's. A brand slips one small decision at a time." },
      { id: "ship", title: "Nobody's, as long as it works." },
    ],
  },
  {
    id: "detail",
    title: "Something is two pixels off. Nobody will consciously notice. What do you do?",
    skippable: false,
    chipPosition: "left",
    options: [
      { id: "fix", title: "Fix it. Small calls like that are why things feel right." },
      { id: "leave", title: "Leave it. There are bigger things to do." },
      { id: "depends", title: "Depends what else is on fire." },
    ],
  },
];

// Short labels for the answers recap in the chat, so the full questions
// aren't repeated back. Looked up by question title, which is what the
// transcript stores.
const QUIZ_SHORT_LABELS: Record<string, string> = {
  project: "Building",
  ownership: "Whose problem",
  detail: "Two pixels off",
};
const QUIZ_SHORT_BY_TITLE: Record<string, string> = Object.fromEntries(
  QUIZ_QUESTIONS.map((q) => [q.title, QUIZ_SHORT_LABELS[q.id ?? ""] ?? q.title])
);

// Who's speaking in the enquiry chat: "You" on the right, Inertia on the
// left with the In mark.
function ChatSpeaker({ who }: { who: "you" | "inertia" }) {
  if (who === "you") {
    return (
      <span className="text-[13px] tracking-tight leading-none" style={{ color: "rgb(var(--muted))" }}>
        You
      </span>
    );
  }
  return (
    <span className="flex items-center gap-3 text-[13px] tracking-tight leading-none" style={{ color: "rgb(var(--muted))" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon-512.png"
        alt=""
        aria-hidden="true"
        className="size-6 rounded-[6px]"
        style={{ boxShadow: "0 0 0 1px rgb(var(--line))" }}
      />
      Inertia
    </span>
  );
}

// Our reply, keyed off how they answered "whose problem is that". Honest
// about where we stand rather than pretending to assess them.
const QUIZ_RESULTS: Record<string, { title: string; body: string }> = {
  designer: {
    title: "You expect the designer to own it.",
    body: "So do we. When the work goes out under our name, getting it right is on us, not you.",
  },
  team: {
    title: "You see a brand as a shared standard.",
    body: "Agreed. Someone still has to hold the line, and that's usually why people bring us in.",
  },
  ship: {
    title: "You'd rather ship than fuss.",
    body: "Fair, and we move fast too. But a site that works and doesn't feel like you is only half done, so we ship both.",
  },
};

const QUIZ_RESULT_FALLBACK = {
  title: "Sounds like we'd work well together.",
  body: "How you think about the work lines up with how we do it.",
};

// Stage two: the details we need to come back to them, in the order a
// conversation would go: who you are, what you have, what you want, where
// it stands. Free text where the answer is theirs to write, options where
// we're qualifying.
const INTAKE_QUESTIONS: AskUserQuestion[] = [
  {
    id: "name",
    title: "What should we call you?",
    skippable: false,
    freeText: true,
    freeTextMultiline: false,
    freeTextPlaceholder: "Your name",
    freeTextValidate: (v) => (v.trim().length < 2 ? "Please enter your name." : null),
  },
  {
    id: "email",
    title: "And the best email to reach you?",
    skippable: false,
    freeText: true,
    freeTextMultiline: false,
    freeTextPlaceholder: "you@company.com",
    freeTextValidate: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : "Please enter a valid email.",
  },
  {
    id: "website",
    title: "Is there a site we should look at?",
    skippable: false,
    freeText: true,
    freeTextMultiline: false,
    freeTextPlaceholder: "yoursite.com, or none yet",
  },
  {
    id: "goals",
    title: "When we're done, what should be different?",
    skippable: false,
    freeText: true,
    freeTextPlaceholder: "The outcome you're after, in your own words.",
  },
  {
    id: "company_stage",
    title: "Where's the business today?",
    skippable: false,
    chipPosition: "left",
    options: [
      { id: "idea", title: "Just an idea, or pre-seed" },
      { id: "bootstrapped", title: "Bootstrapped" },
      { id: "funded", title: "Funded" },
      { id: "established", title: "Established" },
    ],
  },
  {
    id: "readiness",
    title: "Where's the budget at?",
    skippable: false,
    chipPosition: "left",
    options: [
      { id: "allocated", title: "Set aside and ready to go" },
      { id: "unlockable", title: "Serious, and I can make it happen" },
      { id: "exploring", title: "Still working out what this would cost" },
    ],
  },
  {
    id: "referral_source",
    title: "Last one. How did you hear about us?",
    skippable: false,
    // allowOther appends a free-text row beneath the options, so "somewhere
    // else" is typed rather than picked.
    allowOther: true,
    otherPlaceholder: "Somewhere else...",
    chipPosition: "left",
    options: [
      { id: "recommendation", title: "Someone recommended you" },
      { id: "search", title: "Google or search" },
      { id: "twitter", title: "X (Twitter)" },
      { id: "instagram", title: "Instagram" },
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


function Questionnaire() {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const [stage, setStage] = useState<Stage>("quiz");
  const [result, setResult] = useState<{ title: string; body: string } | null>(null);
  const [transcript, setTranscript] = useState<{ question: string; answer: string }[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [firstName, setFirstName] = useState("");
  const intakeRef = useRef<HTMLDivElement>(null);

  const flowRevealRef = useLiquidReveal(open, 60);
  const transcriptRevealRef = useLiquidReveal(open && stage !== "quiz");
  const intakeRevealRef = useLiquidReveal(stage === "intake");
  const doneRevealRef = useLiquidReveal(stage === "done");

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
    ? `${result.title} ${result.body} Now a few details so we can come back to you properly.`
    : "";
  // A short "typing" beat before the reply starts, like someone replying.
  const [thinking, setThinking] = useState(false);
  useEffect(() => {
    if (stage !== "typing") return;
    setThinking(true);
    const t = setTimeout(() => setThinking(false), reducedMotion ? 0 : 900);
    return () => clearTimeout(t);
  }, [stage, reducedMotion]);
  const { shown: typedResponse, done: typingDone } = useTypewriter(
    responseText,
    stage === "typing" && !thinking
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

  // Once the flow opens, bring it into view if it landed low on the screen.
  // Two frames: the first lets it mount, the second lets Lenis pick up the
  // taller page after resize() (see route-fade.tsx).
  useEffect(() => {
    if (!open) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        const el = document.getElementById("questionnaire-flow");
        if (!el) return;
        const lenis = window.__lenis;
        lenis?.resize();
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight * 0.6) return;
        const targetY = window.scrollY + top - (window.innerWidth < 640 ? 32 : 120);
        if (lenis) lenis.scrollTo(targetY, { duration: 1.1 });
        else window.scrollTo({ top: targetY, behavior: "smooth" });
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [open]);

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
          company_stage: value("company_stage"),
          website: value("website"),
          goals: value("goals"),
          readiness: value("readiness"),
          referral_source: value("referral_source"),
          quiz_answers: quizAnswers,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setFirstName(value("name").split(/\s+/)[0] ?? "");
      setStage("done");
    } catch {
      setSubmitError("Something went wrong. Try again, or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="start" className="w-full max-w-[80rem] mx-auto px-6 sm:px-8">
      {/* The dark zone opens on this: one large line that surfaces out of
          the dark as the white card pulls away above it, then a muted
          paragraph at the body size and the CTA (inverted for the dark
          zone). The flow opens below it. */}
      <div className="pt-24 sm:pt-40 mx-auto max-w-4xl text-center">
        <SurfacingLine text="Let’s make something people remember." className="mx-auto max-w-[14ch] mb-8 sm:mb-10" />
      </div>
      <div className="rise rise-stagger mx-auto max-w-2xl sm:max-w-3xl text-center">
        <p className="text-[16.5px] sm:text-[21px] leading-relaxed tracking-tight text-[rgb(var(--muted))] text-balance">
          Tell us a little about it. It takes about two minutes, and we read every answer.
        </p>
        {!open && (
          <span className="relative mt-8 sm:mt-10 inline-flex rounded-[6px]">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={false}
              aria-controls="questionnaire-flow"
              className={CTA_PILL_CLASS}
              style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))", fontWeight: 450 }}
              {...ctaScaleHoverOnParent}
            >
              <span className="relative whitespace-nowrap">Tell us about it</span>
            </button>
          </span>
        )}
      </div>

      {open && (
        <div
          id="questionnaire-flow"
          ref={flowRevealRef}
          className={cn("quiz-dark mt-10 sm:mt-14 pb-16 sm:pb-24 w-full mx-auto max-w-3xl", LIQUID_REVEAL)}
        >
        {/* Your answers, as your side of the conversation: right-aligned,
            each answer under a short label instead of the full question. */}
        {stage !== "quiz" && (
          <div ref={transcriptRevealRef} className={`flex flex-col items-end ${LIQUID_REVEAL}`}>
            <ChatSpeaker who="you" />
            <div
              className="mt-2.5 w-full max-w-[88%] sm:max-w-[70%] rounded-[6px] px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col gap-3"
              style={{ background: "rgb(var(--surface))" }}
            >
              {transcript.map((t) => (
                <div key={t.question}>
                  <p className="text-[12.5px] tracking-tight leading-none" style={{ color: "rgb(var(--muted))" }}>
                    {QUIZ_SHORT_BY_TITLE[t.question] ?? t.question}
                  </p>
                  <p className="mt-1.5 text-[15px] sm:text-[16px] tracking-tight leading-snug" style={{ color: "rgb(var(--fg))" }}>
                    {t.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Our reply. A typing indicator first, then the text types itself
            out with a caret, then it just sits there. */}
        {stage !== "quiz" && result && (
          <div className={`mt-8 sm:mt-10 ${LIQUID_REVEAL}`} style={liquidRevealDelay(80)}>
            <ChatSpeaker who="inertia" />
            <div className="mt-2.5 pl-9">
              {stage === "typing" && thinking ? (
                <span aria-label="Inertia is typing" className="inline-flex h-6 items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 rounded-full"
                      style={{ background: "rgb(var(--fg))", animation: `chat-dot 1s ease-in-out ${i * 150}ms infinite` }}
                    />
                  ))}
                </span>
              ) : (
                <p className="max-w-xl text-[16px] sm:text-[18px] leading-relaxed tracking-tight" style={{ color: "rgb(var(--fg))" }}>
                  {stage === "typing" ? typedResponse : responseText}
                  {stage === "typing" && !typingDone && (
                    <span
                      aria-hidden
                      className="inline-block w-[2px] h-[1em] align-text-bottom ml-0.5"
                      style={{ background: "currentColor", opacity: 0.6 }}
                    />
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        {stage === "quiz" && (
          <InquirySteps key="quiz" questions={QUIZ_QUESTIONS} onComplete={onQuizComplete} />
        )}

        {stage === "intake" && (
          <div ref={setIntakeRef} className={`mt-8 sm:mt-10 sm:pl-9 ${LIQUID_REVEAL}`}>
            <InquirySteps key="intake" questions={INTAKE_QUESTIONS} onComplete={onIntakeComplete} />
            {submitting && (
              <p className="mt-4 text-[13px] tracking-tight" style={{ color: "rgb(var(--muted))" }}>
                Sending...
              </p>
            )}
            {submitError && (
              <p className="mt-4 text-[13px] tracking-tight" style={{ color: "#ff7a7a" }}>
                {submitError}
              </p>
            )}
          </div>
        )}

        {/* Done: Inertia's last message in the same thread. */}
        {stage === "done" && (
          <div ref={doneRevealRef} className={`mt-8 sm:mt-10 ${LIQUID_REVEAL}`}>
            <ChatSpeaker who="inertia" />
            <div className="mt-2.5 pl-9">
              <p className="text-[20px] sm:text-[24px] tracking-[-0.02em] leading-snug" style={{ color: "rgb(var(--fg))", fontWeight: 450 }}>
                {firstName ? `Thanks, ${firstName}. That’s everything.` : "Thanks. That’s everything."}
              </p>
              <p className="mt-2.5 max-w-xl text-[15px] sm:text-[17px] leading-relaxed tracking-tight" style={{ color: "rgb(var(--muted))" }}>
                We read every one of these ourselves. If we&rsquo;re a good fit, you&rsquo;ll hear from us within
                a couple of days to set up a call. If we&rsquo;re not, we&rsquo;ll tell you that too.
              </p>
              {/* The next step is our email, so instead of another CTA, two
                  things worth a look while they wait. */}
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                {[
                  { href: "/work", label: "See our work" },
                  { href: "/blog", label: "Read our essays" },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group inline-flex h-10 items-center gap-2 rounded-[6px] px-4 text-[15px] tracking-tight transition-colors duration-200 bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-elevated))]"
                    style={{ color: "rgb(var(--fg))" }}
                  >
                    {label}
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
                      <path d="M3 8h10" />
                      <path d="M9 4l4 4-4 4" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
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

// A key phrase in body copy: the paragraph is set muted, the phrase in the
// page's full ink, so it scans before the rest is read. The same treatment
// as the reviews on /aether.
function KeyPhrase({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "rgb(var(--fg))" }}>{children}</span>;
}

// Splits copy on [[double brackets]] into word-level tokens, wrapping
// bracketed phrases in a KeyPhrase. A key phrase stays one atomic token
// (never split across words) so it reveals as a single unit rather than
// word-by-word. Plain words are split on spaces so LiquidText can stagger
// them individually.
type CopyToken = { key: string; node: React.ReactNode };

function tokenizeCopy(text: string): CopyToken[] {
  const tokens: CopyToken[] = [];
  const parts = text.split(/\[\[(.+?)\]\]/g);
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      tokens.push({ key: `${i}`, node: <KeyPhrase>{part}</KeyPhrase> });
      return;
    }
    part.split(/(\s+)/).forEach((word, j) => {
      if (word === "" || /^\s+$/.test(word)) return;
      // Punctuation straight after a key phrase ("afford.", "reps.") joins
      // the phrase's token, so no space opens up before it.
      const prev = tokens[tokens.length - 1];
      if (j === 0 && prev && /^[.,;:!?)]/.test(word)) {
        prev.node = <>{prev.node}{word}</>;
        return;
      }
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

// How long each principle stays up while the list plays on its own.
const EXECUTION_PERIOD_MS = 6500;

function DesignPhilosophy({ introRef }: { introRef?: React.RefObject<HTMLParagraphElement | null> }) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [inView, setInView] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const mounted = useMounted();
  const intro = EXECUTION_INTRO;
  // Each principle is one way of finishing "how we think about execution":
  // the label names it, the line argues it, the illustration acts it out.
  const segments = EXECUTION_PRINCIPLES.map((p, i) => ({
    ...p,
    Art: [RestraintArt, AgreementArt, FollowThroughArt][i],
  }));

  // Plays only while on screen, so it's on the first principle when you
  // arrive and doesn't cycle unseen.
  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const playing = auto && inView && !reduced;
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % segments.length), EXECUTION_PERIOD_MS);
    return () => clearTimeout(t);
  }, [playing, active, segments.length]);

  // Picking one by hand takes over from the autoplay for good.
  const pick = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  return (
    <section className="rise rise-stagger w-full max-w-[80rem] mx-auto px-6 sm:px-8">
      <div data-stagger className="max-w-2xl sm:max-w-3xl">
        <SectionHeading align="left" className="mb-5 sm:mb-6">How we think about execution</SectionHeading>
        <LiquidText
          pRef={introRef}
          text={intro}
          className="text-[16.5px] sm:text-[21px] leading-relaxed tracking-tight text-left"
          style={{ color: "var(--ink-2)" }}
        />
      </div>

      {/* Desktop: the accordion list beside the illustration. Phones: the
          illustration on top, three tabs under it, then the line, in a box
          sized to the longest line so the autoplay never shifts the page. */}
      <div ref={blockRef} data-stagger className="mt-8 grid gap-5 sm:mt-14 sm:grid-cols-[1fr_1.1fr] sm:items-center sm:gap-12">
        <ul className="hidden sm:flex flex-col gap-1.5">
          {segments.map((seg, i) => {
            const selected = i === active;
            return (
              <li
                key={seg.label}
                className="relative overflow-hidden rounded-[6px] transition-colors duration-300"
                style={{ background: selected ? "var(--tile)" : "transparent" }}
              >
                <button
                  type="button"
                  onClick={() => pick(i)}
                  aria-expanded={selected}
                  aria-controls={`execution-text-${i}`}
                  className="flex w-full items-baseline gap-3 px-4 py-4 text-left sm:px-5 sm:py-5"
                >
                  <span className="w-4 shrink-0 text-[14px] tabular-nums tracking-tight" style={{ color: "var(--ink-4)" }}>
                    {i + 1}
                  </span>
                  <span
                    className="text-[18px] sm:text-[21px] tracking-[-0.02em] leading-snug transition-colors duration-300"
                    style={{ color: selected ? "var(--ink)" : "var(--ink-4)", fontWeight: 500 }}
                  >
                    {seg.label}
                  </span>
                </button>
                <div
                  id={`execution-text-${i}`}
                  className="grid px-4 sm:px-5"
                  style={{ gridTemplateRows: selected ? "1fr" : "0fr", transition: "grid-template-rows 420ms cubic-bezier(0.22,1,0.36,1)" }}
                >
                  <div className="overflow-hidden">
                    <div className="-mt-2 pb-5 pl-7 sm:pb-6">
                      {selected && (
                        <LiquidText
                          key={seg.label}
                          text={seg.text}
                          className="text-[15.5px] sm:text-[17px] leading-relaxed tracking-tight text-left"
                          style={{ color: "var(--ink-2)" }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {/* Time left on this principle while the list plays itself. */}
                {selected && playing && (
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: "rgb(var(--ink-rgb) / 0.06)" }}>
                    <span
                      key={active}
                      className="block h-full origin-left"
                      style={{ background: "var(--ink)", animation: `execution-progress ${EXECUTION_PERIOD_MS}ms linear both` }}
                    />
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div aria-hidden="true" className="relative aspect-[4/3] overflow-hidden rounded-[6px] order-first sm:order-none" style={{ background: "var(--tile)" }}>
          {segments.map(({ label, Art }, i) => (
            <div
              key={label}
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: i === active ? 1 : 0, transition: "opacity 400ms ease" }}
            >
              {/* Drawn after hydration only: decoration, kept out of the
                  server HTML so the page's text isn't buried in markup. */}
              {mounted && <Art play={i === active && (inView || reduced)} />}
            </div>
          ))}
        </div>

        <div className="sm:hidden">
          <div role="tablist" aria-label="How we think about execution" className="grid grid-cols-3 gap-1.5">
            {segments.map((seg, i) => {
              const selected = i === active;
              return (
                <button
                  key={seg.label}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="execution-text-mobile"
                  onClick={() => pick(i)}
                  className="relative flex flex-col items-start gap-1 overflow-hidden rounded-[6px] px-3 py-2.5 text-left transition-colors duration-300"
                  style={{ background: selected ? "var(--tile)" : "transparent" }}
                >
                  <span className="text-[12.5px] tabular-nums leading-none tracking-tight" style={{ color: "var(--ink-4)" }}>
                    {i + 1}
                  </span>
                  <span
                    className="whitespace-nowrap text-[15px] leading-snug tracking-[-0.02em] transition-colors duration-300"
                    style={{ color: selected ? "var(--ink)" : "var(--ink-4)", fontWeight: 500 }}
                  >
                    {seg.label}
                  </span>
                  {selected && playing && (
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: "rgb(var(--ink-rgb) / 0.06)" }}>
                      <span
                        key={active}
                        className="block h-full origin-left"
                        style={{ background: "var(--ink)", animation: `execution-progress ${EXECUTION_PERIOD_MS}ms linear both` }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div id="execution-text-mobile" role="tabpanel" className="mt-4 grid px-1">
            {/* Every line laid out invisibly in the same cell, so the box
                holds the tallest one. */}
            {segments.map((seg) => (
              <p key={seg.label} aria-hidden="true" className="invisible [grid-area:1/1] text-[16px] leading-relaxed tracking-tight">
                {tokenizeCopy(seg.text).map((t, i, all) => (
                  <React.Fragment key={t.key}>
                    {t.node}
                    {i < all.length - 1 ? " " : ""}
                  </React.Fragment>
                ))}
              </p>
            ))}
            <LiquidText
              key={segments[active].label}
              text={segments[active].text}
              className="[grid-area:1/1] text-[16px] leading-relaxed tracking-tight text-left"
              style={{ color: "var(--ink-2)" }}
            />
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

// How far apart the four drawings start building, once the section scrolls in.
const WHAT_WE_DO_STEP_MS = 420;

// "What we do" as the process it is: the four stages of the hero's stair, in
// order, each a line drawing on its tile, then a small step number beside the
// stage name and the description under it (the same pattern as How we think
// about execution). One row of four on wide screens, two by two below that.
// On first view the drawings build one after another. On phones the stages
// sit in a row that swipes sideways, like Our thoughts, and each drawing
// builds as it's swiped in.
function WhatWeDo() {
  const listRef = useRef<HTMLOListElement>(null);
  const mounted = useMounted();
  const [on, setOn] = useState(false);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        setOn(true);
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // On phones the stages are a swipe row, so each one plays when it's swiped
  // into view instead of all four at once while three are off screen. The
  // row is the observer's root; `on` above still gates it on the section
  // being in view vertically.
  const [phone, setPhone] = useState(false);
  const [seen, setSeen] = useState<boolean[]>(() => WHAT_WE_DO_ITEMS.map(() => false));
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const root = listRef.current;
    if (!phone || !root) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.index);
          setSeen((prev) => (prev[i] ? prev : prev.map((v, k) => v || k === i)));
        }
      },
      { root, threshold: 0.6 },
    );
    Array.from(root.children).forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, [phone]);

  const lit = on || reduced;
  // Per step: does its drawing build, and when. On phones a drawing builds
  // when its card is swiped in.
  const stepOn = (i: number) => (phone ? lit && (seen[i] || reduced) : lit);
  const stepDelay = (i: number) => (reduced ? 0 : phone ? (i > 0 ? WHAT_WE_DO_STEP_MS : 0) : i * WHAT_WE_DO_STEP_MS);

  return (
    <section className="rise rise-stagger w-full max-w-[80rem] mx-auto px-6 sm:px-8">
      <SectionHeading align="left" className="mb-10 sm:mb-14">What we do</SectionHeading>
      <ol
        ref={listRef}
        data-stagger
        className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-6 px-6 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-x-5"
      >
        {WHAT_WE_DO_ITEMS.map((item, i) => {
          const delay = stepDelay(i);
          return (
            <li key={item.label} data-index={i} className="group flex w-[80%] shrink-0 snap-start flex-col sm:w-auto">
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[6px]" style={{ background: "var(--tile)" }}>
                {mounted && <WhatWeDoSketch
                  stage={item.label}
                  play={stepOn(i)}
                  delay={phone ? Math.max(0, delay - 200) : delay}
                  still={reduced}
                  className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.04]"
                />}
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="w-4 shrink-0 text-[14px] tabular-nums tracking-tight" style={{ color: "var(--ink-4)" }}>
                  {i + 1}
                </span>
                <h3 className="text-[18px] sm:text-[21px] tracking-[-0.02em] leading-snug" style={{ color: "var(--ink)", fontWeight: 500 }}>
                  {item.label}
                </h3>
              </div>
              <p className="mt-1.5 pl-7 text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-pretty" style={{ color: "var(--ink-2)" }}>
                {item.description}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function AiApproach({ clients }: { clients: ClientCarouselItem[] }) {
  const [first, second] = AI_APPROACH;
  return (
    <>
      <section className="rise rise-stagger w-full max-w-[80rem] mx-auto px-6 sm:px-8">
        <div data-stagger className="max-w-2xl sm:max-w-3xl sm:mx-auto">
            <SectionHeading className="mb-5 sm:mb-6">How we think about AI</SectionHeading>
            <LiquidText
              text={first}
              className="text-[16.5px] sm:text-[21px] leading-relaxed tracking-tight text-left"
              style={{ color: "var(--ink-2)" }}
            />
            <LiquidText
              text={second}
              delayMs={160}
              className="text-[16.5px] sm:text-[21px] leading-relaxed tracking-tight text-left mt-5"
              style={{ color: "var(--ink-2)" }}
            />
        </div>
      </section>
      <FrameRule tone="light" />
      <WhatWeDo />
      <FrameRule tone="light" />
      {clients.length > 0 && <FrameRule tone="light" />}
      <ClientGrid items={clients} />
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
      // The frame inside the card undoes the horizontal part of that scale
      // (components/page-frame.tsx reads this), so its rails stay on the
      // dark zone's rails behind the card instead of drifting inward.
      card.style.setProperty("--frame-unscale", progress === 0 ? "1" : String(1 / scale));
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
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", background: "rgb(var(--zone-bg))" }}
    >
      {/* Dark rails on the backdrop, in the same column as the dark zone's,
          so the frame runs unbroken into it where the card pulls away. */}
      <FrameColumnRails tone="dark" />
      <div
        ref={cardRef}
        className="relative"
        style={{
          background: "var(--paper)",
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
      <div aria-hidden="true" className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: 6, background: "var(--paper)", zIndex: 1 }} />
      {/* ...and the rails carried over that strip, so the frame stays
          unbroken from the header into the card. */}
      <FrameColumnRails tone="light" className="bottom-auto z-[2] h-[6px]" />
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

// "In good company": a quiet wall of marks. Flat square tiles on the zone's
// surface, each holding the client's logo masked in ink, so the grid stays
// monochrome. The name and service stay hidden until hover, when the mark
// lifts and they rise in at the bottom. Each tile links to its case study,
// and one last tile with a "+" stands for whoever's next, pointing down to
// the enquiry flow.
const WALL_EASE = "duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]";
const WALL_TILE = "group relative flex aspect-square items-center justify-center overflow-hidden rounded-[10px] bg-[var(--tile)] transition-colors duration-300 hover:bg-[var(--tile-2)]";

function WallCaption({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className={`absolute inset-x-4 bottom-4 translate-y-2 opacity-0 transition-all ${WALL_EASE} group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100`}>
      <p className="text-[14px] tracking-tight" style={{ color: "var(--ink)" }}>{title}</p>
      {sub && <p className="text-[13px] tracking-tight" style={{ color: "var(--ink-2)" }}>{sub}</p>}
    </div>
  );
}

function ClientGrid({ items }: { items: ClientCarouselItem[] }) {
  if (items.length === 0) return null;
  const lift = `transition-transform ${WALL_EASE} group-hover:-translate-y-3 group-focus-visible:-translate-y-3`;
  return (
    <section className="rise rise-stagger w-full max-w-[80rem] mx-auto px-6 sm:px-8">
      <SectionHeading align="left" className="mb-10 sm:mb-14">In good company</SectionHeading>
      <ul data-stagger className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={`/work/${item.slug}`} className={WALL_TILE} aria-label={item.service ? `${item.client}, ${item.service}` : item.client}>
              <div className={`w-[44%] ${lift}`}>
                {item.logo ? (
                  <span
                    aria-hidden="true"
                    className="block opacity-[0.85]"
                    style={{
                      aspectRatio: "1 / 1",
                      backgroundColor: "var(--ink)",
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
                ) : (
                  <span className="block text-center text-[15px] tracking-tight" style={{ color: "var(--ink)" }}>{item.client}</span>
                )}
              </div>
              <WallCaption title={item.client} sub={item.service} />
            </Link>
          </li>
        ))}
        <li>
          <a href="#start" className={WALL_TILE} aria-label="Your business, next if you like">
            <span className={`text-[28px] font-light leading-none opacity-40 transition-opacity duration-200 group-hover:opacity-80 ${lift}`} style={{ color: "var(--ink)" }} aria-hidden="true">+</span>
            <WallCaption title="Your business" sub="Next, if you like" />
          </a>
        </li>
      </ul>
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

// "Our thoughts": the three latest essays as tiles of one size. Each tile is
// its cover (the same drawing as its post page; see MaterialCover) with the
// title set inside along the bottom. On hover the drawing lifts and the
// excerpt opens under the title; on touch screens, where there's no hover,
// the excerpt simply shows. The full list sits behind the same quiet button
// as the header's "Sign in".
function BlogCarousel({ posts }: { posts: PostMeta[] }) {
  const mounted = useMounted();
  if (posts.length === 0) return null;
  const list = posts.slice(0, 3);
  const ease = "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

  return (
    <section className="rise rise-stagger w-full max-w-[80rem] mx-auto px-6 sm:px-8">
      <div className="mb-10 flex items-center justify-between gap-6 sm:mb-14">
        <SectionHeading align="left">Our thoughts</SectionHeading>
        <Link
          href="/blog"
          className={CTA_HEADER_PILL_CLASS}
          style={{ background: "var(--tile-2)", color: "var(--ink)", whiteSpace: "nowrap", transformOrigin: "center" }}
          {...ctaScaleHoverOnSelf}
        >
          <span className="relative">All essays</span>
        </Link>
      </div>

      <ul data-stagger className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {list.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[6px] bg-[var(--tile)] sm:aspect-square"
            >
              <div className={`absolute inset-x-0 top-0 aspect-[4/3] transition-transform ${ease} [@media(hover:hover)]:group-hover:-translate-y-6 group-focus-visible:-translate-y-6`}>
                {mounted && <MaterialCover slug={post.slug} />}
              </div>
              <div className="relative p-5 sm:p-6">
                <h3
                  className="text-balance text-[21px] leading-[1.15] tracking-[-0.025em] sm:text-[22px]"
                  style={{ color: "var(--ink)", fontWeight: 450 }}
                >
                  {post.title}
                </h3>
                {post.excerpt && (
                  <div className={`grid grid-rows-[1fr] transition-[grid-template-rows,opacity] ${ease} [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:grid-rows-[1fr] [@media(hover:hover)]:group-hover:opacity-100 group-focus-visible:grid-rows-[1fr] group-focus-visible:opacity-100`}>
                    <p className="overflow-hidden">
                      <span className="block pt-2 line-clamp-2 text-pretty text-[14px] leading-snug tracking-tight sm:text-[15px]" style={{ color: "var(--ink-2)" }}>
                        {post.excerpt}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
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
  const [accentColor, setAccentColor] = useState(WORK_ITEMS[0].accent);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  return (
    <>
    <main className="page-container relative mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] flex flex-col">
      <LightCard>
        <div className="relative mx-auto w-full max-w-[80rem] flex flex-col">
          <FrameRails tone="light" />
          <VercelHero accentColor={accentColor} ctaRef={ctaRef} />

          {/* Work thumbnail section (WorkScrollGallery) temporarily hidden
              while its format is still being decided. accentColor stays fed
              by WORK_ITEMS[0] via its initial state below, so the hero tint
              still has a value. Restore by uncommenting these two lines. */}
          {/* <div className="py-1 sm:py-0" />
          <WorkScrollGallery onActiveAccent={(c) => setAccentColor(c)} /> */}

          <FrameRule tone="light" />

          <DesignPhilosophy introRef={introRef} />

          <FrameRule tone="light" />

          <AiApproach clients={initialWork} />

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
        <div className="relative mx-auto w-full max-w-[80rem] flex flex-col">
          <FrameRails tone="dark" />
          <div className="py-6 sm:py-10" />

          <Questionnaire />

          {/* The blog closes the page. On the lower panel the tile tone would
              match the panel itself in light mode, so its cards take the
              panel's surface tones instead. */}
          <FrameRule tone="dark" />
          <div
            style={{
              ["--tile" as string]: "rgb(var(--surface))",
              ["--tile-3" as string]: "rgb(var(--surface-elevated))",
            }}
          >
            <BlogCarousel posts={initialPosts} />
          </div>

          <div className="py-24 sm:py-28" />
        </div>
      </div>

    </main>
    </>
  );
}
