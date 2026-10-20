"use client";

import { Fragment, useEffect, useRef, type CSSProperties } from "react";

// The homepage's scroll reveals (styles under "Reveals" in globals.css). A
// revealed block is marked by a ref from useReveal; the first time enough of
// it is on screen it gets data-shown, and every .reveal-word in it rises into
// place out of a line just under it. Words go one after another, --w apart,
// and the parts of a section --i apart, all on the --motion-stagger beat, so
// a section arrives as one wave reading left to right and top to bottom.

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.shown = "";
        io.disconnect();
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}

// Text as words, each in its own mask, numbered from `from`.
export function Words({ text, from = 0 }: { text: string; from?: number }) {
  const words = text.split(" ");
  return words.map((w, i) => (
    <Fragment key={i}>
      <span className="reveal-word" style={{ "--w": from + i } as CSSProperties}>
        <span>{w}</span>
      </span>
      {i < words.length - 1 ? " " : null}
    </Fragment>
  ));
}
