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
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    const bodyTouchAction = document.body.style.touchAction;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      document.body.style.touchAction = bodyTouchAction;
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

  const renderDesktopList = () => (
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
              {/* Active indicator bar */}
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-full transition-all duration-300"
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
  );

  const renderMobileList = () => (
    <ul className="space-y-4">
      {headings.map((h) => {
        const active = activeId === h.id;
        return (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
            <a
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className={`block text-base leading-snug tracking-tight transition-colors duration-200 ${
                active ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
              }`}
            >
              {h.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

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
            style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)" }}
            aria-hidden="true"
          >
            <polyline points="4 6 8 10 12 6" />
          </svg>
        </button>
        <span
          className="text-[11px] tracking-tight font-medium text-[rgb(var(--muted))] uppercase whitespace-nowrap"
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
          transition: "opacity 200ms cubic-bezier(0.22, 1, 0.36, 1), transform 250ms cubic-bezier(0.22, 1, 0.36, 1)",
          pointerEvents: collapsed ? "none" : "auto",
        }}
      >
        {renderDesktopList()}
      </div>
    </aside>
  );

  return (
    <>
      {mounted && createPortal(desktopAside, document.body)}

      <button
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? "Close contents" : "Open contents"}
        aria-expanded={menuOpen}
        className="fixed left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--bg))] px-4 py-2.5 text-[13px] font-medium tracking-tight text-[rgb(var(--fg))] shadow-[0_10px_28px_-12px_rgba(0,0,0,0.28),0_2px_8px_rgba(0,0,0,0.08)] transition-transform duration-150 active:scale-[0.98] focus:outline-none lg:hidden [-webkit-tap-highlight-color:transparent]"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
          background:
            "linear-gradient(180deg, rgba(var(--bg),0.98) 0%, rgba(var(--bg),0.94) 100%)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="h-3.5 w-3.5 opacity-60"
          aria-hidden="true"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="16" y2="12" />
          <line x1="4" y1="17" x2="12" y2="17" />
        </svg>
        Contents
      </button>

      {mounted && (
        <MobileSheet open={menuOpen} onClose={() => setMenuOpen(false)}>
          {renderMobileList()}
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
  return createPortal(
    <div
      className={`fixed inset-0 z-[60] lg:hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
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

      <div
        className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-3xl border-t border-[rgb(var(--line))] bg-[rgb(var(--bg))] shadow-[0_-24px_64px_-20px_rgba(0,0,0,0.4)]"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
          paddingBottom: "env(safe-area-inset-bottom, 24px)",
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[rgb(var(--line))]" />
        </div>

        <div className="flex items-center justify-between px-6 pt-3 pb-4">
          <p className="text-base font-semibold tracking-tight text-[rgb(var(--fg))]">
            On this page
          </p>
          <button
            onClick={onClose}
            aria-label="Close contents"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] shadow-[0_4px_16px_-10px_rgba(0,0,0,0.24)] transition-colors duration-200 hover:text-[rgb(var(--fg))] focus:outline-none [-webkit-tap-highlight-color:transparent]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-6 pb-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
