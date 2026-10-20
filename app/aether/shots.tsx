"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// What Aether does, shown on the store doing it: three screens from a store
// on Aether, each standing in a grey tile, with the one part that sells
// lifted off the screen as a raised detail, a little larger than the phone,
// and one short sentence under it. When the row comes into view each detail
// lifts, one after the other. Side by side from tablets up; a row to swipe
// on phones.
// Styles are .ae-shots in globals.css.

type Shot = {
  src: string;
  w: number;
  h: number;
  /** The part to mark, as percentages of the image: left, top, width, height. */
  spot: [number, number, number, number];
  line: string;
};

const SHOTS: Shot[] = [
  {
    src: "/aether/hero-mobile-jacket.png",
    w: 1280,
    h: 2642,
    spot: [4.6, 76.6, 90.8, 9.2],
    line: "Shows stock and free shipping right by the button.",
  },
  {
    src: "/aether/feature-mobile-scarcity.png",
    w: 1300,
    h: 2642,
    spot: [5.6, 67.2, 88.8, 12.9],
    line: "Sold-out sizes collect emails for the restock.",
  },
  {
    src: "/aether/feature-mobile-upsell.png",
    w: 1300,
    h: 2642,
    spot: [5.6, 36.8, 88.8, 28.6],
    line: "Upsells and a free shipping tracker in the cart.",
  },
];

export function Shots() {
  const ref = useRef<HTMLElement>(null);
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
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="ae-shots" data-on={on || undefined} aria-label="What Aether does">
      <ol className="ae-shots__list">
        {SHOTS.map((s, i) => (
          <li key={s.src} className="ae-shots__item" style={{ "--i": i } as React.CSSProperties}>
            <div className="ae-shots__tile">
              <div className="ae-shots__phone" style={{ aspectRatio: `${s.w} / ${s.h}` }}>
                <Image src={s.src} alt="" fill sizes="(min-width: 900px) 16rem, 50vw" className="ae-shots__img" />
                {/* The detail: the same screen, cropped to the part and drawn
                    over it a little larger. */}
                <span
                  className="ae-shots__detail"
                  style={{ left: `${s.spot[0]}%`, top: `${s.spot[1]}%`, width: `${s.spot[2]}%`, height: `${s.spot[3]}%` }}
                  aria-hidden
                >
                  <span
                    className="ae-shots__crop"
                    style={{
                      width: `${10000 / s.spot[2]}%`,
                      height: `${10000 / s.spot[3]}%`,
                      left: `${(-s.spot[0] * 100) / s.spot[2]}%`,
                      top: `${(-s.spot[1] * 100) / s.spot[3]}%`,
                      backgroundImage: `url(${s.src})`,
                    }}
                  />
                </span>
              </div>
            </div>
            <h3 className="ae-shots__line">{s.line}</h3>
          </li>
        ))}
      </ol>
    </section>
  );
}
