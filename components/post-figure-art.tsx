"use client";

import type { ReactElement, ReactNode } from "react";
import { Defs, GrainRect, INK, PAPER, SEL, useMaterialIds, type Ids } from "@/components/material-art";

// In-body figure drawings for blog posts, in the material kit
// (components/material-art.tsx), matching the post covers: grainy ink and
// blue, halftone, dither, pixel grid, dashed outlines, and the blue
// selection frame marking the one thing each figure is about. Picked by
// app/blog/[slug]/page.tsx through postFigure() in post-figures.tsx.

type P = { ids: Ids };
type Finish = "ink" | "blue" | "halftone" | "dither" | "fine" | "outline" | "paper";

function Piece({ ids, f, x, y, w, h }: { ids: Ids; f: Finish; x: number; y: number; w: number; h: number }) {
  switch (f) {
    case "ink":
    case "blue":
      return (
        <>
          <rect x={x} y={y} width={w} height={h} fill={f === "ink" ? INK : SEL} />
          <GrainRect ids={ids} x={x} y={y} w={w} h={h} />
        </>
      );
    case "halftone":
    case "dither":
      return <rect x={x} y={y} width={w} height={h} fill={`url(#${ids[f]})`} />;
    case "fine":
      return (
        <>
          <rect x={x} y={y} width={w} height={h} fill={PAPER} />
          <rect x={x} y={y} width={w} height={h} fill={`url(#${ids.fine})`} />
          <rect x={x} y={y} width={w} height={h} stroke={INK} strokeWidth={1} />
        </>
      );
    case "outline":
      return <rect x={x} y={y} width={w} height={h} stroke={INK} strokeOpacity={0.45} strokeWidth={1.2} strokeDasharray="4 4" />;
    case "paper":
      return (
        <>
          <rect x={x} y={y} width={w} height={h} fill={PAPER} stroke={INK} strokeOpacity={0.1} />
          <GrainRect ids={ids} x={x} y={y} w={w} h={h} />
        </>
      );
  }
}

function Sel({ x, y, w, h, dashed = false }: { x: number; y: number; w: number; h: number; dashed?: boolean }) {
  const s = 6;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} stroke={SEL} strokeWidth={1.4} strokeDasharray={dashed ? "3 4" : undefined} />
      {[[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([cx, cy]) => (
        <rect key={`${cx}-${cy}`} x={cx - s / 2} y={cy - s / 2} width={s} height={s} fill={PAPER} stroke={SEL} strokeWidth={1.4} />
      ))}
    </g>
  );
}

function Label({ x, y, children, anchor = "start", color = INK, opacity = 0.55, size = 14 }: {
  x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; color?: string; opacity?: number; size?: number;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fill={color} fillOpacity={opacity} fontFamily="inherit" style={{ letterSpacing: "-0.01em" }}>
      {children}
    </text>
  );
}

function Dim({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const v = x1 === x2;
  const t = 5;
  return (
    <g stroke={SEL} strokeWidth={1.4}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {v ? (
        <>
          <line x1={x1 - t} y1={y1} x2={x1 + t} y2={y1} />
          <line x1={x2 - t} y1={y2} x2={x2 + t} y2={y2} />
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 - t} x2={x1} y2={y1 + t} />
          <line x1={x2} y1={y2 - t} x2={x2} y2={y2 + t} />
        </>
      )}
    </g>
  );
}

/* someone-still-has-to-pick: forty directions, three kept. */
const FORTY: Finish[] = ["halftone", "dither", "fine", "outline", "ink", "blue"];
function FortyDirections({ ids }: P) {
  const S = 44, G = 10, X0 = 10, Y0 = 8;
  const kept = new Set([7, 22, 33]);
  return (
    <>
      {Array.from({ length: 40 }, (_, i) => {
        const x = X0 + (i % 10) * (S + G);
        const y = Y0 + Math.floor(i / 10) * (S + G);
        const f = FORTY[(i * 7 + Math.floor(i / 10)) % FORTY.length];
        return (
          <g key={i} opacity={kept.has(i) ? 1 : 0.35}>
            <Piece ids={ids} f={f} x={x} y={y} w={S} h={S} />
          </g>
        );
      })}
      {[...kept].map((i) => (
        <Sel key={i} x={X0 + (i % 10) * (S + G) - 3} y={Y0 + Math.floor(i / 10) * (S + G) - 3} w={S + 6} h={S + 6} />
      ))}
    </>
  );
}

/* taste-is-trained: the work rises year by year toward a bar set on day one. */
function TasteGap({ ids }: P) {
  const BASE = 206, BAR = 46, W = 84, G = 22, X0 = 26;
  const heights = [52, 80, 108, 136, BASE - BAR];
  const finishes: Finish[] = ["outline", "halftone", "dither", "ink", "blue"];
  const x = (i: number) => X0 + i * (W + G);
  return (
    <>
      <line x1={X0 - 6} y1={BAR} x2={x(4) + W + 6} y2={BAR} stroke={SEL} strokeWidth={1.4} strokeDasharray="3 4" />
      <Label x={X0 - 6} y={BAR - 12} color={SEL} opacity={1}>your taste</Label>
      <line x1={X0 - 6} y1={BASE} x2={x(4) + W + 6} y2={BASE} stroke={INK} strokeOpacity={0.18} />
      {heights.map((h, i) => (
        <g key={i} transform={`rotate(${(4 - i) * -1.2} ${x(i) + W / 2} ${BASE})`}>
          <Piece ids={ids} f={finishes[i]} x={x(i)} y={BASE - h} w={W} h={h} />
        </g>
      ))}
      {heights.map((_, i) => (
        <Label key={i} x={x(i) + W / 2} y={BASE + 22} anchor="middle" size={13} opacity={0.4}>{`year ${i + 1}`}</Label>
      ))}
      <Dim x1={x(0) + W / 2} y1={BAR + 6} x2={x(0) + W / 2} y2={BASE - heights[0] - 8} />
      <Label x={x(0) + W / 2 + 10} y={(BAR + BASE - heights[0]) / 2 + 5} color={SEL} opacity={1} size={13}>the gap</Label>
      <Sel x={x(4)} y={BAR} w={W} h={heights[4]} />
    </>
  );
}

/* speed-is-a-feature: the same 2.4 seconds, waited two ways. */
function PerceivedSpeed({ ids }: P) {
  const X0 = 20, PX = 520 / 3;
  const at = (s: number) => X0 + s * PX;
  const row = (y: number, skeleton: boolean) => (
    <g>
      {skeleton ? (
        <>
          <Piece ids={ids} f="outline" x={at(0)} y={y} w={at(0.3) - at(0) - 3} h={36} />
          <Piece ids={ids} f="fine" x={at(0.3)} y={y} w={at(2.4) - at(0.3) - 3} h={36} />
        </>
      ) : (
        <Piece ids={ids} f="outline" x={at(0)} y={y} w={at(2.4) - at(0) - 3} h={36} />
      )}
      <Piece ids={ids} f="ink" x={at(2.4)} y={y} w={at(3) - at(2.4)} h={36} />
    </g>
  );
  return (
    <>
      <Label x={X0} y={40}>Blank until ready</Label>
      {row(52, false)}
      <Label x={X0} y={124}>Layout first</Label>
      {row(136, true)}
      <Sel x={at(0.3)} y={136} w={at(2.4) - at(0.3) - 3} h={36} />
      <line x1={at(2.4)} y1={24} x2={at(2.4)} y2={190} stroke={SEL} strokeWidth={1.4} strokeDasharray="3 4" />
      <Label x={at(2.4) - 8} y={40} anchor="end" color={SEL} opacity={1}>loaded at 2.4s</Label>
      <line x1={X0} y1={204} x2={at(3)} y2={204} stroke={INK} strokeOpacity={0.2} strokeDasharray="4 4" />
      {[0, 1, 2, 3].map((s) => (
        <Label key={s} x={at(s)} y={224} anchor={s === 0 ? "start" : s === 3 ? "end" : "middle"} size={13} opacity={0.4}>{`${s}s`}</Label>
      ))}
    </>
  );
}

/* most-projects-fail-before-figma: one request, three possible problems. */
function RequestVersusProblem({ ids }: P) {
  const boxes = [
    { x: 10, label: "Traffic doesn't convert" },
    { x: 195, label: "Sales re-explains us" },
    { x: 380, label: "A rival just shipped" },
  ];
  const BW = 170, BY = 160, BH = 48, chosen = 1;
  return (
    <>
      <Label x={280} y={20} anchor="middle" size={13} opacity={0.4}>the request</Label>
      <Piece ids={ids} f="ink" x={180} y={32} w={200} h={44} />
      <Label x={280} y={59} anchor="middle" color={PAPER} opacity={1}>Redesign the site</Label>
      {boxes.map((b) => (
        <path key={b.x} d={`M 280 76 C 280 118, ${b.x + BW / 2} 118, ${b.x + BW / 2} ${BY}`} stroke={INK} strokeOpacity={0.25} strokeDasharray="4 4" />
      ))}
      {boxes.map((b, i) => (
        <g key={b.label}>
          <Piece ids={ids} f={i === chosen ? "paper" : "outline"} x={b.x} y={BY} w={BW} h={BH} />
          <Label x={b.x + BW / 2} y={BY + 29} anchor="middle" size={13} opacity={i === chosen ? 0.85 : 0.45}>{b.label}</Label>
        </g>
      ))}
      <Sel x={boxes[chosen].x} y={BY} w={BW} h={BH} />
      <Label x={280} y={238} anchor="middle" size={13} opacity={0.4}>the problems it might be hiding</Label>
    </>
  );
}

/* the-difference-you-feel: centred by the maths, and centred by eye. */
function OpticalCentre({ ids }: P) {
  const disc = (cx: number, nudge: number, label: string, math: boolean) => {
    const cy = 112;
    const pts = `${cx - 30 + nudge},${cy - 35} ${cx - 30 + nudge},${cy + 35} ${cx + 30 + nudge},${cy}`;
    const centroidX = cx - 10 + nudge;
    return (
      <g>
        <circle cx={cx} cy={cy} r={84} fill={`url(#${ids.halftone})`} fillOpacity={0.35} />
        <circle cx={cx} cy={cy} r={84} stroke={INK} strokeOpacity={0.12} />
        <line x1={cx} y1={cy - 96} x2={cx} y2={cy + 96} stroke={SEL} strokeOpacity={0.8} strokeDasharray="3 4" />
        <line x1={cx - 96} y1={cy} x2={cx + 96} y2={cy} stroke={SEL} strokeOpacity={0.8} strokeDasharray="3 4" />
        <polygon points={pts} fill={INK} />
        <polygon points={pts} fill={`url(#${ids.grain})`} />
        {math && <Sel x={cx - 30} y={cy - 35} w={60} h={70} />}
        <circle cx={centroidX} cy={cy} r={4} fill={SEL} stroke={PAPER} strokeWidth={1.4} />
        <Label x={cx} y={232} anchor="middle">{label}</Label>
      </g>
    );
  };
  return (
    <>
      {disc(150, 0, "centred by the maths", true)}
      {disc(410, 10, "centred by eye", false)}
    </>
  );
}

/* copy-is-design: placeholder text, then the headline it really shipped with. */
function LengthIsLayout({ ids }: P) {
  const card = (x: number, real: boolean) => {
    const heading = real ? [150, 162, 104] : [140];
    const bodyY = 44 + heading.length * 18 + 12;
    const body = real ? [168, 172, 150, 120] : [160, 160, 160];
    const buttonY = bodyY + body.length * 12 + 14;
    return (
      <g>
        <Piece ids={ids} f="paper" x={x} y={12} w={200} h={232} />
        {heading.map((w, i) => (
          <Piece key={i} ids={ids} f="ink" x={x + 18} y={44 + i * 18} w={w} h={11} />
        ))}
        {body.map((w, i) => (
          <rect key={i} x={x + 18} y={bodyY + i * 12} width={w} height={6} fill={`url(#${ids.dither})`} opacity={0.45} />
        ))}
        <Piece ids={ids} f="blue" x={x + 18} y={buttonY} w={86} h={26} />
        {real && <Sel x={x + 12} y={38} w={176} h={heading.length * 18 + 4} />}
        <Label x={x + 100} y={30} anchor="middle" size={12} opacity={0.4}>{real ? "real headline" : "lorem ipsum"}</Label>
      </g>
    );
  };
  return (
    <>
      {card(50, false)}
      {card(310, true)}
    </>
  );
}

/* design-systems-that-scale: page one fits, page ten is the test. */
function TenthPage({ ids }: P) {
  const W = 46, G = 8, X0 = 14, Y = 26, H = 124;
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => {
        const x = X0 + i * (W + G);
        const last = i === 9;
        return (
          <g key={i} opacity={last ? 1 : 0.65}>
            <Piece ids={ids} f="paper" x={x} y={Y} w={W} h={H} />
            <Piece ids={ids} f="ink" x={x + 6} y={Y + 8} w={18} h={5} />
            <Piece ids={ids} f="halftone" x={x + 6} y={Y + 20} w={W - 12} h={30} />
            <rect x={x + 6} y={Y + 58} width={W - 14} height={4} fill={`url(#${ids.dither})`} opacity={0.5} />
            <rect x={x + 6} y={Y + 67} width={W - 20} height={4} fill={`url(#${ids.dither})`} opacity={0.5} />
            {last ? (
              // The page nobody planned for: a block that breaks out of the
              // grid in a colour the system never defined.
              <Piece ids={ids} f="blue" x={x + 10} y={Y + 80} w={W + 6} h={22} />
            ) : (
              <Piece ids={ids} f="fine" x={x + 6} y={Y + 80} w={W - 12} h={22} />
            )}
          </g>
        );
      })}
      <Sel x={X0 + 9 * (W + G)} y={Y} w={W} h={H} dashed />
      <Label x={X0 + W / 2} y={176} anchor="middle" size={13} opacity={0.4}>page 1</Label>
      <Label x={X0 + 9 * (W + G) + W / 2} y={176} anchor="middle" size={13} color={SEL} opacity={1}>page 10</Label>
    </>
  );
}

/* consistency-beats-novelty: the button that drifted, and the third grey. */
function DriftAndGreys({ ids }: P) {
  const greys = ["var(--fig-grey)", "var(--fig-grey)", "var(--fig-grey-2)"];
  return (
    <>
      <line x1={60} y1={16} x2={60} y2={196} stroke={SEL} strokeWidth={1.4} strokeDasharray="3 4" />
      <Piece ids={ids} f="ink" x={60} y={32} w={170} h={13} />
      <rect x={60} y={60} width={190} height={6} fill={`url(#${ids.dither})`} opacity={0.45} />
      <rect x={60} y={74} width={150} height={6} fill={`url(#${ids.dither})`} opacity={0.45} />
      {/* Drawn 6 units off rather than a literal 2px so the drift shows at
          figure scale; the label carries the real number. */}
      <Piece ids={ids} f="ink" x={54} y={104} w={110} h={34} />
      <Sel x={54} y={104} w={110} h={34} />
      <Dim x1={54} y1={160} x2={60} y2={160} />
      <Label x={70} y={165} color={SEL} opacity={1} size={13}>2px off</Label>
      {greys.map((g, i) => {
        const x = 330 + i * 76;
        return (
          <g key={i}>
            <rect x={x} y={56} width={64} height={64} fill={g} />
            <GrainRect ids={ids} x={x} y={56} w={64} h={64} />
            <Label x={x + 32} y={146} anchor="middle" size={12} opacity={i === 2 ? 0.75 : 0.4}>{g}</Label>
          </g>
        );
      })}
      <Sel x={482} y={56} w={64} h={64} />
    </>
  );
}

const FIGURES: Record<string, { viewBox: string; caption: string; Art: (p: P) => ReactElement }> = {
  FortyDirections: { viewBox: "0 0 560 230", caption: "Forty directions before lunch. Three are worth keeping, and choosing them is the actual job.", Art: FortyDirections },
  TasteGap: { viewBox: "0 0 560 240", caption: "Taste shows up years before the ability to meet it. The gap closes through reps, not insight.", Art: TasteGap },
  PerceivedSpeed: { viewBox: "0 0 560 232", caption: "The same 2.4 seconds. One is a blank wait the whole time, the other shows the layout at 0.3s and reads as fast.", Art: PerceivedSpeed },
  RequestVersusProblem: { viewBox: "0 0 560 250", caption: "A redesign is the request. The brief's job is finding out which of these is the real problem.", Art: RequestVersusProblem },
  OpticalCentre: { viewBox: "0 0 560 244", caption: "Both are centred. The left by its bounding box, the right nudged until its weight, the blue dot, sits on the centre.", Art: OpticalCentre },
  LengthIsLayout: { viewBox: "0 0 560 256", caption: "The same card, with placeholder text and with the headline it actually shipped with. Nobody designed the three-line version.", Art: LengthIsLayout },
  TenthPage: { viewBox: "0 0 560 190", caption: "Page one fits because the components were drawn around it. Page ten is the first real test of the system.", Art: TenthPage },
  DriftAndGreys: { viewBox: "0 0 560 220", caption: "Most of it is maintenance: the button that drifted two pixels off the grid, and the third grey nobody chose.", Art: DriftAndGreys },
};

// The panel is the covers' board: tile grey, a soft light toward the middle,
// and the grain texture, all as CSS backgrounds.
export function PostFigureArt({ name }: { name: string }) {
  const ids = useMaterialIds();
  const fig = FIGURES[name];
  if (!fig) return null;
  return (
    <figure className="m-0">
      <div
        className="rounded-[6px] px-4 py-6 sm:px-8 sm:py-8"
        style={{
          backgroundColor: "var(--tile)",
          backgroundImage: "radial-gradient(ellipse at 50% 45%, color-mix(in srgb, var(--paper) 55%, transparent), transparent 70%), url(/textures/grain.png)",
          backgroundSize: "100% 100%, 96px 96px",
        }}
      >
        <svg viewBox={fig.viewBox} className="block h-auto w-full" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <Defs ids={ids} />
          <fig.Art ids={ids} />
        </svg>
      </div>
      <figcaption className="mt-3 text-[13px] sm:text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
        {fig.caption}
      </figcaption>
    </figure>
  );
}
