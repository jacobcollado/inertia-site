"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { SELECTION_FRAME_COLOR } from "@/components/figma-frame";

// Homepage section heading: plain ink type held in a Figma selection frame,
// the same 1px blue frame and square handles the hero puts on a word you drag.
// The frame draws itself in from the top-left corner the first time the
// heading scrolls into view, then the handles pop. Replaces the solid black
// label chips, which read heavier than the hero they follow.

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DRAW_MS = 700;
const HANDLE = 6;

export function SectionHeading({
  children,
  className = "",
  style,
  align = "center",
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  align?: "center" | "left";
  // "dark" for the sections on the black zone: ink and handle fill follow
  // the zone's --fg / --surface (the grey panels they sit on).
  tone?: "light" | "dark";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        setOn(true);
      },
      { threshold: 0.6 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const shown = on || reduced;
  const h = -HANDLE / 2;
  const ink = tone === "dark" ? "rgb(var(--fg))" : "var(--ink)";
  const paper = tone === "dark" ? "rgb(var(--surface))" : "var(--paper)";

  return (
    <h2 className={`${align === "left" ? "text-left" : "text-center"} ${className}`} style={style}>
      <span
        ref={ref}
        // Same scale as the other section headings on the page ("In good
        // company", "Don't take our word for it"), so they read as one set.
        className="relative inline-block px-[0.32em] py-[0.12em] text-[clamp(1.8rem,3vw,2.5rem)] tracking-[-0.03em] leading-[1.1]"
        style={{ color: ink, fontWeight: 450 }}
      >
        {children}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: `inset 0 0 0 1px ${SELECTION_FRAME_COLOR}`,
            clipPath: shown ? "inset(0 0 0 0)" : "inset(0 100% 100% 0)",
            transition: reduced ? "none" : `clip-path ${DRAW_MS}ms ${EASE}`,
          }}
        />
        {[{ top: h, left: h }, { top: h, right: h }, { bottom: h, right: h }, { bottom: h, left: h }].map((pos, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              ...pos,
              background: paper,
              width: HANDLE,
              height: HANDLE,
              border: `1px solid ${SELECTION_FRAME_COLOR}`,
              opacity: shown ? 1 : 0,
              transform: shown ? "scale(1)" : "scale(0.4)",
              transition: reduced ? "none" : `opacity 200ms ${EASE} ${DRAW_MS - 150 + i * 60}ms, transform 300ms ${EASE} ${DRAW_MS - 150 + i * 60}ms`,
            }}
          />
        ))}
      </span>
    </h2>
  );
}
