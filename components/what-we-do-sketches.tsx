"use client";

import type { ReactElement } from "react";
import { Box, Floor, Flag, enter, raise } from "@/components/line-art";

// The What we do drawings, in the hero staircase's line style
// (components/line-art.tsx). One per step, each building itself once `play`
// turns on, starting `delay` ms in, so the four play in order as the step
// track lights them. With `still` (reduced motion) each shows built.
//
// Direction: a dashed ghost of everything it could be, and the one solid
//   form that rises out of it.
// Design: a block, and the pieces that decide how it looks set on it.
// Development: blocks stacked into a built structure.
// Launch: the finished piece on its plinth, and the flag going up.

type Anim = { play: boolean; delay: number; still: boolean };

function Direction({ play, delay, still }: Anim) {
  const on = play || still;
  const d = still ? 0 : delay;
  return (
    <>
      <Floor y={240} />
      <Box x={110} y={96} w={180} h={144} d={0.2} ghost />
      <g style={enter(on, "translateY(40px)", d + 200, 700)}>
        <Box x={160} y={150} w={80} h={90} d={0.14} />
      </g>
    </>
  );
}

function Design({ play, delay, still }: Anim) {
  const on = play || still;
  const d = still ? 0 : delay;
  return (
    <>
      <Floor y={240} />
      <Box x={120} y={170} w={160} h={70} d={0.2} />
      <g style={enter(on, "translateY(-30px)", d + 150)}>
        <Box x={136} y={160} w={70} h={10} d={0.14} />
      </g>
      <g style={enter(on, "translateY(-30px)", d + 330)}>
        <Box x={144} y={150} w={54} h={10} d={0.12} />
      </g>
      <g style={enter(on, "translateY(-30px)", d + 510)}>
        <Box x={226} y={130} w={36} h={40} d={0.12} />
      </g>
    </>
  );
}

const BRICKS = [
  { x: 96, y: 200, w: 100, h: 40 },
  { x: 204, y: 200, w: 100, h: 40 },
  { x: 150, y: 160, w: 100, h: 40 },
  { x: 176, y: 120, w: 48, h: 40 },
];

function Development({ play, delay, still }: Anim) {
  const on = play || still;
  const d = still ? 0 : delay;
  return (
    <>
      <Floor y={240} />
      {BRICKS.map((b, i) => (
        <g key={i} style={enter(on, "translateY(-36px)", d + 120 + i * 170, 560)}>
          <Box {...b} d={0.14} />
        </g>
      ))}
    </>
  );
}

function Launch({ play, delay, still }: Anim) {
  const on = play || still;
  const d = still ? 0 : delay;
  return (
    <>
      <Floor y={240} />
      <Box x={110} y={208} w={180} h={32} d={0.24} />
      <g style={enter(on, "translateY(30px)", d + 150, 650)}>
        <Box x={150} y={140} w={100} h={68} d={0.17} />
      </g>
      <g style={raise(on, d + 650)}>
        <Flag x={214} y={128} h={74} />
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
  const Sketch = SKETCHES[stage];
  if (!Sketch) return null;
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" aria-hidden="true">
      <Sketch play={play} delay={delay} still={still} />
    </svg>
  );
}
