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

// Native sizes: the desktop screenshots, and the iPhone device-frame renders
// used for the phone shots, so Next reserves the right box before load.
const SHOT_W = 1365;
const SHOT_H = 858;
const PHONE_RENDER_W = 1300;
const PHONE_RENDER_H = 2642;

function isPhoneRender(src: string) {
  return /^\/aether\/(hero|feature)-mobile-/.test(src);
}

function Shot({ src, alt, sizes, className }: { src: string; alt: string; sizes: string; className: string }) {
  const phone = isPhoneRender(src);
  return (
    <Image
      src={src}
      alt={alt}
      width={phone ? PHONE_RENDER_W : SHOT_W}
      height={phone ? PHONE_RENDER_H : SHOT_H}
      sizes={sizes}
      quality={90}
      draggable={false}
      className={className}
    />
  );
}

/* "Built to sell": the heading and one line, then each feature as its own
 * row, the screenshot on a plain tile on one side and the text on the other
 * (a step number, the name, the description), alternating sides down the
 * section. Phones stack each row, picture first, and show the phone renders.
 * The section closes on the demo: a hairline row with one line and the View
 * demo button, so the demo comes right after the reasons to look. Comes in
 * with the site's staggered reveal. */
export function FeaturesScroll({
  features,
  demoUrl,
}: {
  features: Feature[];
  demoUrl: string;
}) {
  return (
    <section id="features" className="rise rise-stagger relative scroll-mt-16 mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] py-16 sm:py-24">
      <div className="mb-10 sm:mb-14">
        <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-[1.1] text-[rgb(var(--fg))]">
          Built to sell
        </h2>
        <p className="mt-2 max-w-lg text-[15.5px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
          Three things every Aether store does to turn a visit into an order.
        </p>
      </div>

      <ul data-stagger className="flex flex-col gap-12 sm:gap-20">
        {features.map((f, i) => {
          const flip = i % 2 === 1;
          const phoneSrc = f.imageMobile ?? f.image;
          return (
            <li key={f.title} className="grid items-center gap-6 sm:grid-cols-[1.5fr_1fr] sm:gap-14">
              <div
                className={`relative flex h-72 items-end justify-center overflow-hidden rounded-[6px] bg-[var(--tile)] px-4 pt-6 sm:h-[24rem] sm:px-10 sm:pt-10 ${flip ? "sm:order-2" : ""}`}
              >
                {phoneSrc ? (
                  <Shot src={phoneSrc} alt={`${f.title} on a phone`} sizes="80vw" className="h-full w-auto max-w-full object-contain object-bottom sm:hidden" />
                ) : null}
                {f.image ? (
                  <Shot
                    src={f.image}
                    alt={`${f.title} example`}
                    sizes="(min-width: 640px) min(46rem, 58vw), 0px"
                    className="hidden h-full w-auto max-w-full rounded-t-[6px] object-contain object-bottom sm:block"
                  />
                ) : null}
              </div>
              <div className={flip ? "sm:order-1" : ""}>
                <p className="text-[14px] tabular-nums tracking-tight text-[rgb(var(--muted))] opacity-70">{i + 1}</p>
                <h3 className="mt-2 text-[22px] sm:text-[28px] tracking-[-0.025em] leading-tight text-[rgb(var(--fg))]" style={{ fontWeight: 500 }}>
                  {f.title}
                </h3>
                <p className="mt-2 max-w-sm text-[15.5px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
                  {f.desc}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-14 flex flex-col items-start gap-4 border-t border-[rgb(var(--fg)/0.08)] pt-8 sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[16px] sm:text-[19px] tracking-tight text-[rgb(var(--fg))]">See all three working in our demo store.</p>
        <div className="w-full shrink-0 sm:w-auto [&>div]:sm:w-auto [&_a]:sm:w-auto">
          <DemoButton href={demoUrl} password="aether" />
        </div>
      </div>
    </section>
  );
}
