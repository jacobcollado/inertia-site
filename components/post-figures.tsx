import type React from "react";

/* In-body figures for blog posts, one per post, placed after the first
   paragraph of the section it illustrates (see ArticleBody in
   app/blog/[slug]/page.tsx). Each one argues its section's point in the
   homepage's visual language: flat #f1f1f1 panel, near-black ink at low
   opacities, dashed hairlines, and the Figma-blue selection frame marking
   the one thing the figure is about. Pure SVG, no hooks, server-safe. */

const INK = "#1a1a1a";
const SEL = "#6bb8ef";
const PAPER = "#ffffff";

// Figma-style selection: 1px frame with four square handles. `k` scales the
// stroke and handles for the covers, whose viewBox is about twice as wide.
function Sel({ x, y, w, h, dashed = false, k = 1 }: { x: number; y: number; w: number; h: number; dashed?: boolean; k?: number }) {
  const H = 6 * k;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={SEL} strokeWidth={1.25 * k} strokeDasharray={dashed ? `${3 * k} ${4 * k}` : undefined} />
      {[
        [x, y],
        [x + w, y],
        [x, y + h],
        [x + w, y + h],
      ].map(([cx, cy]) => (
        <rect key={`${cx}-${cy}`} x={cx - H / 2} y={cy - H / 2} width={H} height={H} fill={PAPER} stroke={SEL} strokeWidth={1.25 * k} />
      ))}
    </g>
  );
}

function Label({ x, y, children, anchor = "start", color = INK, opacity = 0.55, size = 14 }: {
  x: number;
  y: number;
  children: React.ReactNode;
  anchor?: "start" | "middle" | "end";
  color?: string;
  opacity?: number;
  size?: number;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fill={color} fillOpacity={opacity} style={{ letterSpacing: "-0.01em" }}>
      {children}
    </text>
  );
}

function Figure({ viewBox, caption, children }: { viewBox: string; caption: string; children: React.ReactNode }) {
  return (
    <figure className="m-0">
      <div className="rounded-xl px-4 py-6 sm:px-8 sm:py-8" style={{ background: "#f1f1f1" }}>
        <svg viewBox={viewBox} className="block h-auto w-full" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {children}
        </svg>
      </div>
      <figcaption className="mt-3 text-[13px] sm:text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
        {caption}
      </figcaption>
    </figure>
  );
}

/* ── judgment-over-output: forty directions, three kept ──────────────── */
function FortyDirections() {
  const cols = 10;
  const W = 46, Hh = 50, G = 8, X0 = 14, Y0 = 8;
  const kept = new Set([7, 22, 33]);
  return (
    <Figure viewBox="0 0 560 240" caption="Forty directions before lunch. Three are worth keeping, and choosing them is the actual job.">
      {Array.from({ length: 40 }, (_, i) => {
        const x = X0 + (i % cols) * (W + G);
        const y = Y0 + Math.floor(i / cols) * (Hh + G);
        const on = kept.has(i);
        const o = on ? 1 : 0.4;
        // Each tile gets its own small layout so the grid reads as forty
        // different attempts rather than one pattern repeated.
        const barW = 18 + ((i * 7) % 20);
        const blockH = 10 + ((i * 5) % 12);
        const alignRight = i % 3 === 0;
        return (
          <g key={i} opacity={o}>
            <rect x={x} y={y} width={W} height={Hh} rx={4} fill={PAPER} stroke={INK} strokeOpacity={0.08} />
            <rect x={alignRight ? x + W - 6 - barW : x + 6} y={y + 7} width={barW} height={4} rx={2} fill={INK} fillOpacity={0.55} />
            <rect x={x + 6} y={y + 16} width={W - 12} height={blockH} rx={2} fill={INK} fillOpacity={on ? 0.14 : 0.08} />
            <rect x={x + 6} y={y + 20 + blockH} width={W - 22} height={3} rx={1.5} fill={INK} fillOpacity={0.14} />
          </g>
        );
      })}
      {[...kept].map((i) => (
        <Sel key={i} x={X0 + (i % cols) * (W + G)} y={Y0 + Math.floor(i / cols) * (Hh + G)} w={W} h={Hh} />
      ))}
    </Figure>
  );
}

/* ── taste-is-trained: taste arrives years before the ability ────────── */
// Your taste sets the bar on day one; the work takes years to reach it.
// One card per year, each taller and tidier than the last, rising to the
// line. The gap is just the empty space above the early cards.
function TasteGap() {
  const BASE = 206, BAR = 46, W = 84, G = 22, X0 = 26;
  const heights = [52, 80, 108, 136, BASE - BAR];
  const x = (i: number) => X0 + i * (W + G);
  return (
    <Figure viewBox="0 0 560 240" caption="Taste shows up years before the ability to meet it. The gap closes through reps, not insight.">
      <line x1={X0 - 6} y1={BAR} x2={x(4) + W + 6} y2={BAR} stroke={SEL} strokeWidth={1.25} strokeDasharray="3 4" />
      <Label x={X0 - 6} y={BAR - 12} color={SEL} opacity={1}>your taste</Label>
      <line x1={X0 - 6} y1={BASE} x2={x(4) + W + 6} y2={BASE} stroke={INK} strokeOpacity={0.15} />

      {heights.map((h, i) => {
        const cx = x(i), top = BASE - h;
        // Early work: every block a little off. It settles year by year.
        const j = (n: number) => n * (4 - i) * 0.5;
        const blockH = Math.max(6, h - 40);
        return (
          <g key={i}>
            <rect x={cx} y={top} width={W} height={h} rx={6} fill={PAPER} stroke={INK} strokeOpacity={0.1} />
            <rect x={cx + 10 + j(2)} y={top + 10} width={34 + j(3)} height={5} rx={2.5} fill={INK} fillOpacity={0.6} />
            <rect x={cx + 10 + j(-1)} y={top + 21} width={W - 20} height={blockH} rx={3} fill={INK} fillOpacity={0.08} />
            <rect x={cx + 10 + j(3)} y={top + h - 12} width={W - 36 - j(4)} height={4} rx={2} fill={INK} fillOpacity={0.18} />
            <Label x={cx + W / 2} y={BASE + 22} anchor="middle" size={13} opacity={0.4}>{`year ${i + 1}`}</Label>
          </g>
        );
      })}

      {/* The gap, measured once on year one. */}
      <line x1={x(0) + W / 2} y1={BAR + 6} x2={x(0) + W / 2} y2={BASE - heights[0] - 6} stroke={SEL} strokeWidth={1.25} />
      <line x1={x(0) + W / 2 - 5} y1={BAR + 6} x2={x(0) + W / 2 + 5} y2={BAR + 6} stroke={SEL} strokeWidth={1.25} />
      <line x1={x(0) + W / 2 - 5} y1={BASE - heights[0] - 6} x2={x(0) + W / 2 + 5} y2={BASE - heights[0] - 6} stroke={SEL} strokeWidth={1.25} />
      <Label x={x(0) + W / 2 + 10} y={(BAR + BASE - heights[0]) / 2 + 5} color={SEL} opacity={1} size={13}>the gap</Label>

      <Sel x={x(4)} y={BAR} w={W} h={heights[4]} />
    </Figure>
  );
}

/* ── speed-is-a-feature: same load time, different wait ──────────────── */
function PerceivedSpeed() {
  const X0 = 20, PX = 520 / 3;
  const at = (s: number) => X0 + s * PX;
  const row = (y: number, skeleton: boolean) => (
    <g>
      {skeleton ? (
        <>
          <rect x={at(0)} y={y} width={at(0.3) - at(0)} height={36} rx={4} fill="none" stroke={INK} strokeOpacity={0.2} strokeDasharray="3 4" />
          <rect x={at(0.3) + 2} y={y} width={at(2.4) - at(0.3) - 4} height={36} rx={4} fill={INK} fillOpacity={0.06} />
          {[0, 1].map((k) => (
            <rect key={k} x={at(0.3) + 12} y={y + 10 + k * 11} width={k ? 150 : 230} height={5} rx={2.5} fill={INK} fillOpacity={0.12} />
          ))}
        </>
      ) : (
        <rect x={at(0)} y={y} width={at(2.4) - at(0) - 2} height={36} rx={4} fill="none" stroke={INK} strokeOpacity={0.2} strokeDasharray="3 4" />
      )}
      <rect x={at(2.4) + 2} y={y} width={at(3) - at(2.4) - 2} height={36} rx={4} fill={INK} fillOpacity={0.85} />
      <rect x={at(2.4) + 12} y={y + 10} width={48} height={5} rx={2.5} fill={PAPER} fillOpacity={0.9} />
      <rect x={at(2.4) + 12} y={y + 21} width={30} height={5} rx={2.5} fill={PAPER} fillOpacity={0.6} />
    </g>
  );
  return (
    <Figure viewBox="0 0 560 230" caption="The same 2.4 seconds. One is a blank wait the whole time, the other shows the layout at 0.3s and reads as fast.">
      <Label x={X0} y={40}>Blank until ready</Label>
      {row(52, false)}
      <Label x={X0} y={124}>Layout first</Label>
      {row(136, true)}
      <line x1={at(2.4)} y1={24} x2={at(2.4)} y2={190} stroke={SEL} strokeWidth={1.25} strokeDasharray="3 4" />
      <Label x={at(2.4) - 8} y={40} anchor="end" color={SEL} opacity={1}>loaded at 2.4s</Label>
      <line x1={X0} y1={200} x2={at(3)} y2={200} stroke={INK} strokeOpacity={0.2} strokeDasharray="4 4" />
      {[0, 1, 2, 3].map((s) => (
        <Label key={s} x={at(s)} y={222} anchor={s === 0 ? "start" : s === 3 ? "end" : "middle"} size={13} opacity={0.4}>{`${s}s`}</Label>
      ))}
    </Figure>
  );
}

/* ── the-brief-is-the-product: the request versus the problems ───────── */
function RequestVersusProblem() {
  const boxes = [
    { x: 10, label: "Traffic doesn't convert" },
    { x: 195, label: "Sales re-explains us" },
    { x: 380, label: "A rival just shipped" },
  ];
  const BW = 170, BY = 160, BH = 48;
  const chosen = 1;
  return (
    <Figure viewBox="0 0 560 250" caption="A redesign is the request. The brief's job is finding out which of these is the real problem.">
      <Label x={280} y={20} anchor="middle" size={13} opacity={0.4}>the request</Label>
      <rect x={180} y={32} width={200} height={44} rx={6} fill={PAPER} stroke={INK} strokeOpacity={0.12} />
      <Label x={280} y={59} anchor="middle" opacity={0.85}>Redesign the site</Label>
      {boxes.map((b) => (
        <path
          key={b.x}
          d={`M 280 76 C 280 118, ${b.x + BW / 2} 118, ${b.x + BW / 2} ${BY}`}
          stroke={INK}
          strokeOpacity={0.22}
          strokeDasharray="4 4"
        />
      ))}
      {boxes.map((b, i) => (
        <g key={b.label}>
          <rect x={b.x} y={BY} width={BW} height={BH} rx={6} fill={PAPER} stroke={INK} strokeOpacity={0.1} />
          <Label x={b.x + BW / 2} y={BY + 29} anchor="middle" size={13} opacity={i === chosen ? 0.85 : 0.45}>{b.label}</Label>
        </g>
      ))}
      <Sel x={boxes[chosen].x} y={BY} w={BW} h={BH} />
      <Label x={280} y={238} anchor="middle" size={13} opacity={0.4}>the problems it might be hiding</Label>
    </Figure>
  );
}

/* ── the-invisible-details: optical versus mathematical centring ─────── */
function OpticalCentre() {
  const disc = (cx: number, nudge: number, label: string, math: boolean) => {
    const cy = 112;
    const pts = `${cx - 30 + nudge},${cy - 35} ${cx - 30 + nudge},${cy + 35} ${cx + 30 + nudge},${cy}`;
    // A triangle's visual mass sits at its centroid, a third of the way in.
    const centroidX = cx - 10 + nudge;
    return (
      <g>
        <circle cx={cx} cy={cy} r={84} fill={PAPER} stroke={INK} strokeOpacity={0.08} />
        <line x1={cx} y1={cy - 96} x2={cx} y2={cy + 96} stroke={SEL} strokeOpacity={0.7} strokeDasharray="3 4" />
        <line x1={cx - 96} y1={cy} x2={cx + 96} y2={cy} stroke={SEL} strokeOpacity={0.7} strokeDasharray="3 4" />
        <polygon points={pts} fill={INK} fillOpacity={0.85} />
        {math && <Sel x={cx - 30} y={cy - 35} w={60} h={70} />}
        <circle cx={centroidX} cy={cy} r={3.5} fill={SEL} stroke={PAPER} strokeWidth={1.25} />
        <Label x={cx} y={232} anchor="middle">{label}</Label>
      </g>
    );
  };
  return (
    <Figure viewBox="0 0 560 244" caption="Both are centred. The left by its bounding box, the right nudged until its weight, the blue dot, sits on the centre.">
      {disc(150, 0, "centred by the maths", true)}
      {disc(410, 10, "centred by eye", false)}
    </Figure>
  );
}

/* ── copy-is-design: the real headline breaks the layout ─────────────── */
function LengthIsLayout() {
  const card = (x: number, real: boolean) => {
    const heading = real ? [150, 162, 104] : [140];
    const bodyY = 44 + heading.length * 16 + 12;
    const body = real ? [168, 172, 150, 120] : [160, 160, 160];
    const buttonY = bodyY + body.length * 12 + 14;
    return (
      <g>
        <rect x={x} y={12} width={200} height={232} rx={14} fill={PAPER} stroke={INK} strokeOpacity={0.1} />
        {heading.map((w, i) => (
          <rect key={i} x={x + 18} y={44 + i * 16} width={w} height={10} rx={3} fill={INK} fillOpacity={0.75} />
        ))}
        {body.map((w, i) => (
          <rect key={i} x={x + 18} y={bodyY + i * 12} width={w} height={5} rx={2.5} fill={INK} fillOpacity={0.15} />
        ))}
        <rect x={x + 18} y={buttonY} width={86} height={26} rx={6} fill={INK} fillOpacity={0.85} />
        {real && <Sel x={x + 12} y={38} w={176} h={heading.length * 16 + 4} />}
        <Label x={x + 100} y={30} anchor="middle" size={12} opacity={0.35}>{real ? "real headline" : "lorem ipsum"}</Label>
      </g>
    );
  };
  return (
    <Figure viewBox="0 0 560 256" caption="The same card, with placeholder text and with the headline it actually shipped with. Nobody designed the three-line version.">
      {card(50, false)}
      {card(310, true)}
    </Figure>
  );
}

/* ── design-systems-that-scale: the tenth page ───────────────────────── */
function TenthPage() {
  const W = 46, G = 8, X0 = 14, Y = 26, H = 124;
  return (
    <Figure viewBox="0 0 560 190" caption="Page one fits because the components were drawn around it. Page ten is the first real test of the system.">
      {Array.from({ length: 10 }, (_, i) => {
        const x = X0 + i * (W + G);
        const last = i === 9;
        return (
          <g key={i} opacity={last ? 1 : 0.6}>
            <rect x={x} y={Y} width={W} height={H} rx={4} fill={PAPER} stroke={INK} strokeOpacity={0.1} />
            <rect x={x + 6} y={Y + 8} width={16} height={4} rx={2} fill={INK} fillOpacity={0.5} />
            <rect x={x + 6} y={Y + 20} width={W - 12} height={30} rx={2} fill={INK} fillOpacity={0.1} />
            <rect x={x + 6} y={Y + 58} width={W - 16} height={3} rx={1.5} fill={INK} fillOpacity={0.18} />
            <rect x={x + 6} y={Y + 66} width={W - 20} height={3} rx={1.5} fill={INK} fillOpacity={0.18} />
            {last ? (
              // The page nobody planned for: a block that doesn't fit the
              // grid and a one-off colour the system never defined.
              <rect x={x + 10} y={Y + 80} width={W + 4} height={22} rx={2} fill={SEL} fillOpacity={0.35} />
            ) : (
              <rect x={x + 6} y={Y + 80} width={W - 12} height={22} rx={2} fill={INK} fillOpacity={0.1} />
            )}
          </g>
        );
      })}
      <Sel x={X0 + 9 * (W + G)} y={Y} w={W} h={H} dashed />
      <Label x={X0 + W / 2} y={176} anchor="middle" size={13} opacity={0.4}>page 1</Label>
      <Label x={X0 + 9 * (W + G) + W / 2} y={176} anchor="middle" size={13} color={SEL} opacity={1}>page 10</Label>
    </Figure>
  );
}

/* ── consistency-beats-novelty: the maintenance nobody sees ──────────── */
function DriftAndGreys() {
  const greys = ["#e6e6e6", "#e6e6e6", "#e3e3e6"];
  return (
    <Figure viewBox="0 0 560 220" caption="Most of it is maintenance: the button that drifted two pixels off the grid, and the third grey nobody chose.">
      <line x1={60} y1={16} x2={60} y2={196} stroke={SEL} strokeWidth={1.25} strokeDasharray="3 4" />
      <rect x={60} y={32} width={170} height={12} rx={3} fill={INK} fillOpacity={0.75} />
      <rect x={60} y={60} width={190} height={5} rx={2.5} fill={INK} fillOpacity={0.18} />
      <rect x={60} y={74} width={150} height={5} rx={2.5} fill={INK} fillOpacity={0.18} />
      {/* Drawn 6 units off rather than a literal 2px so the drift is visible
          at figure scale; the label carries the real number. */}
      <rect x={54} y={104} width={110} height={34} rx={6} fill={INK} fillOpacity={0.85} />
      <Sel x={54} y={104} w={110} h={34} />
      <line x1={54} y1={160} x2={60} y2={160} stroke={SEL} strokeWidth={1.25} />
      <line x1={54} y1={155} x2={54} y2={165} stroke={SEL} strokeWidth={1.25} />
      <line x1={60} y1={155} x2={60} y2={165} stroke={SEL} strokeWidth={1.25} />
      <Label x={70} y={165} color={SEL} opacity={1} size={13}>2px off</Label>

      {greys.map((g, i) => {
        const x = 330 + i * 76;
        return (
          <g key={i}>
            <rect x={x} y={56} width={64} height={64} rx={6} fill={g} stroke={INK} strokeOpacity={0.06} />
            <Label x={x + 32} y={146} anchor="middle" size={12} opacity={i === 2 ? 0.75 : 0.4}>{g}</Label>
          </g>
        );
      })}
      <Sel x={482} y={56} w={64} h={64} />
    </Figure>
  );
}

// Keyed by post slug, then by the id of the section heading the figure
// belongs under (the slugified heading text, see renderMarkdown).
const POST_FIGURES: Record<string, Record<string, () => React.ReactElement>> = {
  "judgment-over-output": { "forty-options-is-its-own-problem": FortyDirections },
  "taste-is-trained": { "years-mostly-spent-wrong": TasteGap },
  "speed-is-a-feature": { "show-the-layout-before-the-data": PerceivedSpeed },
  "the-brief-is-the-product": { "nobody-actually-needs-a-redesign": RequestVersusProblem },
  "the-invisible-details": { "nudge-the-play-button-right": OpticalCentre },
  "copy-is-design": { "the-headline-that-runs-three-lines": LengthIsLayout },
  "design-systems-that-scale": { "page-one-always-fits": TenthPage },
  "consistency-beats-novelty": { "two-pixels-and-a-third-grey": DriftAndGreys },
};

export function postFigure(slug: string, headingId: string): React.ReactElement | null {
  const Fig = POST_FIGURES[slug]?.[headingId];
  return Fig ? <Fig /> : null;
}

/* ── Covers ──────────────────────────────────────────────────────────
   The post header image, one per post, in the same language as the
   figures but composed as a single centred mark on the 1200x630 panel.
   Each takes a different angle on the post than its in-body figure so the
   page doesn't show the same idea twice. */

const K = 2; // cover scale for strokes, handles and dashes

function CoverLabel({ size = 22, ...props }: React.ComponentProps<typeof Label>) {
  return <Label size={size} {...props} />;
}

// consistency-beats-novelty: every card the same, and the frame is around
// the whole set, because the system is the thing that holds.
function CoverCoherence() {
  const W = 120, H = 80, G = 24, X0 = 252, Y0 = 171;
  return (
    <>
      {Array.from({ length: 15 }, (_, i) => {
        const x = X0 + (i % 5) * (W + G);
        const y = Y0 + Math.floor(i / 5) * (H + G);
        return (
          <g key={i}>
            <rect x={x} y={y} width={W} height={H} rx={8} fill={PAPER} stroke={INK} strokeOpacity={0.1} strokeWidth={K} />
            <rect x={x + 14} y={y + 16} width={50} height={8} rx={4} fill={INK} fillOpacity={0.6} />
            <rect x={x + 14} y={y + 34} width={W - 28} height={30} rx={4} fill={INK} fillOpacity={0.08} />
          </g>
        );
      })}
      <Sel x={X0 - 14} y={Y0 - 14} w={5 * W + 4 * G + 28} h={3 * H + 2 * G + 28} k={K} />
    </>
  );
}

// copy-is-design: same button, different words, different brand.
function CoverTone() {
  return (
    <>
      <rect x={440} y={196} width={320} height={84} rx={12} fill="none" stroke={INK} strokeOpacity={0.25} strokeWidth={K} strokeDasharray="6 8" />
      <CoverLabel x={600} y={249} anchor="middle" opacity={0.3} size={34}>Submit</CoverLabel>
      <rect x={440} y={340} width={320} height={84} rx={12} fill={INK} fillOpacity={0.88} />
      <CoverLabel x={600} y={393} anchor="middle" color={PAPER} opacity={1} size={34}>Send it over</CoverLabel>
      <Sel x={440} y={340} w={320} h={84} k={K} />
    </>
  );
}

// design-systems-that-scale: three components doing the work of every page.
function CoverFewerComponents() {
  const PW = 96, PH = 130;
  const pages = Array.from({ length: 8 }, (_, i) => ({ x: 560 + (i % 4) * 116, y: 175 + Math.floor(i / 4) * 150 }));
  return (
    <>
      {[210, 315, 407].map((y, i) =>
        [0, 1].map((row) => (
          <path
            key={`${i}-${row}`}
            d={`M 334 ${y} C 450 ${y}, 450 ${pages[row * 4].y + PH / 2}, 560 ${pages[row * 4].y + PH / 2}`}
            stroke={INK}
            strokeOpacity={0.18}
            strokeWidth={K}
            strokeDasharray="6 8"
          />
        )),
      )}
      <rect x={200} y={190} width={120} height={40} rx={8} fill={INK} fillOpacity={0.85} />
      <rect x={200} y={270} width={120} height={90} rx={8} fill={PAPER} stroke={INK} strokeOpacity={0.12} strokeWidth={K} />
      <rect x={214} y={286} width={60} height={8} rx={4} fill={INK} fillOpacity={0.55} />
      <rect x={214} y={304} width={92} height={40} rx={4} fill={INK} fillOpacity={0.08} />
      <rect x={200} y={400} width={120} height={14} rx={7} fill={INK} fillOpacity={0.3} />
      <Sel x={186} y={176} w={148} h={252} k={K} />
      {pages.map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={p.y} width={PW} height={PH} rx={6} fill={PAPER} stroke={INK} strokeOpacity={0.1} strokeWidth={K} />
          <rect x={p.x + 12} y={p.y + 14} width={34} height={6} rx={3} fill={INK} fillOpacity={0.3} />
          <rect x={p.x + 12} y={p.y + 30} width={PW - 24} height={i % 2 ? 44 : 34} rx={4} fill={PAPER} stroke={INK} strokeOpacity={0.12} strokeWidth={1.5} />
          <rect x={p.x + 12} y={p.y + PH - 34} width={44} height={16} rx={4} fill={INK} fillOpacity={0.85} />
        </g>
      ))}
    </>
  );
}

// judgment-over-output: a scatter of attempts narrowing to one.
function CoverNarrowing() {
  const rand = (n: number) => {
    const v = Math.sin(n * 12.9898) * 43758.5453;
    return v - Math.floor(v);
  };
  const tiles = Array.from({ length: 40 }, (_, i) => ({ x: 210 + rand(i + 1) * 330, y: 150 + rand(i + 101) * 320 }));
  return (
    <>
      {tiles.map((t, i) => (
        <line key={`l${i}`} x1={t.x + 11} y1={t.y + 8} x2={760} y2={315} stroke={INK} strokeOpacity={0.06} strokeWidth={1.5} />
      ))}
      {tiles.map((t, i) => (
        <rect key={i} x={t.x} y={t.y} width={22} height={16} rx={3} fill={PAPER} stroke={INK} strokeOpacity={0.25} strokeWidth={1.5} />
      ))}
      <rect x={760} y={225} width={220} height={180} rx={10} fill={PAPER} stroke={INK} strokeOpacity={0.12} strokeWidth={K} />
      <rect x={784} y={250} width={110} height={12} rx={6} fill={INK} fillOpacity={0.75} />
      <rect x={784} y={278} width={172} height={64} rx={6} fill={INK} fillOpacity={0.08} />
      <rect x={784} y={360} width={70} height={24} rx={6} fill={INK} fillOpacity={0.85} />
      <Sel x={760} y={225} w={220} h={180} k={K} />
    </>
  );
}

// speed-is-a-feature: where a page's weight actually goes.
function CoverWeight() {
  const X = 200, Y = 270, H = 90, total = 800;
  const segs = [
    { label: "content", w: 0.08, fill: INK, o: 0.85 },
    { label: "fonts", w: 0.14, fill: INK, o: 0.25 },
    { label: "scripts", w: 0.22, fill: INK, o: 0.14 },
    { label: "hero video", w: 0.56, fill: SEL, o: 0.35 },
  ];
  const placed = segs.map((s, i) => ({
    ...s,
    x: X + segs.slice(0, i).reduce((sum, p) => sum + p.w * total, 0),
    px: s.w * total,
  }));
  const video = placed[3];
  return (
    <>
      <CoverLabel x={X} y={242} opacity={0.4}>page weight</CoverLabel>
      <CoverLabel x={X + total} y={242} anchor="end" opacity={0.4}>2.4 MB</CoverLabel>
      {placed.map((s, i) => (
        <rect key={s.label} x={s.x + (i ? 3 : 0)} y={Y} width={s.px - (i ? 3 : 0)} height={H} rx={8} fill={s.fill} fillOpacity={s.o} />
      ))}
      <Sel x={video.x + 3} y={Y} w={video.px - 3} h={H} k={K} />
      {placed.map((s, i) => (
        <CoverLabel
          key={s.label}
          x={i === 0 ? s.x : s.x + s.px / 2}
          y={Y + H + 44}
          anchor={i === 0 ? "start" : "middle"}
          color={i === 3 ? SEL : INK}
          opacity={i === 3 ? 1 : 0.5}
        >
          {s.label}
        </CoverLabel>
      ))}
    </>
  );
}

// taste-is-trained: the same layout, a year apart.
function CoverYearApart() {
  const card = (x: number, tidy: boolean) => {
    // A year ago: every block a few units off its neighbours.
    const j = (n: number) => (tidy ? 0 : n);
    return (
      <g>
        <rect x={x} y={170} width={300} height={300} rx={12} fill={PAPER} stroke={INK} strokeOpacity={0.1} strokeWidth={K} />
        <rect x={x + 30 + j(-6)} y={200} width={240 + j(10)} height={110} rx={6} fill={INK} fillOpacity={0.08} />
        <rect x={x + 30 + j(8)} y={332} width={170} height={14} rx={7} fill={INK} fillOpacity={0.75} />
        <rect x={x + 30 + j(-4)} y={360 + j(4)} width={236} height={8} rx={4} fill={INK} fillOpacity={0.18} />
        <rect x={x + 30 + j(12)} y={376 + j(6)} width={190} height={8} rx={4} fill={INK} fillOpacity={0.18} />
        <rect x={x + 30 + j(-2)} y={410 + j(8)} width={92 + j(18)} height={32} rx={tidy ? 8 : 3} fill={INK} fillOpacity={0.85} />
      </g>
    );
  };
  return (
    <>
      <CoverLabel x={400} y={148} anchor="middle" opacity={0.4}>a year ago</CoverLabel>
      <CoverLabel x={800} y={148} anchor="middle" opacity={0.6}>now</CoverLabel>
      {card(250, false)}
      {card(650, true)}
      <line x1={574} y1={320} x2={626} y2={320} stroke={INK} strokeOpacity={0.3} strokeWidth={K} strokeDasharray="6 6" />
      <polyline points="616,310 628,320 616,330" stroke={INK} strokeOpacity={0.3} strokeWidth={K} />
      <Sel x={650} y={170} w={300} h={300} k={K} />
    </>
  );
}

// the-brief-is-the-product: a brief where the line that matters is the problem.
function CoverBrief() {
  const X = 420, Y = 105, W = 360;
  const widths = [280, 250, 290, 0, 270, 230, 285, 200, 260, 150];
  return (
    <>
      <rect x={X} y={Y} width={W} height={420} rx={12} fill={PAPER} stroke={INK} strokeOpacity={0.1} strokeWidth={K} />
      <rect x={X + 40} y={Y + 44} width={180} height={16} rx={8} fill={INK} fillOpacity={0.8} />
      {widths.map((w, i) => {
        const y = Y + 100 + i * 28;
        if (i === 3) {
          return (
            <g key={i}>
              <rect x={X + 30} y={y - 9} width={W - 60} height={26} rx={4} fill={SEL} fillOpacity={0.18} />
              <rect x={X + 40} y={y} width={230} height={8} rx={4} fill={INK} fillOpacity={0.7} />
              <Sel x={X + 30} y={y - 9} w={W - 60} h={26} k={K} />
            </g>
          );
        }
        return <rect key={i} x={X + 40} y={y} width={w} height={8} rx={4} fill={INK} fillOpacity={0.15} />;
      })}
    </>
  );
}

// the-invisible-details: the spacing nobody sees, redlined.
function CoverRedlines() {
  // 278 tall so the bottom padding is a true 32, matching its redline.
  const X = 380, Y = 176, W = 440, H = 278;
  const dim = (x1: number, y1: number, x2: number, y2: number, label: string, lx: number, ly: number) => {
    const vertical = x1 === x2;
    const t = 8;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={SEL} strokeWidth={K} />
        {vertical ? (
          <>
            <line x1={x1 - t} y1={y1} x2={x1 + t} y2={y1} stroke={SEL} strokeWidth={K} />
            <line x1={x2 - t} y1={y2} x2={x2 + t} y2={y2} stroke={SEL} strokeWidth={K} />
          </>
        ) : (
          <>
            <line x1={x1} y1={y1 - t} x2={x1} y2={y1 + t} stroke={SEL} strokeWidth={K} />
            <line x1={x2} y1={y2 - t} x2={x2} y2={y2 + t} stroke={SEL} strokeWidth={K} />
          </>
        )}
        <CoverLabel x={lx} y={ly} color={SEL} opacity={1} size={20}>{label}</CoverLabel>
      </g>
    );
  };
  return (
    <>
      <rect x={X} y={Y} width={W} height={H} rx={14} fill={PAPER} stroke={INK} strokeOpacity={0.1} strokeWidth={K} />
      <rect x={X + 32} y={Y + 32} width={W - 64} height={140} rx={8} fill={INK} fillOpacity={0.08} />
      <rect x={X + 32} y={Y + 196} width={220} height={14} rx={7} fill={INK} fillOpacity={0.75} />
      <rect x={X + 32} y={Y + 222} width={300} height={8} rx={4} fill={INK} fillOpacity={0.2} />
      <rect x={X + 32} y={Y + 238} width={240} height={8} rx={4} fill={INK} fillOpacity={0.2} />
      {dim(X, Y + 110, X + 32, Y + 110, "32", X - 44, Y + 117)}
      {dim(X + 290, Y + 172, X + 290, Y + 196, "24", X + 304, Y + 191)}
      {dim(X + 32, Y + 246, X + 32, Y + H, "32", X + 46, Y + 269)}
    </>
  );
}

const POST_COVERS: Record<string, () => React.ReactElement> = {
  "consistency-beats-novelty": CoverCoherence,
  "copy-is-design": CoverTone,
  "design-systems-that-scale": CoverFewerComponents,
  "judgment-over-output": CoverNarrowing,
  "speed-is-a-feature": CoverWeight,
  "taste-is-trained": CoverYearApart,
  "the-brief-is-the-product": CoverBrief,
  "the-invisible-details": CoverRedlines,
};

export function hasPostCover(slug: string) {
  return slug in POST_COVERS;
}

// Fills its parent, which sets the 1200/630 panel and tint.
export function PostCover({ slug }: { slug: string }) {
  const Cover = POST_COVERS[slug];
  if (!Cover) return null;
  return (
    <svg viewBox="0 0 1200 630" className="absolute inset-0 h-full w-full" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <Cover />
    </svg>
  );
}
