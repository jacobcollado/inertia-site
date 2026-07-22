"use client";

import { usePathname } from "next/navigation";
import { VisualNotch } from "./visual-notch";
import { MinimalFooter } from "./site-footer";

const BARE_ROUTES = ["/dashboard", "/login", "/admin", "/reset-password", "/docs"];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (bare) return <>{children}</>;

  const isComponents = pathname.startsWith("/components");
  const noFooter = isComponents;
  // The homepage's AI section transitions the page to a black theme that
  // continues through the footer — every other route keeps the normal
  // light footer.
  const isHome = pathname === "/";

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
