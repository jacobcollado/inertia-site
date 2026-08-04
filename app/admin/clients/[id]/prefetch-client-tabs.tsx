"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CLIENT_TABS = ["projects", "invoices", "files", "messages", "account", "history"] as const;

export function PrefetchClientTabs({ clientId }: { clientId: string }) {
  const router = useRouter();

  useEffect(() => {
    const base = `/admin/clients/${clientId}`;
    for (const tab of CLIENT_TABS) {
      router.prefetch(`${base}/${tab}`);
    }
  }, [clientId, router]);

  return null;
}
