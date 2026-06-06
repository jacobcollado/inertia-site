"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Ctx = { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void };

const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Read actual DOM class synchronously so state matches what the inline
  // script already applied — avoids the double-render / flicker cycle.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("theme_ts", String(Date.now()));
  }, [theme]);

  const applyTheme = (next: Theme) => {
    const apply = () => {
      document.documentElement.classList.toggle("dark", next === "dark");
      setTheme(next);
    };
    if (!document.startViewTransition) { apply(); return; }
    document.startViewTransition(apply);
  };

  const toggle = () => applyTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");

  return <ThemeContext.Provider value={{ theme, toggle, setTheme: applyTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
