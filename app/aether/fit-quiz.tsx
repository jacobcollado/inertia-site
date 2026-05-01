"use client";

import Link from "next/link";
import { useState, useRef } from "react";

type Answer = "yes" | "no";

const QUESTIONS: { id: string; text: string; sub: string }[] = [
  {
    id: "brand",
    text: "Do you care how your storefront feels?",
    sub: "Aether is built for brands that treat the site as part of the product — not just a place to list SKUs.",
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

function rgba([a, b, c]: [number, number, number], alpha = 1) {
  return `rgba(${a},${b},${c},${alpha})`;
}

const A: [number, number, number] = [56, 180, 255];

// Q1 — brand feel: a storefront with presence (refined hero layout)
function SketchBrand({ visible }: { visible: boolean }) {
  const o = (v: number) => visible ? v : 0;
  return (
    <svg viewBox="0 0 160 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true"
      style={{ transition: "opacity 400ms cubic-bezier(0.22,1,0.36,1)", opacity: visible ? 1 : 0 }}>
      {/* Browser frame */}
      <rect x="6" y="6" width="148" height="108" rx="3" stroke={rgba([160,160,160], o(0.18))} strokeWidth="0.8" />
      <line x1="6" y1="18" x2="154" y2="18" stroke={rgba([160,160,160], o(0.12))} strokeWidth="0.6" />
      {/* Nav logo */}
      <line x1="14" y1="12" x2="38" y2="12" stroke={rgba([160,160,160], o(0.3))} strokeWidth="1.2" />
      {/* Hero full-bleed */}
      <rect x="6" y="18" width="148" height="52" rx="0" fill={rgba(A, o(0.07))} stroke="none" />
      {/* Large headline */}
      <line x1="18" y1="33" x2="100" y2="33" stroke={rgba(A, o(0.85))} strokeWidth="2.2" />
      <line x1="18" y1="40" x2="82" y2="40" stroke={rgba(A, o(0.55))} strokeWidth="1.6" />
      <line x1="18" y1="47" x2="60" y2="47" stroke={rgba([160,160,160], o(0.3))} strokeWidth="0.8" />
      {/* CTA */}
      <rect x="18" y="54" width="36" height="10" rx="3" fill={rgba(A, o(0.9))} stroke="none" />
      {/* Product grid below hero */}
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x={6 + i * 49} y="76" width="43" height="32" rx="1" fill={rgba([160,160,160], o(0.05))} stroke={rgba([160,160,160], o(0.14))} strokeWidth="0.6" />
          <line x1={12 + i * 49} y1="98" x2={40 + i * 49} y2="98" stroke={rgba([160,160,160], o(0.22))} strokeWidth="0.6" />
          <line x1={12 + i * 49} y1="102" x2={30 + i * 49} y2="102" stroke={rgba([160,160,160], o(0.14))} strokeWidth="0.5" />
        </g>
      ))}
    </svg>
  );
}

// Q2 — right buyer: target / precision
function SketchTarget({ visible }: { visible: boolean }) {
  const o = (v: number) => visible ? v : 0;
  const cx = 80, cy = 58;
  return (
    <svg viewBox="0 0 160 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true"
      style={{ transition: "opacity 400ms cubic-bezier(0.22,1,0.36,1)", opacity: visible ? 1 : 0 }}>
      {[36, 24, 14, 6].map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill={i === 0 ? r === 36 ? rgba([160,160,160], o(0.04)) : "none" : "none"}
          stroke={i === 3 ? rgba([A[0],A[1],A[2]], o(0.85)) : rgba([160,160,160], o(0.2 - i * 0.02))}
          strokeWidth={i === 3 ? 1.2 : 0.7} />
      ))}
      {/* Crosshairs */}
      <line x1={cx - 44} y1={cy} x2={cx - 40} y2={cy} stroke={rgba([160,160,160], o(0.2))} strokeWidth="0.6" />
      <line x1={cx + 40} y1={cy} x2={cx + 44} y2={cy} stroke={rgba([160,160,160], o(0.2))} strokeWidth="0.6" />
      <line x1={cx} y1={cy - 50} x2={cx} y2={cy - 40} stroke={rgba([160,160,160], o(0.2))} strokeWidth="0.6" />
      <line x1={cx} y1={cy + 40} x2={cx} y2={cy + 50} stroke={rgba([160,160,160], o(0.2))} strokeWidth="0.6" />
      {/* Bullseye dot */}
      <circle cx={cx} cy={cy} r={2.5} fill={rgba(A, o(1))} stroke="none" />
      {/* Hit marker arrow */}
      <line x1={cx + 30} y1={cy - 28} x2={cx + 8} y2={cy - 6} stroke={rgba(A, o(0.6))} strokeWidth="0.8" strokeDasharray="2 2" />
      <circle cx={cx + 32} cy={cy - 30} r={2} fill={rgba(A, o(0.5))} stroke="none" />
      {/* Label lines */}
      <line x1="12" y1="102" x2="72" y2="102" stroke={rgba([160,160,160], o(0.18))} strokeWidth="0.7" />
      <line x1="12" y1="107" x2="54" y2="107" stroke={rgba([160,160,160], o(0.12))} strokeWidth="0.5" />
    </svg>
  );
}

// Q3 — fast ship: a rocket / launch timeline
function SketchLaunch({ visible }: { visible: boolean }) {
  const o = (v: number) => visible ? v : 0;
  return (
    <svg viewBox="0 0 160 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true"
      style={{ transition: "opacity 400ms cubic-bezier(0.22,1,0.36,1)", opacity: visible ? 1 : 0 }}>
      {/* Timeline spine */}
      <line x1="20" y1="80" x2="140" y2="80" stroke={rgba([160,160,160], o(0.2))} strokeWidth="0.7" />
      {/* Today marker */}
      <circle cx="36" cy="80" r="3" fill={rgba([160,160,160], o(0.15))} stroke={rgba([160,160,160], o(0.3))} strokeWidth="0.7" />
      <line x1="36" y1="77" x2="36" y2="64" stroke={rgba([160,160,160], o(0.2))} strokeWidth="0.6" />
      <line x1="28" y1="62" x2="58" y2="62" stroke={rgba([160,160,160], o(0.2))} strokeWidth="0.6" />
      <line x1="28" y1="58" x2="52" y2="58" stroke={rgba([160,160,160], o(0.14))} strokeWidth="0.5" />
      {/* Launch marker — accent */}
      <circle cx="110" cy="80" r="4" fill={rgba(A, o(0.15))} stroke={rgba(A, o(0.8))} strokeWidth="1.0" />
      <line x1="110" y1="76" x2="110" y2="42" stroke={rgba(A, o(0.5))} strokeWidth="0.8" />
      {/* Rocket body */}
      <path d="M102 42 Q110 28 118 42 L118 56 Q110 60 102 56 Z" fill={rgba(A, o(0.12))} stroke={rgba(A, o(0.65))} strokeWidth="0.9" />
      {/* Rocket window */}
      <circle cx="110" cy="46" r="3" fill={rgba(A, o(0.3))} stroke={rgba(A, o(0.6))} strokeWidth="0.6" />
      {/* Flame */}
      <path d="M106 56 Q110 64 114 56" fill={rgba(A, o(0.2))} stroke={rgba(A, o(0.4))} strokeWidth="0.7" />
      {/* Week bracket */}
      <line x1="36" y1="92" x2="110" y2="92" stroke={rgba([160,160,160], o(0.18))} strokeWidth="0.5" />
      <line x1="36" y1="89" x2="36" y2="95" stroke={rgba([160,160,160], o(0.22))} strokeWidth="0.5" />
      <line x1="110" y1="89" x2="110" y2="95" stroke={rgba(A, o(0.4))} strokeWidth="0.6" />
      <line x1="60" y1="96" x2="90" y2="96" stroke={rgba([160,160,160], o(0.18))} strokeWidth="0.6" />
      <line x1="60" y1="100" x2="80" y2="100" stroke={rgba([160,160,160], o(0.12))} strokeWidth="0.5" />
    </svg>
  );
}

// Q4 — ownership: a key / ownership symbol
function SketchOwnership({ visible }: { visible: boolean }) {
  const o = (v: number) => visible ? v : 0;
  return (
    <svg viewBox="0 0 160 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true"
      style={{ transition: "opacity 400ms cubic-bezier(0.22,1,0.36,1)", opacity: visible ? 1 : 0 }}>
      {/* Key ring */}
      <circle cx="62" cy="54" r="20" fill={rgba(A, o(0.07))} stroke={rgba(A, o(0.65))} strokeWidth="1.1" />
      <circle cx="62" cy="54" r="12" fill="none" stroke={rgba(A, o(0.3))} strokeWidth="0.7" />
      <circle cx="62" cy="54" r="4" fill={rgba(A, o(0.5))} stroke="none" />
      {/* Key shaft */}
      <line x1="78" y1="62" x2="118" y2="82" stroke={rgba(A, o(0.7))} strokeWidth="1.4" />
      {/* Key teeth */}
      <line x1="96" y1="71" x2="100" y2="66" stroke={rgba(A, o(0.6))} strokeWidth="1.0" />
      <line x1="104" y1="75" x2="108" y2="70" stroke={rgba(A, o(0.5))} strokeWidth="1.0" />
      <line x1="112" y1="79" x2="116" y2="74" stroke={rgba(A, o(0.4))} strokeWidth="1.0" />
      {/* Ownership tag */}
      <rect x="22" y="82" width="52" height="24" rx="3" fill={rgba([160,160,160], o(0.05))} stroke={rgba([160,160,160], o(0.18))} strokeWidth="0.6" />
      <line x1="28" y1="90" x2="66" y2="90" stroke={rgba([160,160,160], o(0.25))} strokeWidth="0.7" />
      <line x1="28" y1="95" x2="54" y2="95" stroke={rgba([160,160,160], o(0.16))} strokeWidth="0.5" />
      {/* "Forever" highlight on tag */}
      <line x1="28" y1="90" x2="48" y2="90" stroke={rgba(A, o(0.55))} strokeWidth="0.9" />
      {/* Shine marks */}
      <line x1="48" y1="36" x2="52" y2="32" stroke={rgba(A, o(0.3))} strokeWidth="0.7" />
      <line x1="54" y1="32" x2="56" y2="27" stroke={rgba(A, o(0.2))} strokeWidth="0.5" />
    </svg>
  );
}

// Verdict check mark
function SketchVerdict({ yesCount }: { yesCount: number }) {
  const strong = yesCount >= 3;
  const ok = yesCount === 2;
  const fill: [number, number, number] = strong ? A : ok ? [160, 200, 100] : [160, 160, 160];
  return (
    <svg viewBox="0 0 160 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      <circle cx="80" cy="56" r="32" fill={rgba(fill, 0.08)} stroke={rgba(fill, 0.5)} strokeWidth="1.0" />
      {strong || ok ? (
        <polyline points="62,56 74,68 98,44" stroke={rgba(fill, 0.85)} strokeWidth="2.0" />
      ) : (
        <>
          <line x1="70" y1="46" x2="90" y2="66" stroke={rgba(fill, 0.7)} strokeWidth="1.6" />
          <line x1="90" y1="46" x2="70" y2="66" stroke={rgba(fill, 0.7)} strokeWidth="1.6" />
        </>
      )}
      <line x1="30" y1="100" x2="130" y2="100" stroke={rgba(fill, 0.15)} strokeWidth="0.6" />
      <line x1="40" y1="106" x2="120" y2="106" stroke={rgba(fill, 0.1)} strokeWidth="0.5" />
    </svg>
  );
}

const SKETCHES = [SketchBrand, SketchTarget, SketchLaunch, SketchOwnership];

export function FitQuiz() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [transitioning, setTransitioning] = useState(false);
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
          cta: { href: "/aether#pricing", label: "See pricing", glyph: "↓" },
        }
      : yesCount === 2
      ? {
          title: "Likely a good match.",
          body: "Aether covers most of what you're after. Skim the tiers, and get in touch if you want a quick check before buying.",
          cta: { href: "/aether#pricing", label: "See pricing", glyph: "↓" },
        }
      : {
          title: "Let's talk first.",
          body: "A five-minute conversation will save us both time. I'll tell you honestly whether Aether fits, or point you somewhere better.",
          cta: { href: "/contact", label: "Send a note", glyph: "→" },
        };

  const pick = (a: Answer) => {
    if (lock.current || done) return;
    lock.current = true;
    setDir(1);
    setTransitioning(true);
    setTimeout(() => {
      setAnswers((prev) => [...prev, a]);
      setTransitioning(false);
      lock.current = false;
    }, 240);
  };

  const goBack = () => {
    if (lock.current || answers.length === 0) return;
    lock.current = true;
    setDir(-1);
    setTransitioning(true);
    setTimeout(() => {
      setAnswers((prev) => prev.slice(0, -1));
      setTransitioning(false);
      lock.current = false;
    }, 240);
  };

  const reset = () => {
    setDir(-1);
    setTransitioning(true);
    setTimeout(() => {
      setAnswers([]);
      setTransitioning(false);
    }, 240);
  };

  const q = QUESTIONS[Math.min(index, TOTAL - 1)];
  const CurrentSketch = SKETCHES[Math.min(index, TOTAL - 1)];

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div className="h-px w-full bg-[rgb(var(--line))] overflow-hidden">
        <div
          className="h-full"
          style={{
            width: `${progress * 100}%`,
            background: "rgb(56,180,255)",
            transition: "width 500ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col sm:flex-row gap-0">
        {/* Sketch pane */}
        <div className="w-full sm:w-[260px] shrink-0 flex items-center justify-center py-8 sm:py-10 px-6 sm:border-r border-[rgb(var(--line))] sm:pr-8"
          style={{
            borderBottom: "1px solid rgb(var(--line))",
          }}
        >
          <div className="w-full max-w-[220px] h-[160px] sm:max-w-none sm:w-full sm:h-[160px] relative">
            {/* Stack all sketches, only the active one is visible */}
            {!done ? (
              SKETCHES.map((Sketch, i) => (
                <div key={i} className="absolute inset-0"
                  style={{
                    opacity: i === Math.min(index, TOTAL - 1) && !transitioning ? 1 : 0,
                    transition: "opacity 300ms cubic-bezier(0.22,1,0.36,1)",
                  }}>
                  <Sketch visible={i === Math.min(index, TOTAL - 1) && !transitioning} />
                </div>
              ))
            ) : (
              <SketchVerdict yesCount={yesCount} />
            )}
          </div>
        </div>

        {/* Content pane */}
        <div className="flex-1 px-6 sm:pl-8 sm:pr-8 pt-6 sm:pt-10 pb-6 sm:pb-10 flex flex-col justify-between min-h-[200px]">
          <div
            key={done ? "verdict" : `q-${index}`}
            className="flex flex-col gap-3 flex-1"
            style={{
              opacity: transitioning ? 0 : 1,
              transform: transitioning
                ? `translateX(${dir * 14}px)`
                : "translateX(0)",
              filter: transitioning ? "blur(5px)" : "blur(0)",
              transition:
                "opacity 240ms cubic-bezier(0.22,1,0.36,1), transform 280ms cubic-bezier(0.22,1,0.36,1), filter 240ms cubic-bezier(0.22,1,0.36,1)",
              willChange: "opacity, transform, filter",
            }}
          >
            {!done ? (
              <>
                <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] tabular-nums">
                  {String(index + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
                </p>
                <h3 className="text-[1.35rem] sm:text-[1.45rem] font-medium tracking-tighter leading-[1.25] text-[rgb(var(--fg))]">
                  {q.text}
                </h3>
                <p className="text-[13.5px] sm:text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md flex-1">
                  {q.sub}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => pick("yes")}
                    className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-6 h-9 text-[13px] tracking-tight hover:opacity-90 transition-opacity active:scale-[0.97] [-webkit-tap-highlight-color:transparent]"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => pick("no")}
                    className="inline-flex items-center justify-center rounded-full border border-[rgb(var(--line))] text-[rgb(var(--fg))] px-6 h-9 text-[13px] tracking-tight hover:border-[rgb(var(--fg))] transition-colors active:scale-[0.97] [-webkit-tap-highlight-color:transparent]"
                  >
                    No
                  </button>
                  {answers.length > 0 && (
                    <button
                      onClick={goBack}
                      className="ml-auto text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors [-webkit-tap-highlight-color:transparent]"
                    >
                      back
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] tabular-nums">
                  {yesCount} of {TOTAL} yes
                </p>
                <h3 className="text-[1.35rem] sm:text-[1.45rem] font-medium tracking-tighter leading-[1.25] text-[rgb(var(--fg))]">
                  {verdict.title}
                </h3>
                <p className="text-[12.5px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md flex-1">
                  {verdict.body}
                </p>
                <div className="flex items-center gap-5 pt-2">
                  {verdict.cta.href.startsWith("/") ? (
                    <Link
                      href={verdict.cta.href}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-6 h-9 text-[13px] tracking-tight hover:opacity-90 transition-opacity"
                    >
                      {verdict.cta.label}
                      <span aria-hidden="true">{verdict.cta.glyph}</span>
                    </Link>
                  ) : (
                    <a
                      href={verdict.cta.href}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-6 h-9 text-[13px] tracking-tight hover:opacity-90 transition-opacity"
                    >
                      {verdict.cta.label}
                      <span aria-hidden="true">{verdict.cta.glyph}</span>
                    </a>
                  )}
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
