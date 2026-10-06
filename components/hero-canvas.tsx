"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { INK, TILE } from "@/components/material-art";

// The hero's visual: a line-drawn staircase, one step for each thing the
// studio does (Direction, Design, Development, Launch, the same steps as
// "What we do"), rising left to right from first idea to launch. Monoline
// strokes, with a dashed ghost of the next step past Launch. A few small objects sit on the treads: sheets on Design, a
// block on Development, a flag on Launch. Drawn in the page's ink on its
// tile, so it flips with the light / dark theme.
//
// On landing it builds itself: the steps rise into place
// left to right with their labels, the objects drop onto the treads, the
// flag raises, and the ghost step fades in last (CSS in globals.css, under
// "Hero canvas"). Transform and opacity only; reduced motion shows it built.
//
// One-point perspective: the step fronts face the viewer square, so their
// labels read straight, and depth converges on a vanishing point above the
// stair, so you look down onto the treads. Two compositions, one per panel
// shape: 1200x500 for the 12:5 panel from sm up, 800x600 for the 4:3 panel
// on phones.

type Pt = [number, number];

type Comp = {
  w: number;
  h: number;
  x0: number;
  base: number;
  run: number;
  rise: number;
  // Vanishing point, and how far back toward it a step's depth reaches.
  vp: Pt;
  depth: number;
  labelSize: number;
};

// x0 centres the stair, its depth and the ghost step in the board.
const DESKTOP: Comp = { w: 1200, h: 500, x0: 150, base: 452, run: 190, rise: 80, vp: [760, -260], depth: 0.16, labelSize: 17 };
const MOBILE: Comp = { w: 800, h: 600, x0: 40, base: 566, run: 150, rise: 100, vp: [480, -300], depth: 0.15, labelSize: 21 };

const STEPS = ["Direction", "Design", "Development", "Launch"];

const LINE = { stroke: INK, strokeWidth: 1.1, vectorEffect: "non-scaling-stroke" as const, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const DASH = { ...LINE, strokeDasharray: "4 5", strokeOpacity: 0.6 };

const poly = (pts: Pt[]) => pts.map((p) => p.join(",")).join(" ");

// Room left around the drawing once it's fitted, as a share of the board.
const PAD = 0.07;

function Board({ c, className }: { c: Comp; className: string }) {
  // Fit the view to the drawing: measure what was drawn and frame it with
  // even padding at the board's aspect, so the stair sits centred and as
  // large as the panel allows whatever the numbers above add up to.
  const drawing = useRef<SVGGElement>(null);
  const [view, setView] = useState(`0 0 ${c.w} ${c.h}`);
  useLayoutEffect(() => {
    const g = drawing.current;
    if (!g || !g.getBBox) return;
    const b = g.getBBox();
    const aspect = c.w / c.h;
    let vw = b.width + c.w * PAD * 2;
    let vh = b.height + c.w * PAD * 2;
    if (vw / vh > aspect) vh = vw / aspect;
    else vw = vh * aspect;
    setView(`${b.x + b.width / 2 - vw / 2} ${b.y + b.height / 2 - vh / 2} ${vw} ${vh}`);
  }, [c]);

  // A point's back edge: pulled toward the vanishing point.
  const back = ([x, y]: Pt): Pt => [x + (c.vp[0] - x) * c.depth, y + (c.vp[1] - y) * c.depth];
  const xEnd = c.x0 + c.run * STEPS.length;

  // A box by its front face; draws right side, top, then front, filled so
  // nearer steps cover farther lines.
  const box = (x: number, top: number, w: number, bottom: number, ghost = false) => {
    const fl: Pt = [x, top];
    const fr: Pt = [x + w, top];
    const br: Pt = [x + w, bottom];
    const s = ghost ? DASH : LINE;
    const fill = ghost ? "none" : TILE;
    return (
      <>
        <polygon points={poly([fr, back(fr), back(br), br])} fill={fill} {...s} />
        <polygon points={poly([fl, back(fl), back(fr), fr])} fill={fill} {...s} />
        <polygon points={poly([fl, fr, br, [x, bottom]])} fill={fill} {...s} />
      </>
    );
  };

  const tops = STEPS.map((_, i) => c.base - c.rise * (i + 1));

  return (
    <svg viewBox={view} preserveAspectRatio="xMidYMid meet" className={className} fill="none">
      <g ref={drawing}>


      {STEPS.map((label, i) => {
        const x = c.x0 + c.run * i;
        const top = tops[i];
        const mid = x + c.run / 2;
        return (
          <g key={label} className="hs-step" style={{ ["--i" as string]: i }}>
            {box(x, top, c.run, c.base)}

            {/* What sits on each tread. */}
            {i === 1 && (
              <g className="hs-obj">
                {[0, 1, 2].map((s) => (
                  <g key={s}>{box(x + c.run * 0.18 + s * 5, top - 6 - s * 6, c.run * 0.44 - s * 10, top - s * 6)}</g>
                ))}
              </g>
            )}
            {i === 2 && <g className="hs-obj">{box(x + c.run * 0.5, top - c.rise * 0.42, c.run * 0.22, top)}</g>}
            {i === 3 && (
              <g className="hs-flag">
                <line x1={x + c.run * 0.7} y1={top} x2={x + c.run * 0.7} y2={top - c.rise * 1.15} {...LINE} />
                <polygon
                  points={poly([
                    [x + c.run * 0.7, top - c.rise * 1.15],
                    [x + c.run * 0.7 + c.run * 0.24, top - c.rise * 1.0],
                    [x + c.run * 0.7, top - c.rise * 0.85],
                  ])}
                  fill={TILE}
                  {...LINE}
                />
              </g>
            )}

            <text
              x={mid}
              y={top + Math.min(c.rise, (c.base - top) / 2)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={c.labelSize}
              fill={INK}
              style={{ fontFamily: "var(--font-satoshi), sans-serif", fontWeight: 450, letterSpacing: "-0.01em" }}
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* A dashed ghost of the next step, past Launch. */}
      <g className="hs-ghost">{box(xEnd, tops[3] - c.rise * 0.6, c.run * 0.5, tops[3], true)}</g>

      </g>
    </svg>
  );
}

// `play` starts the build (the homepage holds it until the hero has come
// in); `delay` is how long after that, in ms. The build waits one effect
// past mount so each board measures itself before anything moves.
export function HeroCanvas({ style, play = true, delay = 200 }: { style?: CSSProperties; play?: boolean; delay?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div
      aria-hidden="true"
      className={`hero-stair relative w-full overflow-hidden rounded-[6px] aspect-[4/3] sm:aspect-[12/5]${play && mounted ? " is-on" : ""}`}
      style={{ background: TILE, ["--hs-base" as string]: `${delay}ms`, ...style }}
    >
      {/* Client only: the drawings are decoration, and leaving them out of
          the server HTML keeps the homepage's markup mostly words. The tile
          holds the space, and the build starts after mount anyway. */}
      {mounted && (
        <>
          <Board c={MOBILE} className="absolute inset-0 h-full w-full sm:hidden" />
          <Board c={DESKTOP} className="absolute inset-0 hidden h-full w-full sm:block" />
        </>
      )}
    </div>
  );
}
