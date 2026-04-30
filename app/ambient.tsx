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
