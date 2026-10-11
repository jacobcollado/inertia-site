"use client";

import type { ReactElement } from "react";
import { Box, DASH, EASE, Flag, LINE, enter, raise } from "@/components/line-art";
import { INK, TILE } from "@/components/material-art";

// The What we do drawings, in the hero staircase's line style
// (components/line-art.tsx). One per service, each building itself once
// `play` turns on, starting `delay` ms in, so the four play in order as the
// step track lights them. With `still` (reduced motion) each shows built.
//
// Audit: a site's sections on a slab, a scan line passing over them, and
//   the fixes numbered in order of what matters most, not left to right.
// Identity: column guides go down first, then type, the mark and the colour
//   swatches drop in, each landing on a guide.
// Build: the approved design as a dashed outline, filled brick by brick
//   until nothing of the outline is left showing.
// Partnership: the launched piece with its flag, then what gets added after,
//   growing month by month, with the next one already outlined.

type Anim = { play: boolean; delay: number; still: boolean };

// Ink mixed into the tile, for faces that need to read as colour.
const shade = (pct: number) => `color-mix(in srgb, ${INK} ${pct}%, ${TILE})`;

const SCAN_MS = 1700;
const SCAN_FROM = 56;
const SCAN_TO = 344;

// Each audited block, and the rank its fix gets. Markers appear as the scan
// reaches each block's centre.
const AUDIT_BLOCKS = [
  { x: 86, y: 154, w: 62, h: 56, d: 0.14, rank: 3 },
  { x: 160, y: 120, w: 86, h: 90, d: 0.14, rank: 1 },
  { x: 258, y: 168, w: 64, h: 42, d: 0.14, rank: 2 },
];

function Marker({ cx, cy, n }: { cx: number; cy: number; n: number }) {
  return (
    <g>
      <line x1={cx} y1={cy + 10} x2={cx} y2={cy + 22} {...DASH} />
      <circle cx={cx} cy={cy} r={10} fill={n === 1 ? INK : TILE} {...LINE} />
      <text
        x={cx}
        y={cy + 3.6}
        textAnchor="middle"
        fontSize={10.5}
        fontWeight={500}
        fill={n === 1 ? TILE : INK}
        style={{ fontFamily: "inherit" }}
      >
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
      <style>{`@keyframes wwd-scan{0%{transform:translateX(0);opacity:0}8%{opacity:1}88%{opacity:1}100%{transform:translateX(${SCAN_TO - SCAN_FROM}px);opacity:0}}`}</style>
      <Box x={56} y={210} w={288} h={40} d={0.12} />
      {AUDIT_BLOCKS.map((b, i) => (
        <g key={i} style={enter(on, "translateY(14px)", d + i * 90, 520)}>
          <Box x={b.x} y={b.y} w={b.w} h={b.h} d={b.d} />
        </g>
      ))}
      {!still && (
        <line
          x1={SCAN_FROM}
          y1={44}
          x2={SCAN_FROM}
          y2={262}
          {...DASH}
          strokeOpacity={0.9}
          style={{ opacity: 0, animation: on ? `wwd-scan ${SCAN_MS}ms ${EASE} ${d + 380}ms both` : "none" }}
        />
      )}
      {AUDIT_BLOCKS.map((b) => {
        const cx = b.x + b.w / 2;
        // The top face rises about 0.3 * d * (y + 700) above the front edge.
        const top = b.y - 0.3 * b.d * (b.y + 700);
        const passed = ((cx - SCAN_FROM) / (SCAN_TO - SCAN_FROM)) * SCAN_MS;
        return (
          <g
            key={b.rank}
            style={{
              ...enter(on, "translateY(8px) scale(0.6)", still ? 0 : d + 380 + passed, 420),
              transformBox: "fill-box",
              transformOrigin: "50% 100%",
            }}
          >
            <Marker cx={cx} cy={top - 30} n={b.rank} />
          </g>
        );
      })}
    </>
  );
}

const GUIDES = [118, 200, 282];

function Identity({ play, delay, still }: Anim) {
  const on = play || still;
  const d = still ? 0 : delay;
  return (
    <>
      <Box x={70} y={214} w={260} h={36} d={0.12} />
      {GUIDES.map((x, i) => (
        <g key={x} style={{ opacity: on ? 1 : 0, transition: `opacity 500ms ${EASE} ${d + i * 80}ms` }}>
          <line x1={x} y1={40} x2={x} y2={178} {...DASH} />
        </g>
      ))}

      {/* Type: a block of set lines, centred on the first guide. */}
      <g style={enter(on, "translateY(-34px)", d + 300, 560)}>
        <Box x={90} y={160} w={56} h={54} d={0.1} />
        {[
          { y: 174, w: 36 },
          { y: 186, w: 36 },
          { y: 198, w: 24 },
        ].map((l, i) => (
          <line
            key={l.y}
            x1={100}
            y1={l.y}
            x2={100 + l.w}
            y2={l.y}
            {...LINE}
            style={{ opacity: on ? 1 : 0, transition: `opacity 300ms ${EASE} ${d + 700 + i * 90}ms` }}
          />
        ))}
      </g>

      {/* The mark, centred on the middle guide. */}
      <g style={enter(on, "translateY(-46px)", d + 640, 680)}>
        <Box x={158} y={130} w={84} h={84} d={0.14} />
        <circle cx={200} cy={172} r={24} {...LINE} />
        <line x1={200} y1={148} x2={200} y2={196} {...LINE} />
      </g>

      {/* Colour swatches, stacked on the last guide. */}
      {[
        { y: 190, pct: 70 },
        { y: 166, pct: 38 },
        { y: 142, pct: 14 },
      ].map((s, i) => (
        <g key={s.y} style={enter(on, "translateY(-34px)", d + 900 + i * 130, 560)}>
          <Box x={266} y={s.y} w={32} h={24} d={0.1} fill={shade(s.pct)} />
        </g>
      ))}
    </>
  );
}

// Two bricks a row, five rows, bottom up. Together they fill the outline.
const BRICKS = Array.from({ length: 10 }, (_, i) => ({
  x: i % 2 === 0 ? 128 : 200,
  y: 218 - Math.floor(i / 2) * 36,
}));

function Build({ play, delay, still }: Anim) {
  const on = play || still;
  const d = still ? 0 : delay;
  return (
    <>
      <Box x={92} y={254} w={216} h={22} d={0.08} />
      <Box x={128} y={74} w={144} h={180} d={0.16} ghost />
      {BRICKS.map((b, i) => (
        <g key={i} style={enter(on, "translateY(-30px)", d + 160 + i * 110, 480)}>
          <Box x={b.x} y={b.y} w={72} h={36} d={0.16} />
        </g>
      ))}
    </>
  );
}

const GROWTH = [
  { x: 224, h: 30 },
  { x: 258, h: 52 },
  { x: 292, h: 78 },
];

function Partnership({ play, delay, still }: Anim) {
  const on = play || still;
  const d = still ? 0 : delay;
  return (
    <>
      <Box x={36} y={226} w={168} h={26} d={0.1} />
      <Box x={66} y={136} w={104} h={90} d={0.15} />
      <g style={raise(on, d + 150)}>
        <Flag x={148} y={116} h={62} />
      </g>
      <line x1={214} y1={252} x2={366} y2={252} {...DASH} />
      {GROWTH.map((g, i) => (
        <g key={g.x} style={enter(on, "translateY(24px)", d + 650 + i * 260, 600)}>
          <Box x={g.x} y={252 - g.h} w={26} h={g.h} d={0.12} />
        </g>
      ))}
      <g style={{ opacity: on ? 1 : 0, transition: `opacity 600ms ${EASE} ${d + 1500}ms` }}>
        <Box x={326} y={146} w={26} h={106} d={0.12} ghost />
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
