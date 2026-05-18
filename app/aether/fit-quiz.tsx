"use client";

import Link from "next/link";
import { useState, useRef } from "react";

type Answer = "yes" | "no";

const STATEMENTS: { id: string; text: string }[] = [
  {
    id: "brand",
    text: "My store should feel like the brand, not just a place to check out.",
  },
  {
    id: "conversion",
    text: "I'm leaving money on the table with my current theme.",
  },
  {
    id: "ship",
    text: "I want something that looks considered without months of setup.",
  },
  {
    id: "ownership",
    text: "I'd rather own a great theme once than rent a mediocre one forever.",
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

  function transition(nextIndex: number, nextDone: boolean, dir: 1 | -1) {
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
    transition(next.length, next.length >= TOTAL, 1);
  };

  const goBack = () => {
    if (lock.current || answers.length === 0) return;
    const next = answers.slice(0, -1);
    setAnswers(next);
    transition(next.length, false, -1);
  };

  const reset = () => {
    setAnswers([]);
    transition(0, false, -1);
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

      {/* Progress */}
      <div className="h-px w-full bg-[rgb(var(--line))] overflow-hidden">
        <div
          style={{
            height: "100%",
            width: `${(done ? 1 : displayIndex / TOTAL) * 100}%`,
            background: "rgb(var(--fg))",
            opacity: 0.3,
            transition: "width 500ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>

      <div className="px-6 sm:px-12 py-14 sm:py-20 flex flex-col items-center gap-10 min-h-[320px] justify-center">

        <div style={contentStyle} className="flex flex-col items-center gap-8 w-full">
          {!displayDone ? (
            <>
              {/* Counter */}
              <span className="text-[11px] tracking-widest uppercase tabular-nums" style={{ color: "rgb(var(--muted))", opacity: 0.35, letterSpacing: "0.12em" }}>
                {displayIndex + 1} of {TOTAL}
              </span>

              {/* Statement */}
              <p className="text-[clamp(1.5rem,4vw,2.2rem)] font-[400] tracking-tight leading-snug text-[rgb(var(--fg))] text-center max-w-2xl">
                {s.text}
              </p>

              {/* Answers */}
              <div className="flex items-center gap-8 pt-2">
                <button
                  onClick={() => pick("yes")}
                  className="group flex flex-col items-center gap-2 [-webkit-tap-highlight-color:transparent]"
                >
                  <span className="text-[15px] tracking-tight font-medium text-[rgb(var(--fg))] group-hover:opacity-50 transition-opacity">That's me</span>
                  <span className="block h-px w-full transition-all duration-200 group-hover:opacity-100 opacity-0" style={{ background: "rgb(var(--fg))" }} />
                </button>
                <span className="text-[rgb(var(--line))] text-lg select-none">/</span>
                <button
                  onClick={() => pick("no")}
                  className="group flex flex-col items-center gap-2 [-webkit-tap-highlight-color:transparent]"
                >
                  <span className="text-[15px] tracking-tight text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.45 }}>Not quite</span>
                  <span className="block h-px w-full transition-all duration-200 group-hover:opacity-60 opacity-0" style={{ background: "rgb(var(--fg))" }} />
                </button>
              </div>

              {answers.length > 0 && (
                <button
                  onClick={goBack}
                  className="text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors [-webkit-tap-highlight-color:transparent]"
                  style={{ opacity: 0.3 }}
                >
                  back
                </button>
              )}
            </>
          ) : (
            <>
              <span className="text-[11px] tracking-widest uppercase" style={{ color: "rgb(var(--muted))", opacity: 0.35, letterSpacing: "0.12em" }}>
                Result
              </span>
              <p className="text-[clamp(1.5rem,4vw,2.2rem)] font-[400] tracking-tight leading-snug text-[rgb(var(--fg))] text-center max-w-2xl">
                {verdict.title}
              </p>
              <p className="text-[14px] tracking-tight leading-relaxed text-center max-w-md" style={{ color: "rgb(var(--muted))", opacity: 0.6 }}>
                {verdict.body}
              </p>
              <div className="flex items-center gap-8 pt-2">
                <Link
                  href={verdict.cta.href}
                  className="group flex flex-col items-center gap-2"
                >
                  <span className="text-[15px] tracking-tight font-medium text-[rgb(var(--fg))] group-hover:opacity-50 transition-opacity">{verdict.cta.label}</span>
                  <span className="block h-px w-full transition-all duration-200 group-hover:opacity-100 opacity-0" style={{ background: "rgb(var(--fg))" }} />
                </Link>
                <span className="text-[rgb(var(--line))] text-lg select-none">/</span>
                <button
                  onClick={reset}
                  className="group flex flex-col items-center gap-2 [-webkit-tap-highlight-color:transparent]"
                >
                  <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.35 }}>start over</span>
                  <span className="block h-px w-full transition-all duration-200 group-hover:opacity-40 opacity-0" style={{ background: "rgb(var(--fg))" }} />
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
