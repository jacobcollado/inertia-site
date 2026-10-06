"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Box, EASE, Floor, LineBoard as Board } from "@/components/line-art";

// Illustrations for the homepage's "How we think about execution"
// principles, in the hero staircase's line style (components/line-art.tsx).
// Each one acts its principle out when `play` turns on, and resets when it
// turns off so it plays again next time.

// Flips to true a beat after `play` does, so the starting state is seen first.
function useDone(play: boolean, delay = 450) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(play), play ? delay : 0);
    return () => clearTimeout(t);
  }, [play, delay]);
  return done;
}

const fade = (on: boolean, delay = 0): CSSProperties => ({
  opacity: on ? 1 : 0,
  transition: `opacity 500ms ${EASE} ${delay}ms`,
});

// Restraint: a crowd of pieces around the pair that matters. One at a time
// the extras turn to dashed ghosts, until only the pair is solid.
const EXTRAS = [
  { x: 52, y: 168, w: 44, h: 82, d: 0.12 },
  { x: 106, y: 220, w: 34, h: 30, d: 0.14 },
  { x: 270, y: 194, w: 58, h: 56, d: 0.14 },
  { x: 336, y: 224, w: 28, h: 26, d: 0.12 },
];

export function RestraintArt({ play }: { play: boolean }) {
  const done = useDone(play);
  return (
    <Board>
      <Floor y={250} />
      {EXTRAS.map((b, i) => (
        <g key={i}>
          <g style={fade(done, i * 220)}>
            <Box {...b} ghost />
          </g>
          <g style={fade(!done, i * 220)}>
            <Box {...b} />
          </g>
        </g>
      ))}
      <Box x={150} y={150} w={100} h={100} d={0.2} />
      <Box x={176} y={124} w={48} h={26} d={0.13} />
    </Board>
  );
}

// Agreement: one clean block made of modules of different sizes, wide,
// tall and small, that fit together exactly. They start scattered around a
// dashed outline of the block and slot into place one after another, so
// the pieces only make sense once they agree.
const U = { x: 110, y: 132, w: 45, h: 36 };
// [col, row, cols wide, rows tall] on a 4x3 grid; together they fill it.
const MODULES: [number, number, number, number][] = [
  [0, 0, 2, 1], [2, 0, 1, 1], [3, 0, 1, 2], [0, 1, 1, 2],
  [1, 1, 2, 1], [1, 2, 1, 1], [2, 2, 1, 1], [3, 2, 1, 1],
];
// Where each one starts, off its slot.
const SCATTER: [number, number][] = [
  [-40, -46], [26, -70], [62, -24], [-62, 8], [8, -38], [-26, 40], [34, 30], [70, 14],
];
// Lower pieces first, then farther from the centre first, so nearer faces
// cover farther ones.
const ORDER = MODULES.map((m, i) => i).sort((a, b) => {
  const [ca, ra, wa, ha] = MODULES[a];
  const [cb, rb, wb, hb] = MODULES[b];
  return rb + hb - (ra + ha) || Math.abs(cb + wb / 2 - 2) - Math.abs(ca + wa / 2 - 2);
});

export function AgreementArt({ play }: { play: boolean }) {
  const done = useDone(play);
  return (
    <Board>
      <Floor y={240} />
      <g style={fade(!done, 900)}>
        <Box x={U.x} y={U.y} w={U.w * 4} h={U.h * 3} d={0.18} ghost />
      </g>
      {ORDER.map((i) => {
        const [c, r, w, h] = MODULES[i];
        const [dx, dy] = SCATTER[i];
        return (
          <g
            key={i}
            style={{
              transform: done ? "none" : `translate(${dx}px, ${dy}px)`,
              transition: `transform 700ms ${EASE} ${i * 110}ms`,
            }}
          >
            <Box x={U.x + c * U.w} y={U.y + r * U.h} w={w * U.w} h={h * U.h} d={0.18} />
          </g>
        );
      })}
    </Board>
  );
}

// Follow-through: a stack with its last slab missing. The slab drops into its
// dashed slot, the slot's outline goes, and one small last detail is set on
// top.
export function FollowThroughArt({ play }: { play: boolean }) {
  const done = useDone(play);
  return (
    <Board>
      <Floor y={252} />
      <Box x={104} y={220} w={192} h={32} d={0.26} />
      <Box x={126} y={188} w={148} h={32} d={0.22} />
      <g style={fade(!done, 600)}>
        <Box x={148} y={156} w={104} h={32} d={0.18} ghost />
      </g>
      <g
        style={{
          opacity: done ? 1 : 0,
          transform: done ? "none" : "translateY(-60px)",
          transition: `transform 650ms ${EASE}, opacity 300ms ${EASE}`,
        }}
      >
        <Box x={148} y={156} w={104} h={32} d={0.18} />
      </g>
      <g
        style={{
          opacity: done ? 1 : 0,
          transform: done ? "none" : "translateY(-14px)",
          transition: `transform 450ms ${EASE} 900ms, opacity 300ms ${EASE} 900ms`,
        }}
      >
        <Box x={226} y={140} w={16} h={16} d={0.1} />
      </g>
    </Board>
  );
}
