"use client";

import { useEffect, useRef, useState } from "react";
import { DemoFrame, DemoToggle, LiveStoreButton, PasswordNote, PlayPauseButton, hostOf, type DemoMode } from "./demo-player";

/* The demo recording inline on the page, for visitors who scroll past the
 * "View demo" buttons. The video starts downloading well ahead of the
 * section and starts playing just before it scrolls into view, so it's
 * already running when you get there; it pauses once it's scrolled away. */
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
      { rootMargin: "1200px 0px" },
    );
    // Counts as in view from 300px before it reaches the screen.
    const visible = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "300px 0px", threshold: 0 });
    near.observe(el);
    visible.observe(el);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, []);

  // Two columns from lg up: on the left the heading, the tour the recording
  // takes, the controls and the way into the live store; on the right the
  // recording on a plain tile, at a moderate size so it never fills the
  // screen. Phones read heading, recording, then the rest. Comes in with the
  // site's staggered reveal.
  const controls = (
    <div className="flex items-center gap-2">
      <DemoToggle mode={mode} onChange={setMode} />
      <PlayPauseButton paused={paused} onToggle={() => setPaused((p) => !p)} />
    </div>
  );
  return (
    <section ref={ref} className="rise rise-stagger mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] py-16 sm:py-24" aria-labelledby="demo-section-title">
      <div data-stagger className="grid items-center gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:grid-rows-[auto_1fr]">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <h2
            id="demo-section-title"
            className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal leading-[1.1] tracking-[-0.03em] text-[rgb(var(--fg))]"
          >
            See it in action
          </h2>
          <p className="mt-2 max-w-md text-[15.5px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
            Our demo store running Aether, from the home page to the cart.
          </p>
        </div>

        <div className="rounded-[6px] bg-[var(--tile)] px-3 py-5 sm:px-8 sm:py-8 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="mx-auto w-full max-w-[46rem]">
            <DemoFrame mode={mode} host={hostOf(href)} load={load} playing={inView && !paused} compact />
          </div>
        </div>

        <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <ol className="border-t border-[rgb(var(--fg)/0.08)]">
            {["Home page", "Collections", "Product page", "Cart"].map((stop, i) => (
              <li key={stop} className="flex items-baseline gap-3 border-b border-[rgb(var(--fg)/0.08)] py-2.5 text-[15px] sm:text-[16px] tracking-tight text-[rgb(var(--fg))]">
                <span className="w-4 shrink-0 text-[13px] tabular-nums text-[rgb(var(--muted))] opacity-70">{i + 1}</span>
                {stop}
              </li>
            ))}
          </ol>
          <div className="mt-6">{controls}</div>
          <div className="mt-6 flex flex-col items-start gap-3">
            <PasswordNote password={password} className="text-left" />
            <LiveStoreButton href={href} password={password} />
          </div>
        </div>
      </div>
    </section>
  );
}
