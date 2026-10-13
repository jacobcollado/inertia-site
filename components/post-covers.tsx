"use client";

import { useId, type ReactElement } from "react";
import { SIGNAL, TILE } from "@/components/material-art";
import { Box, Flag, LINE } from "@/components/line-art";

// Essay covers, in the hero staircase's line style (components/line-art.tsx):
// monoline boxes in perspective on the tile, faint lines for what's set
// aside and no dashes, which flatten the perspective. One
// drawing per post, used in two places: full width as the post page header
// (1200x630), and as the homepage Our thoughts card, where the 4:3 tile
// shows the middle of the same board (about x 180-1020). Each drawing is
// composed on the line kit's 400x300 board and set in that middle at 1.8x,
// centred on where the drawings sit (around 200, 190), so it reads in both. Each one acts out its essay's idea.

const W = 1200;
const H = 630;

// Faint, solid, for what a drawing sets aside. No dashes: they break the
// perspective, so secondary lines are just lighter.
const SOFT = { ...LINE, strokeOpacity: 0.32 };

// consistency-beats-novelty: the same page, again and again, running back
// into the distance. Each one has the same header, picture and lines in the
// same places; the tenth is drawn exactly like the first.
const RUN_FROM: [number, number] = [56, 238];
const RUN_TO: [number, number] = [352, 158];
function Coherence() {
  const pieces = Array.from({ length: 7 }, (_, i) => Math.pow(0.76, i));
  const at = (s: number): [number, number] => [RUN_TO[0] + (RUN_FROM[0] - RUN_TO[0]) * s, RUN_TO[1] + (RUN_FROM[1] - RUN_TO[1]) * s];
  return (
    <>
      {[...pieces].reverse().map((s) => {
        const [x, foot] = at(s);
        const w = 62 * s;
        const h = 86 * s;
        const y = foot - h;
        return (
          <g key={s}>
            <Box x={x} y={y} w={w} h={h} d={0.06} />
            <line x1={x + 8 * s} y1={y + 11 * s} x2={x + 30 * s} y2={y + 11 * s} {...LINE} />
            <rect x={x + 8 * s} y={y + 20 * s} width={46 * s} height={28 * s} {...LINE} />
            <line x1={x + 8 * s} y1={y + 58 * s} x2={x + 50 * s} y2={y + 58 * s} {...SOFT} />
            <line x1={x + 8 * s} y1={y + 67 * s} x2={x + 38 * s} y2={y + 67 * s} {...SOFT} />
          </g>
        );
      })}
    </>
  );
}

// copy-is-design: the words themselves, built. A pair of quote marks cut
// from the material and set on a plinth like any other piece.
const QUOTE = "M -20 0 A 20 20 0 0 1 20 0 C 20 22 8 40 -10 47 C 0 37 5 28 4 19.6 A 20 20 0 0 1 -20 0 Z";
function Tone() {
  const marks = [176, 232];
  return (
    <>
      <Box x={112} y={236} w={176} h={20} d={0.1} />
      {marks.map((x) => (
        <g key={x}>
          <path d={QUOTE} transform={`translate(${x + 7} ${170 - 9})`} fill={TILE} {...LINE} />
          <path d={QUOTE} transform={`translate(${x} ${170})`} fill={TILE} {...LINE} />
        </g>
      ))}
    </>
  );
}

// design-systems-that-scale: a wall of identical modules, and the one piece
// that went in under a deadline: the wrong size, jammed into the gap, askew.
const MODULE = 36;
function FewerComponents() {
  const cells: [number, number][] = [];
  for (let r = 0; r < 3; r++) for (const c of [0, 3, 1, 2]) if (!(r === 2 && c === 3)) cells.push([c, r]);
  return (
    <>
      {cells.map(([c, r]) => (
        <Box key={`${c}-${r}`} x={128 + c * MODULE} y={244 - (r + 1) * MODULE} w={MODULE} h={MODULE} d={0.1} />
      ))}
      <g transform="rotate(9 258 151)">
        <Box x={228} y={140} w={60} h={22} d={0.1} />
      </g>
    </>
  );
}

// someone-still-has-to-pick: forty options in rows, all alike, and one
// lifted clean out of the set with its flag up: the one someone chose. Its
// place in the rows is left empty.
function Narrowing() {
  const cols = 10;
  const rows = 4;
  const pick = { c: 6, r: 1 };
  const cell = (c: number, r: number) => ({ x: 52 + c * 30, y: 176 + r * 26, w: 22, h: 12 });
  const p = cell(pick.c, pick.r);
  const lifted = { ...p, y: p.y - 92 };
  const blocks: ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    for (const c of Array.from({ length: cols }, (_, i) => i).sort((a, b) => Math.abs(b * 30 + 63 - 230) - Math.abs(a * 30 + 63 - 230))) {
      if (c === pick.c && r === pick.r) {
        blocks.push(<rect key="slot" x={p.x} y={p.y} width={p.w} height={p.h} {...SOFT} />);
        continue;
      }
      blocks.push(<Box key={`${c}-${r}`} {...cell(c, r)} d={0.04} light />);
    }
  }
  return (
    <>
      {blocks}
      <Box {...lifted} d={0.04} />
      <Flag x={lifted.x + lifted.w / 2} y={lifted.y - 3} h={34} />
    </>
  );
}

// speed-is-a-feature: a page that's arrived except for its biggest piece,
// still an empty frame with a spinner turning in it.
function Weight() {
  return (
    <>
      <Box x={110} y={118} w={180} h={142} d={0.06} />
      <line x1={124} y1={134} x2={196} y2={134} {...LINE} />
      <line x1={250} y1={134} x2={276} y2={134} {...LINE} />
      <rect x={124} y={146} width={152} height={70} {...SOFT} />
      <path d="M 200 171 A 10 10 0 1 1 190 181" {...LINE} stroke={SIGNAL} />
      <line x1={124} y1={230} x2={236} y2={230} {...LINE} />
      <line x1={124} y1={242} x2={200} y2={242} {...LINE} />
    </>
  );
}

// taste-is-trained: the same stack, twice, on one slab. A year ago, faint
// and sloppy, every piece a little off. Now, square and true, with its flag.
function YearApart() {
  return (
    <>
      <Box x={66} y={240} w={268} h={14} d={0.06} />
      <g transform="rotate(-3 132 240)">
        <Box x={98} y={206} w={68} h={34} d={0.07} light />
      </g>
      <g transform="rotate(5 136 206)">
        <Box x={110} y={178} w={52} h={28} d={0.07} light />
      </g>
      <g transform="rotate(-7 128 178)">
        <Box x={110} y={156} w={38} h={22} d={0.07} light />
      </g>
      <Box x={234} y={206} w={68} h={34} d={0.07} />
      <Box x={242} y={178} w={52} h={28} d={0.07} />
      <Box x={249} y={156} w={38} h={22} d={0.07} />
      <Flag x={268} y={148} h={38} />
    </>
  );
}

// most-projects-fail-before-figma: a column built true, block on block, on
// a foundation set slightly off. One small wedge at the bottom (the first
// conversation) tips everything above it, and the higher it goes the
// further it leans from the upright beside it.
function Brief() {
  const left = 168;
  const w = 64;
  const foot = 240;
  const tilt = 8;
  const rise = w * Math.sin((tilt * Math.PI) / 180);
  return (
    <>
      <Box x={84} y={246} w={232} h={12} d={0.06} />
      <line x1={left + w / 2} y1={foot} x2={left + w / 2} y2={96} {...SOFT} />
      <g transform={`rotate(-${tilt} ${left} ${foot})`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Box key={i} x={left} y={foot - (i + 1) * 26} w={w} h={26} d={0.06} />
        ))}
      </g>
      <polygon points={`${left + w * 0.45},${foot} ${left + w},${foot} ${left + w},${foot - rise}`} fill={SIGNAL} {...LINE} stroke={SIGNAL} />
    </>
  );
}

// the-difference-you-feel: a lid that sits a hair proud of its box. From a
// step back it's just a box; under the loupe, held right over the corner,
// the overhang shows, measured.
function Redlines() {
  const id = `loupe-${useId().replace(/:/g, "")}`;
  const at: [number, number] = [251, 198];
  const lens = at;
  const r = 40;
  const k = 4;
  const mx = (x: number) => lens[0] + (x - at[0]) * k;
  const my = (y: number) => lens[1] + (y - at[1]) * k;
  const lidEdge = mx(252);
  const boxEdge = mx(250);
  return (
    <g transform="translate(-34 -6)">
      <Box x={130} y={198} w={120} h={52} d={0.1} />
      <Box x={128} y={182} w={124} h={16} d={0.1} />
      <clipPath id={id}>
        <circle cx={lens[0]} cy={lens[1]} r={r} />
      </clipPath>
      <circle cx={lens[0]} cy={lens[1]} r={r} fill={TILE} {...LINE} />
      <g clipPath={`url(#${id})`}>
        <line x1={lens[0] - r} y1={my(198)} x2={lidEdge} y2={my(198)} {...LINE} />
        <line x1={lens[0] - r} y1={my(182)} x2={lidEdge} y2={my(182)} {...LINE} />
        <line x1={lidEdge} y1={my(198)} x2={lidEdge} y2={lens[1] - r} {...LINE} />
        <line x1={boxEdge} y1={my(198)} x2={boxEdge} y2={lens[1] + r} {...LINE} />
        <line x1={boxEdge} y1={lens[1] + 16} x2={lidEdge} y2={lens[1] + 16} {...LINE} stroke={SIGNAL} />
        <line x1={boxEdge} y1={lens[1] + 12} x2={boxEdge} y2={lens[1] + 20} {...LINE} stroke={SIGNAL} />
        <line x1={lidEdge} y1={lens[1] + 12} x2={lidEdge} y2={lens[1] + 20} {...LINE} stroke={SIGNAL} />
      </g>
      <line x1={lens[0] + r * 0.71} y1={lens[1] + r * 0.71} x2={lens[0] + r * 1.4} y2={lens[1] + r * 1.4} {...LINE} />
    </g>
  );
}

const COVERS: Record<string, () => ReactElement> = {
  "consistency-beats-novelty": Coherence,
  "copy-is-design": Tone,
  "design-systems-that-scale": FewerComponents,
  "someone-still-has-to-pick": Narrowing,
  "speed-is-a-feature": Weight,
  "taste-is-trained": YearApart,
  "most-projects-fail-before-figma": Brief,
  "the-difference-you-feel": Redlines,
};

// Fills its parent. The parent sets the shape: 1200/630 on the post page,
// 4:3 on the homepage card (the board is cropped to its middle there). With
// `fit`, the whole board is shown inside the parent instead of cropped to
// fill it, for wide, short boxes like the journal's bento cells.
export function MaterialCover({ slug, className = "", fit = false }: { slug: string; className?: string; fit?: boolean }) {
  const Cover = COVERS[slug];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio={fit ? "xMidYMid meet" : "xMidYMid slice"} className={`absolute inset-0 h-full w-full ${className}`} fill="none" aria-hidden="true">
      <rect width={W} height={H} fill={TILE} />
      {Cover && (
        <g transform="translate(240 -27) scale(1.8)">
          <Cover />
        </g>
      )}
    </svg>
  );
}
