"use client";

import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/lib/posts";

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

  // Mobile inline accordion — sits above the article, xl hidden
  const mobileAccordion = (
    <div className="xl:hidden border-b border-[rgb(var(--line))] mb-2">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-4 [-webkit-tap-highlight-color:transparent] focus:outline-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.45, flexShrink: 0 }}>
            On this page
          </span>
          {!open && (
            <span
              key={activeHeading?.id}
              className="text-[13px] tracking-tight text-[rgb(var(--fg))] truncate"
              style={{ opacity: 0.7 }}
            >
              {activeHeading?.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-12 h-px rounded-full bg-[rgb(var(--line))] overflow-hidden">
            <div
              className="h-full bg-[rgb(var(--fg))] transition-all duration-500"
              style={{ width: `${progress * 100}%`, opacity: 0.5 }}
            />
          </div>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="w-3 h-3 text-[rgb(var(--muted))]"
            style={{
              opacity: 0.4,
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 300ms cubic-bezier(0.22,1,0.36,1)",
            }}
            aria-hidden="true"
          >
            <polyline points="4 10 8 6 12 10" />
          </svg>
        </div>
      </button>

      <div
        style={{
          height,
          overflow: "hidden",
          transition: "height 300ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <ul ref={bodyRef} className="pb-3">
          {headings.map((h) => {
            const active = activeId === h.id;
            return (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  onClick={(e) => handleClick(e, h.id)}
                  className="flex items-center justify-between py-3 border-t border-[rgb(var(--line)/0.5)] transition-colors duration-150"
                  style={{ paddingLeft: h.level === 3 ? "12px" : "0" }}
                >
                  <span className={`text-[14px] tracking-tight leading-snug ${
                    active ? "text-[rgb(var(--fg))] font-medium" : "text-[rgb(var(--muted))]"
                  }`}>
                    {h.text}
                  </span>
                  {active && (
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[rgb(60,100,255)]" />
                  )}
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
      {/* Mobile: inline accordion above article */}
      {mobileAccordion}

      {/* Desktop: sticky left-column aside */}
      {desktopAside}
    </>
  );
}
