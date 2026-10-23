"use client";

import { useEffect, useRef, useState } from "react";
import { fitNoise, noise } from "@/components/decrypt";

// About, straight after the opening plate (styles are .about in
// globals.css): what we do, in one sentence, decrypted. It waits as
// scrambled characters in a grey mono and, once it's well in view, each word
// resolves into our type in reading order, its characters cycling a few
// times first. Quick, and it settles hard: no fade on the resolved words.
// Each word's box is sized by its resolved text, with the noise laid over
// it, so nothing reflows as it resolves. With reduced motion it's simply
// there.

const SENTENCE = "We design identities and websites for founders, as one system, so you look like the company you\u2019re becoming.";
const WORDS = SENTENCE.split(" ");
// When the first word resolves, how far apart the rest follow, and how often
// the noise changes, in ms.
const LEAD = 260;
const STEP = 55;
const TICK = 45;

export function About() {
  const ref = useRef<HTMLHeadingElement>(null);
  // How many words have resolved, and the current noise of the rest.
  const [done, setDone] = useState(0);
  const [frame, setFrame] = useState(0);
  // How many glyphs of noise fit each word, once the fonts are in.
  const [fit, setFit] = useState<number[] | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setFit(fitNoise(el));
    document.fonts.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(WORDS.length);
      return;
    }
    let raf = 0;
    let start = 0;
    let last = 0;
    const run = (now: number) => {
      if (!start) start = now;
      const t = now - start;
      const resolved = Math.max(0, Math.min(WORDS.length, Math.floor((t - LEAD) / STEP) + 1));
      setDone(resolved);
      if (now - last >= TICK) {
        last = now;
        setFrame((f) => f + 1);
      }
      if (resolved < WORDS.length) raf = requestAnimationFrame(run);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.5) return;
        io.disconnect();
        raf = requestAnimationFrame(run);
      },
      { threshold: [0, 0.5] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="index-col about">
      <h1 ref={ref} className="about__statement" aria-label={SENTENCE}>
        {WORDS.map((w, i) => (
          <span key={i} aria-hidden>
            <span className="decrypt" data-resolved={i < done ? "" : undefined}>
              <span className="decrypt__word">{w}</span>
              {i < done ? null : <span className="decrypt__noise">{noise(w, fit?.[i] ?? w.length, i * 7919 + frame * 104729)}</span>}
            </span>
            {i < WORDS.length - 1 ? " " : null}
          </span>
        ))}
      </h1>
    </section>
  );
}
