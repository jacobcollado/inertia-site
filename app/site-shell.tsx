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
  // iOS 26 Safari ignores <meta theme-color> and instead tints its top/bottom
  // toolbars from the page's background: it samples fixed/sticky elements near
  // each viewport edge, falling back to the <body> background. The homepage
  // needs white at the top (hero) and black at the bottom (footer), which one
  // static background can't do. The technique (see .home-dark-root in
  // globals.css) is a scroll-driven background animation on html/body — light
  // at the start, dark at the end — because overscroll uniquely samples the
  // live body background, so the top rubber-band reads the light keyframe and
  // the bottom reads the dark one. This class just scopes that to the homepage.
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
        </div>
      ) : (
        <MinimalFooter />
      )}
    </>
  );
}
