"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SiInstagram } from "react-icons/si";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";

export const DEMO_CAL_LINK = "https://cal.com/jacob-c-99otvp/15min";
const INSTAGRAM_HANDLE = "by.inertia";
// ig.me opens a DM thread straight away on mobile (app) and desktop (web).
const INSTAGRAM_DM_LINK = `https://ig.me/m/${INSTAGRAM_HANDLE}`;
const EXIT_MS = 180;

const OPTION_CLASS = `group flex w-full items-center gap-3.5 ${ACTION_RADIUS_CLASS} border border-[rgb(var(--line))] bg-[rgb(var(--bg))] px-4 py-3.5 text-left transition-colors hover:border-[rgb(var(--fg)/0.35)] [-webkit-tap-highlight-color:transparent]`;
const OPTION_ICON_CLASS = `flex size-9 shrink-0 items-center justify-center ${ACTION_RADIUS_CLASS} bg-[rgb(var(--fg)/0.06)] text-[rgb(var(--fg))]`;

/* Lets a hesitant visitor pick how to see Aether: a booked call, or a DM for
 * people who'd rather not get on a call. Portaled to body so the sticky,
 * backdrop-filtered header it's opened from can't trap its fixed positioning. */
export function DemoChoiceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const close = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      onClose();
    }, EXIT_MS);
  };

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("lenis:lock"));
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("lenis:unlock"));
      restoreFocusRef.current?.focus?.();
    };
    // close is stable enough for this listener's lifetime; re-binding on every
    // render would restore focus mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center sm:p-6" style={{ height: "100dvh" }}>
      <div
        className="absolute inset-0"
        onClick={close}
        style={{
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          opacity: closing ? 0 : 1,
          transition: `opacity ${EXIT_MS}ms ease`,
          animation: "fade-in 200ms ease both",
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-choice-title"
        tabIndex={-1}
        data-lenis-prevent
        className="relative w-full max-w-[26rem] rounded-2xl bg-[rgb(var(--surface))] p-5 outline-none sm:p-6"
        style={{
          animation: closing ? "none" : "modal-up 320ms cubic-bezier(0.22,1,0.36,1) both",
          opacity: closing ? 0 : 1,
          transform: closing ? "translateY(8px)" : undefined,
          transition: `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease`,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p id="demo-choice-title" className="text-[20px] leading-tight tracking-tight text-[rgb(var(--fg))]">
              How do you want to see it?
            </p>
            <p className="mt-1.5 text-[14px] leading-snug tracking-tight text-[rgb(var(--muted))]">
              We&apos;ll show you Aether on your own store, free. Pick whatever&apos;s easier.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className={`-mr-1 -mt-1 inline-flex size-8 shrink-0 items-center justify-center ${ACTION_RADIUS_CLASS} border border-transparent text-[rgb(var(--muted))] transition-colors hover:border-[rgb(var(--fg)/0.35)] hover:bg-[rgb(var(--bg))] hover:text-[rgb(var(--fg))] [-webkit-tap-highlight-color:transparent]`}
          >
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-3.5" aria-hidden="true">
              <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
              <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
            </svg>
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <a href={DEMO_CAL_LINK} target="_blank" rel="noreferrer" onClick={close} className={OPTION_CLASS}>
            <span className={OPTION_ICON_CLASS} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <rect x="2" y="3" width="12" height="11" rx="1.5" />
                <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] tracking-tight text-[rgb(var(--fg))]">Book a 15-minute call</span>
              <span className="block text-[13px] tracking-tight text-[rgb(var(--muted))]">Watch it on your store, ask anything</span>
            </span>
          </a>
          <a href={INSTAGRAM_DM_LINK} target="_blank" rel="noreferrer" onClick={close} className={OPTION_CLASS}>
            <span className={OPTION_ICON_CLASS} aria-hidden="true">
              <SiInstagram className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] tracking-tight text-[rgb(var(--fg))]">DM us on Instagram</span>
              <span className="block text-[13px] tracking-tight text-[rgb(var(--muted))]">@{INSTAGRAM_HANDLE}, no call needed</span>
            </span>
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
