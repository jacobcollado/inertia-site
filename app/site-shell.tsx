"use client";

import { usePathname } from "next/navigation";
import { VisualNotch } from "./visual-notch";
import { SiteFooter, MinimalFooter } from "./site-footer";

const BARE_ROUTES = ["/dashboard", "/login", "/admin", "/reset-password", "/docs"];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (bare) return <>{children}</>;

  const isHome = pathname === "/";
  const isPolicies = pathname.startsWith("/policies");
  const isAether = pathname.startsWith("/aether");
  const isWork = pathname.startsWith("/work");
  const useMinimalFooter = isHome || isPolicies || isAether || isWork;

  return (
    <>
      <VisualNotch />
      {children}
      {useMinimalFooter ? <MinimalFooter /> : <SiteFooter />}
    </>
  );
}
