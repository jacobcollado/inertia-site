"use client";

import React from "react";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { WorkMeta } from "@/lib/work";

export function PastWork({ work }: { work: WorkMeta[] }) {
  return <WorkGrid work={work} />;
}

/* ── Work grid ────────────────────────────────────────────────── */


function WorkGrid({ work }: { work: WorkMeta[] }) {
  const [active, setActive] = useState<WorkMeta | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const dragMoved = useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragMoved.current = false;
    startX.current = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    scrollLeft.current = trackRef.current?.scrollLeft ?? 0;
    e.preventDefault();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > 4) dragMoved.current = true;
    trackRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const onMouseUp = () => { isDragging.current = false; };

  useEffect(() => {
    const onGlobalUp = () => { isDragging.current = false; };
    window.addEventListener("mouseup", onGlobalUp);
    return () => window.removeEventListener("mouseup", onGlobalUp);
  }, []);

  return (
    <>
      <div className="relative">
        <div
          ref={trackRef}
          className="flex overflow-x-auto gap-0 select-none"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", cursor: "grab" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {work.map((w, i) => (
            <div key={w.slug} className="shrink-0 w-[80vw] sm:w-[33.333%] border-r border-[rgb(var(--line))]">
              <WorkCard item={w} index={i} total={work.length} onOpen={() => { if (!dragMoved.current) setActive(w); }} />
            </div>
          ))}
        </div>
      </div>
      {/* Drag indicator */}
      <div className="flex items-center gap-2 px-6 py-3 border-t border-[rgb(var(--line))]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 shrink-0" style={{ color: "rgb(var(--muted))", opacity: 0.4 }}>
          <path d="M5 12h14M15 7l5 5-5 5" />
        </svg>
        <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40">Drag to explore</span>
      </div>
      {active && <WorkSheet item={active} onClose={() => setActive(null)} />}
    </>
  );
}

function LogoImage({ slug, alt }: { slug: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-40 font-medium">{alt}</span>
    );
  }
  const invertCls = logoInvertClass(slug);
  return (
    <Image
      src={`/work/logos/${slug}.png`}
      alt={alt}
      fill={false}
      width={160}
      height={80}
      onError={() => setErrored(true)}
      className={`object-contain w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]${invertCls ? ` ${invertCls}` : ""}`}
    />
  );
}

const LOGO_SIZE: Record<string, string> = {
  "ellora-la": "w-[60%]",
};

const CARD_MIN_H: Record<string, string> = {};


// "dark-on-light" = dark logo, needs dark:invert (default)
// "light-on-dark" = white logo, needs invert in light mode
// "color"         = preserve as-is
type LogoInvert = "dark-on-light" | "light-on-dark" | "color";

const LOGO_INVERT: Record<string, LogoInvert> = {
  "ellora-la":   "light-on-dark",
  "trippie-redd": "color",
  "ft-gioo":      "color",
};

function logoInvertClass(slug: string): string {
  const mode = LOGO_INVERT[slug] ?? "dark-on-light";
  if (mode === "color")        return "";
  if (mode === "light-on-dark") return "invert dark:invert-0";
  return "dark:invert"; // dark-on-light default
}

function WorkCard({ item, index, total, onOpen }: { item: WorkMeta; index: number; total: number; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group relative flex flex-col text-left overflow-hidden w-full h-full rise"
      style={{ ["--rise-delay" as any]: `${index * 60}ms` }}
    >
      {/* Logo area */}
      <div className={`relative w-full ${CARD_MIN_H[item.slug] ?? "min-h-[220px]"} flex items-center justify-center overflow-hidden`}>
        <div className={`relative ${LOGO_SIZE[item.slug] ?? "w-[50%]"} h-16 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]`}>
          <LogoImage slug={item.slug} alt={item.client} />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[rgb(var(--line))]" />

      {/* Info */}
      <div className="flex items-center justify-between gap-2 px-5 py-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[18px] sm:text-[22px] font-medium tracking-tight text-[rgb(var(--fg))] leading-none">{item.client}</span>
          {item.role && <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] mt-0.5">{item.role}</span>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {item.year && <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-40">{item.year}</span>}
          <span className="flex items-center justify-center w-6 h-6 rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] text-[11px] opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0">
            →
          </span>
        </div>
      </div>
    </button>
  );
}



/* ── Highlight key phrases in plain text ─────────────────────── */

const HIGHLIGHT_TERMS = [
  "under 24 hours", "24 hours", "midnight", "no templates",
  "immersive", "editorial", "pixel-close", "custom animations", "product configurator",
  "bespoke", "mobile experience", "seamless",
  "wordmark", "colour system", "visual identity",
  "sold-out", "sold out", "headless Shopify", "Next.js",
  "72-hour", "mobile-first",
];

function highlightSummary(text: string): string {
  let out = text;
  for (const term of HIGHLIGHT_TERMS) {
    const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    out = out.replace(re, "<strong>$1</strong>");
  }
  return out;
}

/* ── Swatch row ───────────────────────────────────────────────── */

function SwatchRow({ colors }: { colors: string[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const copy = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(hex);
      setTimeout(() => setCopied(null), 1400);
    });
  }, []);

  return (
    <div className="sheet__palette">
      {colors.map((color) => (
        <button
          key={color}
          className="sheet__swatch"
          style={{ background: color }}
          onClick={() => copy(color)}
          onMouseEnter={() => setHovered(color)}
          onMouseLeave={() => setHovered(null)}
          title={color}
          aria-label={`Copy ${color}`}
        >
          <span className="sheet__swatch-label">
            {copied === color ? "copied" : hovered === color ? color : ""}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ── Work sheet ───────────────────────────────────────────────── */

// PEEK_PX: how much of the sheet is visible when first opened.
const PEEK_PX = 600;
const CLOSE_THRESHOLD = 200;

function WorkSheet({ item, onClose }: { item: WorkMeta; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  // targetY is where we want to be; currentY is where we are (for spring)
  const targetY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const touchLastY = useRef<number>(0);
  const touchVelocity = useRef<number>(0);
  const touchLastTime = useRef<number>(0);
  // Whether the current touch gesture is driving the sheet (vs. scrolling content inside)
  const touchDrivingSheet = useRef<boolean>(false);

  const gallery = [
    ...(item.cover ? [item.cover] : []),
    ...(item.images ?? []).filter((src) => src !== item.cover),
  ];
  const displayImages = gallery;

  const getSheetHeight = () => sheetRef.current?.offsetHeight ?? window.innerHeight;
  const getMaxY = () => getSheetHeight() - PEEK_PX;

  const applyY = (y: number) => {
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${y}px)`;
    currentY.current = y;
  };

  // Spring loop — smoothly interpolates currentY toward targetY
  const runSpring = () => {
    cancelAnimationFrame(rafRef.current);
    const tick = () => {
      const diff = targetY.current - currentY.current;
      if (Math.abs(diff) < 0.15) {
        applyY(targetY.current);
        return;
      }
      applyY(currentY.current + diff * 0.2);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = sheetRef.current;
    if (!el) return;
    const bodyOverflow = document.body.style.overflow;
    const bodyTouchAction = document.body.style.touchAction;
    const htmlOverflow = document.documentElement.style.overflow;

    const maxY = getMaxY();
    // Start below screen, spring up to peek position
    currentY.current = getSheetHeight();
    applyY(currentY.current);
    targetY.current = maxY;
    runSpring();
    setTimeout(() => setRevealed(true), 220);

    // Lock Lenis so page doesn't scroll while sheet is open
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    window.dispatchEvent(new Event("lenis:lock"));

    // Wheel drives the sheet — scroll down = sheet moves up (deltaY positive = move up)
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = Math.max(0, Math.min(getMaxY(), targetY.current - e.deltaY));
      targetY.current = next;
      runSpring();
    };

    const sheetEl = el;
    let gestureStartY = 0;
    let gestureStartX = 0;
    let gestureDecided = false;

    const onTouchStart = (e: TouchEvent) => {
      gestureStartY = e.touches[0].clientY;
      gestureStartX = e.touches[0].clientX;
      touchLastY.current = gestureStartY;
      touchLastTime.current = e.timeStamp;
      touchVelocity.current = 0;
      touchDrivingSheet.current = false;
      gestureDecided = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      const now = e.timeStamp;
      const dt = now - touchLastTime.current || 1;
      const clientY = e.touches[0].clientY;
      const dy = clientY - touchLastY.current;
      touchVelocity.current = dy / dt;
      touchLastY.current = clientY;
      touchLastTime.current = now;

      // Decide gesture intent once we have enough movement
      if (!gestureDecided) {
        const totalY = clientY - gestureStartY;
        const totalX = e.touches[0].clientX - gestureStartX;
        if (Math.abs(totalY) < 6 && Math.abs(totalX) < 6) return; // deadzone
        gestureDecided = true;
        const vertical = Math.abs(totalY) > Math.abs(totalX);
        touchDrivingSheet.current = vertical;
      }

      if (!touchDrivingSheet.current) return;
      e.preventDefault();
      const next = Math.max(0, Math.min(getMaxY(), targetY.current + dy));
      targetY.current = next;
      runSpring();
    };

    const onTouchEnd = () => {
      if (!touchDrivingSheet.current) return;
      touchDrivingSheet.current = false;
      gestureDecided = false;
      if (touchVelocity.current > 0.3 || targetY.current > getMaxY() - CLOSE_THRESHOLD) {
        handleClose();
      } else {
        targetY.current = targetY.current < getMaxY() * 0.5 ? 0 : getMaxY();
        runSpring();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    sheetEl.addEventListener("touchstart", onTouchStart, { passive: true });
    sheetEl.addEventListener("touchmove", onTouchMove, { passive: false });
    sheetEl.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      document.body.style.touchAction = bodyTouchAction;
      window.dispatchEvent(new Event("lenis:unlock"));
      window.removeEventListener("wheel", onWheel);
      sheetEl.removeEventListener("touchstart", onTouchStart);
      sheetEl.removeEventListener("touchmove", onTouchMove);
      sheetEl.removeEventListener("touchend", onTouchEnd);
    };
  }, [mounted]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const handleClose = () => {
    cancelAnimationFrame(rafRef.current);
    const el = sheetRef.current;
    if (el) {
      // Snap currentY to wherever the element actually is, then animate out from there
      const current = currentY.current;
      el.style.transition = "none";
      el.style.transform = `translateY(${current}px)`;
      requestAnimationFrame(() => {
        if (!el) return;
        el.style.transition = "transform 480ms cubic-bezier(0.4, 0, 1, 1)";
        el.style.transform = `translateY(${getSheetHeight()}px)`;
      });
    }
    setTimeout(onClose, 500);
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="sheet-backdrop"
      data-visible="true"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
      aria-label={item.client}
    >
      <div
        ref={sheetRef}
        className="sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bars that extend outside the viewport to prevent bg bleed */}
        <div className="sheet__overflow-bar sheet__overflow-bar--top" aria-hidden="true" />
        <div className="sheet__overflow-bar sheet__overflow-bar--bottom" aria-hidden="true" />

        {/* Hero — full bleed poster */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={displayImages[0]} alt={item.client} className="sheet__hero" />

        {/* Content — fades in once sheet settles */}
        <div className={`sheet__content ${revealed ? "sheet__content--revealed" : ""}`}>
          {/* Summary */}
          <div className="sheet__body">
            <div className="sheet__meta">
              <span className="sheet__meta-client">{item.client}</span>
              {item.service && <span className="sheet__meta-service">{item.service}</span>}
            </div>
            {item.summary && (
              <p className="sheet__summary" dangerouslySetInnerHTML={{ __html: highlightSummary(item.summary) }} />
            )}
          </div>

          {/* Preview — full bleed outside body padding */}
          {item.preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.preview} alt={`${item.client} site`} className="sheet__preview" />
          )}

          {/* Colour palette */}
          {item.palette && item.palette.length > 0 && (
            <SwatchRow colors={item.palette} />
          )}

          {/* Remaining images */}
          {displayImages.slice(1).length > 0 && (
            <div className="sheet__body">
              {displayImages.slice(1).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`img-${i}`} src={src} alt={`${item.client} ${i + 2}`} className="sheet__img" />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="sheet__footer">
            <div className="sheet__footer-left">
              <span className="sheet__footer-title">{item.service ?? item.client}</span>
              {(item.year || item.role) && (
                <span className="sheet__footer-sub">
                  {[item.year, item.role].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
            <div className="sheet__footer-actions">
              {item.instagram && (
                <a
                  href={`https://instagram.com/${item.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="sheet__ig-btn"
                  aria-label={`@${item.instagram} on Instagram`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
              )}
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" className="sheet__url-btn">
                  Visit site
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
