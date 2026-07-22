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
  useEffect(() => {
    const root = document.documentElement;
    if (isHome && !bare) root.classList.add("home-dark-root");
    else root.classList.remove("home-dark-root");
    return () => root.classList.remove("home-dark-root");
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
