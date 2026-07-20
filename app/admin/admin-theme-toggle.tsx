"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "admin-theme";

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("admin-dark", dark);
}

export function AdminThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  }

  if (!mounted) return <Button variant="ghost" size="icon" className="size-8" disabled />;

  return (
    <Button variant="ghost" size="icon" className="size-8" onClick={toggle} aria-label="Toggle dark mode">
      {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </Button>
  );
}
