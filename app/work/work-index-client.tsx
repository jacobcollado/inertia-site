"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { WorkMeta, SizedImage } from "@/lib/work";

type WorkMetaWithGallery = WorkMeta & { gallery: SizedImage[] };

function serviceShort(s: string | undefined): string {
  if (!s) return "";
  return s.trim();
}

function slugAnchor(slug: string) {
  return `project-${slug}`;
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

// A loosely sketched back-arrow, as if drawn quickly by hand rather than a
// precise geometric icon.
function HandDrawnArrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
      <path d="M13.2 8.4 C 9.8 8.7, 5.6 7.9, 2.7 8.2" />
      <path d="M6.8 4.3 C 5.3 5.6, 3.6 6.7, 2.6 8.1 C 3.8 9.3, 5.5 10.4, 6.9 11.6" />
    </svg>
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

export default function WorkIndexPage({ initialWork }: { initialWork: WorkMetaWithGallery[] }) {
  const [work] = useState<WorkMetaWithGallery[]>(initialWork);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    if (work.length === 0) return;
    const sections = work
      .map((w) => document.getElementById(slugAnchor(w.slug)))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        const slug = topMost.target.id.replace(/^project-/, "");
        setActiveSlug(slug);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [work]);

  return (
    <main className="mx-auto w-full pt-10 pb-24 px-6 sm:px-8" style={{ maxWidth: "52rem" }}>

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors mb-8"
        style={{ opacity: 0.75 }}
      >
        <HandDrawnArrow />
        Index
      </Link>

      {/* TOC */}
      <div className="mb-10 p-6 rounded-xl bg-[rgb(var(--surface))]">
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-60 mb-4">Contents</p>
        <nav className="flex flex-col gap-1.5" aria-label="Projects">
          {work.map((w) => {
            const active = activeSlug === w.slug;
            return (
              <a
                key={w.slug}
                href={`#${slugAnchor(w.slug)}`}
                className="text-[16px] tracking-tight transition-colors py-0.5"
                style={{
                  color: active ? "rgb(var(--fg))" : "rgb(var(--muted))",
                  fontWeight: active ? 500 : 400,
                }}
              >
                {w.client}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Project list */}
      <div className="flex flex-col gap-20">
        {work.map((w) => {
          const override = WORK_LINKS[w.slug];
          const url = override?.url;
          const status = override?.status;
          const year = override?.year ?? w.year;
          const yearLabel = override?.yearLabel ?? year?.match(/\d{4}/)?.[0];

          return (
            <div key={w.slug} id={slugAnchor(w.slug)} className="flex flex-col gap-5 scroll-mt-24">

              {/* Header */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[18px] font-medium tracking-tight text-[rgb(var(--fg))] hover:opacity-70 transition-opacity underline underline-offset-4 decoration-[rgb(var(--line))] hover:decoration-[rgb(var(--fg))]"
                    >
                      {w.client}
                    </a>
                  ) : (
                    <span className="text-[18px] font-medium tracking-tight text-[rgb(var(--fg))]">{w.client}</span>
                  )}
                  {w.service && (
                    <span className="text-[16px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
                      {serviceShort(w.service)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(status || yearLabel) && (
                    <span className="text-[11px] tabular-nums tracking-tight rounded-full px-2.5 pt-[3px] pb-[4px] leading-none" style={{ background: "rgb(var(--surface))", color: "rgb(var(--fg))" }}>
                      {status && yearLabel ? `${status} - ${yearLabel}` : status || yearLabel}
                    </span>
                  )}
                </div>
              </div>

              {/* Stacked images — aspect-ratio reserved from server-read
                  dimensions so each block holds its final height before the
                  image itself has loaded. Without this, unsized images
                  collapse to 0px and everything below shifts into place as
                  they load, which threw off #project-slug scroll targets. */}
              <div className="flex flex-col gap-3">
                {w.gallery.map((img, i) => (
                  <div
                    key={i}
                    className="w-full overflow-hidden rounded-xl bg-[rgb(var(--surface))]"
                    style={{ aspectRatio: `${img.width} / ${img.height}` }}
                  >
                    <img
                      src={img.src}
                      alt={`${w.client} ${i + 1}`}
                      width={img.width}
                      height={img.height}
                      className="w-full h-auto block"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

            </div>
          );
        })}

        <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.75 }}>
          And 950+ others. We just chose these to showcase.
        </p>
      </div>

      <FloatingBackToTop />

    </main>
  );
}
