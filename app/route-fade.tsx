"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Routes with their own persistent shell (sidebar, nav, etc.) that must not
// be torn down and remounted on every navigation — the key={pathname} remount
// below is skipped for these so their layout survives route changes.
const PERSISTENT_SHELL_PREFIXES = ["/admin", "/dashboard"];

// Scrolls to whatever the current URL's hash points at (via Lenis, which
// owns scrolling on this site and doesn't follow native anchor navigation
// on its own), or to the top if there is none. Exported as a plain function
// rather than inlined in the effect below so it can be called both on real
// pathname changes and — separately — whenever only the hash changes, which
// is the case for clicking between two /work#project-x cards without ever
// leaving /work.
function scrollToHash() {
  // Next's router can leave a stale hash from a previous navigation
  // trailing onto a new one when only the hash segment changes (observed
  // as the URL bar showing "#project-a#project-b" after clicking a second
  // project link while already on /work) — location.hash itself can still
  // report that malformed trailing fragment, so pull the *last* #-segment
  // rather than trusting the whole hash string.
  const rawHash = window.location.hash;
  const hash = rawHash ? "#" + rawHash.split("#").filter(Boolean).pop() : "";
  if (hash && hash !== rawHash) {
    history.replaceState(null, "", window.location.pathname + window.location.search + hash);
  }
  if (hash) {
    requestAnimationFrame(() => {
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      if (window.__lenis) {
        // Lenis caches the document's scrollable height at init and doesn't
        // notice new content growing the page on its own — without forcing
        // a recalculation first, scrollTo() clamps to that stale (shorter)
        // height, which is why targets further down the page (later
        // projects, with more content above them) kept landing short while
        // early ones happened to already be within the stale bounds.
        window.__lenis.resize();
        window.__lenis.scrollTo(target, { immediate: true });
      } else {
        target.scrollIntoView({ behavior: "auto" });
      }
    });
  } else if (window.__lenis) {
    window.__lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}

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

  // Clicking between two /work#project-x cards without leaving /work never
  // changes `pathname`, so the effect below (keyed on pathname) never
  // re-runs for the second click — the page just stayed wherever the first
  // click's scroll had landed. This listens for the hash itself changing,
  // independent of whether Next's router treats it as a real navigation.
  useEffect(() => {
    const onHashChange = () => scrollToHash();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    isInitialLoad.current = false;
    const el = ref.current;
    if (!el) return;

    // A destination with a hash (e.g. /work#project-ellora-la) wants to land
    // on that section, not the top of the page. This covers the case where
    // pathname itself changed (e.g. arriving at /work#project-x from /) —
    // see the hashchange listener above for hash-only changes within /work.
    scrollToHash();

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
