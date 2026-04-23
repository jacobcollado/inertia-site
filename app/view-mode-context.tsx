"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ViewMode = "text" | "visual";

const ViewModeContext = createContext<{
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
}>({ mode: "text", setMode: () => {} });

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode] = useState<ViewMode>("visual");

  const setMode = (_m: ViewMode) => {};

  return (
    <ViewModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
