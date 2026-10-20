"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { MovementPlate } from "@/components/movement-plate";
import { useReveal, Words } from "@/components/reveal";
import { PlaneIcon, ReachOut } from "@/components/reach-out";

// The close every page ends on (styles are .index-close in globals.css).

const EMAIL = "hello@byinertia.com";

// The page ends where it began: the opening plate's movement, its parts
// coming down and set into one another as the close comes into view. Then
// one line, its last word drawn like the company you're becoming, and two
// ways to answer it. Reach out (a message or a call, see reach-out.tsx), or
// take the email: clicking it copies the address, and its label flips up to
// say so, the check drawing itself in.
export function Close() {
  const [copied, setCopied] = useState(false);
  const line = useReveal<HTMLHeadingElement>();
  const actions = useReveal<HTMLDivElement>();
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <section className="index-col index-close" data-dock-hide>
      <div className="index-close__art">
        <MovementPlate assemble />
      </div>
      <h2 ref={line} className="index-close__line">
        <Words text="Tell us what you’re" />{" "}
        <span className="index-sentence__drawn">
          <Words text="building." from={4} />
        </span>
      </h2>
      <div ref={actions} className="index-close__actions" style={{ "--i": 1 } as CSSProperties}>
        <span className="reveal-word">
          <ReachOut className="index-close__call">
            <PlaneIcon className="index-close__icon" />
            Reach out
          </ReachOut>
        </span>
        <span className="reveal-word" style={{ "--w": 1 } as CSSProperties}>
          <button type="button" onClick={copy} className="index-close__email" aria-label={`Copy ${EMAIL}`}>
            <span className="index-close__flip" data-copied={copied || undefined}>
              <span>{EMAIL}</span>
              <span aria-hidden className="index-close__done">
                <CheckIcon />
                Copied
              </span>
            </span>
          </button>
        </span>
        <span className="sr-only" aria-live="polite">
          {copied ? "Email address copied" : ""}
        </span>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg className="index-close__icon index-close__check" viewBox="0 0 16 16" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="8" cy="8" r="7.25" stroke="rgb(var(--ink-rgb) / 0.2)" strokeWidth="1" />
      <path d="M5.25 8.25l1.9 1.9 3.6-3.9" stroke="currentColor" strokeWidth="1.25" pathLength={1} />
    </svg>
  );
}
