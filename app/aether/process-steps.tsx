"use client";

import React from "react";
import Link from "next/link";
import { useState, useRef, useLayoutEffect } from "react";

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
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [centers, setCenters] = useState<number[]>([]);

  useLayoutEffect(() => {
    if (window.matchMedia("(min-width: 640px)").matches) return;

    const measure = () => {
      const container = containerRef.current;
      if (!container) return;
      const containerTop = container.getBoundingClientRect().top;
      setCenters(
        cardRefs.current.map((el) => {
          if (!el) return 0;
          const r = el.getBoundingClientRect();
          return r.top - containerTop + r.height / 2;
        })
      );
    };
    measure();
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      measure();
      if (now - start < 600) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [open]);

  const RADIUS = 8;

  return (
    <div className="px-3 sm:px-8 py-14 sm:py-20 rise">
      <div ref={containerRef} className="relative flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-stretch">
        {STEPS.slice(0, -1).map((_, i) => {
          const centerTop = centers[i];
          const nextCenterTop = centers[i + 1];
          if (centerTop === undefined || nextCenterTop === undefined) return null;
          const height = nextCenterTop - centerTop;
          const r = Math.min(RADIUS, height / 2);
          return (
            <svg
              key={`spine-${i}`}
              className="sm:hidden absolute left-0 overflow-visible pointer-events-none"
              width={16}
              height={Math.max(height, 1)}
              style={{ top: centerTop }}
              aria-hidden="true"
            >
              <path
                d={`M 16 0 L ${r} 0 Q 0 0 0 ${r} L 0 ${height - r} Q 0 ${height} ${r} ${height} L 16 ${height}`}
                fill="none"
                stroke="rgb(var(--fg) / 0.3)"
                strokeWidth={1}
                strokeLinecap="butt"
              />
            </svg>
          );
        })}
        {STEPS.map((s, i) => {
          const isOpen = open === i;
          return (
          <React.Fragment key={s.step}>
            <div className="relative sm:contents pl-4 sm:pl-0">
            <button
              ref={(el) => { cardRefs.current[i] = el; }}
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="text-left rounded-2xl p-6 sm:p-8 sm:flex-1 sm:min-w-0 w-full"
              style={{
                background: isOpen ? "rgb(var(--surface))" : "rgb(var(--surface) / 0.4)",
                transform: isOpen ? "scale(1)" : "scale(0.96)",
                transformOrigin: "center",
                transition: "background 500ms cubic-bezier(0.22,1,0.36,1), transform 500ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <p
                className="text-[clamp(2.2rem,4vw,3.2rem)] font-normal tracking-[-0.04em] leading-none mb-3"
                style={{ color: "rgb(var(--fg))", opacity: isOpen ? 1 : 0.4, transition: "opacity 500ms cubic-bezier(0.22,1,0.36,1)" }}
              >
                {s.step}
              </p>
              <p className="text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))] mb-3" style={{ opacity: 0.6 }}>
                {s.desc}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 550ms cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <div style={{ overflow: "hidden", minHeight: 0 }}>
                <p
                  className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))]"
                  style={{
                    opacity: isOpen ? 0.7 : 0,
                    transform: isOpen ? "translateY(0)" : "translateY(-6px)",
                    transition: "opacity 450ms cubic-bezier(0.22,1,0.36,1), transform 450ms cubic-bezier(0.22,1,0.36,1)",
                    transitionDelay: isOpen ? "80ms" : "0ms",
                  }}
                >
                  {s.detail}
                </p>
                {i === 2 && (
                  <Link
                    href="/aether/buy"
                    onClick={e => e.stopPropagation()}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium tracking-tight hover:opacity-80 transition-opacity"
                    style={{ background: "#1a1a1a", color: "#ededed" }}
                  >
                    Get Aether
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </Link>
                )}
                </div>
              </div>
            </button>
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
    </div>
  );
}
