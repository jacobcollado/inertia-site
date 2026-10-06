"use client";

import { Fragment, useState, type CSSProperties } from "react";
import { motion } from "motion/react";

// The homepage hero heading, where the visitor is the collaborator: every
// word can be picked up and thrown, gets a green "You" frame while it's held,
// and springs back to its slot on release, so the layout is never left broken.
// Nothing labels that. Shortly after load the words lift and settle once in a
// wave (.hero-wave), and the pointer turns to a grab hand over them, so the
// type itself shows it can move.
//
// Renders the words only; the caller owns the <h1> and its type styles.

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
        <span key={i} className="absolute size-[6px] bg-[var(--paper)]" style={{ border: `1px solid ${YOU}`, ...p }} />
      ))}
    </span>
  );
}

// `lines` is the heading from sm up. `mobileLines` is the phone version: a
// subset of the same words in the same order (matched ignoring case, so a
// word can be capitalised when it starts the phone line). Words render once,
// in one wrapping row; words missing from the phone version are hidden
// below sm, and a zero-height full-width break after each line end is
// switched on or off by breakpoint, so nothing swaps after hydration.
type Slot = { word: string; mobile: string | null; mEnd: boolean; dEnd: boolean };

function layout(lines: string[][], mobileLines: string[][]): Slot[] {
  const words = lines.flat();
  const slots: Slot[] = words.map((word) => ({ word, mobile: null, mEnd: false, dEnd: false }));
  let n = 0;
  lines.slice(0, -1).forEach((l) => (slots[(n += l.length) - 1].dEnd = true));
  let j = 0;
  mobileLines.forEach((line, li) => {
    line.forEach((mw, wi) => {
      while (j < slots.length && slots[j].word.toLowerCase() !== mw.toLowerCase()) j++;
      if (j === slots.length) return;
      slots[j].mobile = mw;
      if (li < mobileLines.length - 1 && wi === line.length - 1) slots[j].mEnd = true;
      j++;
    });
  });
  return slots;
}

export function HeroDragHeading({
  lines,
  mobileLines = lines,
  align = "center",
}: {
  lines: string[][];
  mobileLines?: string[][];
  align?: "center" | "left";
}) {
  const [held, setHeld] = useState<string | null>(null);
  const slots = layout(lines, mobileLines);

  return (
    <span className={`flex w-full flex-wrap items-baseline ${align === "left" ? "justify-start" : "justify-center"}`} style={{ columnGap: "0.28em" }}>
      {slots.map(({ word, mobile, mEnd, dEnd }, i) => {
        const id = String(i);
        const delay = WAVE_START_MS + i * WAVE_STEP_MS;
        const brk = mEnd && dEnd ? "block" : mEnd ? "block sm:hidden" : dEnd ? "hidden sm:block" : null;
        return (
          <Fragment key={id}>
            <motion.span
              drag
              dragSnapToOrigin
              dragTransition={{ bounceStiffness: 420, bounceDamping: 20 }}
              whileDrag={{ scale: 1.06, rotate: -2 }}
              onDragStart={() => setHeld(id)}
              onDragEnd={() => setHeld(null)}
              className={`relative cursor-grab select-none active:cursor-grabbing ${mobile === null ? "hidden sm:inline-block" : "inline-block"}`}
              // pan-y keeps vertical swipes scrolling the page on touch, so
              // the heading never traps someone trying to scroll past it.
              style={{ touchAction: "pan-y", zIndex: held === id ? 20 : undefined }}
            >
              {/* The wave rides an inner span so it never fights the drag
                  transform on the outer one. */}
              <span className="hero-wave inline-block" style={{ animationDelay: `${delay}ms` }}>
                {mobile !== null && mobile !== word ? (
                  <>
                    <span className="sm:hidden">{mobile}</span>
                    <span className="hidden sm:inline">{word}</span>
                  </>
                ) : (
                  word
                )}
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
            {brk && <span aria-hidden="true" className={`${brk} h-0 basis-full my-0.5 sm:my-1`} />}
          </Fragment>
        );
      })}
    </span>
  );
}
