"use client";

import type { ReactElement, ReactNode } from "react";
import { INK, TILE } from "@/components/material-art";
import { Box, DASH, Flag, LINE } from "@/components/line-art";

// Essay covers, in the hero staircase's line style (components/line-art.tsx):
// monoline boxes in perspective, dashed ghosts and guides, on the tile. One
// drawing per post, used in two places: full width as the post page header
// (1200x630), and as the homepage Our thoughts card, where the 4:3 tile
// shows the middle of the same board (about x 180-1020). Each drawing is
// composed on the line kit's 400x300 board and set in that middle at 1.8x,
// centred on where the drawings sit (around 200, 190), so it reads in both. Each one acts out its essay's idea.

const W = 1200;
const H = 630;

const FONT = { fontFamily: "var(--font-satoshi), sans-serif", fontWeight: 450 } as const;

function Label({ x, y, children, anchor = "middle", size = 12 }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; size?: number }) {
  return (
    <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" fontSize={size} fill={INK} style={FONT}>
      {children}
    </text>
  );
}

// A dimension line with end ticks and its value, as redlines are drawn.
function Dim({ x1, y1, x2, y2, value, lx, ly }: { x1: number; y1: number; x2: number; y2: number; value: string; lx: number; ly: number }) {
  const vertical = x1 === x2;
  const t = 5;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} {...LINE} />
      {vertical ? (
        <>
          <line x1={x1 - t} y1={y1} x2={x1 + t} y2={y1} {...LINE} />
          <line x1={x2 - t} y1={y2} x2={x2 + t} y2={y2} {...LINE} />
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 - t} x2={x1} y2={y1 + t} {...LINE} />
          <line x1={x2} y1={y2 - t} x2={x2} y2={y2 + t} {...LINE} />
        </>
      )}
      <Label x={lx} y={ly} size={11}>{value}</Label>
    </g>
  );
}

// consistency-beats-novelty: fifteen identical pieces, and the dashed frame
// is around the whole set, because the system is what holds.
function Coherence() {
  const cells: [number, number][] = [];
  for (let r = 2; r >= 0; r--) for (const c of [0, 4, 1, 3, 2]) cells.push([c, r]);
  return (
    <>
      {cells.map(([c, r]) => (
        <Box key={`${c}-${r}`} x={100 + c * 40} y={138 + r * 34} w={40} h={34} d={0.12} />
      ))}
      <rect x={88} y={100} width={232} height={148} {...DASH} />
    </>
  );
}

// copy-is-design: the same piece twice. The words are the only difference,
// and they change what it is.
function Tone() {
  return (
    <>
      <Box x={70} y={168} w={120} h={72} d={0.16} />
      <Box x={210} y={168} w={120} h={72} d={0.16} />
      <Label x={130} y={204}>Submit</Label>
      <Label x={270} y={204}>Start a project</Label>
    </>
  );
}

// design-systems-that-scale: three pieces on the left make every structure
// on the right.
function FewerComponents() {
  return (
    <>
      <Box x={40} y={222} w={56} h={18} d={0.14} />
      <Box x={104} y={206} w={34} h={34} d={0.12} />
      <Box x={146} y={186} w={22} h={54} d={0.1} />
      <line x1={180} y1={214} x2={200} y2={214} {...DASH} />
      <polyline points="195,209 201,214 195,219" {...LINE} />
      <Box x={290} y={222} w={56} h={18} d={0.14} />
      <Box x={290} y={204} w={56} h={18} d={0.14} />
      <Box x={301} y={170} w={34} h={34} d={0.12} />
      <Box x={212} y={222} w={56} h={18} d={0.14} />
      <Box x={223} y={188} w={34} h={34} d={0.12} />
      <Box x={229} y={134} w={22} h={54} d={0.1} />
    </>
  );
}

// someone-still-has-to-pick: forty options laid out as a field of low,
// faint blocks, and one of them standing up out of it, solid: the one
// somebody chose. Rows run back to front so nearer blocks cover farther ones.
function Narrowing() {
  const cols = 8;
  const rows = 5;
  const pick = { c: 5, r: 2 };
  const blocks: ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 58 + c * 36;
      const y = 150 + r * 22;
      blocks.push(
        c === pick.c && r === pick.r ? (
          <Box key={`${c}-${r}`} x={x} y={y - 70} w={26} h={80} d={0.045} />
        ) : (
          <Box key={`${c}-${r}`} x={x} y={y} w={26} h={8} d={0.045} light />
        )
      );
    }
  }
  return <>{blocks}</>;
}

// speed-is-a-feature: where a page's weight goes. One piece is most of it,
// with the size it should be dashed on its face.
function Weight() {
  return (
    <>
      <Box x={44} y={220} w={24} h={20} d={0.1} light />
      <Box x={76} y={214} w={26} h={26} d={0.1} light />
      <Box x={110} y={222} w={22} h={18} d={0.1} light />
      <Box x={330} y={222} w={20} h={18} d={0.1} light />
      <Box x={298} y={218} w={24} h={22} d={0.1} light />
      <Box x={148} y={136} w={134} h={104} d={0.18} />
      <rect x={186} y={196} width={58} height={44} {...DASH} />
      <Label x={160} y={152} anchor="start" size={11}>1.8 MB</Label>
    </>
  );
}

// taste-is-trained: a staircase of reps. The first steps are only dashed
// tries, the next ones faint, the last ones solid, with the flag on top:
// the eye is built one step at a time.
const REPS = [22, 40, 58, 76, 94, 112];
function YearApart() {
  return (
    <>
      {REPS.map((h, i) => {
        const b = { x: 86 + i * 38, y: 240 - h, w: 38, h, d: 0.05 };
        return i < 2 ? <Box key={i} {...b} ghost /> : i < 4 ? <Box key={i} {...b} light /> : <Box key={i} {...b} />;
      })}
      <Flag x={86 + 5 * 38 + 19} y={128} h={44} />
    </>
  );
}

// most-projects-fail-before-figma: a tower on a brief that's slightly off.
// The dashed plumb line is where it should stand; each level above the base
// drifts a little further from it, so the first mistake is the one that
// grows. Drawn bottom up, so each level sits over the one below.
const TOWER = [
  { dx: 6, w: 112, h: 26 },
  { dx: 12, w: 96, h: 30 },
  { dx: 22, w: 84, h: 30 },
  { dx: 36, w: 72, h: 30 },
  { dx: 54, w: 60, h: 28 },
];
function Brief() {
  const cx = 186;
  let top = 240;
  return (
    <>
      {TOWER.map((t, i) => {
        top -= t.h;
        return <Box key={i} x={cx - t.w / 2 + t.dx} y={top} w={t.w} h={t.h} d={0.05} />;
      })}
      <line x1={cx} y1={60} x2={cx} y2={256} {...DASH} />
    </>
  );
}

// the-difference-you-feel: the spacing nobody sees, redlined.
function Redlines() {
  return (
    <>
      <Box x={90} y={170} w={90} h={70} d={0.14} />
      <Box x={222} y={170} w={90} h={70} d={0.14} />
      <Dim x1={180} y1={204} x2={222} y2={204} value="42" lx={201} ly={192} />
      <Dim x1={330} y1={170} x2={330} y2={240} value="70" lx={346} ly={205} />
    </>
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
// 4:3 on the homepage card (the board is cropped to its middle there).
export function MaterialCover({ slug, className = "" }: { slug: string; className?: string }) {
  const Cover = COVERS[slug];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} fill="none" aria-hidden="true">
      <rect width={W} height={H} fill={TILE} />
      {Cover && (
        <g transform="translate(240 -27) scale(1.8)">
          <Cover />
        </g>
      )}
    </svg>
  );
}
