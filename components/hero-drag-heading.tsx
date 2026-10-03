"use client";

import { useState, type CSSProperties } from "react";
import { motion } from "motion/react";

// The homepage hero heading, where the visitor is the collaborator: every
// word can be picked up and thrown, gets a green "You" frame while it's held,
// and springs back to its slot on release, so the layout is never left broken.
// Nothing labels that. Shortly after load the words lift and settle once in a
// wave (.hero-wave), and the pointer turns to a grab hand over them, so the
// type itself shows it can move.
//
// Renders the lines only; the caller owns the <h1> and its type styles.

const YOU = "#22c55e";

// Frame insets around a word, in em.
const FRAME = { top: 0.08, x: 0.1, bottom: 0.2 };

// The wave: when it starts after load, and the gap between words.
const WAVE_START_MS = 900;
const WAVE_STEP_MS = 70;

const LABEL =
  "pointer-events-none absolute rounded-[6px] px-1.5 py-[3px] text-[12px] font-medium leading-none tracking-tight text-white whitespace-nowrap";

const fade = (show: boolean): CSSProperties => ({ opacity: show ? 1 : 0, transition: "opacity 300ms ease" });

function HeldFrame({ show }: { show: boolean }) {
  const h = -3.5;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        top: `-${FRAME.top}em`,
        left: `-${FRAME.x}em`,
        right: `-${FRAME.x}em`,
        bottom: `-${FRAME.bottom}em`,
        border: `1px solid ${YOU}`,
        ...fade(show),
      }}
    >
      {[{ top: h, left: h }, { top: h, right: h }, { bottom: h, right: h }, { bottom: h, left: h }].map((p, i) => (
        <span key={i} className="absolute size-[6px] bg-white" style={{ border: `1px solid ${YOU}`, ...p }} />
      ))}
    </span>
  );
}

export function HeroDragHeading({ lines }: { lines: string[][] }) {
  const [held, setHeld] = useState<string | null>(null);
  let order = 0;

  return (
    <>
      {lines.map((line, li) => (
        <span
          key={li}
          className={`flex justify-center items-baseline whitespace-nowrap${li > 0 ? " mt-1 sm:mt-2" : ""}`}
          style={{ columnGap: "0.28em" }}
        >
          {line.map((word, i) => {
            const id = `${li}-${i}`;
            const delay = WAVE_START_MS + (order++) * WAVE_STEP_MS;
            return (
              <motion.span
                key={id}
                drag
                dragSnapToOrigin
                dragTransition={{ bounceStiffness: 420, bounceDamping: 20 }}
                whileDrag={{ scale: 1.06, rotate: -2 }}
                onDragStart={() => setHeld(id)}
                onDragEnd={() => setHeld(null)}
                className="relative inline-block cursor-grab select-none active:cursor-grabbing"
                // pan-y keeps vertical swipes scrolling the page on touch, so
                // the heading never traps someone trying to scroll past it.
                style={{ touchAction: "pan-y", zIndex: held === id ? 20 : undefined }}
              >
                {/* The wave rides an inner span so it never fights the drag
                    transform on the outer one. */}
                <span className="hero-wave inline-block" style={{ animationDelay: `${delay}ms` }}>
                  {word}
                </span>
                <HeldFrame show={held === id} />
                <span
                  aria-hidden="true"
                  className={`${LABEL} bottom-full`}
                  style={{ background: YOU, left: `-${FRAME.x}em`, marginBottom: `calc(${FRAME.top}em + 5px)`, ...fade(held === id) }}
                >
                  You
                </span>
              </motion.span>
            );
          })}
        </span>
      ))}
    </>
  );
}
