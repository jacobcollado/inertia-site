"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { TESTIMONIALS, type Testimonial } from "./reviews";

// The review as sent, its standout line inked in once the row has landed.
// Falls back to plain text if the phrase isn't found, so an edited quote
// can't break.
function QuoteText({ t }: { t: Testimonial }) {
  const at = t.highlight ? t.quote.indexOf(t.highlight) : -1;
  if (!t.highlight || at < 0) return <>{t.quote}</>;
  return (
    <>
      {t.quote.slice(0, at)}
      <span className="ae-said__hl">{t.highlight}</span>
      {t.quote.slice(at + t.highlight.length)}
    </>
  );
}

/* The reviews in the page's own format: each on a recessed tile, whole, as
 * the store sent it, the store at the foot. Three across from 900px; on
 * phones a row to swipe, the next tile peeking in, like the screens and the
 * stores above. As the row arrives each review's standout line goes to ink,
 * one after the other. Styles are .ae-said in globals.css. */
export function Testimonials() {
  const ref = useRef<HTMLUListElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setOn(true);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <ul ref={ref} className="ae-said__list" data-on={on || undefined}>
      {TESTIMONIALS.map((t, i) => (
        <li key={t.name} className="ae-said__tile" style={{ "--i": i } as CSSProperties}>
          <figure className="ae-said__card">
            <blockquote className="ae-said__quote">
              &ldquo;<QuoteText t={t} />&rdquo;
            </blockquote>
            <figcaption className="ae-said__by">
              {t.logo && <Image src={t.logo} alt="" width={28} height={28} className="ae-said__logo" />}
              {t.site ?? t.name}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
