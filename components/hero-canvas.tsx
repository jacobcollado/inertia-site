"use client";

import type { CSSProperties } from "react";
import { FieldArt } from "@/components/field-art";

// The hero's visual: a lattice of points bent by an unseen mass that
// follows the pointer (components/field-art.tsx), on the page's tile. The homepage fades
// the panel in with the hero;
// `play` and `delay` hold the lattice until it has, so it settles in view.
export function HeroCanvas({ style, play = true, delay = 0 }: { style?: CSSProperties; play?: boolean; delay?: number }) {
  return (
    <div className="relative w-full" style={style}>
      {/* Starts once the panel has mostly faded in (its fade runs 900ms). */}
      <FieldArt className="w-full" play={play} delay={delay + 500} />
    </div>
  );
}
