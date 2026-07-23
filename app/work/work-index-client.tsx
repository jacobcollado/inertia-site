"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import type { WorkMeta, SizedImage } from "@/lib/work";

type WorkMetaWithGallery = WorkMeta & { gallery: SizedImage[] };

function serviceShort(s: string | undefined): string {
  if (!s) return "";
  return s.trim();
}

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

// Card logos are forced white for legibility on any photo; these keep their
// own multi-color artwork instead (same exception the homepage carousel makes).
const CARD_LOGO_NATURAL_COLOR = new Set(["ft-gioo"]);

// Per-project overlaid card logo tweaks. `hide` drops the logo entirely;
// `height` overrides the shared default (64px, or 66px for natural-color
// logos) since logos come in very different natural proportions. `maxW` raises
// the shared 62% width cap for wide wordmarks that would otherwise hit it
// before reaching their target height.
const CARD_LOGO_OVERRIDE: Record<string, { hide?: boolean; height?: number; maxW?: string }> = {
  "aether": { hide: true },
  "ellora-la": { height: 44 },
  "trippie-redd": { height: 74 },
  "ft-gioo": { height: 104 },
  "subtle-goods": { height: 150, maxW: "92%" },
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
              <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] border border-[rgb(var(--line))] rounded-full px-2.5 pt-[3px] pb-[4px] leading-none">
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
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mt-6 text-[13px] font-medium tracking-tight text-[rgb(var(--bg))] hover:opacity-85 transition-opacity"
              style={{ background: "var(--accent-gradient)" }}
            >
              Visit site
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                <path d="M4 12L12 4M7 4h5v5" />
              </svg>
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
}: {
  work: WorkMetaWithGallery;
  onOpen: () => void;
  // Spans both grid columns on desktop and uses a landscape aspect, so a
  // wide/landscape thumbnail (e.g. FT.GIOO) isn't cropped down into a square.
  wide?: boolean;
}) {
  const thumb = work.card ?? work.gallery[0]?.src;
  // Per-project crop nudge. Thumbnails default to object-top; these sit lower
  // in frame, so shifting object-position down reveals more of their lower
  // portion.
  const objectPosition = THUMB_OBJECT_POSITION[work.slug] ?? "center top";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group flex flex-col gap-3 text-left${wide ? " sm:col-span-2" : ""}`}
      aria-label={`Open ${work.client}`}
    >
      <div
        className="work-card-thumb relative w-full overflow-hidden rounded-xl bg-[rgb(var(--surface))]"
        style={{ aspectRatio: wide ? "16 / 9" : "4 / 3" }}
      >
        {thumb ? (
          <Image
            src={thumb}
            alt={work.client}
            fill
            sizes={wide ? "(max-width: 640px) 100vw, 1024px" : "(max-width: 640px) 100vw, 512px"}
            quality={78}
            className="object-cover"
            style={{ objectPosition }}
            draggable={false}
          />
        ) : null}
        {/* Logo overlaid on the thumbnail, centered. Forced white (like the
            homepage carousel) so it reads against any photo, with a soft scrim
            behind it; a couple of logos keep their natural multi-color art. */}
        {work.logo && !CARD_LOGO_OVERRIDE[work.slug]?.hide && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)" }}
          >
            <Image
              src={work.logo}
              alt=""
              aria-hidden="true"
              draggable={false}
              width={260}
              height={260}
              sizes="260px"
              quality={78}
              className="w-auto object-contain"
              style={{
                maxWidth: CARD_LOGO_OVERRIDE[work.slug]?.maxW ?? "62%",
                width: "auto",
                height: CARD_LOGO_OVERRIDE[work.slug]?.height ?? (CARD_LOGO_NATURAL_COLOR.has(work.slug) ? 66 : 64),
                filter: CARD_LOGO_NATURAL_COLOR.has(work.slug)
                  ? "drop-shadow(0 1px 6px rgba(0,0,0,0.45))"
                  : "brightness(0) invert(1) drop-shadow(0 1px 6px rgba(0,0,0,0.5))",
              }}
            />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
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
// works); only the pill text is shortened.
const FILTER_LABEL: Record<string, string> = {
  "Shopify storefront": "Storefront",
  "Shopify theme": "Theme",
  "Web development": "Web dev",
  "UI/UX design": "UI/UX",
};

export default function WorkIndexPage({ initialWork }: { initialWork: WorkMetaWithGallery[] }) {
  const [work] = useState<WorkMetaWithGallery[]>(initialWork);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>(ALL_FILTER);

  const close = useCallback(() => setOpenSlug(null), []);
  const openWork = openSlug ? work.find((w) => w.slug === openSlug) ?? null : null;

  // Distinct services, in the order they first appear, with an "All" option
  // up front. Derived from the data so the pills stay in sync with content.
  const filters = [
    ALL_FILTER,
    ...work.reduce<string[]>((acc, w) => {
      const s = serviceShort(w.service);
      if (s && !acc.includes(s)) acc.push(s);
      return acc;
    }, []),
  ];

  const visibleWork = filter === ALL_FILTER
    ? work
    : work.filter((w) => serviceShort(w.service) === filter);

  return (
    <main className="mx-auto w-full pt-10 pb-24 px-6 sm:px-8" style={{ maxWidth: "64rem" }}>

      {/* Service filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {filters.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="text-[13px] tracking-tight rounded-full px-3.5 pt-[5px] pb-[6px] leading-none border transition-colors duration-200"
              style={{
                background: active ? "rgb(var(--fg))" : "rgb(var(--surface))",
                color: active ? "rgb(var(--bg))" : "rgb(var(--muted))",
                borderColor: active ? "rgb(var(--fg))" : "transparent",
              }}
              aria-pressed={active}
            >
              {FILTER_LABEL[f] ?? f}
            </button>
          );
        })}
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
        {visibleWork.map((w) => (
          <WorkCard key={w.slug} work={w} onOpen={() => setOpenSlug(w.slug)} wide={w.slug === "ft-gioo"} />
        ))}
      </div>

      <WorkDialog work={openWork} onClose={close} />
      <FloatingBackToTop />

    </main>
  );
}
