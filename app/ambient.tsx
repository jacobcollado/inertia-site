"use client";

import { useEffect, useState } from "react";

function getChicagoHour(): number {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })
  ).getHours();
}

function getTagline(hour: number): string {
  if (hour >= 0 && hour < 5)
    return "Still up. Designing and building, end to end.";
  if (hour >= 5 && hour < 12)
    return "Morning. Designing and building, end to end.";
  if (hour >= 17 && hour < 20)
    return "Evening. Designing and building, end to end.";
  if (hour >= 20)
    return "Winding down. Still designing and building, end to end.";
  return "I design and build end to end, shaping brand, web, and product from concept to code.";
}

const DEFAULT_TAGLINE = "I design and build end to end, shaping brand, web, and product from concept to code.";

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

  useEffect(() => {
    const key = "jc_visited";
    if (localStorage.getItem(key)) {
      setReturning(true);
    } else {
      localStorage.setItem(key, "1");
    }
  }, []);

  if (!returning) return null;

  return (
    <span
      className="text-sm tracking-tight text-[rgb(var(--muted))]"
      style={{ animation: "fade-in 800ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
    >
      welcome back
    </span>
  );
}
