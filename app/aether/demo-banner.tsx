"use client";

import { useEffect, useState } from "react";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";
import { DemoChoiceModal } from "./demo-choice-modal";

const STORAGE_KEY = "aether-demo-banner-dismissed";

type AetherDemoBannerProps = {
  /** Renders in the site header above the logo row (sticky with header). */
  embedded?: boolean;
};

export function AetherDemoBanner({ embedded = false }: AetherDemoBannerProps) {
  const [visible, setVisible] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  // Keep the modal mounted even if the banner is dismissed while it's open.
  const modal = <DemoChoiceModal open={choiceOpen} onClose={() => setChoiceOpen(false)} />;

  if (!visible) return modal;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (embedded) {
    return (
      <>
      {modal}
      <div className="site-header__promo" role="region" aria-label="Free demo offer">
        <div className="site-header__promo-inner">
          <p className="site-header__promo-copy">
            Still deciding? See Aether on your own store first, over DM or a quick call.
          </p>
          <div className="site-header__promo-actions">
            <button
              type="button"
              onClick={() => setChoiceOpen(true)}
              aria-haspopup="dialog"
              className={`inline-flex items-center justify-center ${ACTION_RADIUS_CLASS} border border-[rgb(var(--line))] bg-[rgb(var(--bg))] h-7 px-2.5 text-[13px] font-medium tracking-tight leading-none text-[rgb(var(--fg))] whitespace-nowrap transition-colors hover:border-[rgb(var(--fg)/0.35)] [-webkit-tap-highlight-color:transparent] sm:px-3 sm:text-[14px]`}
            >
              See a quick demo
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
