"use client";

import type { CSSProperties } from "react";
import { EASE, LINE } from "@/components/line-art";

// The sketch under the homepage's "We build the version of your business
// people fall for." statement, in the homepage's monoline style
// (components/line-art.tsx). A doorway and one person draw themselves in
// while the line is read (`shown`). When it settles (`settled`), the door
// swings open, warm light spills across the floor, and the person steps
// toward it: the business as somewhere you want to walk into.

const FILL = "rgb(var(--bg))";
const WARM = "#f2b36b";
const DOOR = { x: 172, y: 36, w: 56, h: 118 };
const FLOOR = DOOR.y + DOOR.h;

// Strokes trace themselves in: each path is normalised to length 1 and its
// dash offset runs from 1 to 0. Dashes on a non-scaling stroke are measured
// in screen pixels, which leaves gaps, so the drawn lines scale with the board.
const STROKE = { ...LINE, vectorEffect: "none" as const };
const draw = (on: boolean, delay = 0, ms = 1100): CSSProperties => ({
  strokeDasharray: 1,
  strokeDashoffset: on ? 0 : 1,
  transition: `stroke-dashoffset ${ms}ms ${EASE} ${delay}ms`,
});

const fade = (on: boolean, delay = 0, ms = 900): CSSProperties => ({
  opacity: on ? 1 : 0,
  transition: `opacity ${ms}ms ${EASE} ${delay}ms`,
});

export function StatementArt({ shown, settled, className }: { shown: boolean; settled: boolean; className?: string }) {
  const { x, y, w, h } = DOOR;
  return (
    <svg viewBox="0 20 400 180" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="statement-spill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={WARM} stopOpacity="0.55" />
          <stop offset="1" stopColor={WARM} stopOpacity="0" />
        </linearGradient>
        <radialGradient id="statement-glow" cx="0.5" cy="0.55" r="0.6">
          <stop offset="0" stopColor={WARM} stopOpacity="0.95" />
          <stop offset="1" stopColor={WARM} stopOpacity="0.45" />
        </radialGradient>
      </defs>

      {/* Light: the lit opening, then the spill across the floor. */}
      <rect x={x} y={y} width={w} height={h} fill="url(#statement-glow)" style={fade(settled, 150)} />
      <polygon
        points={`${x},${FLOOR} ${x + w},${FLOOR} ${x + w + 96},${FLOOR + 44} ${x - 34},${FLOOR + 44}`}
        fill="url(#statement-spill)"
        style={fade(settled, 350, 1400)}
      />

      {/* The floor, short and quiet, only as wide as the scene. */}
      <path d={`M ${x - 110} ${FLOOR} H ${x + w + 140}`} pathLength={1} {...STROKE} strokeOpacity={0.35} style={draw(shown, 0, 1400)} />

      {/* Door leaf, hinged on the left; it narrows as it swings in. */}
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "0% 50%",
          transform: settled ? "scaleX(0.22)" : "none",
          transition: `transform 1200ms ${EASE} 100ms`,
        }}
      >
        <rect x={x} y={y} width={w} height={h} fill={FILL} pathLength={1} {...STROKE} style={draw(shown, 200)} />
        <circle cx={x + w - 9} cy={y + h * 0.55} r={1.8} fill="var(--ink)" style={fade(shown && !settled, 900, 400)} />
      </g>

      {/* Frame, drawn over the leaf so its edge stays crisp. */}
      <path d={`M ${x} ${FLOOR} V ${y} H ${x + w} V ${FLOOR}`} pathLength={1} {...STROKE} style={draw(shown, 120)} />

      {/* One person, a few steps off, who walks a little closer once the
          door opens. */}
      <g
        style={{
          transform: settled ? "translateX(-34px)" : "none",
          transition: `transform 1600ms ${EASE} 500ms`,
        }}
      >
        <circle cx={316} cy={FLOOR - 33} r={6.5} fill={FILL} pathLength={1} {...STROKE} style={draw(shown, 500, 900)} />
        <path
          d={`M ${305} ${FLOOR} V ${FLOOR - 13} Q ${305} ${FLOOR - 23} ${316} ${FLOOR - 23} Q ${327} ${FLOOR - 23} ${327} ${FLOOR - 13} V ${FLOOR}`}
          fill={FILL}
          pathLength={1}
          {...STROKE}
          style={draw(shown, 650, 900)}
        />
      </g>
    </svg>
  );
}
