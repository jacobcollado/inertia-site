"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { VisualNotch } from "./visual-notch";
import { MinimalFooter } from "./site-footer";

const BARE_ROUTES = ["/dashboard", "/login", "/admin", "/reset-password", "/docs"];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  const isComponents = pathname.startsWith("/components");
  const noFooter = isComponents;
  // The homepage's AI section transitions the page to a black theme that
  // continues through the footer — every other route keeps the normal
  // light footer.
  const isHome = pathname === "/";

  // The footer's dark zone only covers page content, not the <html> element
  // itself — so overscroll/rubber-band past the bottom (Safari, and anywhere
  // without a fixed bottom bar) reveals the light root background beneath the
  // dark footer. Tag <html> on the homepage so the root background can go
  // dark to match, closing that gap.
  //
  // No <meta theme-color> is set on the homepage on purpose: a single
  // theme-color value tints BOTH the top status-bar strip and the bottom
  // toolbar, so it can never be white-at-top (hero) and black-at-bottom
  // (footer) at once. Without it, iOS Safari samples the page's own top and
  // bottom edges instead — white hero at the top, dark footer at the bottom —
  // giving the correct color at each end independently. (The manifest's
  // theme_color is also set to white so it can't force the strip dark as a
  // fallback.)
  useEffect(() => {
    const root = document.documentElement;
    const on = isHome && !bare;
    root.classList.toggle("home-dark-root", on);
    // Clear any stale homepage theme-color meta left by an earlier version.
    document.getElementById("home-theme-color")?.remove();
    return () => {
      root.classList.remove("home-dark-root");
    };
  }, [isHome, bare]);

  if (bare) return <>{children}</>;

  return (
    <>
      <VisualNotch />
      {children}
      {noFooter ? null : isHome ? (
        <div className="homepage-dark-zone" style={{ background: "rgb(var(--bg))" }}>
          <MinimalFooter />
          {/* Dark backstop pinned to the very bottom of the viewport, behind
              everything. iOS Safari samples the page's bottom edge to tint the
              bottom toolbar; the document's root/body background is white, so
              past the footer the toolbar read white. This fixed black strip at
              the bottom edge gives Safari a dark color to sample there without
              affecting page layout or scroll. */}
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              height: "40vh",
              background: "#0a0a0a",
              zIndex: -1,
              pointerEvents: "none",
            }}
          />
        </div>
      ) : (
        <MinimalFooter />
      )}
    </>
  );
}
