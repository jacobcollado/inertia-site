"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function RouteFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

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

    el.classList.remove("route-enter");
    void el.offsetWidth;
    el.classList.add("route-enter");
  }, [pathname]);

  return (
    <div ref={ref} className="route-enter" key={pathname}>
      {children}
    </div>
  );
}
