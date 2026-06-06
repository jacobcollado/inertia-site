"use client";

import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/lib/posts";
import { GlassFilterDef, GLASS_FILTER_ID } from "@/components/ui/glass-card";

export function TOC({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const [entered, setEntered] = useState(false);
  const bodyRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: [0, 1] }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => {
    setHeight(open ? (bodyRef.current?.scrollHeight ?? 0) : 0);
  }, [open]);

  if (headings.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    setOpen(false);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  const activeHeading = headings.find((h) => h.id === activeId) ?? headings[0];
  const activeIndex = headings.findIndex((h) => h.id === activeId);
  const progress = headings.length > 1 ? Math.max(0, activeIndex) / (headings.length - 1) : 0;


  // Desktop TOC — sticky in left grid column
  const desktopAside = (
    <nav
      aria-label="Table of contents"
      className="hidden xl:flex sticky top-28 self-start flex-col items-end"
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? "translateX(0)" : "translateX(-8px)",
        transition: "opacity 500ms cubic-bezier(0.22,1,0.36,1) 100ms, transform 600ms cubic-bezier(0.22,1,0.36,1) 100ms",
        maxWidth: "200px",
        marginLeft: "auto",
        paddingRight: "48px",
      }}
    >
      <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40 mb-4 w-full text-left">
        On this page
      </p>
      <ul className="flex flex-col w-full">
        {headings.map((h, i) => {
          const active = activeId === h.id;
          const delay = 80 + i * 40;
          const isH3 = h.level === 3;
          return (
            <li
              key={h.id}
              style={{
                opacity: entered ? 1 : 0,
                transform: entered ? "translateX(0)" : "translateX(-6px)",
                transition: `opacity 400ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 500ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
              }}
            >
              <a
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
                className="group relative flex items-start py-2 transition-colors duration-200"
                style={{ paddingLeft: isH3 ? "16px" : "0px" }}
              >
                {isH3 && (
                  <span className="absolute left-0 top-[13px] w-px h-3 bg-[rgb(var(--line))] opacity-50" />
                )}
                <span
                  className={`text-[13px] leading-snug tracking-tight transition-all duration-200 ${
                    active
                      ? "text-[rgb(var(--fg))] opacity-100"
                      : "text-[rgb(var(--muted))] opacity-50 group-hover:opacity-80 group-hover:text-[rgb(var(--fg))]"
                  }`}
                  style={{ fontWeight: active ? 500 : 400 }}
                >
                  {h.text}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  // Mobile floating pill + bottom sheet
  const mobilePill = (
    <div className="xl:hidden">
      {/* Floating pill */}
      <GlassFilterDef />
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Table of contents"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 rounded-full px-4 py-2.5 [-webkit-tap-highlight-color:transparent] focus:outline-none"
        style={{
          backdropFilter: `url(#${GLASS_FILTER_ID}) blur(14px)`,
          WebkitBackdropFilter: `url(#${GLASS_FILTER_ID}) blur(14px)`,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3.5 h-3.5 text-[rgb(var(--muted))]" aria-hidden="true">
          <line x1="2" y1="4" x2="14" y2="4" /><line x1="2" y1="8" x2="10" y2="8" /><line x1="2" y1="12" x2="12" y2="12" />
        </svg>
        <span className="text-[13px] tracking-tight text-[rgb(var(--fg))] max-w-[180px] truncate" style={{ opacity: 0.8 }}>
          {activeHeading?.text ?? "On this page"}
        </span>
        <div className="w-8 h-px rounded-full bg-[rgb(var(--line))] overflow-hidden ml-1">
          <div className="h-full transition-all duration-500" style={{ width: `${progress * 100}%`, background: "var(--accent-gradient)" }} />
        </div>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          style={{ backdropFilter: "blur(2px)" }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Bottom sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl overflow-hidden"
        style={{
          background: "rgb(var(--surface))",
          border: "1px solid rgb(var(--line))",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 380ms cubic-bezier(0.22,1,0.36,1)",
          maxHeight: "70vh",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[rgb(var(--line))]" style={{ opacity: 0.4 }} />
        </div>
        <div className="px-5 pb-2 flex items-center justify-between">
          <span className="text-[12px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.45 }}>On this page</span>
          <button onClick={() => setOpen(false)} className="p-1 text-[rgb(var(--muted))]" style={{ opacity: 0.4 }} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="w-4 h-4"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>
          </button>
        </div>
        <ul ref={bodyRef} className="overflow-y-auto px-5 pb-8" style={{ maxHeight: "calc(70vh - 80px)" }}>
          {headings.map((h) => {
            const active = activeId === h.id;
            return (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  onClick={(e) => handleClick(e, h.id)}
                  className="flex items-center justify-between py-3.5 border-t border-[rgb(var(--line))] transition-colors duration-150"
                  style={{ paddingLeft: h.level === 3 ? "12px" : "0", borderColor: "rgb(var(--line) / 0.4)" }}
                >
                  <span className="text-[15px] tracking-tight leading-snug" style={{ color: active ? "rgb(var(--fg))" : "rgb(var(--muted))", fontWeight: active ? 500 : 400, opacity: active ? 1 : 0.6 }}>
                    {h.text}
                  </span>
                  {active && <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-gradient)" }} />}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: floating pill + bottom sheet */}
      {mobilePill}

      {/* Desktop: sticky left-column aside */}
      {desktopAside}
    </>
  );
}
