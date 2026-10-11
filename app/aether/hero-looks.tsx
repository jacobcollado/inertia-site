"use client";

import Image from "next/image";
import { useState } from "react";
import { AETHER_LIQUID_EASE, AETHER_LIQUID_MS } from "./motion";

/* The hero's visual from sm up: one laptop that crossfades between the four
 * example stores, their names in a row under it. The active name carries a
 * thin bar that fills while its look is showing; when the bar finishes, the
 * next look comes in (onAnimationEnd drives the rotation, so hover can pause
 * bar and rotation together). Clicking a name jumps to it. With reduced
 * motion the bar has no animation, so nothing advances on its own. CSS in
 * globals.css ("Aether hero looks"). */

const LOOKS = [
  { name: "Rosso", src: "/aether/rosso-macbook-v2.png" },
  { name: "Relics", src: "/aether/relics-macbook.png" },
  { name: "Argent", src: "/aether/argent-macbook.png" },
  { name: "After Hours", src: "/aether/after-hours-macbook.png" },
];

export function HeroLooks() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const fade = `opacity ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`;

  return (
    <div onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      {/* The MacBook renders sit in a wide transparent margin (the laptop is
          ~57% of the frame), so they're scaled up 1.4x to fill the column. */}
      <div className="hero-bob relative mx-auto aspect-[3/2] w-full">
        {LOOKS.map((l, i) => {
          const shown = i === active;
          return (
            <Image
              key={l.name}
              src={l.src}
              alt={shown ? `${l.name}, an example Aether store, on MacBook` : ""}
              aria-hidden={!shown}
              width={4500}
              height={3000}
              sizes="(min-width: 1024px) 70vw, 125vw"
              quality={90}
              priority={i === 0}
              loading={i === 0 ? undefined : "eager"}
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full scale-[1.4] select-none object-contain motion-reduce:transition-none"
              style={{ opacity: shown ? 1 : 0, transition: fade }}
            />
          );
        })}
      </div>

      <div role="tablist" aria-label="Example stores" className="relative mt-2 flex justify-center gap-5 sm:gap-7">
        {LOOKS.map((l, i) => {
          const selected = i === active;
          return (
            <button
              key={l.name}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(i)}
              className={`group relative pb-2 text-[13px] sm:text-[14px] tracking-tight transition-colors duration-200 [-webkit-tap-highlight-color:transparent] ${
                selected ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
              }`}
            >
              {l.name}
              <span className="absolute inset-x-0 bottom-0 h-px overflow-hidden bg-[rgb(var(--fg)/0.1)]" aria-hidden="true">
                {selected && (
                  <span
                    key={active}
                    className="hero-looks-bar block h-full bg-[rgb(var(--fg))]"
                    style={{ animationPlayState: paused ? "paused" : "running" }}
                    onAnimationEnd={() => setActive((a) => (a + 1) % LOOKS.length)}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
