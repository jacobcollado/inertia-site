"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { VisualNotch } from "./visual-notch";
import { SiteFooter } from "./site-footer";

const BARE_ROUTES = ["/dashboard", "/login"];

function StickyNote() {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return (
    <div className="sticky-note" style={{ opacity: gone ? 0 : 1 }}>
      <button className="sticky-note__dismiss" onClick={() => setGone(true)} aria-label="Dismiss">✕</button>
      <p className="sticky-note__text">
        Thank you for taking the time. We don&rsquo;t take that lightly, and we intend to earn it.
      </p>
      <p className="sticky-note__sig">— Inertia</p>
    </div>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (bare) return <>{children}</>;

  return (
    <>
      <VisualNotch />
      {children}
      <SiteFooter />
      <StickyNote />
    </>
  );
}
