"use client";

import { useEffect, useState } from "react";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";
import { DemoChoiceModal } from "./demo-choice-modal";
import { AETHER_LIQUID_EASE, AETHER_LIQUID_MS } from "./motion";

const STORAGE_KEY = "aether-demo-banner-dismissed";

// Held back so it reaches people who stuck around long enough to be
// interested, not everyone who bounces in the first few seconds.
const SHOW_DELAY_MS = 5000;
// Strong ease-out: the row is already moving fast when it appears, then
// slows into place, so it reads as arriving, not being pushed open.
const REVEAL_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

type AetherDemoBannerProps = {
  /** Renders in the site header above the logo row (sticky with header). */
  embedded?: boolean;
};

export function AetherDemoBanner({ embedded = false }: AetherDemoBannerProps) {
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {}
    if (dismissed) return;
    setVisible(true);
    const t = setTimeout(() => setShown(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // Keep the modal mounted even if the banner is dismissed while it's open.
  const modal = <DemoChoiceModal open={choiceOpen} onClose={() => setChoiceOpen(false)} />;

  if (!visible) return modal;

  // Content drifts down into place and sharpens, trailing the row's height.
  const settle = (delay: number): React.CSSProperties => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : "translateY(-6px)",
    filter: shown ? "blur(0px)" : "blur(4px)",
    transition: `opacity ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE} ${delay}ms, transform ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE} ${delay}ms, filter ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE} ${delay}ms`,
  });

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setVisible(false);
  };

  if (embedded) {
    return (
      <>
      {modal}
      {/* The row opens first, easing its height from 0 so the header grows
          instead of jumping. Its surface fades in with it, then the copy and
          the actions settle in one after the other. */}
      <div
        className="grid motion-reduce:!transition-none"
        inert={!shown}
        style={{
          gridTemplateRows: shown ? "1fr" : "0fr",
          opacity: shown ? 1 : 0,
          transition: `grid-template-rows 520ms ${REVEAL_EASE}, opacity 320ms ease`,
        }}
      >
      <div className="min-h-0 overflow-hidden">
      <div className="site-header__promo" role="region" aria-label="Free demo offer">
        <div className="site-header__promo-inner">
          <p className="site-header__promo-copy motion-reduce:!transition-none" style={settle(160)}>
            <span className="text-[rgb(var(--fg))]">See Aether on your own store, free.</span>{" "}
            We&apos;ll show you on a 15-minute call or over Instagram DM.
          </p>
          <div className="site-header__promo-actions motion-reduce:!transition-none" style={settle(240)}>
            <button
              type="button"
              onClick={() => setChoiceOpen(true)}
              aria-haspopup="dialog"
              className={`inline-flex items-center justify-center ${ACTION_RADIUS_CLASS} border border-[rgb(var(--line))] bg-[rgb(var(--bg))] h-7 px-2.5 text-[13px] font-medium tracking-tight leading-none text-[rgb(var(--fg))] whitespace-nowrap transition-colors hover:border-[rgb(var(--fg)/0.35)] [-webkit-tap-highlight-color:transparent] sm:px-3 sm:text-[14px]`}
            >
              Get a free demo
            </button>
            <button
              type="button"
              onClick={dismiss}
              className={`inline-flex size-7 shrink-0 items-center justify-center ${ACTION_RADIUS_CLASS} border border-transparent text-[rgb(var(--muted))] transition-colors hover:border-[rgb(var(--fg)/0.35)] hover:bg-[rgb(var(--bg))] hover:text-[rgb(var(--fg))] [-webkit-tap-highlight-color:transparent]`}
              aria-label="Dismiss free demo banner"
            >
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-3.5" aria-hidden="true">
                <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
                <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      </div>
      </div>
      </>
    );
  }

  return (
    <>
    {modal}
    <div
      className="rise rise--liquid mb-5 sm:mb-7 w-full rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface)/0.55)] px-4 py-3.5 sm:px-5 sm:py-4"
      role="region"
      aria-label="Free demo offer"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <p className="pr-6 text-[13px] leading-snug tracking-tight text-[rgb(var(--muted))] sm:pr-0 sm:text-[14px] sm:leading-relaxed">
          <span className="text-[rgb(var(--fg))]">Still deciding?</span> See Aether on your own store before you buy.
          We&apos;ll walk you through it over DM or a quick call.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setChoiceOpen(true)}
            aria-haspopup="dialog"
            className={`inline-flex items-center justify-center ${ACTION_RADIUS_CLASS} h-8 px-4 text-[14px] font-medium tracking-tight leading-none text-[rgb(var(--fg))] border border-[rgb(var(--line))] transition-colors hover:border-[rgb(var(--fg)/0.35)] [-webkit-tap-highlight-color:transparent]`}
          >
            See a quick demo
          </button>
          <button
            type="button"
            onClick={dismiss}
            className={`inline-flex size-8 shrink-0 items-center justify-center ${ACTION_RADIUS_CLASS} border border-transparent text-[rgb(var(--muted))] transition-colors hover:border-[rgb(var(--fg)/0.35)] hover:text-[rgb(var(--fg))] [-webkit-tap-highlight-color:transparent]`}
            aria-label="Dismiss free demo banner"
          >
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-3.5" aria-hidden="true">
              <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
              <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
