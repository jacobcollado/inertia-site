"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { WorkMeta } from "@/lib/work";
import { useViewMode } from "./view-mode-context";

const PAGE_SIZE = 4;

export function PastWork({ work }: { work: WorkMeta[] }) {
  const { mode } = useViewMode();
  const [active, setActive] = useState<WorkMeta | null>(null);

  if (mode === "visual") {
    return (
      <>
        <MasonryGrid work={work} onOpen={setActive} />
        {active && <WorkSheet item={active} onClose={() => setActive(null)} />}
      </>
    );
  }
  return <TextList work={work} />;
}

/* ── Text list ────────────────────────────────────────────────── */

function TextList({ work }: { work: WorkMeta[] }) {
  const [page, setPage] = useState(0);
  const [entering, setEntering] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pageCount = Math.max(1, Math.ceil(work.length / PAGE_SIZE));
  const visible = work.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const go = (next: number) => {
    if (next === page || next < 0 || next >= pageCount) return;
    setEntering(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setPage(next);
      requestAnimationFrame(() => setEntering(false));
    }, 260);
  };

  return (
    <div>
      <div
        aria-live="polite"
        style={{
          opacity: entering ? 0 : 1,
          filter: entering ? "blur(4px)" : "blur(0)",
          transform: entering ? "translateY(4px)" : "translateY(0)",
          transition: "opacity 260ms cubic-bezier(0.22, 1, 0.36, 1), filter 260ms cubic-bezier(0.22, 1, 0.36, 1), transform 260ms cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "opacity, filter, transform",
        }}
      >
        <ul className="space-y-4">
          {visible.map((w) => (
            <li key={w.slug}>
              <Link href={`/work/${w.slug}`} className="group flex items-baseline justify-between gap-6">
                <span className="fluid-link tracking-tight text-[rgb(var(--fg))]">
                  <span className="fluid-link__text">{w.client}</span>
                </span>
                <span className="text-base tracking-tight text-[rgb(var(--muted))] text-right">{w.role || ""}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {pageCount > 1 && (
        <div className="mt-7 flex items-center justify-between border-t border-[rgb(var(--line))] pt-4">
          <div className="flex items-baseline gap-1.5 text-[rgb(var(--muted))] tabular-nums">
            <span key={page} className="text-base tracking-tight text-[rgb(var(--fg))] inline-block" style={{ animation: "counter-in 400ms cubic-bezier(0.22, 1, 0.36, 1)" }}>
              {String(page + 1).padStart(2, "0")}
            </span>
            <span className="text-sm tracking-tight">/</span>
            <span className="text-sm tracking-tight">{String(pageCount).padStart(2, "0")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => go(page - 1)} disabled={page === 0} aria-label="Previous page" className="pager-btn group inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line))] pl-3 pr-4 h-9 text-sm tracking-tight text-[rgb(var(--muted))] hover:border-[rgb(var(--fg))] hover:text-[rgb(var(--fg))] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--fg))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] transition-colors duration-300 [-webkit-tap-highlight-color:transparent]">
              <span className="pager-btn__arrow pager-btn__arrow--left inline-flex">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
              </span>
              prev
            </button>
            <button onClick={() => go(page + 1)} disabled={page === pageCount - 1} aria-label="Next page" className="pager-btn group inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line))] pl-4 pr-3 h-9 text-sm tracking-tight text-[rgb(var(--muted))] hover:border-[rgb(var(--fg))] hover:text-[rgb(var(--fg))] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--fg))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] transition-colors duration-300 [-webkit-tap-highlight-color:transparent]">
              next
              <span className="pager-btn__arrow pager-btn__arrow--right inline-flex">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Masonry grid ─────────────────────────────────────────────── */

const ASPECT_CYCLE = ["aspect-[4/5]", "aspect-[3/4]", "aspect-[1/1]", "aspect-[4/3]", "aspect-[3/4]"];

function MasonryGrid({ work, onOpen }: { work: WorkMeta[]; onOpen: (w: WorkMeta) => void }) {
  return (
    <div className="masonry-grid">
      {work.map((w, i) => (
        <div
          key={w.slug}
          role="button"
          tabIndex={0}
          onClick={() => onOpen(w)}
          onKeyDown={(e) => e.key === "Enter" && onOpen(w)}
          className="masonry-card"
        >
          <div className={`masonry-card__img-wrap ${ASPECT_CYCLE[i % ASPECT_CYCLE.length]}`}>
            {w.cover ? (
              <Image src={w.cover} alt={w.client} fill sizes="(min-width: 768px) 33vw, 50vw" className="masonry-card__img" />
            ) : (
              <div className="masonry-card__placeholder" />
            )}
          </div>
          <div className="masonry-card__info">
            <span className="masonry-card__client">{w.client}</span>
            {w.role && <span className="masonry-card__role">{w.role}</span>}
          </div>
        </div>
      ))}
    </div>
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
      if (Math.abs(diff) < 0.1) {
        applyY(targetY.current);
        return;
      }
      applyY(currentY.current + diff * 0.12);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = sheetRef.current;
    if (!el) return;

    const maxY = getMaxY();
    // Start below screen, spring up to peek position
    currentY.current = getSheetHeight();
    applyY(currentY.current);
    targetY.current = maxY;
    runSpring();
    setTimeout(() => setRevealed(true), 400);

    // Lock Lenis so page doesn't scroll while sheet is open
    window.dispatchEvent(new Event("lenis:lock"));

    // Wheel drives the sheet — scroll down = sheet moves up (deltaY positive = move up)
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = Math.max(0, Math.min(getMaxY(), targetY.current - e.deltaY));
      targetY.current = next;
      runSpring();
    };

    // Touch drives the sheet — drag up = sheet moves up
    const onTouchStart = (e: TouchEvent) => {
      touchLastY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const delta = touchLastY.current - e.touches[0].clientY; // positive = dragging up
      touchLastY.current = e.touches[0].clientY;
      const next = Math.max(0, Math.min(getMaxY(), targetY.current - delta));
      targetY.current = next;
      runSpring();
    };
    const onTouchEnd = () => {
      if (currentY.current > getSheetHeight() - CLOSE_THRESHOLD) handleClose();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.dispatchEvent(new Event("lenis:unlock"));
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
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
