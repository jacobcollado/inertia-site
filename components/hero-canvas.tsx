"use client";

import type { CSSProperties } from "react";
import { FingerprintArt } from "@/components/fingerprint-art";

// The hero's visual: a generative piece drawn fresh for each visit
// (components/fingerprint-art.tsx), on the page's tile, with its caption
// and a way to save it. The homepage fades the panel in with the hero;
// `play` and `delay` hold the drawing until it has, so it builds in view.
export function HeroCanvas({ style, play = true, delay = 0 }: { style?: CSSProperties; play?: boolean; delay?: number }) {
  return (
    <div className="relative w-full" style={style}>
      {/* Starts once the panel has mostly faded in (its fade runs 900ms). */}
      <FingerprintArt className="w-full" play={play} delay={delay + 500} />
    </div>
  );
}
