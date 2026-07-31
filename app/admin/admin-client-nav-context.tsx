"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// Lets the client detail layout (app/admin/clients/[id]/layout.tsx) publish
// which client is currently being viewed, so AppSidebar (rendered once,
// shared across all of /admin) can inject a client-scoped sub-nav under the
// main nav items — same split-context pattern as the dashboard's
// page-crumb-context.tsx, and for the same reason: the setter must not
// change identity, or every consumer re-renders on every publish.
type ClientNavValue = { id: string; label: string; unreadCount: number } | null;

const ClientNavValueContext = createContext<ClientNavValue>(null);
const ClientNavSetterContext = createContext<((v: ClientNavValue) => void) | null>(null);

export function AdminClientNavProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<ClientNavValue>(null);
  return (
    <ClientNavSetterContext.Provider value={setValue}>
      <ClientNavValueContext.Provider value={value}>
        {children}
      </ClientNavValueContext.Provider>
    </ClientNavSetterContext.Provider>
  );
}

export function useAdminClientNavValue() {
  return useContext(ClientNavValueContext);
}

/* Publishes the active client for the lifetime of the calling component,
   clearing it on unmount so navigating back to /admin/clients (or anywhere
   else) drops the sub-nav. */
export function useSetAdminClientNav(value: { id: string; label: string; unreadCount: number } | null) {
  const setValue = useContext(ClientNavSetterContext);
  if (!setValue) throw new Error("useSetAdminClientNav must be used within AdminClientNavProvider");
  const stable = useMemo(() => value, [value?.id, value?.label, value?.unreadCount]);
  useEffect(() => {
    setValue(stable);
    return () => setValue(null);
  }, [stable, setValue]);
}
