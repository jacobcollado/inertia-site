"use client";

import { useState } from "react";

export function DemoButton({ href, password }: { href: string; password: string }) {
  const [state, setState] = useState<"idle" | "copied">("idle");

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      await navigator.clipboard.writeText(password);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      // clipboard failed, just navigate normally
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[rgb(var(--line))] text-[rgb(var(--fg))] px-4 py-2 sm:px-5 sm:py-2.5 hover:border-[rgb(var(--muted))] transition-colors text-[13px] tracking-tight"
    >
      {state === "copied" ? (
        <>
          <span className="text-[rgb(var(--muted))]">password copied</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[rgb(var(--muted))]" aria-hidden="true">
            <polyline points="2 8 6 12 14 4" />
          </svg>
        </>
      ) : (
        <>
          View demo
          <span aria-hidden="true" className="text-[rgb(var(--muted))]">↗</span>
        </>
      )}
    </a>
  );
}
