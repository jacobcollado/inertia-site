"use client";

import { useEffect, useState } from "react";

// The close every page ends on (styles are .index-close in globals.css).

const CAL_LINK = "https://cal.com/jacob-c-99otvp/15min";
const EMAIL = "hello@byinertia.com";

// One line, and two ways to answer it. Reach out (books a call),
// or take the email: clicking it copies the address, and its label flips up
// to say so, the check drawing itself in.
export function Close() {
  const [copied, setCopied] = useState(false);
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
      <h2 className="index-close__line">Tell us what you&apos;re building.</h2>
      <div className="index-close__actions">
        <a href={CAL_LINK} target="_blank" rel="noreferrer" className="index-close__call">
          <MessageIcon />
          Reach out
        </a>
        <button type="button" onClick={copy} className="index-close__email" aria-label={`Copy ${EMAIL}`}>
          <span className="index-close__flip" data-copied={copied || undefined}>
            <span>{EMAIL}</span>
            <span aria-hidden className="index-close__done">
              <CheckIcon />
              Copied
            </span>
          </span>
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? "Email address copied" : ""}
        </span>
      </div>
    </section>
  );
}

function MessageIcon() {
  return (
    <svg className="index-close__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.25 2.75h9.5a2 2 0 0 1 2 2v5.5a2 2 0 0 1-2 2H8.5l-3.25 2.5v-2.5h-2a2 2 0 0 1-2-2v-5.5a2 2 0 0 1 2-2z" />
    </svg>
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
