"use client";

import { createContext, useContext } from "react";

type Theme = "light" | "dark";
type Ctx = { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void };

const ThemeContext = createContext<Ctx | null>(null);

// The site is permanently dark (see globals.css :root + forced .dark on <html>).
// The provider stays so existing useTheme() consumers keep working, but the
// theme is locked to "dark" and toggle/setTheme are no-ops.
const LOCKED: Ctx = { theme: "dark", toggle: () => {}, setTheme: () => {} };

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={LOCKED}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
