"use client";

import type { CSSProperties, ReactNode } from "react";
import { Defs, GrainRect, INK, PAPER, SEL, TILE, tornSquare, useMaterialIds } from "@/components/material-art";

// The hero's visual: a board holding one layered composition in the same
// material kit as the rest of the page (components/material-art.tsx), worked
// on by two collaborators. "Inertia" has the ink square selected. "You" is
// carrying the halftone square into an empty dashed slot, in the same green
// frame a heading word gets when it's dragged, which hints that the page
// itself can be picked up. It settles, fades, and the loop starts over.
//
// The board is 1200x500 and fills a 12:5 panel from sm up; on phones the
// panel is 4:3 and the board is cropped to its middle (x 267-933), where the
// composition sits. Everything that moves is HTML over the board, animated
// with CSS transforms only, so it runs on the compositor and stays cheap on
// phones.

const W = 1200;
const H = 500;
const MOBILE_X0 = 267;
const MOBILE_W = 666;
const YOU = "#22c55e";

// Board point (and optional width) to panel position, for each crop.
function place(x: number, y: number, w?: number): CSSProperties {
  return {
    ["--x-m" as string]: `${((x - MOBILE_X0) / MOBILE_W) * 100}%`,
    ["--x-d" as string]: `${(x / W) * 100}%`,
    ...(w ? { ["--w-m" as string]: `${(w / MOBILE_W) * 100}%`, ["--w-d" as string]: `${(w / W) * 100}%` } : {}),
    top: `${(y / H) * 100}%`,
  };
}

function CursorMark({ name, color }: { name: string; color: string }) {
  return (
    <>
      <svg viewBox="0 0 16 20" className="size-[18px] sm:size-[20px]" aria-hidden="true">
        <path d="M1 1 L1 16 L5 12.2 L8 18.6 L10.8 17.3 L7.9 11 L13.5 11 Z" fill={color} stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
      <span
        className="absolute left-[14px] top-[17px] whitespace-nowrap rounded-[6px] px-1.5 py-[3px] text-[11px] sm:text-[12px] font-medium leading-none tracking-tight text-white"
        style={{ background: color }}
      >
        {name}
      </span>
    </>
  );
}

function Frame({ color, children }: { color: string; children?: ReactNode }) {
  const h = "absolute size-[7px] bg-white";
  return (
    <span className="pointer-events-none absolute inset-0" style={{ boxShadow: `inset 0 0 0 1.5px ${color}` }}>
      {[{ top: -3, left: -3 }, { top: -3, right: -3 }, { bottom: -3, left: -3 }, { bottom: -3, right: -3 }].map((p, i) => (
        <span key={i} className={h} style={{ ...p, border: `1.5px solid ${color}` }} />
      ))}
      {children}
    </span>
  );
}

// The pieces, in board units.
const BLUE = { x: 452, y: 64, w: 196, h: 300 };
const SHEET = { x: 318, y: 214, w: 170, h: 128 };
const INKSQ = { x: 556, y: 196, s: 184 };
const BAR = { x: 600, y: 410, w: 250, h: 36 };
const SLOT = { x: 772, y: 254, s: 132 };
const HELD = { x: 742, y: 70, s: 132 };

export function HeroCanvas({ style }: { style?: CSSProperties }) {
  const ids = useMaterialIds();
  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden rounded-[6px] aspect-[4/3] sm:aspect-[12/5]"
      style={{ background: TILE, ...style }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" fill="none">
        <Defs ids={ids} />
        <defs>
          <radialGradient id={`${ids.grain}-light`} cx="50%" cy="45%" r="65%">
            <stop offset="0" stopColor={PAPER} stopOpacity="0.55" />
            <stop offset="1" stopColor={PAPER} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill={TILE} />
        <rect width={W} height={H} fill={`url(#${ids.grain}-light)`} />
        <rect width={W} height={H} fill={`url(#${ids.grain})`} />

        {/* Back: a sheet on a pixel grid, then the tall torn blue panel. */}
        <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} fill={PAPER} />
        <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} fill={`url(#${ids.fine})`} />
        <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} stroke={INK} strokeWidth={1} />
        <path d={tornRect(BLUE.x, BLUE.y, BLUE.w, BLUE.h, 5)} fill={SEL} />
        <path d={tornRect(BLUE.x, BLUE.y, BLUE.w, BLUE.h, 5)} fill={`url(#${ids.grain})`} />

        {/* Front: the ink square, and a dither bar under the group. */}
        <rect x={INKSQ.x} y={INKSQ.y} width={INKSQ.s} height={INKSQ.s} fill={INK} />
        <GrainRect ids={ids} x={INKSQ.x} y={INKSQ.y} w={INKSQ.s} h={INKSQ.s} />
        <rect x={BAR.x} y={BAR.y} width={BAR.w} height={BAR.h} fill={`url(#${ids.dither})`} />

        {/* The empty slot the held piece is headed for. */}
        <rect x={SLOT.x} y={SLOT.y} width={SLOT.s} height={SLOT.s} stroke={INK} strokeOpacity={0.45} strokeWidth={1.4} strokeDasharray="6 6" />
      </svg>

      {/* Inertia has the ink square selected. */}
      <div className="absolute left-[var(--x-m)] sm:left-[var(--x-d)] w-[var(--w-m)] sm:w-[var(--w-d)] aspect-square" style={place(INKSQ.x, INKSQ.y, INKSQ.s)}>
        <Frame color={SEL}>
          <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-[4px] px-1.5 py-[3px] text-[11px] sm:text-[12px] leading-none text-white" style={{ background: SEL }}>
            184 × 184
          </span>
        </Frame>
        <div className="absolute left-[88%] top-[86%]">
          <div className="hero-cursor hero-cursor--a">
            <CursorMark name="Inertia" color={INK} />
          </div>
        </div>
      </div>

      {/* You, carrying the halftone square into the slot. */}
      <div className="absolute left-[var(--x-m)] sm:left-[var(--x-d)] w-[var(--w-m)] sm:w-[var(--w-d)] aspect-square" style={place(HELD.x, HELD.y, HELD.s)}>
        <div className="hero-held relative h-full w-full">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <pattern id={`${ids.grain}-ht`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <circle cx="2" cy="2" r="1.15" fill={INK} />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={TILE} />
            <rect width="100" height="100" fill={`url(#${ids.grain}-ht)`} />
          </svg>
          <Frame color={YOU} />
          <div className="absolute left-[46%] top-[38%]">
            <CursorMark name="You" color={YOU} />
          </div>
        </div>
      </div>
    </div>
  );
}

// tornSquare for a rectangle: tear a square of the longer side, then scale
// it to the rectangle, so the edge texture stays consistent.
function tornRect(x: number, y: number, w: number, h: number, seed: number) {
  const s = Math.max(w, h);
  const d = tornSquare(0, 0, s, seed);
  return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, px, py) =>
    `${(x + (Number(px) * w) / s).toFixed(1)},${(y + (Number(py) * h) / s).toFixed(1)}`,
  );
}
