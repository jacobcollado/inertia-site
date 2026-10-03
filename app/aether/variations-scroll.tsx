"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FigmaSelectionFrame, SELECTION_FILL, SELECTION_FRAME_COLOR } from "@/components/figma-frame";
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

/* "Make it yours" as a Figma canvas: the styles are layers, the preview is
 * the selected frame. Desktop lists the styles on the left like Figma's
 * layers panel; phones get them as a segmented control above. Switching a
 * style or device crossfades the preview in place, nothing slides. */
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
    <section className="px-3 py-16 sm:py-24 rise rise--liquid">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">
          Make it yours
        </h2>
        <p className="max-w-md text-[16px] sm:text-[19px] leading-snug tracking-tight text-[rgb(var(--muted))] [text-wrap:balance]">
          Start from one of four styles, then change colors, fonts and layout in the theme editor. No code.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-[64rem] gap-6 lg:grid-cols-[12rem_1fr] lg:gap-8">
        {/* Layers panel, desktop: each style with a small thumbnail, the
            selected one tinted the way Figma marks a selected layer. */}
        <div className="hidden lg:block">
          <p className="mb-2 px-2 text-[13px] tracking-tight text-[rgb(var(--muted))]">Styles</p>
          <div role="tablist" aria-label="Aether styles" aria-orientation="vertical" className="flex flex-col gap-0.5">
            {variations.map((v, i) => {
              const selected = i === active;
              return (
                <button
                  key={v.name}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-2.5 rounded-[6px] px-2 py-1.5 text-left text-[15px] tracking-tight transition-colors duration-200 ${
                    selected ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface)/0.6)] hover:text-[rgb(var(--fg))]"
                  }`}
                  style={selected ? { background: SELECTION_FILL, boxShadow: `inset 0 0 0 1px ${SELECTION_FRAME_COLOR}` } : undefined}
                >
                  <span className="relative h-7 w-11 shrink-0 overflow-hidden rounded-[6px] bg-[rgb(var(--surface))]">
                    <Image src={v.image} alt="" fill sizes="44px" className="object-cover object-top" />
                  </span>
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          {/* Phones and tablets: the styles as a segmented control. */}
          <div className="no-scrollbar mb-6 flex justify-center overflow-x-auto lg:hidden">
            <div role="tablist" aria-label="Aether styles" className={SEGMENT_TRACK}>
              {variations.map((v, i) => (
                <button
                  key={v.name}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className={segmentClass(i === active)}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          {/* Frame name on the left, like Figma labels a selected frame; the
              device switch on the right on desktop. Below lg it moves under
              the frame, so it isn't stacked against the style switcher. */}
          <div className="mb-2 flex items-end justify-between gap-3">
            <p className="text-[13px] sm:text-[14px] tracking-tight capitalize" style={{ color: SELECTION_FRAME_COLOR }}>
              {current.name} / {mode}
            </p>
            <div className="hidden lg:block">{deviceToggle}</div>
          </div>

          <FigmaSelectionFrame handleFill="rgb(var(--bg))" style={{ background: SELECTION_FILL }}>
            <div
              className={`relative w-full overflow-hidden ${
                mode === "mobile" ? "aspect-[4/5] sm:aspect-[1365/858]" : "aspect-[1365/858]"
              }`}
            >
              {/* Every style of the current device stays mounted and fades,
                  so switching never waits on a fresh image. */}
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
                    sizes={mobile ? "(min-width: 640px) 20rem, 60vw" : "(min-width: 1024px) 52rem, 94vw"}
                    quality={90}
                    loading={shown ? "eager" : "lazy"}
                    draggable={false}
                    className={`absolute inset-0 m-auto motion-reduce:transition-none ${
                      mobile ? "h-[92%] w-auto" : "h-full w-full object-contain"
                    }`}
                    style={{ opacity: shown ? 1 : 0, transition: FADE }}
                  />
                );
              })}
            </div>
          </FigmaSelectionFrame>

          <div className="mt-5 flex justify-center lg:hidden">{deviceToggle}</div>
        </div>
      </div>
    </section>
  );
}
