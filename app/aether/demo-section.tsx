"use client";

import { useEffect, useRef, useState } from "react";
import { DemoFrame, DemoToggle, LiveStoreButton, PasswordNote, hostOf, type DemoMode } from "./demo-player";

/* The demo recording inline on the page, for visitors who scroll past the
 * "View demo" buttons. The video only starts downloading as the section
 * nears the viewport, and pauses once it's scrolled away. */
export function DemoSection({ href, password }: { href: string; password: string }) {
  const ref = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<DemoMode>("desktop");
  const [load, setLoad] = useState(false);
  const [inView, setInView] = useState(false);

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

  return (
    <section ref={ref} className="px-3 py-16 sm:py-24" aria-labelledby="demo-section-title">
      <div className="mb-8 flex flex-col items-center gap-4 sm:mb-10">
        <h2
          id="demo-section-title"
          className="rise rise--liquid text-center text-[clamp(1.8rem,3vw,2.5rem)] font-normal leading-none tracking-[-0.03em] text-[rgb(var(--fg))]"
        >
          See it in action
        </h2>
        <p className="rise rise--liquid -mt-1 max-w-md text-center text-[16px] leading-snug tracking-tight text-[rgb(var(--muted))] [text-wrap:balance] sm:text-[19px]">
          Our demo store running Aether, from the home page to the cart.
        </p>
        <div className="rise rise--liquid">
          <DemoToggle mode={mode} onChange={setMode} />
        </div>
      </div>

      <div className="rise rise--liquid mx-auto w-full max-w-[64rem]">
        <DemoFrame mode={mode} host={hostOf(href)} load={load} playing={inView} />
        <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <PasswordNote password={password} className="text-center sm:text-left" />
          <LiveStoreButton href={href} password={password} />
        </div>
      </div>
    </section>
  );
}
