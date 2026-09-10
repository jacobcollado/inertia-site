"use client";

import Image from "next/image";
import { HiMiniPause, HiMiniPlay } from "react-icons/hi2";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DemoButton } from "./demo-button";
import { AETHER_LIQUID_MS, easeLiquid } from "./motion";
const g = (a: number) => `rgba(120,120,120,${a})`;
const acc = "rgb(var(--accent))";

function SketchUpsell() {
  // "Frequently bought together" — a main product plus add-ons, joined by + signs,
  // with a bundle total and an add-all button.
  return (
    <svg viewBox="0 0 400 320" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      {/* heading: Frequently bought together */}
      <rect x="24" y="28" width="150" height="9" rx="2" fill={g(0.45)} />

      {/* three product thumbnails joined by + */}
      <rect x="24" y="60" width="92" height="92" rx="8" fill={g(0.06)} stroke={g(0.12)} strokeWidth="0.8" />
      <circle cx="70" cy="100" r="20" fill={g(0.14)} />
      <text x="139" y="112" fill={g(0.35)} fontSize="22" textAnchor="middle">+</text>

      <rect x="162" y="60" width="92" height="92" rx="8" fill={g(0.06)} stroke={g(0.12)} strokeWidth="0.8" />
      <rect x="190" y="80" width="36" height="44" rx="4" fill={g(0.14)} />
      <text x="277" y="112" fill={g(0.35)} fontSize="22" textAnchor="middle">+</text>

      <rect x="300" y="60" width="76" height="92" rx="8" fill={g(0.03)} stroke={acc} strokeOpacity="0.35" strokeWidth="0.9" />
      <rect x="324" y="80" width="28" height="44" rx="4" fill={acc} fillOpacity="0.18" />
      {/* "add-on" tag on the last item */}
      <rect x="300" y="48" width="50" height="18" rx="9" fill={acc} fillOpacity="0.9" />
      <rect x="310" y="54" width="30" height="5" rx="1.5" fill="#fff" fillOpacity="0.85" />

      {/* per-item checkboxes / price lines */}
      <rect x="24" y="170" width="64" height="6" rx="1.5" fill={g(0.3)} />
      <rect x="162" y="170" width="64" height="6" rx="1.5" fill={g(0.3)} />
      <rect x="300" y="170" width="52" height="6" rx="1.5" fill={acc} fillOpacity="0.55" />

      {/* bundle total + add-all bundle button */}
      <rect x="24" y="206" width="352" height="0.8" fill={g(0.1)} />
      <rect x="24" y="228" width="96" height="9" rx="2" fill={g(0.4)} />
      <rect x="24" y="244" width="60" height="7" rx="2" fill={acc} fillOpacity="0.6" />
      <rect x="216" y="220" width="160" height="40" rx="20" fill={acc} fillOpacity="0.9" />
      <rect x="248" y="236" width="96" height="8" rx="2" fill="#fff" fillOpacity="0.85" />
    </svg>
  );
}

function SketchScarcity() {
  // Low-stock badge, a near-empty inventory bar, and a countdown timer in HH:MM:SS blocks.
  return (
    <svg viewBox="0 0 400 320" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      {/* low stock pill */}
      <rect x="24" y="28" width="132" height="24" rx="12" fill={acc} fillOpacity="0.12" stroke={acc} strokeOpacity="0.35" strokeWidth="0.7" />
      <circle cx="42" cy="40" r="4" fill={acc} fillOpacity="0.9" />
      <rect x="54" y="36" width="90" height="8" rx="2" fill={acc} fillOpacity="0.55" />

      {/* "Only 3 left" inventory counter */}
      <rect x="24" y="76" width="78" height="9" rx="2" fill={g(0.45)} />
      {/* near-empty stock bar */}
      <rect x="24" y="98" width="352" height="8" rx="4" fill={g(0.08)} />
      <rect x="24" y="98" width="58" height="8" rx="4" fill={acc} fillOpacity="0.8" />

      {/* countdown timer label */}
      <rect x="24" y="146" width="110" height="8" rx="2" fill={g(0.35)} />
      {/* HH : MM : SS blocks */}
      <rect x="24" y="166" width="56" height="64" rx="8" fill={g(0.06)} stroke={g(0.12)} strokeWidth="0.8" />
      <rect x="38" y="190" width="28" height="16" rx="3" fill={g(0.4)} />
      <text x="92" y="206" fill={g(0.3)} fontSize="20" textAnchor="middle">:</text>
      <rect x="104" y="166" width="56" height="64" rx="8" fill={g(0.06)} stroke={g(0.12)} strokeWidth="0.8" />
      <rect x="118" y="190" width="28" height="16" rx="3" fill={g(0.4)} />
      <text x="172" y="206" fill={g(0.3)} fontSize="20" textAnchor="middle">:</text>
      <rect x="184" y="166" width="56" height="64" rx="8" fill={acc} fillOpacity="0.1" stroke={acc} strokeOpacity="0.4" strokeWidth="0.9" />
      <rect x="198" y="190" width="28" height="16" rx="3" fill={acc} fillOpacity="0.6" />

      {/* sold-out swatch row — one disabled/crossed-out */}
      <rect x="280" y="166" width="28" height="28" rx="6" fill={g(0.1)} stroke={g(0.14)} strokeWidth="0.8" />
      <rect x="318" y="166" width="28" height="28" rx="6" fill={g(0.1)} stroke={g(0.14)} strokeWidth="0.8" />
      <rect x="280" y="202" width="28" height="28" rx="6" fill={g(0.05)} stroke={g(0.12)} strokeWidth="0.8" />
      <line x1="282" y1="228" x2="306" y2="204" stroke={g(0.3)} strokeWidth="1" />
    </svg>
  );
}

function SketchGuided() {
  // A vertical progress rail with completed/active steps pulling down the page,
  // and a sticky add-to-cart bar pinned at the bottom edge.
  const rail = 48;
  return (
    <svg viewBox="0 0 400 320" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
      {/* progress rail */}
      <line x1={rail} y1="40" x2={rail} y2="232" stroke={g(0.12)} strokeWidth="1.2" />

      {/* step 1 — done */}
      <circle cx={rail} cy="48" r="9" fill={acc} fillOpacity="0.9" />
      <polyline points="44 48 47 51 52 45" stroke="#fff" strokeWidth="1.6" />
      <rect x="76" y="38" width="160" height="9" rx="2" fill={g(0.4)} />
      <rect x="76" y="53" width="100" height="6" rx="1.5" fill={g(0.18)} />

      {/* step 2 — done */}
      <circle cx={rail} cy="120" r="9" fill={acc} fillOpacity="0.9" />
      <polyline points="44 120 47 123 52 117" stroke="#fff" strokeWidth="1.6" />
      <rect x="76" y="110" width="140" height="9" rx="2" fill={g(0.4)} />
      <rect x="76" y="125" width="84" height="6" rx="1.5" fill={g(0.18)} />

      {/* step 3 — active */}
      <circle cx={rail} cy="192" r="9" fill={acc} fillOpacity="0.15" stroke={acc} strokeOpacity="0.6" strokeWidth="1.4" />
      <circle cx={rail} cy="192" r="3.5" fill={acc} fillOpacity="0.9" />
      <rect x="76" y="182" width="120" height="9" rx="2" fill={g(0.45)} />
      <rect x="76" y="197" width="72" height="6" rx="1.5" fill={g(0.2)} />

      {/* sticky add-to-cart bar pinned to bottom */}
      <rect x="20" y="262" width="360" height="50" rx="10" fill={g(0.07)} stroke={acc} strokeOpacity="0.3" strokeWidth="0.9" />
      <rect x="34" y="278" width="28" height="18" rx="4" fill={g(0.14)} />
      <rect x="74" y="280" width="90" height="8" rx="2" fill={g(0.4)} />
      <rect x="232" y="272" width="132" height="30" rx="15" fill={acc} fillOpacity="0.9" />
      <rect x="262" y="283" width="72" height="8" rx="2" fill="#fff" fillOpacity="0.85" />
      {/* "sticky" pin tab */}
      <rect x="170" y="250" width="60" height="14" rx="7" fill={acc} fillOpacity="0.85" />
    </svg>
  );
}

const SKETCHES = [SketchUpsell, SketchScarcity, SketchGuided];

interface Feature {
  title: string;
  desc: string;
  icon: React.ReactNode;
  /** Optional screenshot of real work. Falls back to the SVG sketch when empty. */
  image?: string;
  /** Mobile-specific screenshot; falls back to `image` when empty. */
  imageMobile?: string;
}

// Native dimensions of the work screenshots — the container adapts to this ratio.
const SHOT_W = 1365;
const SHOT_H = 858;

const AUTOPLAY_MS = 5200;
const GAP_PX = 24;
const PEEK_PX_MOBILE = 48;
const PEEK_PX_DESKTOP = 72;
const CONTENT_MAX_PX = 1280; // 80rem — matches page column
const MOBILE_GUTTER_PX = 12; // mx-3

function FeatureImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={SHOT_W}
      height={SHOT_H}
      sizes="(max-width: 640px) 100vw, min(48rem, 90vw)"
      quality={90}
      className={className ?? "max-w-full max-h-[340px] sm:max-h-[440px] w-auto h-auto object-contain rounded-lg"}
      draggable={false}
    />
  );
}

function Visual({ feature, index, alt }: { feature: Feature; index: number; alt: string }) {
  if (feature.image) {
    const imgClass = "max-w-full max-h-[340px] sm:max-h-[440px] w-auto h-auto object-contain rounded-lg";
    if (feature.imageMobile) {
      return (
        <>
          <FeatureImage src={feature.imageMobile} alt={alt} className={`sm:hidden ${imgClass}`} />
          <FeatureImage src={feature.image} alt={alt} className={`hidden sm:block ${imgClass}`} />
        </>
      );
    }
    return <FeatureImage src={feature.image} alt={alt} className={imgClass} />;
  }
  const Sketch = SKETCHES[index];
  return (
    <div className="w-full max-w-[360px] sm:max-w-[420px]" style={{ height: 320 }}>
      <Sketch />
    </div>
  );
}

export function FeaturesScroll({
  features,
  demoUrl,
}: {
  features: Feature[];
  demoUrl: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const activeRef = useRef(0);
  const didDragRef = useRef(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
    moved: boolean;
  } | null>(null);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [slideWidth, setSlideWidth] = useState(0);
  const [peekPx, setPeekPx] = useState(PEEK_PX_MOBILE);
  const [columnLeft, setColumnLeft] = useState(MOBILE_GUTTER_PX);
  const [playing, setPlaying] = useState(true);
  const scrollEndRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const easeAnimRef = useRef<number | null>(null);
  const isEasingRef = useRef(false);
  const settlingRef = useRef(false);
  const touchScrollingRef = useRef(false);
  const draggingRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const measureSlideWidth = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const vw = scroller.clientWidth;
    const isDesktop = window.matchMedia("(min-width: 640px)").matches;
    const contentWidth = Math.min(CONTENT_MAX_PX, vw);
    const columnLeft = isDesktop ? Math.max(0, (vw - contentWidth) / 2) : MOBILE_GUTTER_PX;
    const peek = isDesktop ? PEEK_PX_DESKTOP : PEEK_PX_MOBILE;
    // Full-width track, but cards stay page-column width — same as before the breakout.
    const cardAreaWidth = isDesktop
      ? contentWidth - MOBILE_GUTTER_PX * 2
      : vw - MOBILE_GUTTER_PX * 4;
    const trackInset = isDesktop ? columnLeft + MOBILE_GUTTER_PX : MOBILE_GUTTER_PX * 2;
    setPeekPx(peek);
    setColumnLeft(trackInset);
    setSlideWidth(Math.max(0, cardAreaWidth - peek - GAP_PX));
  }, []);

  useLayoutEffect(() => {
    measureSlideWidth();
  }, [measureSlideWidth]);

  const slotWidth = useCallback(() => {
    const card = cardRefs.current[0];
    return (card?.offsetWidth ?? 0) + GAP_PX;
  }, []);

  const applyCardProximity = useCallback((syncActive = true) => {
    const scroller = scrollerRef.current;
    const slot = slotWidth();
    if (!scroller || slot <= 0) return;
    const scroll = scroller.scrollLeft;
    let closest = 0;
    let closestDist = Infinity;
    const falloff = slot * 1.35;
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const dist = Math.abs(scroll - i * slot);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
      const proximity = Math.max(0, 1 - dist / falloff);
      const eased = proximity * proximity * (3 - 2 * proximity);
      el.style.transition = "none";
      el.style.opacity = String(0.32 + 0.68 * eased);
      if (isMobile) {
        el.style.transform = "none";
      } else {
        el.style.transform = `scale(${0.975 + 0.025 * eased})`;
        el.style.transformOrigin = "center top";
      }
    });
    if (syncActive && closest !== activeRef.current) {
      activeRef.current = closest;
      setActive(closest);
    }
    return closest;
  }, [slotWidth]);

  // Index 0 sits at scrollLeft 0, left-aligned behind the scroller's padding.
  // Each next card is one layout slot further — use offsetWidth, not
  // getBoundingClientRect, so a visual scale on a card can't drift the target.
  const nearestIndex = useCallback(() => {
    const scroller = scrollerRef.current;
    const slot = slotWidth();
    if (!scroller || slot <= 0) return 0;
    return Math.max(0, Math.min(features.length - 1, Math.round(scroller.scrollLeft / slot)));
  }, [features.length, slotWidth]);

  const cancelEase = useCallback(() => {
    if (easeAnimRef.current) cancelAnimationFrame(easeAnimRef.current);
    easeAnimRef.current = null;
    isEasingRef.current = false;
  }, []);

  const easeScrollTo = useCallback((targetLeft: number, onDone?: () => void) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    cancelEase();
    const start = scroller.scrollLeft;
    const delta = targetLeft - start;
    if (Math.abs(delta) < 1 || reduceMotion) {
      scroller.scrollLeft = targetLeft;
      applyCardProximity(true);
      onDone?.();
      return;
    }
    isEasingRef.current = true;
    setScrolling(true);
    scroller.style.scrollSnapType = "none";
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / AETHER_LIQUID_MS);
      scroller.scrollLeft = start + delta * easeLiquid(t);
      applyCardProximity(false);
      if (t < 1) {
        easeAnimRef.current = requestAnimationFrame(tick);
        return;
      }
      easeAnimRef.current = null;
      isEasingRef.current = false;
      scroller.scrollLeft = targetLeft;
      setScrolling(false);
      applyCardProximity(true);
      onDone?.();
    };
    easeAnimRef.current = requestAnimationFrame(tick);
  }, [applyCardProximity, cancelEase, reduceMotion]);

  const goTo = useCallback((index: number, behavior?: ScrollBehavior) => {
    const scroller = scrollerRef.current;
    const slot = slotWidth();
    if (!scroller || slot <= 0) return;
    const next = Math.max(0, Math.min(features.length - 1, index));
    const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const target = Math.min(max, next * slot);
    if (behavior === "auto" || reduceMotion) {
      cancelEase();
      scroller.scrollLeft = target;
      activeRef.current = next;
      setActive(next);
      applyCardProximity(true);
      return;
    }
    activeRef.current = next;
    setActive(next);
    easeScrollTo(target);
  }, [applyCardProximity, cancelEase, easeScrollTo, features.length, reduceMotion, slotWidth]);

  const clearAutoplay = useCallback(() => {
    if (autoplayRef.current) clearTimeout(autoplayRef.current);
    autoplayRef.current = null;
  }, []);

  const togglePlay = useCallback(() => {
    if (reduceMotion) return;
    setPlaying((on) => !on);
  }, [reduceMotion]);

  const settleToNearest = useCallback(() => {
    const scroller = scrollerRef.current;
    const slot = slotWidth();
    if (!scroller || slot <= 0 || settlingRef.current || isEasingRef.current || draggingRef.current) {
      return;
    }

    const target = nearestIndex();
    const targetScroll = target * slot;
    const delta = Math.abs(scroller.scrollLeft - targetScroll);

    activeRef.current = target;
    setActive(target);

    if (delta < 2) {
      scroller.scrollLeft = targetScroll;
      scroller.style.scrollSnapType = "x proximity";
      applyCardProximity(true);
      setScrolling(false);
      touchScrollingRef.current = false;
      return;
    }

    settlingRef.current = true;

    if (touchScrollingRef.current || reduceMotion) {
      touchScrollingRef.current = false;
      scroller.style.scrollSnapType = "x proximity";
      scroller.scrollTo({
        left: targetScroll,
        behavior: reduceMotion ? "auto" : "smooth",
      });
      window.setTimeout(() => {
        settlingRef.current = false;
        applyCardProximity(true);
        setScrolling(false);
      }, reduceMotion ? 0 : 280);
      return;
    }

    easeScrollTo(targetScroll, () => {
      settlingRef.current = false;
      scroller.style.scrollSnapType = "x proximity";
    });
  }, [applyCardProximity, easeScrollTo, nearestIndex, reduceMotion, slotWidth]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    // Snap can yank the track before padding resolves. Park on index 0
    // with snap off, then turn it back on.
    scroller.style.scrollSnapType = "none";
    scroller.scrollLeft = 0;
    activeRef.current = 0;
    const frame = requestAnimationFrame(() => {
      scroller.style.scrollSnapType = "x proximity";
      scroller.scrollLeft = 0;
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let ticking = false;

    const scheduleSettle = () => {
      if (scrollEndRef.current) clearTimeout(scrollEndRef.current);
      scrollEndRef.current = setTimeout(() => {
        scrollEndRef.current = null;
        settleToNearest();
      }, 80);
    };

    const measure = () => {
      ticking = false;
      if (!isEasingRef.current) setScrolling(true);
      applyCardProximity(false);
      scheduleSettle();
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };

    const onTouchStart = () => {
      touchScrollingRef.current = true;
      settlingRef.current = false;
      cancelEase();
      scroller.style.scrollSnapType = "none";
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("touchstart", onTouchStart, { passive: true });
    applyCardProximity(true);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("touchstart", onTouchStart);
      if (scrollEndRef.current) clearTimeout(scrollEndRef.current);
      cancelEase();
    };
  }, [applyCardProximity, cancelEase, settleToNearest]);

  useEffect(() => {
    clearAutoplay();
    if (!playing || reduceMotion || dragging || scrolling) return;
    autoplayRef.current = setTimeout(() => {
      goTo((activeRef.current + 1) % features.length);
    }, AUTOPLAY_MS);
    return clearAutoplay;
  }, [playing, active, dragging, scrolling, reduceMotion, features.length, goTo, clearAutoplay]);

  useEffect(() => {
    if (reduceMotion) setPlaying(false);
  }, [reduceMotion]);

  useEffect(() => {
    const onResize = () => {
      measureSlideWidth();
      goTo(activeRef.current, "auto");
      requestAnimationFrame(() => applyCardProximity(true));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyCardProximity, goTo, measureSlideWidth]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (e.pointerType === "touch") return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    cancelEase();
    didDragRef.current = false;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startScroll: scroller.scrollLeft,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const scroller = scrollerRef.current;
    if (!drag || !scroller || e.pointerId !== drag.pointerId) return;
    const dx = e.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(dx) <= 4) return;
      drag.moved = true;
      didDragRef.current = true;
      scroller.setPointerCapture(e.pointerId);
      scroller.style.scrollSnapType = "none";
      draggingRef.current = true;
      setDragging(true);
    }
    e.preventDefault();
    scroller.scrollLeft = drag.startScroll - dx;
    applyCardProximity(false);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const scroller = scrollerRef.current;
    dragRef.current = null;
    if (!scroller) return;
    if (scroller.hasPointerCapture(e.pointerId)) scroller.releasePointerCapture(e.pointerId);
    if (drag?.moved) {
      draggingRef.current = false;
      setDragging(false);
      touchScrollingRef.current = false;
      settleToNearest();
    } else {
      draggingRef.current = false;
      scroller.style.scrollSnapType = "x proximity";
    }
  };

  const onCardClick = (index: number) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (index === activeRef.current) return;
    goTo(index);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(Math.min(features.length - 1, activeRef.current + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(Math.max(0, activeRef.current - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(features.length - 1);
    }
  };

  return (
    <section className="relative py-16 sm:py-24 rise rise--liquid">
      <div className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] flex items-center justify-between gap-4 mb-16 sm:mb-16">
        <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">
          Key features
        </h2>
        <div className="shrink-0 w-auto [&>div]:w-auto [&_a]:w-auto">
          <DemoButton href={demoUrl} password="aether" />
        </div>
      </div>

      <div className="relative w-screen left-1/2 -translate-x-1/2">
        <div
          ref={scrollerRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Aether features"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={`no-scrollbar w-full overflow-x-auto snap-x snap-proximity overscroll-x-contain outline-none ${dragging || scrolling ? "select-none" : ""}`}
          style={{
            cursor: dragging ? "grabbing" : "grab",
            WebkitOverflowScrolling: "touch",
            scrollPaddingInlineStart: columnLeft,
            touchAction: "pan-x",
          }}
        >
        <div
          className="flex items-start w-max"
          style={{ paddingLeft: columnLeft, paddingRight: peekPx + GAP_PX }}
        >
          {features.map((f, i) => {
            const isActive = active === i;
            return (
              <article
                key={f.title}
                ref={(el) => { cardRefs.current[i] = el; }}
                role="group"
                aria-label={`${i + 1} of ${features.length}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onCardClick(i)}
                className="shrink-0 snap-start"
                style={{
                  width: slideWidth || undefined,
                  marginRight: i < features.length - 1 ? GAP_PX : 0,
                  transformOrigin: "center top",
                }}
              >
                <div className="relative w-full rounded-xl bg-[rgb(var(--surface-elevated))] overflow-hidden">
                  <p className="px-6 pt-6 sm:px-8 sm:pt-8 text-center text-[22px] sm:text-[28px] leading-relaxed tracking-tight [text-wrap:pretty] text-[rgb(var(--fg))] max-w-[42rem] mx-auto">
                    {f.desc}
                  </p>
                  <div className="flex items-center justify-center px-6 py-10 sm:px-8 sm:py-12 min-h-[320px] sm:min-h-[420px]">
                    <Visual feature={f} index={i} alt={`${f.title} example`} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-10">
        <div className="inline-flex items-center gap-1 rounded-full px-3 py-2 bg-[rgb(var(--surface-elevated))]">
          {features.map((f, i) => {
            const isActive = active === i;
            return (
              <button
                key={f.title}
                type="button"
                aria-label={`Show ${f.title}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => goTo(i)}
                className="flex items-center justify-center h-6 px-1.5"
              >
                {isActive ? (
                  <span className="relative block h-1.5 w-5 rounded-full overflow-hidden bg-[rgb(var(--fg)/0.22)]">
                    <span
                      key={`${active}-${playing}`}
                      className="absolute inset-y-0 left-0 rounded-full bg-[rgb(var(--fg))]"
                      style={
                        playing && !reduceMotion
                          ? { animation: `progress-fill ${AUTOPLAY_MS}ms linear forwards` }
                          : { width: "100%" }
                      }
                    />
                  </span>
                ) : (
                  <span className="block h-1.5 w-2 rounded-full bg-[rgb(var(--fg)/0.22)]" />
                )}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label={playing ? "Pause autoplay" : "Play autoplay"}
          aria-pressed={playing}
          disabled={reduceMotion}
          onClick={togglePlay}
          className="relative h-[38px] w-[38px] rounded-full bg-[rgb(var(--surface-elevated))] text-[rgb(var(--fg))] transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed [-webkit-tap-highlight-color:transparent]"
        >
          {playing ? (
            <HiMiniPause
              className="absolute left-1/2 top-1/2 block h-[17px] w-[17px] -translate-x-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
          ) : (
            <HiMiniPlay
              className="absolute left-1/2 top-1/2 block h-[17px] w-[17px] -translate-x-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
          )}
        </button>
      </div>
    </section>
  );
}
