"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";

const STEPS = [
  {
    step: "Buy",
    desc: "One decision, not a checklist",
    detail: "Two options, no fine print. Core at $85 a year, or Forever at $105 once with priority support. Same theme, same 41 sections, same single-store license. The only difference is how you'd rather pay.",
  },
  {
    step: "Install",
    desc: "Live before you finish your coffee",
    detail: "Download the .zip, upload it in Shopify admin, hit publish. Most stores are live within the hour. All 41 sections drag onto any page, and at no point do you need to hire anyone.",
  },
  {
    step: "Sell",
    desc: "Built on stores that were already selling",
    detail: "The sticky cart, the trust badges, the gallery order, the upsell placements. All of it ran on live stores with real traffic before it shipped. What you're installing is what already worked.",
  },
];

const STEP_MS = 750;
const STEP_GAP_MS = 320;
const STEP_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function ProcessSteps() {
  const [open, setOpen] = useState<number | null>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const openRef = useRef(open);
  const hoverPausedRef = useRef(false);
  const pausedUntilRef = useRef(0);
  const transitioningRef = useRef(false);
  const stepTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  openRef.current = open;

  const clearStepTimers = () => {
    stepTimersRef.current.forEach(clearTimeout);
    stepTimersRef.current = [];
  };

  const after = (ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms);
    stepTimersRef.current.push(id);
  };

  const pauseAuto = (ms = 8000) => {
    pausedUntilRef.current = Date.now() + ms;
  };

  const isAutoPaused = () => hoverPausedRef.current || Date.now() < pausedUntilRef.current;

  const goToStep = (i: number, smoothScroll = true) => {
    const el = scrollRef.current;
    const card = cardRefs.current[i];
    if (window.matchMedia("(max-width: 639px)").matches && el && card) {
      const target = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
      el.scrollTo({ left: target, behavior: smoothScroll ? "smooth" : "auto" });
    }
    setOpen(i);
  };

  const transitionToStepRef = useRef<(nextIndex: number, onComplete?: () => void) => void>(() => {});
  transitionToStepRef.current = (nextIndex, onComplete) => {
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isMobile || reducedMotion) {
      goToStep(nextIndex);
      onComplete?.();
      return;
    }

    if (transitioningRef.current) return;

    const current = openRef.current;
    if (current === nextIndex) {
      onComplete?.();
      return;
    }

    transitioningRef.current = true;
    pauseAuto(STEP_MS * 2 + STEP_GAP_MS + 8000);

    if (current !== null) {
      setOpen(null);
      after(STEP_MS + STEP_GAP_MS, () => {
        setOpen(nextIndex);
        after(STEP_MS, () => {
          transitioningRef.current = false;
          onComplete?.();
        });
      });
    } else {
      setOpen(nextIndex);
      after(STEP_MS, () => {
        transitioningRef.current = false;
        onComplete?.();
      });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const syncActiveFromScroll = () => {
      if (window.matchMedia("(min-width: 640px)").matches) return;
      pauseAuto();
      const containerCenter = el.scrollLeft + el.clientWidth / 2;
      let nearest = 0;
      let nearestDist = Infinity;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(containerCenter - cardCenter);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = i;
        }
      });
      setOpen(nearest);
    };

    el.addEventListener("scroll", syncActiveFromScroll, { passive: true });
    return () => el.removeEventListener("scroll", syncActiveFromScroll);
  }, []);

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
        const current = openRef.current ?? -1;
        const nextIndex = (current + 1) % STEPS.length;
        transitionToStepRef.current(nextIndex, scheduleNext);
      }, delay);
    };

    scheduleNext();
    return () => {
      clearTimeout(timeoutId);
      clearStepTimers();
      transitioningRef.current = false;
    };
  }, []);

  const scrollToCard = (i: number) => {
    pauseAuto();
    transitionToStepRef.current(i);
  };

  const handleCardClick = (i: number, isOpen: boolean) => {
    if (window.matchMedia("(max-width: 639px)").matches) return;
    pauseAuto();
    if (isOpen) {
      if (transitioningRef.current) return;
      setOpen(null);
      return;
    }
    transitionToStepRef.current(i);
  };

  return (
    <div
      className="px-3 sm:px-8 py-14 sm:py-20"
      onMouseEnter={() => { hoverPausedRef.current = true; }}
      onMouseLeave={() => { hoverPausedRef.current = false; }}
    >
      <div
        ref={scrollRef}
        className="relative flex flex-row gap-3 sm:gap-0 sm:items-stretch overflow-x-auto snap-x snap-mandatory scroll-smooth sm:overflow-visible -mx-3 px-3 sm:mx-0 sm:px-0 pb-2 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {STEPS.map((s, i) => {
          const isOpen = open === i;
          return (
            <React.Fragment key={s.step}>
              <div
                ref={(el) => { cardRefs.current[i] = el; }}
                className="shrink-0 snap-center w-[85vw] sm:w-auto sm:flex-1 sm:min-w-0 rise rise--liquid"
                style={{ "--rise-delay": `${i * 90}ms` } as React.CSSProperties}
              >
                <div
                  className={`text-left rounded-2xl p-6 sm:p-8 h-full bg-[rgb(var(--surface))] max-sm:scale-100 ${
                    isOpen ? "sm:bg-[rgb(var(--surface))] sm:scale-100" : "sm:bg-[rgb(var(--surface)/0.4)] sm:scale-[0.96]"
                  }`}
                  style={{
                    transformOrigin: "center",
                    transition: `background ${STEP_MS}ms ${STEP_EASE}, transform ${STEP_MS}ms ${STEP_EASE}`,
                  }}
                >
                <button
                  type="button"
                  onClick={() => handleCardClick(i, isOpen)}
                  className="w-full text-left sm:cursor-pointer max-sm:cursor-default"
                >
                  <p
                    className={`text-[clamp(2.2rem,4vw,3.2rem)] font-normal tracking-[-0.04em] leading-none mb-3 text-[rgb(var(--fg))] max-sm:opacity-100 ${
                      isOpen ? "sm:opacity-100" : "sm:opacity-40"
                    }`}
                    style={{ transition: `opacity ${STEP_MS}ms ${STEP_EASE}` }}
                  >
                    {s.step}
                  </p>
                  <p className="text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))] mb-3" style={{ opacity: 0.6 }}>
                    {s.desc}
                  </p>
                </button>
                <div
                  className={`grid grid-rows-[1fr] ${isOpen ? "sm:grid-rows-[1fr]" : "sm:grid-rows-[0fr]"}`}
                  style={{ transition: `grid-template-rows ${STEP_MS}ms ${STEP_EASE}` }}
                >
                  <div className="max-sm:overflow-visible sm:overflow-hidden min-h-0">
                    <p
                      className={`text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-sm:opacity-70 max-sm:translate-y-0 ${
                        isOpen ? "sm:opacity-70 sm:translate-y-0" : "sm:opacity-0 sm:-translate-y-1.5"
                      }`}
                      style={{
                        transition: `opacity ${STEP_MS}ms ${STEP_EASE}, transform ${STEP_MS}ms ${STEP_EASE}`,
                        transitionDelay: isOpen ? "120ms" : "0ms",
                      }}
                    >
                      {s.detail}
                    </p>
                  </div>
                </div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden sm:flex items-center justify-center px-2 shrink-0" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="rgb(var(--muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ opacity: 0.35 }}>
                    <line x1="4" y1="12" x2="20" y2="12"/>
                    <polyline points="14 6 20 12 14 18"/>
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="sm:hidden flex justify-start gap-1.5 mt-4 px-3" role="tablist" aria-label="Process steps">
        {STEPS.map((s, i) => (
          <button
            key={s.step}
            type="button"
            role="tab"
            aria-selected={open === i}
            aria-label={s.step}
            onClick={() => scrollToCard(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: open === i ? 20 : 6,
              height: 6,
              background: open === i ? "rgb(var(--fg))" : "rgb(var(--fg) / 0.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
