"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";
import { DemoFrame, DemoToggle, LiveStoreButton, PasswordNote, hostOf, type DemoMode } from "./demo-player";

/* The demo recording in a dialog, opened from the "View demo" buttons. The
 * videos are mounted with the dialog, so nothing downloads for visitors who
 * never open it. */

// Mobile slides the sheet a full screen height, so it gets a little longer.
const EXIT_MS = 220;
const EXIT_EASE = "cubic-bezier(0.4, 0, 1, 1)";

export function DemoVideoModal({
  open,
  onClose,
  href,
  password,
}: {
  open: boolean;
  onClose: () => void;
  href: string;
  password: string;
}) {
  const [closing, setClosing] = useState(false);
  const [mode, setMode] = useState<DemoMode>("desktop");
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
    // Phones see the phone recording first, like the "Make it yours" section.
    setMode(window.matchMedia("(max-width: 639px)").matches ? "mobile" : "desktop");
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-3 sm:items-center sm:p-6" style={{ height: "100dvh" }}>
      <div
        className="absolute inset-0"
        onClick={close}
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          animation: closing ? `overlay-out ${EXIT_MS}ms ease both` : "overlay-in 200ms ease both",
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-video-title"
        tabIndex={-1}
        data-lenis-prevent
        className="relative flex max-h-[92dvh] w-full max-w-[64rem] flex-col overflow-y-auto rounded-2xl bg-[rgb(var(--surface))] p-4 outline-none sm:p-6"
        style={{
          animation: closing
            ? `modal-down ${EXIT_MS}ms ${EXIT_EASE} both`
            : "modal-up 320ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <p id="demo-video-title" className="text-[18px] leading-tight tracking-tight text-[rgb(var(--fg))] sm:text-[20px]">
            Aether demo
          </p>
          <div className="flex items-center gap-2">
            <DemoToggle mode={mode} onChange={setMode} tone="bg" />
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className={`-mr-1 inline-flex size-8 shrink-0 items-center justify-center ${ACTION_RADIUS_CLASS} border border-transparent text-[rgb(var(--muted))] transition-colors hover:border-[rgb(var(--fg)/0.35)] hover:bg-[rgb(var(--bg))] hover:text-[rgb(var(--fg))] [-webkit-tap-highlight-color:transparent]`}
            >
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-3.5" aria-hidden="true">
                <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
                <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-4 sm:mt-5">
          <DemoFrame mode={mode} host={hostOf(href)} />
        </div>

        <div className="mt-4 flex flex-col items-center gap-2 sm:mt-5 sm:flex-row sm:justify-between">
          <PasswordNote password={password} className="text-center sm:text-left" />
          <LiveStoreButton href={href} password={password} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
