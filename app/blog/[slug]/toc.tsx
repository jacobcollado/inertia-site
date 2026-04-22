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
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
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

  const renderList = (stagger: boolean) => (
    <ul className={`tracking-tight ${stagger ? "space-y-2.5 text-sm" : "space-y-4 text-base"}`}>
      {headings.map((h, i) => {
        const active = activeId === h.id;
        const delay = 180 + i * 55;
        return (
          <li
            key={h.id}
            style={{
              paddingLeft: `${(h.level - 1) * 12}px`,
              ...(stagger
                ? {
                    opacity: entered ? 1 : 0,
                    transform: entered ? "translateX(0)" : "translateX(-10px)",
                    transition: `opacity 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
                    willChange: "opacity, transform",
                  }
                : {}),
            }}
          >
            <a
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className={`block transition-colors duration-300 leading-snug ${
                active
                  ? "text-[rgb(var(--fg))]"
                  : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
              }`}
            >
              {h.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
  const list = renderList(false);
  const desktopList = renderList(true);

  const desktopAside = (
    <aside
      className="hidden lg:block fixed left-8 top-24 max-h-[calc(100vh-8rem)] overflow-hidden z-40"
      style={{
        width: collapsed ? "2.25rem" : "14rem",
        opacity: entered ? 1 : 0,
        transform: entered ? "translateX(0) translateY(0)" : "translateX(-14px) translateY(4px)",
        filter: entered ? "blur(0)" : "blur(4px)",
        transition:
          "width 400ms cubic-bezier(0.22, 1, 0.36, 1)," +
          "opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)," +
          "transform 800ms cubic-bezier(0.22, 1, 0.36, 1)," +
          "filter 700ms cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "opacity, transform, filter",
      }}
    >
      <div
        className="flex items-center mb-4 gap-2"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? "translateX(0)" : "translateX(-8px)",
          transition:
            "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1) 80ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) 80ms",
        }}
      >
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand contents" : "Collapse contents"}
          aria-expanded={!collapsed}
          className="shrink-0 order-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] hover:border-[rgb(var(--fg))] hover:text-[rgb(var(--fg))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--fg))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] transition-colors duration-300"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 transition-transform duration-400 ease-fluid"
            style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)" }}
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <p
          className="order-2 text-sm font-medium tracking-tighter text-[rgb(var(--muted))] whitespace-nowrap"
          style={{
            opacity: collapsed ? 0 : 1,
            transition: "opacity 250ms cubic-bezier(0.22, 1, 0.36, 1)",
            pointerEvents: collapsed ? "none" : "auto",
          }}
        >
          On this page
        </p>
      </div>
      <div
        className="overflow-y-auto pr-2"
        style={{
          maxHeight: "calc(100vh - 10rem)",
          opacity: collapsed ? 0 : 1,
          transform: collapsed ? "translateX(-8px)" : "translateX(0)",
          transition:
            "opacity 250ms cubic-bezier(0.22, 1, 0.36, 1), transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
          pointerEvents: collapsed ? "none" : "auto",
        }}
      >
        {desktopList}
      </div>
    </aside>
  );

  return (
    <>
      {mounted && createPortal(desktopAside, document.body)}

      {/* Mobile trigger — sticky near top */}
      <button
        onClick={() => setMenuOpen(true)}
        aria-label="Open contents"
        className="lg:hidden sticky top-4 z-30 ml-auto mb-6 -mt-10 flex items-center gap-2.5 rounded-full bg-[rgb(var(--fg))] px-4 py-2 text-sm font-medium tracking-tight text-[rgb(var(--bg))] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--fg))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] active:scale-95 transition-transform duration-150 [-webkit-tap-highlight-color:transparent]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="14" y2="17" />
        </svg>
        Contents
      </button>

      {mounted && <MobileSheet open={menuOpen} onClose={() => setMenuOpen(false)}>{list}</MobileSheet>}
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
  return createPortal(
    <div
      className={`lg:hidden fixed inset-0 z-[60] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: open ? 1 : 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />
      {/* Sheet */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-[rgb(var(--bg))] overflow-hidden"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
          paddingBottom: "env(safe-area-inset-bottom, 24px)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[rgb(var(--line))]" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-3 pb-4">
          <p className="text-base font-semibold tracking-tight text-[rgb(var(--fg))]">
            On this page
          </p>
          <button
            onClick={onClose}
            aria-label="Close contents"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] focus:outline-none [-webkit-tap-highlight-color:transparent] transition-colors duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
        {/* List */}
        <div className="overflow-y-auto max-h-[55vh] px-6 pb-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
