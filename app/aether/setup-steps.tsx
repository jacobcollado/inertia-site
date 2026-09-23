"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// "How much work is this?" answered right before the comparison. Install and
// setup are done for the buyer, same day, through a Shopify collaborator
// request.

const LIVE_GREEN = "22 163 74";

// Small, muted stand-ins for what the buyer actually sees at each step.
// Decorative only: the step copy carries the meaning.
function Chip({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="mt-3 inline-flex max-w-full items-center gap-2.5 rounded-[8px] border border-[rgb(var(--line))] bg-[rgb(var(--surface)/0.5)] px-2.5 py-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))]"
    >
      {children}
    </div>
  );
}

const STEPS: { title: string; desc: string; time: string; chip: ReactNode }[] = [
  {
    title: "Buy",
    desc: "Pay once. Your license key arrives within a minute.",
    time: "1 min",
    chip: (
      <Chip>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 shrink-0">
          <circle cx="5" cy="11" r="3" />
          <path d="M7.2 8.8 14 2M11.5 4.5l2 2" />
        </svg>
        <span className="tabular-nums">AETH-4F9K-····-····</span>
      </Chip>
    ),
  },
  {
    title: "Accept our request",
    desc: "We send a Shopify collaborator request. One click lets us in.",
    time: "1 min",
    chip: (
      <Chip>
        <span className="truncate">Inertia requested collaborator access</span>
        <span className="shrink-0 rounded-[6px] bg-[rgb(var(--fg))] px-2 py-0.5 text-[12px] font-medium text-[rgb(var(--bg))]">
          Accept
        </span>
      </Chip>
    ),
  },
  {
    title: "We set it up",
    desc: "We install Aether and set it up on your store.",
    time: "Same day",
    chip: (
      <Chip>
        <span className="text-[rgb(var(--fg))]">Aether</span>
        <span className="inline-flex items-center gap-1">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3 shrink-0">
            <polyline points="3 8.5 6.5 12 13 4.5" />
          </svg>
          Set up and ready
        </span>
      </Chip>
    ),
  },
];

const ROW = "grid grid-cols-[4.25rem_0.75rem_1fr] sm:grid-cols-[5rem_0.75rem_1fr] gap-x-4 sm:gap-x-5";
const TITLE = "text-[19px] sm:text-[21px] font-medium tracking-tight leading-[1.35] text-[rgb(var(--fg))]";
const DESC = "mt-1 text-[16px] sm:text-[17px] tracking-tight leading-snug text-[rgb(var(--muted))] [text-wrap:pretty]";

// The rail draws down one segment at a time once the list is in view, and
// each dot fills as the line reaches it, ending on the green "live" dot.
const RAIL_START = 400;
const RAIL_STEP = 450;
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

export function SetupSteps() {
  const listRef = useRef<HTMLOListElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        setDrawn(true);
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const at = (i: number) => `${RAIL_START + i * RAIL_STEP}ms`;

  return (
    <ol ref={listRef} className="max-w-lg mx-auto">
      {STEPS.map((step, i) => (
        <li
          key={step.title}
          className={`rise rise--liquid ${ROW}`}
          style={{ "--rise-delay": `${120 + i * 70}ms` } as React.CSSProperties}
        >
          <span className="text-right text-[15px] sm:text-[16px] leading-[1.35] pt-[3px] tracking-tight tabular-nums whitespace-nowrap text-[rgb(var(--muted))]">
            {step.time}
          </span>
          <span className="flex flex-col items-center" aria-hidden="true">
            <span
              className="mt-[10px] size-[9px] shrink-0 rounded-full border motion-reduce:transition-none"
              style={{
                borderColor: drawn ? "rgb(var(--fg) / 0.55)" : "rgb(var(--line))",
                background: drawn ? "rgb(var(--fg) / 0.55)" : "rgb(var(--bg))",
                transition: `background-color 300ms ease ${at(i)}, border-color 300ms ease ${at(i)}`,
              }}
            />
            <span className="relative mt-2 w-px flex-1 bg-[rgb(var(--line))]">
              <span
                className="absolute inset-0 origin-top bg-[rgb(var(--fg)/0.4)] motion-reduce:transition-none"
                style={{
                  transform: drawn ? "scaleY(1)" : "scaleY(0)",
                  transition: `transform ${RAIL_STEP}ms ${EASE} ${at(i)}`,
                }}
              />
            </span>
          </span>
          <div className="min-w-0 pb-8 sm:pb-10">
            <p className={TITLE}>{step.title}</p>
            <p className={DESC}>{step.desc}</p>
            {step.chip}
          </div>
        </li>
      ))}

      <li
        className={`rise rise--liquid ${ROW}`}
        style={{ "--rise-delay": `${120 + STEPS.length * 70}ms` } as React.CSSProperties}
      >
        <span />
        <span className="flex justify-center" aria-hidden="true">
          <span
            className="mt-[9px] size-[11px] shrink-0 rounded-full border-2 motion-reduce:transition-none"
            style={{
              borderColor: drawn ? `rgb(${LIVE_GREEN})` : "rgb(var(--line))",
              background: drawn ? `rgb(${LIVE_GREEN})` : "rgb(var(--bg))",
              boxShadow: drawn ? `0 0 0 4px rgb(${LIVE_GREEN} / 0.15)` : "0 0 0 0 transparent",
              transition: `background-color 400ms ease ${at(STEPS.length)}, border-color 400ms ease ${at(STEPS.length)}, box-shadow 600ms ease ${at(STEPS.length)}`,
            }}
          />
        </span>
        <div>
          <p className={TITLE}>You&apos;re live</p>
          <p className={DESC}>Your current theme stays up until you publish.</p>
        </div>
      </li>
    </ol>
  );
}
