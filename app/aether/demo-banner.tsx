"use client";

import { useEffect, useState } from "react";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";
import { DemoChoiceModal } from "./demo-choice-modal";

const STORAGE_KEY = "aether-demo-banner-dismissed";

// Held back so it reaches people who stuck around long enough to be
// interested, not everyone who bounces in the first few seconds.
const SHOW_DELAY_MS = 5000;
// The cookie banner owns the bottom of the screen until it's answered, so
// the popup checks back on this interval rather than stacking on top of it.
const COOKIE_RECHECK_MS = 2000;
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const EXIT_MS = 220;

/* The free demo offer as a small popup in the bottom corner (full width on
 * phones), instead of a row that sat in the header for the whole visit. It
 * doesn't block the page, and once closed it stays closed. */
export function AetherDemoBanner() {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {}
    if (dismissed) return;

    let timer = 0;
    const tryShow = () => {
      if (document.querySelector(".cb-root")) {
        timer = window.setTimeout(tryShow, COOKIE_RECHECK_MS);
        return;
      }
      setMounted(true);
      // A frame after mounting, so the entrance has a resting state to
      // animate from.
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    };
    timer = window.setTimeout(tryShow, SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setShown(false);
    window.setTimeout(() => setMounted(false), EXIT_MS);
  };

  // Kept mounted even after the popup closes, so a demo choice opened from
  // it isn't cut off.
  const modal = <DemoChoiceModal open={choiceOpen} onClose={() => setChoiceOpen(false)} />;

  if (!mounted) return modal;

  return (
    <>
      {modal}
      <div
        role="region"
        aria-label="Free demo offer"
        className="fixed inset-x-3 bottom-3 z-[90] overflow-hidden rounded-[6px] bg-[rgb(var(--surface)/0.7)] backdrop-blur-xl backdrop-saturate-150 shadow-[0_0_0_1px_rgb(var(--line)),0_16px_40px_-12px_rgb(0_0_0/0.3)] motion-reduce:!transition-none sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[22rem]"
        // Steps aside while the demo dialog it opened is up, so the two never
        // stack.
        inert={choiceOpen}
        style={{
          opacity: shown && !choiceOpen ? 1 : 0,
          transform: shown && !choiceOpen ? "translateY(0)" : "translateY(12px)",
          transition: shown && !choiceOpen
            ? `opacity 320ms ease, transform 520ms ${EASE}`
            : `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease`,
        }}
      >
        <button
          type="button"
          onClick={dismiss}
          className={`absolute right-2 top-2 z-10 inline-flex size-7 items-center justify-center ${ACTION_RADIUS_CLASS} text-[rgb(var(--muted))] transition-colors hover:bg-[rgb(var(--bg))] hover:text-[rgb(var(--fg))] [-webkit-tap-highlight-color:transparent]`}
          aria-label="Dismiss free demo offer"
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-[50%]" aria-hidden="true">
            <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
            <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
          </svg>
        </button>
        <div className="p-4">
          <p className="pr-8 text-[15px] tracking-tight leading-snug text-[rgb(var(--fg))]">
            See Aether on your own store, free.
          </p>
          <p className="mt-1 text-[14px] tracking-tight leading-snug text-[rgb(var(--muted))] [text-wrap:pretty]">
            We&apos;ll show you on a 15-minute call or over Instagram DM.
          </p>
          <button
            type="button"
            onClick={() => setChoiceOpen(true)}
            aria-haspopup="dialog"
            className={`mt-3 inline-flex h-9 w-full items-center justify-center ${ACTION_RADIUS_CLASS} bg-black px-4 text-[14px] font-medium tracking-tight leading-none text-[#ededed] transition-opacity hover:opacity-80 [-webkit-tap-highlight-color:transparent]`}
          >
            Get a free demo
          </button>
        </div>
      </div>
    </>
  );
}
