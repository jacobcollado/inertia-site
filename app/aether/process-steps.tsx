"use client";

import { useEffect, useRef, useState } from "react";
import { aetherLiquidTransition } from "./motion";

const STEPS = [
  {
    step: "Buy",
    detail: "Two options, no fine print. Core at $85 a year, or Forever at $105 once with priority support. Same theme, same 41 sections, same single-store license. The only difference is how you'd rather pay.",
  },
  {
    step: "Install",
    detail: "Download the .zip, upload it in Shopify admin, hit publish. Most stores are live within the hour. All 41 sections drag onto any page, and at no point do you need to hire anyone.",
  },
  {
    step: "Sell",
    detail: "The sticky cart, the trust badges, the gallery order, the upsell placements. All of it ran on live stores with real traffic before it shipped. What you're installing is what already worked.",
  },
] as const;

function rowFocusStyle(active: boolean, reducedMotion: boolean): React.CSSProperties {
  if (reducedMotion) {
    return {
      opacity: active ? 1 : 0.45,
      transition: "opacity 300ms ease",
    };
  }
  return {
    opacity: active ? 1 : 0.38,
    transform: active ? "scale(1)" : "scale(0.995)",
    filter: active ? "blur(0px)" : "blur(4px)",
    willChange: "opacity, transform, filter",
    transition: aetherLiquidTransition(),
  };
}

function StepCopy({ step, detail, compact }: { step: string; detail: string; compact?: boolean }) {
  return (
    <>
      <p className={`font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] ${compact ? "text-[clamp(1.6rem,2.5vw,2rem)]" : "text-[clamp(2rem,5vw,2.75rem)]"}`}>
        {step}
      </p>
      <p className={`leading-relaxed tracking-tight text-[rgb(var(--muted))] ${compact ? "text-[13px] sm:text-[14px] mt-3" : "text-[14px] sm:text-[15px] mt-2"}`}>
        {detail}
      </p>
    </>
  );
}

export function ProcessSteps() {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const hoverPausedRef = useRef(false);
  const pausedUntilRef = useRef(0);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const pauseAuto = (ms = 8000) => {
    pausedUntilRef.current = Date.now() + ms;
  };

  const isAutoPaused = () => hoverPausedRef.current || Date.now() < pausedUntilRef.current;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 3000;
      timeoutId = setTimeout(() => {
        if (isAutoPaused()) {
          scheduleNext();
          return;
        }
        setActive((current) => (current + 1) % STEPS.length);
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, []);

  const selectStep = (i: number) => {
    pauseAuto();
    setActive(i);
  };

  return (
    <div
      className="px-3 py-14 sm:py-20"
      onMouseEnter={() => { hoverPausedRef.current = true; }}
      onMouseLeave={() => { hoverPausedRef.current = false; }}
    >
      <div
        className="w-full flex flex-col gap-4 sm:grid sm:grid-cols-3 sm:gap-x-8 sm:items-stretch"
        role="tablist"
        aria-label="How it works"
      >
        {STEPS.map((s, i) => {
          const isActive = active === i;
          return (
            <button
              key={s.step}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => selectStep(i)}
              className="rise rise--liquid flex flex-col gap-3 text-left rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface)/0.45)] p-5 cursor-pointer h-full w-full"
              style={{
                "--rise-delay": `${i * 90}ms`,
                ...rowFocusStyle(isActive, reducedMotion),
              } as React.CSSProperties}
            >
              <StepCopy step={s.step} detail={s.detail} compact />
            </button>
          );
        })}
      </div>
    </div>
  );
}
