"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DieZoom, type DieZoomHandle } from "@/components/die-zoom";
import { DecryptText } from "@/components/decrypt-text";

// Why us (styles are .why in globals.css): the section is tall and its
// stage pins under the header while it's scrolled through. The reasons sit
// beside a chip the camera pushes into (die-zoom.tsx), the package, then
// the die, then one core tile; each reason waits as noise in the about
// sentence's grey mono and decrypts as its framing arrives, and scrolling
// back hides it again. With reduced motion nothing pins: the reasons are
// there and the drawing holds on the die.

const REASONS = [
  "We notice what feels off before anyone can say why.",
  "Nothing ships until every detail is right.",
  "The people you talk to are the people who make it.",
];
// Where each reason decrypts, through the section (the first as the stage
// comes up the screen, before it pins).
const AT = [-0.2, 0.3, 0.72];
// Whether motion is reduced, read before first paint (and kept up to date).
const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (change: () => void) => {
  const q = window.matchMedia(REDUCE);
  q.addEventListener("change", change);
  return () => q.removeEventListener("change", change);
};
const useReduce = () =>
  useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(REDUCE).matches,
    () => false,
  );

export function WhyUs() {
  const ref = useRef<HTMLElement>(null);
  const zoom = useRef<DieZoomHandle>(null);
  const reduce = useReduce();
  // How many reasons have decrypted.
  const [reached, setReached] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      zoom.current?.show(0.5);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const stage = el.firstElementChild as HTMLElement;
      const box = el.getBoundingClientRect();
      const run = box.height - stage.offsetHeight;
      // 0 as the stage pins under the header, 1 as it lets go.
      const p = run > 0 ? (parseFloat(getComputedStyle(stage).top) - box.top) / run : 0;
      zoom.current?.show(Math.min(1, Math.max(0, p)));
      setReached(AT.filter((at) => p >= at).length);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduce]);

  return (
    <section ref={ref} className="index-col why" aria-labelledby="why-label" data-still={reduce ? "" : undefined}>
      <div className="why__stage">
        <h2 id="why-label" className="sr-only">
          Why us
        </h2>
        <div className="why__list">
          {REASONS.map((r, i) => (
            <DecryptText key={r} as="h3" className="why__line" text={r} on={reduce || i < reached} />
          ))}
        </div>
        <div className="why__art">
          <DieZoom ref={zoom} />
        </div>
      </div>
    </section>
  );
}
