"use client";

import { useId } from "react";
import { SELECTION_FRAME_COLOR } from "@/components/figma-frame";

// Shared material kit for the homepage illustrations (What we do, How we
// think about execution): paper grain, torn edges, halftone, dither and a
// fine pixel grid, plus the same construction framing in every tile (ruler,
// hairlines, handles, a stepped pixel grid out of one corner). Everything is
// drawn on a 400x300 board that fills a 4:3 tile. Only ink, white, greys and
// the blue selection colour.
//
// Nothing here uses an SVG filter. Grain is a small pre-made noise image
// tiled as a pattern and torn edges are fixed jagged outlines, so the
// browser rasterises them once instead of re-running noise on every repaint
// (which the entrance animations and hover zoom would trigger), keeping
// these cheap on phones.

// CSS variables (globals.css) so the homepage's dark theme can flip them.
export const INK = "var(--ink)";
export const PAPER = "var(--paper)";
export const TILE = "var(--tile)";
export const SEL = SELECTION_FRAME_COLOR;

export type Ids = Record<"grain" | "halftone" | "fade" | "fadeMask" | "dither" | "fine", string>;

const GRAIN_SRC = "/textures/grain.png";
const GRAIN_TILE = 96;

export function Defs({ ids }: { ids: Ids }) {
  return (
    <defs>
      <pattern id={ids.grain} width={GRAIN_TILE} height={GRAIN_TILE} patternUnits="userSpaceOnUse">
        <image href={GRAIN_SRC} width={GRAIN_TILE} height={GRAIN_TILE} />
      </pattern>
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
      <rect width={w} height={h} fill={TILE} />
      <rect width={w} height={h} fill={`url(#${ids.grain})`} />
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

// Filter and pattern ids, scoped per SVG since several share the page.
export function useMaterialIds(): Ids {
  const id = useId().replace(/:/g, "");
  return {
    grain: `${id}-grain`,
    halftone: `${id}-halftone`,
    fade: `${id}-fade`,
    fadeMask: `${id}-fadeMask`,
    dither: `${id}-dither`,
    fine: `${id}-fine`,
  };
}

// Grain laid over a shape: the same outline, filled with the grain pattern.
export function GrainRect({ ids, x, y, w, h }: { ids: Ids; x: number; y: number; w: number; h: number }) {
  return <rect x={x} y={y} width={w} height={h} fill={`url(#${ids.grain})`} />;
}

// A square with a torn edge: points every few units along each side, each
// nudged in or out by a seeded amount, so the same square always tears the
// same way.
export function tornSquare(x: number, y: number, s: number, seed: number) {
  let n = seed >>> 0;
  const rnd = () => {
    n = (n * 1664525 + 1013904223) >>> 0;
    return n / 4294967296 - 0.5;
  };
  const step = 5;
  const amp = 4;
  const pts: string[] = [];
  const side = (fx: (t: number) => number, fy: (t: number) => number, nx: number, ny: number) => {
    for (let t = 0; t < s; t += step) {
      const o = rnd() * amp;
      pts.push(`${(fx(t) + nx * o).toFixed(1)},${(fy(t) + ny * o).toFixed(1)}`);
    }
  };
  side((t) => x + t, () => y, 0, 1);
  side(() => x + s, (t) => y + t, 1, 0);
  side((t) => x + s - t, () => y + s, 0, 1);
  side(() => x, (t) => y + s - t, 1, 0);
  return `M${pts.join(" L")} Z`;
}
