"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useViewMode, type ViewMode } from "./view-mode-context";

const NAV = [
  { label: "Work", href: "/work" },
  { label: "Blog", href: "/blog" },
  { label: "Now", href: "/now" },
  { label: "Contact", href: "/contact" },
];

const TextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="16" y2="12" />
    <line x1="4" y1="17" x2="12" y2="17" />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export function VisualNotch() {
  const { mode, setMode } = useViewMode();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mode !== "visual") setOpen(false);
  }, [mode]);

  if (!mounted || mode !== "visual") return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          pointerEvents: open ? "auto" : "none",
          background: "rgba(0,0,0,0.3)",
          backdropFilter: open ? "blur(8px)" : "blur(0px)",
          WebkitBackdropFilter: open ? "blur(8px)" : "blur(0px)",
          opacity: open ? 1 : 0,
          transition: "opacity 400ms cubic-bezier(0.22,1,0.36,1), backdrop-filter 400ms cubic-bezier(0.22,1,0.36,1)",
        }}
        onClick={() => setOpen(false)}
      />

      {/* Notch pill */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="notch-pill"
        data-open={open}
      >
        <span className="notch-pill__name">Jacob Collado</span>
        <span className="notch-pill__icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
            style={{
              transition: "transform 400ms cubic-bezier(0.22,1,0.36,1)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Nav panel */}
      <div
        className="notch-panel"
        data-open={open}
        aria-hidden={!open}
      >
        <nav className="notch-panel__nav">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="notch-panel__link"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* View segmented control */}
        <div className="notch-panel__view-switch">
          <p className="notch-panel__view-label">View</p>
          <div className="notch-view-seg">
            {([
              { value: "text", label: "Text", Icon: TextIcon },
              { value: "visual", label: "Visual", Icon: GridIcon },
            ] as { value: ViewMode; label: string; Icon: () => React.ReactElement }[]).map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => { setMode(value); if (value === "text") setOpen(false); }}
                className="notch-view-seg__btn"
                data-active={mode === value}
                aria-pressed={mode === value}
              >
                <span className="notch-view-seg__icon"><Icon /></span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
