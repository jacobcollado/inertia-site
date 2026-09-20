"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[] };
    _fbq?: unknown;
  }
}

/* Fires a Pixel event, or silently no-ops if the pixel never loaded (blocked
 * by an extension, missing env var). Every call site goes through this so a
 * blocked pixel can't throw inside a click handler and break checkout. */
export function trackMeta(event: string, params?: Record<string, unknown>, options?: { eventID?: string }) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    window.fbq("track", event, params ?? {}, options);
  } catch {
    // A pixel failure must never surface to the visitor.
  }
}

/* PageView on every client-side route change.
 *
 * The base snippet fires one PageView on load. Next's App Router navigates
 * without a document load, so without this the pixel would only ever see the
 * first page of a session — and the /aether landing page is usually reached
 * by a client-side nav from an ad's entry page.
 *
 * The first render after the snippet is skipped: the snippet already counted
 * that page, and firing again would double it.
 */
function MetaPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    trackMeta("PageView");
  }, [pathname, searchParams]);

  return null;
}

export function MetaPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        // The standard Meta base snippet. It stubs window.fbq synchronously and
        // queues calls, so trackMeta() works even before fbevents.js lands.
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');
fbq('track','PageView');
          `.trim(),
        }}
      />
      <Suspense fallback={null}>
        <MetaPageview />
      </Suspense>
    </>
  );
}
