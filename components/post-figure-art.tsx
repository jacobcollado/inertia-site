"use client";

import type { ReactElement, ReactNode } from "react";
import { INK, TILE } from "@/components/material-art";
import { Box, DASH, LINE, type Pt } from "@/components/line-art";

// In-body figure drawings for blog posts, in the same 3D line style as the
// post covers and the hero staircase (components/line-art.tsx): boxes in
// perspective seen from above, light for the parts a figure isn't about,
// dashed for ghosts and guides, solid for the thing it is about. Picked by
// app/blog/[slug]/page.tsx through postFigure() in post-figures.tsx.

// The figures are 560 wide, so the vanishing point sits over their middle.
const VP: Pt = [280, -700];
const LIGHT = { ...LINE, strokeOpacity: 0.32 };
const FONT = { fontFamily: "var(--font-satoshi), sans-serif", fontWeight: 450 } as const;

function Label({ x, y, children, anchor = "start", opacity = 0.6, size = 13 }: {
  x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; opacity?: number; size?: number;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fill={INK} fillOpacity={opacity} style={FONT}>
      {children}
    </text>
  );
}

// A dimension line with end ticks.
function Dim({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const v = x1 === x2;
  const t = 5;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} {...LINE} />
      <line x1={v ? x1 - t : x1} y1={v ? y1 : y1 - t} x2={v ? x1 + t : x1} y2={v ? y1 : y1 + t} {...LINE} />
      <line x1={v ? x2 - t : x2} y1={v ? y2 : y2 - t} x2={v ? x2 + t : x2} y2={v ? y2 : y2 + t} {...LINE} />
    </g>
  );
}

// The dashed frame that marks what a figure is about.
const Mark = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => <rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} {...DASH} strokeOpacity={0.9} />;

// Side by side, boxes farther from the vanishing point go first, so the
// side faces of the nearer ones aren't drawn over their neighbours.
const outsideIn = (xs: number[], w: number) => [...xs].sort((a, b) => Math.abs(b + w / 2 - VP[0]) - Math.abs(a + w / 2 - VP[0]));

/* someone-still-has-to-pick: a field of forty directions, three gaps in it,
   and the three kept ones set apart on their own plinth. */
function FortyDirections() {
  const kept = new Set(["0-7", "2-2", "3-5"]);
  const W = 30, H = 24;
  const col = (c: number) => 24 + c * 38;
  const cells: ReactElement[] = [];
  // Top row first, so each lower row's tops cover the row above's feet.
  for (let r = 0; r < 4; r++) {
    const y = 52 + r * 40;
    for (const x of outsideIn(Array.from({ length: 10 }, (_, c) => col(c)), W)) {
      const c = (x - 24) / 38;
      cells.push(
        kept.has(`${r}-${c}`) ? (
          <rect key={`${r}-${c}`} x={x} y={y} width={W} height={H} {...DASH} strokeOpacity={0.9} />
        ) : (
          <Box key={`${r}-${c}`} x={x} y={y} w={W} h={H} d={0.05} vp={VP} light />
        ),
      );
    }
  }
  return (
    <>
      {cells}
      <Box x={420} y={198} w={134} h={14} d={0.1} vp={VP} />
      {outsideIn([428, 470, 512], 28).map((x) => (
        <Box key={x} x={x} y={170} w={28} h={28} d={0.08} vp={VP} />
      ))}
    </>
  );
}

/* taste-is-trained: the work climbs a year at a time toward a bar that was
   set on day one. */
function TasteGap() {
  const BASE = 206, W = 92, X0 = 46;
  const heights = [36, 58, 80, 102, 124];
  const top = BASE - heights[4];
  return (
    <>
      <line x1={X0 - 10} y1={top - 30} x2={X0 + W * 5 + 10} y2={top - 30} {...DASH} strokeOpacity={0.9} />
      <Label x={X0 - 10} y={top - 40} opacity={0.85}>your taste</Label>
      {heights.map((h, i) => (
        <Box key={i} x={X0 + i * W} y={BASE - h} w={W} h={h} d={0.06} vp={VP} light={i < 4} />
      ))}
      {heights.map((_, i) => (
        <Label key={i} x={X0 + i * W + W / 2} y={BASE + 22} anchor="middle" size={12} opacity={0.45}>{`year ${i + 1}`}</Label>
      ))}
      <Dim x1={X0 + 22} y1={top - 24} x2={X0 + 22} y2={BASE - heights[0] - 16} />
      <Label x={X0 + 32} y={(top + BASE - heights[0]) / 2 - 8} opacity={0.85}>the gap</Label>
    </>
  );
}

/* speed-is-a-feature: the same 2.4 seconds, as two filmstrips of what the
   visitor sees. One stays blank with a spinner until the page lands; the
   other shows the page's shape at 0.3s and fills it in. */
const FRAMES = ["0s", "0.3s", "1.2s", "2.4s"];

function Screen({ x, y, state }: { x: number; y: number; state: "blank" | "shape" | "page" }) {
  const W = 104, H = 64;
  const s = state === "page" ? LINE : LIGHT;
  return (
    <g>
      <Box x={x} y={y} w={W} h={H} d={0.03} vp={VP} light={state !== "page"} />
      {state === "blank" ? (
        <circle cx={x + W / 2} cy={y + H / 2} r={8} {...DASH} />
      ) : (
        <>
          <line x1={x + 10} y1={y + 13} x2={x + 46} y2={y + 13} {...s} strokeWidth={2.4} />
          <rect x={x + 10} y={y + 22} width={38} height={30} {...s} />
          <line x1={x + 56} y1={y + 26} x2={x + 94} y2={y + 26} {...s} />
          <line x1={x + 56} y1={y + 35} x2={x + 88} y2={y + 35} {...s} />
          <line x1={x + 56} y1={y + 44} x2={x + 92} y2={y + 44} {...s} />
        </>
      )}
    </g>
  );
}

function PerceivedSpeed() {
  const x = (i: number) => 40 + i * 126;
  return (
    <>
      {FRAMES.map((t, i) => (
        <Label key={t} x={x(i) + 52} y={22} anchor="middle" size={12} opacity={0.45}>{t}</Label>
      ))}
      <Label x={x(0)} y={46}>Blank until ready</Label>
      {FRAMES.map((t, i) => (
        <Screen key={t} x={x(i)} y={64} state={i === 3 ? "page" : "blank"} />
      ))}
      <Label x={x(0)} y={154}>Layout first</Label>
      {FRAMES.map((t, i) => (
        <Screen key={t} x={x(i)} y={172} state={i === 0 ? "blank" : i === 3 ? "page" : "shape"} />
      ))}
      <rect x={x(1) - 8} y={158} width={120} height={86} {...DASH} strokeOpacity={0.9} />
    </>
  );
}

/* most-projects-fail-before-figma: the request sits above the waterline;
   the problems it might be hiding sit below it, and one is the real one. */
function RequestVersusProblem() {
  const problems = [
    { x: 16, label: "Traffic doesn't convert" },
    { x: 200, label: "Sales re-explains us" },
    { x: 384, label: "A rival just shipped" },
  ];
  const real = 1;
  return (
    <>
      <Box x={190} y={46} w={180} h={42} d={0.04} vp={VP} />
      <Label x={280} y={72} anchor="middle" opacity={0.9}>Redesign the site</Label>
      <line x1={0} y1={118} x2={560} y2={118} {...DASH} />
      <Label x={556} y={110} anchor="end" size={12} opacity={0.45}>what&apos;s asked</Label>
      <Label x={556} y={134} anchor="end" size={12} opacity={0.45}>what&apos;s underneath</Label>
      {problems.map((p, i) => (
        <g key={p.label}>
          <line x1={280} y1={88} x2={p.x + 80} y2={166} {...LIGHT} strokeDasharray="3 4" />
          <Box x={p.x} y={170} w={160} h={44} d={0.04} vp={VP} light={i !== real} />
          <Label x={p.x + 80} y={197} anchor="middle" size={12} opacity={i === real ? 0.9 : 0.45}>{p.label}</Label>
        </g>
      ))}
    </>
  );
}

/* the-difference-you-feel: two play buttons. The left's icon is centred by
   its box, the right's nudged until its weight, the dot, sits on the centre. */
function OpticalCentre() {
  const button = (x: number, nudge: number, label: string, math: boolean) => {
    const cx = x + 85;
    const cy = 120;
    const pts = `${cx - 26 + nudge},${cy - 30} ${cx - 26 + nudge},${cy + 30} ${cx + 26 + nudge},${cy}`;
    return (
      <g>
        <Box x={x} y={60} w={170} h={120} d={0.05} vp={VP} />
        <line x1={cx} y1={70} x2={cx} y2={170} {...DASH} />
        <line x1={x + 10} y1={cy} x2={x + 160} y2={cy} {...DASH} />
        <polygon points={pts} fill={TILE} {...LINE} />
        {math && <rect x={cx - 26} y={cy - 30} width={52} height={60} {...DASH} strokeOpacity={0.9} />}
        <circle cx={cx - 9 + nudge} cy={cy} r={4.5} fill={INK} />
        <Label x={cx} y={214} anchor="middle">{label}</Label>
      </g>
    );
  };
  return (
    <>
      {button(70, 0, "centred by the maths", true)}
      {button(320, 9, "centred by eye", false)}
    </>
  );
}

/* copy-is-design: the same card with placeholder text, and with the
   headline it shipped with. The real one runs three lines and grows past
   the height it was designed at, which is dashed. */
function LengthIsLayout() {
  const card = (x: number, real: boolean) => {
    const heading = real ? [140, 150, 96] : [130];
    const bodyY = 66 + heading.length * 18 + 10;
    const body = real ? [150, 154, 132] : [146, 146, 146];
    const h = real ? 196 : 160;
    return (
      <g>
        <Box x={x} y={40} w={180} h={h} d={0.03} vp={VP} />
        {heading.map((w, i) => (
          <line key={i} x1={x + 16} y1={66 + i * 18} x2={x + 16 + w} y2={66 + i * 18} {...LINE} strokeWidth={3.2} />
        ))}
        {body.map((w, i) => (
          <line key={i} x1={x + 16} y1={bodyY + i * 12} x2={x + 16 + w} y2={bodyY + i * 12} {...LIGHT} />
        ))}
        <rect x={x + 16} y={40 + h - 40} width={76} height={24} rx={3} {...LINE} />
        <Label x={x + 90} y={14} anchor="middle" size={12} opacity={0.45}>{real ? "real headline" : "lorem ipsum"}</Label>
      </g>
    );
  };
  return (
    <>
      {card(60, false)}
      {card(320, true)}
      <line x1={506} y1={200} x2={530} y2={200} {...DASH} strokeOpacity={0.9} />
      <Dim x1={520} y1={200} x2={520} y2={236} />
      <Label x={528} y={222} size={12} opacity={0.85}>+3 lines</Label>
    </>
  );
}

/* design-systems-that-scale: ten pages fanned out. The first nine fit; page
   ten, in front, has a block breaking out past its edge. */
function TenthPage() {
  const page = (i: number) => ({ x: 24 + i * 40, y: 18 + i * 9 });
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => {
        const { x, y } = page(i);
        const last = i === 9;
        return (
          <g key={i}>
            <Box x={x} y={y} w={84} h={112} d={0.04} vp={VP} light={!last} />
            {!last && <line x1={x + 10} y1={y + 14} x2={x + 40} y2={y + 14} {...LIGHT} strokeWidth={2} />}
          </g>
        );
      })}
      {(() => {
        const { x, y } = page(9);
        return (
          <>
            <line x1={x + 10} y1={y + 14} x2={x + 46} y2={y + 14} {...LINE} strokeWidth={2.2} />
            <rect x={x + 10} y={y + 26} width={64} height={34} {...LINE} strokeOpacity={0.5} />
            <Box x={x + 40} y={y + 70} w={72} h={22} d={0.06} vp={VP} />
          </>
        );
      })()}
      <Label x={page(0).x} y={page(0).y + 128} size={12} opacity={0.45}>page 1</Label>
      <Label x={page(9).x} y={page(9).y + 128} size={12} opacity={0.85}>page 10</Label>
    </>
  );
}

/* consistency-beats-novelty: three buttons on one grid line, one drifted
   two pixels off it; three greys, the third one nobody chose. */
function DriftAndGreys() {
  const greys = ["var(--fig-grey)", "var(--fig-grey)", "var(--fig-grey-2)"];
  const names = ["#e2e2e2", "#e2e2e2", "#dfdfe4"];
  return (
    <>
      <line x1={80} y1={16} x2={80} y2={214} {...DASH} strokeOpacity={0.9} />
      {/* Drawn 6 units off rather than a literal 2px so the drift shows at
          figure scale; the label carries the real number. */}
      {[0, 1, 2].map((i) => (
        <Box key={i} x={i === 1 ? 86 : 80} y={36 + i * 60} w={140} h={34} d={0.04} vp={VP} light={i !== 1} />
      ))}
      <Label x={234} y={118} size={12} opacity={0.85}>2px off</Label>
      {greys.map((g, i) => (
        <g key={i}>
          <Box x={322 + i * 76} y={74} w={60} h={60} d={0.12} vp={VP} fill={g} light={i < 2} />
          <Label x={352 + i * 76} y={162} anchor="middle" size={12} opacity={i === 2 ? 0.85 : 0.45}>{names[i]}</Label>
        </g>
      ))}
      <Mark x={464} y={38} w={76} h={100} />
    </>
  );
}

const FIGURES: Record<string, { viewBox: string; caption: string; Art: () => ReactElement }> = {
  FortyDirections: { viewBox: "0 0 560 220", caption: "Forty directions before lunch. Three are worth keeping, and choosing them is the actual job.", Art: FortyDirections },
  TasteGap: { viewBox: "0 0 560 240", caption: "Taste shows up years before the ability to meet it. The gap closes through reps, not insight.", Art: TasteGap },
  PerceivedSpeed: { viewBox: "0 0 560 252", caption: "The same 2.4 seconds. One is a blank wait the whole time, the other shows the layout at 0.3s and reads as fast.", Art: PerceivedSpeed },
  RequestVersusProblem: { viewBox: "0 0 560 236", caption: "A redesign is the request. The brief's job is finding out which of these is the real problem.", Art: RequestVersusProblem },
  OpticalCentre: { viewBox: "0 0 560 230", caption: "Both are centred. The left by its bounding box, the right nudged until its weight, the dot, sits on the centre.", Art: OpticalCentre },
  LengthIsLayout: { viewBox: "0 0 560 256", caption: "The same card, with placeholder text and with the headline it actually shipped with. Nobody designed the three-line version.", Art: LengthIsLayout },
  TenthPage: { viewBox: "0 0 560 250", caption: "Page one fits because the components were drawn around it. Page ten is the first real test of the system.", Art: TenthPage },
  DriftAndGreys: { viewBox: "0 0 560 224", caption: "Most of it is maintenance: the button that drifted two pixels off the grid, and the third grey nobody chose.", Art: DriftAndGreys },
};

// The panel is the covers' board: the plain tile.
export function PostFigureArt({ name }: { name: string }) {
  const fig = FIGURES[name];
  if (!fig) return null;
  return (
    <figure className="m-0">
      <div className="rounded-[6px] px-4 py-6 sm:px-8 sm:py-8" style={{ backgroundColor: "var(--tile)" }}>
        <svg viewBox={fig.viewBox} className="block h-auto w-full overflow-visible" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <fig.Art />
        </svg>
      </div>
      <figcaption className="mt-3 text-[13px] sm:text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
        {fig.caption}
      </figcaption>
    </figure>
  );
}
