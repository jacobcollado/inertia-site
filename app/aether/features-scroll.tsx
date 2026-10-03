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

/* "Built to sell" as a bento grid: everything visible at once, nothing moves
 * on its own. The first feature runs full width, the other two sit side by
 * side under it, on phones too, where they show the phone renders. Same card
 * as the bonuses and setup steps: a surface card, the picture on top, the
 * text under a hairline. */
export function FeaturesScroll({
  features,
  demoUrl,
}: {
  features: Feature[];
  demoUrl: string;
}) {
  return (
    <section className="relative py-16 sm:py-24 rise rise--liquid">
      <div className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] flex items-center justify-between gap-4 mb-10 sm:mb-12">
        <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">
          Built to sell
        </h2>
        <div className="shrink-0 w-auto [&>div]:w-auto [&_a]:w-auto">
          <DemoButton href={demoUrl} password="aether" />
        </div>
      </div>

      <ul className="mx-3 sm:mx-auto sm:w-full max-w-[80rem] grid grid-cols-2 gap-2.5 sm:gap-3">
        {features.map((f, i) => {
          const wide = i === 0;
          const phoneSrc = f.imageMobile ?? f.image;
          return (
            <li
              key={f.title}
              className={`rise rise--liquid flex flex-col overflow-hidden rounded-[6px] bg-[rgb(var(--surface)/0.45)] ${wide ? "col-span-2" : ""}`}
              style={{ "--rise-delay": `${80 + i * 60}ms` } as React.CSSProperties}
            >
              <div
                className={`relative flex items-center justify-center overflow-hidden px-3 pt-5 sm:px-8 sm:pt-8 ${
                  wide ? "h-72 sm:h-[26rem]" : "h-56 sm:h-[20rem]"
                }`}
              >
                {phoneSrc ? (
                  <Shot
                    src={phoneSrc}
                    alt={`${f.title} on a phone`}
                    sizes="45vw"
                    className="h-full w-auto max-w-full object-contain object-bottom sm:hidden"
                  />
                ) : null}
                {f.image ? (
                  <Shot
                    src={f.image}
                    alt={`${f.title} example`}
                    sizes={wide ? "(min-width: 640px) min(76rem, 92vw), 0px" : "(min-width: 640px) min(38rem, 46vw), 0px"}
                    className="hidden h-full w-auto max-w-full rounded-[6px] object-contain object-bottom sm:block"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col border-t border-[rgb(var(--line))] px-3.5 pt-3 pb-4 sm:px-6 sm:pt-5 sm:pb-6">
                <p className="text-[15px] sm:text-[19px] tracking-tight leading-snug text-[rgb(var(--fg))]">{f.title}</p>
                <p className="mt-1 text-[13px] sm:text-[16px] tracking-tight leading-snug text-[rgb(var(--muted))] [text-wrap:pretty]">
                  {f.desc}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
