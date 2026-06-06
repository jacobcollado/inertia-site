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
    tooltip: "Download the .zip, upload it in Shopify Admin, and publish. All 41 sections are ready to drag onto any page. No developer needed.",
  },
  {
    step: "Sell",
    desc: "Built to convert from day one",
    tooltip: "Every layout decision — trust badges, sticky cart, product gallery — was tested across live stores before shipping. It works out of the box.",
  },
];

const TOOLTIP_W = 240;

function StepTooltip({ s }: { s: typeof STEPS[number] }) {
  const [hovered, setHovered] = useState(false);
  const [offset, setOffset] = useState(0);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipLeft = rect.left + rect.width / 2 - TOOLTIP_W / 2;
      const tooltipRight = tooltipLeft + TOOLTIP_W;
      const vw = window.innerWidth;
      const pad = 16;
      if (tooltipLeft < pad) setOffset(pad - tooltipLeft);
      else if (tooltipRight > vw - pad) setOffset((vw - pad) - tooltipRight);
      else setOffset(0);
    }
    setHovered(true);
  };

  const caretOffset = -offset;

  return (
    <div
      ref={triggerRef}
      className="relative flex flex-col items-center"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Step word + info badge */}
      <div className="flex items-start gap-1.5">
        <span
          className="text-[clamp(2.4rem,5vw,3.5rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] cursor-default select-none transition-opacity duration-300"
          style={{ opacity: hovered ? 0.7 : 1 }}
        >
          {s.step}
        </span>
        <span
          className="mt-1 flex items-center justify-center rounded-full text-[10px] font-medium tracking-tight transition-all duration-300"
          style={{
            width: 16,
            height: 16,
            background: hovered ? "rgb(var(--fg))" : "rgb(var(--fg) / 0.1)",
            color: hovered ? "rgb(var(--bg))" : "rgb(var(--muted))",
          }}
          aria-hidden="true"
        >
          ?
        </span>
      </div>

      {/* Tooltip — below the step word */}
      <div
        className="pointer-events-none absolute top-full mt-3 z-20 text-left rounded-2xl"
        style={{
          width: TOOLTIP_W,
          left: `calc(50% - ${TOOLTIP_W / 2}px + ${offset}px)`,
          background: "rgb(var(--surface-elevated) / 0.9)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgb(var(--line) / 0.6)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
          padding: "14px 16px",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.98)",
          transition: "opacity 200ms cubic-bezier(0.22,1,0.36,1), transform 200ms cubic-bezier(0.22,1,0.36,1)",
          transformOrigin: "top center",
        }}
      >
        {/* Caret pointing up */}
        <div
          className="absolute -top-[5px] w-2.5 h-2.5 border-l border-t border-[rgb(var(--line) / 0.6)]"
          style={{
            left: `calc(50% + ${caretOffset}px)`,
            transform: "translateX(-50%) rotate(45deg)",
            background: "rgb(var(--surface-elevated) / 0.9)",
          }}
        />
        <p className="text-[12.5px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
          {s.tooltip}
        </p>
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
            <StepTooltip s={s} />
            <span className="text-[14px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
              {s.desc}
            </span>
            {i === 2 && (
              <Link
                href="/aether/buy"
                className="mt-2 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-80 transition-opacity"
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
