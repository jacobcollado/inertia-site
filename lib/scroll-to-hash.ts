import type { MouseEvent } from "react";

export const AETHER_CHECKOUT_ID = "checkout";

type ScrollToIdOptions = {
  immediate?: boolean;
  /** Lenis scrollTo offset (negative pulls target below the top edge). */
  offset?: number;
  duration?: number;
};

export function scrollToElementById(id: string, opts: ScrollToIdOptions = {}) {
  const { immediate = true, offset = 0, duration = 1.1 } = opts;
  requestAnimationFrame(() => {
    const target = document.getElementById(id);
    if (!target) return;
    if (window.__lenis) {
      window.__lenis.resize();
      window.__lenis.scrollTo(target, immediate ? { immediate: true, offset } : { offset, duration });
    } else {
      target.scrollIntoView({ behavior: immediate ? "auto" : "smooth", block: "start" });
    }
  });
}

/** Same hash normalization as route transitions — scroll via Lenis when present. */
export function scrollToHash() {
  const rawHash = window.location.hash;
  const hash = rawHash ? "#" + rawHash.split("#").filter(Boolean).pop() : "";
  if (hash && hash !== rawHash) {
    history.replaceState(null, "", window.location.pathname + window.location.search + hash);
  }
  if (hash) {
    scrollToElementById(hash.slice(1));
  } else if (window.__lenis) {
    window.__lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}

/** In-page "Get Aether" links: always scroll, even when the hash is already set. */
export function navigateToAetherCheckout(e: MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute("href") ?? "";
  const url = new URL(href, window.location.origin);
  const id = url.hash ? url.hash.slice(1) : AETHER_CHECKOUT_ID;

  if (url.pathname !== "/aether" || window.location.pathname !== "/aether") return;

  e.preventDefault();
  const nextHash = `#${id}`;
  if (window.location.hash !== nextHash) {
    history.pushState(null, "", `${url.pathname}${nextHash}`);
  }

  // Room for the fixed header; on mobile the checkout row often sits above the sticky bar.
  scrollToElementById(id, { immediate: false, offset: -88 });
}
