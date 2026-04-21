"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ViewMode = "text" | "visual";

const ViewModeContext = createContext<{
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
}>({ mode: "text", setMode: () => {} });

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>("visual");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("view-mode") as ViewMode | null;
      if (saved === "visual" || saved === "text") setModeState(saved);
    } catch {}
  }, []);

  const setMode = (m: ViewMode) => {
    setModeState(m);
    try { localStorage.setItem("view-mode", m); } catch {}
  };

  return (
    <ViewModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
