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

/* ── Sketches ─────────────────────────────────────────────────────── */

function SketchStore() {
  const blue = "rgb(var(--blue))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Storefront frame */}
      <rect x="30" y="40" width="200" height="120" rx="2" stroke={muted} strokeWidth="0.8" opacity="0.3" />
      {/* Awning */}
      <path d="M30 40 L130 18 L230 40" stroke={blue} strokeWidth="1" opacity="0.6" />
      <line x1="30" y1="40" x2="230" y2="40" stroke={blue} strokeWidth="0.8" opacity="0.5" />
      {/* Awning stripes */}
      {[50,70,90,110,130,150,170,190,210].map(x => (
        <line key={x} x1={x} y1="40" x2={x - 10} y2="28" stroke={blue} strokeWidth="0.5" opacity="0.25" />
      ))}
      {/* Door */}
      <rect x="106" y="110" width="48" height="50" rx="1" stroke={muted} strokeWidth="0.7" opacity="0.3" />
      <circle cx="148" cy="136" r="2" fill={muted} opacity="0.3" />
      {/* Windows */}
      <rect x="42" y="60" width="64" height="44" rx="1" stroke={blue} strokeWidth="0.7" opacity="0.45" fill={blue} fillOpacity="0.04" />
      <rect x="154" y="60" width="64" height="44" rx="1" stroke={muted} strokeWidth="0.7" opacity="0.25" />
      {/* Window cross */}
      <line x1="74" y1="60" x2="74" y2="104" stroke={blue} strokeWidth="0.5" opacity="0.3" />
      <line x1="42" y1="82" x2="106" y2="82" stroke={blue} strokeWidth="0.5" opacity="0.3" />
      <line x1="186" y1="60" x2="186" y2="104" stroke={muted} strokeWidth="0.5" opacity="0.2" />
      <line x1="154" y1="82" x2="218" y2="82" stroke={muted} strokeWidth="0.5" opacity="0.2" />
      {/* Sign */}
      <rect x="90" y="50" width="80" height="14" rx="2" fill={blue} fillOpacity="0.1" stroke={blue} strokeWidth="0.6" opacity="0.5" />
      <line x1="104" y1="57" x2="156" y2="57" stroke={blue} strokeWidth="1" opacity="0.4" />
      {/* Ground */}
      <line x1="20" y1="160" x2="240" y2="160" stroke={muted} strokeWidth="0.5" opacity="0.2" />
    </svg>
  );
}

function SketchPerson() {
  const green = "rgb(var(--green))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Circle avatar */}
      <circle cx="130" cy="72" r="38" stroke={green} strokeWidth="1" opacity="0.5" />
      {/* Head */}
      <circle cx="130" cy="60" r="18" stroke={green} strokeWidth="1" opacity="0.6" fill={green} fillOpacity="0.05" />
      {/* Shoulders */}
      <path d="M80 140 Q80 108 130 108 Q180 108 180 140" stroke={green} strokeWidth="1" opacity="0.5" />
      {/* Name tag */}
      <rect x="96" y="118" width="68" height="28" rx="2" stroke={muted} strokeWidth="0.7" opacity="0.28" />
      <line x1="108" y1="128" x2="152" y2="128" stroke={green} strokeWidth="1.2" opacity="0.5" />
      <line x1="108" y1="136" x2="140" y2="136" stroke={muted} strokeWidth="0.6" opacity="0.25" />
      {/* Greeting arcs */}
      <path d="M60 72 A 72 72 0 0 1 60 100" stroke={green} strokeWidth="0.6" strokeDasharray="3 3" opacity="0.3" />
      <path d="M200 72 A 72 72 0 0 0 200 100" stroke={green} strokeWidth="0.6" strokeDasharray="3 3" opacity="0.3" />
      {/* Tick marks */}
      <line x1="55" y1="84" x2="48" y2="84" stroke={green} strokeWidth="0.7" opacity="0.35" />
      <line x1="204" y1="84" x2="212" y2="84" stroke={green} strokeWidth="0.7" opacity="0.35" />
    </svg>
  );
}

function SketchEmail() {
  const green = "rgb(var(--green))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Envelope */}
      <rect x="40" y="52" width="180" height="116" rx="3" stroke={green} strokeWidth="1" opacity="0.55" fill={green} fillOpacity="0.03" />
      {/* Flap open */}
      <path d="M40 52 L130 110 L220 52" stroke={green} strokeWidth="1" opacity="0.55" />
      {/* Left fold */}
      <line x1="40" y1="168" x2="100" y2="118" stroke={muted} strokeWidth="0.6" opacity="0.22" />
      {/* Right fold */}
      <line x1="220" y1="168" x2="160" y2="118" stroke={muted} strokeWidth="0.6" opacity="0.22" />
      {/* Letter lines inside */}
      <line x1="90" y1="128" x2="170" y2="128" stroke={muted} strokeWidth="0.7" opacity="0.25" />
      <line x1="90" y1="138" x2="170" y2="138" stroke={muted} strokeWidth="0.7" opacity="0.25" />
      <line x1="90" y1="148" x2="145" y2="148" stroke={muted} strokeWidth="0.7" opacity="0.25" />
      {/* Send arrow */}
      <line x1="188" y1="32" x2="222" y2="32" stroke={green} strokeWidth="1.2" opacity="0.6" />
      <polyline points="213,24 222,32 213,40" stroke={green} strokeWidth="1.2" opacity="0.6" />
      {/* Dots — signal */}
      <circle cx="56" cy="32" r="3" fill={green} opacity="0.35" />
      <circle cx="70" cy="32" r="3" fill={green} opacity="0.25" />
      <circle cx="84" cy="32" r="3" fill={green} opacity="0.15" />
    </svg>
  );
}

function SketchBudget() {
  const amber = "rgb(var(--amber))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Coin stack 1 */}
      {[0,6,12,18,24].map((y, i) => (
        <ellipse key={i} cx="80" cy={140 - y} rx="28" ry="8" stroke={amber} strokeWidth="0.8" opacity={0.25 + i * 0.1} fill={amber} fillOpacity={0.03} />
      ))}
      {/* Coin stack 2 — taller */}
      {[0,6,12,18,24,30,36].map((y, i) => (
        <ellipse key={i} cx="130" cy={140 - y} rx="28" ry="8" stroke={amber} strokeWidth="0.8" opacity={0.2 + i * 0.08} fill={amber} fillOpacity={0.03} />
      ))}
      {/* Coin stack 3 */}
      {[0,6,12].map((y, i) => (
        <ellipse key={i} cx="180" cy={140 - y} rx="28" ry="8" stroke={amber} strokeWidth="0.8" opacity={0.2 + i * 0.1} fill={amber} fillOpacity={0.02} />
      ))}
      {/* Labels */}
      <line x1="60" y1="152" x2="100" y2="152" stroke={muted} strokeWidth="0.5" opacity="0.2" />
      <line x1="110" y1="152" x2="150" y2="152" stroke={amber} strokeWidth="0.7" opacity="0.4" />
      <line x1="160" y1="152" x2="200" y2="152" stroke={muted} strokeWidth="0.5" opacity="0.2" />
      {/* Dollar sign */}
      <line x1="130" y1="28" x2="130" y2="52" stroke={amber} strokeWidth="1" opacity="0.55" />
      <path d="M118 36 Q118 28 130 28 Q142 28 142 36 Q142 44 130 44 Q118 44 118 52 Q118 60 130 60 Q142 60 142 52" stroke={amber} strokeWidth="1.2" opacity="0.6" />
      {/* Grid lines */}
      <line x1="40" y1="140" x2="220" y2="140" stroke={muted} strokeWidth="0.5" opacity="0.18" />
    </svg>
  );
}

function SketchTimeline() {
  const amber = "rgb(var(--amber))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Horizontal timeline */}
      <line x1="30" y1="90" x2="230" y2="90" stroke={muted} strokeWidth="0.7" opacity="0.25" />
      {/* Arrow */}
      <polyline points="222,83 230,90 222,97" stroke={amber} strokeWidth="1" opacity="0.6" />
      {/* Milestones */}
      {[60, 110, 160, 210].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="90" r={i === 0 ? 5 : 3.5} fill={i === 0 ? amber : "none"} stroke={amber} strokeWidth="0.9" opacity={0.7 - i * 0.12} />
          <line x1={x} y1="90" x2={x} y2={i % 2 === 0 ? 68 : 112} stroke={muted} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.22" />
        </g>
      ))}
      {/* Label blocks */}
      <rect x="42" y="52" width="36" height="12" rx="2" fill={amber} fillOpacity="0.12" stroke={amber} strokeWidth="0.6" opacity="0.5" />
      <rect x="92" y="112" width="36" height="12" rx="2" stroke={muted} strokeWidth="0.5" opacity="0.22" />
      <rect x="142" y="52" width="36" height="12" rx="2" stroke={muted} strokeWidth="0.5" opacity="0.22" />
      <rect x="192" y="112" width="36" height="12" rx="2" stroke={muted} strokeWidth="0.5" opacity="0.22" />
      {/* "Now" marker */}
      <line x1="60" y1="72" x2="60" y2="66" stroke={amber} strokeWidth="0.7" opacity="0.5" />
    </svg>
  );
}

function SketchMessage() {
  const purple = "rgb(var(--purple))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Speech bubble */}
      <path d="M30 30 Q30 20 40 20 L220 20 Q230 20 230 30 L230 120 Q230 130 220 130 L100 130 L70 158 L70 130 L40 130 Q30 130 30 120 Z"
        stroke={purple} strokeWidth="1" opacity="0.5" fill={purple} fillOpacity="0.04" />
      {/* Text lines */}
      <line x1="52" y1="50" x2="208" y2="50" stroke={muted} strokeWidth="0.9" opacity="0.28" />
      <line x1="52" y1="64" x2="208" y2="64" stroke={muted} strokeWidth="0.9" opacity="0.28" />
      <line x1="52" y1="78" x2="180" y2="78" stroke={muted} strokeWidth="0.9" opacity="0.28" />
      <line x1="52" y1="92" x2="208" y2="92" stroke={muted} strokeWidth="0.9" opacity="0.22" />
      <line x1="52" y1="106" x2="160" y2="106" stroke={muted} strokeWidth="0.9" opacity="0.22" />
      {/* Cursor blink */}
      <line x1="168" y1="100" x2="168" y2="112" stroke={purple} strokeWidth="1.5" opacity="0.7" strokeLinecap="butt" />
      {/* Corner accent */}
      <circle cx="220" cy="20" r="0" />
      <polyline points="196,20 208,20 208,32" stroke={purple} strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

function SketchSent() {
  const green = "rgb(var(--green))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Large checkmark circle */}
      <circle cx="130" cy="90" r="60" stroke={green} strokeWidth="1" opacity="0.3" />
      <circle cx="130" cy="90" r="44" stroke={green} strokeWidth="0.8" opacity="0.45" fill={green} fillOpacity="0.04" />
      {/* Check */}
      <polyline points="104,90 122,108 158,72" stroke={green} strokeWidth="2.5" opacity="0.75" strokeLinecap="round" strokeLinejoin="round" />
      {/* Radiating lines */}
      {[0,45,90,135,180,225,270,315].map((deg) => {
        const r = Math.PI * deg / 180;
        const x1 = 130 + Math.cos(r) * 68;
        const y1 = 90 + Math.sin(r) * 68;
        const x2 = 130 + Math.cos(r) * 76;
        const y2 = 90 + Math.sin(r) * 76;
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={green} strokeWidth="0.7" opacity="0.35" />;
      })}
    </svg>
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
    sketch: <SketchStore />,
  },
  {
    key: "name",
    question: () => "What should I call you?",
    type: "text",
    placeholder: "your name",
    autoComplete: "name",
    accent: "rgb(var(--green))",
    sketch: <SketchPerson />,
  },
  {
    key: "email",
    question: (a) => `Nice to meet you, ${a.name || "you"}. Best email?`,
    type: "email",
    placeholder: "you@example.com",
    autoComplete: "email",
    accent: "rgb(var(--green))",
    sketch: <SketchEmail />,
  },
  {
    key: "budget",
    question: () => "What's the rough budget?",
    type: "choice",
    options: ["Under $2k", "$2k – $5k", "$5k – $15k", "$15k+", "Not decided yet"],
    accent: "rgb(var(--amber))",
    showIf: (a) => a.type === "Custom Shopify store" || a.type === "Brand + web project",
    sketch: <SketchBudget />,
  },
  {
    key: "timeline",
    question: () => "When do you need to launch?",
    type: "choice",
    options: ["ASAP", "1 – 2 months", "3 – 6 months", "No hard deadline"],
    accent: "rgb(var(--amber))",
    showIf: (a) => a.type === "Custom Shopify store" || a.type === "Brand + web project",
    sketch: <SketchTimeline />,
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
    sketch: <SketchMessage />,
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

  const sketch = isSubmitting || status === "sent"
    ? <SketchSent />
    : current?.sketch;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col sm:flex-row">

      {/* Left — sketch panel */}
      <div className="sm:w-[44%] sm:border-r border-[rgb(var(--line))] flex flex-col">
        {/* Sketch area */}
        <div
          className="flex-1 flex items-center justify-center px-8 py-10 sm:py-16"
          style={{ minHeight: "200px" }}
        >
          <div
            key={`sk-${animKey}-${status}`}
            className="w-full max-w-[260px]"
            style={{ animation: "rise-in 400ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "80ms" }}
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
                    className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
                  >
                    ← back
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
