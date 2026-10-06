"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AETHER_LIQUID_EASE, AETHER_LIQUID_MS } from "./motion";

export interface ThemeVariation {
  name: string;
  image: string;
  imageMobile: string;
}

type ViewMode = "desktop" | "mobile";

// MacBook renders are landscape (~1.59:1); the phone renders are portrait
// (~0.49:1).
const SHOT_W = 1365;
const SHOT_H = 858;
const SHOT_W_MOBILE = 1300;
const SHOT_H_MOBILE = 2642;

const FADE = `opacity ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`;

const SEGMENT_TRACK = "inline-flex gap-1 rounded-[6px] bg-[rgb(var(--surface)/0.6)] p-1";
const segmentClass = (selected: boolean) =>
  `shrink-0 whitespace-nowrap rounded-[6px] px-3 py-1.5 text-[13px] sm:text-[14px] tracking-tight capitalize transition-colors duration-200 [-webkit-tap-highlight-color:transparent] ${
    selected
      ? "bg-[rgb(var(--bg))] text-[rgb(var(--fg))] shadow-[0_0_0_1px_rgb(var(--line)),0_1px_2px_rgb(0_0_0/0.06)]"
      : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
  }`;

/* "Make it yours", laid out like "Built to sell" and "See it in action"
 * above it: the heading and its line on the left with the device switch
 * beside them, the selected style's preview on a plain tile, then the four
 * styles as small thumbnail cards under it, the selected one outlined in
 * ink. Switching a style or device crossfades the preview in place, nothing
 * slides. */
export function VariationsScroll({
  variations,
  initial,
}: {
  variations: ThemeVariation[];
  /** Name of the style to open on. Defaults to the first one. */
  initial?: string;
}) {
  const named = initial ? variations.findIndex((v) => v.name === initial) : -1;
  const [active, setActive] = useState(named >= 0 ? named : 0);
  // Desktop for a stable SSR render, then mobile on mount for phones, who
  // almost certainly want to see the phone layout first.
  const [mode, setMode] = useState<ViewMode>("desktop");

  useEffect(() => {
    if (window.matchMedia("(max-width: 639px)").matches) setMode("mobile");
  }, []);

  const current = variations[active];
  const modes: ViewMode[] = ["desktop", "mobile"];

  const deviceToggle = (
    <div role="tablist" aria-label="Preview device" className={SEGMENT_TRACK}>
      {modes.map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          onClick={() => setMode(m)}
          className={segmentClass(mode === m)}
        >
          {m}
        </button>
      ))}
    </div>
  );

  return (
    <section className="rise rise-stagger mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] py-16 sm:py-24">
      <div className="mb-10 flex items-end justify-between gap-6 sm:mb-12">
        <div>
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-[1.1] text-[rgb(var(--fg))]">
            Make it yours
          </h2>
          <p className="mt-2 max-w-lg text-[15.5px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
            Start from one of four styles, then change colors, fonts and layout in the theme editor. No code.
          </p>
        </div>
        <div className="hidden shrink-0 sm:block">{deviceToggle}</div>
      </div>

      <div className="rounded-[6px] bg-[var(--tile)] px-3 py-5 sm:px-10 sm:py-10">
        <div
          className={`relative mx-auto w-full max-w-[64rem] overflow-hidden ${
            mode === "mobile" ? "aspect-[4/5] sm:aspect-[1365/858]" : "aspect-[1365/858]"
          }`}
        >
          {/* Every style of the current device stays mounted and fades, so
              switching never waits on a fresh image. */}
          {variations.map((v, i) => {
            const shown = i === active;
            const mobile = mode === "mobile";
            return (
              <Image
                key={`${v.name}-${mode}`}
                src={mobile ? v.imageMobile : v.image}
                alt={shown ? `${v.name} style, ${mode} view` : ""}
                aria-hidden={!shown}
                width={mobile ? SHOT_W_MOBILE : SHOT_W}
                height={mobile ? SHOT_H_MOBILE : SHOT_H}
                sizes={mobile ? "(min-width: 640px) 20rem, 60vw" : "(min-width: 1024px) 64rem, 94vw"}
                quality={90}
                loading={shown ? "eager" : "lazy"}
                draggable={false}
                className={`absolute inset-0 m-auto motion-reduce:transition-none ${mobile ? "h-[96%] w-auto" : "h-full w-full object-contain"}`}
                style={{ opacity: shown ? 1 : 0, transition: FADE }}
              />
            );
          })}
        </div>
      </div>

      {/* The styles: a thumbnail of each with its name, the selected one
          outlined in ink. */}
      <div role="tablist" aria-label="Aether styles" className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
        {variations.map((v, i) => {
          const selected = i === active;
          return (
            <button
              key={v.name}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(i)}
              className="group text-left [-webkit-tap-highlight-color:transparent]"
            >
              <span
                className="relative block aspect-[16/10] overflow-hidden rounded-[6px] bg-[var(--tile)] transition-shadow duration-200"
                style={{ boxShadow: selected ? "0 0 0 1px rgb(var(--fg))" : "0 0 0 1px transparent" }}
              >
                <Image src={v.image} alt="" fill sizes="(min-width: 640px) 18rem, 24vw" className="object-cover object-top transition-opacity duration-200 group-hover:opacity-90" />
              </span>
              <span
                className={`mt-2 block text-[13px] sm:text-[15px] tracking-tight transition-colors duration-200 ${
                  selected ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))]"
                }`}
              >
                {v.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center sm:hidden">{deviceToggle}</div>
    </section>
  );
}
