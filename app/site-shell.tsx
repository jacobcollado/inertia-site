"use client";

import { usePathname } from "next/navigation";
import { VisualNotch } from "./visual-notch";
import { SiteFooter } from "./site-footer";

const BARE_ROUTES = ["/dashboard", "/login", "/admin", "/reset-password", "/docs"];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (bare) return <>{children}</>;

  return (
    <>
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9,
      }}>
        <div style={{
          position: "absolute", inset: 0,
          margin: "0 max(12px, calc(50% - 36rem))",
          borderLeft: "1px solid rgb(var(--line))",
          borderRight: "1px solid rgb(var(--line))",
        }} />
      </div>
      <VisualNotch />
      {children}
      <SiteFooter />
    </>
  );
}
