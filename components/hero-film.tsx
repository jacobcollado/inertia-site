"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

// The homepage hero's canvas: one slow, quiet shot of daylight on a wall,
// graded cool and nearly monochrome with film grain, looping without a cut.
// It's there for the feeling, not to explain anything: the hush just before
// something begins. Real footage from Pexels (free licence, no credit
// required), cut and graded for the site; sources below.
//
// Wide screens get a 2.39:1 cut and phones a 4:5 one. While the films are
// being chosen, `?film=2` or `?film=3` swaps in the other candidates.

// Files in public/hero: <name>-wide and <name>-tall, each an .mp4 and a
// .jpg poster of its first frame.
const FILMS = [
  { name: "light-tree", source: "https://www.pexels.com/video/shadows-of-tree-on-concrete-11025693/" },
  { name: "light-plant", source: "https://www.pexels.com/video/plant-shadow-on-a-wall-4238473/" },
  { name: "light-wood", source: "https://www.pexels.com/video/shadow-of-leaves-on-a-wooden-wall-4106940/" },
];
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)"; // the hero's liquid ease

export function HeroFilm({ play, style }: { play: boolean; style?: CSSProperties }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLVideoElement>(null);
  const [cut, setCut] = useState<{ film: string; wide: boolean } | null>(null);
  const [ready, setReady] = useState(false);

  // Which cut to load is only known in the browser.
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get("film"));
    const film = FILMS[n >= 1 && n <= FILMS.length ? n - 1 : 0].name;
    setCut({ film, wide: window.matchMedia("(min-width: 640px)").matches });
  }, []);

  // Plays once the hero is in and only while it's on screen. Reduced
  // motion keeps the first frame, still.
  useEffect(() => {
    const v = ref.current;
    if (!v || !play || reduce) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [play, reduce, cut]);

  const src = cut && `/hero/${cut.film}-${cut.wide ? "wide" : "tall"}`;

  return (
    <div
      className="relative w-full overflow-hidden rounded-[6px] aspect-[4/5] sm:aspect-[2.39/1]"
      style={{ background: "var(--tile)", ...style }}
    >
      {src && (
        <video
          key={src}
          ref={ref}
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
          src={`${src}.mp4`}
          poster={`${src}.jpg`}
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setReady(true)}
          style={{
            opacity: ready ? 1 : 0,
            filter: ready ? "blur(0px)" : "blur(12px)",
            transform: ready ? "scale(1)" : "scale(1.02)",
            transition: `opacity 1200ms ${EASE}, filter 1200ms ${EASE}, transform 1600ms ${EASE}`,
          }}
        />
      )}
    </div>
  );
}
