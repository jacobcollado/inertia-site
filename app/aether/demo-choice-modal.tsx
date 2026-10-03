"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";
import { ILLUSTRATION_BAR } from "@/components/illustrated-card";

export const DEMO_CAL_LINK = "https://cal.com/jacob-c-99otvp/15min";
const INSTAGRAM_HANDLE = "by.inertia";
// ig.me opens a DM thread straight away on mobile (app) and desktop (web).
const INSTAGRAM_DM_LINK = `https://ig.me/m/${INSTAGRAM_HANDLE}`;
// Mobile slides the sheet a full screen height, so it gets a little longer.
const EXIT_MS = 220;
const EXIT_EASE = "cubic-bezier(0.4, 0, 1, 1)";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const PANEL = "rounded-[6px] bg-[rgb(var(--bg))] shadow-[0_0_0_1px_rgb(var(--line)),0_10px_24px_-12px_rgb(0_0_0/0.25)]";

/* Each way in gets a small drawn cover in the illustrated-card style (see
 * docs/design-system.md), so the two choices read as things, not links. */

// A booking sheet: a heading bar and three time slots, the middle one
// picked. The picked slot lifts on hover.
function CallCover() {
  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className={`${PANEL} w-full max-w-[9.5rem] p-2`}>
        <span className={`${ILLUSTRATION_BAR} w-[55%] !bg-[rgb(var(--fg)/0.22)]`} />
        <div className="mt-2 flex flex-col gap-1">
          <span className="flex h-4 items-center rounded-[6px] px-2 shadow-[0_0_0_1px_rgb(var(--line))]">
            <span className={`${ILLUSTRATION_BAR} w-[40%]`} />
          </span>
          <span
            className="flex h-4 items-center rounded-[6px] bg-[rgb(var(--fg))] px-2 motion-safe:group-hover:-translate-y-0.5"
            style={{ transition: `transform 400ms ${EASE}` }}
          >
            <span className="block h-[5px] w-[46%] rounded-full bg-[rgb(var(--bg)/0.6)]" />
          </span>
          <span className="flex h-4 items-center rounded-[6px] px-2 shadow-[0_0_0_1px_rgb(var(--line))]">
            <span className={`${ILLUSTRATION_BAR} w-[34%]`} />
          </span>
        </div>
      </div>
    </div>
  );
}

// A short DM thread: their message, then ours. Ours slides in a touch on
// hover, like a reply arriving.
function DmCover() {
  return (
    <div className="flex h-full flex-col justify-center gap-1.5 px-5">
      <span className={`${PANEL} w-[72%] px-2.5 py-2`}>
        <span className={`${ILLUSTRATION_BAR} w-[80%]`} />
        <span className={`${ILLUSTRATION_BAR} mt-1.5 w-[55%]`} />
      </span>
      <span
        className="ml-auto w-[64%] rounded-[6px] bg-[rgb(var(--fg))] px-2.5 py-2 motion-safe:group-hover:-translate-x-1"
        style={{ transition: `transform 400ms ${EASE}` }}
      >
        <span className="block h-[5px] w-[85%] rounded-full bg-[rgb(var(--bg)/0.6)]" />
        <span className="mt-1.5 block h-[5px] w-[50%] rounded-full bg-[rgb(var(--bg)/0.6)]" />
      </span>
    </div>
  );
}

function Option({
  href,
  onClick,
  cover,
  title,
  sub,
}: {
  href: string;
  onClick: () => void;
  cover: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-[6px] bg-[rgb(var(--bg)/0.6)] shadow-[0_0_0_1px_rgb(var(--line))] transition-shadow hover:shadow-[0_0_0_1px_rgb(var(--fg)/0.3)] [-webkit-tap-highlight-color:transparent]"
    >
      <div className="h-28 overflow-hidden bg-[rgb(var(--surface)/0.6)]" aria-hidden="true">
        {cover}
      </div>
      <div className="flex flex-1 flex-col border-t border-[rgb(var(--line))] px-3.5 pt-3 pb-3.5">
        <span className="flex items-center justify-between gap-2 text-[15px] tracking-tight leading-snug text-[rgb(var(--fg))]">
          {title}
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-[0.8em] shrink-0 text-[rgb(var(--muted))] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">
            <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" />
          </svg>
        </span>
        <span className="mt-0.5 text-[13px] tracking-tight leading-snug text-[rgb(var(--muted))] [text-wrap:pretty]">{sub}</span>
      </div>
    </a>
  );
}
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
    <div className="fixed inset-0 z-[95] flex items-end justify-center p-4 sm:items-center sm:p-6" style={{ height: "100dvh" }}>
      <div
        className="absolute inset-0"
        onClick={close}
        style={{
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          animation: closing
            ? `overlay-out ${EXIT_MS}ms ease both`
            : "overlay-in 200ms ease both",
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-choice-title"
        tabIndex={-1}
        data-lenis-prevent
        className="relative w-full max-w-[30rem] rounded-[6px] bg-[rgb(var(--surface))] p-5 outline-none sm:p-6"
        style={{
          animation: closing
            ? `modal-down ${EXIT_MS}ms ${EXIT_EASE} both`
            : "modal-up 320ms cubic-bezier(0.22,1,0.36,1) both",
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
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-[45%]" aria-hidden="true">
              <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
              <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
            </svg>
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Option
            href={DEMO_CAL_LINK}
            onClick={close}
            cover={<CallCover />}
            title="Book a call"
            sub="15 minutes, on your store. Ask anything."
          />
          <Option
            href={INSTAGRAM_DM_LINK}
            onClick={close}
            cover={<DmCover />}
            title="DM on Instagram"
            sub={`@${INSTAGRAM_HANDLE}, no call needed.`}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
