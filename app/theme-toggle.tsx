"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="theme-toggle group relative inline-flex h-10 w-10 items-center justify-center rounded-full outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--fg))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] cursor-pointer select-none [-webkit-tap-highlight-color:transparent]"
      data-dark={isDark ? "true" : "false"}
    >
      <span aria-hidden="true" className="theme-toggle__shine" />
      <span className="relative block h-[18px] w-[18px] text-[rgb(var(--fg))]">
        <SunIcon
          className="absolute inset-0 transition-all duration-500 ease-fluid"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? "rotate(-90deg) scale(0.55)" : "rotate(0deg) scale(1)",
            filter: isDark ? "none" : "drop-shadow(0 1px 1px rgba(0,0,0,0.18))",
          }}
        />
        <MoonIcon
          className="absolute inset-0 transition-all duration-500 ease-fluid"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.55)",
            filter: isDark ? "drop-shadow(0 1px 2px rgba(0,0,0,0.55))" : "none",
          }}
        />
      </span>
    </button>
  );
}

function SunIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
