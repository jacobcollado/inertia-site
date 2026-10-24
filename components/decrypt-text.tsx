"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { fitNoise, noise } from "@/components/decrypt";

// A line of decrypting type (decrypt.ts): while it's off, it waits as noise
// in the grey mono, each word's noise as wide as the word; when it comes on
// it resolves word by word, and when it goes off again it returns to noise,
// last word first. Nothing reflows either way. With `cursor` a block sits
// after the last word while it resolves, and blinks out once it's done.

// How far apart the words resolve, and how often the noise changes, in ms.
const STEP = 55;
const TICK = 45;

export function DecryptText({
  text,
  on,
  as: Tag = "span",
  className,
  cursor = false,
}: {
  text: string;
  on: boolean;
  as?: ElementType;
  className?: string;
  cursor?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(" ");
  const [done, setDone] = useState(0);
  const [frame, setFrame] = useState(0);
  const [fit, setFit] = useState<number[] | null>(null);
  const doneRef = useRef(0);

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
    const target = on ? text.split(" ").length : 0;
    let raf = 0;
    let stepped = 0;
    let ticked = 0;
    const run = (now: number) => {
      if (now - stepped >= STEP && doneRef.current !== target) {
        stepped = now;
        doneRef.current += Math.sign(target - doneRef.current);
        setDone(doneRef.current);
      }
      if (now - ticked >= TICK) {
        ticked = now;
        setFrame((f) => f + 1);
      }
      if (doneRef.current !== target) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [on, text]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden>
          <span className="decrypt" data-resolved={i < done ? "" : undefined}>
            <span className="decrypt__word">{w}</span>
            {i < done ? null : <span className="decrypt__noise">{noise(w, fit?.[i] ?? w.length, i * 7919 + text.length * 31 + frame * 104729)}</span>}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
      {cursor && on ? <span className="decrypt__cursor" data-done={done === words.length ? "" : undefined} aria-hidden /> : null}
    </Tag>
  );
}
