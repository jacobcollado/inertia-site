"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { label: "Work", href: "/work" },
  { label: "Blog", href: "/blog" },
  { label: "Now", href: "/now" },
  { label: "Contact", href: "/contact" },
];

export function VisualNotch() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Measure off-flow after mount so height is always known before first open
  useLayoutEffect(() => {
    if (!mounted) return;
    const el = navRef.current;
    if (!el) return;
    const measure = () => {
      const saved = el.style.cssText;
      el.style.cssText = "position:absolute;visibility:hidden;height:auto;overflow:visible;";
      const h = el.scrollHeight;
      el.style.cssText = saved;
      setNavHeight(h);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [mounted]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest(".notch-island")) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <div className="notch-bar">
        <div className="notch-island" data-open={open}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            className="notch-pill"
          >
            <span>Inertia</span>
            <span className="notch-pill__icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
                style={{
                  transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>

          {/* Nav — drops below the pill */}
          <div
            ref={navRef}
            className="notch-nav"
            aria-hidden={!open}
            style={{
              height: open && navHeight !== null ? navHeight : 0,
              opacity: open && navHeight !== null ? 1 : 0,
              transition: navHeight !== null ? "height 380ms cubic-bezier(0.4, 0, 0.2, 1), opacity 260ms cubic-bezier(0.4, 0, 0.2, 1)" : "none",
            }}
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="notch-nav__link"
                tabIndex={open ? 0 : -1}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Toggle sits fixed independently so it never moves */}
      <div className="notch-bar__toggle">
        <ThemeToggle />
      </div>
    </>
  );
}
