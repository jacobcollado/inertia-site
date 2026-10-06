"use client";

import type { ReactElement, ReactNode } from "react";
import { Defs, GrainRect, INK, PAPER, SEL, TILE, tornSquare, useMaterialIds, type Ids } from "@/components/material-art";

// Essay covers, in the material kit (components/material-art.tsx), on the
// same lit grain board as the homepage hero. One drawing per post, used in
// two places: full width as the post page header (1200x630), and as the
// homepage Our thoughts card, where the 4:3 tile shows the middle of the same
// board (about x 180-1020). Each composition keeps inside that middle so it
// reads in both. Each one acts out its essay's idea with material pieces
// rather than interface wireframes.

const W = 1200;
const H = 630;
const LABEL = { fontFamily: "inherit", fontSize: 22, letterSpacing: "-0.01em" } as const;

type P = { ids: Ids };

function Grainy({ ids, x, y, w, h, fill }: { ids: Ids; x: number; y: number; w: number; h: number; fill: string }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} fill={fill} />
      <GrainRect ids={ids} x={x} y={y} w={w} h={h} />
    </>
  );
}

function Torn({ ids, x, y, s, fill, seed }: { ids: Ids; x: number; y: number; s: number; fill: string; seed: number }) {
  const d = tornSquare(x, y, s, seed);
  return (
    <>
      <path d={d} fill={fill} />
      <path d={d} fill={`url(#${ids.grain})`} />
    </>
  );
}

function Pattern({ ids, x, y, w, h, kind }: { ids: Ids; x: number; y: number; w: number; h: number; kind: "halftone" | "dither" | "fine" }) {
  return (
    <>
      {kind === "fine" && <rect x={x} y={y} width={w} height={h} fill={PAPER} />}
      <rect x={x} y={y} width={w} height={h} fill={`url(#${ids[kind]})`} />
      {kind === "fine" && <rect x={x} y={y} width={w} height={h} stroke={INK} strokeWidth={1.5} />}
    </>
  );
}

// The blue selection frame with square handles, at cover scale.
function Sel({ x, y, w, h, tag }: { x: number; y: number; w: number; h: number; tag?: string }) {
  const s = 12;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} stroke={SEL} strokeWidth={2.5} />
      {[[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([cx, cy]) => (
        <rect key={`${cx}-${cy}`} x={cx - s / 2} y={cy - s / 2} width={s} height={s} fill={PAPER} stroke={SEL} strokeWidth={2.5} />
      ))}
      {tag && (
        <g transform={`translate(${x + w / 2} ${y + h + 20})`}>
          <rect x={-(tag.length * 6.4 + 14)} width={tag.length * 12.8 + 28} height={32} rx={6} fill={SEL} />
          <text x={0} y={22} textAnchor="middle" fill={PAPER} {...LABEL} fontSize={18}>
            {tag}
          </text>
        </g>
      )}
    </g>
  );
}

function Label({ x, y, children, anchor = "start", color = INK, opacity = 0.5 }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; color?: string; opacity?: number }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fillOpacity={opacity} {...LABEL}>
      {children}
    </text>
  );
}

// consistency-beats-novelty: fifteen identical pieces, and the selection is
// around the whole set, because the system is what holds.
function Coherence({ ids }: P) {
  const S = 92, G = 26, X0 = 600 - (5 * S + 4 * G) / 2, Y0 = 315 - (3 * S + 2 * G) / 2;
  return (
    <>
      {Array.from({ length: 15 }, (_, i) => (
        <Grainy key={i} ids={ids} x={X0 + (i % 5) * (S + G)} y={Y0 + Math.floor(i / 5) * (S + G)} w={S} h={S} fill={i === 7 ? SEL : INK} />
      ))}
      <Sel x={X0 - 18} y={Y0 - 18} w={5 * S + 4 * G + 36} h={3 * S + 2 * G + 36} />
    </>
  );
}

// copy-is-design: the same piece twice. The words are the only difference,
// and they change what it is.
function Tone({ ids }: P) {
  return (
    <>
      <rect x={410} y={170} width={380} height={110} stroke={INK} strokeOpacity={0.4} strokeWidth={2} strokeDasharray="10 10" />
      <Label x={600} y={236} anchor="middle" opacity={0.35}>
        <tspan fontSize={40}>Submit</tspan>
      </Label>
      <Grainy ids={ids} x={410} y={340} w={380} h={110} fill={INK} />
      <text x={600} y={407} textAnchor="middle" fill={PAPER} {...LABEL} fontSize={40}>
        Send it over
      </text>
      <Sel x={410} y={340} w={380} h={110} />
    </>
  );
}

// design-systems-that-scale: three pieces on the left make every page on the
// right.
function FewerComponents({ ids }: P) {
  const parts = [
    { y: 168, fill: "blue" },
    { y: 278, fill: "ink" },
    { y: 388, fill: "halftone" },
  ] as const;
  const piece = (kind: (typeof parts)[number]["fill"], x: number, y: number, s: number) =>
    kind === "halftone" ? <Pattern ids={ids} x={x} y={y} w={s} h={s} kind="halftone" /> : <Grainy ids={ids} x={x} y={y} w={s} h={s} fill={kind === "blue" ? SEL : INK} />;
  const pages = Array.from({ length: 8 }, (_, i) => ({ x: 560 + (i % 4) * 104, y: 180 + Math.floor(i / 4) * 150 }));
  return (
    <>
      {parts.map((p) =>
        [0, 1].map((r) => (
          <path
            key={`${p.y}-${r}`}
            d={`M 350 ${p.y + 37} C 460 ${p.y + 37}, 450 ${pages[r * 4].y + 60}, 556 ${pages[r * 4].y + 60}`}
            stroke={INK}
            strokeOpacity={0.2}
            strokeWidth={2}
            strokeDasharray="6 8"
          />
        )),
      )}
      {parts.map((p) => <g key={p.y}>{piece(p.fill, 276, p.y, 74)}</g>)}
      <Sel x={262} y={154} w={102} h={322} />
      {pages.map((pg, i) => (
        <g key={i}>
          <rect x={pg.x} y={pg.y} width={88} height={120} fill={PAPER} stroke={INK} strokeOpacity={0.12} strokeWidth={2} />
          {piece(parts[i % 3].fill, pg.x + 12, pg.y + 12, 64)}
          {piece(parts[(i + 1) % 3].fill, pg.x + 12, pg.y + 84, 24)}
          {piece(parts[(i + 2) % 3].fill, pg.x + 44, pg.y + 84, 24)}
        </g>
      ))}
    </>
  );
}

// someone-still-has-to-pick: a scatter of attempts, every finish, narrowing
// to one picked piece.
function Narrowing({ ids }: P) {
  const rand = (n: number) => {
    const v = Math.sin(n * 12.9898) * 43758.5453;
    return v - Math.floor(v);
  };
  // Rounded so server and client agree (this renders in hydrated components).
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const kinds = ["halftone", "dither", "fine", "ink", "outline"] as const;
  const tiles = Array.from({ length: 34 }, (_, i) => ({ x: r1(230 + rand(i + 1) * 340), y: r1(140 + rand(i + 101) * 330), k: kinds[i % kinds.length] }));
  return (
    <>
      {tiles.map((t, i) => (
        <line key={`l${i}`} x1={t.x + 13} y1={t.y + 13} x2={720} y2={315} stroke={INK} strokeOpacity={0.07} strokeWidth={1.5} />
      ))}
      {tiles.map((t, i) =>
        t.k === "outline" ? (
          <rect key={i} x={t.x} y={t.y} width={26} height={26} stroke={INK} strokeOpacity={0.45} strokeWidth={1.5} strokeDasharray="4 4" />
        ) : t.k === "ink" ? (
          <rect key={i} x={t.x} y={t.y} width={26} height={26} fill={INK} />
        ) : (
          <Pattern key={i} ids={ids} x={t.x} y={t.y} w={26} h={26} kind={t.k} />
        ),
      )}
      <Torn ids={ids} x={720} y={205} s={220} fill={SEL} seed={17} />
      <Sel x={712} y={197} w={236} h={236} />
    </>
  );
}

// speed-is-a-feature: where a page's weight goes. The heavy piece is
// selected.
function Weight({ ids }: P) {
  const X = 220, Y = 260, BH = 110, T = 760;
  const segs = [
    { label: "content", w: 0.08, kind: "ink" },
    { label: "fonts", w: 0.14, kind: "dither" },
    { label: "scripts", w: 0.22, kind: "fine" },
    { label: "hero video", w: 0.56, kind: "halftone" },
  ] as const;
  let x = X;
  const placed = segs.map((s) => {
    const p = { ...s, x, px: s.w * T };
    x += p.px;
    return p;
  });
  const video = placed[3];
  return (
    <>
      <Label x={X} y={232}>page weight</Label>
      <Label x={X + T} y={232} anchor="end">2.4 MB</Label>
      {placed.map((s, i) => {
        const gx = s.x + (i ? 4 : 0);
        const gw = s.px - (i ? 4 : 0);
        return s.kind === "ink" ? (
          <Grainy key={s.label} ids={ids} x={gx} y={Y} w={gw} h={BH} fill={INK} />
        ) : (
          <Pattern key={s.label} ids={ids} x={gx} y={Y} w={gw} h={BH} kind={s.kind} />
        );
      })}
      <Sel x={video.x + 4} y={Y} w={video.px - 4} h={BH} />
      {placed.map((s, i) => (
        <Label key={s.label} x={i === 0 ? s.x : s.x + s.px / 2} y={Y + BH + 46} anchor={i === 0 ? "start" : "middle"} color={i === 3 ? SEL : INK} opacity={i === 3 ? 1 : 0.5}>
          {s.label}
        </Label>
      ))}
    </>
  );
}

// taste-is-trained: the same pair a year apart. Rough and off, then tidy and
// sure.
function YearApart({ ids }: P) {
  return (
    <>
      <Label x={380} y={150} anchor="middle" opacity={0.4}>a year ago</Label>
      <Label x={820} y={150} anchor="middle" opacity={0.6}>now</Label>
      <g transform="rotate(-4 380 330)">
        <Pattern ids={ids} x={318} y={210} w={150} h={150} kind="halftone" />
        <rect x={262} y={292} width={128} height={128} stroke={INK} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="8 8" />
      </g>
      <path d="M 560 330 H 640" stroke={INK} strokeOpacity={0.3} strokeWidth={2} strokeDasharray="6 6" />
      <polyline points="628,318 642,330 628,342" stroke={INK} strokeOpacity={0.3} strokeWidth={2} />
      <Grainy ids={ids} x={770} y={200} w={150} h={150} fill={SEL} />
      <Grainy ids={ids} x={704} y={286} w={130} h={130} fill={INK} />
      <Sel x={704} y={286} w={130} h={130} />
    </>
  );
}

// most-projects-fail-before-figma: a brief, and the line that matters is the
// one nobody read.
function Brief({ ids }: P) {
  const X = 430, Y = 90, BW = 340, BH = 450;
  const widths = [250, 220, 270, 0, 240, 200, 262, 176, 236, 140];
  return (
    <>
      <rect x={X} y={Y} width={BW} height={BH} fill={PAPER} stroke={INK} strokeOpacity={0.1} strokeWidth={2} />
      <GrainRect ids={ids} x={X} y={Y} w={BW} h={BH} />
      <Grainy ids={ids} x={X + 36} y={Y + 40} w={150} h={18} fill={INK} />
      {widths.map((w, i) => {
        const y = Y + 100 + i * 32;
        if (i === 3) {
          return (
            <g key={i}>
              <rect x={X + 26} y={y - 12} width={BW - 52} height={30} fill={SEL} fillOpacity={0.22} />
              <Grainy ids={ids} x={X + 36} y={y - 2} w={214} h={10} fill={INK} />
              <Sel x={X + 26} y={y - 12} w={BW - 52} h={30} />
            </g>
          );
        }
        return <rect key={i} x={X + 36} y={y} width={w} height={8} fill={`url(#${ids.dither})`} opacity={0.5} />;
      })}
    </>
  );
}

// the-difference-you-feel: the spacing nobody sees, redlined.
function Redlines({ ids }: P) {
  const dim = (x1: number, y1: number, x2: number, y2: number, label: string, lx: number, ly: number) => {
    const v = x1 === x2;
    const t = 9;
    return (
      <g>
        <g stroke={SEL} strokeWidth={2.5}>
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
        <Label x={lx} y={ly} color={SEL} opacity={1}>{label}</Label>
      </g>
    );
  };
  return (
    <>
      <Grainy ids={ids} x={420} y={150} w={220} h={220} fill={SEL} />
      <Grainy ids={ids} x={680} y={150} w={110} h={110} fill={INK} />
      <Pattern ids={ids} x={680} y={300} w={110} h={70} kind="halftone" />
      <Grainy ids={ids} x={420} y={410} w={370} h={40} fill={INK} />
      {dim(640, 205, 680, 205, "40", 646, 192)}
      {dim(735, 260, 735, 300, "40", 745, 287)}
      {dim(530, 370, 530, 410, "40", 540, 397)}
    </>
  );
}

const COVERS: Record<string, (p: P) => ReactElement> = {
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
  const ids = useMaterialIds();
  const Cover = COVERS[slug];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} fill="none" aria-hidden="true">
      <Defs ids={ids} />
      <defs>
        <radialGradient id={`${ids.grain}-light`} cx="50%" cy="45%" r="65%">
          <stop offset="0" stopColor={PAPER} stopOpacity="0.55" />
          <stop offset="1" stopColor={PAPER} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={TILE} />
      <rect width={W} height={H} fill={`url(#${ids.grain}-light)`} />
      <rect width={W} height={H} fill={`url(#${ids.grain})`} />
      {Cover && <Cover ids={ids} />}
    </svg>
  );
}
