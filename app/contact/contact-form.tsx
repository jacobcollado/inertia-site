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
      {/* Storefront walls */}
      <rect x="28" y="44" width="204" height="118" rx="2" stroke={muted} strokeWidth="1.2" opacity="0.45" />
      {/* Awning triangle */}
      <path d="M28 44 L130 18 L232 44" stroke={blue} strokeWidth="1.6" opacity="0.75" fill={blue} fillOpacity="0.06" />
      <line x1="28" y1="44" x2="232" y2="44" stroke={blue} strokeWidth="1.2" opacity="0.65" />
      {/* Awning stripes */}
      {[52,72,92,112,132,152,172,192,212].map(x => (
        <line key={x} x1={x} y1="44" x2={x - 11} y2="27" stroke={blue} strokeWidth="1" opacity="0.35" />
      ))}
      {/* Sign */}
      <rect x="88" y="50" width="84" height="16" rx="2" fill={blue} fillOpacity="0.12" stroke={blue} strokeWidth="1.2" opacity="0.7" />
      <line x1="102" y1="58" x2="158" y2="58" stroke={blue} strokeWidth="1.4" opacity="0.6" />
      {/* Left window */}
      <rect x="40" y="62" width="66" height="46" rx="2" stroke={blue} strokeWidth="1.2" opacity="0.65" fill={blue} fillOpacity="0.05" />
      <line x1="73" y1="62" x2="73" y2="108" stroke={blue} strokeWidth="0.9" opacity="0.45" />
      <line x1="40" y1="85" x2="106" y2="85" stroke={blue} strokeWidth="0.9" opacity="0.45" />
      {/* Right window */}
      <rect x="154" y="62" width="66" height="46" rx="2" stroke={muted} strokeWidth="1" opacity="0.45" />
      <line x1="187" y1="62" x2="187" y2="108" stroke={muted} strokeWidth="0.8" opacity="0.35" />
      <line x1="154" y1="85" x2="220" y2="85" stroke={muted} strokeWidth="0.8" opacity="0.35" />
      {/* Door */}
      <rect x="105" y="112" width="50" height="50" rx="2" stroke={muted} strokeWidth="1.1" opacity="0.45" />
      <circle cx="149" cy="138" r="3" fill={muted} opacity="0.5" />
      {/* Ground */}
      <line x1="18" y1="162" x2="242" y2="162" stroke={muted} strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

function SketchPerson() {
  const green = "rgb(var(--green))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Outer glow ring */}
      <circle cx="130" cy="68" r="44" stroke={green} strokeWidth="1.2" opacity="0.3" strokeDasharray="4 4" />
      {/* Head */}
      <circle cx="130" cy="56" r="24" stroke={green} strokeWidth="1.6" opacity="0.75" fill={green} fillOpacity="0.07" />
      {/* Shoulders / bust */}
      <path d="M72 148 Q72 110 130 110 Q188 110 188 148" stroke={green} strokeWidth="1.6" opacity="0.65" />
      {/* Neck */}
      <line x1="130" y1="80" x2="130" y2="110" stroke={green} strokeWidth="1.2" opacity="0.35" />
      {/* Name tag */}
      <rect x="94" y="120" width="72" height="30" rx="3" stroke={green} strokeWidth="1.2" opacity="0.55" fill={green} fillOpacity="0.05" />
      <line x1="106" y1="131" x2="154" y2="131" stroke={green} strokeWidth="1.6" opacity="0.65" />
      <line x1="106" y1="140" x2="142" y2="140" stroke={muted} strokeWidth="1" opacity="0.4" />
      {/* Wave lines — greeting */}
      <path d="M52 68 Q46 76 52 84 Q58 92 52 100" stroke={green} strokeWidth="1.2" opacity="0.5" fill="none" />
      <path d="M208 68 Q214 76 208 84 Q202 92 208 100" stroke={green} strokeWidth="1.2" opacity="0.5" fill="none" />
    </svg>
  );
}

function SketchEmail() {
  const green = "rgb(var(--green))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Envelope body — fits within viewBox */}
      <rect x="36" y="46" width="188" height="118" rx="4" stroke={green} strokeWidth="1.6" opacity="0.7" fill={green} fillOpacity="0.05" />
      {/* Flap crease — V shape at top */}
      <path d="M36 46 L130 106 L224 46" stroke={green} strokeWidth="1.4" opacity="0.7" />
      {/* Bottom-left fold */}
      <line x1="36" y1="164" x2="104" y2="116" stroke={muted} strokeWidth="1" opacity="0.35" />
      {/* Bottom-right fold */}
      <line x1="224" y1="164" x2="156" y2="116" stroke={muted} strokeWidth="1" opacity="0.35" />
      {/* Letter lines visible below the flap point */}
      <line x1="88" y1="122" x2="172" y2="122" stroke={muted} strokeWidth="1" opacity="0.4" />
      <line x1="88" y1="134" x2="172" y2="134" stroke={muted} strokeWidth="1" opacity="0.4" />
      <line x1="88" y1="146" x2="148" y2="146" stroke={muted} strokeWidth="1" opacity="0.35" />
      {/* Send arrow — top left */}
      <line x1="36" y1="26" x2="72" y2="26" stroke={green} strokeWidth="1.6" opacity="0.65" />
      <polyline points="62,18 72,26 62,34" stroke={green} strokeWidth="1.6" opacity="0.65" />
      {/* Signal dots — top right */}
      <circle cx="178" cy="26" r="4" fill={green} opacity="0.55" />
      <circle cx="196" cy="26" r="4" fill={green} opacity="0.38" />
      <circle cx="214" cy="26" r="4" fill={green} opacity="0.2" />
    </svg>
  );
}

function SketchBudget() {
  const amber = "rgb(var(--amber))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Baseline */}
      <line x1="34" y1="148" x2="226" y2="148" stroke={muted} strokeWidth="1" opacity="0.35" />
      {/* Coin stack 1 — small */}
      {[0,7,14,16].map((y, i) => (
        <ellipse key={i} cx="72" cy={148 - y} rx="30" ry="9" stroke={amber} strokeWidth={i === 3 ? 1.4 : 1.1} opacity={0.3 + i * 0.12} fill={amber} fillOpacity={0.04 + i * 0.01} />
      ))}
      {/* Coin stack 2 — tallest */}
      {[0,7,14,21,28,35,42].map((y, i) => (
        <ellipse key={i} cx="130" cy={148 - y} rx="30" ry="9" stroke={amber} strokeWidth={i === 6 ? 1.6 : 1.1} opacity={0.25 + i * 0.09} fill={amber} fillOpacity={0.03 + i * 0.01} />
      ))}
      {/* Coin stack 3 — medium */}
      {[0,7,14,21].map((y, i) => (
        <ellipse key={i} cx="188" cy={148 - y} rx="30" ry="9" stroke={amber} strokeWidth={i === 3 ? 1.4 : 1.1} opacity={0.3 + i * 0.1} fill={amber} fillOpacity={0.04 + i * 0.01} />
      ))}
      {/* Dollar sign — top center */}
      <line x1="130" y1="22" x2="130" y2="50" stroke={amber} strokeWidth="1.4" opacity="0.65" />
      <path d="M116 30 Q116 22 130 22 Q144 22 144 30 Q144 38 130 38 Q116 38 116 46 Q116 54 130 54 Q144 54 144 46"
        stroke={amber} strokeWidth="1.6" opacity="0.7" fill="none" />
      {/* Label lines under stacks */}
      <line x1="50" y1="158" x2="94" y2="158" stroke={muted} strokeWidth="0.9" opacity="0.3" />
      <line x1="108" y1="158" x2="152" y2="158" stroke={amber} strokeWidth="1.1" opacity="0.55" />
      <line x1="166" y1="158" x2="210" y2="158" stroke={muted} strokeWidth="0.9" opacity="0.3" />
    </svg>
  );
}

function SketchTimeline() {
  const amber = "rgb(var(--amber))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Track */}
      <line x1="26" y1="94" x2="238" y2="94" stroke={muted} strokeWidth="1.2" opacity="0.4" />
      {/* Arrow cap */}
      <polyline points="228,86 238,94 228,102" stroke={amber} strokeWidth="1.6" opacity="0.75" />
      {/* Milestone dots */}
      {[56, 106, 156, 206].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="94" r={i === 0 ? 6 : 5} fill={i === 0 ? amber : "none"} fillOpacity={i === 0 ? 0.25 : 0} stroke={amber} strokeWidth="1.5" opacity={0.8 - i * 0.14} />
          {/* Connector to label */}
          <line x1={x} y1="94" x2={x} y2={i % 2 === 0 ? 66 : 122} stroke={muted} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        </g>
      ))}
      {/* Label blocks — alternating above/below */}
      <rect x="36" y="50" width="40" height="14" rx="2" fill={amber} fillOpacity="0.15" stroke={amber} strokeWidth="1.2" opacity="0.7" />
      <rect x="86" y="124" width="40" height="14" rx="2" stroke={muted} strokeWidth="1" opacity="0.4" />
      <rect x="136" y="50" width="40" height="14" rx="2" stroke={muted} strokeWidth="1" opacity="0.4" />
      <rect x="186" y="124" width="40" height="14" rx="2" stroke={muted} strokeWidth="1" opacity="0.35" />
      {/* "Now" tick above first node */}
      <line x1="56" y1="46" x2="56" y2="38" stroke={amber} strokeWidth="1.4" opacity="0.65" />
      <line x1="50" y1="38" x2="62" y2="38" stroke={amber} strokeWidth="1.2" opacity="0.55" />
    </svg>
  );
}

function SketchMessage() {
  const purple = "rgb(var(--purple))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Speech bubble */}
      <path d="M26 28 Q26 16 38 16 L222 16 Q234 16 234 28 L234 124 Q234 136 222 136 L104 136 L74 164 L74 136 L38 136 Q26 136 26 124 Z"
        stroke={purple} strokeWidth="1.6" opacity="0.65" fill={purple} fillOpacity="0.05" />
      {/* Text lines */}
      <line x1="48" y1="46" x2="212" y2="46" stroke={muted} strokeWidth="1.1" opacity="0.4" />
      <line x1="48" y1="62" x2="212" y2="62" stroke={muted} strokeWidth="1.1" opacity="0.4" />
      <line x1="48" y1="78" x2="186" y2="78" stroke={muted} strokeWidth="1.1" opacity="0.4" />
      <line x1="48" y1="94" x2="212" y2="94" stroke={muted} strokeWidth="1.1" opacity="0.35" />
      <line x1="48" y1="110" x2="164" y2="110" stroke={muted} strokeWidth="1.1" opacity="0.35" />
      {/* Cursor */}
      <line x1="172" y1="104" x2="172" y2="118" stroke={purple} strokeWidth="2" opacity="0.8" strokeLinecap="butt" />
      {/* Corner bracket accent */}
      <polyline points="200,16 214,16 214,30" stroke={purple} strokeWidth="1.4" opacity="0.6" />
    </svg>
  );
}

function SketchSent() {
  const green = "rgb(var(--green))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <circle cx="130" cy="90" r="64" stroke={green} strokeWidth="1.2" opacity="0.3" />
      <circle cx="130" cy="90" r="48" stroke={green} strokeWidth="1.6" opacity="0.6" fill={green} fillOpacity="0.06" />
      <polyline points="104,90 122,110 158,68" stroke={green} strokeWidth="3" opacity="0.85" strokeLinecap="round" strokeLinejoin="round" />
      {[0,45,90,135,180,225,270,315].map((deg) => {
        const r = Math.PI * deg / 180;
        const x1 = 130 + Math.cos(r) * 72;
        const y1 = 90 + Math.sin(r) * 72;
        const x2 = 130 + Math.cos(r) * 82;
        const y2 = 90 + Math.sin(r) * 82;
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={green} strokeWidth="1.2" opacity="0.5" />;
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
            className="w-full max-w-[320px]"
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
