"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { INK, TILE } from "@/components/material-art";
import { Box, DASH, EASE, Flag, LINE, LineBoard, enter, raise } from "@/components/line-art";

// The drawings for the three values on /aether (values.tsx), in the
// homepage's monoline line style (components/line-art.tsx), so the page reads
// as the same studio. Each one acts its value out while `play` is on and
// resets when it turns off, so it plays again on the next visit. With
// `still`, each shows its finished state and nothing moves.

const FONT = { fontFamily: "var(--font-satoshi), sans-serif", fontWeight: 450 } as const;

/* More sales: a shop on a street. Visitors walk in from the left, and at
 * the door most of them turn in. Each one that does becomes an order, and
 * the count beside the shop goes up. One walks on by, so turning in reads as
 * a choice. */
const STREET_Y = 250;
const DOOR = { x: 236, y: 166, w: 36, h: STREET_Y - 166 };
const DOOR_X = DOOR.x + DOOR.w / 2;
// The pavement runs in front of the shop, below its base.
const PAVE_Y = STREET_Y + 22;
const WALK_Y = PAVE_Y - 7.5;
// Who turns in, in order.
const VISITORS = [true, true, false, true];
const ORDERS = VISITORS.filter(Boolean).length;
const GAP_MS = 1100;

// 0 not yet here, 1 at the door, 2 inside (or walked on).
type Phase = 0 | 1 | 2;
const ARRIVING: Phase[] = VISITORS.map(() => 0);
const GONE: Phase[] = VISITORS.map(() => 2);

function Shop() {
  return (
    <g>
      <Box x={140} y={100} w={160} h={STREET_Y - 100} d={0.16} />
      {/* The awning, striped. */}
      <polygon points="134,116 306,116 314,140 126,140" fill={TILE} {...LINE} />
      {Array.from({ length: 8 }, (_, i) => {
        const t = (i + 1) / 9;
        return <line key={i} x1={134 + 172 * t} y1={116} x2={126 + 188 * t} y2={140} {...LINE} strokeOpacity={0.45} />;
      })}
      {/* The window, a product on show. */}
      <rect x={158} y={164} width={62} height={46} rx={2} fill={TILE} {...LINE} />
      <rect x={180} y={180} width={18} height={22} rx={2} fill={INK} fillOpacity={0.08} {...LINE} strokeOpacity={0.55} />
      <rect x={DOOR.x} y={DOOR.y} width={DOOR.w} height={DOOR.h} rx={2} fill={INK} fillOpacity={0.06} {...LINE} />
      <circle cx={DOOR.x + DOOR.w - 8} cy={DOOR.y + DOOR.h / 2} r={1.6} fill={INK} />
    </g>
  );
}

export function SalesArt({ play, still }: { play: boolean; still?: boolean }) {
  const [phases, setPhases] = useState<Phase[]>(still ? GONE : ARRIVING);
  const [orders, setOrders] = useState(still ? ORDERS : 0);
  useEffect(() => {
    if (still || !play) {
      setPhases(still ? GONE : ARRIVING);
      setOrders(still ? ORDERS : 0);
      return;
    }
    const set = (k: number, ph: Phase) => setPhases((p) => p.map((v, i) => (i === k ? ph : v)));
    const ts: ReturnType<typeof setTimeout>[] = [];
    let n = 0;
    VISITORS.forEach((enters, k) => {
      const t0 = 300 + k * GAP_MS;
      ts.push(setTimeout(() => set(k, 1), t0));
      ts.push(setTimeout(() => set(k, 2), t0 + 1000));
      if (enters) {
        const count = ++n;
        ts.push(setTimeout(() => setOrders(count), t0 + 1350));
      }
    });
    return () => ts.forEach(clearTimeout);
  }, [play, still]);

  return (
    <LineBoard>
      <line x1={20} y1={STREET_Y} x2={380} y2={STREET_Y} {...LINE} />
      <line x1={20} y1={PAVE_Y} x2={380} y2={PAVE_Y} {...LINE} strokeOpacity={0.35} />
      <Shop />

      {/* The count, set beside the shop like a name and its caption. */}
      <text key={orders} x={326} y={150} fontSize={30} fill={INK} className={still || orders === 0 ? undefined : "values-count"} style={{ ...FONT, fontWeight: 500, letterSpacing: "-0.03em" }}>
        {orders}
      </text>
      <text x={327} y={170} fontSize={12} fill={INK} fillOpacity={0.55} style={FONT}>
        {orders === 1 ? "order" : "orders"}
      </text>

      {VISITORS.map((enters, k) => {
        const ph = phases[k];
        const [x, y] = ph === 0 ? [14, WALK_Y] : ph === 1 ? [DOOR_X, WALK_Y] : enters ? [DOOR_X, STREET_Y - 18] : [392, WALK_Y];
        return (
          <g
            key={k}
            style={{
              transform: `translate(${x}px, ${y}px)`,
              opacity: ph === 1 ? 1 : 0,
              transition:
                still || ph === 0
                  ? "none"
                  : ph === 1
                    ? `transform 1000ms cubic-bezier(0.45, 0, 0.55, 1), opacity 300ms ${EASE}`
                    : enters
                      ? `transform 520ms ${EASE}, opacity 360ms ${EASE} 160ms`
                      : `transform 1000ms cubic-bezier(0.45, 0, 0.55, 1), opacity 300ms ${EASE} 700ms`,
            }}
          >
            <circle r={6.5} fill={INK} />
          </g>
        );
      })}
    </LineBoard>
  );
}

/* Selling today: one day, drawn as the sun's arc over the horizon. As the
 * sun climbs, the day's three moments light up under it, you buy, you tap
 * accept, and by the afternoon the store is up with its flag raised. All
 * before sunset. */
const SKY = { cx: 200, cy: 232, r: 150 };
const MOMENTS = [
  { deg: 30, label: "Buy" },
  { deg: 90, label: "Accept" },
  { deg: 140, label: "Live" },
];
const at = (deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [SKY.cx - SKY.r * Math.cos(a), SKY.cy - SKY.r * Math.sin(a)];
};

export function SameDayArt({ play, still }: { play: boolean; still?: boolean }) {
  // How many of the day's moments have passed.
  const [step, setStep] = useState(still ? MOMENTS.length : 0);
  useEffect(() => {
    if (still || !play) {
      setStep(still ? MOMENTS.length : 0);
      return;
    }
    const ts = [400, 1300, 2200].map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, [play, still]);

  const deg = step === 0 ? 0 : MOMENTS[step - 1].deg;
  const live = step === MOMENTS.length;
  const [lx] = at(MOMENTS[2].deg);
  return (
    <LineBoard>
      <text x={40} y={56} fontSize={12} fill={INK} fillOpacity={0.55} style={FONT}>Today</text>
      <path d={`M ${SKY.cx - SKY.r} ${SKY.cy} A ${SKY.r} ${SKY.r} 0 0 1 ${SKY.cx + SKY.r} ${SKY.cy}`} {...DASH} strokeOpacity={0.4} />
      <line x1={36} y1={SKY.cy} x2={364} y2={SKY.cy} {...LINE} />

      {MOMENTS.map((m, i) => {
        const [mx] = at(m.deg);
        const reached = i < step;
        return (
          <g key={m.label}>
            <line x1={mx} y1={SKY.cy} x2={mx} y2={SKY.cy + 7} {...LINE} />
            <text
              x={mx}
              y={SKY.cy + 24}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fill={INK}
              fillOpacity={reached ? 1 : 0.4}
              style={{ ...FONT, transition: still ? "none" : `fill-opacity 400ms ${EASE}` }}
            >
              {m.label}
            </text>
          </g>
        );
      })}

      {/* The store, standing on the horizon under where the sun ends up. */}
      <g style={still ? undefined : enter(live, "translateY(10px)", 0, 560)} opacity={still || live ? 1 : 0}>
        <Box x={lx - 28} y={SKY.cy - 28} w={56} h={28} d={0.1} />
      </g>
      <g style={raise(live, still ? 0 : 300)}>
        <Flag x={lx + 18} y={SKY.cy - 40} h={40} />
      </g>

      {/* The sun turns about the arc's centre, starting at sunrise. */}
      <g
        style={{
          transformOrigin: `${SKY.cx}px ${SKY.cy}px`,
          transform: `rotate(${deg}deg)`,
          transition: still ? "none" : `transform 820ms ${EASE}`,
        }}
      >
        <circle cx={SKY.cx - SKY.r} cy={SKY.cy} r={9} fill={TILE} {...LINE} />
      </g>
    </LineBoard>
  );
}

/* Your look: a row of phones, every one the same template. The middle one
 * steps forward, grows, and fills in with a real brand's look, its
 * neighbours making room and fading back. Then it keeps changing between the
 * four example Aether stores, each in its own layout (one full-bleed
 * picture, or two stacked panels) and colours sampled from its photography.
 * The only colour on the page lives here, on purpose. */
const STYLES = [
  { name: "Rosso", layout: "hero", a: "#8a1c08", b: "#191109" },
  { name: "Argent", layout: "hero", a: "#8c8c88", b: "#141414" },
  { name: "After Hours", layout: "split", a: "#3d2614", b: "#8a2117" },
  { name: "Relics", layout: "split", a: "#6e4044", b: "#262117" },
] as const;

type Rect = { x: number; y: number; w: number; h: number };

const FLOOR = 216;
const SMALL = { w: 52, h: 112 };
// The four template phones either side, and how far each moves aside.
const SIDES = [
  { x: 38, shift: -6 },
  { x: 106, shift: -14 },
  { x: 242, shift: 14 },
  { x: 310, shift: 6 },
];
// The middle phone, full size; it starts scaled down to match the rest.
const HERO: Rect = { x: 164, y: FLOOR - 156, w: 72, h: 156 };
const START_SCALE = SMALL.w / HERO.w;
const CYCLE_MS = 2600;

const screenOf = (r: Rect): Rect => ({ x: r.x + 5, y: r.y + 8, w: r.w - 10, h: r.h - 16 });

// The template every store starts from: a grey hero, a heading, two products.
function Template({ r }: { r: Rect }) {
  const { x, y, w, h } = r;
  const cx = x + w / 2;
  const pw = (w - 9) / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h * 0.46} rx={1.5} fill={INK} fillOpacity={0.08} />
      <line x1={cx - w * 0.26} y1={y + h * 0.56} x2={cx + w * 0.26} y2={y + h * 0.56} {...LINE} strokeOpacity={0.55} />
      <line x1={cx - w * 0.16} y1={y + h * 0.62} x2={cx + w * 0.16} y2={y + h * 0.62} {...LINE} strokeOpacity={0.3} />
      <rect x={x + 3} y={y + h * 0.7} width={pw} height={h * 0.24} rx={1.5} {...LINE} strokeOpacity={0.4} />
      <rect x={x + 6 + pw} y={y + h * 0.7} width={pw} height={h * 0.24} rx={1.5} {...LINE} strokeOpacity={0.4} />
    </g>
  );
}

function Brand({ s, r, id }: { s: (typeof STYLES)[number]; r: Rect; id: string }) {
  const { x, y, w, h } = r;
  const cx = x + w / 2;
  if (s.layout === "hero") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={2} fill={`url(#${id})`} />
        <text x={cx} y={y + h * 0.46} textAnchor="middle" fontSize={13} fill="#fff" style={{ ...FONT, fontWeight: 300 }}>Aether</text>
        <line x1={cx - 14} y1={y + h * 0.53} x2={cx + 14} y2={y + h * 0.53} stroke="#fff" strokeOpacity={0.7} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
        <rect x={cx - 12} y={y + h * 0.59} width={24} height={8} rx={4} fill="#fff" />
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
          <line x1={cx - 13} y1={ty} x2={cx + 13} y2={ty} stroke="#fff" strokeWidth={1.8} vectorEffect="non-scaling-stroke" />
          <line x1={cx - 7} y1={ty + 5} x2={cx + 7} y2={ty + 5} stroke="#fff" strokeOpacity={0.7} vectorEffect="non-scaling-stroke" />
        </g>
      ))}
    </g>
  );
}

export function IdentityArt({ play, still }: { play: boolean; still?: boolean }) {
  const [up, setUp] = useState(!!still);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (still) {
      setUp(true);
      return;
    }
    if (!play) {
      setUp(false);
      setActive(0);
      return;
    }
    const lift = setTimeout(() => setUp(true), 500);
    const cycle = setInterval(() => setActive((a) => (a + 1) % STYLES.length), CYCLE_MS);
    return () => {
      clearTimeout(lift);
      clearInterval(cycle);
    };
  }, [play, still]);

  const move = (ms: number) => (still ? "none" : `transform ${ms}ms ${EASE}, opacity ${ms}ms ${EASE}`);
  const cross = (on: boolean): CSSProperties => ({ opacity: on ? 1 : 0, transition: still ? "none" : `opacity 700ms ${EASE}` });
  const screen = screenOf(HERO);

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

      {SIDES.map((p) => {
        const r = { x: p.x, y: FLOOR - SMALL.h, ...SMALL };
        return (
          <g key={p.x} style={{ transform: up ? `translateX(${p.shift}px)` : "none", opacity: up ? 0.45 : 1, transition: move(800) }}>
            <Box x={r.x} y={r.y} w={r.w} h={r.h} d={0.025} />
            <Template r={screenOf(r)} />
          </g>
        );
      })}

      <g
        style={{
          transformOrigin: `${HERO.x + HERO.w / 2}px ${FLOOR}px`,
          transform: up ? "translateY(-8px) scale(1)" : `scale(${START_SCALE})`,
          transition: move(800),
        }}
      >
        <Box x={HERO.x} y={HERO.y} w={HERO.w} h={HERO.h} d={0.025} />
        <g style={cross(!up)}>
          <Template r={screen} />
        </g>
        {STYLES.map((s, i) => (
          <g key={s.name} style={cross(up && i === active)}>
            <Brand s={s} r={screen} id={`identity-${s.name}`} />
          </g>
        ))}
      </g>

      {STYLES.map((s, i) => (
        <text
          key={s.name}
          x={HERO.x + HERO.w / 2}
          y={FLOOR + 26}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fill={INK}
          style={{ ...FONT, ...cross(up && i === active) }}
        >
          {s.name}
        </text>
      ))}
    </LineBoard>
  );
}
