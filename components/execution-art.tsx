"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

// Small abstract illustrations for the homepage's "How we think about
// execution" principles. Built from the illustrated-card language in
// docs/design-system.md: skeleton bars (fg 0.12, 0.22 for a heading bar),
// white panels with a 1px ring and the soft drop shadow, 6px corners, no real
// text. Each one acts its principle out when `play` turns on, and resets when
// it turns off so it plays again next time.

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SPRING = "cubic-bezier(0.34, 1.4, 0.64, 1)";
const BAR = "rgba(26,26,26,0.12)";
const BAR_STRONG = "rgba(26,26,26,0.22)";
const PANEL: CSSProperties = {
  background: "#fff",
  borderRadius: 6,
  boxShadow: "0 0 0 1px rgba(26,26,26,0.08), 0 10px 24px -12px rgba(0,0,0,0.25)",
};

// Flips to true a beat after `play` does, so the starting state is seen first.
function useDone(play: boolean, delay = 450) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!play) {
      setDone(false);
      return;
    }
    const t = setTimeout(() => setDone(true), delay);
    return () => clearTimeout(t);
  }, [play, delay]);
  return done;
}

const Bar = ({ w, strong, h = 6 }: { w: string; strong?: boolean; h?: number }) => (
  <span className="block rounded-full" style={{ width: w, height: h, background: strong ? BAR_STRONG : BAR }} />
);

// Restraint: a crowded panel loses everything that isn't needed, one piece at
// a time, until a heading, a line and the one action are left.
export function RestraintArt({ play }: { play: boolean }) {
  const done = useDone(play);
  const rows: { extra?: boolean; node: ReactNode }[] = [
    { extra: true, node: <span className="block h-4 w-14 rounded-[4px]" style={{ background: "rgba(26,26,26,0.08)" }} /> },
    { node: <Bar w="58%" strong h={9} /> },
    { extra: true, node: <span className="flex gap-1.5">{[40, 32, 48].map((w) => <span key={w} className="block h-4 rounded-[4px]" style={{ width: w, background: "rgba(26,26,26,0.08)" }} />)}</span> },
    { node: <Bar w="92%" /> },
    { extra: true, node: <Bar w="74%" /> },
    { extra: true, node: <span className="flex gap-1.5">{[0, 1, 2, 3].map((k) => <span key={k} className="block size-5 rounded-[4px]" style={{ background: "rgba(26,26,26,0.1)" }} />)}</span> },
    { extra: true, node: <Bar w="64%" /> },
    { node: <span className="block h-7 w-24 rounded-[6px]" style={{ background: "#1a1a1a" }} /> },
  ];
  let k = 0;
  return (
    <div className="w-[68%] p-5" style={PANEL}>
      {rows.map((r, i) => {
        const gone = r.extra && done;
        const delay = r.extra ? (k++) * 110 : 0;
        return (
          <div
            key={i}
            className="grid"
            style={{
              gridTemplateRows: gone ? "0fr" : "1fr",
              opacity: gone ? 0 : 1,
              transition: `grid-template-rows 500ms ${EASE} ${delay}ms, opacity 300ms ease ${delay}ms`,
            }}
          >
            <div className="overflow-hidden">
              <div className={i === 0 ? "" : "pt-3"}>{r.node}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Agreement: six cards that each made their own call (corners, position,
// tilt, line lengths) snap into one consistent set.
const DISAGREE = [
  { r: 0, x: -5, y: 6, rot: -3, a: "84%", b: "40%" },
  { r: 14, x: 4, y: -5, rot: 2, a: "62%", b: "70%" },
  { r: 3, x: 6, y: 5, rot: -1.5, a: "90%", b: "30%" },
  { r: 10, x: -6, y: -4, rot: 3, a: "50%", b: "58%" },
  { r: 0, x: 3, y: 7, rot: -2, a: "76%", b: "48%" },
  { r: 18, x: -4, y: -6, rot: 1.5, a: "66%", b: "36%" },
];

export function AgreementArt({ play }: { play: boolean }) {
  const done = useDone(play);
  return (
    <div className="grid w-[78%] grid-cols-3 gap-3">
      {DISAGREE.map((c, i) => {
        const t = `${700}ms ${SPRING} ${i * 60}ms`;
        return (
          <div
            key={i}
            className="flex aspect-[4/3] flex-col justify-between p-2.5"
            style={{
              ...PANEL,
              borderRadius: done ? 6 : c.r,
              transform: done ? "none" : `translate(${c.x}px, ${c.y}px) rotate(${c.rot}deg)`,
              transition: `border-radius ${t}, transform ${t}`,
            }}
          >
            <span
              className="block size-4"
              style={{ background: "rgba(26,26,26,0.1)", borderRadius: done ? 4 : (c.r % 7) + 1, transition: `border-radius ${t}` }}
            />
            <span className="flex flex-col gap-1.5">
              <span className="block h-[5px] rounded-full" style={{ width: done ? "72%" : c.a, background: BAR_STRONG, transition: `width ${t}` }} />
              <span className="block h-[5px] rounded-full" style={{ width: done ? "46%" : c.b, background: BAR, transition: `width ${t}` }} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Follow-through: a checklist of details ticks off one by one. The last one
// takes a beat longer, because the last detail always does.
const CHECK_WIDTHS = ["78%", "62%", "84%", "56%", "70%"];

export function FollowThroughArt({ play }: { play: boolean }) {
  const [ticked, setTicked] = useState(0);

  useEffect(() => {
    if (!play) {
      setTicked(0);
      return;
    }
    const timers = CHECK_WIDTHS.map((_, i) =>
      setTimeout(() => setTicked(i + 1), 500 + i * 420 + (i === CHECK_WIDTHS.length - 1 ? 700 : 0)),
    );
    return () => timers.forEach(clearTimeout);
  }, [play]);

  return (
    <div className="w-[68%] p-5" style={PANEL}>
      <Bar w="44%" strong h={9} />
      <div className="mt-4 flex flex-col gap-3">
        {CHECK_WIDTHS.map((w, i) => {
          const on = ticked > i;
          return (
            <div key={i} className="flex items-center gap-3">
              <span
                className="flex size-[18px] shrink-0 items-center justify-center rounded-full"
                style={{
                  background: on ? "#1a1a1a" : "#fff",
                  boxShadow: on ? "none" : "inset 0 0 0 1px rgba(26,26,26,0.25)",
                  transform: on ? "scale(1)" : "scale(0.92)",
                  transition: `background 200ms ease, transform 400ms ${SPRING}`,
                }}
              >
                <svg viewBox="0 0 12 12" className="size-[10px]" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path
                    d="M2.5 6.2 L5 8.5 L9.5 3.5"
                    pathLength={1}
                    style={{ strokeDasharray: 1, strokeDashoffset: on ? 0 : 1, transition: `stroke-dashoffset 300ms ${EASE} 80ms` }}
                  />
                </svg>
              </span>
              <span className="block h-[6px] rounded-full" style={{ width: w, background: on ? BAR_STRONG : BAR, transition: "background 300ms ease" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
