"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";

// A walk through a store running Aether. The section pins one large screen
// while the page scrolls past it: each step's screen wipes up over the last,
// the way scrolling down a store feels, and its name and sentence flip in
// with it. What the theme does is shown on the store doing it, not claimed.
// Without motion (or before JS) the steps are simply stacked.
// Styles are .ae-walk in globals.css.

export type WalkStep = {
  name: string;
  title: string;
  line: string;
  desktop: { src: string; w: number; h: number };
  mobile: { src: string; w: number; h: number };
};

function Screens({ step, i, pos }: { step: WalkStep; i: number; pos?: string }) {
  return (
    <div className="ae-walk__screen" data-pos={pos} style={{ zIndex: i + 1 }}>
      <Image
        src={step.desktop.src}
        alt={`${step.name} page of a store on Aether`}
        fill
        sizes="(min-width: 640px) 64rem, 1px"
        loading={i === 0 ? "eager" : undefined}
        className="ae-walk__desktop object-cover object-top"
      />
      <Image
        src={step.mobile.src}
        alt={`${step.name} page of a store on Aether, on a phone`}
        fill
        sizes="(max-width: 639px) 80vw, 1px"
        className="ae-walk__mobile object-contain"
      />
    </div>
  );
}

export function Walkthrough({ steps }: { steps: WalkStep[] }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  // Decided after mount: the server can't know the visitor's motion setting,
  // and the stacked steps are the right first render without it.
  const [pinned, setPinned] = useState(false);
  useEffect(() => setPinned(reduce === false), [reduce]);

  useEffect(() => {
    if (!pinned) return;
    const section = sectionRef.current;
    if (!section) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const r = section.getBoundingClientRect();
      const run = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / run));
      setActive(Math.min(steps.length - 1, Math.floor(p * steps.length)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pinned, steps.length]);

  if (!pinned) {
    return (
      <section className="index-col ae-walk ae-walk--list" aria-label="Inside a store on Aether">
        {steps.map((s, i) => (
          <div key={s.name} className="ae-walk__step">
            <p className="ae-walk__name">{s.name}</p>
            <h2 className="ae-walk__title">{s.title}</h2>
            <p className="ae-walk__line">{s.line}</p>
            <div className="ae-walk__frame">
              <Screens step={s} i={i} />
            </div>
          </div>
        ))}
      </section>
    );
  }

  const pos = (i: number) => (i < active ? "before" : i > active ? "after" : "on");
  return (
    <section ref={sectionRef} className="ae-walk" style={{ height: `${steps.length * 90 + 30}svh` }} aria-label="Inside a store on Aether">
      <div className="ae-walk__pin">
        <ol className="ae-walk__names" aria-hidden>
          {steps.map((s, i) => (
            <li key={s.name} data-on={i === active || undefined}>
              {s.name}
            </li>
          ))}
        </ol>
        <div className="ae-walk__stack ae-walk__stack--title">
          {steps.map((s, i) => (
            <h2 key={s.name} className="ae-walk__title" data-pos={pos(i)} aria-hidden={i !== active}>
              {s.title}
            </h2>
          ))}
        </div>
        <div className="ae-walk__stack ae-walk__stack--line">
          {steps.map((s, i) => (
            <p key={s.name} className="ae-walk__line" data-pos={pos(i)} aria-hidden={i !== active}>
              {s.line}
            </p>
          ))}
        </div>
        <div className="ae-walk__frame">
          {steps.map((s, i) => (
            <Screens key={s.name} step={s} i={i} pos={pos(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
