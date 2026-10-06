"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Defs, Framing, INK, PAPER, SEL, useMaterialIds, type Ids } from "@/components/material-art";

// Illustrations for the homepage's "How we think about execution"
// principles, in the same material kit as the What we do drawings
// (components/material-art.tsx): grain, halftone, dither, a pixel grid and
// the shared construction framing. Each one acts its principle out when
// `play` turns on, and resets when it turns off so it plays again next time.

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SPRING = "cubic-bezier(0.34, 1.4, 0.64, 1)";

// Flips to true a beat after `play` does, so the starting state is seen first.
function useDone(play: boolean, delay = 450) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!play) {
      setDone(false);
      return;
    }
    const t = setTimeout(() => setDone(true), delay);
    return () => clearTimeout(t);
  }, [play, delay]);
  return done;
}

// SVG groups animate with CSS transforms around their own centre.
const own: CSSProperties = { transformBox: "fill-box", transformOrigin: "center" };

function Board({ ids, children }: { ids: Ids; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" fill="none" aria-hidden="true">
      <Defs ids={ids} />
      <Framing ids={ids} />
      {children}
    </svg>
  );
}

// Restraint: a crowded board of pieces, each in a different finish, clears
// away one at a time until only the pair that matters is left.
export function RestraintArt({ play }: { play: boolean }) {
  const ids = useMaterialIds();
  const done = useDone(play);
  const extras: { x: number; y: number; s: number; fill: string; dashed?: boolean }[] = [
    { x: 74, y: 70, s: 44, fill: `url(#${ids.halftone})` },
    { x: 304, y: 64, s: 32, fill: `url(#${ids.fine})` },
    { x: 86, y: 196, s: 40, fill: "none", dashed: true },
    { x: 296, y: 196, s: 38, fill: `url(#${ids.dither})` },
    { x: 238, y: 222, s: 22, fill: SEL },
    { x: 120, y: 132, s: 18, fill: INK },
    { x: 262, y: 44, s: 16, fill: INK },
  ];
  return (
    <Board ids={ids}>
      {extras.map((e, i) => (
        <g
          key={i}
          style={{
            ...own,
            opacity: done ? 0 : 1,
            transform: done ? "scale(0.6)" : "none",
            transition: `opacity 360ms ease ${i * 110}ms, transform 500ms ${EASE} ${i * 110}ms`,
          }}
        >
          <rect
            x={e.x}
            y={e.y}
            width={e.s}
            height={e.s}
            fill={e.fill}
            stroke={e.dashed ? INK : undefined}
            strokeOpacity={0.5}
            strokeDasharray={e.dashed ? "4 4" : undefined}
          />
        </g>
      ))}
      <rect x={188} y={86} width={96} height={96} fill={SEL} filter={`url(#${ids.grain})`} />
      <rect x={150} y={134} width={80} height={80} fill={INK} filter={`url(#${ids.grain})`} />
    </Board>
  );
}

// Agreement: six pieces that each made their own call (finish, size, tilt,
// position) snap into one consistent set.
const CELLS = [
  { fill: "halftone", rot: -9, sc: 0.8, x: -6, y: 8 },
  { fill: "blue", rot: 6, sc: 1.15, x: 5, y: -6 },
  { fill: "outline", rot: -3, sc: 0.9, x: 8, y: 4 },
  { fill: "dither", rot: 10, sc: 1.1, x: -8, y: -5 },
  { fill: "ink", rot: -5, sc: 0.72, x: 4, y: 9 },
  { fill: "fine", rot: 4, sc: 1.05, x: -5, y: -7 },
] as const;

export function AgreementArt({ play }: { play: boolean }) {
  const ids = useMaterialIds();
  const done = useDone(play);
  const s = 56;
  const gap = 16;
  const x0 = 200 - (s * 3 + gap * 2) / 2;
  const y0 = 150 - (s * 2 + gap) / 2;
  const own_fill = (f: (typeof CELLS)[number]["fill"]) =>
    f === "halftone" ? `url(#${ids.halftone})` : f === "dither" ? `url(#${ids.dither})` : f === "fine" ? `url(#${ids.fine})` : f === "blue" ? SEL : f === "ink" ? INK : "none";
  return (
    <Board ids={ids}>
      {CELLS.map((c, i) => {
        const x = x0 + (i % 3) * (s + gap);
        const y = y0 + Math.floor(i / 3) * (s + gap);
        const t = `700ms ${SPRING} ${i * 70}ms`;
        return (
          <g
            key={i}
            style={{
              ...own,
              transform: done ? "none" : `translate(${c.x}px, ${c.y}px) rotate(${c.rot}deg) scale(${c.sc})`,
              transition: `transform ${t}`,
            }}
          >
            <rect x={x} y={y} width={s} height={s} fill={PAPER} />
            <rect
              x={x}
              y={y}
              width={s}
              height={s}
              fill={own_fill(c.fill)}
              stroke={c.fill === "outline" ? INK : undefined}
              strokeOpacity={0.5}
              strokeDasharray={c.fill === "outline" ? "4 4" : undefined}
              style={{ opacity: done ? 0 : 1, transition: `opacity 400ms ease ${i * 70}ms` }}
            />
            <rect
              x={x}
              y={y}
              width={s}
              height={s}
              fill={INK}
              filter={`url(#${ids.grain})`}
              style={{ opacity: done ? 1 : 0, transition: `opacity 400ms ease ${i * 70 + 120}ms` }}
            />
          </g>
        );
      })}
    </Board>
  );
}

// Follow-through: a square fills in pixel by pixel. The last pixel waits in
// blue a beat longer, because the last detail always does, then settles.
const GRID = 6;
const CELL = 24;

export function FollowThroughArt({ play }: { play: boolean }) {
  const ids = useMaterialIds();
  const [filled, setFilled] = useState(0);
  const total = GRID * GRID;

  useEffect(() => {
    if (!play) {
      setFilled(0);
      return;
    }
    const timers = Array.from({ length: total }, (_, i) =>
      setTimeout(() => setFilled(i + 1), 400 + i * 55 + (i === total - 1 ? 900 : 0)),
    );
    return () => timers.forEach(clearTimeout);
  }, [play, total]);

  const x0 = 200 - (GRID * CELL) / 2;
  const y0 = 150 - (GRID * CELL) / 2;
  // Fill order snakes row by row, like a scan.
  const order = (i: number) => {
    const row = Math.floor(i / GRID);
    const col = row % 2 === 0 ? i % GRID : GRID - 1 - (i % GRID);
    return { x: x0 + col * CELL, y: y0 + row * CELL };
  };
  const last = order(total - 1);
  const waiting = filled === total - 1;
  return (
    <Board ids={ids}>
      <rect x={x0} y={y0} width={GRID * CELL} height={GRID * CELL} fill={PAPER} />
      <rect x={x0} y={y0} width={GRID * CELL} height={GRID * CELL} fill={`url(#${ids.fine})`} opacity={0.6} />
      {Array.from({ length: total }, (_, i) => {
        const { x, y } = order(i);
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={CELL}
            height={CELL}
            fill={INK}
            style={{ opacity: filled > i ? 1 : 0, transition: "opacity 160ms ease" }}
          />
        );
      })}
      {/* The last detail, asking for attention until it's done. */}
      <rect
        x={last.x}
        y={last.y}
        width={CELL}
        height={CELL}
        fill={SEL}
        style={{ opacity: waiting ? 1 : 0, transition: "opacity 200ms ease" }}
      />
      {/* Once complete, one solid piece: no seams between the pixels. */}
      <rect
        x={x0}
        y={y0}
        width={GRID * CELL}
        height={GRID * CELL}
        fill={INK}
        filter={`url(#${ids.grain})`}
        style={{ opacity: filled === total ? 1 : 0, transition: "opacity 400ms ease 150ms" }}
      />
      <rect x={x0} y={y0} width={GRID * CELL} height={GRID * CELL} fill="none" stroke={INK} strokeWidth={1} />
    </Board>
  );
}
