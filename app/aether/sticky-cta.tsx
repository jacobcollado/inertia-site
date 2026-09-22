"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";
import { AETHER_CHECKOUT_ID, navigateToAetherCheckout } from "@/lib/scroll-to-hash";

/* A persistent "Get Aether" that rides along once the hero's own CTA has
 * scrolled away, and steps aside whenever a real one is on screen.
 *
 * Two observers rather than a scroll listener: scroll handlers run on every
 * frame and this page already animates a beam, a carousel and a shader, so
 * the cheapest correct option is to let the browser tell us when the elements
 * cross the viewport instead of measuring positions ourselves.
 *
 * Elements are found by [data-aether-cta] so the CTAs themselves stay the
 * source of truth: adding another one anywhere on the page makes this hide
 * for it automatically, with no list to keep in sync here.
 */
export function StickyCta() {
  const [visible, setVisible] = useState(false);
  // Counts how many real CTAs are currently intersecting. A count, not a
  // boolean, because the hero and pricing CTAs can both be on screen on a
  // tall display and the second one leaving must not unhide us while the
  // first is still visible.
  const onScreen = useRef(0);
  const pastHero = useRef(false);

  useEffect(() => {
    const ctas = Array.from(document.querySelectorAll<HTMLElement>("[data-aether-cta]"));
    if (ctas.length === 0) return;

    const sync = () => setVisible(pastHero.current && onScreen.current === 0);

    const ctaObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          onScreen.current += entry.isIntersecting ? 1 : -1;
        }
        // Guard against drift if an observed node is removed mid-flight.
        if (onScreen.current < 0) onScreen.current = 0;
        sync();
      },
      // Full viewport — a negative bottom margin hid the pricing CTA whenever
      // it sat in the lower band of the screen (common on mobile), which kept
      // this bar on top and stole taps meant for checkout.
      { threshold: 0 },
    );
    ctas.forEach((el) => ctaObserver.observe(el));

    // The hero CTA doubles as the "have we scrolled past the hero" sentinel:
    // once it has left the top of the viewport, the bar is allowed to show.
    const hero = ctas[0];
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        pastHero.current = entry.boundingClientRect.top < 0 && !entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    heroObserver.observe(hero);

    return () => {
      ctaObserver.disconnect();
      heroObserver.disconnect();
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
      // Hidden from assistive tech while off screen: the page already has real
      // "Get Aether" links, and announcing a duplicate that isn't visible is
      // noise rather than help.
      aria-hidden={!visible}
    >
      <Link
        href={`/aether#${AETHER_CHECKOUT_ID}`}
        tabIndex={visible ? undefined : -1}
        onClick={navigateToAetherCheckout}
        className={`${ACTION_RADIUS_CLASS} pointer-events-auto inline-flex h-11 items-center justify-center px-6 text-[15px] font-medium tracking-tight leading-none shadow-lg shadow-black/10 transition-opacity hover:opacity-85 sm:h-12 sm:px-8 sm:text-[16px]`}
        style={{ background: "#000", color: "#ededed" }}
      >
        Get Aether
      </Link>
    </div>
  );
}
