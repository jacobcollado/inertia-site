"use client";

import { useState, useRef } from "react";

export function TooltipPill({
  children,
  tip,
}: {
  children: React.ReactNode;
  tip: string;
}) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(true);
  };
  const hide = () => {
    timer.current = setTimeout(() => setVisible(false), 120);
  };

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 bottom-[calc(100%+10px)] z-50 w-[176px] -translate-x-1/2"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateX(-50%) translateY(0px)"
            : "translateX(-50%) translateY(5px)",
          transition:
            "opacity 180ms cubic-bezier(0.22,1,0.36,1), transform 200ms cubic-bezier(0.22,1,0.36,1)",
          willChange: "opacity, transform",
        }}
      >
        <span className="relative block w-full rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--bg))] px-3 py-2 text-[11.5px] tracking-tight text-[rgb(var(--muted))] leading-snug text-center">
          {tip}
          {/* Tail — covers the border at the bottom edge */}
          <span className="absolute left-1/2 -translate-x-1/2 top-[calc(100%-1px)]">
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" className="block">
              <path d="M0 0 L7 7 L14 0 Z" fill="rgb(var(--bg))" />
              <path d="M0 0.75 L7 7.5 L14 0.75" stroke="rgb(var(--line))" strokeWidth="1" fill="none" />
            </svg>
          </span>
        </span>
      </span>
    </span>
  );
}
