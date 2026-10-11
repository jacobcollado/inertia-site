"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { INK, TILE } from "@/components/material-art";
import { Box, EASE, Flag, LINE, LineBoard, enter, raise } from "@/components/line-art";
import { useOnScreen } from "./values";

// The three setup steps on /aether (setup-steps.tsx), drawn in the site's
// line kit and acted out once each tile is on screen, like the values
// drawings above them (values-art.tsx). Each resets when it leaves, so it
// plays again on the next visit. Reduced motion shows the finished state.

const FONT = { fontFamily: "var(--font-satoshi), sans-serif", fontWeight: 450 } as const;

function Caption({ x, y, children, size = 13, fill = INK, style }: { x: number; y: number; children: ReactNode; size?: number; fill?: string; style?: CSSProperties }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={size} fill={fill} style={{ ...FONT, ...style }}>
      {children}
    </text>
  );
}

// Steps through `times` (ms after play starts), returning how many have
// passed. Still: all of them.
function useBeats(play: boolean, still: boolean, times: number[]) {
  const [beat, setBeat] = useState(still ? times.length : 0);
  useEffect(() => {
    if (still || !play) {
      setBeat(still ? times.length : 0);
      return;
    }
    const ts = times.map((ms, i) => setTimeout(() => setBeat(i + 1), ms));
    return () => ts.forEach(clearTimeout);
    // `times` is a constant per drawing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, still]);
  return beat;
}

/* You buy: a sealed envelope. The flap folds open and the license key card
 * slides up out of it, its key typed out in dots. Layered back to front:
 * the envelope's back, the open flap, the card, the front pocket, and the
 * closed flap over everything. */
const ENV = { x: 110, y: 140, w: 180, h: 100 };
// Low, the card sits inside the envelope, its foot clear of the bottom edge.
const CARD = { x: 138, w: 124, h: 56, low: 180, high: 76 };

function BuyArt({ play, still }: { play: boolean; still: boolean }) {
  const beat = useBeats(play, still, [350, 650, 900]);
  const t = (ms: number) => (still ? "none" : `transform ${ms}ms ${EASE}`);
  const fold = (on: boolean, origin: string): CSSProperties => ({
    transformBox: "fill-box",
    transformOrigin: origin,
    transform: on ? "scaleY(1)" : "scaleY(0)",
    transition: t(300),
  });
  const { x, y, w, h } = ENV;
  const mid = x + w / 2;
  return (
    <LineBoard>
      <Box x={x} y={y} w={w} h={h} d={0.06} />
      {/* The open flap, folding up from the top edge. */}
      <polygon points={`${x},${y} ${mid},${y - 52} ${x + w},${y}`} fill={TILE} {...LINE} style={fold(beat >= 2, "50% 100%")} />
      {/* The card. */}
      <g style={{ transform: `translateY(${beat >= 3 ? CARD.high - CARD.low : 0}px)`, transition: still ? "none" : `transform 760ms ${EASE}` }}>
        <rect x={CARD.x} y={CARD.low} width={CARD.w} height={CARD.h} rx={3} fill={TILE} {...LINE} />
        <Caption x={mid} y={CARD.low + 20} size={12}>License key</Caption>
        <Caption x={mid} y={CARD.low + 37} size={12} style={{ letterSpacing: "0.12em", opacity: 0.55 }}>
          ••••-••••-••••
        </Caption>
      </g>
      {/* The front pocket, a V from the corners, over the card's foot. */}
      <polygon points={`${x},${y + 10} ${mid},${y + 60} ${x + w},${y + 10} ${x + w},${y + h} ${x},${y + h}`} fill={TILE} {...LINE} />
      {/* The closed flap, folding away first. */}
      <polygon points={`${x},${y} ${mid},${y + 56} ${x + w},${y}`} fill={TILE} {...LINE} style={fold(beat < 1, "50% 0%")} />
    </LineBoard>
  );
}

/* You tap accept: Shopify's collaborator request, as a card with its two
 * buttons. A tap (the dot, as on the sales drawing) travels to Accept,
 * presses it, and the button fills in and says so. */
const DLG = { x: 74, y: 62, w: 252, h: 168 };
const DECLINE = { x: 96, y: 170, w: 96, h: 36 };
const ACCEPT = { x: 208, y: 170, w: 96, h: 36 };
const TAP_FROM: [number, number] = [344, 272];
// Lands right of the label, so the word stays readable.
const TAP_TO: [number, number] = [ACCEPT.x + ACCEPT.w - 14, ACCEPT.y + ACCEPT.h / 2 + 8];

function AcceptArt({ play, still }: { play: boolean; still: boolean }) {
  // 1 tap moves in, 2 press, 3 accepted, 4 tap leaves.
  const beat = useBeats(play, still, [300, 1150, 1350, 1900]);
  const pressed = beat >= 2;
  const done = beat >= 3;
  const [tx, ty] = beat >= 1 && beat < 4 ? TAP_TO : TAP_FROM;
  const ax = ACCEPT.x + ACCEPT.w / 2;
  const ay = ACCEPT.y + ACCEPT.h / 2;
  return (
    <LineBoard>
      <Box x={DLG.x} y={DLG.y} w={DLG.w} h={DLG.h} d={0.03} />
      <text x={DLG.x + 22} y={DLG.y + 32} fontSize={14} fill={INK} style={{ ...FONT, fontWeight: 500 }}>Collaborator request</text>
      <text x={DLG.x + 22} y={DLG.y + 54} fontSize={12} fill={INK} fillOpacity={0.55} style={FONT}>Inertia wants to set up your store</text>
      <line x1={DLG.x + 22} y1={DLG.y + 76} x2={DLG.x + 150} y2={DLG.y + 76} {...LINE} strokeOpacity={0.3} />

      <Box x={DECLINE.x} y={DECLINE.y} w={DECLINE.w} h={DECLINE.h} d={0.04} light />
      <Caption x={DECLINE.x + DECLINE.w / 2} y={DECLINE.y + DECLINE.h / 2} fill={INK} style={{ opacity: 0.5 }}>Decline</Caption>

      <g style={{ transform: pressed && beat < 4 ? "translateY(2px)" : "none", transition: still ? "none" : `transform 160ms ${EASE}` }}>
        <Box x={ACCEPT.x} y={ACCEPT.y} w={ACCEPT.w} h={ACCEPT.h} d={0.04} />
        <rect x={ACCEPT.x} y={ACCEPT.y} width={ACCEPT.w} height={ACCEPT.h} fill={INK} style={{ opacity: done ? 1 : 0, transition: still ? "none" : `opacity 260ms ${EASE}` }} />
        <Caption x={ax} y={ay} style={{ opacity: done ? 0 : 1, transition: still ? "none" : `opacity 200ms ${EASE}` }}>Accept</Caption>
        <Caption x={ax} y={ay} fill={TILE} style={{ opacity: done ? 1 : 0, transition: still ? "none" : `opacity 260ms ${EASE} 80ms` }}>Accepted</Caption>
      </g>

      {/* The tap, with a ring that spreads as it presses. */}
      <g style={{ transform: `translate(${tx}px, ${ty}px)`, opacity: beat >= 1 && beat < 4 ? 1 : 0, transition: still ? "none" : `transform 760ms ${EASE}, opacity 300ms ${EASE}` }}>
        <circle r={6.5} fill={INK} />
        <circle
          r={6.5}
          fill="none"
          {...LINE}
          style={{
            transformBox: "fill-box",
            transformOrigin: "50% 50%",
            transform: pressed ? "scale(3)" : "scale(1)",
            opacity: pressed ? 0 : 0.8,
            transition: still || !pressed ? "none" : `transform 520ms ${EASE}, opacity 520ms ${EASE}`,
          }}
        />
      </g>
    </LineBoard>
  );
}

/* We set it up: where the store will stand, a dashed outline on its plinth.
 * The store drops in solid over the outline, and the flag goes up. */
const PLINTH = { x: 110, y: 208, w: 180, h: 32 };
const STORE = { x: 150, y: 136, w: 100, h: 72 };

function LiveArt({ play, still }: { play: boolean; still: boolean }) {
  const beat = useBeats(play, still, [400, 1000]);
  const built = beat >= 1;
  return (
    <LineBoard>
      <Box x={PLINTH.x} y={PLINTH.y} w={PLINTH.w} h={PLINTH.h} d={0.24} />
      <g style={{ opacity: built ? 0 : 1, transition: still ? "none" : `opacity 400ms ${EASE} 200ms` }}>
        <Box x={STORE.x} y={STORE.y} w={STORE.w} h={STORE.h} d={0.17} ghost />
      </g>
      <g style={still ? undefined : enter(built, "translateY(-22px)", 0, 620)} opacity={still || built ? 1 : 0}>
        <Box x={STORE.x} y={STORE.y} w={STORE.w} h={STORE.h} d={0.17} />
        <Caption x={STORE.x + STORE.w / 2} y={STORE.y + STORE.h / 2} size={12}>Your store</Caption>
      </g>
      <g style={raise(beat >= 2)}>
        <Flag x={214} y={128} h={74} />
      </g>
    </LineBoard>
  );
}

const ARTS = { buy: BuyArt, accept: AcceptArt, live: LiveArt };
export type SetupArtKind = keyof typeof ARTS;

/** One step's drawing on its tile, playing while the tile is on screen. */
export function SetupArt({ kind }: { kind: SetupArtKind }) {
  const still = !!useReducedMotion();
  const [ref, on] = useOnScreen<HTMLDivElement>(0.6);
  const Art = ARTS[kind];
  return (
    <div ref={ref} className="aspect-[4/3] overflow-hidden rounded-[6px] bg-[var(--tile)]">
      <Art play={on} still={still} />
    </div>
  );
}
