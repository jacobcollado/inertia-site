"use client";

import { useEffect, useState } from "react";

function getChicagoHour(): number {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })
  ).getHours();
}

function getTagline(hour: number): string {
  if (hour >= 0 && hour < 5)
    return "Still up. Design and code.";
  if (hour >= 5 && hour < 12)
    return "Morning. Design and code.";
  if (hour >= 17 && hour < 20)
    return "Evening. Design and code.";
  if (hour >= 20)
    return "Winding down. Still at it.";
  return "Design and code, end to end.";
}

const DEFAULT_TAGLINE = "Design and code, end to end.";

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
      className="text-2xl sm:text-3xl leading-[1.25] tracking-tight text-[rgb(var(--fg))]"
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
