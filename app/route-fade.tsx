"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function RouteFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const isComponents = pathname.startsWith("/components");

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = ref.current;
    if (!el) return;

    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    if (isComponents) return;

    el.classList.remove("route-enter");
    void el.offsetWidth;
    el.classList.add("route-enter");
  }, [pathname, isComponents]);

  return (
    <div ref={ref} className={isComponents ? undefined : "route-enter"} key={pathname}>
      {children}
    </div>
  );
}
