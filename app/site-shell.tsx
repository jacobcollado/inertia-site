"use client";

import { usePathname } from "next/navigation";
import { VisualNotch } from "./visual-notch";
import { SiteFooter } from "./site-footer";

const BARE_ROUTES = ["/dashboard", "/login"];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (bare) return <>{children}</>;

  return (
    <>
      <VisualNotch />
      {children}
      <SiteFooter />
    </>
  );
}
