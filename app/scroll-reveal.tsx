"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const all = document.querySelectorAll<HTMLElement>(".rise");
    all.forEach((el) => el.classList.remove("is-visible"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.classList.add("is-visible");
          observer.unobserve(el);
        });
      },
      {
        threshold: 0.06,
        rootMargin: "0px 0px -32px 0px",
      }
    );

    const mutation = new MutationObserver(() => {
      document.querySelectorAll<HTMLElement>(".rise:not(.is-visible)").forEach((el) => observer.observe(el));
    });

    const raf = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(".rise:not(.is-visible)").forEach((el) => observer.observe(el));
      mutation.observe(document.body, { childList: true, subtree: true });
    });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      mutation.disconnect();
    };
  }, [pathname]);

  return null;
}
