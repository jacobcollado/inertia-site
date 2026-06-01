"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const STEPS = [
  {
    step: "Buy",
    desc: "One-time or annual license",
    tooltip: "From $85. Pay once for lifetime, or $85/yr for annual. One license covers one store. No hidden fees, no per-month charges.",
  },
  {
    step: "Install",
    desc: "Live in under an hour",
    tooltip: "Download the .zip, upload it in Shopify Admin, and publish. All 35 sections are ready to drag onto any page. No developer needed.",
  },
  {
    step: "Sell",
    desc: "Built to convert from day one",
    tooltip: "Every layout decision — trust badges, sticky cart, product gallery — was tested across 11 live stores before shipping. It works out of the box.",
  },
];

const TOOLTIP_W = 224; // w-56 = 14rem = 224px

function StepTooltip({ s, i }: { s: typeof STEPS[number]; i: number }) {
  const [hovered, setHovered] = useState(false);
  const [offset, setOffset] = useState(0); // px shift from center
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipLeft = rect.left + rect.width / 2 - TOOLTIP_W / 2;
      const tooltipRight = tooltipLeft + TOOLTIP_W;
      const vw = window.innerWidth;
      const pad = 12;
      if (tooltipLeft < pad) {
        setOffset(pad - tooltipLeft);
      } else if (tooltipRight > vw - pad) {
        setOffset((vw - pad) - tooltipRight);
      } else {
        setOffset(0);
      }
    }
    setHovered(true);
  };

  // caret stays centered on the trigger regardless of tooltip shift
  const caretOffset = -offset;

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="text-[clamp(2.4rem,5vw,3.5rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] cursor-default select-none transition-opacity duration-200"
        style={{ opacity: hovered ? 0.6 : 1 }}
      >
        {s.step}
      </span>

      {/* indicator */}
      <span className="flex items-center justify-center gap-1 mt-1.5">
        <span
          className="block h-px rounded-full transition-all duration-300"
          style={{ width: hovered ? 20 : 6, background: "rgb(var(--fg))", opacity: hovered ? 0.5 : 0.2 }}
        />
        <span
          className="block w-1 h-1 rounded-full transition-all duration-300"
          style={{ background: "rgb(var(--fg))", opacity: hovered ? 0.9 : 0.25, transform: hovered ? "scale(1.2)" : "scale(1)" }}
        />
        <span
          className="block h-px rounded-full transition-all duration-300"
          style={{ width: hovered ? 20 : 6, background: "rgb(var(--fg))", opacity: hovered ? 0.5 : 0.2 }}
        />
      </span>

      {/* tooltip */}
      <div
        className="pointer-events-none absolute bottom-full mb-3 z-20 text-left rounded-xl border border-[rgb(var(--line))] px-3.5 py-3"
        style={{
          width: TOOLTIP_W,
          left: `calc(50% - ${TOOLTIP_W / 2}px + ${offset}px)`,
          background: "rgb(var(--bg))",
          boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 160ms cubic-bezier(0.22,1,0.36,1), transform 160ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <p className="text-[12.5px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
          {s.tooltip}
        </p>
        {/* caret — stays over trigger */}
        <div
          className="absolute -bottom-[5px] w-2.5 h-2.5 border-r border-b border-[rgb(var(--line))] bg-[rgb(var(--bg))]"
          style={{
            left: `calc(50% + ${caretOffset}px)`,
            transform: "translateX(-50%) rotate(45deg)",
          }}
        />
      </div>
    </div>
  );
}

export function ProcessSteps() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 px-3 py-14 sm:py-20 rise">
      {STEPS.map((s, i) => (
        <div key={s.step} className="contents">
          <div className="flex flex-col items-center gap-3 text-center">
            <StepTooltip s={s} i={i} />
            <span className="text-[14px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
              {s.desc}
            </span>
            {i === 2 && (
              <Link
                href="/aether/buy"
                className="mt-2 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity"
              >
                Get Aether
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            )}
          </div>
          {i < 2 && (
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:mx-10">
              <div className="w-px sm:w-12 h-12 sm:h-px bg-[rgb(var(--line))]" />
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[rgb(var(--line))] shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[rgb(var(--muted))] rotate-90 sm:rotate-0">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
              <div className="w-px sm:w-12 h-12 sm:h-px bg-[rgb(var(--line))]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
