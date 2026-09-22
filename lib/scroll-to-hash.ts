import type { MouseEvent } from "react";

export const AETHER_CHECKOUT_ID = "checkout";
/** Top of the pricing section. In-page "Get Aether" CTAs land here so the
 *  heading and includes are seen before the checkout button. */
export const AETHER_PRICING_ID = "pricing";

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

/** In-page "Get Aether" links: scroll to pricing without touching the URL.
 *  Writing #pricing into history behind Next's router left the hash on the
 *  /aether entry, so a later plain /aether visit (e.g. "View Aether" on the
 *  index) could land on pricing instead of the top. */
export function navigateToAetherCheckout(e: MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute("href") ?? "";
  const url = new URL(href, window.location.origin);
  const id = url.hash ? url.hash.slice(1) : AETHER_PRICING_ID;

  if (url.pathname !== "/aether" || window.location.pathname !== "/aether") return;

  e.preventDefault();

  // Land the section's top edge just under the sticky header, measured live
  // because the demo banner inside it changes its height.
  const header = document.querySelector<HTMLElement>(".site-header");
  const headerH = header ? header.getBoundingClientRect().height : 88;
  scrollToElementById(id, { immediate: false, offset: -headerH });
}
