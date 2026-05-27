"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Heading } from "@/lib/posts";

export function TOC({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);

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
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  if (headings.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    setMenuOpen(false);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  const activeHeading = headings.find((h) => h.id === activeId) ?? headings[0];
  const activeIndex = headings.findIndex((h) => h.id === activeId);
  const progress = headings.length > 1 ? Math.max(0, activeIndex) / (headings.length - 1) : 0;

  // Desktop TOC — sticky inside the left grid column, right-aligned so it reads toward the article
  const desktopAside = (
    <nav
      aria-label="Table of contents"
      className="sticky top-28 self-start flex flex-col items-end"
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

  // Mobile fixed bar — pill floating above safe area
  const mobileBar = (
    <div
      className="fixed inset-x-0 z-40 lg:hidden flex justify-center"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 500ms cubic-bezier(0.22,1,0.36,1) 200ms, transform 500ms cubic-bezier(0.22,1,0.36,1) 200ms",
      }}
    >
      <button
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Open table of contents"
        aria-expanded={menuOpen}
        className="flex items-center gap-3 px-4 py-2.5 rounded-full focus:outline-none [-webkit-tap-highlight-color:transparent]"
        style={{
          background: "rgb(var(--surface))",
          border: "1px solid rgb(var(--line))",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        }}
      >
        {/* Progress ring / count */}
        <span className="text-[11px] tabular-nums tracking-tight text-[rgb(var(--muted))] opacity-50 shrink-0">
          {String(Math.max(1, activeIndex + 1)).padStart(2, "0")}/{String(headings.length).padStart(2, "0")}
        </span>
        <div className="w-px h-3.5 bg-[rgb(var(--line))] shrink-0" />
        {/* Active heading */}
        <span
          key={activeHeading?.id}
          className="text-[13px] tracking-tight text-[rgb(var(--fg))] truncate max-w-[180px]"
          style={{ animation: "fade-in 250ms cubic-bezier(0.22,1,0.36,1)" }}
        >
          {activeHeading?.text ?? "Contents"}
        </span>
        {/* Progress bar inset */}
        <div className="w-16 h-0.5 rounded-full bg-[rgb(var(--line))] overflow-hidden shrink-0">
          <div
            className="h-full bg-[rgb(var(--fg))] transition-all duration-500"
            style={{ width: `${progress * 100}%`, opacity: 0.6 }}
          />
        </div>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="w-3 h-3 shrink-0 text-[rgb(var(--muted))]"
          style={{
            transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 300ms cubic-bezier(0.22,1,0.36,1)",
          }}
          aria-hidden="true"
        >
          <polyline points="4 10 8 6 12 10" />
        </svg>
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile: portaled bottom bar */}
      {mounted && createPortal(mobileBar, document.body)}

      {mounted && (
        <MobileSheet open={menuOpen} onClose={() => setMenuOpen(false)}>
          <ul>
            {headings.map((h) => {
              const active = activeId === h.id;
              return (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    onClick={(e) => handleClick(e, h.id)}
                    className="flex items-center justify-between py-4 border-b border-[rgb(var(--line)/0.5)] transition-colors duration-200"
                    style={{ paddingLeft: h.level === 3 ? "16px" : "0" }}
                  >
                    <span className={`text-[16px] tracking-tight leading-snug transition-colors ${
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
        </MobileSheet>
      )}
    </>
  );
}

function MobileSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return createPortal(
    <div
      className={`fixed inset-0 z-[60] lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: open ? 1 : 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      {/* Sheet */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          background: "rgb(var(--bg))",
          borderTop: "1px solid rgb(var(--line))",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 100px)",
          borderRadius: "20px 20px 0 0",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-4 pb-1">
          <div className="h-1 w-10 rounded-full bg-[rgb(var(--line))]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-5">
          <p className="text-[18px] font-medium tracking-tight text-[rgb(var(--fg))]">
            On this page
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-8 h-8 rounded-full text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors focus:outline-none [-webkit-tap-highlight-color:transparent]"
            style={{ background: "rgb(var(--surface))", border: "1px solid rgb(var(--line))" }}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="w-3.5 h-3.5" aria-hidden="true">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="max-h-[50vh] overflow-y-auto px-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
