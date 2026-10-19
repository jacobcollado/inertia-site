"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// The footer's policies, behind one button: it opens a small menu upward, out
// of the button, since the footer sits at the foot of the page. It closes on
// Escape, a click elsewhere, or a pick. Styles are .policies in globals.css.

const POLICIES = [
  { label: "Terms", href: "/policies/terms-of-service" },
  { label: "Privacy", href: "/policies/privacy-policy" },
  { label: "Refunds", href: "/policies/refund-policy" },
];

export function PoliciesMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    rootRef.current?.querySelector<HTMLElement>(".policies__item")?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="policies" data-open={open || undefined}>
      <button
        ref={buttonRef}
        type="button"
        className="policies__button"
        aria-expanded={open}
        aria-controls="policies-menu"
        onClick={() => setOpen((o) => !o)}
      >
        Policies
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M3 7.5 6 4.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div id="policies-menu" className="policies__menu" inert={!open}>
        {POLICIES.map((p) => (
          <Link key={p.href} href={p.href} className="policies__item" onClick={() => setOpen(false)}>
            {p.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
