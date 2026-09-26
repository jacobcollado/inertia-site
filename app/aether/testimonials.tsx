"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

interface Testimonial {
  quote: string;
  name: string;
  /** Brand logo, a circular PNG in /public/reviews. Optional: without one
   * the caption shows the name alone. */
  logo?: string;
}

/* Real reviews from brands Inertia has worked with, quoted as sent. The
 * heading says "worked with" rather than claiming each one runs Aether, so
 * keep it that way unless every review here is from an Aether store. */
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "You've been great, super happy with how our website turned out and how quickly you were able to do everything. You make all the changes we have needed and are constantly willing to help. You have been amazing!",
    name: "vora.archive",
    logo: "/reviews/voraarchive.png",
  },
  {
    quote:
      "I am happy with the service you provided, was a safe process, turn around time was good, requests were met tweaks were made that were asked for and you designed a very clear easy to use functioning store, would recommend & refer you to anyone else in need of a site",
    name: "defy.ca",
    logo: "/reviews/defy.png",
  },
  {
    // The review named the studio "Agentic Web Designer"; Inertia is the
    // current name, swapped in at the owner's request. Em dashes replaced
    // with a period, per the site's copy rules.
    quote:
      "Awesome customer service from start to finish! They worked directly with me and my team throughout the entire process, were responsive, professional, and made sure everything was exactly how we wanted it. Great experience overall. 100% recommend Inertia to anyone looking for a reliable web design team!",
    name: "Awoken Dreams",
    logo: "/reviews/awokendreams.png",
  },
];

/* Mobile: a scroll-snap row with the next card peeking in. sm and up: the
 * two-column grid. Same pattern as the homepage's "What we do" carousel. */
const SLIDE = "max-sm:w-[85%] max-sm:shrink-0 max-sm:snap-start";

function Card({ t, index }: { t: Testimonial; index: number }) {
  return (
    <figure
      className={`rise rise--liquid flex flex-col justify-between gap-6 rounded-xl bg-[rgb(var(--surface)/0.45)] p-5 sm:p-7 ${SLIDE}`}
      style={{ "--rise-delay": `${80 + index * 70}ms` } as CSSProperties}
    >
      <blockquote className="text-[16px] leading-snug tracking-tight text-[rgb(var(--fg))] [text-wrap:pretty] sm:text-[19px]">
        {t.quote}
      </blockquote>
      <figcaption className="flex items-center gap-2.5">
        {/* The ring keeps a white logo from dissolving into a light card. */}
        {t.logo ? (
          <Image
            src={t.logo}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-full ring-1 ring-[rgb(var(--line))]"
          />
        ) : null}
        <span className="text-[13px] tracking-tight text-[rgb(var(--fg))] sm:text-[14px]">{t.name}</span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const slides = Array.from(track.children) as HTMLElement[];
        const left = track.scrollLeft + track.offsetLeft;
        let nearest = 0;
        slides.forEach((el, i) => {
          if (Math.abs(el.offsetLeft - left) < Math.abs(slides[nearest].offsetLeft - left)) nearest = i;
        });
        setActive(nearest);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const goTo = (i: number) => {
    const track = trackRef.current;
    const el = track?.children[i] as HTMLElement | undefined;
    if (!track || !el) return;
    track.scrollTo({ left: el.offsetLeft - track.offsetLeft, behavior: "smooth" });
  };

  return (
    <>
      <div className="grid-rule grid-rule--dashed" aria-hidden="true" />
      <section className="px-3 py-16 sm:py-24" aria-label="What brands say">
        <p className="rise rise--liquid mb-10 text-center text-[clamp(1.8rem,3vw,2.5rem)] font-normal leading-none tracking-[-0.03em] text-[rgb(var(--fg))]">
          From brands we&apos;ve worked with
        </p>
        <div
          ref={trackRef}
          className="no-scrollbar mx-auto max-w-[56rem] lg:max-w-[76rem] gap-3 max-sm:-mx-3 max-sm:flex max-sm:items-stretch max-sm:overflow-x-auto max-sm:overscroll-x-contain max-sm:snap-x max-sm:snap-mandatory max-sm:px-3 max-sm:scroll-px-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4"
        >
          {TESTIMONIALS.map((t, i) => (
            <Card key={t.name} t={t} index={i} />
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-1.5 sm:hidden">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.name}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show review from ${t.name}`}
              aria-current={active === i}
              className="flex h-6 items-center px-0.5"
            >
              <span
                className="block h-1.5 rounded-full transition-[width,background-color] duration-300"
                style={{
                  width: active === i ? 18 : 6,
                  background: active === i ? "rgb(var(--fg))" : "rgb(var(--fg) / 0.2)",
                }}
              />
            </button>
          ))}
        </div>
        <p className="rise rise--liquid mt-6 text-center text-[14px] tracking-tight text-[rgb(var(--muted))] sm:text-[15px]">
          And 500+ other brands
        </p>
      </section>
    </>
  );
}
