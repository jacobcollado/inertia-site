"use client";

import { useEffect, useRef, useState } from "react";
import { DemoFrame, DemoToggle, LiveStoreButton, PasswordNote, PlayPauseButton, hostOf, type DemoMode } from "./demo-player";

/* The demo recording inline on the page, for visitors who scroll past the
 * "View demo" buttons. The video only starts downloading as the section
 * nears the viewport, and pauses once it's scrolled away. */
export function DemoSection({ href, password }: { href: string; password: string }) {
  const ref = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<DemoMode>("desktop");
  const [load, setLoad] = useState(false);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Phones see the phone recording first, like the "Make it yours" section.
    if (window.matchMedia("(max-width: 639px)").matches) setMode("mobile");
    const el = ref.current;
    if (!el) return;
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setLoad(true);
        near.disconnect();
      },
      { rootMargin: "400px 0px" },
    );
    const visible = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    near.observe(el);
    visible.observe(el);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, []);

  // Laid out like "Built to sell" above it: the heading and its line on the
  // left with the controls beside them, the recording on a plain tile, then
  // one row under it with the store password and the way into the live
  // store. Comes in with the site's staggered reveal.
  const controls = (
    <div className="flex items-center gap-2">
      <DemoToggle mode={mode} onChange={setMode} />
      <PlayPauseButton paused={paused} onToggle={() => setPaused((p) => !p)} />
    </div>
  );
  return (
    <section ref={ref} className="rise rise-stagger mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] py-16 sm:py-24" aria-labelledby="demo-section-title">
      <div className="mb-10 flex items-end justify-between gap-6 sm:mb-12">
        <div>
          <h2
            id="demo-section-title"
            className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal leading-[1.1] tracking-[-0.03em] text-[rgb(var(--fg))]"
          >
            See it in action
          </h2>
          <p className="mt-2 max-w-lg text-[15.5px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
            Our demo store running Aether, from the home page to the cart.
          </p>
        </div>
        <div className="hidden shrink-0 sm:block">{controls}</div>
      </div>

      <div className="rounded-[6px] bg-[var(--tile)] px-3 py-5 sm:px-10 sm:py-10">
        <div className="mx-auto w-full max-w-[64rem]">
          <DemoFrame mode={mode} host={hostOf(href)} load={load} playing={inView && !paused} />
        </div>
        {/* Phones: the controls in one centred row under the recording. */}
        <div className="mt-5 flex justify-center sm:hidden">{controls}</div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <PasswordNote password={password} className="text-center sm:text-left" />
        <LiveStoreButton href={href} password={password} />
      </div>
    </section>
  );
}
