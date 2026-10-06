"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

// A .rise-stagger section reveals its parts one after another instead of as
// one block. Its direct children are the parts; a child marked
// data-stagger (a grid, a column) contributes its own children instead.
// Each part gets .rise-item and its place in the order as --i (globals.css
// turns that into the delay). Tagged before the section is revealed, so the
// parts start hidden.
function tagStagger(root: HTMLElement) {
  if (root.dataset.staggerTagged) return;
  root.dataset.staggerTagged = "1";
  let i = 0;
  const walk = (el: Element) => {
    for (const child of Array.from(el.children)) {
      if (child.hasAttribute("data-stagger")) walk(child);
      else {
        child.classList.add("rise-item");
        (child as HTMLElement).style.setProperty("--i", String(i++));
      }
    }
  };
  walk(root);
}

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
      document.querySelectorAll<HTMLElement>(".rise-stagger").forEach(tagStagger);
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
