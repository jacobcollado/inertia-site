"use client";

import { useEffect, useRef, useState } from "react";

// "How much work is this?" answered right before the comparison. Install and
// setup are done for the buyer, same day, through a Shopify collaborator
// request.

const LIVE_GREEN = "22 163 74";

// Written for store owners who have never heard of a collaborator request:
// what they do, in plain words, and a clear line where their part ends.
const STEPS: { title: string; desc: string; time: string }[] = [
  {
    title: "You buy",
    desc: "Your license key arrives within a minute.",
    time: "1 min",
  },
  {
    title: "You tap accept",
    desc: "We ask Shopify for access to your store. One tap lets us in.",
    time: "1 min",
  },
  {
    title: "We set it up",
    desc: "We install Aether and get it ready. Nothing for you to do.",
    time: "Same day",
  },
];

const ROW = "grid grid-cols-[4.25rem_0.75rem_1fr] sm:grid-cols-[5rem_0.75rem_1fr] gap-x-4 sm:gap-x-5";
const TITLE = "text-[18px] sm:text-[19px] font-normal tracking-tight leading-[1.35] text-[rgb(var(--fg))]";
const DESC = "mt-0.5 text-[15px] sm:text-[16px] tracking-tight leading-snug text-[rgb(var(--muted))] [text-wrap:pretty]";

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
          <div className="min-w-0 pb-7 sm:pb-8">
            <p className={TITLE}>{step.title}</p>
            <p className={DESC}>{step.desc}</p>
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
          <p className={TITLE}>You publish when ready</p>
          <p className={DESC}>Your current theme stays live until you do.</p>
        </div>
      </li>
    </ol>
  );
}
