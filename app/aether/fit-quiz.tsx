"use client";

import Link from "next/link";
import { useState, useRef } from "react";

type Answer = "yes" | "no";

const STATEMENTS: { id: string; text: string; icon: React.ReactNode }[] = [
  {
    id: "brand",
    text: "My store should feel like the brand, not just a place to check out.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <circle cx="10" cy="8" r="4" />
        <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      </svg>
    ),
  },
  {
    id: "conversion",
    text: "I'm leaving money on the table with my current theme.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <polyline points="3 13 7 9 11 12 17 6" />
        <polyline points="14 6 17 6 17 9" />
      </svg>
    ),
  },
  {
    id: "ship",
    text: "I want something that looks considered without months of setup.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <polyline points="4 10 8 14 16 6" />
      </svg>
    ),
  },
  {
    id: "ownership",
    text: "I'd rather own a great theme once than rent a mediocre one forever.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <rect x="4" y="9" width="12" height="9" rx="2" />
        <path d="M7 9V6a3 3 0 0 1 6 0v3" />
      </svg>
    ),
  },
];

const TOTAL = STATEMENTS.length;

const VERDICTS = {
  strong: {
    title: "Aether is built for you.",
    body: "You're thinking about this the same way the theme was designed. Pick a tier and be live this week.",
    cta: { href: "/aether#pricing", label: "See pricing" },
  },
  likely: {
    title: "Worth a closer look.",
    body: "Aether covers most of what you're after. Check the demo and see how it feels on a real store.",
    cta: { href: "https://aether-starter.myshopify.com", label: "View demo" },
  },
  unsure: {
    title: "Maybe not yet.",
    body: "Aether is built for a specific kind of store. Try the demo, and if something clicks, we're easy to reach.",
    cta: { href: "https://aether-starter.myshopify.com", label: "View demo" },
  },
};

export function FitQuiz() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [displayIndex, setDisplayIndex] = useState(0);
  const [displayDone, setDisplayDone] = useState(false);
  const lock = useRef(false);

  const done = answers.length >= TOTAL;
  const yesCount = answers.filter((a) => a === "yes").length;

  const verdict =
    yesCount >= 3 ? VERDICTS.strong :
    yesCount === 2 ? VERDICTS.likely :
    VERDICTS.unsure;

  function transition(nextIndex: number, nextDone: boolean) {
    if (lock.current) return;
    lock.current = true;
    setPhase("out");
    setTimeout(() => {
      setDisplayIndex(nextIndex);
      setDisplayDone(nextDone);
      setPhase("in");
      setTimeout(() => { setPhase("idle"); lock.current = false; }, 30);
    }, 180);
  }

  const pick = (a: Answer) => {
    if (lock.current || done) return;
    const next = [...answers, a];
    setAnswers(next);
    transition(next.length, next.length >= TOTAL);
  };

  const goBack = () => {
    if (lock.current || answers.length === 0) return;
    const next = answers.slice(0, -1);
    setAnswers(next);
    transition(next.length, false);
  };

  const reset = () => {
    setAnswers([]);
    transition(0, false);
  };

  const s = STATEMENTS[Math.min(displayIndex, TOTAL - 1)];

  const contentStyle: React.CSSProperties =
    phase === "out"
      ? { opacity: 0, transform: "translateY(6px)", transition: "opacity 180ms ease, transform 180ms ease" }
      : phase === "in"
      ? { opacity: 0, transform: "translateY(-6px)", transition: "none" }
      : { opacity: 1, transform: "translateY(0)", transition: "opacity 280ms ease, transform 300ms cubic-bezier(0.22,1,0.36,1)" };

  return (
    <div className="flex flex-col">

      {/* Progress bar */}
      <div className="h-px w-full bg-[rgb(var(--line))] overflow-hidden">
        <div
          style={{
            height: "100%",
            width: `${(displayDone ? 1 : displayIndex / TOTAL) * 100}%`,
            background: "rgb(var(--fg))",
            opacity: 0.35,
            transition: "width 500ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>

      <div className="px-6 sm:px-12 py-16 sm:py-24 flex flex-col items-center gap-10 min-h-[380px] justify-center">

        <div style={contentStyle} className="flex flex-col items-center gap-8 w-full max-w-xl">
          {!displayDone ? (
            <>
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                {STATEMENTS.map((_, i) => (
                  <span
                    key={i}
                    className="block rounded-full transition-all duration-300"
                    style={{
                      width: i === displayIndex ? 24 : 8,
                      height: 8,
                      background: i === displayIndex
                        ? "rgb(var(--fg))"
                        : i < displayIndex
                        ? "rgb(var(--fg))"
                        : "rgb(var(--fg))",
                      opacity: i === displayIndex ? 1 : i < displayIndex ? 0.35 : 0.12,
                    }}
                  />
                ))}
              </div>

              {/* Question */}
              <div className="flex flex-col items-center gap-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))]" style={{ opacity: 0.6 }}>
                  {s.icon}
                </span>
                <p className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-[400] tracking-tight leading-snug text-[rgb(var(--fg))] text-center">
                  &ldquo;{s.text}&rdquo;
                </p>
              </div>

              {/* Answer buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => pick("yes")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[15px] tracking-tight font-medium transition-all hover:opacity-80 [-webkit-tap-highlight-color:transparent]"
                  style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                    <polyline points="2 8 6 12 14 4" />
                  </svg>
                  That's me
                </button>
                <button
                  onClick={() => pick("no")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[15px] tracking-tight transition-all hover:opacity-80 [-webkit-tap-highlight-color:transparent]"
                  style={{ border: "1px solid rgb(var(--line))", color: "rgb(var(--muted))" }}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                    <line x1="12" y1="4" x2="4" y2="12" /><line x1="4" y1="4" x2="12" y2="12" />
                  </svg>
                  Not quite
                </button>
              </div>

              {answers.length > 0 && (
                <button
                  onClick={goBack}
                  className="text-[12px] tracking-tight transition-colors [-webkit-tap-highlight-color:transparent]"
                  style={{ color: "rgb(var(--muted))", opacity: 0.35 }}
                >
                  ← back
                </button>
              )}
            </>
          ) : (
            <>
              {/* Result indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgb(var(--line))]">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[rgb(var(--fg))]" aria-hidden="true">
                  <polyline points="2 8 6 12 14 4" />
                </svg>
                <span className="text-[11px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
                  {yesCount} of {TOTAL} matched
                </span>
              </div>

              <p className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-[400] tracking-tight leading-snug text-[rgb(var(--fg))] text-center">
                {verdict.title}
              </p>
              <p className="text-[15px] tracking-tight leading-relaxed text-center max-w-sm" style={{ color: "rgb(var(--muted))", opacity: 0.6 }}>
                {verdict.body}
              </p>

              <div className="flex items-center gap-3">
                <Link
                  href={verdict.cta.href}
                  className="flex items-center justify-center gap-1.5 px-7 py-3.5 rounded-full text-[15px] tracking-tight font-medium transition-opacity hover:opacity-80"
                  style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}
                >
                  {verdict.cta.label}
                </Link>
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-full text-[14px] tracking-tight transition-opacity hover:opacity-60 [-webkit-tap-highlight-color:transparent]"
                  style={{ border: "1px solid rgb(var(--line))", color: "rgb(var(--muted))" }}
                >
                  Retake
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
