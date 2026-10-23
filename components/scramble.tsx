"use client";

import { useEffect, useState } from "react";

// A word that never quite finishes decoding (styles are .scramble in
// globals.css): it reads plainly, in our type, but every moment one or two
// of its letters flicker into the grey mono of the about sentence's noise
// and back. Each letter keeps its own width, the glyph laid over it, so the
// line never moves. With reduced motion it's simply the word.

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789#%&$@!?";
// How often the flicker moves on, and how many letters are out at once.
const TICK = 130;
const OUT = 2;

export function Scramble({ text }: { text: string }) {
  const letters = [...text];
  // The letters currently out, each with its glyph and how many ticks left.
  const [out, setOut] = useState<Record<number, { glyph: string; left: number }>>({});

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letters = [...text];
    const pick = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    const id = window.setInterval(() => {
      setOut((prev) => {
        const next: Record<number, { glyph: string; left: number }> = {};
        for (const [i, o] of Object.entries(prev)) if (o.left > 1) next[+i] = { glyph: pick(), left: o.left - 1 };
        // Now and then another letter goes out: never punctuation, and never
        // a narrow letter, which a mono glyph would spill out of.
        if (Object.keys(next).length < OUT && Math.random() < 0.55) {
          const i = Math.floor(Math.random() * letters.length);
          if (/[\p{L}\p{N}]/u.test(letters[i]) && !/[iljtfr]/i.test(letters[i]) && !next[i]) next[i] = { glyph: pick(), left: 1 + Math.floor(Math.random() * 3) };
        }
        return next;
      });
    }, TICK);
    return () => clearInterval(id);
  }, [text]);

  return (
    <span className="scramble" aria-label={text}>
      {letters.map((ch, i) => (
        <span key={i} className="scramble__ch" data-out={out[i] ? "" : undefined} aria-hidden>
          {ch}
          {out[i] ? <span className="scramble__glyph">{out[i].glyph}</span> : null}
        </span>
      ))}
    </span>
  );
}
