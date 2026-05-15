"use client";

import React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { WorkMeta } from "@/lib/work";

const TABS = [
  { label: "All", test: (_: WorkMeta) => true },
  { label: "Shopify", test: (w: WorkMeta) => !!w.service && /shopify/i.test(w.service) },
  { label: "Custom", test: (w: WorkMeta) => !!w.service && /custom|e-commerce|ecommerce|merch/i.test(w.service) && !/shopify/i.test(w.service) },
  { label: "Brand", test: (w: WorkMeta) => !!w.service && /logo|brand|identity|portfolio/i.test(w.service) },
];

export function PastWork({ work }: { work: WorkMeta[] }) {
  const [tab, setTab] = useState(0);
  const filtered = work.filter(TABS[tab].test);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-[rgb(var(--line))]">
        {TABS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            className={`relative py-3 text-[12px] tracking-tight transition-colors duration-150 ${t.label === "Custom" ? "sm:px-5" : "px-5"}`}
            style={{
              color: tab === i ? "rgb(var(--fg))" : "rgb(var(--muted))",
              borderRight: i < TABS.length - 1 ? "1px solid rgb(var(--line))" : undefined,
              ...(t.label === "Custom" ? { paddingLeft: "0.9625rem", paddingRight: "0.9625rem" } : {}),
            }}
          >
            {t.label}
            {tab === i && (
              <span className="absolute inset-x-0 bottom-0 h-px bg-[rgb(var(--fg))]" />
            )}
          </button>
        ))}
      </div>
      <WorkGrid work={filtered} />
    </div>
  );
}

/* ── Work timeline ─────────────────────────────────────────────── */

function yearKey(year: string | undefined): string {
  if (!year) return "—";
  const m = year.match(/\d{4}/);
  return m ? m[0] : year;
}

function WorkGrid({ work }: { work: WorkMeta[] }) {
  const [active, setActive] = useState<WorkMeta | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const grouped = work.reduce<Record<string, WorkMeta[]>>((acc, w) => {
    const y = yearKey(w.year);
    (acc[y] ??= []).push(w);
    return acc;
  }, {});
  const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <div>
        {years.map((year) => (
          <div key={year} className="flex border-b border-[rgb(var(--line))]">
            {/* Year label */}
            <div className="w-14 sm:w-24 shrink-0 border-r border-[rgb(var(--line))] px-3 sm:px-5 pt-5 pb-4">
              <span className="text-[11px] sm:text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 tabular-nums">{year}</span>
            </div>
            {/* Entries */}
            <div className="flex flex-col flex-1 min-w-0">
              {grouped[year].map((w, i) => {
                const tag = serviceTag(w.service);
                const isHovered = hovered === w.slug;
                return (
                  <button
                    key={w.slug}
                    onClick={() => setActive(w)}
                    onMouseEnter={() => setHovered(w.slug)}
                    onMouseLeave={() => setHovered(null)}
                    className="group relative flex items-center justify-between gap-3 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5 text-left transition-colors duration-150 hover:bg-[rgb(var(--line))/0.1]"
                    style={{ borderTop: i > 0 ? "1px solid rgb(var(--line))" : undefined }}
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[19px] sm:text-[20px] tracking-tight text-[rgb(var(--fg))] leading-none truncate">{w.client}</span>
                      {tag && <span className="text-[12px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))] leading-none">{tag}</span>}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {w.cover && (
                        <div
                          className="overflow-hidden rounded-sm transition-all duration-200 hidden sm:block"
                          style={{ width: isHovered ? 112 : 0, height: 68, opacity: isHovered ? 1 : 0 }}
                        >
                          <img src={w.cover} alt="" className="w-full h-full object-cover" aria-hidden="true" />
                        </div>
                      )}
                      {/* Mobile: always-visible thumbnail */}
                      {w.cover && (
                        <div className="sm:hidden w-16 h-12 overflow-hidden rounded-sm shrink-0">
                          <img src={w.cover} alt="" className="w-full h-full object-cover" aria-hidden="true" />
                        </div>
                      )}
                      <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 border border-[rgb(var(--line))] rounded-full text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] group-hover:border-[rgb(var(--fg)/0.3)] transition-colors text-[11px] leading-none shrink-0">→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {active && <WorkSheet item={active} onClose={() => setActive(null)} />}
    </>
  );
}

function titleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function serviceTag(service: string | undefined): string {
  if (!service) return "";
  const stripped = service
    .replace(/^An?\s+/i, "")
    .replace(/\s+for\s+.+$/i, "")
    .trim();
  return titleCase(stripped);
}

function cleanSummary(text: string): string {
  return text.replace(/—/g, ",").replace(/\s*,\s*/g, ", ").replace(/,\s*,/g, ",");
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

        {/* Hero — full bleed */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={displayImages[0]} alt={item.client} className="sheet__hero" />

        {/* Content — fades in once sheet settles */}
        <div className={`sheet__content ${revealed ? "sheet__content--revealed" : ""}`}>

          {/* Header row: client name + actions */}
          <div className="sheet__header">
            <div className="sheet__header-left">
              <span className="sheet__client">{item.client}</span>
              {item.year && <span className="sheet__year">{item.year}</span>}
            </div>
            <div className="sheet__header-actions">
              {item.instagram && (
                <a href={`https://instagram.com/${item.instagram}`} target="_blank" rel="noreferrer" className="sheet__ig-btn" aria-label={`@${item.instagram} on Instagram`}>
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

          {/* Divider */}
          <div className="sheet__rule" />

          {/* Summary — big editorial statement */}
          {item.summary && (
            <p className="sheet__summary" dangerouslySetInnerHTML={{ __html: highlightSummary(item.summary) }} />
          )}

          {/* Colour palette */}
          {item.palette && item.palette.length > 0 && (
            <SwatchRow colors={item.palette} />
          )}

          {/* Preview */}
          {item.preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.preview} alt={`${item.client} site`} className="sheet__preview" />
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

          {/* Service + role footer line */}
          {(item.service || item.role) && (
            <div className="sheet__service-row">
              {item.service && <span className="sheet__service-tag">{serviceTag(item.service)}</span>}
              {item.role && <span className="sheet__role">{item.role}</span>}
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
