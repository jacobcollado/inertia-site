"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { WorkMeta } from "@/lib/work";

function serviceShort(s: string | undefined): string {
  if (!s) return "";
  return s.trim();
}

function slugAnchor(slug: string) {
  return `project-${slug}`;
}

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

export default function WorkIndexPage() {
  const [work, setWork] = useState<WorkMeta[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/content").then(r => r.json()).then(d => {
      const sorted = (d.work ?? []).sort((a: WorkMeta, b: WorkMeta) => (a.order ?? 99) - (b.order ?? 99));
      setWork(sorted);
    });
  }, []);

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
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-4xl min-h-screen flex flex-col pb-20 pt-10">

      <div className="sm:grid sm:grid-cols-[140px_1fr] sm:gap-12">

        {/* Left rail — desktop only */}
        <div className="hidden sm:block">
          <div className="sticky top-24 flex flex-col gap-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
              style={{ opacity: 0.75 }}
            >
              <HandDrawnArrow />
              Index
            </Link>

            {work.length > 0 && (
              <nav className="flex flex-col gap-2.5" aria-label="Projects">
                {work.map((w) => {
                  const active = activeSlug === w.slug;
                  return (
                    <a
                      key={w.slug}
                      href={`#${slugAnchor(w.slug)}`}
                      className="text-[13px] tracking-tight transition-colors"
                      style={{
                        color: active ? "rgb(var(--fg))" : "rgb(var(--muted))",
                        opacity: active ? 1 : 0.75,
                        fontWeight: active ? 500 : 400,
                      }}
                    >
                      {w.client}
                    </a>
                  );
                })}
              </nav>
            )}
          </div>
        </div>

        {/* Mobile back link */}
        <div className="px-3 mb-14 sm:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
            style={{ opacity: 0.5 }}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
              <path d="M13 8H3M7 4L3 8l4 4" />
            </svg>
            Index
          </Link>
        </div>

        {/* Project list */}
        <div className="flex flex-col gap-20 px-3 sm:px-0">
          {work.length > 0 ? work.map((w) => {
            const allImages = [
              ...(w.cover ? [w.cover] : []),
              ...(w.preview ? [w.preview] : []),
              ...(w.images ?? []),
            ];

            return (
              <div key={w.slug} id={slugAnchor(w.slug)} className="flex flex-col gap-5 scroll-mt-24">

                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[18px] font-medium tracking-tight text-[rgb(var(--fg))]">{w.client}</span>
                    {w.service && (
                      <span className="text-[16px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
                        {serviceShort(w.service)}
                      </span>
                    )}
                  </div>
                  {w.year && (
                    <span className="text-[15px] tabular-nums tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.35 }}>
                      {w.year.match(/\d{4}/)?.[0]}
                    </span>
                  )}
                </div>

                {/* Stacked images */}
                <div className="flex flex-col gap-3">
                  {allImages.map((src, i) => (
                    <div key={i} className="w-full overflow-hidden rounded-xl bg-[rgb(var(--surface))]">
                      <img
                        src={src}
                        alt={`${w.client} ${i + 1}`}
                        className="w-full h-auto block"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>

              </div>
            );
          }) : (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col gap-5">
                <div className="h-5 w-40 rounded bg-[rgb(var(--surface))] animate-pulse" />
                <div className="w-full rounded-xl bg-[rgb(var(--surface))] animate-pulse" style={{ aspectRatio: "16/9" }} />
              </div>
            ))
          )}

          {work.length > 0 && (
            <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.75 }}>
              And 950+ others. We just chose these to showcase.
            </p>
          )}
        </div>

      </div>

      <FloatingBackToTop />

    </main>
  );
}
