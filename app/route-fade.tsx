"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Routes with their own persistent shell (sidebar, nav, etc.) that must not
// be torn down and remounted on every navigation — the key={pathname} remount
// below is skipped for these so their layout survives route changes.
const PERSISTENT_SHELL_PREFIXES = ["/admin", "/dashboard"];

export function RouteFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  // Lives in RouteFade's own (stable) scope, not the key={pathname} child
  // below — RouteFade itself never remounts on navigation, only that child
  // does, so this correctly survives across route changes while still being
  // false during the true first render on both server and client (avoiding
  // any SSR/CSR className mismatch that module-level state would cause).
  const isInitialLoad = useRef(true);
  const isComponents = pathname.startsWith("/components");
  const isPersistentShell = PERSISTENT_SHELL_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    isInitialLoad.current = false;
    const el = ref.current;
    if (!el) return;

    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    if (isComponents || isPersistentShell) return;

    el.classList.remove("route-enter");
    void el.offsetWidth;
    el.classList.add("route-enter");
  }, [pathname, isComponents, isPersistentShell]);

  if (isPersistentShell) {
    return <div ref={ref}>{children}</div>;
  }

  return (
    <div ref={ref} className={isComponents || isInitialLoad.current ? undefined : "route-enter"} key={pathname}>
      {children}
    </div>
  );
}
