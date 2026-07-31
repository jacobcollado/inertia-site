"use client";

import { useSetAdminClientNav } from "../../admin-client-nav-context";

export function ClientNavPublisher({ id, label, unreadCount }: { id: string; label: string; unreadCount: number }) {
  useSetAdminClientNav({ id, label, unreadCount });
  return null;
}
