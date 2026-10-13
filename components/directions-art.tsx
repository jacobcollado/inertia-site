"use client";

import type { CSSProperties } from "react";
import { Box, EASE, Flag, enter, raise, type Pt } from "@/components/line-art";

// The AI section's sketch, in the hero staircase's line style
// (components/line-art.tsx), using the same pieces as the other drawings:
// boxes on a slab in one-point perspective, faint pieces for what's set
// aside (as in Restraint), and the flag that marks something launched.
//
// It acts the copy out. Many variants of a piece drop onto the slab one
// after another, each in different proportions: the directions a studio our
// size can now afford to explore. The wrong ones are set aside one at a
// time, fading back to faint. The one worth shipping is built up, a piece
// set on top of it, and its flag goes up. Plays once when `play` turns on
// and resets when it turns off; with `still` (reduced motion) it shows the
// finished state.
//
// Two boards: a wide one for tablets and up, and the usual 400x300 board
// with fewer variants for phones.

type Variant = { x: number; w: number; h: number };
type Layout = {
  w: number;
  h: number;
  vp: Pt;
  slab: { x: number; y: number; w: number; h: number; d: number };
  d: number;
  variants: Variant[];
  chosen: number;
  top: { w: number; h: number; d: number };
  flag: number;
};

const WIDE: Layout = {
  w: 1200,
  h: 420,
  vp: [600, -980],
  slab: { x: 180, y: 300, w: 840, h: 46, d: 0.1 },
  d: 0.14,
  variants: [
    { x: 222, w: 56, h: 70 },
    { x: 298, w: 44, h: 112 },
    { x: 362, w: 70, h: 50 },
    { x: 452, w: 48, h: 90 },
    { x: 520, w: 80, h: 100 },
    { x: 624, w: 48, h: 62 },
    { x: 692, w: 64, h: 124 },
    { x: 776, w: 44, h: 78 },
    { x: 840, w: 72, h: 54 },
    { x: 932, w: 52, h: 96 },
  ],
  chosen: 4,
  top: { w: 56, h: 40, d: 0.1 },
  flag: 66,
};

const COMPACT: Layout = {
  w: 400,
  h: 300,
  vp: [230, -700],
  slab: { x: 40, y: 222, w: 320, h: 30, d: 0.1 },
  d: 0.14,
  variants: [
    { x: 54, w: 30, h: 48 },
    { x: 94, w: 24, h: 72 },
    { x: 128, w: 34, h: 34 },
    { x: 172, w: 46, h: 62 },
    { x: 232, w: 28, h: 40 },
    { x: 270, w: 38, h: 82 },
    { x: 318, w: 28, h: 52 },
  ],
  chosen: 3,
  top: { w: 32, h: 26, d: 0.1 },
  flag: 48,
};

// The order variants are set aside in, scattered so it never reads as a
// sweep. Any a board has that aren't listed follow at the end.
const DROP_ORDER = [8, 1, 6, 3, 9, 0, 5, 2, 7, 4];

const ENTER_STEP = 90;
const DROP_STEP = 170;

function Board({ layout: L, play, still, className }: { layout: Layout; play: boolean; still: boolean; className?: string }) {
  const on = play || still;
  const t = (ms: number) => (still ? 0 : ms);
  const base = L.slab.y;
  const drops = [...DROP_ORDER, ...L.variants.map((_, i) => i)].filter(
    (i, k, all) => i < L.variants.length && i !== L.chosen && all.indexOf(i) === k,
  );
  const dropFrom = L.variants.length * ENTER_STEP + 700;
  const buildAt = dropFrom + drops.length * DROP_STEP + 300;
  const fade = (to: number, from: number, delay: number, ms = 450): CSSProperties => ({
    opacity: on ? to : from,
    transition: `opacity ${ms}ms ${EASE} ${on ? t(delay) : 0}ms`,
  });

  // Farther from the vanishing point first, so nearer side faces cover
  // farther ones.
  const order = L.variants.map((_, i) => i).sort((a, b) => {
    const ca = L.variants[a].x + L.variants[a].w / 2;
    const cb = L.variants[b].x + L.variants[b].w / 2;
    return Math.abs(cb - L.vp[0]) - Math.abs(ca - L.vp[0]);
  });

  const c = L.variants[L.chosen];
  const top = { x: c.x + (c.w - L.top.w) / 2, y: base - c.h - L.top.h, ...L.top };
  // The flag stands halfway back on the top piece's top face.
  const rise = 0.3 * L.top.d * (top.y - L.vp[1]);
  const flagAt: Pt = [top.x + top.w * 0.55, top.y - rise * 0.5];

  return (
    <svg viewBox={`0 0 ${L.w} ${L.h}`} className={className} fill="none" aria-hidden="true">
      <Box {...L.slab} vp={L.vp} />
      {order.map((i) => {
        const v = L.variants[i];
        const box = { x: v.x, y: base - v.h, w: v.w, h: v.h, d: L.d, vp: L.vp };
        const drop = drops.indexOf(i);
        return (
          <g key={i} style={enter(on, "translateY(-28px)", t(i * ENTER_STEP), 520)}>
            {drop < 0 ? (
              <Box {...box} />
            ) : (
              <>
                {/* Set aside: the piece fades back to faint. */}
                <g style={fade(1, 0, dropFrom + drop * DROP_STEP)}>
                  <Box {...box} light />
                </g>
                <g style={fade(0, 1, dropFrom + drop * DROP_STEP)}>
                  <Box {...box} />
                </g>
              </>
            )}
          </g>
        );
      })}
      {/* The version worth shipping, built up and launched. */}
      <g style={enter(on, "translateY(-26px)", t(buildAt), 600)}>
        <Box {...top} vp={L.vp} />
      </g>
      <g style={raise(on, t(buildAt + 650))}>
        <Flag x={flagAt[0]} y={flagAt[1]} h={L.flag} />
      </g>
    </svg>
  );
}

export function DirectionsArt({ play, still = false }: { play: boolean; still?: boolean }) {
  return (
    <>
      <Board layout={COMPACT} play={play} still={still} className="h-full w-full sm:hidden" />
      <Board layout={WIDE} play={play} still={still} className="hidden h-full w-full sm:block" />
    </>
  );
}
