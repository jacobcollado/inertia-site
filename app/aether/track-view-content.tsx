"use client";

import { useEffect, useRef } from "react";
import { trackMeta } from "../meta-pixel";

/* ViewContent for the Aether landing page — the top of the funnel Meta
 * optimizes against, and the page ads traffic to.
 *
 * Mounted once per visit to /aether. The ref guard keeps React's dev-mode
 * double-invoke (and any remount from a parent re-render) from sending it
 * twice for a single view.
 */
export function TrackAetherViewContent() {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackMeta("ViewContent", {
      content_name: "Aether Shopify Theme",
      content_category: "Shopify theme",
      content_ids: ["aether"],
      content_type: "product",
    });
  }, []);

  return null;
}
