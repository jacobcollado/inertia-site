"use client";

import { useId } from "react";
import { SELECTION_FRAME_COLOR } from "@/components/figma-frame";

// Shared material kit for the homepage illustrations (What we do, How we
// think about execution): paper grain, torn edges, halftone, dither and a
// fine pixel grid, plus the same
// construction framing in every tile (ruler, hairlines, handles, a stepped
// pixel grid out of one corner). Everything is drawn on a 400x300 board that
// fills a 4:3 tile. Only ink, white, greys and the blue selection colour.

export const INK = "#1a1a1a";
export const PAPER = "#fff";
export const TILE = "#f4f4f4";
export const SEL = SELECTION_FRAME_COLOR;

export type Ids = Record<"grain" | "torn" | "halftone" | "fade" | "fadeMask" | "dither" | "fine", string>;

export function Defs({ ids }: { ids: Ids }) {
  return (
    <defs>
      {/* Paper grain: fine monochrome noise multiplied into whatever it's on. */}
      <filter id={ids.grain} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="4" result="n" />
        <feColorMatrix in="n" type="saturate" values="0" result="g" />
        <feComponentTransfer in="g" result="soft">
          <feFuncR type="linear" slope="0.35" intercept="0.72" />
          <feFuncG type="linear" slope="0.35" intercept="0.72" />
          <feFuncB type="linear" slope="0.35" intercept="0.72" />
        </feComponentTransfer>
        <feComposite in="soft" in2="SourceGraphic" operator="in" result="clip" />
        <feBlend in="SourceGraphic" in2="clip" mode="multiply" />
      </filter>
      {/* Torn edge plus grain, for the finished pieces. */}
      <filter id={ids.torn} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="9" result="edge" />
        <feDisplacementMap in="SourceGraphic" in2="edge" scale="7" xChannelSelector="R" yChannelSelector="G" result="torn" />
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="n" />
        <feColorMatrix in="n" type="saturate" values="0" result="g" />
        <feComponentTransfer in="g" result="soft">
          <feFuncR type="linear" slope="0.5" intercept="0.62" />
          <feFuncG type="linear" slope="0.5" intercept="0.62" />
          <feFuncB type="linear" slope="0.5" intercept="0.62" />
        </feComponentTransfer>
        <feComposite in="soft" in2="torn" operator="in" result="clip" />
        <feBlend in="torn" in2="clip" mode="multiply" />
      </filter>
      <pattern id={ids.halftone} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <circle cx="2.5" cy="2.5" r="1.5" fill={INK} />
      </pattern>
      <linearGradient id={ids.fade} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0.15" />
        <stop offset="1" stopColor="#fff" />
      </linearGradient>
      <mask id={ids.fadeMask} maskContentUnits="objectBoundingBox">
        <rect width="1" height="1" fill={`url(#${ids.fade})`} />
      </mask>
      <pattern id={ids.dither} width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="2" height="2" fill={INK} />
        <rect x="2" y="2" width="2" height="2" fill={INK} />
      </pattern>
      <pattern id={ids.fine} width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M6 0 H0 V6" fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="0.7" />
      </pattern>
    </defs>
  );
}

// The same construction framing in every tile.
// The framing is laid out from the board's edges, so it fits any board size
// (400x300 tiles, the wider blog cover).
export function Framing({ ids, w = 400, h = 300 }: { ids: Ids; w?: number; h?: number }) {
  const ticks = [];
  for (let y = 0; y <= h; y += 6) {
    ticks.push(<line key={y} x1={0} y1={y} x2={y % 30 === 0 ? 14 : 7} y2={y} />);
  }
  // Stepped pixel grid out of the bottom-right corner.
  const cells = [];
  const c = 9;
  for (let i = 0; i < 14; i++) {
    for (let j = 0; i + j < 14; j++) {
      cells.push(<rect key={`${i}-${j}`} x={w - c * (i + 1)} y={h - c * (j + 1)} width={c} height={c} />);
    }
  }
  const handles: [number, number][] = [[44, 36], [w - 44, 36], [44, h - 36]];
  return (
    <>
      <rect width={w} height={h} fill={TILE} filter={`url(#${ids.grain})`} />
      <g stroke={INK} strokeOpacity={0.14} strokeWidth={0.8}>
        {ticks}
        <line x1={44} y1={0} x2={44} y2={h} strokeDasharray="3 4" />
        <line x1={0} y1={36} x2={w} y2={36} />
        <line x1={0} y1={h - 36} x2={w * 0.65} y2={h - 36} strokeDasharray="3 4" />
        <line x1={0} y1={h} x2={182} y2={h - 112} />
      </g>
      <g stroke={INK} strokeOpacity={0.12} strokeWidth={0.6} fill="none">
        {cells}
      </g>
      {handles.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 3} y={y - 3} width={6} height={6} fill={PAPER} stroke={INK} strokeOpacity={0.3} strokeWidth={0.8} />
      ))}
    </>
  );
}

// The framing alone as a backdrop, filling its positioned parent. Used
// behind the blog post cover drawing.
export function MaterialBackdrop({ w, h, className = "" }: { w: number; h: number; className?: string }) {
  const ids = useMaterialIds();
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <Defs ids={ids} />
      <Framing ids={ids} w={w} h={h} />
    </svg>
  );
}

// Filter and pattern ids, scoped per SVG since several share the page.
export function useMaterialIds(): Ids {
  const id = useId().replace(/:/g, "");
  return {
    grain: `${id}-grain`,
    torn: `${id}-torn`,
    halftone: `${id}-halftone`,
    fade: `${id}-fade`,
    fadeMask: `${id}-fadeMask`,
    dither: `${id}-dither`,
    fine: `${id}-fine`,
  };
}
