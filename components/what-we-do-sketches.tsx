"use client";

import type { CSSProperties, ReactElement } from "react";
import { Box, DASH, EASE, Flag, LINE, Trace, enter, raise } from "@/components/line-art";
import { INK, SIGNAL, TILE } from "@/components/material-art";

// The What we do drawings, in the hero staircase's line style
// (components/line-art.tsx). One per service, each building itself once
// `play` turns on, starting `delay` ms in, so the four play in order. With
// `still` (reduced motion) each shows built.
//
// Audit: three pieces on a slab, each a little wrong: one leans, one's top
//   half has slid off its base, one hangs off the edge. A scan passes and rings each flaw, numbered by
//   what matters most, not left to right.
// Identity: the mark drawn onto one block, then carried onto every smaller
//   piece that lands beside it, the same at every size.
// Build: the approved page as a dashed outline; the built one rises into it
//   exactly and its layout is traced over the dashes until none show.
// Partnership: the launched piece with its flag, then what's added after:
//   a new wing, a campaign on top, a small fix, and the next one outlined.

type Anim = { play: boolean; delay: number; still: boolean };

const fade = (on: boolean, delay: number, ms = 500): CSSProperties => ({
  opacity: on ? 1 : 0,
  transition: `opacity ${ms}ms ${EASE} ${delay}ms`,
});

// --- Audit -------------------------------------------------------------------

const SCAN_MS = 1700;
const SCAN_FROM = 48;
const SCAN_TO = 362;

// Each piece (bottom up, for the stacked one), what's wrong with it, where
// its ring goes, and its rank.
const AUDIT = [
  { parts: [{ x: 84, y: 154, w: 62, h: 56, flaw: "rotate(-5deg)" }], origin: "100% 100%", ring: [86, 150] as const, rank: 3 },
  {
    parts: [
      { x: 162, y: 166, w: 84, h: 44, flaw: "none" },
      { x: 162, y: 122, w: 84, h: 44, flaw: "translateX(11px)" },
    ],
    origin: "50% 100%",
    ring: [252, 166] as const,
    rank: 1,
  },
  { parts: [{ x: 290, y: 168, w: 64, h: 42, flaw: "none" }], origin: "50% 100%", ring: [346, 212] as const, rank: 2 },
];

function Marker({ cx, cy, n }: { cx: number; cy: number; n: number }) {
  return (
    <g>
      {/* The fix that matters most carries the signal colour. */}
      <circle cx={cx} cy={cy} r={9} fill={n === 1 ? SIGNAL : TILE} {...LINE} stroke={n === 1 ? SIGNAL : INK} />
      <text x={cx} y={cy + 3.4} textAnchor="middle" fontSize={10} fontWeight={500} fill={n === 1 ? "#fff" : INK} style={{ fontFamily: "inherit" }}>
        {n}
      </text>
    </g>
  );
}

function Audit({ play, delay, still }: Anim) {
  const on = play || still;
  const d = still ? 0 : delay;
  return (
    <>
      <style>{`@keyframes wwd-scan{0%{transform:translateX(0);opacity:0}8%{opacity:1}90%{opacity:1}100%{transform:translateX(${SCAN_TO - SCAN_FROM}px);opacity:0}}`}</style>
      <g transform="translate(0 6)">
        <Box x={56} y={210} w={288} h={40} d={0.12} />
        {AUDIT.map((b, i) => (
          <g key={i} style={enter(on, "translateY(14px)", d + i * 90, 520)}>
            {b.parts.map((p, k) => (
              <g key={k} style={{ transform: p.flaw, transformBox: "fill-box", transformOrigin: b.origin }}>
                <Box x={p.x} y={p.y} w={p.w} h={p.h} d={0.14} />
              </g>
            ))}
          </g>
        ))}
        {!still && (
          <line
            x1={SCAN_FROM}
            y1={40}
            x2={SCAN_FROM}
            y2={262}
            {...DASH}
            strokeOpacity={0.9}
            style={{ opacity: 0, animation: on ? `wwd-scan ${SCAN_MS}ms ${EASE} ${d + 380}ms both` : "none" }}
          />
        )}
        {AUDIT.map((b) => {
          const [x, y] = b.ring;
          const passed = still ? 0 : d + 380 + ((x - SCAN_FROM) / (SCAN_TO - SCAN_FROM)) * SCAN_MS;
          return (
            <g key={b.rank} style={fade(on, passed, 360)}>
              <circle cx={x} cy={y} r={11} {...DASH} />
              <line x1={x + 8} y1={y - 8} x2={x + 16} y2={y - 16} {...DASH} />
              <Marker cx={x + 23} cy={y - 23} n={b.rank} />
            </g>
          );
        })}
      </g>
    </>
  );
}

// --- Identity ----------------------------------------------------------------

// The mark: a ring with a stroke through it, in the signal colour wherever
// it's carried.
function Mark({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} {...LINE} stroke={SIGNAL} />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} {...LINE} stroke={SIGNAL} />
    </g>
  );
}

// The pieces the mark is carried onto, each with the mark at its size.
const CARRIED = [
  { x: 70, y: 196, w: 58, h: 26, d: 0.06, r: 8 },
  { x: 270, y: 146, w: 36, h: 76, d: 0.08, r: 9 },
  { x: 314, y: 198, w: 24, h: 24, d: 0.08, r: 6 },
];

function Identity({ play, delay, still }: Anim) {
  const on = play || still;
  const d = still ? 0 : delay;
  return (
    <>
      <Box x={56} y={222} w={288} h={30} d={0.1} />
      <g style={enter(on, "translateY(-40px)", d, 640)}>
        <Box x={150} y={108} w={100} h={114} d={0.16} />
        {/* The mark itself is the decision here, so it's drawn in the signal colour. */}
        <Trace on={on} delay={still ? 0 : d + 520} ms={800} shape={{ as: "circle", cx: 200, cy: 165, r: 28 }} stroke={SIGNAL} />
        <Trace on={on} delay={still ? 0 : d + 1000} ms={400} shape={{ as: "line", x1: 200, y1: 137, x2: 200, y2: 193 }} stroke={SIGNAL} />
      </g>
      {CARRIED.map((p, i) => (
        <g key={i} style={enter(on, "translateY(-30px)", d + 1300 + i * 160, 560)}>
          <Box x={p.x} y={p.y} w={p.w} h={p.h} d={p.d} />
          <Mark cx={p.x + p.w / 2} cy={p.y + p.h / 2} r={p.r} />
        </g>
      ))}
    </>
  );
}

// --- Build -------------------------------------------------------------------

const PAGE = { x: 128, y: 86, w: 144, h: 168, d: 0.16 };
// The layout on the page's front face: nav, hero, two columns.
const LAYOUT = [
  { x: 142, y: 100, width: 116, height: 16 },
  { x: 142, y: 128, width: 116, height: 50 },
  { x: 142, y: 190, width: 50, height: 50 },
  { x: 204, y: 190, width: 54, height: 50 },
];

function Build({ play, delay, still }: Anim) {
  const on = play || still;
  const d = still ? 0 : delay;
  const rise = d + 300;
  return (
    <>
      <Box x={92} y={254} w={216} h={22} d={0.08} />
      <Box {...PAGE} ghost />
      <g style={enter(on, "translateY(36px)", rise, 760)}>
        <Box {...PAGE} />
      </g>
      {LAYOUT.map((r, i) => {
        const t = still ? 0 : rise + 700 + i * 220;
        return (
          <g key={i}>
            {/* The approved layout. The trace runs exactly over it, so by
                the end none of it is left showing. */}
            <rect {...r} {...DASH} />
            <Trace on={on} delay={t} shape={{ as: "rect", ...r }} />
          </g>
        );
      })}
    </>
  );
}

// --- Partnership -------------------------------------------------------------

function Partnership({ play, delay, still }: Anim) {
  const on = play || still;
  const d = still ? 0 : delay;
  return (
    <>
      <style>{`@keyframes wwd-next{0%,100%{opacity:.35}50%{opacity:1}}`}</style>
      <Box x={40} y={232} w={320} h={24} d={0.1} />
      <Box x={84} y={132} w={112} h={100} d={0.15} />
      <g style={raise(on, d + 150)}>
        <Flag x={160} y={114} h={56} />
      </g>
      {/* A new page, built on as a wing. */}
      <g style={enter(on, "translateX(18px)", d + 650, 600)}>
        <Box x={196} y={172} w={70} h={60} d={0.15} />
      </g>
      {/* A campaign, set on top of it. */}
      <g style={enter(on, "translateY(-26px)", d + 1050, 560)}>
        <Box x={214} y={144} w={32} h={20} d={0.08} />
      </g>
      {/* A small fix, beside it. */}
      <g style={enter(on, "translateY(-18px)", d + 1400, 480)}>
        <Box x={274} y={212} w={20} h={20} d={0.08} />
      </g>
      {/* The next one, already outlined. */}
      <g style={fade(on, still ? 0 : d + 1750, 600)}>
        <g style={{ animation: on && !still ? `wwd-next 2400ms ease-in-out ${d + 2400}ms infinite` : "none" }}>
          <Box x={312} y={184} w={32} h={48} d={0.1} ghost />
        </g>
      </g>
    </>
  );
}

const SKETCHES: Record<string, (p: Anim) => ReactElement> = {
  Audit,
  Identity,
  Build,
  Partnership,
};

export function WhatWeDoSketch({
  stage,
  className,
  play = true,
  delay = 0,
  still = false,
}: {
  stage: string;
  className?: string;
  play?: boolean;
  delay?: number;
  still?: boolean;
}) {
  const Sketch = SKETCHES[stage];
  if (!Sketch) return null;
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" aria-hidden="true">
      <Sketch play={play} delay={delay} still={still} />
    </svg>
  );
}
