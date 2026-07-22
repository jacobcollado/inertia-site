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
  // The top of the mobile browser chrome (iOS Safari status-bar strip) is
  // tinted by <meta theme-color>. The homepage reads white at the very top
  // (hero), so pin theme-color WHITE there — otherwise the status strip shows
  // the dark default/manifest color as a black bar above the hero. One
  // theme-color value colors both top and bottom chrome; the bottom sits over
  // the dark footer, but white there is an acceptable tradeoff versus a black
  // bar over the white hero at the top, which is what's actually visible at
  // rest. Removed elsewhere so other routes fall back to the browser default.
  useEffect(() => {
    const root = document.documentElement;
    const on = isHome && !bare;
    root.classList.toggle("home-dark-root", on);

    const META_ID = "home-theme-color";
    let meta = document.getElementById(META_ID) as HTMLMetaElement | null;
    if (on) {
      if (!meta) {
        meta = document.createElement("meta");
        meta.id = META_ID;
        meta.name = "theme-color";
        document.head.appendChild(meta);
      }
      meta.content = "#ffffff";
    } else {
      meta?.remove();
    }

    return () => {
      root.classList.remove("home-dark-root");
      document.getElementById(META_ID)?.remove();
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
