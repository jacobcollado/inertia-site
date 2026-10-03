"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DemoButton } from "./demo-button";
import { AETHER_LIQUID_EASE, AETHER_LIQUID_MS } from "./motion";

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

// How long each feature holds before the list moves on, desktop only.
const HOLD_MS = 6000;
const TRANSITION = `${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`;

function isPhoneRender(src: string) {
  return /^\/aether\/(hero|feature)-mobile-/.test(src);
}

/* "Built to sell" as feature tabs: the three features as a numbered list,
 * all names visible at once. On desktop the active one's screenshot sits
 * large on the right and the list moves on by itself, a thin line under the
 * active item showing the time left; hovering pauses it and any click stops
 * it for good. On phones it's a plain accordion, with the phone shot inside
 * the open item and nothing moving on its own, so the page never shifts
 * under a thumb. */
export function FeaturesScroll({
  features,
  demoUrl,
}: {
  features: Feature[];
  demoUrl: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setDesktop(lg.matches);
      setReduceMotion(rm.matches);
    };
    sync();
    lg.addEventListener("change", sync);
    rm.addEventListener("change", sync);
    const el = sectionRef.current;
    const io = el ? new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 }) : null;
    if (el && io) io.observe(el);
    return () => {
      lg.removeEventListener("change", sync);
      rm.removeEventListener("change", sync);
      io?.disconnect();
    };
  }, []);

  const cycling = autoplay && desktop && !reduceMotion;
  const running = cycling && inView && !hovered;

  const pick = (i: number) => {
    setAutoplay(false);
    setActive(i);
  };

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-24 rise rise--liquid">
      <div className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] flex items-center justify-between gap-4 mb-10 sm:mb-12">
        <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">
          Built to sell
        </h2>
        <div className="shrink-0 w-auto [&>div]:w-auto [&_a]:w-auto">
          <DemoButton href={demoUrl} password="aether" />
        </div>
      </div>

      <div
        className="mx-3 sm:mx-auto sm:w-full max-w-[80rem] grid gap-8 lg:grid-cols-[minmax(18rem,22rem)_1fr] lg:gap-12 lg:items-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <ol className="flex flex-col">
          {features.map((f, i) => {
            const open = i === active;
            const phoneSrc = f.imageMobile ?? f.image;
            return (
              <li key={f.title} className="border-t border-[rgb(var(--line))] last:border-b">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => pick(i)}
                  className="group flex w-full items-baseline gap-4 py-5 text-left [-webkit-tap-highlight-color:transparent]"
                >
                  <span className="w-4 shrink-0 text-[13px] sm:text-[14px] tabular-nums tracking-tight text-[rgb(var(--muted))]">
                    {i + 1}
                  </span>
                  <span
                    className={`text-[20px] sm:text-[22px] tracking-tight leading-snug transition-colors duration-300 ${
                      open ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))]"
                    }`}
                  >
                    {f.title}
                  </span>
                </button>

                {/* Opens with the same grid-rows motion as the FAQ. */}
                <div
                  className="grid motion-reduce:transition-none"
                  style={{
                    gridTemplateRows: open ? "1fr" : "0fr",
                    opacity: open ? 1 : 0,
                    transition: `grid-template-rows ${TRANSITION}, opacity ${TRANSITION}`,
                  }}
                >
                  <div className="overflow-hidden" inert={!open}>
                    <p className="pb-5 pl-8 text-[16px] sm:text-[17px] leading-snug tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
                      {f.desc}
                    </p>
                    {phoneSrc ? (
                      <div className="mb-6 flex justify-center rounded-[6px] bg-[rgb(var(--surface)/0.45)] py-6 lg:hidden">
                        <Image
                          src={phoneSrc}
                          alt={`${f.title} on a phone`}
                          width={isPhoneRender(phoneSrc) ? PHONE_RENDER_W : SHOT_W}
                          height={isPhoneRender(phoneSrc) ? PHONE_RENDER_H : SHOT_H}
                          sizes="70vw"
                          quality={90}
                          className="h-auto max-h-[340px] w-auto max-w-full"
                          draggable={false}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Time left on this feature while the list cycles; a still
                    marker under the active one once it has stopped. */}
                <div className="relative -mb-px hidden h-px lg:block" aria-hidden="true">
                  {open ? (
                    <span
                      key={`${i}-${cycling}`}
                      className="absolute inset-0 origin-left bg-[rgb(var(--fg))]"
                      style={
                        cycling
                          ? {
                              animation: `feature-progress ${HOLD_MS}ms linear forwards`,
                              animationPlayState: running ? "running" : "paused",
                            }
                          : undefined
                      }
                      onAnimationEnd={() => setActive((a) => (a + 1) % features.length)}
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        {/* Desktop stage: every screenshot stays mounted and crossfades, so
            moving between features never waits on a load. */}
        <div className="relative hidden aspect-[1365/858] overflow-hidden rounded-[6px] bg-[rgb(var(--surface)/0.45)] lg:block">
          {features.map((f, i) =>
            f.image ? (
              <Image
                key={f.title}
                src={f.image}
                alt={i === active ? `${f.title} example` : ""}
                aria-hidden={i !== active}
                width={SHOT_W}
                height={SHOT_H}
                sizes="(min-width: 1024px) 52rem, 0px"
                quality={90}
                loading={i === 0 ? "eager" : "lazy"}
                draggable={false}
                className="absolute inset-0 h-full w-full object-contain p-6 motion-reduce:transition-none"
                style={{ opacity: i === active ? 1 : 0, transition: `opacity ${TRANSITION}` }}
              />
            ) : null,
          )}
        </div>
      </div>
    </section>
  );
}
