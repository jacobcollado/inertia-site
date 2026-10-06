"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { VisualNotch } from "./visual-notch";
import { MinimalFooter } from "./site-footer";
import { isThemedPath } from "./theme-provider";

const BARE_ROUTES = ["/dashboard", "/login", "/admin", "/reset-password", "/accept-invite", "/docs"];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  // Routes that set their own <html> background (via .dashboard-dark) so iOS
  // Safari tints its toolbars to match the page rather than to white. Keep in
  // sync with whoever adds that class.
  const ownsRootBackground = ["/dashboard", "/accept-invite"].some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );

  const isComponents = pathname.startsWith("/components");
  const noFooter = isComponents;
  // The homepage's AI section transitions the page to a black theme that
  // continues through the footer — every other route keeps the normal
  // light footer.
  const isHome = pathname === "/";
  const isBlogPost = pathname.startsWith("/blog/");
  // Routes that follow the light / dark switch (see theme-provider.tsx).
  // Bare routes like /docs can be themed too; they place their own switch.
  const themed = isThemedPath(pathname);

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
  // useLayoutEffect (not useEffect) so the class is added/removed before the
  // browser paints the new route — otherwise leaving the homepage scrolled
  // near the bottom (where the scroll-driven background above has animated
  // close to black) briefly flashes that dark background on the next page
  // before this cleanup catches up.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const on = isHome && !bare;
    root.classList.toggle("home-dark-root", on);
    root.classList.toggle("themed", themed);
    // Clear any stale homepage theme-color meta left by an earlier version.
    document.getElementById("home-theme-color")?.remove();
    if (!on) {
      // Leaving the homepage (possibly scrolled near the bottom, where the
      // scroll-driven animation above has animated body/html close to black)
      // — removing the class alone isn't enough, since an in-flight
      // scroll-timeline animation can take the browser a frame to relax back
      // to its unanimated value, which is exactly the window where the next
      // route flashes black. An inline background wins over the animation
      // immediately, with no such gap.
      //
      // Except on routes that pin their own root background (.dashboard-dark,
      // set for the same iOS toolbar-tinting reason). An inline style beats
      // their class, so forcing white here left the dashboard with white
      // toolbars against its dark page. Clearing it instead still cancels the
      // animation, and lets their class win.
      if (ownsRootBackground) {
        root.style.background = "";
        document.body.style.background = "";
      } else {
        // The page's own --bg: white, or the dark palette on themed routes.
        root.style.background = "rgb(var(--bg))";
        document.body.style.background = "rgb(var(--bg))";
      }
    } else {
      // Back on the homepage — clear any inline override left by a previous
      // visit elsewhere so the scroll-driven animation regains control.
      root.style.background = "";
      document.body.style.background = "";
    }
    return () => {
      root.classList.remove("home-dark-root");
    };
  }, [isHome, bare, ownsRootBackground, themed]);

  if (bare) return <>{children}</>;

  return (
    <>
      <VisualNotch />
      {children}
      {/* The page's rails run on through the footer: the homepage's frame,
          or a blog post's sheet edges. */}
      {noFooter ? null : isHome ? (
        <div className="homepage-dark-zone relative" style={{ background: "rgb(var(--bg))" }}>
          <MinimalFooter themeSwitch tone="dark" />
        </div>
      ) : isBlogPost ? (
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[56rem] -translate-x-1/2 border-x border-[rgb(var(--ink-rgb)/0.09)] sm:block"
          />
          <MinimalFooter themeSwitch={themed} rails={false} />
        </div>
      ) : (
        <MinimalFooter themeSwitch={themed} />
      )}
    </>
  );
}
