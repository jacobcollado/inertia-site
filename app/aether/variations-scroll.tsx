"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AETHER_LIQUID_EASE, AETHER_LIQUID_MS, aetherLiquidTransition } from "./motion";

export interface ThemeVariation {
  name: string;
  image: string;
}

interface SlideItem extends ThemeVariation {
  uid: string;
}

const SHOT_W = 1365;
const SHOT_H = 858;
const CARD_TRANSITION = aetherLiquidTransition();
const TRACK_TRANSITION = `transform ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`;
const GAP_PX = 20;
const PEEK_PX_MOBILE = 40;
const PEEK_PX_DESKTOP = 64;
const CONTENT_MAX_PX = 1280;
const MOBILE_GUTTER_PX = 12;
const INITIAL_RUNWAY = 3;
const EXTEND_THRESHOLD = 2;

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      {direction === "left" ? (
        <polyline points="10 3 5 8 10 13" />
      ) : (
        <polyline points="6 3 11 8 6 13" />
      )}
    </svg>
  );
}

let uidCounter = 0;

function copyVariations(variations: ThemeVariation[]): SlideItem[] {
  return variations.map((v) => ({ ...v, uid: `slide-${uidCounter++}` }));
}

export function VariationsScroll({ variations }: { variations: ThemeVariation[] }) {
  const count = variations.length;
  const startLogical = Math.floor(count / 2);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const indexRef = useRef(count + startLogical);
  const didDragRef = useRef(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startTranslate: number;
    moved: boolean;
  } | null>(null);
  const pendingPaintRef = useRef(false);

  const [slides, setSlides] = useState<SlideItem[]>(() =>
    Array.from({ length: INITIAL_RUNWAY }, () => copyVariations(variations)).flat(),
  );
  const [active, setActive] = useState(startLogical);
  const [dragging, setDragging] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [slideWidth, setSlideWidth] = useState(0);
  const [edgePad, setEdgePad] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const step = slideWidth + GAP_PX;

  const measureLayout = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const vw = viewport.clientWidth;
    const isDesktop = window.matchMedia("(min-width: 640px)").matches;
    const contentWidth = Math.min(CONTENT_MAX_PX, vw);
    const cardAreaWidth = isDesktop
      ? contentWidth - MOBILE_GUTTER_PX * 2
      : vw - MOBILE_GUTTER_PX * 4;
    const peek = isDesktop ? PEEK_PX_DESKTOP : PEEK_PX_MOBILE;
    const nextSlideWidth = Math.max(0, cardAreaWidth - peek * 2 - GAP_PX);
    setSlideWidth(nextSlideWidth);
    setEdgePad(Math.max(0, (vw - nextSlideWidth) / 2));
  }, []);

  useLayoutEffect(() => {
    measureLayout();
  }, [measureLayout]);

  const translateForIndex = useCallback((index: number) => {
    const viewport = viewportRef.current;
    if (!viewport || step <= 0) return 0;
    const slideCenter = edgePad + index * step + slideWidth / 2;
    return viewport.clientWidth / 2 - slideCenter;
  }, [edgePad, slideWidth, step]);

  const applyCardProximity = useCallback((centerIndex: number, animate: boolean) => {
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const dist = Math.abs(i - centerIndex);
      const proximity = Math.max(0, 1 - dist);
      el.style.transition = animate ? CARD_TRANSITION : "none";
      el.style.opacity = String(0.28 + 0.72 * proximity);
      el.style.transform = `scale(${0.96 + 0.04 * proximity})`;
      el.style.transformOrigin = "center center";
    });
    setActive(((centerIndex % count) + count) % count);
  }, [count]);

  const paintTrack = useCallback((index: number, animate: boolean) => {
    const track = trackRef.current;
    if (!track || step <= 0) return;
    track.style.transition = animate && !reduceMotion ? TRACK_TRANSITION : "none";
    track.style.transform = `translate3d(${translateForIndex(index)}px, 0, 0)`;
    applyCardProximity(index, animate);
  }, [applyCardProximity, reduceMotion, step, translateForIndex]);

  const extendForward = useCallback(() => {
    setSlides((prev) => [...prev, ...copyVariations(variations)]);
  }, [variations]);

  const extendBackward = useCallback(() => {
    pendingPaintRef.current = true;
    setSlides((prev) => [...copyVariations(variations), ...prev]);
  }, [variations]);

  const shift = useCallback((delta: number) => {
    if (count <= 0 || step <= 0) return;

    let next = indexRef.current + delta;

    if (delta > 0 && next >= slides.length - EXTEND_THRESHOLD) {
      extendForward();
    } else if (delta < 0 && next < EXTEND_THRESHOLD) {
      extendBackward();
      next += count;
    }

    indexRef.current = next;
    if (pendingPaintRef.current) return;
    paintTrack(next, !reduceMotion);
  }, [count, extendBackward, extendForward, paintTrack, reduceMotion, slides.length, step]);

  useLayoutEffect(() => {
    if (pendingPaintRef.current) {
      pendingPaintRef.current = false;
      paintTrack(indexRef.current, false);
    }
  }, [slides, paintTrack]);

  useLayoutEffect(() => {
    if (slideWidth <= 0 || count <= 0) return;
    indexRef.current = count + startLogical;
    paintTrack(indexRef.current, false);
  }, [count, paintTrack, slideWidth, startLogical]);

  useEffect(() => {
    const onResize = () => {
      measureLayout();
      requestAnimationFrame(() => paintTrack(indexRef.current, false));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureLayout, paintTrack]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || e.pointerType === "touch") return;
    const track = trackRef.current;
    if (!track || step <= 0) return;
    didDragRef.current = false;
    const matrix = new DOMMatrix(getComputedStyle(track).transform);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startTranslate: matrix.m41,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!drag || !track || !viewport || e.pointerId !== drag.pointerId) return;
    const dx = e.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(dx) <= 4) return;
      drag.moved = true;
      didDragRef.current = true;
      viewport.setPointerCapture(e.pointerId);
      track.style.transition = "none";
      setDragging(true);
    }
    e.preventDefault();
    track.style.transform = `translate3d(${drag.startTranslate + dx}px, 0, 0)`;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    dragRef.current = null;
    if (!viewport) return;
    if (viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
    if (!drag?.moved) return;
    setDragging(false);
    const track = trackRef.current;
    if (!track || step <= 0) return;
    const matrix = new DOMMatrix(getComputedStyle(track).transform);
    const offset = translateForIndex(indexRef.current);
    const delta = Math.round((offset - matrix.m41) / step);
    if (delta !== 0) shift(delta);
    else paintTrack(indexRef.current, false);
  };

  const onCardClick = (rawIndex: number) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (rawIndex === indexRef.current) return;
    const delta = rawIndex - indexRef.current;
    shift(delta);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      shift(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      shift(-1);
    }
  };

  return (
    <section className="relative py-16 sm:py-24 rise rise--liquid">
      <div className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] mb-8 sm:mb-10">
        <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">
          Infinite variations
        </h2>
      </div>

      <div className="relative w-screen left-1/2 -translate-x-1/2">
        <button
          type="button"
          aria-label="Previous variation"
          onClick={() => shift(-1)}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--surface-elevated))] text-[rgb(var(--fg))] shadow-sm transition-opacity hover:opacity-80 [-webkit-tap-highlight-color:transparent]"
        >
          <ArrowIcon direction="left" />
        </button>
        <button
          type="button"
          aria-label="Next variation"
          onClick={() => shift(1)}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--surface-elevated))] text-[rgb(var(--fg))] shadow-sm transition-opacity hover:opacity-80 [-webkit-tap-highlight-color:transparent]"
        >
          <ArrowIcon direction="right" />
        </button>
        <div
          ref={viewportRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Aether theme variations"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={`w-full overflow-hidden outline-none ${dragging ? "select-none cursor-grabbing" : "cursor-grab"}`}
        >
          <div
            ref={trackRef}
            className="flex items-start w-max will-change-transform"
            style={{ paddingLeft: edgePad, paddingRight: edgePad }}
          >
            {slides.map((v, i) => {
              const logical = i % count;
              const isActive = active === logical;
              return (
                <article
                  key={v.uid}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  role="group"
                  aria-label={`${v.name}, ${logical + 1} of ${count}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => onCardClick(i)}
                  className="shrink-0 flex flex-col gap-3 sm:gap-4"
                  style={{
                    width: slideWidth || undefined,
                    marginRight: i < slides.length - 1 ? GAP_PX : 0,
                    transformOrigin: "center center",
                  }}
                >
                  <div className="relative w-full rounded-xl bg-[rgb(var(--surface-elevated))] overflow-hidden p-4 sm:p-5">
                    <div className="relative overflow-hidden rounded-lg bg-[rgb(var(--surface))]">
                      <Image
                        src={v.image}
                        alt={`${v.name} hero`}
                        width={SHOT_W}
                        height={SHOT_H}
                        sizes="(max-width: 640px) 85vw, min(70rem, 90vw)"
                        quality={90}
                        className="w-full h-auto"
                        draggable={false}
                      />
                    </div>
                  </div>
                  <div className="text-center px-2">
                    <p className="text-[18px] sm:text-[20px] font-normal tracking-[-0.02em] text-[rgb(var(--fg))]">
                      {v.name}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
