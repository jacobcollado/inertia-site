"use client";

import { useEffect } from "react";
import Lenis from "lenis";

declare global {
  interface Window { __lenis?: Lenis }
}

export function LenisProvider() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    window.__lenis = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const onLock   = () => lenis.stop();
    const onUnlock = () => lenis.start();
    window.addEventListener("lenis:lock",   onLock);
    window.addEventListener("lenis:unlock", onUnlock);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.__lenis;
      window.removeEventListener("lenis:lock",   onLock);
      window.removeEventListener("lenis:unlock", onUnlock);
    };
  }, []);

  return null;
}
