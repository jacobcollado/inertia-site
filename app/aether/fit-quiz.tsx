"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Answer = "yes" | "no";

const QUESTIONS: { id: string; text: string; sub: string }[] = [
  {
    id: "brand",
    text: "Do you care how your storefront feels, not just how it sells?",
    sub: "Aether is built for brands that treat the site as part of the product.",
  },
  {
    id: "conversion",
    text: "Is converting the right buyer more important than pulling every click?",
    sub: "The layout is tuned for intent, not volume.",
  },
  {
    id: "ship",
    text: "Do you want to launch something considered in days, not months?",
    sub: "Most stores are live within the week.",
  },
  {
    id: "ownership",
    text: "Would you rather own a theme than rent a subscription?",
    sub: "One payment. Yours to keep.",
  },
];

type Stage = "idle" | "quiz" | "done";

export function FitQuiz() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [dir, setDir] = useState<1 | -1>(1);
  const [transitioning, setTransitioning] = useState(false);
  const lock = useRef(false);

  const total = QUESTIONS.length;
  const yesCount = answers.filter((a) => a === "yes").length;
  const verdict =
    yesCount >= 3
      ? {
          kind: "fit" as const,
          title: "Aether is built for you.",
          body: "You're thinking about brand, buyer, and speed the same way the theme does. Pick a tier below, I'll have you live this week.",
          cta: { href: "/aether#pricing", label: "See pricing", glyph: "↓" },
        }
      : yesCount === 2
      ? {
          kind: "maybe" as const,
          title: "Likely a good match.",
          body: "Aether covers most of what you're after. Skim the tiers, and ping me if you want a quick sanity check before buying.",
          cta: { href: "/aether#pricing", label: "See pricing", glyph: "↓" },
        }
      : {
          kind: "soft" as const,
          title: "It might still work, let's talk first.",
          body: "A five minute chat will save us both time. Send a note and I'll tell you honestly whether Aether fits, or point you somewhere better.",
          cta: { href: "/contact", label: "Send a note", glyph: "→" },
        };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const start = () => {
    setAnswers([]);
    setIndex(0);
    setDir(1);
    setStage("quiz");
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setStage("idle");
      setAnswers([]);
      setIndex(0);
    }, 400);
  };

  const pick = (a: Answer) => {
    if (lock.current) return;
    lock.current = true;
    setDir(1);
    setTransitioning(true);
    setTimeout(() => {
      const next = [...answers, a];
      setAnswers(next);
      if (next.length >= total) {
        setStage("done");
      } else {
        setIndex(next.length);
      }
      setTransitioning(false);
      lock.current = false;
    }, 280);
  };

  const goBack = () => {
    if (lock.current || answers.length === 0) return;
    lock.current = true;
    setDir(-1);
    setTransitioning(true);
    setTimeout(() => {
      const next = answers.slice(0, -1);
      setAnswers(next);
      setIndex(next.length);
      if (stage === "done") setStage("quiz");
      setTransitioning(false);
      lock.current = false;
    }, 280);
  };

  const reset = () => {
    setDir(-1);
    setTransitioning(true);
    setTimeout(() => {
      setAnswers([]);
      setIndex(0);
      setStage("quiz");
      setTransitioning(false);
    }, 280);
  };

  const progress = stage === "done" ? 1 : Math.min(1, answers.length / total);

  const q = QUESTIONS[Math.min(index, total - 1)];

  return (
    <>
      <button
        onClick={start}
        className="group w-full text-left rounded-2xl border border-[rgb(var(--line))] p-6 sm:p-7 hover:border-[rgb(var(--fg))] transition-all duration-300 [-webkit-tap-highlight-color:transparent]"
      >
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-lg font-medium tracking-tighter text-[rgb(var(--fg))] mb-1">
              Is it a fit?
            </p>
            <p className="text-sm tracking-tight text-[rgb(var(--muted))]">
              Four quick yes/no. Takes about twenty seconds.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--line))] group-hover:border-[rgb(var(--fg))] text-sm tracking-tight text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] transition-colors px-4 h-9 shrink-0">
            Start
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </button>

      {/* Fullscreen overlay */}
      {mounted && createPortal(<div
        className={`fixed inset-0 z-[80] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Is Aether a fit for you"
        style={{
          backgroundColor: "rgb(var(--bg))",
          opacity: open ? 1 : 0,
          transition: "opacity 450ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 sm:px-8 pt-6">
            <p className="text-xs tracking-tight text-[rgb(var(--muted))] tabular-nums">
              {stage === "done"
                ? "Result"
                : `${String(Math.min(answers.length + 1, total)).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}
            </p>
            <button
              onClick={close}
              aria-label="Close"
              className="inline-flex items-center gap-2 text-xs tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors [-webkit-tap-highlight-color:transparent]"
            >
              close
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden="true">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>
          <div className="mt-5 h-[2px] w-full bg-[rgb(var(--line))]">
            <div
              className="h-full bg-[rgb(var(--fg))]"
              style={{
                width: `${progress * 100}%`,
                transition: "width 600ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>
        </div>

        {/* Centered stage */}
        <div className="absolute inset-0 flex items-center justify-center px-6 sm:px-8">
          <div
            key={stage === "quiz" ? `q-${index}` : "verdict"}
            className="w-full max-w-2xl"
            style={{
              opacity: transitioning ? 0 : 1,
              transform: transitioning
                ? `translateX(${dir * 28}px)`
                : "translateX(0)",
              filter: transitioning ? "blur(8px)" : "blur(0)",
              transition:
                "opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)," +
                "transform 340ms cubic-bezier(0.22, 1, 0.36, 1)," +
                "filter 300ms cubic-bezier(0.22, 1, 0.36, 1)",
              willChange: "opacity, transform, filter",
            }}
          >
            {stage !== "done" ? (
              <>
                <p className="text-sm tracking-tight text-[rgb(var(--muted))] mb-5">
                  Question {Math.min(answers.length + 1, total)} of {total}
                </p>
                <h2 className="text-3xl sm:text-5xl font-medium tracking-tighter leading-[1.1] text-[rgb(var(--fg))] mb-5">
                  {q.text}
                </h2>
                <p className="text-base sm:text-lg leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-10 max-w-xl">
                  {q.sub}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <BigChoice onClick={() => pick("yes")} variant="solid">
                    yes
                  </BigChoice>
                  <BigChoice onClick={() => pick("no")} variant="outline">
                    no
                  </BigChoice>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm tracking-tight text-[rgb(var(--muted))] mb-5">
                  {yesCount} of {total} yes
                </p>
                <h2 className="text-3xl sm:text-5xl font-medium tracking-tighter leading-[1.1] text-[rgb(var(--fg))] mb-5">
                  {verdict.title}
                </h2>
                <p className="text-base sm:text-lg leading-relaxed tracking-tight text-[rgb(var(--muted))] mb-10 max-w-xl">
                  {verdict.body}
                </p>
                <div className="flex flex-wrap items-center gap-5">
                  {verdict.cta.href.startsWith("/") ? (
                    <Link
                      href={verdict.cta.href}
                      onClick={close}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-6 h-12 text-base tracking-tight hover:opacity-90 transition-opacity"
                    >
                      {verdict.cta.label}
                      <span aria-hidden="true">{verdict.cta.glyph}</span>
                    </Link>
                  ) : (
                    <a
                      href={verdict.cta.href}
                      onClick={close}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-6 h-12 text-base tracking-tight hover:opacity-90 transition-opacity"
                    >
                      {verdict.cta.label}
                      <span aria-hidden="true">{verdict.cta.glyph}</span>
                    </a>
                  )}
                  <button
                    onClick={reset}
                    className="text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
                  >
                    start over
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 sm:px-8 pb-6">
            <button
              onClick={goBack}
              disabled={answers.length === 0}
              className="inline-flex items-center gap-2 text-xs tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors disabled:opacity-30 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
            >
              <span aria-hidden="true">←</span>
              back
            </button>
            <p className="text-[11px] tracking-tight text-[rgb(var(--muted))]">
              press esc to close
            </p>
          </div>
        </div>
      </div>, document.body)}
    </>
  );
}

function BigChoice({
  onClick,
  variant,
  children,
}: {
  onClick: () => void;
  variant: "solid" | "outline";
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center rounded-full h-12 px-8 text-base tracking-tight transition-all duration-300 active:scale-[0.97] [-webkit-tap-highlight-color:transparent]";
  if (variant === "solid") {
    return (
      <button
        onClick={onClick}
        className={`${base} bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-90`}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`${base} border border-[rgb(var(--line))] text-[rgb(var(--fg))] hover:border-[rgb(var(--fg))]`}
    >
      {children}
    </button>
  );
}
