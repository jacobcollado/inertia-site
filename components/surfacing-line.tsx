"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

// A large line that surfaces out of the dark as it scrolls into view: each
// word comes up from a soft blur, a few at a time, tied to scroll position
// rather than a timer, so it settles exactly as fast as the reader moves.
// Used as the enquiry's heading, where the light card pulls away above it.

// Share of the scroll window each word takes to come up; the rest staggers
// their starts across it.
const WORD_SPAN = 0.45;

function Word({ progress, start, children }: { progress: MotionValue<number>; start: number; children: string }) {
  const range = [start, start + WORD_SPAN];
  const opacity = useTransform(progress, range, [0, 1]);
  const blur = useTransform(progress, range, [14, 0]);
  const filter = useTransform(blur, (b) => (b < 0.05 ? "none" : `blur(${b}px)`));
  const y = useTransform(progress, range, ["0.18em", "0em"]);
  return (
    <motion.span className="inline-block will-change-[filter,opacity,transform]" style={{ opacity, filter, y }}>
      {children}
    </motion.span>
  );
}

export function SurfacingLine({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion() ?? false;
  // 0 as the line's top enters the lower edge of the view, 1 once it
  // reaches the middle, so it has settled by the time it's being read.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.5"] });
  const words = text.split(" ");
  const step = words.length > 1 ? (1 - WORD_SPAN) / (words.length - 1) : 0;

  return (
    <h2
      ref={ref}
      className={`text-balance text-[clamp(2.6rem,7.6vw,5.75rem)] leading-[1.02] tracking-[-0.045em] text-[rgb(var(--fg))] ${className}`}
      style={{ fontWeight: 450 }}
    >
      {reduced ? (
        text
      ) : (
        <>
          <span className="sr-only">{text}</span>
          <span aria-hidden="true">
            {words.map((w, i) => (
              <span key={w + i}>
                <Word progress={scrollYProgress} start={i * step}>
                  {w}
                </Word>{" "}
              </span>
            ))}
          </span>
        </>
      )}
    </h2>
  );
}
