"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

function revealInViewport() {
  document.querySelectorAll<HTMLElement>(".rise:not(.is-visible)").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("is-visible");
    }
  });
}

export function ScrollReveal() {
  const pathname = usePathname();

  useLayoutEffect(() => {
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

    const observeNew = () => {
      revealInViewport();
      document.querySelectorAll<HTMLElement>(".rise:not(.is-visible)").forEach((el) => observer.observe(el));
    };

    observeNew();

    const mutation = new MutationObserver(observeNew);
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, [pathname]);

  return null;
}
