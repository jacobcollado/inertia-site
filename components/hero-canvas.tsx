"use client";

import type { CSSProperties } from "react";
import { RoomsArt } from "@/components/rooms-art";

// The hero's visual: a run of rooms seen down their doorways, walked
// through as the page scrolls (components/rooms-art.tsx), on the paper. The
// homepage fades the panel in with the hero; `play` and `delay` hold the
// drawing until it has, so it flies in once it's in view. The earlier
// lattice is kept in components/field-art.tsx.
export function HeroCanvas({ style, play = true, delay = 0 }: { style?: CSSProperties; play?: boolean; delay?: number }) {
  return (
    <div className="relative w-full" style={style}>
      {/* Starts once the panel has mostly faded in (its fade runs 900ms). */}
      <RoomsArt className="w-full" play={play} delay={delay + 300} />
    </div>
  );
}
