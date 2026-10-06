"use client";

import type { CSSProperties, ReactNode } from "react";
import { Defs, GrainRect, INK, PAPER, SEL, TILE, tornSquare, useMaterialIds, type Ids } from "@/components/material-art";

// The hero's visual: a website being made, drawn loosely in the same
// material kit as the rest of the page (components/material-art.tsx). A
// browser window holds a page of blocks (nav, headline, hero image, a row of
// cards), with the same page on a phone to its left and its code to its
// right. Two collaborators work on it. "Inertia" has the headline selected.
// "You" is carrying the last card into its empty dashed slot, in the same
// green frame a heading word gets when it's dragged, which hints that the
// page itself can be picked up. It settles, fades, and the loop starts over.
//
// The board is 1200x500 and fills a 12:5 panel from sm up; on phones the
// panel is 4:3 and the board is cropped to its middle (x 267-933), which is
// the browser window. Everything that moves is HTML over the board, animated
// with CSS transforms only, so it runs on the compositor and stays cheap on
// phones.

const W = 1200;
const H = 500;
const MOBILE_X0 = 267;
const MOBILE_W = 666;
const YOU = "#22c55e";
const MUTE = "rgba(26,26,26,0.22)";

// Board rect to panel position and size, for each crop.
function place(x: number, y: number, w: number, h: number): CSSProperties {
  return {
    ["--x-m" as string]: `${((x - MOBILE_X0) / MOBILE_W) * 100}%`,
    ["--x-d" as string]: `${(x / W) * 100}%`,
    ["--w-m" as string]: `${(w / MOBILE_W) * 100}%`,
    ["--w-d" as string]: `${(w / W) * 100}%`,
    top: `${(y / H) * 100}%`,
    height: `${(h / H) * 100}%`,
  };
}

const PLACED = "absolute left-[var(--x-m)] sm:left-[var(--x-d)] w-[var(--w-m)] sm:w-[var(--w-d)]";

// Ink flips light in dark mode, so its label text and outline flip with
// the paper; the green cursor keeps white text either way.
function CursorMark({ name, color, text = "#fff" }: { name: string; color: string; text?: string }) {
  return (
    <>
      <svg viewBox="0 0 16 20" className="size-[18px] sm:size-[20px]" aria-hidden="true">
        <path d="M1 1 L1 16 L5 12.2 L8 18.6 L10.8 17.3 L7.9 11 L13.5 11 Z" fill={color} stroke={PAPER} strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
      <span
        className="absolute left-[14px] top-[17px] whitespace-nowrap rounded-[6px] px-1.5 py-[3px] text-[11px] sm:text-[12px] font-medium leading-none tracking-tight"
        style={{ background: color, color: text }}
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
const WIN = { x: 300, y: 48, w: 600 };
const PAD = 332; // page content's left edge inside the window
const HEAD = { x: 324, y: 126, w: 232, h: 66 };
const IMG = { x: 600, y: 112, w: 268, h: 168 };
const CARD = { y: 310, w: 164, h: 130, xs: [332, 518, 704] };
const HELD = { x: 744, y: 196 };
const PHONE = { x: 112, y: 104, w: 124, h: 262 };
const CODE = { x: 962, y: 112, w: 176, h: 240 };

// A card on the page: a picture area over two lines of copy.
function Card({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <g>
      <rect x={x} y={y} width={CARD.w} height={CARD.h} fill={PAPER} stroke={INK} strokeWidth={1} />
      <rect x={x} y={y} width={CARD.w} height={80} fill={fill} />
      <line x1={x} y1={y + 80} x2={x + CARD.w} y2={y + 80} stroke={INK} strokeWidth={1} />
      <rect x={x + 12} y={y + 94} width={96} height={7} fill={INK} />
      <rect x={x + 12} y={y + 108} width={64} height={5} fill={MUTE} />
    </g>
  );
}

// The page in the browser window.
function Page({ ids }: { ids: Ids }) {
  const top = WIN.y + 30;
  return (
    <g>
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={H} fill={PAPER} stroke={INK} strokeWidth={1} />
      <GrainRect ids={ids} x={WIN.x} y={WIN.y} w={WIN.w} h={H} />
      {/* Window chrome. */}
      <line x1={WIN.x} y1={top} x2={WIN.x + WIN.w} y2={top} stroke={INK} strokeWidth={1} />
      {[318, 332, 346].map((cx) => (
        <circle key={cx} cx={cx} cy={WIN.y + 15} r={4} stroke={INK} strokeWidth={1} />
      ))}
      <rect x={520} y={WIN.y + 8} width={160} height={14} rx={7} fill={TILE} />

      {/* Nav. */}
      <rect x={PAD} y={96} width={12} height={12} fill={INK} />
      <rect x={PAD + 18} y={99} width={56} height={6} fill={INK} />
      <rect x={760} y={99} width={22} height={5} fill={MUTE} />
      <rect x={792} y={99} width={22} height={5} fill={MUTE} />
      <rect x={828} y={94} width={40} height={15} fill={INK} />

      {/* Headline, subline and button. */}
      <rect x={PAD} y={134} width={214} height={20} fill={INK} />
      <rect x={PAD} y={162} width={166} height={20} fill={INK} />
      <rect x={PAD} y={214} width={196} height={6} fill={MUTE} />
      <rect x={PAD} y={226} width={150} height={6} fill={MUTE} />
      <rect x={PAD} y={248} width={78} height={24} rx={3} fill={INK} />
      <rect x={PAD + 16} y={258} width={46} height={4} fill={PAPER} />

      {/* Hero image. */}
      <path d={tornRect(IMG.x, IMG.y, IMG.w, IMG.h, 5)} fill={SEL} />
      <path d={tornRect(IMG.x, IMG.y, IMG.w, IMG.h, 5)} fill={`url(#${ids.grain})`} />
      <rect x={IMG.x + 150} y={IMG.y + 88} width={92} height={60} fill={`url(#${ids.halftone})`} opacity={0.5} />

      {/* Cards, the last one an empty slot for the card You is carrying. */}
      <Card x={CARD.xs[0]} y={CARD.y} fill={`url(#${ids.halftone})`} />
      <Card x={CARD.xs[1]} y={CARD.y} fill={INK} />
      <rect x={CARD.xs[2]} y={CARD.y} width={CARD.w} height={CARD.h} stroke={INK} strokeOpacity={0.45} strokeWidth={1.4} strokeDasharray="6 6" />

      {/* The page carries on past the fold. */}
      <rect x={PAD} y={470} width={536} height={22} fill={`url(#${ids.dither})`} />
    </g>
  );
}

// The same page laid out for a phone.
function Phone({ ids }: { ids: Ids }) {
  const { x, y, w, h } = PHONE;
  const px = x + 12;
  const pw = w - 24;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={16} fill={PAPER} stroke={INK} strokeWidth={1} />
      <rect x={x + w / 2 - 18} y={y + 9} width={36} height={8} rx={4} fill={INK} />
      <rect x={px} y={y + 30} width={8} height={8} fill={INK} />
      <rect x={px + w - 36} y={y + 32} width={12} height={4} fill={INK} />
      <path d={tornRect(px, y + 50, pw, 64, 11)} fill={SEL} />
      <path d={tornRect(px, y + 50, pw, 64, 11)} fill={`url(#${ids.grain})`} />
      <rect x={px} y={y + 126} width={pw - 8} height={10} fill={INK} />
      <rect x={px} y={y + 141} width={pw - 30} height={10} fill={INK} />
      <rect x={px} y={y + 160} width={pw - 14} height={4} fill={MUTE} />
      <rect x={px} y={y + 178} width={44} height={14} rx={2} fill={INK} />
      <rect x={px} y={y + 204} width={pw} height={46} fill={`url(#${ids.halftone})`} />
      <rect x={px} y={y + 204} width={pw} height={46} stroke={INK} strokeWidth={1} />
    </g>
  );
}

// The page's code: indented lines, with the headline's line picked out in
// the selection colour.
const CODE_LINES: [number, number, boolean?][] = [
  [0, 70], [1, 96], [2, 62], [2, 110, true], [2, 84], [1, 40], [1, 104], [2, 72], [2, 90], [1, 50], [0, 58],
];

function Code({ ids }: { ids: Ids }) {
  const { x, y, w, h } = CODE;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={INK} />
      <GrainRect ids={ids} x={x} y={y} w={w} h={h} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x + 14 + i * 11} cy={y + 13} r={3} fill={PAPER} opacity={0.35} />
      ))}
      {CODE_LINES.map(([indent, len, hot], i) => {
        const ly = y + 38 + i * 17;
        return (
          <g key={i}>
            {hot && <rect x={x} y={ly - 5} width={w} height={15} fill={SEL} opacity={0.22} />}
            <rect x={x + 10} y={ly} width={8} height={5} fill={PAPER} opacity={0.2} />
            <rect x={x + 26 + indent * 12} y={ly} width={len - indent * 12} height={5} fill={hot ? SEL : PAPER} opacity={hot ? 1 : 0.6} />
          </g>
        );
      })}
    </g>
  );
}

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

        <Phone ids={ids} />
        <Code ids={ids} />
        <Page ids={ids} />
      </svg>

      {/* Inertia has the headline selected. */}
      <div className={PLACED} style={place(HEAD.x, HEAD.y, HEAD.w, HEAD.h)}>
        <Frame color={SEL}>
          <span className="absolute left-0 top-full mt-1.5 whitespace-nowrap rounded-[4px] px-1.5 py-[3px] text-[11px] sm:text-[12px] leading-none text-white" style={{ background: SEL }}>
            Heading
          </span>
        </Frame>
        <div className="absolute left-[92%] top-[78%]">
          <div className="hero-cursor hero-cursor--a">
            <CursorMark name="Inertia" color={INK} text={PAPER} />
          </div>
        </div>
      </div>

      {/* You, carrying the last card into its slot. */}
      <div className={PLACED} style={place(HELD.x, HELD.y, CARD.w, CARD.h)}>
        <div className="hero-held relative h-full w-full">
          <svg viewBox={`0 0 ${CARD.w} ${CARD.h}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
            <rect width={CARD.w} height={CARD.h} fill={PAPER} />
            <rect width={CARD.w} height={80} fill={`url(#${ids.fine})`} />
            <rect x={44} y={18} width={76} height={44} fill={SEL} />
            <rect x={44} y={18} width={76} height={44} fill={`url(#${ids.grain})`} />
            <line x1={0} y1={80} x2={CARD.w} y2={80} stroke={INK} strokeWidth={1} />
            <rect x={12} y={94} width={96} height={7} fill={INK} />
            <rect x={12} y={108} width={64} height={5} fill={MUTE} />
          </svg>
          <Frame color={YOU} />
          <div className="absolute left-[46%] top-[40%]">
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
