"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Heading } from "@/lib/posts";

export function TOC({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("toc-collapsed");
      if (stored === "1") setCollapsed(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("toc-collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

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

  // Desktop sidebar
  const desktopAside = (
    <aside
      className="fixed left-6 top-28 z-40 hidden lg:block"
      style={{
        width: collapsed ? "2rem" : "13rem",
        opacity: entered ? 1 : 0,
        transform: entered ? "translateX(0)" : "translateX(-12px)",
        transition:
          "width 380ms cubic-bezier(0.22, 1, 0.36, 1)," +
          "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)," +
          "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-5 pl-[9px]">
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand contents" : "Collapse contents"}
          aria-expanded={!collapsed}
          className="shrink-0 flex items-center justify-center w-[18px] h-[18px] rounded-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors focus:outline-none"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="w-3 h-3"
            style={{
              transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
              transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            aria-hidden="true"
          >
            <polyline points="4 6 8 10 12 6" />
          </svg>
        </button>
        <span
          className="text-[11px] tracking-tight font-medium text-[rgb(var(--muted))] whitespace-nowrap"
          style={{
            opacity: collapsed ? 0 : 0.5,
            transition: "opacity 200ms cubic-bezier(0.22, 1, 0.36, 1)",
            pointerEvents: "none",
          }}
        >
          On this page
        </span>
      </div>

      {/* List */}
      <div
        className="pl-[9px] border-l border-[rgb(var(--line))] overflow-y-auto"
        style={{
          maxHeight: "calc(100vh - 12rem)",
          opacity: collapsed ? 0 : 1,
          transform: collapsed ? "translateX(-4px)" : "translateX(0)",
          transition:
            "opacity 200ms cubic-bezier(0.22, 1, 0.36, 1), transform 250ms cubic-bezier(0.22, 1, 0.36, 1)",
          pointerEvents: collapsed ? "none" : "auto",
        }}
      >
        <ul className="space-y-px">
          {headings.map((h, i) => {
            const active = activeId === h.id;
            const delay = 160 + i * 45;
            const isH3 = h.level === 3;
            return (
              <li
                key={h.id}
                style={{
                  opacity: entered ? 1 : 0,
                  transform: entered ? "translateX(0)" : "translateX(-8px)",
                  transition: `opacity 500ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
                }}
              >
                <a
                  href={`#${h.id}`}
                  onClick={(e) => handleClick(e, h.id)}
                  className="group relative flex items-center gap-2.5 py-1 transition-colors duration-200"
                  style={{ paddingLeft: isH3 ? "12px" : "0" }}
                >
                  <span
                    className="absolute top-1/2 -translate-y-1/2 w-[2px] rounded-full transition-all duration-300"
                    style={{
                      height: active ? "14px" : "0px",
                      background: "rgb(var(--fg))",
                      opacity: active ? 1 : 0,
                      left: isH3 ? "-1px" : "-9px",
                    }}
                  />
                  <span
                    className={`text-[12px] leading-snug tracking-tight transition-colors duration-200 ${
                      active
                        ? "text-[rgb(var(--fg))]"
                        : "text-[rgb(var(--muted))] opacity-60 group-hover:opacity-100 group-hover:text-[rgb(var(--fg))]"
                    }`}
                  >
                    {h.text}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );

  // Mobile fixed bar — always visible at bottom, taps to open sheet
  const mobileBar = (
    <div
      className="fixed inset-x-0 z-40 lg:hidden"
      style={{
        bottom: 0,
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 500ms cubic-bezier(0.22,1,0.36,1) 200ms, transform 500ms cubic-bezier(0.22,1,0.36,1) 200ms",
      }}
    >
      {/* Progress track */}
      <div className="h-px bg-[rgb(var(--line))] mx-0 relative overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-[rgb(var(--fg))] opacity-50 transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div
        className="flex items-center gap-3 px-5 bg-[rgb(var(--bg))]"
        style={{
          paddingTop: "10px",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
          borderTop: "none",
        }}
      >
        {/* Section count */}
        <span className="text-[11px] tabular-nums tracking-tight text-[rgb(var(--muted))] opacity-40 shrink-0 w-8">
          {String(Math.max(1, activeIndex + 1)).padStart(2, "0")}/{String(headings.length).padStart(2, "0")}
        </span>

        {/* Active heading — truncated */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex-1 min-w-0 flex items-center gap-2 text-left focus:outline-none [-webkit-tap-highlight-color:transparent]"
          aria-label="Open table of contents"
          aria-expanded={menuOpen}
        >
          <span className="flex-1 min-w-0 text-[13px] tracking-tight text-[rgb(var(--fg))] truncate">
            {activeHeading?.text ?? "Contents"}
          </span>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="w-3.5 h-3.5 shrink-0 text-[rgb(var(--muted))]"
            style={{
              transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 300ms cubic-bezier(0.22,1,0.36,1)",
            }}
            aria-hidden="true"
          >
            <polyline points="4 10 8 6 12 10" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-[rgb(var(--line))] shrink-0" />

        {/* Section list toggle icon */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="All sections"
          className="shrink-0 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors focus:outline-none [-webkit-tap-highlight-color:transparent]"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <line x1="2" y1="4" x2="14" y2="4" />
            <line x1="2" y1="8" x2="10" y2="8" />
            <line x1="2" y1="12" x2="12" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {mounted && createPortal(desktopAside, document.body)}
      {mounted && createPortal(mobileBar, document.body)}

      {mounted && (
        <MobileSheet open={menuOpen} onClose={() => setMenuOpen(false)}>
          <ul className="space-y-1">
            {headings.map((h, i) => {
              const active = activeId === h.id;
              return (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    onClick={(e) => handleClick(e, h.id)}
                    className={`flex items-center gap-3 py-2.5 transition-colors duration-200 ${
                      active ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
                    }`}
                    style={{ paddingLeft: h.level === 3 ? "20px" : "0" }}
                  >
                    <span
                      className="shrink-0 text-[11px] tabular-nums w-6 opacity-40"
                      style={{ color: active ? "rgb(var(--fg))" : undefined }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`text-[15px] tracking-tight leading-snug ${active ? "font-medium" : ""}`}>
                      {h.text}
                    </span>
                    {active && (
                      <span className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-[rgb(var(--fg))]" />
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
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Sheet */}
      <div
        className="absolute inset-x-0 bottom-0 bg-[rgb(var(--bg))] border-t border-[rgb(var(--line))]"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
          borderRadius: "16px 16px 0 0",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-8 rounded-full bg-[rgb(var(--line))] opacity-60" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-[rgb(var(--line))]">
          <p className="text-[13px] font-medium tracking-tight text-[rgb(var(--muted))] opacity-50">
            On this page
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-7 h-7 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors focus:outline-none [-webkit-tap-highlight-color:transparent]"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="w-3.5 h-3.5" aria-hidden="true">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="max-h-[50vh] overflow-y-auto px-5 pt-2 pb-2 divide-y divide-[rgb(var(--line))/0.5]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
