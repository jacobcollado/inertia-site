"use client";

import type { PostHog } from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, createContext, useContext } from "react";

type PostHogHandle = {
  instance: PostHog | null;
  // If consent is decided before the deferred posthog-js load finishes, the
  // choice is queued here and applied as soon as the instance is ready,
  // instead of silently no-oping.
  setConsent: (allowed: boolean) => void;
};

const PostHogContext = createContext<PostHogHandle>({ instance: null, setConsent: () => {} });

// Apply a consent decision to a loaded instance. On opt-in we also explicitly
// start session recording, since it's disabled at init so nothing records
// before consent; on opt-out we make sure it's stopped.
function applyConsentTo(posthog: PostHog, allowed: boolean) {
  if (allowed) {
    posthog.opt_in_capturing();
    posthog.startSessionRecording?.();
  } else {
    posthog.opt_out_capturing();
    posthog.stopSessionRecording?.();
  }
}

// posthog-js (plus its session-recording/surveys/web-vitals sub-bundles) is
// large enough to compete with initial hydration on a throttled mobile CPU,
// so it's dynamically imported and initialized after first paint instead of
// being bundled into the app's initial JS chunk.
function usePostHogInstance(): PostHogHandle {
  const [ph, setPh] = useState<PostHog | null>(null);
  const pendingConsent = useRef<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      import("posthog-js").then(({ default: posthog }) => {
        if (cancelled) return;
        if (!posthog.__loaded) {
          posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
            api_host: "/ingest",
            ui_host: "https://us.posthog.com",
            person_profiles: "identified_only",
            capture_pageview: false,
            capture_pageleave: true,
            capture_performance: true,
            // Capture nothing until the visitor opts in. Without this, init
            // starts autocapture AND session recording (rrweb) immediately —
            // and rrweb continuously serializes DOM mutations, which on a
            // mobile CPU, over the hero's constantly-animating beam/carousel,
            // dropped frames the entire time until consent resolved. Recording
            // is also disabled at init and only started on opt-in, so rrweb
            // never runs for a visitor who hasn't agreed.
            opt_out_capturing_by_default: true,
            disable_session_recording: true,
            session_recording: {
              maskAllInputs: true,
              maskTextSelector: "input, textarea, [data-ph-mask]",
            },
          });
        }
        // Apply an already-stored choice from a previous visit, then any
        // choice made this session before the instance finished loading.
        let stored: string | null = null;
        try { stored = localStorage.getItem("cookie_consent"); } catch {}
        if (stored === "accepted") applyConsentTo(posthog, true);
        else if (stored === "declined") applyConsentTo(posthog, false);
        if (pendingConsent.current !== null) applyConsentTo(posthog, pendingConsent.current);
        setPh(posthog);
      });
    };
    // Defer until the browser is idle (or after a short fallback delay) so
    // it never competes with the initial render/hydration.
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(load, { timeout: 3000 });
      return () => { cancelled = true; cancelIdleCallback(id); };
    }
    const id = setTimeout(load, 1500);
    return () => { cancelled = true; clearTimeout(id); };
  }, []);

  const setConsent = (allowed: boolean) => {
    if (ph) applyConsentTo(ph, allowed);
    else pendingConsent.current = allowed;
  };

  return { instance: ph, setConsent };
}

function PostHogPageview({ posthog }: { posthog: PostHog }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    posthog.capture("$pageview");
  }, [pathname, searchParams, posthog]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const handle = usePostHogInstance();

  return (
    <PostHogContext.Provider value={handle}>
      {handle.instance && (
        <Suspense fallback={null}>
          <PostHogPageview posthog={handle.instance} />
        </Suspense>
      )}
      {children}
    </PostHogContext.Provider>
  );
}

export function usePostHog() {
  return useContext(PostHogContext).setConsent;
}
