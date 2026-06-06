"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "./theme-provider";

function isEvening(): boolean {
  const h = new Date().getHours();
  return h >= 18 || h < 6;
}

export function CookieBanner() {
  const { theme, setTheme } = useTheme();
  const [cookieVisible, setCookieVisible] = useState(false);
  const [darkPromptVisible, setDarkPromptVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("cookie_consent")) setCookieVisible(true);
    } catch {}
  }, []);

  const accept = () => {
    try { localStorage.setItem("cookie_consent", "accepted"); } catch {}
    setCookieVisible(false);
    // After accepting, check if evening + light mode + not yet asked
    try {
      const alreadyAsked = localStorage.getItem("dark_prompt_shown");
      if (!alreadyAsked && isEvening() && theme === "light") {
        setTimeout(() => setDarkPromptVisible(true), 600);
      }
    } catch {}
  };

  const decline = () => {
    try { localStorage.setItem("cookie_consent", "declined"); } catch {}
    setCookieVisible(false);
  };

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
            className="mx-auto max-w-2xl rounded-xl border border-[rgb(var(--line))] px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
            style={{ background: "rgb(var(--surface-elevated))", boxShadow: "0 8px 32px rgb(0 0 0 / 0.18)" }}
          >
            <p className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))] flex-1">
              We use cookies to keep you signed in, measure site usage, and record anonymised sessions to improve the experience. All inputs are masked.{" "}
              <Link href="/policies/privacy-policy" className="underline underline-offset-2 hover:text-[rgb(var(--fg))] transition-colors">
                Privacy policy
              </Link>
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={decline}
                className="rounded-full px-4 py-2 text-[12px] tracking-tight text-[rgb(var(--muted))] border border-[rgb(var(--line))] hover:border-[rgb(var(--fg)/0.3)] hover:text-[rgb(var(--fg))] transition-colors"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="rounded-full px-4 py-2 text-[12px] tracking-tight font-medium bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-85 transition-opacity"
              >
                Accept
              </button>
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
