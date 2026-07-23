"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePostHog } from "./posthog-provider";

// Toggle is a pure label+checkbox with CSS-only transitions on the thumb/track.
// No JS runs on interaction beyond the state change itself.
function Toggle({ id, checked, onChange, disabled }: { id: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label htmlFor={id} className="cb-toggle" data-disabled={disabled || undefined}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="cb-toggle-input"
      />
      <span className="cb-toggle-track" aria-hidden>
        <span className="cb-toggle-thumb" />
      </span>
    </label>
  );
}

export function CookieBanner() {
  const setConsent = usePostHog();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    try {
      if (!localStorage.getItem("cookie_consent")) {
        const t = setTimeout(() => setVisible(true), 2500);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const applyConsent = (analyticsAllowed: boolean) => {
    try { localStorage.setItem("cookie_consent", analyticsAllowed ? "accepted" : "declined"); } catch {}
    setConsent(analyticsAllowed);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cb-root" role="dialog" aria-label="Cookie preferences">
      <div className="cb-card">
        {/* Default row */}
        <div className="px-5 py-4 sm:px-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <p className="text-[13px] sm:text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))] flex-1">
            We use cookies to understand how people use this site and to make it better. Nothing is sold or shared.{" "}
            <Link
              href="/policies/privacy-policy"
              className="underline underline-offset-2 text-[rgb(var(--fg))] decoration-[rgb(var(--line))] hover:decoration-[rgb(var(--fg))] transition-colors"
            >
              Privacy policy
            </Link>
          </p>
          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="cb-btn cb-btn-secondary"
              aria-expanded={expanded}
            >
              {expanded ? "Close" : "Customize"}
            </button>
            <button type="button" onClick={() => applyConsent(true)} className="cb-btn cb-btn-primary">
              Accept all
            </button>
          </div>
        </div>

        {/* Expanded preferences — conditionally mounted, no per-frame layout
            animation. Tapping Customize reveals it in place. */}
        {expanded && (
          <div className="border-t border-[rgb(var(--line))] px-5 py-4 sm:px-7 flex flex-col gap-3">
            {/* Essential */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--fg))]">Essential</p>
                <p className="text-[12px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))] mt-0.5">
                  Sign-in, preferences, site functionality. Always on.
                </p>
              </div>
              <Toggle id="essential-toggle" checked={true} onChange={() => {}} disabled />
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--fg))]">Analytics</p>
                <p className="text-[12px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))] mt-0.5">
                  Anonymous usage data to help us improve the site.
                </p>
              </div>
              <Toggle id="analytics-toggle" checked={analytics} onChange={setAnalytics} />
            </div>

            {/* Confirm row */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 pt-1">
              <button type="button" onClick={() => applyConsent(false)} className="cb-btn cb-btn-secondary">
                Decline all
              </button>
              <button type="button" onClick={() => applyConsent(analytics)} className="cb-btn cb-btn-primary">
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
