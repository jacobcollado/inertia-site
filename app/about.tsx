"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { TimeTagline } from "./ambient";

const iconClass = "inline-block h-[0.95em] w-[0.95em] align-[-0.1em] mx-[0.15em]";
const chipIconClass = "h-4 w-4";

const BRAND = {
  react: "#61DAFB",
  next: "#111111",
  ts: "#3178C6",
  tailwind: "#38BDF8",
  node: "#5FA04E",
  liquid: "#95BF47",
  backend: "#A855F7",
};

const ReactIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={BRAND.react} strokeWidth="1.3" aria-hidden="true" className={iconClass}>
    <circle cx="12" cy="12" r="1.8" fill={BRAND.react} stroke="none" />
    <ellipse cx="12" cy="12" rx="10" ry="4" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
  </svg>
);

const NextIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={`${iconClass} text-[rgb(var(--fg))]`}>
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <path d="M8 7v10M8 7l8 10" stroke="rgb(var(--bg))" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M15.8 7v5.2" stroke="rgb(var(--bg))" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

const TypeScriptIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClass}>
    <rect x="3" y="3" width="18" height="18" rx="2" fill={BRAND.ts} />
    <path d="M7.5 11h5M10 11v6" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <path d="M17.5 11.6c-.4-.5-1-.8-1.8-.8-1 0-1.7.5-1.7 1.3 0 .8.6 1.1 1.7 1.4 1.3.3 2 .8 2 1.9 0 1.1-.9 1.8-2.1 1.8-1 0-1.8-.4-2.3-1" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
  </svg>
);

const TailwindIcon = () => (
  <svg viewBox="0 0 24 24" fill={BRAND.tailwind} aria-hidden="true" className={chipIconClass}>
    <path d="M4 13c1-3 2.5-4.5 5-4.5 3 0 3.5 2 5.5 2.5 1.5.4 2.8-.2 4-1.8-1 3-2.5 4.5-5 4.5-3 0-3.5-2-5.5-2.5-1.5-.4-2.8.2-4 1.8Z" />
    <path d="M4 19c1-3 2.5-4.5 5-4.5 3 0 3.5 2 5.5 2.5 1.5.4 2.8-.2 4-1.8-1 3-2.5 4.5-5 4.5-3 0-3.5-2-5.5-2.5-1.5-.4-2.8.2-4 1.8Z" opacity=".75" />
  </svg>
);

const NodeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={chipIconClass}>
    <path d="M12 2.5 3.5 7v10L12 21.5 20.5 17V7L12 2.5Z" fill={BRAND.node} />
    <path d="M9.5 10.5v4.5c0 .8-.5 1.2-1.2 1.2-.6 0-1.1-.3-1.3-.7M14 14.5c.2.7.8 1 1.8 1s1.6-.3 1.6-1c0-1.7-3.4-.7-3.4-2.6 0-.7.7-1.2 1.7-1.2.9 0 1.5.3 1.7.9" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

const LiquidIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={chipIconClass}>
    <path d="M12 3s-6 6.5-6 11a6 6 0 0 0 12 0c0-4.5-6-11-6-11Z" fill={BRAND.liquid} />
    <path d="M9.5 14c0 1.5 1 2.5 2.5 2.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".85" />
  </svg>
);

const BackendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={BRAND.backend} strokeWidth="1.5" aria-hidden="true" className={chipIconClass}>
    <ellipse cx="12" cy="5.5" rx="7" ry="2.5" fill={BRAND.backend} fillOpacity="0.15" />
    <path d="M5 5.5v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5" />
    <path d="M5 10.5v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5" />
    <path d="M5 15.5v3c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-3" />
  </svg>
);

const extras: { name: string; icon: React.ReactNode }[] = [
  { name: "Tailwind", icon: <TailwindIcon /> },
  { name: "Node.js", icon: <NodeIcon /> },
  { name: "Liquid", icon: <LiquidIcon /> },
  { name: "Backend fundamentals", icon: <BackendIcon /> },
];

export function AboutCard() {
  const [open, setOpen] = useState(false);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const paragraphs = [
    <p key="p1">
      My work lives at the seam of design and engineering. I move from identity and art direction into React<ReactIcon />, Next.js<NextIcon />, and TypeScript<TypeScriptIcon /> without losing the thread, so the thing you see and the thing you click feel like one piece.
    </p>,
    <p key="p2">
      I build with AI as a daily collaborator, weaving LLMs and agents into the products I ship. I&apos;ve been studying the space since 2021, and I treat it less like a tool and more like a material.
    </p>,
    <p key="p3">
      Along the way I&apos;ve shaped identities for Trippie Redd, FT.GIOO, and Mood Swings, run my own clothing brand, and kept a handful of independent projects in motion. Everything here is solo, start to finish.
    </p>,
  ];

  return (
    <div>
      <TimeTagline fallback="I design and build end to end, shaping brand, web, and product from concept to code." />

      {/* First paragraph — always visible */}
      <div
        className="mt-5 text-base leading-relaxed tracking-tight text-[rgb(var(--muted))]"
        style={{
          opacity: 1,
          transition: "opacity 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {paragraphs[0]}
      </div>

      {/* Expanded content */}
      <div
        aria-hidden={!open}
        style={{
          height: open ? height : 0,
          opacity: open ? 1 : 0,
          filter: open ? "blur(0)" : "blur(4px)",
          transform: open ? "translateY(0)" : "translateY(-4px)",
          marginTop: open ? "1.25rem" : "0rem",
          overflow: "hidden",
          transition:
            "height 700ms cubic-bezier(0.22, 1, 0.36, 1)," +
            "opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)," +
            "filter 600ms cubic-bezier(0.22, 1, 0.36, 1)," +
            "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)," +
            "margin-top 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "height, opacity, transform, filter",
        }}
      >
        <div ref={innerRef}>
          <div className="space-y-4 text-base leading-relaxed tracking-tight text-[rgb(var(--muted))]">
            {paragraphs.slice(1).map((p, i) => {
              const delay = 80 + i * 80;
              return (
                <div
                  key={i}
                  style={{
                    opacity: open ? 1 : 0,
                    transform: open ? "translateY(0)" : "translateY(5px)",
                    transition: `opacity 500ms cubic-bezier(0.22, 1, 0.36, 1) ${open ? delay : 0}ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) ${open ? delay : 0}ms`,
                    willChange: "opacity, transform",
                  }}
                >
                  {p}
                </div>
              );
            })}
          </div>

          {/* Tech stack chips */}
          <div
            className="mt-6 flex flex-wrap gap-2"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(5px)",
              transition: `opacity 500ms cubic-bezier(0.22, 1, 0.36, 1) ${open ? 280 : 0}ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) ${open ? 280 : 0}ms`,
            }}
          >
            {extras.map(({ name, icon }) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--line))] px-3 py-1 text-xs tracking-tight text-[rgb(var(--muted))]"
              >
                <span className="inline-flex">{icon}</span>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-4 text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors outline-none focus-visible:underline underline-offset-4"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-1.5">
          {open ? "read less" : "read more"}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-500 ease-fluid"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            ↓
          </span>
        </span>
      </button>
    </div>
  );
}
