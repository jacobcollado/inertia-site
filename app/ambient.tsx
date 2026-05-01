"use client";

import { useEffect, useState } from "react";

function getChicagoHour(): number {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })
  ).getHours();
}

function getTagline(hour: number): string {
  if (hour >= 0 && hour < 5)
    return "Still building while you sleep.";
  if (hour >= 5 && hour < 9)
    return "Early start. Big ideas.";
  if (hour >= 9 && hour < 12)
    return "Deep in it. What are we building?";
  if (hour >= 12 && hour < 17)
    return "Midday momentum. Shipping things.";
  if (hour >= 17 && hour < 20)
    return "Golden hour. Still going.";
  if (hour >= 20)
    return "Late hours. Our best work lives here.";
  return "Your vision. Built.";
}

const DEFAULT_TAGLINE = "Your vision. Built.";

export function TimeTagline({ fallback = DEFAULT_TAGLINE }: { fallback?: string }) {
  const [tagline, setTagline] = useState(fallback);
  const [swapped, setSwapped] = useState(false);

  useEffect(() => {
    const hour = getChicagoHour();
    const line = getTagline(hour);
    if (line !== DEFAULT_TAGLINE) {
      setTagline(line);
      setSwapped(true);
    }
  }, []);

  return (
    <p
      key={tagline}
      className="text-3xl sm:text-4xl leading-[1.15] tracking-tighter font-medium text-[rgb(var(--fg))]"
      style={swapped ? { animation: "fade-in 600ms cubic-bezier(0.22, 1, 0.36, 1) both" } : undefined}
    >
      {tagline}
    </p>
  );
}

export function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("popup_seen")) return;
    const t = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("popup_seen", "1");
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[240px] pointer-events-auto"
      style={{
        animation: dismissed
          ? "popup-out 280ms cubic-bezier(0.4,0,1,1) both"
          : "popup-in 480ms cubic-bezier(0.22,1,0.36,1) both",
      }}
      onAnimationEnd={() => { if (dismissed) setVisible(false); }}
    >
      <div className="relative bg-[rgb(var(--bg))] border border-[rgb(var(--line))] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)]">
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-3.5 right-3.5 flex items-center justify-center w-5 h-5 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors [-webkit-tap-highlight-color:transparent]"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-3 h-3" aria-hidden="true">
            <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
          </svg>
        </button>

        <div className="px-4 pt-4 pb-4">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 rounded-full px-2.5 py-1 mb-3">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10.5px] tracking-tight text-emerald-600 dark:text-emerald-400 font-medium">Available for work</span>
          </div>

          <p className="text-[13px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug mb-1">
            Glad you found us.
          </p>
          <p className="text-[11.5px] tracking-tight text-[rgb(var(--muted))] leading-relaxed mb-3.5 opacity-70">
            Take a look around. Learn what we build and why.
          </p>

          <button
            onClick={dismiss}
            className="group inline-flex items-center gap-1.5 text-[11.5px] font-medium tracking-tight text-[rgb(var(--fg))] hover:opacity-60 transition-opacity [-webkit-tap-highlight-color:transparent]"
          >
            Show me
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
              <line x1="3" y1="8" x2="13" y2="8" /><polyline points="9,4 13,8 9,12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function WelcomeBack() {
  const [returning, setReturning] = useState(false);
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    const key = "jc_visited";
    const count = parseInt(localStorage.getItem(key) ?? "0", 10);
    if (count > 0) {
      setReturning(true);
      setVisits(count);
    }
    localStorage.setItem(key, String(count + 1));
  }, []);

  if (!returning) return null;

  const label = visits >= 5 ? "good to see you again" : "welcome back";

  return (
    <span
      className="text-[13px] tracking-tight text-[rgb(var(--muted))]"
      style={{ animation: "welcome-in 900ms cubic-bezier(0.22, 1, 0.36, 1) both", animationDelay: "500ms" }}
    >
      {label}
    </span>
  );
}
