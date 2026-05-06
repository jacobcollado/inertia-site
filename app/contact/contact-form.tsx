"use client";

import { useState, useEffect, useRef } from "react";

type Status = "idle" | "submitting" | "sent" | "error";
type StepType = "choice" | "text" | "email" | "textarea";

interface Step {
  key: string;
  question: (answers: Record<string, string>) => string;
  type: StepType;
  placeholder?: string;
  autoComplete?: string;
  options?: string[];
  accent: string;
  showIf?: (answers: Record<string, string>) => boolean;
  sketch: React.ReactNode;
}

/* ── Step visuals ─────────────────────────────────────────────────── */

function StepVisual({ label, accent, sub }: { label: string; accent: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <p
        className="font-medium tracking-[-0.06em] leading-none select-none"
        style={{ fontSize: "clamp(5rem,18vw,9rem)", color: accent, opacity: 0.9 }}
      >
        {label}
      </p>
      {sub && (
        <p className="text-[13px] tracking-tight" style={{ color: accent, opacity: 0.45 }}>{sub}</p>
      )}
    </div>
  );
}

function SentVisual() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <p
        className="font-medium tracking-[-0.06em] leading-none select-none"
        style={{ fontSize: "clamp(5rem,18vw,9rem)", color: "rgb(var(--green))", opacity: 0.9 }}
      >
        ✓
      </p>
      <p className="text-[13px] tracking-tight" style={{ color: "rgb(var(--green))", opacity: 0.45 }}>sent</p>
    </div>
  );
}

/* ── Steps config ─────────────────────────────────────────────────── */

const STEPS: Step[] = [
  {
    key: "type",
    question: () => "What are you here to build?",
    type: "choice",
    options: ["Custom Shopify store", "Theme purchase / support", "Brand + web project", "Not sure yet"],
    accent: "rgb(var(--blue))",
    sketch: <StepVisual label="01" accent="rgb(var(--blue))" sub="what we're building" />,
  },
  {
    key: "name",
    question: () => "What should I call you?",
    type: "text",
    placeholder: "your name",
    autoComplete: "name",
    accent: "rgb(var(--green))",
    sketch: <StepVisual label="02" accent="rgb(var(--green))" sub="who you are" />,
  },
  {
    key: "email",
    question: (a) => `Nice to meet you, ${a.name || "you"}. Best email?`,
    type: "email",
    placeholder: "you@example.com",
    autoComplete: "email",
    accent: "rgb(var(--green))",
    sketch: <StepVisual label="03" accent="rgb(var(--green))" sub="where to reach you" />,
  },
  {
    key: "budget",
    question: () => "What's the rough budget?",
    type: "choice",
    options: ["Under $2k", "$2k – $5k", "$5k – $15k", "$15k+", "Not decided yet"],
    accent: "rgb(var(--amber))",
    showIf: (a) => a.type === "Custom Shopify store" || a.type === "Brand + web project",
    sketch: <StepVisual label="04" accent="rgb(var(--amber))" sub="rough budget" />,
  },
  {
    key: "timeline",
    question: () => "When do you need to launch?",
    type: "choice",
    options: ["ASAP", "1 – 2 months", "3 – 6 months", "No hard deadline"],
    accent: "rgb(var(--amber))",
    showIf: (a) => a.type === "Custom Shopify store" || a.type === "Brand + web project",
    sketch: <StepVisual label="05" accent="rgb(var(--amber))" sub="timeline" />,
  },
  {
    key: "message",
    question: (a) => {
      if (a.type === "Theme purchase / support") return "What do you need help with?";
      if (a.type === "Not sure yet") return "Tell me what's on your mind.";
      return "What does a great outcome look like?";
    },
    type: "textarea",
    placeholder: "Describe the project, the brand, the problem you're solving.",
    accent: "rgb(var(--purple))",
    sketch: <StepVisual label="06" accent="rgb(var(--purple))" sub="the details" />,
  },
];

function getActiveSteps(answers: Record<string, string>): Step[] {
  return STEPS.filter((s) => !s.showIf || s.showIf(answers));
}

function Spinner({ color }: { color: string }) {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Main component ───────────────────────────────────────────────── */

export function ContactForm() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [animKey, setAnimKey] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const activeSteps = getActiveSteps(answers);
  const current = activeSteps[stepIndex];
  const value = answers[current?.key ?? ""] ?? "";
  const isLast = stepIndex === activeSteps.length - 1;
  const canAdvance = value.trim().length > 0;
  const accent = current?.accent ?? "rgb(var(--fg))";
  const isSubmitting = status === "submitting";
  const totalSteps = activeSteps.length;
  const progress = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;

  useEffect(() => {
    const t = setTimeout(() => {
      (inputRef.current as HTMLElement | null)?.focus?.();
    }, 140);
    return () => clearTimeout(t);
  }, [stepIndex]);

  const transition = (fn: () => void) => {
    setTransitioning(true);
    setTimeout(() => {
      fn();
      setAnimKey((k) => k + 1);
      setTransitioning(false);
    }, 130);
  };

  const goNext = () => {
    if (!canAdvance || isSubmitting) return;
    if (isLast) submit();
    else transition(() => setStepIndex((s) => s + 1));
  };

  const goBack = () => {
    if (stepIndex === 0 || isSubmitting) return;
    transition(() => setStepIndex((s) => s - 1));
  };

  const choose = (opt: string) => {
    if (isSubmitting) return;
    const updated = { ...answers, [current.key]: opt };
    setAnswers(updated);
    const next = getActiveSteps(updated);
    const nextIdx = stepIndex + 1;
    if (nextIdx < next.length) setTimeout(() => transition(() => setStepIndex(nextIdx)), 160);
    else setTimeout(() => submit(updated), 160);
  };

  const submit = async (overrideAnswers?: Record<string, string>) => {
    const a = overrideAnswers ?? answers;
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: a.name,
          email: a.email,
          message: [
            a.type && `Type: ${a.type}`,
            a.budget && `Budget: ${a.budget}`,
            a.timeline && `Timeline: ${a.timeline}`,
            a.message && `\n${a.message}`,
          ].filter(Boolean).join("\n"),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong");
      }
      setStatus("sent");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong");
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && current?.type !== "textarea") {
      e.preventDefault();
      goNext();
    }
  };

  const sketch = status === "sent"
    ? <SentVisual />
    : isSubmitting
    ? <StepVisual label="..." accent="rgb(var(--purple))" />
    : current?.sketch;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col sm:flex-row">

      {/* Left — visual panel */}
      <div className="sm:w-[44%] sm:border-r border-[rgb(var(--line))] flex flex-col">
        {/* Visual area */}
        <div
          className="flex-1 flex items-center px-8 sm:px-12 py-10 sm:py-16"
          style={{ minHeight: "200px" }}
        >
          <div
            key={`sk-${animKey}-${status}`}
            style={{ animation: "rise-in 350ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "60ms" }}
          >
            {sketch}
          </div>
        </div>

        {/* Progress bar — along the bottom edge of the sketch panel on desktop */}
        <div className="hidden sm:block px-8 pb-10">
          <div className="relative h-[2px] bg-[rgb(var(--line))] rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${isSubmitting || status === "sent" ? 100 : progress}%`, background: accent }}
            />
          </div>
          <p className="text-[11px] tracking-tight mt-2 tabular-nums" style={{ color: accent, opacity: 0.6 }}>
            {isSubmitting ? "sending" : status === "sent" ? "done" : `${stepIndex + 1} / ${totalSteps}`}
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="sm:w-[56%] flex flex-col justify-center px-8 sm:px-12 pt-2 pb-12 sm:py-16">

        {/* Mobile progress */}
        <div className="sm:hidden mb-8">
          <div className="relative h-[2px] bg-[rgb(var(--line))] rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${isSubmitting || status === "sent" ? 100 : progress}%`, background: accent }}
            />
          </div>
          <p className="text-[11px] tracking-tight mt-2 tabular-nums" style={{ color: accent, opacity: 0.6 }}>
            {isSubmitting ? "sending" : status === "sent" ? "done" : `${stepIndex + 1} / ${totalSteps}`}
          </p>
        </div>

        {/* Submitting state */}
        {isSubmitting && (
          <div
            className="flex flex-col gap-6"
            style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}
          >
            <Spinner color="rgb(var(--purple))" />
            <p className="text-[clamp(1.6rem,4vw,2.25rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">
              Sending.
            </p>
            <p className="text-[15px] tracking-tight text-[rgb(var(--muted))]">Just a moment.</p>
          </div>
        )}

        {/* Sent state */}
        {status === "sent" && (
          <div
            className="flex flex-col gap-5"
            style={{ animation: "rise-in 400ms cubic-bezier(0.22,1,0.36,1) both" }}
          >
            <span className="text-[11px] tracking-widest uppercase" style={{ color: "rgb(var(--green))", opacity: 0.8 }}>
              submitted
            </span>
            <p className="text-[clamp(1.8rem,4.5vw,2.75rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">
              {answers.name ? `Got it, ${answers.name}.` : "Got it."}
            </p>
            <p className="text-[15px] tracking-tight leading-relaxed text-[rgb(var(--muted))] max-w-sm">
              {answers.email
                ? `I'll follow up at ${answers.email}. Usually within a day.`
                : "I'll be in touch soon."}
            </p>
          </div>
        )}

        {/* Active form */}
        {!isSubmitting && status !== "sent" && (
          <div
            className="w-full transition-opacity duration-100"
            style={{ opacity: transitioning ? 0 : 1 }}
          >
            {/* Question */}
            <p
              key={`q-${animKey}`}
              className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))] mb-10"
              style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both" }}
            >
              {current?.question(answers)}
            </p>

            {/* Input */}
            <div
              key={`i-${animKey}`}
              style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "50ms" }}
            >
              {current?.type === "choice" ? (
                <div className="flex flex-col gap-2.5">
                  {current.options!.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => choose(opt)}
                      className="text-left px-5 py-4 border rounded-sm text-[15px] tracking-tight transition-all duration-150"
                      style={{
                        borderColor: value === opt ? accent : "rgb(var(--line))",
                        color: value === opt ? accent : "rgb(var(--muted))",
                        background: value === opt ? `color-mix(in srgb, ${accent} 6%, transparent)` : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        if (value !== opt) { el.style.borderColor = accent; el.style.color = "rgb(var(--fg))"; }
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        if (value !== opt) { el.style.borderColor = "rgb(var(--line))"; el.style.color = "rgb(var(--muted))"; }
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : current?.type === "textarea" ? (
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  rows={5}
                  value={value}
                  onChange={(e) => setAnswers((a) => ({ ...a, [current.key]: e.target.value }))}
                  placeholder={current.placeholder}
                  className="w-full bg-transparent border-0 border-b py-3 text-[17px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none transition-colors duration-200 resize-none"
                  style={{ borderColor: value ? accent : "rgb(var(--line))" }}
                  onFocus={(e) => { e.target.style.borderColor = accent; }}
                  onBlur={(e) => { e.target.style.borderColor = value ? accent : "rgb(var(--line))"; }}
                />
              ) : (
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type={current?.type}
                  value={value}
                  onChange={(e) => setAnswers((a) => ({ ...a, [current!.key]: e.target.value }))}
                  onKeyDown={onKey}
                  placeholder={current?.placeholder}
                  autoComplete={current?.autoComplete}
                  className="w-full bg-transparent border-0 border-b py-3 text-[17px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none transition-colors duration-200"
                  style={{ borderColor: value ? accent : "rgb(var(--line))" }}
                  onFocus={(e) => { e.target.style.borderColor = accent; }}
                  onBlur={(e) => { e.target.style.borderColor = value ? accent : "rgb(var(--line))"; }}
                />
              )}
            </div>

            {/* Actions */}
            {current?.type !== "choice" && (
              <div className="flex items-center justify-between gap-4 mt-10">
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                      <path d="M10 3L5 8l5 5" />
                    </svg>
                    back
                  </button>
                ) : <span />}

                <div className="flex items-center gap-3">
                  {status === "error" && (
                    <span className="text-[13px] tracking-tight text-red-500">{error || "something went wrong"}</span>
                  )}
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canAdvance}
                    className="inline-flex items-center gap-2 rounded-full pl-6 pr-5 py-2.5 text-[14px] tracking-tight font-medium transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
                    style={{
                      background: canAdvance ? accent : "rgb(var(--line))",
                      color: "white",
                      border: `1px solid ${canAdvance ? accent : "rgb(var(--line))"}`,
                    }}
                  >
                    {isLast ? "send" : "continue"}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
