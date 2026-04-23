"use client";

import { TimeTagline } from "./ambient";

export function AboutCard() {
  return (
    <div className="md:text-right">
      <TimeTagline fallback="Design and code, end to end." />

      <p className="mt-4 text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
        I design and build. Brand, identity, and art direction on one side. Web and product on the other. Everything on this site is solo work.
      </p>
    </div>
  );
}
