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

  return (
    <>
      <VisualNotch />
      {children}
      {noFooter ? null : <MinimalFooter />}
    </>
  );
}
