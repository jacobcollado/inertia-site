"use client";

import { createContext, useContext } from "react";

// The site is white. Every themed route renders light whatever the device's
// setting, and there's no switch. THEME_SCRIPT runs in <head> before first
// paint and sets data-theme="light" on <html>, plus .themed on routes outside
// UNTHEMED_PREFIXES (the always-dark client dashboard and admin, and internal
// lab pages keep their own look). The dark palette is still in globals.css,
// keyed off html.themed[data-theme="dark"], should it ever come back.

export type ThemePref = "light" | "dark" | "system";
type Theme = "light" | "dark";
type Ctx = { pref: ThemePref; theme: Theme; setPref: (p: ThemePref) => void };

export const UNTHEMED_PREFIXES = ["/dashboard", "/admin", "/portal", "/accept-invite", "/components", "/canvas-lab", "/og-lab"];
export const isThemedPath = (path: string) =>
  !UNTHEMED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));

const LIGHT: Ctx = { pref: "light", theme: "light", setPref: () => {} };
const ThemeContext = createContext<Ctx>(LIGHT);

export const THEME_SCRIPT = `(function(){try{var d=document.documentElement;d.dataset.theme="light";var p=location.pathname;if(!${JSON.stringify(UNTHEMED_PREFIXES)}.some(function(x){return p===x||p.indexOf(x+"/")===0}))d.classList.add("themed")}catch(e){}})()`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={LIGHT}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
