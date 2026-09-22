"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useEffect, useRef } from "react";
import { scrollToHash } from "@/lib/scroll-to-hash";

// Routes with their own persistent shell (sidebar, nav, etc.) that must not
// be torn down on every navigation.
const PERSISTENT_SHELL_PREFIXES = ["/admin", "/dashboard"];

export function RouteFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const isPersistentShell = PERSISTENT_SHELL_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"));

  // Clicking between two /work#project-x cards without leaving /work never
  // changes `pathname`, so the pathname effect below never re-runs for the
  // second click — the page just stayed wherever the first click's scroll had
  // landed. This listens for the hash itself changing, independent of whether
  // Next's router treats it as a real navigation.
  useEffect(() => {
    const onHashChange = () => scrollToHash();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    scrollToHash();
  }, [pathname]);

  if (isPersistentShell) {
    return <div ref={ref}>{children}</div>;
  }

  return <div ref={ref}>{children}</div>;
}
