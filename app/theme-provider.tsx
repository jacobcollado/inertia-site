"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Light / dark theme. The visitor picks in the footer (light, dark or follow
// the system); the pick is kept in localStorage under "theme". THEME_SCRIPT
// runs in <head> before first paint and sets data-theme on <html>, so the
// page never flashes the wrong theme. Every route follows it except those
// in UNTHEMED_PREFIXES, which keep their own look (the always-dark client
// dashboard and admin, and internal lab pages). Themed routes carry .themed
// on <html> (set here before paint, and kept in sync by SiteShell on client
// navigation), and globals.css keys the dark palette off
// html.themed[data-theme="dark"].

export type ThemePref = "light" | "dark" | "system";
type Theme = "light" | "dark";
type Ctx = { pref: ThemePref; theme: Theme; setPref: (p: ThemePref) => void };

const KEY = "theme";
export const UNTHEMED_PREFIXES = ["/dashboard", "/admin", "/portal", "/accept-invite", "/components", "/canvas-lab", "/hero-lab", "/og-lab"];
export const isThemedPath = (path: string) =>
  !UNTHEMED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
const ThemeContext = createContext<Ctx | null>(null);

export const THEME_SCRIPT = `(function(){try{var p=localStorage.getItem("${KEY}");var t=p==="light"||p==="dark"?p:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var d=document.documentElement;d.dataset.theme=t;var p2=location.pathname;if(!${JSON.stringify(UNTHEMED_PREFIXES)}.some(function(x){return p2===x||p2.indexOf(x+"/")===0}))d.classList.add("themed");if(p2==="/")d.classList.add("home-dark-root")}catch(e){}})()`;

function readPref(): ThemePref {
  try {
    const p = localStorage.getItem(KEY);
    return p === "light" || p === "dark" ? p : "system";
  } catch {
    return "system";
  }
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // null until the stored pick is read, so the first pass doesn't overwrite
  // what THEME_SCRIPT already set.
  const [pref, setPrefState] = useState<ThemePref | null>(null);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setPrefState(readPref());
  }, []);

  useEffect(() => {
    if (pref === null) return;
    const apply = () => {
      const t = pref === "system" ? systemTheme() : pref;
      document.documentElement.dataset.theme = t;
      setTheme(t);
    };
    apply();
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [pref]);

  const setPref = useCallback((p: ThemePref) => {
    try {
      if (p === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, p);
    } catch {}
    setPrefState(p);
  }, []);

  return <ThemeContext.Provider value={{ pref: pref ?? "system", theme, setPref }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
