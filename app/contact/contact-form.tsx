"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useWebHaptics } from "web-haptics/react";

type Status = "idle" | "submitting" | "sent" | "error";
type StepType = "choice" | "text" | "email" | "textarea";

interface Step {
  key: string;
  question: (answers: Record<string, string>) => string;
  hint?: string;
  type: StepType;
  placeholder?: string;
  autoComplete?: string;
  options?: string[];
  showIf?: (answers: Record<string, string>) => boolean;
}

const STEPS: Step[] = [
  {
    key: "type",
    question: () => "What brings you here?",
    type: "choice",
    options: ["I want a custom Shopify store", "I bought Aether and need help", "I have a brand or web project", "I'm not sure yet"],
  },
  {
    key: "name",
    question: () => "What's your name?",
    type: "text",
    placeholder: "Your name",
    autoComplete: "name",
  },
  {
    key: "email",
    question: () => "Best email to reach you?",
    hint: "We'll reply here, usually within one business day.",
    type: "email",
    placeholder: "you@example.com",
    autoComplete: "email",
  },
  {
    key: "budget",
    question: () => "What's your rough budget?",
    hint: "No commitment — just helps us understand the scope.",
    type: "choice",
    options: ["Under $2k", "$2k – $5k", "$5k – $15k", "$15k+", "Not decided yet"],
    showIf: (a) => a.type === "I want a custom Shopify store" || a.type === "I have a brand or web project",
  },
  {
    key: "timeline",
    question: () => "When are you hoping to launch?",
    type: "choice",
    options: ["As soon as possible", "Within 1 – 2 months", "Within 3 – 6 months", "No fixed deadline"],
    showIf: (a) => a.type === "I want a custom Shopify store" || a.type === "I have a brand or web project",
  },
  {
    key: "message",
    question: (a) => {
      if (a.type === "I bought Aether and need help") return "What do you need help with?";
      if (a.type === "I'm not sure yet") return "Tell us what's on your mind";
      return "Tell us about the project";
    },
    hint: "Share as much or as little as you like — brand, goals, problems you're trying to solve.",
    type: "textarea",
    placeholder: "The more context the better.",
  },
];

function getActiveSteps(answers: Record<string, string>): Step[] {
  return STEPS.filter((s) => !s.showIf || s.showIf(answers));
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ContactForm() {
  const { trigger } = useWebHaptics();
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
  const isSubmitting = status === "submitting";
  const totalSteps = activeSteps.length;

  useEffect(() => {
    const t = setTimeout(() => {
      (inputRef.current as HTMLElement | null)?.focus?.();
    }, 160);
    return () => clearTimeout(t);
  }, [stepIndex]);

  const transition = (fn: () => void) => {
    setTransitioning(true);
    setTimeout(() => {
      fn();
      setAnimKey((k) => k + 1);
      setTransitioning(false);
    }, 120);
  };

  const goNext = () => {
    if (!canAdvance || isSubmitting) return;
    trigger("selection");
    if (isLast) submit();
    else transition(() => setStepIndex((s) => s + 1));
  };

  const goBack = () => {
    if (stepIndex === 0 || isSubmitting) return;
    trigger("light");
    transition(() => setStepIndex((s) => s - 1));
  };

  const choose = (opt: string) => {
    if (isSubmitting) return;
    trigger("selection");
    const updated = { ...answers, [current.key]: opt };
    setAnswers(updated);
    const next = getActiveSteps(updated);
    const nextIdx = stepIndex + 1;
    if (nextIdx < next.length) setTimeout(() => transition(() => setStepIndex(nextIdx)), 180);
    else setTimeout(() => submit(updated), 180);
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
      trigger("success");
      celebrate();
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong");
    }
  };

  const celebrate = () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.55 },
      colors: ["#0e0e0e", "#6b6b6b", "#b4b4b4", "#e0e0e0"],
    });
  };

  const restart = () => {
    setStepIndex(0);
    setAnswers({});
    setStatus("idle");
    setError("");
    setAnimKey((k) => k + 1);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && current?.type !== "textarea") {
      e.preventDefault();
      goNext();
    }
  };

  /* ── Sent ─────────────────────────────────────────────────────────── */
  if (status === "sent") {
    return (
      <div
        className="w-full flex flex-col items-center justify-center px-6 py-24 sm:py-32 text-center"
        style={{ animation: "rise-in 500ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-8"
          style={{ background: "rgb(var(--green) / 0.12)", color: "rgb(var(--green))" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-[clamp(1.75rem,5vw,3rem)] font-medium tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-4">
          {answers.name ? `Thanks, ${answers.name}.` : "Message received."}
        </p>
        <p className="text-[15px] tracking-tight leading-relaxed text-[rgb(var(--muted))] max-w-xs mb-8">
          {answers.email
            ? `We'll follow up at ${answers.email}, typically within one business day.`
            : "We'll be in touch shortly."}
        </p>
        <button
          type="button"
          onClick={restart}
          className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors [-webkit-tap-highlight-color:transparent]"
        >
          Start over
        </button>
      </div>
    );
  }

  /* ── Submitting ───────────────────────────────────────────────────── */
  if (isSubmitting) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center px-6 py-24 sm:py-32 text-center gap-5"
        style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="text-[rgb(var(--muted))]">
          <Spinner />
        </div>
        <p className="text-[17px] tracking-tight text-[rgb(var(--muted))]">Sending your message.</p>
      </div>
    );
  }

  /* ── Active form ──────────────────────────────────────────────────── */
  return (
    <div className="w-full flex flex-col items-center justify-center px-6 pt-10 pb-16 sm:pt-14 sm:pb-20 min-h-[calc(100vh-200px)]">

      {/* Step dots + restart */}
      <div className="flex items-center gap-4 mb-14">
        <div className="flex items-center gap-2">
          {activeSteps.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-400"
              style={{
                width: i === stepIndex ? "20px" : "6px",
                height: "6px",
                background: i === stepIndex
                  ? "rgb(var(--fg))"
                  : i < stepIndex
                  ? "rgb(var(--fg) / 0.35)"
                  : "rgb(var(--line))",
              }}
            />
          ))}
        </div>
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={restart}
            className="text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors [-webkit-tap-highlight-color:transparent]"
          >
            Start over
          </button>
        )}
      </div>

      {/* Question + input */}
      <div
        className="w-full max-w-lg transition-opacity duration-100"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        <div key={`q-${animKey}`} style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}>
          <p className="text-[clamp(1.6rem,4.5vw,2.5rem)] font-medium tracking-[-0.04em] leading-tight text-[rgb(var(--fg))] mb-2">
            {current?.question(answers)}
          </p>
          {current?.hint && (
            <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] mb-8">{current.hint}</p>
          )}
          {!current?.hint && <div className="mb-8" />}
        </div>

        <div key={`i-${animKey}`} style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "40ms" }}>
          {current?.type === "choice" ? (
            <div className="flex flex-col gap-2.5">
              {current.options!.map((opt) => {
                const selected = value === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => choose(opt)}
                    className="text-left px-5 py-4 rounded-full text-[15px] tracking-tight transition-all duration-150 [-webkit-tap-highlight-color:transparent]"
                    style={{
                      border: `1.5px solid ${selected ? "rgb(var(--fg))" : "rgb(var(--line))"}`,
                      color: selected ? "rgb(var(--bg))" : "rgb(var(--fg))",
                      background: selected ? "rgb(var(--fg))" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = "rgb(var(--fg) / 0.5)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = "rgb(var(--line))";
                      }
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : current?.type === "textarea" ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              rows={5}
              value={value}
              onChange={(e) => setAnswers((a) => ({ ...a, [current.key]: e.target.value }))}
              placeholder={current.placeholder}
              className="w-full bg-transparent border-0 border-b py-3 text-[17px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none transition-colors duration-200 resize-none"
              style={{ borderColor: value ? "rgb(var(--fg))" : "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = "rgb(var(--fg))"; }}
              onBlur={(e) => { e.target.style.borderColor = value ? "rgb(var(--fg))" : "rgb(var(--line))"; }}
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
              style={{ borderColor: value ? "rgb(var(--fg))" : "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = "rgb(var(--fg))"; }}
              onBlur={(e) => { e.target.style.borderColor = value ? "rgb(var(--fg))" : "rgb(var(--line))"; }}
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
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors [-webkit-tap-highlight-color:transparent]"
                style={{ border: "1.5px solid rgb(var(--line))" }}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                  <path d="M10 3L5 8l5 5" />
                </svg>
                Back
              </button>
            ) : <span />}

            <div className="flex items-center gap-3">
              {status === "error" && (
                <span className="text-[13px] tracking-tight text-red-500">{error || "Something went wrong. Please try again."}</span>
              )}
              <button
                type="button"
                onClick={goNext}
                disabled={!canAdvance}
                className="send-btn inline-flex items-center gap-2 rounded-full pl-6 pr-5 py-2.5 text-[14px] tracking-tight font-medium transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
                style={{
                  background: "rgb(var(--fg))",
                  color: "rgb(var(--bg))",
                }}
              >
                {isLast ? "Send message" : "Continue"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="send-btn__arrow h-3.5 w-3.5" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
