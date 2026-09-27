"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";

interface Testimonial {
  quote: string;
  name: string;
  /** Brand logo, a circular PNG in /public/reviews. Optional: without one
   * the caption shows the name alone. */
  logo?: string;
  /** The brand's store, shown as a bare domain under the name. */
  site?: string;
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
    site: "voraarchive.com",
  },
  {
    quote:
      "I am happy with the service you provided, was a safe process, turn around time was good, requests were met tweaks were made that were asked for and you designed a very clear easy to use functioning store, would recommend & refer you to anyone else in need of a site",
    name: "defy.ca",
    logo: "/reviews/defy.png",
    site: "defytheodds.co",
  },
  {
    // The review named the studio "Agentic Web Designer"; Inertia is the
    // current name, swapped in at the owner's request. Em dashes replaced
    // with a period, per the site's copy rules.
    quote:
      "Awesome customer service from start to finish! They worked directly with me and my team throughout the entire process, were responsive, professional, and made sure everything was exactly how we wanted it. Great experience overall. 100% recommend Inertia to anyone looking for a reliable web design team!",
    name: "awoken__dreams",
    logo: "/reviews/awokendreams.png",
    site: "awokendreams.shop",
  },
];

/* Mobile: a scroll-snap row with the next card peeking in. sm and up: the
 * two-column grid. Same pattern as the homepage's "What we do" carousel. */
const SLIDE = "max-sm:w-[88%] max-sm:shrink-0 max-sm:snap-start";

// Mobile slides the sheet a full screen height, so it gets a little longer.
const EXIT_MS = 220;
const EXIT_EASE = "cubic-bezier(0.4, 0, 1, 1)";

function Byline({ t }: { t: Testimonial }) {
  return (
    <span className="flex items-center gap-2.5">
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
      <span className="flex min-w-0 flex-col">
        <span className="text-[13px] tracking-tight text-[rgb(var(--fg))] sm:text-[14px]">{t.name}</span>
        {/* Raised above the card's "read full review" overlay so it stays
            its own link. */}
        {t.site ? (
          <a
            href={`https://${t.site}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 w-fit text-[12px] tracking-tight text-[rgb(var(--muted))] underline-offset-2 transition-colors hover:text-[rgb(var(--fg))] hover:underline sm:text-[13px]"
          >
            {t.site}
          </a>
        ) : null}
      </span>
    </span>
  );
}

/* Cards show the opening lines only, so a long review doesn't stretch the
 * whole row. The full text opens in a dialog. Only reviews that actually
 * overflow the clamp get the "Read full review" affordance. */
function Card({ t, index, onOpen }: { t: Testimonial; index: number; onOpen: () => void }) {
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    const measure = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <figure
      className={`group relative rise rise--liquid flex flex-col justify-between gap-6 rounded-xl bg-[rgb(var(--surface)/0.45)] p-5 sm:p-7 ${SLIDE}`}
      style={{ "--rise-delay": `${80 + index * 70}ms` } as CSSProperties}
    >
      <div>
        <blockquote
          ref={quoteRef}
          className="line-clamp-4 text-[16px] leading-snug tracking-tight text-[rgb(var(--fg))] [text-wrap:pretty] sm:text-[19px]"
        >
          {t.quote}
        </blockquote>
        {clamped ? (
          // The button's ::after covers the card, so a tap anywhere opens it.
          <button
            type="button"
            onClick={onOpen}
            className="mt-3 inline-flex items-center gap-1 text-[13px] tracking-tight text-[rgb(var(--muted))] transition-colors after:absolute after:inset-0 after:rounded-xl after:content-[''] group-hover:text-[rgb(var(--fg))] sm:text-[14px] [-webkit-tap-highlight-color:transparent]"
          >
            Read full review
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">
              <path d="M4.5 2.5 8 6l-3.5 3.5" />
            </svg>
          </button>
        ) : null}
      </div>
      <figcaption>
        <Byline t={t} />
      </figcaption>
    </figure>
  );
}

/* Same shell as the demo choice modal: portaled, Lenis locked so the panel
 * scrolls on its own, Escape and backdrop close it. */
function ReviewDialog({ t, onClose }: { t: Testimonial | null; onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const close = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      onClose();
    }, EXIT_MS);
  };

  useEffect(() => {
    if (!t) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("lenis:lock"));
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("lenis:unlock"));
      restoreFocusRef.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  if (!t) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center sm:p-6" style={{ height: "100dvh" }}>
      <div
        className="absolute inset-0"
        onClick={close}
        style={{
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          animation: closing
            ? `overlay-out ${EXIT_MS}ms ease both`
            : "overlay-in 200ms ease both",
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Review from ${t.name}`}
        tabIndex={-1}
        data-lenis-prevent
        className="relative max-h-[85dvh] w-full max-w-[34rem] overflow-y-auto rounded-2xl bg-[rgb(var(--surface))] p-5 outline-none sm:p-7"
        style={{
          animation: closing
            ? `modal-down ${EXIT_MS}ms ${EXIT_EASE} both`
            : "modal-up 320ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <Byline t={t} />
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className={`-mr-1 inline-flex size-8 shrink-0 items-center justify-center ${ACTION_RADIUS_CLASS} border border-transparent text-[rgb(var(--muted))] transition-colors hover:border-[rgb(var(--fg)/0.35)] hover:bg-[rgb(var(--bg))] hover:text-[rgb(var(--fg))] [-webkit-tap-highlight-color:transparent]`}
          >
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-3.5" aria-hidden="true">
              <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
              <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
            </svg>
          </button>
        </div>
        <blockquote className="mt-5 text-[17px] leading-snug tracking-tight text-[rgb(var(--fg))] [text-wrap:pretty] sm:text-[20px]">
          {t.quote}
        </blockquote>
      </div>
    </div>,
    document.body,
  );
}

export function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<Testimonial | null>(null);

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
          className="no-scrollbar mx-auto max-w-[64rem] lg:max-w-[80rem] gap-3 max-sm:-mx-3 max-sm:flex max-sm:items-stretch max-sm:overflow-x-auto max-sm:overscroll-x-contain max-sm:snap-x max-sm:snap-mandatory max-sm:px-3 max-sm:scroll-px-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4"
        >
          {TESTIMONIALS.map((t, i) => (
            <Card key={t.name} t={t} index={i} onOpen={() => setOpen(t)} />
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
      <ReviewDialog t={open} onClose={() => setOpen(null)} />
    </>
  );
}
