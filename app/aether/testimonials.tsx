import Image from "next/image";
import type { CSSProperties } from "react";

interface Testimonial {
  quote: string;
  name: string;
  /** Brand logo, a circular PNG in /public/reviews. */
  logo: string;
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
];

function Card({ t, index }: { t: Testimonial; index: number }) {
  return (
    <figure
      className="rise rise--liquid flex flex-col justify-between gap-6 rounded-xl bg-[rgb(var(--surface)/0.45)] p-5 sm:p-7"
      style={{ "--rise-delay": `${80 + index * 70}ms` } as CSSProperties}
    >
      <blockquote className="text-[16px] leading-snug tracking-tight text-[rgb(var(--fg))] [text-wrap:pretty] sm:text-[19px]">
        {t.quote}
      </blockquote>
      <figcaption className="flex items-center gap-2.5">
        {/* The ring keeps a white logo from dissolving into a light card. */}
        <Image
          src={t.logo}
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-full ring-1 ring-[rgb(var(--line))]"
        />
        <span className="text-[13px] tracking-tight text-[rgb(var(--fg))] sm:text-[14px]">{t.name}</span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  return (
    <>
      <div className="grid-rule grid-rule--dashed" aria-hidden="true" />
      <section className="px-3 py-16 sm:py-24" aria-label="What brands say">
        <p className="rise rise--liquid mb-10 text-center text-[clamp(1.8rem,3vw,2.5rem)] font-normal leading-none tracking-[-0.03em] text-[rgb(var(--fg))]">
          From brands we&apos;ve worked with
        </p>
        <div className="mx-auto grid max-w-[56rem] gap-3 sm:grid-cols-2 sm:gap-4">
          {TESTIMONIALS.map((t, i) => (
            <Card key={t.name} t={t} index={i} />
          ))}
        </div>
        <p className="rise rise--liquid mt-6 text-center text-[14px] tracking-tight text-[rgb(var(--muted))] sm:text-[15px]">
          And 500+ other brands
        </p>
      </section>
    </>
  );
}
