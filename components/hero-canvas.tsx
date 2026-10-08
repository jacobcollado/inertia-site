"use client";

import type { CSSProperties } from "react";
import { CradleScene } from "@/components/cradle-scene";

// The hero's visual: a rendered Newton's cradle (components/cradle-scene.tsx)
// on the page's tile, inertia made literal: momentum handed on, nothing
// lost. The homepage fades the panel in with the hero; the scene itself
// starts once three.js has loaded on the client.
export function HeroCanvas({ style }: { style?: CSSProperties; play?: boolean; delay?: number }) {
  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden rounded-[6px] aspect-[4/3] sm:aspect-[12/5]"
      style={{ background: "var(--tile)", ...style }}
    >
      <CradleScene className="absolute inset-0 h-full w-full" />
    </div>
  );
}
