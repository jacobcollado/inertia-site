"use client";

import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { AskUserQuestions, type AskUserQuestion, type AskUserAnswer } from "@/components/ui/ask-user-questions";
import { BorderBeam } from "border-beam";
import { ctaScaleHoverOnParent, ctaScaleHoverOnSelf, CTA_SCALE_PRESS, CTA_SCALE_RESET, CTA_SCALE_SPRING } from "@/lib/cta-hover-motion";

export type ClientCarouselItem = { slug: string; client: string; blurb?: string; logo?: string };

export default function Home({ initialWork }: { initialWork: ClientCarouselItem[] }) {
  return <VisualLayout initialWork={initialWork} />;
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
    <section className="w-full max-w-[88rem] mx-auto px-6 sm:px-8">
      <div className="max-w-2xl mx-auto text-left sm:text-center">
        <p className="rise rise--liquid text-[clamp(1.8rem,4vw,2.5rem)] font-normal tracking-[-0.03em] leading-snug text-[rgb(var(--fg))]">
          We build the version of your business (and product) people fall for.
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
                    className="flex flex-col gap-1 p-3.5 border text-left transition-all duration-150 rounded-sm"
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

const HERO_CTA_OUTER_SHADOW =
  "0 2px 4px rgba(0,0,0,0.32)," +
  "0 10px 28px rgba(0,0,0,0.24)," +
  "0 24px 56px -10px rgba(0,0,0,0.20)";

const INQUIRY_CTA_OUTER_SHADOW =
  "0 2px 4px rgba(0,0,0,0.18)," +
  "0 10px 28px rgba(0,0,0,0.14)," +
  "0 24px 56px -10px rgba(0,0,0,0.12)";

const HERO_CTA_DWELL_MS = 5500;

const HERO_LIQUID_MS = 680;
const HERO_LIQUID_EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
const HERO_WORD_STEP = 90;
const HERO_START = 90;

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

function heroCtaLabelStyle(active: boolean) {
  return {
    opacity: active ? 1 : 0,
    transform: active ? "scale(1)" : "scale(0.97)",
    filter: active ? "blur(0px)" : "blur(10px)",
    willChange: "opacity, transform, filter",
    transition: [
      `opacity ${HERO_LIQUID_MS}ms ${HERO_LIQUID_EASE}`,
      `transform ${HERO_LIQUID_MS}ms ${HERO_LIQUID_EASE}`,
      `filter ${HERO_LIQUID_MS}ms ${HERO_LIQUID_EASE}`,
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
  const [ctaTarget, setCtaTarget] = useState<"project" | "aether">("project");
  const isAetherCta = ctaTarget === "aether";
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // BorderBeam defaults to active immediately on mount, which made the beam
  // visible spinning around the CTA's pill before the CTA itself had even
  // faded in — the beam has to wait for the CTA's own entrance transition to
  // actually finish, same as HeroToIntroLine's connector does off this same
  // opacity transitionend, rather than a guessed delay that could drift out
  // of sync with the liquid reveal timing below.
  const [beamActive, setBeamActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        // Wrapping the CTA in BorderBeam added a heavy synchronous mount (its
        // own <style> tag + @property registrations) that could land in the
        // same paint as this observer firing — collapsing the opacity:0
        // starting frame and the opacity:1 end state into one frame, so the
        // "transition" completed instantly and both the connector line and
        // the beam's own activation (gated on this same transitionend) fired
        // immediately instead of after a real 750ms fade. Forcing setVisible
        // onto its own rAF guarantees the hidden state actually paints first.
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
  // flows into focus rather than rising. The wordmark lands as one fluid
  // unit after the lead-in words, then the CTA follows.
  const HEADING_WORDS = ["Give", "your", "idea", "real"];
  const wordReveal = (i: number) =>
    heroLiquidStyle(visible, HERO_START + i * HERO_WORD_STEP, { blur: 7, scaleFrom: 0.994 });
  const inertiaStart = HERO_START + HEADING_WORDS.length * HERO_WORD_STEP;
  const ctaFadeDelay = inertiaStart + 644;

  // Alternates between the project quiz and the Aether product page on a
  // fixed loop once the hero has landed — no carousel interaction required.
  useEffect(() => {
    if (!visible) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const firstSwapDelay = ctaFadeDelay + HERO_LIQUID_MS + 1400;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      setCtaTarget((t) => (t === "project" ? "aether" : "project"));
      interval = setInterval(() => {
        setCtaTarget((t) => (t === "project" ? "aether" : "project"));
      }, HERO_CTA_DWELL_MS);
    }, firstSwapDelay);
    return () => {
      clearTimeout(timeout);
      if (interval !== undefined) clearInterval(interval);
    };
  }, [visible, ctaFadeDelay]);

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
        <div className="relative max-w-[88rem] mx-auto w-full px-6 sm:px-8 max-sm:pt-16 sm:pt-0 max-sm:pb-[40dvh] sm:pb-[18dvh] flex flex-col items-center text-center gap-10 min-h-[100dvh] justify-center sm:min-h-[calc(100dvh-72px)] sm:justify-center">
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
            className="font-normal tracking-tight leading-none max-w-2xl text-[clamp(2.7rem,6.5vw,3.9rem)] sm:text-[clamp(2.6rem,6vw,4.2rem)] flex flex-col items-center"
            style={{ color: "#1a1a1a" }}
          >
            <span>
              {HEADING_WORDS.map((word, i) => (
                <span key={word + i}>
                  <span style={wordReveal(i)}>{word}</span>{" "}
                </span>
              ))}
            </span>
            <span
              className="mt-2 sm:mt-2.5 block h-[clamp(2.2rem,5.9vw,3.35rem)] aspect-[420/96] bg-current"
              style={{
                ...heroLiquidStyle(visible, inertiaStart, { blur: 12, scaleFrom: 0.99 }),
                WebkitMaskImage: "url(/logo.png)",
                maskImage: "url(/logo.png)",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
              role="img"
              aria-label="Inertia"
            />
          </h1>

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

          <div className="flex items-center gap-3">
            {/* Points at the quiz at the foot of the page rather than straight
                to Cal: answering a few questions is a lower commitment than
                putting a meeting on the calendar, and the quiz hands off to
                booking itself once it knows what the project is. Stays a real
                href so it still works without JS and offers a normal link
                context menu; the handler only takes over to match the site's
                Lenis smooth scrolling. */}
            <BorderBeam
              size="md"
              colorVariant="colorful"
              theme="dark"
              borderRadius={999}
              duration={2.6}
              brightness={1.45}
              saturation={1.35}
              active={beamActive}
              className="inline-flex rounded-full"
              style={{
                boxShadow: HERO_CTA_OUTER_SHADOW,
                transformOrigin: "center",
                ...liquid(ctaFadeDelay, { blur: 10, scaleFrom: 0.992 }),
              }}
              onTransitionEnd={e => {
                if (e.propertyName !== "opacity") return;
                setBeamActive(true);
                // Tells the header (mounted separately in SiteShell, with no
                // ref access to this CTA) that the hero's own reveal has
                // landed, so it can wait to fade in until right after this
                // instead of firing on mount ahead of any hero content.
                window.dispatchEvent(new Event("hero-cta:revealed"));
              }}
            >
            <a
              ref={ctaRef}
              href={isAetherCta ? "/aether" : "#start"}
              aria-label={isAetherCta ? "View Aether" : "Get in touch"}
              onClick={e => {
                if (isAetherCta) return;
                const el = document.getElementById("start");
                if (!el) return; // let the browser handle the hash
                e.preventDefault();
                const targetY = window.scrollY + el.getBoundingClientRect().top - 40;
                const lenis = window.__lenis;
                if (lenis) lenis.scrollTo(targetY, { duration: 1.1 });
                else window.scrollTo({ top: targetY, behavior: "smooth" });
              }}
              className="relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 sm:px-5 sm:py-1.5 text-[15px] sm:text-[16px] font-medium tracking-tight"
              style={{
                background:
                  "linear-gradient(180deg, #242424 0%, #000000 52%, #080808 100%)",
                color: "#fff",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.18)," +
                  "inset 0 -1.5px 0 rgba(0,0,0,0.55)",
              }}
              {...ctaScaleHoverOnParent}
            >
              {/* Same feTurbulence grain used on the client carousel's
                  fallback cards, layered here at a heavier opacity so it
                  reads clearly against the gradient rather than as a subtle
                  texture. */}
              <span
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none rounded-full overflow-hidden"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                  backgroundSize: "180px 180px",
                  mixBlendMode: "overlay",
                  opacity: 0.3,
                }}
              />
              <span className="relative inline-grid place-items-center">
                <span
                  className="col-start-1 row-start-1"
                  style={heroCtaLabelStyle(!isAetherCta)}
                  aria-hidden={isAetherCta}
                >
                  Get in touch
                </span>
                <span
                  className="col-start-1 row-start-1"
                  style={heroCtaLabelStyle(isAetherCta)}
                  aria-hidden={!isAetherCta}
                >
                  View Aether
                </span>
              </span>
              <span
                className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 overflow-hidden"
                style={{
                  // Concave surface: dark pool at the top, warm catch along
                  // the bottom rim — matches the button's underlit gradient.
                  background:
                    "radial-gradient(130% 90% at 50% 0%, rgba(0,0,0,0.32) 0%, transparent 52%)," +
                    "radial-gradient(90% 70% at 50% 110%, rgba(255,255,255,0.22) 0%, transparent 65%)," +
                    "rgba(255,255,255,0.13)",
                  boxShadow:
                    "inset 0 2.5px 4px rgba(0,0,0,0.48)," +
                    "inset 0 -1.5px 2.5px rgba(255,255,255,0.38)," +
                    "inset 0 0 0 0.5px rgba(255,255,255,0.1)," +
                    "0 1px 2px rgba(0,0,0,0.14)",
                }}
              >
                {/* Top specular arc — overhead light catching the well rim */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none rounded-full"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 40%)",
                  }}
                />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="relative block h-3.5 w-3.5 sm:h-4 sm:w-4"
                  style={{
                    transform: isAetherCta ? "rotate(-90deg)" : "rotate(0deg)",
                    transition: `transform ${HERO_LIQUID_MS}ms ${HERO_LIQUID_EASE}`,
                  }}
                >
                  <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                </svg>
              </span>
            </a>
            </BorderBeam>
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

function QuestionnaireBoxBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/questionnaire-bg.png)" }}
      />
      <div className="absolute inset-0 bg-black/50" />
    </div>
  );
}

function Questionnaire({ onStartConversation }: { onStartConversation: () => void }) {
  const [disclosed, setDisclosed] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("quiz");
  const [result, setResult] = useState<{ title: string; body: string } | null>(null);
  const [transcript, setTranscript] = useState<{ question: string; answer: string }[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const intakeRef = useRef<HTMLDivElement>(null);
  const inquiryBorderRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const [detailsHeight, setDetailsHeight] = useState(0);
  const flowRevealRef = useLiquidReveal(disclosed, 60);
  const transcriptRevealRef = useLiquidReveal(disclosed && stage !== "quiz");
  const typingRevealRef = useLiquidReveal(stage === "typing");
  const intakeRevealRef = useLiquidReveal(stage === "intake");
  const doneRevealRef = useLiquidReveal(stage === "done");

  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;
    setDetailsHeight(detailsOpen ? el.scrollHeight : 0);
  }, [detailsOpen]);

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
    <section id="start" className="w-full max-w-[88rem] mx-auto px-6 sm:px-8">
      <div
        ref={inquiryBorderRef}
        className={`relative overflow-hidden max-w-3xl mx-auto origin-center rounded-2xl border border-dashed border-[rgb(var(--line))] py-7 sm:py-8 px-0 sm:px-8 ${LIQUID_REVEAL}`}
      >
        <QuestionnaireBoxBackdrop />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 sm:gap-10 px-4 sm:px-0">
          <div className={`w-full sm:max-w-lg text-left ${LIQUID_REVEAL}`} style={liquidRevealDelay(0)}>
            <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] font-normal tracking-[-0.025em] leading-tight text-[#d4d4d4]">
              Tell us what you&rsquo;re building.
            </h2>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setDetailsOpen((open) => !open)}
                aria-expanded={detailsOpen}
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[rgb(var(--line))] bg-black/30 backdrop-blur-sm px-2.5 py-1 text-[13px] sm:text-[14px] tracking-tight text-[#b3b3b3] hover:bg-black/40 hover:text-[#d4d4d4] transition-colors"
              >
                What to expect
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5 shrink-0"
                  style={{
                    transform: detailsOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 350ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                style={{
                  height: detailsHeight,
                  overflow: "hidden",
                  transition: "height 350ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <div ref={detailsRef}>
                  <p className="pt-2 text-[14px] sm:text-[15px] leading-relaxed tracking-tight text-[#949494]">
                    Three quick questions to start. We&rsquo;ll take it from there.
                  </p>
                </div>
              </div>
            </div>
          </div>

        {!disclosed && (
          <span
            className={`self-start sm:self-auto shrink-0 inline-flex rounded-full ${LIQUID_REVEAL}`}
            style={{ ...liquidRevealDelay(80), boxShadow: INQUIRY_CTA_OUTER_SHADOW, transformOrigin: "center" }}
          >
            <button
              type="button"
              onClick={onBegin}
              aria-expanded="false"
              aria-controls="questionnaire-flow"
              className="relative inline-flex items-center gap-1.5 rounded-full border-0 px-3 py-1 sm:px-3.5 sm:py-1 text-[13px] sm:text-[14px] font-medium tracking-tight leading-none [-webkit-tap-highlight-color:transparent]"
              style={{
                background:
                  "linear-gradient(180deg, #f4f4f4 0%, #ffffff 52%, #e8e8e8 100%)",
                color: "#757575",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.95)," +
                  "inset 0 -1.5px 0 rgba(0,0,0,0.1)",
              }}
              {...inquiryCtaHover}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none rounded-full overflow-hidden"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                  backgroundSize: "180px 180px",
                  mixBlendMode: "multiply",
                  opacity: 0.14,
                }}
              />
              <span className="relative inline-grid place-items-center leading-none">
                <span className="col-start-1 row-start-1">Begin</span>
              </span>
              <span
                className="relative flex items-center justify-center w-6 h-6 rounded-full shrink-0 overflow-hidden"
                style={{
                  background:
                    "radial-gradient(130% 90% at 50% 0%, rgba(0,0,0,0.1) 0%, transparent 52%)," +
                    "radial-gradient(90% 70% at 50% 110%, rgba(255,255,255,0.75) 0%, transparent 65%)," +
                    "rgba(0,0,0,0.07)",
                  boxShadow:
                    "inset 0 2.5px 4px rgba(0,0,0,0.14)," +
                    "inset 0 -1.5px 2.5px rgba(255,255,255,0.85)," +
                    "inset 0 0 0 0.5px rgba(0,0,0,0.08)," +
                    "0 1px 2px rgba(0,0,0,0.08)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none rounded-full"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 40%)",
                  }}
                />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="relative block h-3 w-3"
                  aria-hidden="true"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </span>
            </button>
          </span>
        )}
        </div>
      </div>

      {disclosed && (
        <div
          id="questionnaire-flow"
          ref={flowRevealRef}
          className={cn(
            "quiz-dark mt-10 sm:mt-12 w-full mx-auto transition-[max-width] duration-500 ease-out",
            LIQUID_REVEAL,
            stage === "quiz" ? "max-w-md" : "max-w-2xl"
          )}
        >
        {stage !== "quiz" && (
          <div ref={transcriptRevealRef} className={`flex justify-end ${LIQUID_REVEAL}`}>
            <div
              className="max-w-[85%] sm:max-w-[80%] rounded-3xl px-5 py-5 sm:px-6 sm:py-6 flex flex-col gap-4"
              style={{ background: "var(--sh-card)" }}
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
          // max-w-none lets the component fill the narrow wrapper above instead
          // of its own max-w-[520px] (cn uses tailwind-merge, so this wins).
          <AskUserQuestions
            key={`quiz-${resetKey}`}
            questions={QUIZ_QUESTIONS}
            onComplete={onQuizComplete}
            className="mx-auto max-w-none rounded-2xl border border-dashed border-[rgb(var(--line))] bg-transparent"
          />
        )}

        {/* Inert chat input while the reply types: it holds the space the real
            questions are about to occupy, so the swap doesn't jump. */}
        {stage === "typing" && (
          <div
            ref={typingRevealRef}
            aria-hidden
            className={`mt-8 sm:mt-10 w-full rounded-2xl border border-border px-4 py-3 flex items-center gap-3 ${LIQUID_REVEAL}`}
            style={{ background: "var(--sh-card)", opacity: 0.55 }}
          >
            <span className="text-[14px] tracking-tight text-muted-foreground flex-1">
              Type your answer...
            </span>
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-full shrink-0"
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
            <AskUserQuestions
              key={`intake-${resetKey}`}
              questions={INTAKE_QUESTIONS}
              onComplete={onIntakeComplete}
              className="mx-auto max-w-none rounded-2xl border border-dashed border-[rgb(var(--line))] bg-transparent"
            />
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

const CAROUSEL_LOGO_DROP = "drop-shadow(0 3px 10px rgba(0,0,0,0.45))";
const CAROUSEL_LOGO_WHITE =
  "brightness(0) invert(1) drop-shadow(0 3px 6px rgba(0,0,0,0.55)) drop-shadow(0 1px 14px rgba(0,0,0,0.4))";

// Force white for dark-on-transparent marks (Aether, Trippie, Allure, Mood
// Swings). Skip for logos that already ship white-on-transparent (Ellora) —
// invert turns their white artwork black.
const CAROUSEL_LOGO_STYLE: Record<string, { width: string; filter?: string }> = {
  aether: { width: "71.5%", filter: CAROUSEL_LOGO_WHITE },
  inboundly: { width: "38%" },
  "trippie-redd": { width: "48%", filter: CAROUSEL_LOGO_WHITE },
  "ellora-la": { width: "56%" },
  "allure-new-york": { width: "58%", filter: CAROUSEL_LOGO_WHITE },
  "mood-swings": { width: "62%", filter: CAROUSEL_LOGO_WHITE },
  "subtle-goods": { width: "46%" },
  "ft-gioo": { width: "44%" },
  "samuel-norris": { width: "68%" },
};

function carouselLogoStyle(slug: string) {
  const style = CAROUSEL_LOGO_STYLE[slug];
  return {
    width: style?.width ?? "52%",
    filter: style?.filter ?? CAROUSEL_LOGO_DROP,
  };
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
// Inline-block with a tight negative vertical margin: the padding would
// otherwise push the pill's line taller than its neighbours and make the
// paragraph's leading uneven.
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-[1px] -my-[1px] whitespace-nowrap align-middle"
      style={{ background: "rgba(26,26,26,0.06)", color: "#1a1a1a" }}
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
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const intro =
    "Ideas and identity are rarely the problem. Execution is. We take what a company, brand, or person stands for and carry it through every [[detail]], until the result feels effortless to the people moving through it.";
  const points = [
    "The best design disappears into the experience. Nobody applauds the [[restraint]], and that's exactly how you know it landed.",
    "Identity isn't expressed in one big gesture. It's carried in a hundred small decisions that all [[agree]] with each other.",
  ];

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    setHeight(open ? el.scrollHeight : 0);
  }, [open]);

  return (
    <section className="rise rise--liquid w-full max-w-[88rem] mx-auto px-6 sm:px-8">
      <div className="max-w-2xl sm:max-w-3xl sm:mx-auto">
        <LiquidText
          pRef={introRef}
          text={intro}
          className="text-[16.5px] sm:text-[19px] leading-relaxed tracking-tight text-left"
          style={{ color: "#5c5c5c" }}
        />
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-2 text-[16.5px] sm:text-[19px] tracking-tight text-left"
            style={{ color: "#1a1a1a" }}
          >
            How we think about execution
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0"
              style={{
                color: "#5c5c5c",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 350ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div
            style={{
              height,
              overflow: "hidden",
              transition: "height 350ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div ref={bodyRef} className="flex flex-col gap-4 pt-4 sm:max-w-xl">
              {points.map((text, i) => (
                <LiquidText
                  key={text}
                  text={text}
                  delayMs={open ? 80 * (i + 1) : 0}
                  className="text-[16.5px] sm:text-[19px] leading-relaxed tracking-tight text-left"
                  style={{ color: "#5c5c5c" }}
                />
              ))}
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

function AiApproach() {
  const first =
    "AI hasn't changed what we believe about execution; it's changed how much of it we can afford. A studio our size can now explore [[more]] directions, discard the wrong ones sooner, and spend the saved time where it counts: on the version worth shipping.";
  const second =
    "None of that works without judgment, and judgment comes from reps. Years of projects have built our grip on the [[fundamentals]]: design systems that hold up as a brand grows, infrastructure that stays out of the way, and details people feel before they notice.";
  return (
    <section className="rise rise--liquid w-[100vw] ml-[calc(50%-50vw)] sm:mr-[calc(50%-50vw)]">
      <div className="pl-[calc(0.375rem+6px+1.25rem)] pr-1.5 sm:pr-0 sm:pl-[calc(50vw-384px)]">
        <div className="max-w-xl sm:max-w-2xl">
          <LiquidText
            text={first}
            className="text-[16.5px] sm:text-[19px] leading-relaxed tracking-tight text-left"
            style={{ color: "#5c5c5c" }}
          />
          <LiquidText
            text={second}
            delayMs={160}
            className="text-[16.5px] sm:text-[19px] leading-relaxed tracking-tight text-left mt-5"
            style={{ color: "#5c5c5c" }}
          />
        </div>
      </div>
    </section>
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
      card.style.boxShadow = proximity > 0.01 ? `0 0 ${14 * proximity}px 0px rgba(0,0,0,${0.2 * proximity})` : "none";
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
                  className="relative block shrink-0 snap-center sm:snap-align-none rounded-2xl overflow-hidden group w-[300px] sm:w-[420px] sm:cursor-grab"
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
                    ...(activeIndex === i ? { boxShadow: "0 0 14px 0px rgba(0,0,0,0.2)" } : {}),
                  }}
                  onMouseEnter={(e) => { setHoveredIndex(i); e.currentTarget.style.boxShadow = "0 0 22px 0px rgba(0,0,0,0.35)"; }}
                  onMouseLeave={(e) => { setHoveredIndex((prev) => (prev === i ? null : prev)); if (activeIndex !== i) e.currentTarget.style.boxShadow = "none"; }}
                >
                  <>
                    <div className="absolute inset-0" style={{ backgroundColor: "#0a0a0a" }} />
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
                    <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                      <Image
                        src={item.logo}
                        alt={item.client}
                        width={180}
                        height={180}
                        priority
                        quality={75}
                        sizes="230px"
                        className="h-auto object-contain"
                        style={carouselLogoStyle(item.slug)}
                        draggable={false}
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
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-xl px-3 py-2" style={{ background: "rgb(var(--fg) / 0.06)" }}>
                      <p
                        className="text-[15px] sm:text-[16px] leading-snug tracking-tight w-full"
                        style={{ color: "rgb(var(--muted))" }}
                      >
                        {item.blurb}
                      </p>
                    </div>
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

function VisualLayout({ initialWork }: { initialWork: ClientCarouselItem[] }) {
  const [dashboardModalOpen, setDashboardModalOpen] = useState(false);
  const [accentColor, setAccentColor] = useState(WORK_ITEMS[0].accent);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  return (
    <>
    <DashboardModal open={dashboardModalOpen} onClose={() => setDashboardModalOpen(false)} />
    <main className="page-container relative mx-3 sm:mx-auto w-auto sm:w-full max-w-[88rem] flex flex-col">
      <LightCard>
        <div className="mx-auto w-full max-w-[88rem] flex flex-col">
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
          <div className="py-7 sm:py-12 max-sm:-mt-[18dvh] sm:-mt-[7dvh]" />

          <DesignPhilosophy introRef={introRef} />

          <div className="py-10 sm:py-8" />

          <ClientCarousel initialItems={initialWork} />

          <div className="py-10 sm:py-8" />

          <AiApproach />

          <div className="py-16 sm:py-14" />
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
        <div className="mx-auto w-full max-w-[88rem] flex flex-col">
          <div className="py-4 sm:py-6" />

          <ServicesSection />

          <div className="py-14 sm:py-20" />

          <Questionnaire onStartConversation={() => setDashboardModalOpen(true)} />

          <div className="py-20 sm:py-20" />
        </div>
      </div>

    </main>
    </>
  );
}
