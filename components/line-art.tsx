import type { CSSProperties } from "react";
import { INK, TILE } from "@/components/material-art";

// Shared line kit for the homepage drawings in the hero staircase's style
// (components/hero-canvas.tsx): monoline boxes in one-point perspective seen
// from above, dashed ghosts and guides, on the page's tile. Used by the
// What we do and execution illustrations, which all draw on a 400x300
// board with the vanishing point high above its centre.

export type Pt = [number, number];

export const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

// Far above the board, so receding edges run nearly parallel and small
// boxes don't taper; DEPTH scales each box's depth to suit the distance.
export const VP: Pt = [230, -700];
const DEPTH = 0.3;

export const LINE = { stroke: INK, strokeWidth: 1.1, vectorEffect: "non-scaling-stroke" as const, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
export const DASH = { ...LINE, strokeDasharray: "4 4", strokeOpacity: 0.6 };

export const proj = ([x, y]: Pt, t: number, vp: Pt = VP): Pt => [x + (vp[0] - x) * t * DEPTH, y + (vp[1] - y) * t * DEPTH];
export const poly = (pts: Pt[]) => pts.map((p) => p.join(",")).join(" ");

// A box by its front face. Solid boxes draw only what you'd see from above:
// the top, the side facing the vanishing point (if any), then the front,
// each filled with the tile so it covers what's behind. Ghosts are dashed
// wireframes, every edge showing. Light boxes are solid but drawn faint, for
// the background pieces a drawing isn't about. `vp` moves the vanishing
// point for boards wider than 400; `fill` colours the faces (the tile by
// default).
export function Box({ x, y, w, h, d, ghost, light, vp = VP, fill = TILE }: { x: number; y: number; w: number; h: number; d: number; ghost?: boolean; light?: boolean; vp?: Pt; fill?: string }) {
  const f: Pt[] = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const b = f.map((p) => proj(p, d, vp));
  if (ghost) {
    return (
      <g>
        <polygon points={poly(b)} {...DASH} />
        {f.map((p, i) => (
          <line key={i} x1={p[0]} y1={p[1]} x2={b[i][0]} y2={b[i][1]} {...DASH} />
        ))}
        <polygon points={poly(f)} {...DASH} />
      </g>
    );
  }
  const side =
    vp[0] > x + w ? [f[1], b[1], b[2], f[2]] : vp[0] < x ? [f[0], b[0], b[3], f[3]] : null;
  const s = light ? { ...LINE, strokeOpacity: 0.32 } : LINE;
  return (
    <g>
      <polygon points={poly([f[0], f[1], b[1], b[0]])} fill={fill} {...s} />
      {side && <polygon points={poly(side)} fill={fill} {...s} />}
      <polygon points={poly(f)} fill={fill} {...s} />
    </g>
  );
}

// A flag on a pole standing at (x, y), `h` tall.
export function Flag({ x, y, h }: { x: number; y: number; h: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y - h} {...LINE} />
      <polygon points={poly([[x, y - h], [x + h * 0.4, y - h * 0.86], [x, y - h * 0.72]])} fill={TILE} {...LINE} />
    </g>
  );
}

export function LineBoard({ children, className = "h-full w-full" }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

// Fades and slides a piece in from `from` (a CSS transform) when `on`.
export function enter(on: boolean, from: string, delay = 0, ms = 600): CSSProperties {
  return {
    opacity: on ? 1 : 0,
    transform: on ? "none" : from,
    transition: `transform ${ms}ms ${EASE} ${delay}ms, opacity ${Math.min(ms, 400)}ms ${EASE} ${delay}ms`,
  };
}

// Same, for the flag: grows up from the foot of its pole.
export const raise = (on: boolean, delay = 0): CSSProperties => ({
  ...enter(on, "scaleY(0)", delay, 560),
  transformBox: "fill-box",
  transformOrigin: "50% 100%",
});
