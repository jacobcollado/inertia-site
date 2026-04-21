"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useViewMode, type ViewMode } from "./view-mode-context";

const NAV = [
  { label: "Work", href: "/work" },
  { label: "Blog", href: "/blog" },
  { label: "Now", href: "/now" },
  { label: "Contact", href: "/contact" },
];

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
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgb(var(--bg) / 0.6)", backdropFilter: "blur(2px)" }}
          onClick={() => setOpen(false)}
        />
      )}

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
        <div className="notch-panel__view-switch">
          <span className="notch-panel__view-label">View</span>
          <div className="view-tooltip__pills">
            {(["text", "visual"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => { setMode(v); setOpen(false); }}
                className="view-tooltip__pill"
                data-active={mode === v}
                aria-pressed={mode === v}
              >
                {v === "text" ? "Text" : "Visual"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
