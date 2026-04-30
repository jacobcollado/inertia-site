"use client";

import { TimeTagline } from "./ambient";

export function AboutCard() {
  return (
    <div className="md:text-right">
      <TimeTagline fallback="Your vision. Built." />

      <p className="mt-4 text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
        Inertia closes the gap between idea and execution. We become the technical partner your vision deserves, until it exists exactly as you imagined it.
      </p>
    </div>
  );
}
