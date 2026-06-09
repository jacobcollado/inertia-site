"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "./theme-provider";
import posthog from "posthog-js";

function isEvening(): boolean {
  const h = new Date().getHours();
  return h >= 18 || h < 6;
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const id = "analytics-toggle";
  return (
    <label
      htmlFor={id}
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
      />
      <span
        style={{
          display: "inline-flex",
          width: 32,
          height: 18,
          borderRadius: 9,
          background: checked ? "rgb(var(--fg))" : "rgb(var(--line))",
          transition: "background 200ms ease",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 16 : 2,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: checked ? "rgb(var(--bg))" : "rgb(var(--muted))",
            transition: "left 200ms cubic-bezier(0.22,1,0.36,1), background 200ms ease",
          }}
        />
      </span>
    </label>
  );
}

export function CookieBanner() {
  const { theme, setTheme } = useTheme();
  const [cookieVisible, setCookieVisible] = useState(false);
  const [darkPromptVisible, setDarkPromptVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    try {
      if (!localStorage.getItem("cookie_consent")) setCookieVisible(true);
    } catch {}
  }, []);

  const applyConsent = (analyticsAllowed: boolean) => {
    try { localStorage.setItem("cookie_consent", analyticsAllowed ? "accepted" : "declined"); } catch {}
    if (analyticsAllowed) {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }
    setCookieVisible(false);
    try {
      const alreadyAsked = localStorage.getItem("dark_prompt_shown");
      if (!alreadyAsked && isEvening() && theme === "light") {
        setTimeout(() => setDarkPromptVisible(true), 600);
      }
    } catch {}
  };

  const acceptAll = () => applyConsent(true);
  const confirm = () => applyConsent(analytics);
  const decline = () => applyConsent(false);

  const dismissDarkPrompt = () => {
    try { localStorage.setItem("dark_prompt_shown", "1"); } catch {}
    setDarkPromptVisible(false);
  };

  const switchDark = () => {
    setTheme("dark");
    dismissDarkPrompt();
  };

  return (
    <>
      {cookieVisible && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6"
          style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}
        >
          <div
            className="mx-auto max-w-2xl rounded-xl border border-[rgb(var(--line))]"
            style={{ background: "rgb(var(--surface-elevated))", boxShadow: "0 8px 32px rgb(0 0 0 / 0.18)" }}
          >
            {/* Default row */}
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))] flex-1">
                We use cookies to keep you signed in and measure site usage.{" "}
                <Link href="/policies/privacy-policy" className="underline underline-offset-2 hover:text-[rgb(var(--fg))] transition-colors">
                  Privacy policy
                </Link>
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="rounded-full px-4 py-2 text-[12px] tracking-tight text-[rgb(var(--muted))] border border-[rgb(var(--line))] hover:border-[rgb(var(--fg))] hover:text-[rgb(var(--fg))] transition-colors"
                >
                  {expanded ? "Close" : "Customize"}
                </button>
                <button
                  onClick={acceptAll}
                  className="rounded-full px-4 py-2 text-[12px] tracking-tight font-medium bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-85 transition-opacity"
                >
                  Accept all
                </button>
              </div>
            </div>

            {/* Expanded preferences */}
            <div
              style={{
                display: "grid",
                gridTemplateRows: expanded ? "1fr" : "0fr",
                transition: "grid-template-rows 260ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div className="border-t border-[rgb(var(--line))] px-5 py-4 flex flex-col gap-3">

                  {/* Essential */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[13px] tracking-tight text-[rgb(var(--fg))]">Essential</p>
                      <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] mt-0.5">
                        Sign-in, preferences, site functionality. Always on.
                      </p>
                    </div>
                    <Toggle checked={true} onChange={() => {}} disabled />
                  </div>

                  {/* Analytics */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[13px] tracking-tight text-[rgb(var(--fg))]">Analytics</p>
                      <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] mt-0.5">
                        Anonymous usage data to help us improve the site.
                      </p>
                    </div>
                    <Toggle checked={analytics} onChange={setAnalytics} />
                  </div>

                  {/* Confirm row */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={decline}
                      className="rounded-full px-4 py-2 text-[12px] tracking-tight text-[rgb(var(--muted))] border border-[rgb(var(--line))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg))] transition-colors"
                    >
                      Decline all
                    </button>
                    <button
                      onClick={confirm}
                      className="rounded-full px-4 py-2 text-[12px] tracking-tight font-medium bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-85 transition-opacity"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {darkPromptVisible && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6"
          style={{ animation: "rise-in 400ms cubic-bezier(0.22,1,0.36,1) both" }}
        >
          <div
            className="mx-auto max-w-sm rounded-xl border border-[rgb(var(--line))] px-5 py-4 flex flex-col gap-3"
            style={{ background: "rgb(var(--surface-elevated))", boxShadow: "0 8px 32px rgb(0 0 0 / 0.14)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
                It's getting late. Switch to dark mode for easier viewing?
              </p>
              <button
                onClick={dismissDarkPrompt}
                className="shrink-0 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors mt-0.5"
                aria-label="Dismiss"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-3.5 h-3.5" aria-hidden="true">
                  <line x1="12" y1="4" x2="4" y2="12" /><line x1="4" y1="4" x2="12" y2="12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={switchDark}
                className="rounded-full px-4 py-2 text-[12px] tracking-tight font-medium bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-85 transition-opacity"
              >
                Switch to dark
              </button>
              <button
                onClick={dismissDarkPrompt}
                className="rounded-full px-4 py-2 text-[12px] tracking-tight text-[rgb(var(--muted))] border border-[rgb(var(--line))] hover:text-[rgb(var(--fg))] transition-colors"
              >
                Keep light
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
