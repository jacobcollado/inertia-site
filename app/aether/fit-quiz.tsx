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

function rgba([a, b, c]: [number, number, number], alpha = 1) {
  return `rgba(${a},${b},${c},${alpha})`;
}

const A: [number, number, number] = [56, 180, 255];

function SketchBrand({ visible }: { visible: boolean }) {
  const o = (v: number) => visible ? v : 0;
  return (
    <svg viewBox="0 0 200 150" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true"
      style={{ transition: "opacity 300ms ease", opacity: visible ? 1 : 0 }}>
      <rect x="6" y="6" width="188" height="138" rx="3" stroke={rgba([160,160,160], o(0.18))} strokeWidth="0.8" />
      <line x1="6" y1="20" x2="194" y2="20" stroke={rgba([160,160,160], o(0.12))} strokeWidth="0.6" />
      <line x1="16" y1="13" x2="48" y2="13" stroke={rgba([160,160,160], o(0.28))} strokeWidth="1.1" />
      <rect x="6" y="20" width="188" height="66" fill={rgba(A, o(0.06))} stroke="none" />
      <line x1="20" y1="42" x2="130" y2="42" stroke={rgba(A, o(0.85))} strokeWidth="2.8" />
      <line x1="20" y1="52" x2="106" y2="52" stroke={rgba(A, o(0.5))} strokeWidth="1.8" />
      <line x1="20" y1="61" x2="76" y2="61" stroke={rgba([160,160,160], o(0.28))} strokeWidth="0.9" />
      <rect x="20" y="70" width="48" height="12" rx="2" fill={rgba(A, o(0.9))} stroke="none" />
      <line x1="74" y1="76" x2="120" y2="76" stroke={rgba([160,160,160], o(0.18))} strokeWidth="0.7" />
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x={8 + i * 62} y="94" width="56" height="42" rx="1.5" fill={rgba([160,160,160], o(0.04))} stroke={rgba([160,160,160], o(0.14))} strokeWidth="0.6" />
          <line x1={16 + i * 62} y1="124" x2={56 + i * 62} y2="124" stroke={rgba([160,160,160], o(0.2))} strokeWidth="0.6" />
          <line x1={16 + i * 62} y1="130" x2={40 + i * 62} y2="130" stroke={rgba([160,160,160], o(0.13))} strokeWidth="0.5" />
        </g>
      ))}
    </svg>
  );
}

function SketchTarget({ visible }: { visible: boolean }) {
  const o = (v: number) => visible ? v : 0;
  const cx = 100, cy = 72;
  return (
    <svg viewBox="0 0 200 150" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true"
      style={{ transition: "opacity 300ms ease", opacity: visible ? 1 : 0 }}>
      {[48, 34, 20, 9].map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill={i === 0 ? rgba([160,160,160], o(0.03)) : "none"}
          stroke={i === 3 ? rgba(A, o(0.85)) : rgba([160,160,160], o(0.18 - i * 0.02))}
          strokeWidth={i === 3 ? 1.4 : 0.7} />
      ))}
      <line x1={cx - 58} y1={cy} x2={cx - 52} y2={cy} stroke={rgba([160,160,160], o(0.2))} strokeWidth="0.6" />
      <line x1={cx + 52} y1={cy} x2={cx + 58} y2={cy} stroke={rgba([160,160,160], o(0.2))} strokeWidth="0.6" />
      <line x1={cx} y1={cy - 60} x2={cx} y2={cy - 52} stroke={rgba([160,160,160], o(0.2))} strokeWidth="0.6" />
      <line x1={cx} y1={cy + 52} x2={cx} y2={cy + 60} stroke={rgba([160,160,160], o(0.2))} strokeWidth="0.6" />
      <circle cx={cx} cy={cy} r={3} fill={rgba(A, o(1))} stroke="none" />
      <line x1={cx + 38} y1={cy - 34} x2={cx + 12} y2={cy - 8} stroke={rgba(A, o(0.55))} strokeWidth="0.9" strokeDasharray="2 2" />
      <circle cx={cx + 41} cy={cy - 37} r={2.5} fill={rgba(A, o(0.5))} stroke="none" />
      <line x1="20" y1="128" x2="90" y2="128" stroke={rgba([160,160,160], o(0.16))} strokeWidth="0.7" />
      <line x1="20" y1="134" x2="68" y2="134" stroke={rgba([160,160,160], o(0.1))} strokeWidth="0.5" />
    </svg>
  );
}

function SketchLaunch({ visible }: { visible: boolean }) {
  const o = (v: number) => visible ? v : 0;
  return (
    <svg viewBox="0 0 200 150" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true"
      style={{ transition: "opacity 300ms ease", opacity: visible ? 1 : 0 }}>
      <line x1="24" y1="100" x2="176" y2="100" stroke={rgba([160,160,160], o(0.2))} strokeWidth="0.7" />
      <circle cx="48" cy="100" r="3.5" fill={rgba([160,160,160], o(0.12))} stroke={rgba([160,160,160], o(0.28))} strokeWidth="0.7" />
      <line x1="48" y1="96" x2="48" y2="78" stroke={rgba([160,160,160], o(0.18))} strokeWidth="0.6" />
      <line x1="34" y1="76" x2="74" y2="76" stroke={rgba([160,160,160], o(0.18))} strokeWidth="0.6" />
      <line x1="34" y1="71" x2="64" y2="71" stroke={rgba([160,160,160], o(0.12))} strokeWidth="0.5" />
      <circle cx="144" cy="100" r="5" fill={rgba(A, o(0.14))} stroke={rgba(A, o(0.8))} strokeWidth="1.1" />
      <line x1="144" y1="95" x2="144" y2="52" stroke={rgba(A, o(0.5))} strokeWidth="0.9" />
      <path d="M132 52 Q144 34 156 52 L156 70 Q144 76 132 70 Z" fill={rgba(A, o(0.12))} stroke={rgba(A, o(0.65))} strokeWidth="1.0" />
      <circle cx="144" cy="57" r="4" fill={rgba(A, o(0.3))} stroke={rgba(A, o(0.6))} strokeWidth="0.7" />
      <path d="M138 70 Q144 80 150 70" fill={rgba(A, o(0.18))} stroke={rgba(A, o(0.4))} strokeWidth="0.8" />
      <line x1="48" y1="114" x2="144" y2="114" stroke={rgba([160,160,160], o(0.16))} strokeWidth="0.5" />
      <line x1="48" y1="111" x2="48" y2="117" stroke={rgba([160,160,160], o(0.2))} strokeWidth="0.5" />
      <line x1="144" y1="111" x2="144" y2="117" stroke={rgba(A, o(0.4))} strokeWidth="0.6" />
      <line x1="80" y1="120" x2="116" y2="120" stroke={rgba([160,160,160], o(0.16))} strokeWidth="0.6" />
      <line x1="80" y1="125" x2="106" y2="125" stroke={rgba([160,160,160], o(0.1))} strokeWidth="0.5" />
    </svg>
  );
}

function SketchOwnership({ visible }: { visible: boolean }) {
  const o = (v: number) => visible ? v : 0;
  return (
    <svg viewBox="0 0 200 150" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true"
      style={{ transition: "opacity 300ms ease", opacity: visible ? 1 : 0 }}>
      <circle cx="78" cy="64" r="26" fill={rgba(A, o(0.07))} stroke={rgba(A, o(0.65))} strokeWidth="1.2" />
      <circle cx="78" cy="64" r="15" fill="none" stroke={rgba(A, o(0.28))} strokeWidth="0.7" />
      <circle cx="78" cy="64" r="5" fill={rgba(A, o(0.5))} stroke="none" />
      <line x1="98" y1="74" x2="152" y2="106" stroke={rgba(A, o(0.7))} strokeWidth="1.6" />
      <line x1="118" y1="88" x2="124" y2="81" stroke={rgba(A, o(0.6))} strokeWidth="1.1" />
      <line x1="128" y1="94" x2="134" y2="87" stroke={rgba(A, o(0.5))} strokeWidth="1.1" />
      <line x1="138" y1="100" x2="144" y2="93" stroke={rgba(A, o(0.4))} strokeWidth="1.1" />
      <rect x="28" y="104" width="66" height="30" rx="3" fill={rgba([160,160,160], o(0.04))} stroke={rgba([160,160,160], o(0.16))} strokeWidth="0.6" />
      <line x1="36" y1="114" x2="84" y2="114" stroke={rgba([160,160,160], o(0.22))} strokeWidth="0.7" />
      <line x1="36" y1="120" x2="68" y2="120" stroke={rgba([160,160,160], o(0.14))} strokeWidth="0.5" />
      <line x1="36" y1="114" x2="60" y2="114" stroke={rgba(A, o(0.55))} strokeWidth="0.9" />
      <line x1="60" y1="44" x2="65" y2="38" stroke={rgba(A, o(0.3))} strokeWidth="0.7" />
      <line x1="68" y1="38" x2="70" y2="32" stroke={rgba(A, o(0.18))} strokeWidth="0.5" />
    </svg>
  );
}

function SketchVerdict({ yesCount }: { yesCount: number }) {
  const strong = yesCount >= 3;
  const ok = yesCount === 2;
  const fill: [number, number, number] = strong ? A : ok ? [160, 200, 100] : [160, 160, 160];
  return (
    <svg viewBox="0 0 200 150" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      <circle cx="100" cy="68" r="40" fill={rgba(fill, 0.07)} stroke={rgba(fill, 0.45)} strokeWidth="1.1" />
      {strong || ok ? (
        <polyline points="78,68 93,83 122,52" stroke={rgba(fill, 0.85)} strokeWidth="2.4" />
      ) : (
        <>
          <line x1="86" y1="55" x2="114" y2="83" stroke={rgba(fill, 0.7)} strokeWidth="1.8" />
          <line x1="114" y1="55" x2="86" y2="83" stroke={rgba(fill, 0.7)} strokeWidth="1.8" />
        </>
      )}
      <line x1="40" y1="122" x2="160" y2="122" stroke={rgba(fill, 0.14)} strokeWidth="0.6" />
      <line x1="54" y1="129" x2="146" y2="129" stroke={rgba(fill, 0.09)} strokeWidth="0.5" />
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

  const pick = (a: Answer) => {
    if (lock.current || done) return;
    lock.current = true;
    setDir(1);
    setTransitioning(true);
    setTimeout(() => {
      setAnswers((prev) => [...prev, a]);
      setTransitioning(false);
      lock.current = false;
    }, 220);
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
    }, 220);
  };

  const reset = () => {
    setDir(-1);
    setTransitioning(true);
    setTimeout(() => {
      setAnswers([]);
      setTransitioning(false);
    }, 220);
  };

  const q = QUESTIONS[Math.min(index, TOTAL - 1)];

  return (
    <div className="flex flex-col">
      {/* Progress bar */}
      <div className="h-px w-full bg-[rgb(var(--line))] overflow-hidden">
        <div
          className="h-full"
          style={{
            width: `${progress * 100}%`,
            background: "rgb(var(--blue))",
            transition: "width 500ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row">

        {/* Sketch pane — hidden on mobile */}
        <div className="hidden sm:flex w-[280px] shrink-0 items-center justify-center py-10 px-8 border-r border-[rgb(var(--line))]">
          <div className="w-full h-[200px] relative">
            {!done ? (
              SKETCHES.map((Sketch, i) => (
                <div key={i} className="absolute inset-0"
                  style={{
                    opacity: i === Math.min(index, TOTAL - 1) && !transitioning ? 1 : 0,
                    transition: "opacity 280ms ease",
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
        <div className="flex-1 px-6 sm:px-10 py-8 sm:py-10 flex flex-col justify-between gap-6 min-h-[220px]">
          <div
            key={done ? "verdict" : `q-${index}`}
            className="flex flex-col gap-5 flex-1"
            style={{
              opacity: transitioning ? 0 : 1,
              transform: transitioning ? `translateX(${dir * 12}px)` : "translateX(0)",
              transition: "opacity 220ms ease, transform 260ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            {!done ? (
              <>
                {/* Counter + dots */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] tabular-nums">
                    {String(index + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {QUESTIONS.map((_, i) => (
                      <span key={i} className="block w-1.5 h-1.5 rounded-full transition-colors duration-200"
                        style={{ background: i < index ? "rgb(var(--blue))" : i === index ? "rgb(var(--fg))" : "rgb(var(--line))" }} />
                    ))}
                  </div>
                </div>

                <h3 className="text-[1.35rem] sm:text-[1.65rem] font-medium tracking-[-0.03em] leading-[1.2] text-[rgb(var(--fg))]">
                  {q.text}
                </h3>
                <p className="text-[13.5px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md">
                  {q.sub}
                </p>

                {/* Yes / No — full-width on mobile, inline on desktop */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                  <div className="flex gap-3">
                    <button
                      onClick={() => pick("yes")}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-7 h-12 sm:h-9 text-[14px] sm:text-[13px] tracking-tight font-medium hover:opacity-90 transition-opacity active:scale-[0.97] [-webkit-tap-highlight-color:transparent]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => pick("no")}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center border border-[rgb(var(--line))] text-[rgb(var(--fg))] px-7 h-12 sm:h-9 text-[14px] sm:text-[13px] tracking-tight hover:border-[rgb(var(--fg))] transition-colors active:scale-[0.97] [-webkit-tap-highlight-color:transparent]"
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
                <div className="flex items-center gap-3">
                  <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] tabular-nums">
                    {yesCount} of {TOTAL} yes
                  </span>
                  <div className="flex items-center gap-1.5">
                    {answers.map((a, i) => (
                      <span key={i} className="block w-1.5 h-1.5 rounded-full"
                        style={{ background: a === "yes" ? "rgb(var(--blue))" : "rgb(var(--line))" }} />
                    ))}
                  </div>
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
                    className="inline-flex items-center justify-center bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-7 h-12 sm:h-9 text-[14px] sm:text-[13px] tracking-tight font-medium hover:opacity-90 transition-opacity"
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
