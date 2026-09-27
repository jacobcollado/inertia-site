"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* Clears the "Your bonuses are ready" notice the first time the page is
 * opened. Stored on the user, like welcome_seen, so it holds across devices.
 * The refresh re-renders the layout so the bell updates straight away. */
export function MarkBonusesSeen() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    void createClient()
      .auth.updateUser({ data: { bonuses_seen: true } })
      .then(({ error }) => {
        if (!cancelled && !error) router.refresh();
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
