"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HiMiniArrowLeft, HiMiniArrowRight } from "react-icons/hi2";
import { AETHER_LIQUID_EASE, AETHER_LIQUID_MS, aetherLiquidTransition } from "./motion";

export interface ThemeVariation {
  name: string;
  image: string;
  imageMobile: string;
}

interface SlideItem extends ThemeVariation {
  uid: string;
}

type ViewMode = "desktop" | "mobile";

// MacBook renders are landscape (~1.59:1); the phone renders are portrait
// (1280x2642, ~0.48:1) — the card box has to switch aspect ratio with mode,
// not just swap which src loads into the same box.
const SHOT_W = 1365;
const SHOT_H = 858;
const SHOT_W_MOBILE = 1300;
const SHOT_H_MOBILE = 2642;
const CARD_TRANSITION = aetherLiquidTransition();
const TRACK_TRANSITION = `transform ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`;
const GAP_PX = 20;
const GAP_PX_MOBILE = 12;
const PEEK_PX_MOBILE = 0;
const PEEK_PX_DESKTOP = 32;
const CONTENT_MAX_PX = 1280;
const MOBILE_GUTTER_PX = 12;
const INITIAL_RUNWAY = 3;
const EXTEND_THRESHOLD = 2;

const NAV_BUTTON_CLASS =
  "relative h-[38px] w-[38px] rounded-full bg-[rgb(var(--surface)/0.45)] text-[rgb(var(--fg))] transition-opacity hover:opacity-80 [-webkit-tap-highlight-color:transparent]";

const LABEL_MOTION = `opacity ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}, transform ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}, filter ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`;
const LABEL_EXIT_MS = Math.round(AETHER_LIQUID_MS * 0.42);

type LabelPhase = "visible" | "exit" | "enter-from";

/**
 * One device-mode's render of a variation card. `src` swaps in place on a
 * mode switch; `visible` (driven by the caller's modeSettled flag) eases
 * its opacity/blur so the swap crossfades instead of cutting instantly.
 */
function VariationShot({
  variation,
  shotMode,
  visible,
  reduceMotion,
}: {
  variation: ThemeVariation;
  shotMode: ViewMode;
  visible: boolean;
  reduceMotion: boolean;
}) {
  const isMobileShot = shotMode === "mobile";
  // Its wrapper (see the caller) is the source of truth for real height —
  // this max-h-[55vh] is just a sane pre-layout ceiling for first paint.
  return (
    <Image
      src={isMobileShot ? variation.imageMobile : variation.image}
      alt={`${variation.name} hero, ${shotMode} view`}
      width={isMobileShot ? SHOT_W_MOBILE : SHOT_W}
      height={isMobileShot ? SHOT_H_MOBILE : SHOT_H}
      sizes="(max-width: 640px) 92vw, min(70rem, 90vw)"
      quality={90}
      className={
        isMobileShot
          ? "block w-auto h-auto mx-auto max-w-[50%] max-h-[55vh]"
          : "block w-full h-auto scale-[1.2] sm:scale-100 origin-bottom"
      }
      style={
        reduceMotion
          ? undefined
          : {
              // Only opacity/filter go inline — the crop-scale for desktop
              // shots lives in the scale-[...] utility class above, and an
              // inline transform here would silently override it.
              opacity: visible ? 1 : 0,
              filter: visible ? "blur(0px)" : "blur(6px)",
              transition: `opacity ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}, filter ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`,
            }
      }
      draggable={false}
      loading="eager"
    />
  );
}

function VariationLabel({ name, reduceMotion }: { name: string; reduceMotion: boolean }) {
  const [displayName, setDisplayName] = useState(name);
  const [phase, setPhase] = useState<LabelPhase>("visible");
  const nameRef = useRef(name);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (name === nameRef.current) return;

    if (reduceMotion) {
      nameRef.current = name;
      setDisplayName(name);
      setPhase("visible");
      return;
    }

    setPhase("exit");
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      nameRef.current = name;
      setDisplayName(name);
      setPhase("enter-from");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase("visible"));
      });
    }, LABEL_EXIT_MS);

    return () => clearTimeout(timerRef.current);
  }, [name, reduceMotion]);

  const motion =
    phase === "visible"
      ? { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" }
      : phase === "exit"
        ? { opacity: 0, transform: "translateY(-5px)", filter: "blur(5px)" }
        : { opacity: 0, transform: "translateY(5px)", filter: "blur(5px)" };

  return (
    <p
      className="text-left text-[18px] sm:text-[20px] font-normal tracking-[-0.02em] text-[rgb(var(--fg))] min-w-0"
      style={{
        ...motion,
        transition: phase === "enter-from" || reduceMotion ? "none" : LABEL_MOTION,
        willChange: reduceMotion ? undefined : "opacity, transform, filter",
      }}
    >
      {displayName}
    </p>
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
  const [gapPx, setGapPx] = useState(GAP_PX);
  // Defaults to "desktop" for a stable SSR render, then flips to "mobile"
  // on mount if the visitor's own viewport is mobile-sized — someone on a
  // phone almost certainly wants to preview the mobile mockups first.
  const [mode, setMode] = useState<ViewMode>("desktop");
  // Briefly false right after a mode switch so the cards crossfade/settle
  // into their new aspect ratio instead of snapping to it instantly.
  const [modeSettled, setModeSettled] = useState(true);
  // Tracks the *site's own* viewport (not the toggle's mode) so the tab
  // order can lead with "Mobile" there, matching the default above.
  const [viewportIsMobile, setViewportIsMobile] = useState(false);
  const modeInitRef = useRef(false);
  const innerIdRef = useRef<number | undefined>(undefined);

  const handleModeChange = useCallback((next: ViewMode) => {
    setMode((prevMode) => (prevMode === next ? prevMode : next));
    setModeSettled(false);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const sync = () => setViewportIsMobile(media.matches);
    sync();
    if (!modeInitRef.current) {
      modeInitRef.current = true;
      if (media.matches) setMode("mobile");
    }
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (modeSettled) return;
    // Double rAF: a single one can fire before the browser has actually
    // painted the "hidden" starting frame, so the opacity/blur transition
    // has no committed before-state to animate from and the swap looks
    // instant. Waiting a full extra frame guarantees that paint happened.
    const outer = requestAnimationFrame(() => {
      const inner = requestAnimationFrame(() => setModeSettled(true));
      innerIdRef.current = inner;
    });
    return () => {
      cancelAnimationFrame(outer);
      if (innerIdRef.current) cancelAnimationFrame(innerIdRef.current);
    };
  }, [modeSettled, mode]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const step = slideWidth + gapPx;

  const measureLayout = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const vw = viewport.clientWidth;
    const desktop = window.matchMedia("(min-width: 640px)").matches;
    const contentWidth = Math.min(CONTENT_MAX_PX, vw);
    const cardAreaWidth = desktop
      ? contentWidth - MOBILE_GUTTER_PX * 2
      : vw;
    const peek = desktop ? PEEK_PX_DESKTOP : PEEK_PX_MOBILE;
    const nextGap = desktop ? GAP_PX : GAP_PX_MOBILE;
    const nextSlideWidth = Math.max(0, cardAreaWidth - peek * 2 - nextGap);
    setGapPx(nextGap);
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
    // Mobile browsers can settle their real layout (font swap, address-bar
    // collapse, viewport unit changes) a frame or two after mount, after the
    // initial measureLayout() already ran — re-measuring once more here
    // self-corrects the track position if that happened, the same way the
    // resize handler above does mid-session.
    const settleId = requestAnimationFrame(() => requestAnimationFrame(onResize));
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(settleId);
    };
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

  // Shortest way round the loop to a logical variation.
  const goTo = (target: number) => {
    let delta = (target - active + count) % count;
    if (delta > count / 2) delta -= count;
    if (delta !== 0) shift(delta);
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
      <div className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] mb-8 sm:mb-10 flex flex-col items-center gap-4">
        <h2 className="text-center text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">
          Infinite variations
        </h2>
        <p className="-mt-1 mb-1 text-center text-[16px] sm:text-[19px] leading-snug tracking-tight text-[rgb(var(--muted))] max-w-md [text-wrap:balance]">
          Four starting points. Change colors, type and layout in the theme editor, no code.
        </p>
        <div
          role="tablist"
          aria-label="Preview device"
          className="inline-flex items-center gap-0.5 rounded-full bg-[rgb(var(--surface)/0.45)] p-1 text-[13px] tracking-tight"
        >
          {(viewportIsMobile ? (["mobile", "desktop"] as const) : (["desktop", "mobile"] as const)).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={mode === option}
              onClick={() => handleModeChange(option)}
              className={`rounded-full px-4 py-1.5 capitalize transition-colors ${
                mode === option
                  ? "bg-[rgb(var(--fg))] text-[rgb(var(--bg))]"
                  : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-screen left-1/2 -translate-x-1/2">
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
          className={`w-full overflow-hidden outline-none pb-16 sm:pb-20 ${dragging ? "select-none cursor-grabbing" : "cursor-grab"}`}
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
                    marginRight: i < slides.length - 1 ? gapPx : 0,
                    transformOrigin: "center center",
                  }}
                >
                  <div
                    className="relative w-full overflow-hidden rounded-xl flex items-center justify-center"
                    style={{
                      transition: reduceMotion ? "none" : `max-height ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`,
                      // Desktop viewport only: cap the mobile shot at the
                      // same height the desktop shot actually renders at
                      // (its card-width-driven aspect ratio), so toggling
                      // modes doesn't change the card's height there. Mobile
                      // viewport is untouched — same 55vh cap as before.
                      maxHeight:
                        mode !== "mobile"
                          ? "60rem"
                          : viewportIsMobile
                            ? "55vh"
                            : slideWidth > 0
                              ? `${(slideWidth * SHOT_H) / SHOT_W}px`
                              : "38rem",
                    }}
                  >
                    <VariationShot
                      variation={v}
                      shotMode={mode}
                      visible={modeSettled}
                      reduceMotion={reduceMotion}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center">
          <div
            className="flex items-center justify-between gap-4 pointer-events-auto mx-4 sm:mx-5 pt-3 border-t border-[rgb(var(--line))]"
            style={slideWidth > 0 ? { width: slideWidth - 32 } : undefined}
          >
            <div className="flex min-w-0 items-baseline gap-2.5">
              <VariationLabel
                name={variations[active]?.name ?? ""}
                reduceMotion={reduceMotion}
              />
              <span className="shrink-0 text-[14px] tracking-tight tabular-nums text-[rgb(var(--muted))]">
                {active + 1} of {count}
              </span>
            </div>
            {/* Every variation at a glance, and a direct jump to any of them. */}
            <div className="hidden sm:flex items-center gap-1.5" role="tablist" aria-label="Variations">
              {variations.map((v, i) => (
                <button
                  key={v.name}
                  type="button"
                  role="tab"
                  aria-selected={active === i}
                  aria-label={v.name}
                  onClick={() => goTo(i)}
                  className="group flex h-[38px] items-center px-0.5 [-webkit-tap-highlight-color:transparent]"
                >
                  <span
                    className={`block h-[3px] rounded-full transition-[width,background-color] duration-300 ${
                      active === i
                        ? "w-7 bg-[rgb(var(--fg))]"
                        : "w-4 bg-[rgb(var(--fg)/0.18)] group-hover:bg-[rgb(var(--fg)/0.4)]"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                aria-label="Previous variation"
                onClick={() => shift(-1)}
                className={NAV_BUTTON_CLASS}
              >
                <HiMiniArrowLeft
                  className="absolute left-1/2 top-1/2 block h-[17px] w-[17px] -translate-x-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                aria-label="Next variation"
                onClick={() => shift(1)}
                className={NAV_BUTTON_CLASS}
              >
                <HiMiniArrowRight
                  className="absolute left-1/2 top-1/2 block h-[17px] w-[17px] -translate-x-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
