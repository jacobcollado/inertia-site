"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import type { WorkMeta, SizedImage } from "@/lib/work";

type WorkMetaWithGallery = WorkMeta & { gallery: SizedImage[] };

function serviceShort(s: string | undefined): string {
  if (!s) return "";
  return s.trim();
}

// Desktop-carousel-only thumbnail override, keyed by slug: swaps the default
// `card` image for a specific gallery image on the desktop carousel while
// mobile keeps the regular card/gallery[0] fallback.
const CAROUSEL_THUMB_OVERRIDE: Record<string, string> = {
  "inboundly": "/work/inboundly-1.png",
};

// Live link + status overrides for the /work index, keyed by slug. Kept here
// rather than in each project's MDX since /work is the only surface these
// still drive (individual /work/[slug] pages are no longer in active use).
const WORK_LINKS: Record<string, { url?: string; status?: string; year?: string; yearLabel?: string }> = {
  "trippie-redd": { status: "Inactive", year: "June 2025" },
  "ellora-la": { url: "https://ellora.la", year: "Early 2026" },
  "aether": { url: "https://aether-starter.myshopify.com", year: "2023", yearLabel: "2023 - Present" },
  "allure-new-york": { url: "https://allurenewyork.com", year: "March 2026" },
  "inboundly": { url: "https://inboundly.us", year: "May 2026" },
  "ft-gioo": { url: "https://ftgioo.com", year: "June 2025" },
  "samuel-norris": { url: "https://samuelnorrisofficial.com", year: "Early 2025" },
  "mood-swings": { url: "https://moodswings.us", year: "August 2025" },
  "subtle-goods": { url: "https://subtlegoods.shop", year: "June 2026" },
};

// Per-project dialog logo overrides. Logos ship in varied colors and natural
// proportions; the dialog sits on a light surface, so some need forcing to
// solid black, a couple read better with the wordmark text alone (logo
// hidden), and a few need a nudged height so they don't read too small/large
// against the others. `tone`: "black" forces the artwork to pure black via
// filter, "hide" drops the image entirely. `height`: pixel height overriding
// the default 28px (kept as an inline number rather than a Tailwind class so
// it doesn't depend on the JIT scanner picking up interpolated class names).
const DIALOG_LOGO_OVERRIDE: Record<string, { tone?: "black" | "hide"; height?: number }> = {
  "ellora-la": { tone: "black", height: 18 },
  "inboundly": { tone: "black", height: 32 },
  "subtle-goods": { tone: "black", height: 44 },
  "ft-gioo": { height: 32 },
  "aether": { tone: "hide" },
  "samuel-norris": { tone: "hide" },
};

// Per-project thumbnail crop position (object-position). Default is "center
// top"; a larger vertical value slides the crop window downward so more of the
// image's lower portion shows.
const THUMB_OBJECT_POSITION: Record<string, string> = {
  "trippie-redd": "center 35%",
  "allure-new-york": "center 50%",
};

function resolveLink(slug: string, w: WorkMeta) {
  const override = WORK_LINKS[slug];
  const url = override?.url ?? w.url;
  const status = override?.status;
  const year = override?.year ?? w.year;
  const yearLabel = override?.yearLabel ?? year?.match(/\d{4}/)?.[0];
  return { url, status, yearLabel };
}

function WorkDialog({
  work,
  onClose,
}: {
  work: WorkMetaWithGallery | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  // Swipe-down-to-close (mobile). dragY is the live downward offset while
  // dragging; dragging tracks whether a close-drag is actually in progress
  // (only started when the panel is scrolled to the top and the finger pulls
  // down, so it never fights normal content scrolling).
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchState = useRef<{ startY: number; active: boolean } | null>(null);
  useEffect(() => setMounted(true), []);

  // Drive an enter/exit transition off `visible` so opening fades/rises in and
  // closing plays out before the portal unmounts (kept simple: parent controls
  // mount via `work`, this only animates the in/out state).
  useEffect(() => {
    if (work) {
      setDragY(0);
      setDragging(false);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
  }, [work]);

  // Swipe-down-to-close handlers. A close-drag only begins when the panel is
  // scrolled to the very top and the finger moves downward; up to that point
  // (and any time the panel isn't at the top) touches fall through to native
  // scrolling untouched.
  const CLOSE_THRESHOLD = 110; // px dragged to dismiss on release
  const onTouchStart = (e: React.TouchEvent) => {
    const panel = panelRef.current;
    if (!panel || panel.scrollTop > 0) { touchState.current = null; return; }
    touchState.current = { startY: e.touches[0].clientY, active: false };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const st = touchState.current;
    const panel = panelRef.current;
    if (!st || !panel) return;
    const dy = e.touches[0].clientY - st.startY;
    // Only engage on a downward pull from the top. If the panel has since
    // scrolled (shouldn't, at top) or the pull is upward, bail out.
    if (!st.active) {
      if (dy > 6 && panel.scrollTop <= 0) { st.active = true; setDragging(true); }
      else return;
    }
    if (dy <= 0) { setDragY(0); return; }
    setDragY(dy);
  };
  const onTouchEnd = () => {
    const st = touchState.current;
    touchState.current = null;
    if (!st?.active) return;
    setDragging(false);
    if (dragY > CLOSE_THRESHOLD) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  useEffect(() => {
    if (!work) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);

    // This site runs Lenis smooth-scroll (see app/lenis-provider.tsx), which
    // hijacks wheel events globally with a non-passive preventDefault. That's
    // why, without stopping it, the page still scrolled behind the dialog and
    // the wheel wouldn't scroll the panel (only the scrollbar / middle-click
    // autoscroll, which don't go through wheel events, worked). Lenis exposes a
    // `lenis:lock` / `lenis:unlock` event pair that stops/starts it; stopping
    // it releases the wheel so the panel (marked data-lenis-prevent below)
    // scrolls natively and nothing behind moves.
    window.dispatchEvent(new Event("lenis:lock"));
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("lenis:unlock"));
    };
  }, [work, onClose]);

  if (!mounted || !work) return null;

  const { url, status, yearLabel } = resolveLink(work.slug, work);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 360ms ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        data-lenis-prevent
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        className="relative w-full sm:max-w-[560px] bg-[rgb(var(--bg))] border border-[rgb(var(--line))] rounded-t-2xl sm:rounded-b-none mx-0 sm:mx-4 overflow-y-auto overscroll-contain"
        style={{
          maxHeight: "92dvh",
          transform: visible ? `translateY(${dragY}px)` : "translateY(24px)",
          opacity: visible ? 1 : 0,
          // No transition while actively dragging so the panel tracks the
          // finger 1:1; restore a slow, fluid ease for the enter/exit and the
          // snap-back so the release settles gently rather than snapping.
          transition: dragging
            ? "opacity 220ms ease"
            : "transform 560ms cubic-bezier(0.22,1,0.36,1), opacity 300ms ease",
        }}
      >
        {/* Mobile grabber */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 sticky top-0 z-20 bg-[rgb(var(--bg))]">
          <div className="w-8 h-1 rounded-full bg-[rgb(var(--line))]" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          aria-label="Close"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>

        <div className="px-6 sm:px-8 pt-5 sm:pt-8 pb-8">
          {/* Header */}
          <div className="flex flex-col gap-3 pr-10">
            {work.logo && DIALOG_LOGO_OVERRIDE[work.slug]?.tone !== "hide" && (
              <Image
                src={work.logo}
                alt={work.client}
                width={160}
                height={160}
                sizes="160px"
                quality={78}
                className="w-auto object-contain object-left"
                style={{
                  height: DIALOG_LOGO_OVERRIDE[work.slug]?.height ?? 28,
                  width: "auto",
                  filter: DIALOG_LOGO_OVERRIDE[work.slug]?.tone === "black" ? "brightness(0)" : "var(--logo-filter, none)",
                }}
              />
            )}
            <h2 className="text-[clamp(1.6rem,4vw,2.1rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">
              {work.client}
            </h2>
          </div>

          {/* Meta row: service + year/status */}
          <div className="flex items-center gap-2.5 flex-wrap mt-4">
            {work.service && (
              <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] rounded-full px-2.5 pt-[3px] pb-[4px] leading-none" style={{ background: "rgb(var(--fg) / 0.06)" }}>
                {serviceShort(work.service)}
              </span>
            )}
            {(status || yearLabel) && (
              <span className="text-[11px] tabular-nums tracking-tight rounded-full px-2.5 pt-[3px] pb-[4px] leading-none" style={{ background: "rgb(var(--surface))", color: "rgb(var(--fg))" }}>
                {status && yearLabel ? `${status} - ${yearLabel}` : status || yearLabel}
              </span>
            )}
          </div>

          {/* Summary */}
          {work.summary && (
            <p className="text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] mt-5">
              {work.summary}
            </p>
          )}

          {/* Live link */}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5 mt-6 text-[13px] font-medium tracking-tight text-white hover:opacity-85 transition-opacity"
              style={{ background: "#000" }}
            >
              Open live site
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                  <line x1="4" y1="12" x2="12" y2="4" /><polyline points="5 4 12 4 12 11" />
                </svg>
              </span>
            </a>
          )}

          {/* Gallery */}
          {work.gallery.length > 0 && (
            <div className="flex flex-col gap-3 mt-7">
              {work.gallery.map((img, i) => (
                <div
                  key={i}
                  className="w-full overflow-hidden rounded-xl bg-[rgb(var(--surface))]"
                  style={{ aspectRatio: `${img.width} / ${img.height}` }}
                >
                  <Image
                    src={img.src}
                    alt={`${work.client} ${i + 1}`}
                    width={img.width}
                    height={img.height}
                    sizes="(max-width: 640px) 100vw, 560px"
                    quality={78}
                    className="w-full h-auto block"
                    loading={i === 0 ? undefined : "lazy"}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function WorkCard({
  work,
  onOpen,
  wide,
  cardRef,
  carousel,
  onPointerEnter,
  onPointerLeave,
  suppressThumbTransition,
  cardWidthCss,
}: {
  work: WorkMetaWithGallery;
  onOpen: () => void;
  // Spans both grid columns on desktop and uses a landscape aspect, so a
  // wide/landscape thumbnail (e.g. FT.GIOO) isn't cropped down into a square.
  wide?: boolean;
  // Carousel mode (desktop only): the parent measures and drives each card's
  // scale/lift, so it needs a handle on the thumbnail element and the card
  // drops its grid-column span in favor of a fixed track width.
  cardRef?: (el: HTMLDivElement | null) => void;
  carousel?: boolean;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  // While a drag is live the parent writes transform/box-shadow to the thumb
  // every frame; a CSS transition would chase each of those targets and never
  // catch up, so it's disabled for the duration of the gesture.
  suppressThumbTransition?: boolean;
  // Resolved CSS width for carousel mode, computed by the parent from the
  // measured header height so the card never exceeds the space below it.
  cardWidthCss?: string;
}) {
  const thumb = (carousel && CAROUSEL_THUMB_OVERRIDE[work.slug]) || work.card || work.gallery[0]?.src;
  // Per-project crop nudge. Thumbnails default to object-top; these sit lower
  // in frame, so shifting object-position down reveals more of their lower
  // portion.
  const objectPosition = THUMB_OBJECT_POSITION[work.slug] ?? "center top";

  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={`group flex flex-col gap-3 text-left${wide && !carousel ? " sm:col-span-2" : ""}${carousel ? " shrink-0" : ""}`}
      // Carousel cards are as wide as CAROUSEL_CARD_WIDTH allows, but never so
      // tall that the card plus its label row overflows the frame. Capping the
      // width by the available height (times the 4/3 aspect) means a short
      // laptop viewport gets a proportionally narrower card instead of one
      // clipped at the top and bottom.
      style={carousel && cardWidthCss ? { width: cardWidthCss } : undefined}
      aria-label={`Open ${work.client}`}
    >
      <div
        ref={cardRef}
        className={`work-card-thumb relative w-full overflow-hidden rounded-xl bg-[rgb(var(--surface))]${carousel ? " work-card-thumb--carousel" : ""}`}
        style={{
          aspectRatio: carousel
            ? `${CAROUSEL_AR_W} / ${CAROUSEL_AR_H}`
            : wide
              ? "16 / 9"
              : "4 / 3",
          ...(suppressThumbTransition ? { transition: "none" } : {}),
        }}
      >
        {thumb ? (
          <Image
            src={thumb}
            alt={work.client}
            fill
            // Carousel cards render up to 760px CSS, so request the largest
            // candidate available. An earlier 512px cap here meant Next served a
            // half-size image the browser then upscaled, which is what made
            // these read as low-resolution once the cards got bigger.
            sizes={carousel ? "1536px" : wide ? "(max-width: 640px) 100vw, 1024px" : "(max-width: 640px) 100vw, 512px"}
            quality={90}
            className="object-cover"
            style={{ objectPosition }}
            draggable={false}
          />
        ) : null}
        {/* Desktop: name + service badge sit inside the card as a scrim-backed
            overlay instead of a row below it; mobile keeps the row below
            since there's no room to overlay without crowding the photo. */}
        <div
          className="hidden sm:flex absolute inset-x-0 bottom-0 items-center justify-between gap-3 px-4 py-3 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 65%)" }}
        >
          <span className="text-[16px] font-medium tracking-tight text-white">
            {work.client}
          </span>
          {work.service && (
            <span className="text-[12px] tracking-tight text-white/80 shrink-0 rounded-full px-2.5 pt-[3px] pb-[4px] leading-none" style={{ background: "rgba(255,255,255,0.15)" }}>
              {serviceShort(work.service)}
            </span>
          )}
        </div>
      </div>
      <div className="flex sm:hidden items-center justify-between gap-3">
        <span className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))]">
          {work.client}
        </span>
        {work.service && (
          <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] shrink-0 rounded-full px-2.5 pt-[3px] pb-[4px] leading-none" style={{ background: "rgb(var(--surface))" }}>
            {serviceShort(work.service)}
          </span>
        )}
      </div>
    </button>
  );
}

// Progressive resistance past a boundary. Inside [min, max] the value passes
// through untouched (so dragging tracks the cursor exactly); beyond it, the
// overshoot is compressed by a curve that gives less and less the further you
// pull, which is what makes the ends feel elastic instead of walled off.
const RUBBER_RESISTANCE = 0.55;
function rubberBand(value: number, min: number, max: number) {
  if (value > max) {
    const over = value - max;
    return max + over / (1 + over * RUBBER_RESISTANCE * 0.01);
  }
  if (value < min) {
    const over = min - value;
    return min - over / (1 + over * RUBBER_RESISTANCE * 0.01);
  }
  return value;
}

// Under-damped spring for the settle after a drag or flick, integrated per frame
// as `v += dist * stiffness - v * damping` (damping acts as a force, not as a
// blanket multiplier on velocity: multiplying the whole velocity let it build up
// over a long travel and overshoot by ~150px, well over a tenth of a card).
// Tuned for a slow, smooth ease into place (~780ms) with only a light ~30px
// overshoot right at the end, a soft settle rather than a visible snap. An
// earlier, stiffer tuning (k=0.16, c=0.44) settled in ~420ms with ~80px of
// overshoot, which read as abrupt rather than fluid. Because position is
// integrated rather than driven by a fixed-duration curve, a hard flick and a
// gentle nudge settle with the same physics instead of the same clock.
const SPRING_STIFFNESS = 0.05;
const SPRING_DAMPING = 0.3;
const SPRING_REST_EPSILON = 0.35;

// Target card width. This is meant to be the binding constraint on a normal
// desktop viewport, the height cap below only takes over on genuinely short
// screens, so widening this number actually widens the card.
const CAROUSEL_CARD_WIDTH = 940;
const CAROUSEL_GAP = 32;
// Everything in the frame that isn't the thumbnail itself: the label row under
// each card, the track's vertical padding, and headroom for the shadow.
// Subtracted in absolute pixels rather than folded into a dvh percentage,
// because the share of the viewport this chrome occupies changes with viewport
// height, a fixed percentage that fit a 1080px screen overflowed an 800px one.
const CAROUSEL_CHROME_PX = 148;
// The centered card scales up from its own center, so the height budget has to
// be divided by this before converting to a width, or the grown card overflows.
const CAROUSEL_FOCUS_SCALE = 1.045;
// Card aspect, as width/height. Wider than the 4/3 the grid thumbnails use: at
// carousel widths 4/3 made a very tall card that ate the whole viewport. Both
// the CSS aspect-ratio and the height-budget math below read from this, so they
// can't drift apart.
const CAROUSEL_AR_W = 16;
const CAROUSEL_AR_H = 10;
// Single source of truth for a card's rendered width: the pixel cap, or the
// width implied by the height cap at 4/3, whichever is smaller. Both the cards
// and the centering spacers derive from this so they can never disagree (the
// spacers have to be exactly half a card wide to center the first/last one).
// Single source of truth for a card's rendered width: the target width, or the
// width implied by the height that actually fits below the header, whichever is
// smaller. `headerPx` is the measured height of everything above the carousel, // leaving it out of this budget is what made the card overflow (and get clipped)
// on shorter windows. Cards and the centering spacers both derive from this, so
// they can never disagree; the spacers must be exactly half a card wide for the
// first and last card to reach center.
function carouselCardWidthCss(headerPx: number) {
  const budget = `calc(100dvh - ${headerPx}px - ${CAROUSEL_CHROME_PX}px)`;
  return `min(${CAROUSEL_CARD_WIDTH}px, calc(${budget} / ${CAROUSEL_FOCUS_SCALE} * ${CAROUSEL_AR_W} / ${CAROUSEL_AR_H}))`;
}

// Desktop-only carousel for the /work index. Same interaction model as the
// homepage client carousel: a real horizontal track positioned with a plain
// translateX and dragged directly (no native overflow scrolling), with each
// card's scale/lift a continuous function of its distance from the viewport
// center rather than a binary hover flip. Writes transform/box-shadow straight
// to each thumbnail's DOM node during a drag so frames never wait on a React
// render, then hands off to a CSS transition once the drag settles.
function WorkCarousel({
  items,
  onOpen,
  headerPx,
}: {
  items: WorkMetaWithGallery[];
  onOpen: (slug: string) => void;
  // Height of everything above the carousel, so card sizing can subtract it.
  headerPx: number;
}) {
  const cardWidthCss = carouselCardWidthCss(headerPx);
  const spacerWidthCss = `calc(50vw - ${cardWidthCss} * 0.5)`;
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leadRef = useRef<HTMLDivElement>(null);
  const translateRef = useRef(0);
  const dragRef = useRef<{
    startX: number;
    startTranslate: number;
    moved: boolean;
    lastX: number;
    lastTime: number;
    velocity: number;
  } | null>(null);
  // Cancels an in-flight settle animation. A new grab mid-flight has to stop the
  // old spring, or the two fight over track.style.transform every frame.
  const settleRafRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  // The track's leading inset, so the first card starts aligned with the page's
  // content column instead of hard against the viewport edge. Lives inside the
  // track (as a spacer) rather than as padding on the viewport, because the
  // viewport has to span the full window width for the center-proximity math to
  // measure against the real visual center. Measured from the DOM so it always
  // matches whatever the CSS resolved.
  const leadInsetRef = useRef(0);
  // Cards are sized by a CSS min() of a pixel cap and an aspect-derived height
  // cap, so their rendered width depends on the viewport and can be narrower
  // than CAROUSEL_CARD_WIDTH. All the geometry below (proximity, snapping,
  // spacers) has to agree with what actually got laid out, so the real width is
  // measured rather than assumed, using the constant here would drift the
  // focus and snap targets off-center on any short viewport.
  const cardWidthRef = useRef(CAROUSEL_CARD_WIDTH);
  // The prev/next pill row is positioned in JS off the focused card's actual
  // bounding rect rather than CSS calc()s derived from cardWidthCss, since
  // that card is also scaled up by CAROUSEL_FOCUS_SCALE via transform and its
  // container spans a raw 100vw (which drifts from the true visible width by
  // the scrollbar's own width) — matching the real rect is the only way the
  // row's edges land exactly on the card's rendered edges.
  const pillRowRef = useRef<HTMLDivElement>(null);

  const measureGeometry = useCallback(() => {
    const spacer = leadRef.current;
    leadInsetRef.current = spacer?.getBoundingClientRect().width ?? 0;
    const firstCard = thumbRefs.current.find(Boolean);
    if (firstCard) {
      const w = firstCard.getBoundingClientRect().width;
      // getBoundingClientRect reflects any active scale transform, so fall back
      // to offsetWidth (layout width, transform-independent) to stay accurate
      // while a card is scaled up.
      cardWidthRef.current = firstCard.offsetWidth || w || CAROUSEL_CARD_WIDTH;
    }
  }, []);

  const minTranslate = useCallback(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return 0;
    return Math.min(0, viewport.clientWidth - track.scrollWidth);
  }, []);

  // Continuous center-proximity focus. Each card's own live distance from the
  // viewport's center drives its scale and lift, so the outgoing card visibly
  // shrinks while the incoming one grows, the whole way between them, instead
  // of snapping once some threshold is crossed. Pure arithmetic off the cached
  // slot width and the current translate, no per-card layout reads.
  // `hovered` adds a small extra lift on top of the card's proximity focus. It
  // is not a separate state: the centered card stays scaled whether or not a
  // drag is in progress, so this same function drives both the live gesture and
  // the at-rest look, and the focus never drops out from under the cursor.
  const applyProximity = useCallback((hovered: number | null = null) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const viewportCenter = viewport.clientWidth / 2;
    const cardWidth = cardWidthRef.current;
    const slot = cardWidth + CAROUSEL_GAP;
    let closestIndex = 0;
    let closestDist = Infinity;
    thumbRefs.current.forEach((thumb, i) => {
      if (!thumb) return;
      const cardCenter = translateRef.current + leadInsetRef.current + i * slot + cardWidth / 2;
      const dist = Math.abs(cardCenter - viewportCenter);
      if (dist < closestDist) { closestDist = dist; closestIndex = i; }
      const proximity = Math.max(0, 1 - dist / slot);
      const hoverBoost = i === hovered ? 1 : 0;
      const scale = 1 + 0.045 * proximity + 0.015 * hoverBoost;
      const translateY = 4 - 12 * proximity - 3 * hoverBoost;
      const lift = Math.max(proximity, hoverBoost * 0.7);
      thumb.style.transform = `translateY(${translateY}px) scale(${scale})`;
      thumb.style.boxShadow = lift > 0.01
        ? `0 ${16 * lift}px ${40 * lift}px -10px rgba(0,0,0,${0.24 * lift})`
        : "0 0 0 rgba(0,0,0,0)";
    });
    // Snap the pill row to the focused card's real rendered edges (it's
    // scaled up via transform, so its layout box alone isn't enough).
    const focusedThumb = thumbRefs.current[closestIndex];
    const pillRow = pillRowRef.current;
    if (focusedThumb && pillRow) {
      const cardRect = focusedThumb.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();
      pillRow.style.left = `${cardRect.left - viewportRect.left}px`;
      pillRow.style.width = `${cardRect.width}px`;
      pillRow.style.top = `${cardRect.bottom - viewportRect.top + 28}px`;
    }
  }, []);

  useEffect(() => {
    if (!isDragging) applyProximity(hoveredIndex);
  }, [hoveredIndex, isDragging, applyProximity]);

  // Re-clamp on resize: a wider viewport can leave the track dragged further
  // than its content now allows, which would otherwise strand empty space.
  // Open on the middle card rather than the first. The lead spacer centers card
  // 0 at translateX(0), so each further card is one slot more negative. Applied
  // in a layout effect (before paint) so the carousel renders already positioned
  // instead of visibly jumping from the first card on mount.
  useLayoutEffect(() => {
    measureGeometry();
    const track = trackRef.current;
    if (!track || items.length === 0) return;
    const slot = cardWidthRef.current + CAROUSEL_GAP;
    const middle = Math.floor((items.length - 1) / 2);
    const next = Math.max(minTranslate(), -(middle * slot));
    translateRef.current = next;
    track.style.transform = `translateX(${next}px)`;
    // Focus the opening (middle) card straight away, so the carousel comes up
    // with a card already scaled rather than flat until first interaction.
    applyProximity(null);
  // Runs once per mount (and per filter-keyed remount) to set the opening
  // position; re-running on every dep change would yank a dragged track back.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    measureGeometry();
    const onResize = () => {
      measureGeometry();
      const track = trackRef.current;
      if (!track) return;
      const min = minTranslate();
      if (translateRef.current < min) {
        translateRef.current = min;
        track.style.transform = `translateX(${min}px)`;
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [minTranslate, measureGeometry]);

  // `headerPx` feeds the cards' CSS width, so when it resolves (it starts at 0
  // and lands after the parent measures) every card's layout width changes
  // without a resize event to trigger the listener above. Re-measure and re-center
  // on the current card, otherwise the proximity focus and snap targets stay
  // pinned to the stale width and sit visibly off-center.
  useLayoutEffect(() => {
    measureGeometry();
    const track = trackRef.current;
    if (!track || items.length === 0) return;
    const slot = cardWidthRef.current + CAROUSEL_GAP;
    const viewportWidth = viewportRef.current?.clientWidth ?? 0;
    const nearest = Math.max(0, Math.min(items.length - 1, Math.round(
      (viewportWidth / 2 - cardWidthRef.current / 2 - leadInsetRef.current - translateRef.current) / slot
    )));
    const next = Math.max(
      minTranslate(),
      Math.min(0, viewportWidth / 2 - cardWidthRef.current / 2 - leadInsetRef.current - nearest * slot)
    );
    translateRef.current = next;
    track.style.transform = `translateX(${next}px)`;
    applyProximity(hoveredIndex);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerPx, measureGeometry, minTranslate]);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (settleRafRef.current !== null) cancelAnimationFrame(settleRafRef.current);
  }, []);

  // Only arm the gesture on pointerdown, don't flip isDragging or take pointer
  // capture yet. A plain click is a pointerdown with no movement, and capturing
  // an ancestor's pointer can stop the browser dispatching the resulting click
  // to the card's <button>, which would make cards unopenable. Both wait for
  // confirmed movement below.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    // Grabbing mid-settle takes over from the spring rather than fighting it for
    // control of the transform, and starts from wherever the track actually is.
    if (settleRafRef.current !== null) {
      cancelAnimationFrame(settleRafRef.current);
      settleRafRef.current = null;
    }
    dragRef.current = {
      startX: e.clientX,
      startTranslate: translateRef.current,
      moved: false,
      lastX: e.clientX,
      lastTime: performance.now(),
      velocity: 0,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    const track = trackRef.current;
    if (!d || !track) return;
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) <= 3) return;
      d.moved = true;
      viewportRef.current?.setPointerCapture(e.pointerId);
      setIsDragging(true);
    }
    e.preventDefault();
    // Track pointer velocity (px/ms) with light smoothing, so a flick can carry
    // the track past where the finger stopped instead of dying on release.
    const now = performance.now();
    const dt = now - d.lastTime;
    if (dt > 0) {
      const instant = (e.clientX - d.lastX) / dt;
      d.velocity = d.velocity * 0.7 + instant * 0.3;
      d.lastX = e.clientX;
      d.lastTime = now;
    }
    // 1:1 with the cursor inside the bounds, then rubber-banded past them: the
    // further you pull beyond an edge, the less it gives, so the ends feel
    // elastic rather than hitting a wall.
    translateRef.current = rubberBand(d.startTranslate + dx, minTranslate(), 0);
    track.style.transform = `translateX(${translateRef.current}px)`;
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        applyProximity();
      });
    }
  };

  // Spring-settles the track to whichever card index is passed, centering it
  // in the viewport. Shared by drag release (which biases the target off
  // release velocity) and the prev/next arrow buttons (which just step ±1
  // from whatever's nearest center right now).
  const settleToIndex = useCallback((index: number, initialVelocity = 0) => {
    const viewport = viewportRef.current;
    const viewportWidth = viewport?.clientWidth ?? 0;
    const cardWidth = cardWidthRef.current;
    const slot = cardWidth + CAROUSEL_GAP;
    const centeredTranslateFor = (i: number) =>
      viewportWidth / 2 - cardWidth / 2 - leadInsetRef.current - i * slot;
    const target = Math.max(
      minTranslate(),
      Math.min(0, centeredTranslateFor(Math.max(0, Math.min(items.length - 1, index))))
    );
    const track = trackRef.current;

    // Spring settle. Velocity carries over from the gesture (converted from
    // px/ms to px/frame) so the release feels continuous with the drag, and the
    // under-damped spring overshoots the target slightly before swinging back,
    // which reads as the bounce. Runs until it is both close enough and slow
    // enough, rather than for a fixed duration.
    if (settleRafRef.current !== null) cancelAnimationFrame(settleRafRef.current);
    let v = initialVelocity;
    const step = () => {
      const distance = target - translateRef.current;
      v += distance * SPRING_STIFFNESS - v * SPRING_DAMPING;
      // The overshoot is what makes this bounce, but at the very first or last
      // card there is no track left to overshoot into, and letting it swing past
      // would flash empty space beside the end card. Rubber-banding the position
      // compresses the bounce against the edge instead of hiding it, so the ends
      // still feel springy without exposing the gap.
      translateRef.current = rubberBand(translateRef.current + v, minTranslate(), 0);
      if (track) track.style.transform = `translateX(${translateRef.current}px)`;
      applyProximity(hoveredIndex);
      if (Math.abs(distance) > SPRING_REST_EPSILON || Math.abs(v) > SPRING_REST_EPSILON) {
        settleRafRef.current = requestAnimationFrame(step);
      } else {
        // Land exactly on target so repeated drags can't accumulate sub-pixel drift.
        translateRef.current = target;
        if (track) track.style.transform = `translateX(${target}px)`;
        settleRafRef.current = null;
        setIsDragging(false);
        applyProximity(hoveredIndex);
      }
    };
    settleRafRef.current = requestAnimationFrame(step);
  }, [applyProximity, hoveredIndex, items.length, minTranslate]);

  const nearestIndex = useCallback(() => {
    const viewportWidth = viewportRef.current?.clientWidth ?? 0;
    const cardWidth = cardWidthRef.current;
    const slot = cardWidth + CAROUSEL_GAP;
    return Math.round(
      (viewportWidth / 2 - cardWidth / 2 - leadInsetRef.current - translateRef.current) / slot
    );
  }, []);

  const step = useCallback((dir: 1 | -1) => {
    if (settleRafRef.current !== null) cancelAnimationFrame(settleRafRef.current);
    const next = Math.max(0, Math.min(items.length - 1, nearestIndex() + dir));
    settleToIndex(next);
  }, [items.length, nearestIndex, settleToIndex]);

  const endDrag = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    const viewport = viewportRef.current;
    if (viewport?.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
    if (!d?.moved) return;
    // Snap the nearest card to center so the track always comes to rest with
    // one card in focus rather than stranded between two.
    const nearest = nearestIndex();
    // A flick carries past the nearest card. Release velocity is converted into
    // a card-count bias, so a quick flick advances one or more cards while a slow
    // release just settles on whatever is closest. Capped so a violent flick
    // can't skip the whole track.
    const FLICK_MIN_VELOCITY = 0.25; // px/ms below which release counts as a nudge
    const velocity = d.velocity;
    let biased = nearest;
    if (Math.abs(velocity) > FLICK_MIN_VELOCITY) {
      const extra = Math.min(2, Math.max(1, Math.round(Math.abs(velocity) * 1.4)));
      // Dragging left (negative velocity) moves toward higher indices.
      biased = nearest + (velocity < 0 ? extra : -extra);
    }
    settleToIndex(biased, velocity * 16);
  };

  if (items.length === 0) return null;

  return (
    <div
      ref={viewportRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      // Clipping is horizontal only. `overflow-hidden` clips both axes, which cut
      // the top off the centered card: it scales up from its own center, so it
      // grows past the track's box by half the scale delta at top and bottom,
      // plus its drop shadow. `overflow-x-clip` with `overflow-y-visible` keeps
      // cards hidden as they run off the sides while letting the focused one
      // grow vertically. `py` still reserves layout room so the grown card has
      // somewhere to go inside the frame.
      className={`relative w-full overflow-x-clip overflow-y-visible py-10${isDragging ? " select-none" : ""}`}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* Prev/next pill buttons, sitting in a row directly under the focused
          card at the card's own left/right edges. Positioned imperatively in
          applyProximity off the focused card's real getBoundingClientRect
          (top/left start at 0 here as a placeholder before the first
          measurement runs). */}
      <div
        ref={pillRowRef}
        className="absolute top-0 left-0 z-10 flex items-center justify-between pointer-events-none"
      >
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous"
          className="pointer-events-auto flex items-center justify-center w-11 h-11 rounded-full transition-opacity hover:opacity-80"
          style={{ background: "rgb(var(--surface))", color: "rgb(var(--fg))", border: "1px solid rgb(var(--line))", boxShadow: "var(--shadow-popover)" }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
            <line x1="13" y1="8" x2="3" y2="8" /><polyline points="7 4 3 8 7 12" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next"
          className="pointer-events-auto flex items-center justify-center w-11 h-11 rounded-full transition-opacity hover:opacity-80"
          style={{ background: "rgb(var(--surface))", color: "rgb(var(--fg))", border: "1px solid rgb(var(--line))", boxShadow: "var(--shadow-popover)" }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
            <line x1="3" y1="8" x2="13" y2="8" /><polyline points="9 4 13 8 9 12" />
          </svg>
        </button>
      </div>
      <div
        ref={trackRef}
        className="flex items-start w-max"
        style={{ gap: CAROUSEL_GAP, transform: `translateX(${translateRef.current}px)` }}
      >
        {/* Centers the first card in the viewport at rest (translateX 0), so
            the carousel opens focused on one card rather than flush left. */}
        <div
          ref={leadRef}
          aria-hidden="true"
          className="shrink-0"
          style={{ width: spacerWidthCss }}
        />
        {items.map((w, i) => (
          <WorkCard
            key={w.slug}
            work={w}
            carousel
            cardRef={(el) => { thumbRefs.current[i] = el; }}
            suppressThumbTransition={isDragging}
            cardWidthCss={cardWidthCss}
            onPointerEnter={() => setHoveredIndex(i)}
            onPointerLeave={() => setHoveredIndex((prev) => (prev === i ? null : prev))}
            onOpen={() => { if (!dragRef.current?.moved) onOpen(w.slug); }}
          />
        ))}
        {/* Mirror of the lead spacer, so the last card can be dragged all the
            way to center instead of stopping at the track's trailing edge. */}
        <div
          aria-hidden="true"
          className="shrink-0"
          style={{ width: spacerWidthCss }}
        />
      </div>
    </div>
  );
}

const BACK_TO_TOP_THRESHOLD = 900;

function FloatingBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > BACK_TO_TOP_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 sm:right-8 z-40 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300"
      style={{
        background: "rgb(var(--bg))",
        border: "1px solid rgb(var(--line))",
        color: "rgb(var(--muted))",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        pointerEvents: visible ? "auto" : "none",
        boxShadow: "var(--shadow-popover)",
      }}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <path d="M8 12V4M4 7l4-4 4 4" />
      </svg>
    </button>
  );
}

const ALL_FILTER = "All";

// Shortened display labels for the filter pills. The filter value stays the
// full service string (so matching against each project's service still
// works); only the pill text is shortened. Currently unreferenced, the pills
// are temporarily removed from the render; kept for the restore.
const FILTER_LABEL: Record<string, string> = {
  "Shopify storefront": "Storefront",
  "Shopify theme": "Theme",
  "Web development": "Web dev",
  "UI/UX design": "UI/UX",
};

export default function WorkIndexPage({ initialWork }: { initialWork: WorkMetaWithGallery[] }) {
  const [work] = useState<WorkMetaWithGallery[]>(initialWork);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  // Filter pills are temporarily removed from the render, so this stays fixed
  // at "All" and its setter is unused for now (kept, along with the `filters`
  // derivation below, so restoring the pills is a single-block change).
  const [filter] = useState<string>(ALL_FILTER);
  // Desktop gets the carousel, mobile keeps the vertical grid. Resolved from a
  // measurement rather than rendering both behind responsive classes, since the
  // carousel drives its own layout imperatively (fixed-width track, inline
  // transforms) and mounting it on mobile would leave it measuring a hidden
  // element. Starts null so neither variant renders until measured, rendering
  // one and swapping would be a visible layout jump on load.
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  // Distance from the top of the viewport to the carousel frame, i.e. the height
  // of everything above it (the in-flow header). Subtracted from 100dvh so the
  // carousel fills exactly the remaining space.
  const carouselFrameRef = useRef<HTMLDivElement>(null);
  const [frameTop, setFrameTop] = useState(0);

  useEffect(() => {
    const measure = () => setIsDesktop(window.innerWidth >= 640);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useLayoutEffect(() => {
    if (!isDesktop) return;
    const measure = () => {
      const el = carouselFrameRef.current;
      if (!el) return;
      // Offset from the document top, not the viewport, so a page that happens
      // to be scrolled when this runs still measures the header, not whatever
      // the scroll position makes the frame's viewport-relative top.
      setFrameTop(el.getBoundingClientRect().top + window.scrollY);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isDesktop]);

  const close = useCallback(() => setOpenSlug(null), []);
  const openWork = openSlug ? work.find((w) => w.slug === openSlug) ?? null : null;

  // Distinct services, in the order they first appear, with an "All" option
  // up front. Derived from the data so the pills stay in sync with content.
  // Commented out (not deleted) alongside the pills themselves, an unused
  // local would fail the build's lint.
  // const filters = [
  //   ALL_FILTER,
  //   ...work.reduce<string[]>((acc, w) => {
  //     const s = serviceShort(w.service);
  //     if (s && !acc.includes(s)) acc.push(s);
  //     return acc;
  //   }, []),
  // ];

  const visibleWork = filter === ALL_FILTER
    ? work
    : work.filter((w) => serviceShort(w.service) === filter);

  return (
    <main
      className={`mx-auto w-full px-6 sm:px-8 ${isDesktop ? "pt-0 pb-0" : "pt-10 pb-24"}`}
      style={{ maxWidth: "64rem" }}
    >

      {/* Service filter pills temporarily removed. The filter state and the
          derived `filters` list below are intentionally left in place so this
          is a single-block restore. */}

      {/* Desktop: horizontal carousel, breaking out of this container's max
          width to full-bleed so cards can run off both edges. Mobile: the
          original vertical thumbnail grid. */}
      {isDesktop === true ? (
        <div
          // Fills the space left below the in-flow header and centers the track
          // in it, so the carousel reads as full-screen and the footer sits just
          // below the fold.
          //
          // `frameTop` is the frame's own distance from the document top, i.e.
          // the height of the header above it. Subtracting it is what keeps the
          // frame's BOTTOM at the fold: the box starts at frameTop and is
          // (100dvh - frameTop) tall, so it ends exactly at 100dvh. An earlier
          // version used a flat 100dvh here, which overflowed by the header's
          // height, and because the track is vertically centered in this box,
          // that overflow split evenly and clipped the cards' top half off the
          // screen rather than just spilling past the bottom.
          ref={carouselFrameRef}
          className="w-[100vw] ml-[calc(50%-50vw)] flex items-center justify-start"
          style={{ height: `calc(100dvh - ${frameTop}px)` }}
          // Keys the carousel to the active filter so switching filters
          // remounts it at translateX(0) instead of keeping a scroll offset
          // that may now exceed the shorter track's bounds.
          key={filter}
        >
          <WorkCarousel items={visibleWork} onOpen={(slug) => setOpenSlug(slug)} headerPx={frameTop} />
        </div>
      ) : isDesktop === false ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10">
          {visibleWork.map((w) => (
            <WorkCard key={w.slug} work={w} onOpen={() => setOpenSlug(w.slug)} wide={w.slug === "ft-gioo"} />
          ))}
        </div>
      ) : null}

      <WorkDialog work={openWork} onClose={close} />
      <FloatingBackToTop />

    </main>
  );
}
