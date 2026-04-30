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
      className="fixed bottom-5 right-5 z-50 w-[260px] pointer-events-auto"
      style={{
        animation: dismissed
          ? "popup-out 300ms cubic-bezier(0.4,0,1,1) both"
          : "popup-in 520ms cubic-bezier(0.22,1,0.36,1) both",
      }}
      onAnimationEnd={() => { if (dismissed) setVisible(false); }}
    >
      <div className="relative bg-[rgb(var(--bg))] border border-[rgb(var(--line))] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.28),0_2px_8px_rgba(0,0,0,0.08)]">
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors [-webkit-tap-highlight-color:transparent]"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-3 h-3" aria-hidden="true">
            <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
          </svg>
        </button>

        {/* Sketch */}
        <div className="px-5 pt-5 pb-3">
          <svg viewBox="0 0 220 70" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full text-[rgb(var(--muted))] opacity-[0.32]" aria-hidden="true">
            {/* Origin dot */}
            <circle cx="28" cy="35" r="3" fill="currentColor" stroke="none" opacity="0.6" />
            {/* Expanding arcs */}
            <path d="M 38 22 A 16 16 0 0 1 38 48" strokeWidth="1.0" />
            <path d="M 50 13 A 26 26 0 0 1 50 57" strokeWidth="0.65" />
            <path d="M 65 6 A 36 36 0 0 1 65 64" strokeWidth="0.4" />
            {/* Dashed axis */}
            <line x1="28" y1="35" x2="170" y2="35" strokeWidth="0.3" strokeDasharray="2 5" />
            {/* Arrival */}
            <line x1="170" y1="27" x2="170" y2="43" strokeWidth="0.8" />
            <line x1="176" y1="35" x2="192" y2="35" strokeWidth="0.5" />
            <polyline points="186,30 192,35 186,40" strokeWidth="0.65" />
          </svg>
        </div>

        <div className="border-t border-[rgb(var(--line))] px-5 pt-4 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-60">Available for new work</span>
          </div>

          <p className="text-[13px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug mb-1.5">
            Glad you found us.
          </p>
          <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] leading-relaxed mb-4">
            Take a look around. Learn what we build and why. Worth your time.
          </p>

          <button
            onClick={dismiss}
            className="w-full inline-flex items-center justify-center bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-4 py-2 text-[12px] font-medium tracking-tight hover:opacity-85 transition-opacity [-webkit-tap-highlight-color:transparent]"
          >
            Sure, show me
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
