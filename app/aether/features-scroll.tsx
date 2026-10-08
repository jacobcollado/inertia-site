"use client";

import Image from "next/image";
import { DemoButton } from "./demo-button";

interface Feature {
  title: string;
  desc: string;
  icon: React.ReactNode;
  /** Screenshot of the feature on desktop. */
  image?: string;
  /** Phone render of the feature; falls back to `image`. */
  imageMobile?: string;
}

/* One feature as a tile: the number, name and line at the top, the shot
 * under them, set inside the tile with the same margin all round.
 * Phones show the phone render, sm and up the desktop screenshot. The shot
 * lifts a touch on hover. */
function Tile({ f, i, big }: { f: Feature; i: number; big: boolean }) {
  const phone = f.imageMobile ?? f.image;
  return (
    <li className={`group flex flex-col overflow-hidden rounded-[6px] bg-[var(--tile)] ${big ? "sm:row-span-2" : ""}`}>
      <div className="px-5 pt-5 sm:px-7 sm:pt-6">
        <p className="flex items-baseline gap-3">
          <span className="w-4 shrink-0 text-[14px] tabular-nums tracking-tight text-[rgb(var(--muted))] opacity-70">{i + 1}</span>
          <span
            className={`${big ? "text-[20px] sm:text-[26px]" : "text-[19px] sm:text-[21px]"} tracking-[-0.02em] leading-snug text-[rgb(var(--fg))]`}
            style={{ fontWeight: 500 }}
          >
            {f.title}
          </span>
        </p>
        <p className="mt-1 pl-7 max-w-sm text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
          {f.desc}
        </p>
      </div>
      <div className={`relative mx-6 mb-6 mt-6 h-[22rem] sm:h-auto sm:flex-1 ${big ? "sm:mx-10 sm:mb-10 sm:mt-8" : "sm:mx-8 sm:mb-7 sm:mt-5"}`}>
        <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 motion-reduce:transition-none">
          {phone ? (
            <Image src={phone} alt={`${f.title} on a phone`} fill sizes="(max-width: 639px) 80vw, 0px" quality={90} draggable={false} className="object-contain object-center sm:hidden" />
          ) : null}
          {f.image ? (
            <Image
              src={f.image}
              alt={`${f.title} example`}
              fill
              sizes={big ? "(min-width: 640px) min(42rem, 54vw), 0px" : "(min-width: 640px) min(30rem, 38vw), 0px"}
              quality={90}
              draggable={false}
              className="hidden object-contain object-center sm:block"
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}

/* "Built to sell" as a bento: the first feature as one large tile on the
 * left, the other two stacked on the right, each with its name on top and
 * its shot filling the rest. Phones stack the three. The section closes on the
 * demo, one line and the View demo button. Comes in with the site's
 * staggered reveal. */
export function FeaturesScroll({
  features,
  demoUrl,
  eyebrow,
}: {
  features: Feature[];
  demoUrl: string;
  /** Sits above the heading (the chapter mark on /aether). */
  eyebrow?: React.ReactNode;
}) {
  return (
    <section
      id="features"
      className="rise rise-stagger relative scroll-mt-16 mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] pt-20 pb-16 sm:pt-28 sm:pb-24"
    >
      <div className="mb-10 sm:mb-12">
        {eyebrow}
        <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-[1.1] text-[rgb(var(--fg))]">
          Built to sell
        </h2>
        <p className="mt-2 max-w-lg text-[15.5px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
          Three things every Aether store does to turn a visit into an order.
        </p>
      </div>

      <ul data-stagger className="grid gap-3 sm:grid-cols-[1.4fr_1fr] sm:grid-rows-[20rem_20rem] sm:gap-4 lg:grid-rows-[23rem_23rem]">
        {features.map((f, i) => (
          <Tile key={f.title} f={f} i={i} big={i === 0} />
        ))}
      </ul>

      <div className="mt-10 flex flex-col items-start gap-4 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[16px] sm:text-[19px] tracking-tight text-[rgb(var(--fg))]">See all three working in our demo store.</p>
        <div className="w-full shrink-0 sm:w-auto [&>div]:sm:w-auto [&_a]:sm:w-auto">
          <DemoButton href={demoUrl} password="aether" />
        </div>
      </div>
    </section>
  );
}
