"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { INK, TILE } from "@/components/material-art";
import { Box, DASH, EASE, Flag, LINE, LineBoard, raise } from "@/components/line-art";

// The drawings for the three values on /aether (values.tsx), in the
// homepage's monoline line style (components/line-art.tsx), so the page reads
// as the same studio. Each one acts its value out while `play` is on and
// resets when it turns off, so it plays again on the next visit. With
// `still`, each shows its finished state and nothing moves.

const FONT = { fontFamily: "var(--font-satoshi), sans-serif", fontWeight: 450 } as const;

const fade = (on: boolean, delay = 0, ms = 500): CSSProperties => ({
  opacity: on ? 1 : 0,
  transition: `opacity ${ms}ms ${EASE} ${delay}ms`,
});

/* Customer: three steps rising to the right, browse, product, cart. A
 * shopper (the dot) hops from one to the next along a dashed path, and the
 * flag goes up when it reaches the cart. The page leads; nobody gets lost. */
const STEPS = [
  { x: 56, y: 204, w: 84, h: 46, label: "Browse" },
  { x: 158, y: 168, w: 84, h: 82, label: "Product" },
  { x: 260, y: 132, w: 84, h: 118, label: "Cart" },
];
const DEPTH = 0.18;
// Where the dot sits on each step's top face (the face recedes ~48px up).
const STOPS: [number, number][] = [[98, 180], [200, 145], [302, 110]];

export function CustomerArt({ play, still }: { play: boolean; still?: boolean }) {
  const [at, setAt] = useState(still ? 2 : 0);
  useEffect(() => {
    if (still || !play) {
      setAt(still ? 2 : 0);
      return;
    }
    const ts = [setTimeout(() => setAt(1), 700), setTimeout(() => setAt(2), 1500)];
    return () => ts.forEach(clearTimeout);
  }, [play, still]);

  const [x, y] = STOPS[at];
  const arrived = at === 2;
  return (
    <LineBoard>
      <path d="M 98 172 Q 150 108 200 137 Q 252 72 302 102" {...DASH} strokeOpacity={0.45} />
      {STEPS.map((s, i) => (
        <g key={s.label}>
          <Box x={s.x} y={s.y} w={s.w} h={s.h} d={DEPTH} />
          <text
            x={s.x + s.w / 2}
            y={s.y + Math.min(24, s.h / 2)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill={INK}
            fillOpacity={i <= at ? 1 : 0.4}
            style={{ ...FONT, transition: `fill-opacity 400ms ${EASE}` }}
          >
            {s.label}
          </text>
        </g>
      ))}
      <g style={raise(arrived, still ? 0 : 250)}>
        <Flag x={322} y={114} h={52} />
      </g>
      {/* The outer group travels; the inner one hops, restarted per step. */}
      <g style={{ transform: `translate(${x}px, ${y}px)`, transition: still ? "none" : `transform 760ms ${EASE}` }}>
        <g key={at} className={still || at === 0 ? undefined : "values-hop"}>
          <circle r={6.5} fill={INK} />
        </g>
      </g>
    </LineBoard>
  );
}

/* Speed: a store page in a browser window. The bar runs across the top and
 * the page is all there almost before it finishes: hero, then the products,
 * then the check. Quick, and nothing jumps around while it lands. */
const WIN = { x: 70, y: 58, w: 260, h: 194 };
const BAR_Y = WIN.y + 20;
const PIECES: { x: number; y: number; w: number; h: number; shade?: boolean }[] = [
  { x: 86, y: 94, w: 228, h: 64, shade: true },
  { x: 86, y: 170, w: 70, h: 50 },
  { x: 165, y: 170, w: 70, h: 50 },
  { x: 244, y: 170, w: 70, h: 50 },
];

export function SpeedArt({ play, still }: { play: boolean; still?: boolean }) {
  const on = play || !!still;
  const t = (ms: number) => (still ? 0 : ms);
  return (
    <LineBoard>
      <Box x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} d={0.035} />
      <line x1={WIN.x} y1={BAR_Y} x2={WIN.x + WIN.w} y2={BAR_Y} {...LINE} strokeOpacity={0.4} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={WIN.x + 12 + i * 9} cy={WIN.y + 10} r={2.4} fill="none" {...LINE} />
      ))}
      {/* The load bar: sweeps across, then fades once the page is in. */}
      <line
        x1={WIN.x}
        y1={BAR_Y}
        x2={WIN.x + WIN.w}
        y2={BAR_Y}
        stroke={INK}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        style={{
          transformBox: "fill-box",
          transformOrigin: "0% 50%",
          transform: on ? "scaleX(1)" : "scaleX(0)",
          opacity: on && !still ? 0 : 1,
          transition: still
            ? "none"
            : on
              ? `transform 520ms cubic-bezier(0.3, 0, 0.1, 1), opacity 300ms ${EASE} 900ms`
              : "none",
        }}
      />
      {PIECES.map((p, i) => (
        <g key={i} style={{ ...fade(on, t(120 + i * 70), still ? 0 : 320), transform: on ? "none" : "translateY(4px)", transition: still ? "none" : `opacity 320ms ${EASE} ${120 + i * 70}ms, transform 420ms ${EASE} ${120 + i * 70}ms` }}>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={3} fill={p.shade ? INK : TILE} fillOpacity={p.shade ? 0.07 : 1} {...LINE} strokeOpacity={0.55} />
          {p.shade ? (
            <>
              <line x1={170} y1={120} x2={230} y2={120} {...LINE} strokeWidth={2} />
              <line x1={182} y1={134} x2={218} y2={134} {...LINE} strokeOpacity={0.45} />
            </>
          ) : (
            <>
              <line x1={p.x} y1={p.y + p.h + 10} x2={p.x + 44} y2={p.y + p.h + 10} {...LINE} strokeOpacity={0.5} />
              <line x1={p.x} y1={p.y + p.h + 18} x2={p.x + 26} y2={p.y + p.h + 18} {...LINE} strokeOpacity={0.3} />
            </>
          )}
        </g>
      ))}
      {/* Done: a check on the window's corner. */}
      <g style={{ ...fade(on, t(560)), transform: on ? "scale(1)" : "scale(0.6)", transformBox: "fill-box", transformOrigin: "50% 50%", transition: still ? "none" : `opacity 360ms ${EASE} 560ms, transform 480ms cubic-bezier(0.22, 1.4, 0.36, 1) 560ms` }}>
        <circle cx={WIN.x + WIN.w} cy={WIN.y} r={13} fill={TILE} {...LINE} />
        <polyline points={`${WIN.x + WIN.w - 5},${WIN.y} ${WIN.x + WIN.w - 1.5},${WIN.y + 4} ${WIN.x + WIN.w + 5.5},${WIN.y - 4}`} fill="none" {...LINE} strokeWidth={1.6} />
      </g>
    </LineBoard>
  );
}

/* Identity: one phone, four example Aether stores. Every few seconds the store
 * changes its look, between the two layouts the styles use (one full-bleed
 * picture, or two stacked panels) and each style's own colours, sampled from
 * its photography. The swatches on the left say which one is showing. The
 * only colour on the page lives here, on purpose. */
const STYLES = [
  { name: "Rosso", layout: "hero", a: "#8a1c08", b: "#191109" },
  { name: "Argent", layout: "hero", a: "#8c8c88", b: "#141414" },
  { name: "After Hours", layout: "split", a: "#3d2614", b: "#8a2117" },
  { name: "Relics", layout: "split", a: "#6e4044", b: "#262117" },
] as const;

const PHONE = { x: 152, y: 34, w: 98, h: 222 };
const SCREEN = { x: PHONE.x + 7, y: PHONE.y + 9, w: PHONE.w - 14, h: PHONE.h - 18 };
const CYCLE_MS = 2600;

function Screen({ s, id }: { s: (typeof STYLES)[number]; id: string }) {
  const { x, y, w, h } = SCREEN;
  const cx = x + w / 2;
  if (s.layout === "hero") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={2} fill={`url(#${id})`} />
        <text x={cx} y={y + h * 0.46} textAnchor="middle" fontSize={17} fill="#fff" style={{ ...FONT, fontWeight: 300 }}>Aether</text>
        <line x1={cx - 18} y1={y + h * 0.53} x2={cx + 18} y2={y + h * 0.53} stroke="#fff" strokeOpacity={0.7} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
        <rect x={cx - 15} y={y + h * 0.59} width={30} height={9} rx={4.5} fill="#fff" />
      </g>
    );
  }
  const half = h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={half} rx={2} fill={s.a} />
      <rect x={x} y={y + half} width={w} height={half} rx={2} fill={s.b} />
      {[y + half * 0.78, y + h * 0.9].map((ty) => (
        <g key={ty}>
          <line x1={cx - 16} y1={ty} x2={cx + 16} y2={ty} stroke="#fff" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          <line x1={cx - 9} y1={ty + 6} x2={cx + 9} y2={ty + 6} stroke="#fff" strokeOpacity={0.7} vectorEffect="non-scaling-stroke" />
        </g>
      ))}
    </g>
  );
}

export function IdentityArt({ play, still }: { play: boolean; still?: boolean }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!play || still) return;
    const t = setInterval(() => setActive((a) => (a + 1) % STYLES.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [play, still]);

  const cross = (on: boolean): CSSProperties => ({
    opacity: on ? 1 : 0,
    transition: still ? "none" : `opacity 700ms ${EASE}`,
  });

  return (
    <LineBoard>
      <defs>
        {STYLES.map((s) => (
          <linearGradient key={s.name} id={`identity-${s.name}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={s.a} />
            <stop offset="1" stopColor={s.b} />
          </linearGradient>
        ))}
      </defs>

      {/* The swatches: each style's colour, the showing one ringed. */}
      {STYLES.map((s, i) => {
        const cy = 96 + i * 34;
        return (
          <g key={s.name}>
            <circle cx={92} cy={cy} r={8} fill={s.a} />
            <circle cx={92} cy={cy} r={13} fill="none" {...LINE} style={cross(i === active)} />
          </g>
        );
      })}

      <Box x={PHONE.x} y={PHONE.y} w={PHONE.w} h={PHONE.h} d={0.03} />
      {STYLES.map((s, i) => (
        <g key={s.name} style={cross(i === active)}>
          <Screen s={s} id={`identity-${s.name}`} />
        </g>
      ))}

      {STYLES.map((s, i) => (
        <g key={s.name} style={cross(i === active)}>
          <text x={278} y={140} fontSize={19} fill={INK} style={{ ...FONT, fontWeight: 500, letterSpacing: "-0.02em" }}>{s.name}</text>
          <text x={278} y={160} fontSize={12} fill={INK} fillOpacity={0.55} style={FONT}>Example {i + 1} of 4</text>
        </g>
      ))}
    </LineBoard>
  );
}
