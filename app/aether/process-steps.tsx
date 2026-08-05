"use client";

import React from "react";
import Link from "next/link";
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

export function ProcessSteps() {
  const [open, setOpen] = useState<number | null>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const syncActiveFromScroll = () => {
      if (window.matchMedia("(min-width: 640px)").matches) return;
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

  const scrollToCard = (i: number) => {
    const el = scrollRef.current;
    const card = cardRefs.current[i];
    if (!el || !card) return;
    const target = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    el.scrollTo({ left: target, behavior: "smooth" });
    setOpen(i);
  };

  const handleCardClick = (i: number, isOpen: boolean) => {
    if (window.matchMedia("(max-width: 639px)").matches) return;
    setOpen(isOpen ? null : i);
  };

  return (
    <div className="px-3 sm:px-8 py-14 sm:py-20 rise">
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
                className={`text-left rounded-2xl p-6 sm:p-8 sm:flex-1 sm:min-w-0 shrink-0 snap-center w-[85vw] sm:w-auto bg-[rgb(var(--surface))] max-sm:scale-100 ${
                  isOpen ? "sm:bg-[rgb(var(--surface))] sm:scale-100" : "sm:bg-[rgb(var(--surface)/0.4)] sm:scale-[0.96]"
                }`}
                style={{ transformOrigin: "center", transition: "background 500ms cubic-bezier(0.22,1,0.36,1), transform 500ms cubic-bezier(0.22,1,0.36,1)" }}
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
                    style={{ transition: "opacity 500ms cubic-bezier(0.22,1,0.36,1)" }}
                  >
                    {s.step}
                  </p>
                  <p className="text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))] mb-3" style={{ opacity: 0.6 }}>
                    {s.desc}
                  </p>
                </button>
                <div
                  className={`grid grid-rows-[1fr] ${isOpen ? "sm:grid-rows-[1fr]" : "sm:grid-rows-[0fr]"}`}
                  style={{ transition: "grid-template-rows 550ms cubic-bezier(0.22,1,0.36,1)" }}
                >
                  <div className="max-sm:overflow-visible sm:overflow-hidden min-h-0">
                    <p
                      className={`text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-sm:opacity-70 max-sm:translate-y-0 ${
                        isOpen ? "sm:opacity-70 sm:translate-y-0" : "sm:opacity-0 sm:-translate-y-1.5"
                      }`}
                      style={{
                        transition: "opacity 450ms cubic-bezier(0.22,1,0.36,1), transform 450ms cubic-bezier(0.22,1,0.36,1)",
                        transitionDelay: isOpen ? "80ms" : "0ms",
                      }}
                    >
                      {s.detail}
                    </p>
                    {i === 2 && (
                      <Link
                        href="/aether/buy"
                        className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium tracking-tight hover:opacity-80 transition-opacity max-sm:opacity-100 max-sm:translate-y-0 ${
                          isOpen ? "sm:opacity-100 sm:translate-y-0" : "sm:opacity-0 sm:-translate-y-1.5"
                        }`}
                        style={{
                          background: "#1a1a1a",
                          color: "#ededed",
                          transition: "opacity 450ms cubic-bezier(0.22,1,0.36,1), transform 450ms cubic-bezier(0.22,1,0.36,1)",
                          transitionDelay: isOpen ? "80ms" : "0ms",
                        }}
                      >
                        Get Aether
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </Link>
                    )}
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
