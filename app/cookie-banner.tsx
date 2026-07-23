"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePostHog } from "./posthog-provider";

// Shared hover/press behaviour matching the hero CTA buttons: a small lift and
// slight fade on hover, settling on press.
const hoverLift = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.opacity = "0.85";
  e.currentTarget.style.transform = "translateY(-1px)";
};
const hoverReset = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.opacity = "1";
  e.currentTarget.style.transform = "translateY(0)";
};
const hoverPress = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.transform = "translateY(0px)";
};

function Toggle({ id, checked, onChange, disabled }: { id: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
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
  const setConsent = usePostHog();
  const [cookieVisible, setCookieVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    try {
      if (!localStorage.getItem("cookie_consent")) {
        const t = setTimeout(() => setCookieVisible(true), 2500);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const applyConsent = (analyticsAllowed: boolean) => {
    try { localStorage.setItem("cookie_consent", analyticsAllowed ? "accepted" : "declined"); } catch {}
    setConsent(analyticsAllowed);
    setCookieVisible(false);
  };

  const acceptAll = () => applyConsent(true);
  const confirm = () => applyConsent(analytics);
  const decline = () => applyConsent(false);

  return (
    <>
      {cookieVisible && (
        <div
          className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6 sm:max-w-2xl"
          style={{
            animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both",
            // Isolate the banner on its own compositor layer so its entrance
            // (and the expensive shadow paint) doesn't thrash the homepage's
            // scroll-driven animations running at the same time.
            willChange: "transform, opacity",
            transform: "translateZ(0)",
          }}
        >
          <div
            className="mx-auto max-w-2xl rounded-xl"
            style={{
              background: "#ffffff",
              // Single, cheap drop shadow — the old 5-layer stack (with a 24px
              // inset blur) was costly to repaint on appearance.
              boxShadow: "0 8px 24px rgb(0 0 0 / 0.12), 0 2px 6px rgb(0 0 0 / 0.06)",
            }}
          >
            {/* Default row */}
            <div className="px-5 py-4 sm:px-7 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
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
                  onClick={() => setExpanded((v) => !v)}
                  className="relative inline-flex items-center rounded-full px-4 py-2 text-[13px] sm:text-[14px] tracking-tight font-medium overflow-hidden"
                  style={{ background: "#e2e2e2", color: "#1a1a1a", transition: "opacity 150ms ease, transform 150ms ease" }}
                  onMouseEnter={hoverLift}
                  onMouseLeave={hoverReset}
                  onMouseDown={hoverPress}
                >
                  <span
                    aria-hidden={expanded}
                    style={{
                      display: "inline-block",
                      opacity: expanded ? 0 : 1,
                      transform: expanded ? "translateY(-6px)" : "translateY(0)",
                      transition: "opacity 450ms cubic-bezier(0.16,1,0.3,1), transform 450ms cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    Customize
                  </span>
                  <span
                    aria-hidden={!expanded}
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: expanded ? 1 : 0,
                      transform: expanded ? "translateY(0)" : "translateY(6px)",
                      transition: "opacity 450ms cubic-bezier(0.16,1,0.3,1), transform 450ms cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    Close
                  </span>
                </button>
                <button
                  onClick={acceptAll}
                  className="inline-flex items-center rounded-full px-4 py-2 text-[13px] sm:text-[14px] tracking-tight font-medium"
                  style={{ background: "#1a1a1a", color: "#fff", transition: "opacity 150ms ease, transform 150ms ease" }}
                  onMouseEnter={hoverLift}
                  onMouseLeave={hoverReset}
                  onMouseDown={hoverPress}
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
                transition: "grid-template-rows 750ms cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div
                  className="border-t border-[rgb(var(--line))] px-5 py-4 sm:px-7 sm:py-4 flex flex-col gap-3 sm:gap-3"
                  style={{
                    transform: expanded ? "scale(1)" : "scale(0.97)",
                    transformOrigin: "top center",
                    opacity: expanded ? 1 : 0,
                    transition: "transform 750ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease",
                  }}
                >

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
                    <button
                      onClick={decline}
                      className="inline-flex items-center rounded-full px-4 py-2 text-[13px] sm:text-[14px] tracking-tight font-medium"
                      style={{ background: "#e2e2e2", color: "#1a1a1a", transition: "opacity 150ms ease, transform 150ms ease" }}
                      onMouseEnter={hoverLift}
                      onMouseLeave={hoverReset}
                      onMouseDown={hoverPress}
                    >
                      Decline all
                    </button>
                    <button
                      onClick={confirm}
                      className="inline-flex items-center rounded-full px-4 py-2 text-[13px] sm:text-[14px] tracking-tight font-medium"
                      style={{ background: "#1a1a1a", color: "#fff", transition: "opacity 150ms ease, transform 150ms ease" }}
                      onMouseEnter={hoverLift}
                      onMouseLeave={hoverReset}
                      onMouseDown={hoverPress}
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
    </>
  );
}
