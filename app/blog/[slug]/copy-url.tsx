"use client";

import { useEffect, useRef, useState } from "react";

export function CopyURL() {
  const [copied, setCopied] = useState(false);
  // Separate from `copied` so the press reads immediately on click rather than
  // waiting on the clipboard promise to resolve.
  const [pressed, setPressed] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const copy = () => {
    setPressed(true);
    timers.current.push(setTimeout(() => setPressed(false), 130));
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      timers.current.push(setTimeout(() => setCopied(false), 1800));
    });
  };

  // Icon only, so the label moves to aria-label and the copied state is
  // carried by swapping the glyph to a check.
  return (
    <button
      onClick={copy}
      aria-label={copied ? "Link copied" : "Copy link"}
      title={copied ? "Copied" : "Copy link"}
      className="inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-sky-500 hover:text-sky-400 transition-colors"
      style={{
        background: "rgb(var(--fg) / 0.06)",
        border: "1px solid rgb(var(--line))",
        // In on press, back out on release — a spring-ish ease so the return
        // overshoots very slightly instead of stopping dead.
        transform: pressed ? "scale(0.88)" : "scale(1)",
        transition: pressed
          ? "transform 110ms cubic-bezier(0.4, 0, 1, 1)"
          : "transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {copied ? (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
          <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
          <path d="M6.5 9.5a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-1 1" />
          <path d="M9.5 6.5a2.5 2.5 0 0 0-3.5 0l-2 2a2.5 2.5 0 0 0 3.5 3.5l1-1" />
        </svg>
      )}
    </button>
  );
}
