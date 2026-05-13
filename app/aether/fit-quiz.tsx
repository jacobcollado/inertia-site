"use client";

import Link from "next/link";
import { useState, useRef } from "react";

type Answer = "yes" | "no";

const QUESTIONS: { id: string; text: string; sub: string }[] = [
  {
    id: "brand",
    text: "Do you care how your storefront feels?",
    sub: "Aether is built for brands that treat the site as part of the product, not just a place to list SKUs.",
  },
  {
    id: "conversion",
    text: "Is converting the right buyer more important than every click?",
    sub: "The layout is tuned for intent. It pulls the right people forward and lets everyone else self-select out.",
  },
  {
    id: "ship",
    text: "Do you want to launch something considered in days?",
    sub: "Most stores are live within the week. No months of back-and-forth.",
  },
  {
    id: "ownership",
    text: "Would you rather own a theme than rent one?",
    sub: "One payment. No renewals. Yours to keep and build on.",
  },
];

const TOTAL = QUESTIONS.length;

// Neutral SVG visuals — use currentColor so they adapt to light/dark
function VisualBrand() {
  return (
    <svg viewBox="0 0 200 160" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      {/* Browser chrome */}
      <rect x="10" y="10" width="180" height="140" rx="4" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
      <line x1="10" y1="26" x2="190" y2="26" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.8" />
      <circle cx="22" cy="18" r="2.5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="32" cy="18" r="2.5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="42" cy="18" r="2.5" fill="currentColor" fillOpacity="0.1" />
      {/* Hero image area */}
      <rect x="18" y="33" width="164" height="62" rx="2" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.6" />
      {/* Headline */}
      <rect x="18" y="104" width="120" height="10" rx="2" fill="currentColor" fillOpacity="0.18" />
      <rect x="18" y="118" width="88" height="7" rx="2" fill="currentColor" fillOpacity="0.1" />
      {/* CTA pill */}
      <rect x="18" y="132" width="52" height="12" rx="6" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.8" />
      <line x1="28" y1="138" x2="60" y2="138" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.1" />
    </svg>
  );
}

function VisualConversion() {
  const baseline = 130;
  const bars = [
    { x: 35,  h: 14 },
    { x: 65,  h: 26 },
    { x: 95,  h: 42 },
    { x: 125, h: 62 },
    { x: 158, h: 90 },
  ];
  const barW = 20;
  return (
    <svg viewBox="0 0 200 160" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      {/* Grid */}
      {[0.33, 0.66, 1].map(t => (
        <line key={t} x1="20" y1={baseline - 90 * t} x2="185" y2={baseline - 90 * t}
          stroke="currentColor" strokeOpacity="0.07" strokeWidth="0.6" strokeDasharray="3 3" />
      ))}
      <line x1="20" y1={baseline} x2="185" y2={baseline} stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.7" />
      {/* Bars */}
      {bars.map((b, i) => (
        <g key={b.x}>
          <rect x={b.x - barW / 2} y={baseline - b.h} width={barW} height={b.h} rx="2"
            fill={i === 4 ? "currentColor" : "currentColor"}
            fillOpacity={i === 4 ? 0.18 : 0.07}
            stroke="currentColor"
            strokeOpacity={i === 4 ? 0.4 : 0.18}
            strokeWidth={i === 4 ? 1.0 : 0.55} />
          {i === 4 && (
            <rect x={b.x - barW / 2} y={baseline - b.h} width={barW} height={9} rx="2"
              fill="currentColor" fillOpacity="0.5" />
          )}
        </g>
      ))}
      {/* Trend */}
      <polyline points={bars.map(b => `${b.x},${baseline - b.h}`).join(" ")}
        stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.8" strokeDasharray="3 3" fill="none" />
      {/* 6× label */}
      <rect x="170" y={baseline - 90 - 14} width="18" height="12" rx="2.5"
        fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.7" />
      <line x1="173" y1={baseline - 90 - 8} x2="185" y2={baseline - 90 - 8}
        stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.9" />
    </svg>
  );
}

function VisualLaunch() {
  return (
    <svg viewBox="0 0 200 160" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      {/* Timeline track */}
      <line x1="24" y1="80" x2="176" y2="80" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.5" />
      {/* Steps */}
      {[
        { x: 44,  done: true,  current: false },
        { x: 84,  done: true,  current: false },
        { x: 124, done: true,  current: true  },
        { x: 164, done: false, current: false },
      ].map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={80} r={s.current ? 8 : 5.5}
            fill={s.done ? "currentColor" : "none"}
            fillOpacity={s.done ? (s.current ? 0.2 : 0.1) : 0}
            stroke="currentColor"
            strokeOpacity={s.done ? (s.current ? 0.7 : 0.35) : 0.2}
            strokeWidth={s.current ? 1.2 : 0.8} />
          {s.done && !s.current && (
            <polyline
              points={`${s.x - 2.5},80 ${s.x - 0.5},82 ${s.x + 3},77`}
              stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.1" fill="none" />
          )}
          {/* Label card */}
          <rect x={s.x - 18} y={i % 2 === 0 ? 56 : 92} width="36" height="12" rx="2"
            fill="currentColor" fillOpacity={s.current ? 0.07 : 0.03}
            stroke="currentColor" strokeOpacity={s.current ? 0.3 : 0.14} strokeWidth="0.6" />
          <line x1={s.x - 10} y1={i % 2 === 0 ? 62 : 98}
            x2={s.x + 10} y2={i % 2 === 0 ? 62 : 98}
            stroke="currentColor" strokeOpacity={s.current ? 0.35 : 0.18} strokeWidth={s.current ? 0.9 : 0.6} />
          <line x1={s.x} y1={i % 2 === 0 ? 68 : 86}
            x2={s.x} y2={i % 2 === 0 ? 74 : 88}
            stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.6" />
        </g>
      ))}
      {/* Days badge */}
      <rect x="74" y="108" width="52" height="18" rx="9"
        fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.8" />
      <line x1="84" y1="117" x2="116" y2="117" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.9" />
    </svg>
  );
}

function VisualOwnership() {
  return (
    <svg viewBox="0 0 200 160" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      {/* Receipt / card */}
      <rect x="52" y="22" width="96" height="116" rx="4"
        fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.14" strokeWidth="0.8" />
      {/* Tear line */}
      <line x1="52" y1="100" x2="148" y2="100" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.6" strokeDasharray="4 3" />
      {/* Amount */}
      <rect x="64" y="34" width="48" height="16" rx="2" fill="currentColor" fillOpacity="0.12" />
      <line x1="64" y1="60" x2="136" y2="60" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.6" />
      {/* Line items */}
      <line x1="64" y1="72" x2="108" y2="72" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.8" />
      <line x1="64" y1="80" x2="98" y2="80" stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.6" />
      {/* Checkmark stamp */}
      <circle cx="100" cy="120" r="14" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.9" />
      <polyline points="92,120 98,126 110,113" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" fill="none" />
      {/* "No renewals" line below */}
      <line x1="68" y1="144" x2="132" y2="144" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.6" />
    </svg>
  );
}

function VisualVerdict({ yesCount }: { yesCount: number }) {
  const strong = yesCount >= 3;
  return (
    <svg viewBox="0 0 200 160" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      <circle cx="100" cy="76" r="44"
        fill="currentColor" fillOpacity="0.05"
        stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
      <circle cx="100" cy="76" r="28"
        fill="currentColor" fillOpacity="0.05"
        stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.6" />
      {strong ? (
        <polyline points="82,76 94,88 120,62" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2.2" fill="none" />
      ) : yesCount === 2 ? (
        <>
          <polyline points="86,76 96,86 114,62" stroke="currentColor" strokeOpacity="0.45" strokeWidth="2" fill="none" />
          <line x1="90" y1="94" x2="110" y2="94" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" />
        </>
      ) : (
        <path d="M88 60 Q100 50 112 60 L112 78 Q100 84 88 78 Z"
          fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
      )}
      <line x1="44" y1="130" x2="156" y2="130" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.6" />
      <line x1="60" y1="137" x2="140" y2="137" stroke="currentColor" strokeOpacity="0.06" strokeWidth="0.5" />
    </svg>
  );
}

const VISUALS = [VisualBrand, VisualConversion, VisualLaunch, VisualOwnership];

export function FitQuiz() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [displayIndex, setDisplayIndex] = useState(0);
  const [displayDone, setDisplayDone] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const lock = useRef(false);

  const index = answers.length;
  const done = index >= TOTAL;
  const yesCount = answers.filter((a) => a === "yes").length;
  const progress = done ? 1 : index / TOTAL;

  const verdict =
    yesCount >= 3
      ? {
          title: "Aether is built for you.",
          body: "You're thinking about brand, buyer, and speed the same way the theme does. Pick a tier and be live this week.",
          cta: { href: "/aether#pricing", label: "See pricing" },
        }
      : yesCount === 2
      ? {
          title: "Likely a good match.",
          body: "Aether covers most of what you're after. Skim the tiers, and get in touch if you want a quick check before buying.",
          cta: { href: "/aether#pricing", label: "See pricing" },
        }
      : {
          title: "Let's talk first.",
          body: "A five-minute conversation will save us both time. I'll tell you honestly whether Aether fits, or point you somewhere better.",
          cta: { href: "/contact", label: "Send a note" },
        };

  function transition(nextIndex: number, nextDone: boolean, direction: 1 | -1) {
    if (lock.current) return;
    lock.current = true;
    setDir(direction);
    setPhase("out");
    setTimeout(() => {
      setDisplayIndex(nextIndex);
      setDisplayDone(nextDone);
      setPhase("in");
      setTimeout(() => {
        setPhase("idle");
        lock.current = false;
      }, 30);
    }, 200);
  }

  const pick = (a: Answer) => {
    if (lock.current || done) return;
    const nextAnswers = [...answers, a];
    const nextDone = nextAnswers.length >= TOTAL;
    setAnswers(nextAnswers);
    transition(nextAnswers.length, nextDone, 1);
  };

  const goBack = () => {
    if (lock.current || answers.length === 0) return;
    const nextAnswers = answers.slice(0, -1);
    setAnswers(nextAnswers);
    transition(nextAnswers.length, false, -1);
  };

  const reset = () => {
    setAnswers([]);
    transition(0, false, -1);
  };

  const q = QUESTIONS[Math.min(displayIndex, TOTAL - 1)];
  const Visual = VISUALS[Math.min(displayIndex, TOTAL - 1)];

  // Slide direction for content: out slides in dir, in slides from opposite
  const outX = dir * 16;
  const inX = dir * -16;

  const contentStyle: React.CSSProperties =
    phase === "out"
      ? { opacity: 0, transform: `translateX(${outX}px)`, transition: "opacity 200ms ease, transform 220ms cubic-bezier(0.4,0,1,1)" }
      : phase === "in"
      ? { opacity: 0, transform: `translateX(${inX}px)`, transition: "none" }
      : { opacity: 1, transform: "translateX(0)", transition: "opacity 260ms ease, transform 300ms cubic-bezier(0.22,1,0.36,1)" };

  return (
    <div className="flex flex-col">
      {/* Progress bar */}
      <div className="h-px w-full bg-[rgb(var(--line))] overflow-hidden">
        <div
          className="h-full"
          style={{
            width: `${progress * 100}%`,
            background: "rgb(var(--fg))",
            opacity: 0.35,
            transition: "width 500ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row">

        {/* Visual pane */}
        <div className="hidden sm:flex w-[240px] shrink-0 items-center justify-center border-r border-[rgb(var(--line))] py-8 px-6 overflow-hidden">
          <div
            className="w-full text-[rgb(var(--fg))]"
            style={contentStyle}
          >
            {!displayDone ? (
              <Visual />
            ) : (
              <VisualVerdict yesCount={yesCount} />
            )}
          </div>
        </div>

        {/* Content pane */}
        <div className="flex-1 px-6 sm:px-10 py-8 sm:py-10 flex flex-col justify-between gap-6 min-h-[240px]">
          <div className="flex flex-col gap-5 flex-1" style={contentStyle}>
            {!displayDone ? (
              <>
                {/* Step dots */}
                <div className="flex items-center gap-1.5">
                  {QUESTIONS.map((_, i) => (
                    <span
                      key={i}
                      className="block rounded-full"
                      style={{
                        width: i === displayIndex ? "20px" : "6px",
                        height: "6px",
                        background:
                          i < displayIndex
                            ? "rgb(var(--fg))"
                            : i === displayIndex
                            ? "rgb(var(--fg))"
                            : "rgb(var(--line))",
                        opacity: i < displayIndex ? 0.35 : i === displayIndex ? 0.8 : 1,
                        transition: "width 300ms cubic-bezier(0.22,1,0.36,1), opacity 300ms ease",
                      }}
                    />
                  ))}
                </div>

                <h3 className="text-[1.35rem] sm:text-[1.65rem] font-medium tracking-[-0.03em] leading-[1.2] text-[rgb(var(--fg))]">
                  {q.text}
                </h3>
                <p className="text-[13.5px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md">
                  {q.sub}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => pick("yes")}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-7 h-10 sm:h-9 text-[13px] tracking-tight font-medium hover:opacity-85 transition-opacity active:scale-[0.97] [-webkit-tap-highlight-color:transparent]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => pick("no")}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-full border border-[rgb(var(--line))] text-[rgb(var(--fg))] px-7 h-10 sm:h-9 text-[13px] tracking-tight hover:border-[rgb(var(--fg))/0.5] hover:bg-[rgb(var(--fg))/0.04] transition-colors active:scale-[0.97] [-webkit-tap-highlight-color:transparent]"
                    >
                      No
                    </button>
                  </div>
                  {answers.length > 0 && (
                    <button
                      onClick={goBack}
                      className="sm:ml-auto text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors [-webkit-tap-highlight-color:transparent]"
                    >
                      back
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  {answers.map((a, i) => (
                    <span
                      key={i}
                      className="block w-1.5 h-1.5 rounded-full"
                      style={{
                        background: a === "yes" ? "rgb(var(--fg))" : "rgb(var(--line))",
                        opacity: a === "yes" ? 0.7 : 1,
                      }}
                    />
                  ))}
                </div>

                <h3 className="text-[1.35rem] sm:text-[1.65rem] font-medium tracking-[-0.03em] leading-[1.2] text-[rgb(var(--fg))]">
                  {verdict.title}
                </h3>
                <p className="text-[13.5px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md">
                  {verdict.body}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                  <Link
                    href={verdict.cta.href}
                    className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-7 h-10 sm:h-9 text-[13px] tracking-tight font-medium hover:opacity-85 transition-opacity"
                  >
                    {verdict.cta.label}
                  </Link>
                  <button
                    onClick={reset}
                    className="text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
                  >
                    start over
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
