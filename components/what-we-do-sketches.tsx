"use client";

import type { CSSProperties, ReactElement } from "react";
import { Defs, Framing, GrainRect, INK, PAPER, SEL, tornSquare, useMaterialIds, type Ids } from "@/components/material-art";

// "What we do" drawings: the same two overlapping squares in every stage,
// inside the shared material framing (components/material-art.tsx). Only the
// finish changes from stage to stage, from rough to real:
//
//   Direction    halftone fading in, the second square still a dashed outline
//   Design       crisp: blue and white, the front square selected
//   Development  pixels: a dither and a fine grid
//   Launch       solid ink and blue with torn edges, a physical thing

// The pair every stage is about.
const BACK = { x: 182, y: 62, s: 126 };
const FRONT = { x: 132, y: 128, s: 104 };

// One of the pair, optionally with grain over it or torn at the edges.
function Square({
  sq,
  fill,
  mask,
  ids,
  grain = false,
  torn = 0,
}: {
  sq: typeof BACK;
  fill: string;
  mask?: string;
  ids?: Ids;
  grain?: boolean;
  torn?: number;
}) {
  if (torn && ids) {
    const d = tornSquare(sq.x, sq.y, sq.s, torn);
    return (
      <>
        <path d={d} fill={fill} />
        <path d={d} fill={`url(#${ids.grain})`} />
      </>
    );
  }
  return (
    <>
      <rect x={sq.x} y={sq.y} width={sq.s} height={sq.s} fill={fill} mask={mask ? `url(#${mask})` : undefined} />
      {grain && ids && <GrainRect ids={ids} x={sq.x} y={sq.y} w={sq.s} h={sq.s} />}
    </>
  );
}

// Each sketch builds itself once `play` turns on, starting `delay` ms in, so
// the four play in order as the step track lights them. With `still` (reduced
// motion) everything just sits in its final state.
type Anim = { ids: Ids; play: boolean; delay: number; still: boolean };

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SPRING = "cubic-bezier(0.34, 1.45, 0.64, 1)";

// Style for one animated piece: its hidden pose until shown, then none.
function piece(a: Anim, from: string, ms: number, at: number, ease = EASE, fade = true): CSSProperties {
  const on = a.play || a.still;
  const d = a.delay + at;
  return {
    transformBox: "fill-box",
    transformOrigin: "center",
    transform: on ? "none" : from,
    opacity: fade && !on ? 0 : 1,
    transition: a.still ? "none" : `transform ${ms}ms ${ease} ${d}ms, opacity ${Math.round(ms * 0.6)}ms ease ${d}ms`,
  };
}

// 1. Direction: the halftone rises in, then the second square appears as an
// outline whose dashes keep marching: still being decided.
function Direction(a: Anim) {
  const { ids } = a;
  return (
    <>
      <Framing ids={ids} />
      <g style={piece(a, "translateY(14px)", 800, 0)}>
        <Square sq={BACK} fill={`url(#${ids.halftone})`} mask={ids.fadeMask} />
      </g>
      <g style={piece(a, "scale(0.86)", 700, 260)}>
        <rect
          className="wwd-march"
          x={FRONT.x}
          y={FRONT.y}
          width={FRONT.s}
          height={FRONT.s}
          fill="none"
          stroke={INK}
          strokeOpacity={0.55}
          strokeWidth={1.2}
          strokeDasharray="5 5"
        />
      </g>
    </>
  );
}

// 2. Design: the blue slides in, the white drops on top, then it's selected
// and measured.
function Design(a: Anim) {
  const { ids } = a;
  const h = 7;
  const { x, y, s } = FRONT;
  return (
    <>
      <Framing ids={ids} />
      <g style={piece(a, "translate(18px, -10px)", 800, 0)}>
        <Square sq={BACK} fill={SEL} ids={ids} grain />
      </g>
      <g style={piece(a, "translateY(-16px)", 700, 200)}>
        <Square sq={FRONT} fill={PAPER} ids={ids} grain />
      </g>
      <g style={piece(a, "scale(1.06)", 500, 520)}>
        <rect x={x} y={y} width={s} height={s} fill="none" stroke={SEL} strokeWidth={1.3} />
      </g>
      {[[x, y], [x + s, y], [x, y + s], [x + s, y + s]].map(([hx, hy], i) => (
        <g key={`${hx}-${hy}`} style={piece(a, "scale(0)", 420, 600 + i * 60, SPRING)}>
          <rect x={hx - h / 2} y={hy - h / 2} width={h} height={h} fill={PAPER} stroke={SEL} strokeWidth={1.3} />
        </g>
      ))}
      <g style={piece(a, "translateY(6px)", 500, 880)}>
        <g transform={`translate(${x + s / 2 - 22} ${y + s + 10})`}>
          <rect width={44} height={16} rx={3} fill={SEL} />
          <text x={22} y={11.5} fontSize={9.5} textAnchor="middle" fill={PAPER} fontFamily="inherit">
            104
          </text>
        </g>
      </g>
    </>
  );
}

// 3. Development: the dither fades up, then the front square is drawn in top
// to bottom like a scan.
function Development(a: Anim) {
  const { ids } = a;
  const on = a.play || a.still;
  return (
    <>
      <Framing ids={ids} />
      <g style={piece(a, "none", 700, 0)}>
        <Square sq={BACK} fill={`url(#${ids.dither})`} />
      </g>
      <g style={piece(a, "none", 300, 250)}>
        <Square sq={FRONT} fill={PAPER} />
        <Square sq={FRONT} fill={`url(#${ids.fine})`} />
        {/* The scan: a paper cover that rolls up off the square. */}
        <rect
          x={FRONT.x}
          y={FRONT.y}
          width={FRONT.s}
          height={FRONT.s}
          fill={PAPER}
          style={{
            transformBox: "fill-box",
            transformOrigin: "bottom",
            transform: on ? "scaleY(0)" : "scaleY(1)",
            transition: a.still ? "none" : `transform 900ms steps(13) ${a.delay + 300}ms`,
          }}
        />
        <rect x={FRONT.x} y={FRONT.y} width={FRONT.s} height={FRONT.s} fill="none" stroke={INK} strokeWidth={1} />
      </g>
    </>
  );
}

// 4. Launch: the two pieces drop onto the board, blue then ink, with a
// little give, like something physical landing.
function Launch(a: Anim) {
  const { ids } = a;
  return (
    <>
      <Framing ids={ids} />
      <g style={piece(a, "translateY(-22px) rotate(-4deg) scale(1.04)", 750, 0, SPRING)}>
        <Square sq={BACK} fill={SEL} ids={ids} torn={11} />
      </g>
      <g style={piece(a, "translateY(-26px) rotate(5deg) scale(1.05)", 750, 220, SPRING)}>
        <Square sq={FRONT} fill={INK} ids={ids} torn={29} />
      </g>
    </>
  );
}

const SKETCHES: Record<string, (p: Anim) => ReactElement> = {
  Direction,
  Design,
  Development,
  Launch,
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
  const ids = useMaterialIds();
  const Sketch = SKETCHES[stage];
  if (!Sketch) return null;
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" aria-hidden="true">
      <Defs ids={ids} />
      <Sketch ids={ids} play={play} delay={delay} still={still} />
    </svg>
  );
}
