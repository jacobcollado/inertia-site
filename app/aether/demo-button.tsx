"use client";

import { useState } from "react";

export function DemoButton({ href, password }: { href: string; password: string }) {
  const [state, setState] = useState<"idle" | "copying" | "copied">("idle");
  const [hovered, setHovered] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setState("copying");
    try {
      await navigator.clipboard.writeText(password);
    } catch {}
    setState("copied");
    setTimeout(() => {
      window.open(href, "_blank", "noreferrer");
      setState("idle");
    }, 1000);
  };

  return (
    <div className="relative w-full">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[rgb(var(--line))] text-[rgb(var(--fg))] px-5 py-2 hover:border-[rgb(var(--fg))/0.4] transition-colors text-[13px] font-medium tracking-tight"
      >
        {state === "copied" ? (
          <>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[rgb(var(--muted))]" aria-hidden="true">
              <polyline points="2 8 6 12 14 4" />
            </svg>
            <span className="text-[rgb(var(--muted))]">Password copied</span>
          </>
        ) : (
          <>
            View demo
            <span aria-hidden="true" className="text-[rgb(var(--muted))]">↗</span>
          </>
        )}
      </a>

      {/* Hover hint */}
      <div
        className="pointer-events-none absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-lg px-3 py-1.5"
        style={{
          background: "rgb(var(--surface-elevated) / 0.95)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgb(var(--line) / 0.5)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          opacity: hovered && state === "idle" ? 1 : 0,
          transform: hovered && state === "idle" ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 160ms ease, transform 160ms ease",
        }}
      >
        <p className="text-[11.5px] tracking-tight text-[rgb(var(--muted))]">
          Store password <span className="font-medium text-[rgb(var(--fg))]">{password}</span> will be copied
        </p>
        {/* caret */}
        <div
          className="absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-2 h-2 border-r border-b border-[rgb(var(--line) / 0.5)]"
          style={{ background: "rgb(var(--surface-elevated) / 0.95)", transform: "translateX(-50%) rotate(45deg)" }}
        />
      </div>
    </div>
  );
}
