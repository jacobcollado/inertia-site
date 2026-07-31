"use client";

import { useState } from "react";
import { RefreshCwIcon, HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminLog } from "../../../actions";
import { fmtDate, type AuditEntry } from "../types";

const ACTION_LABEL: Record<string, string> = {
  suspend:         "Account suspended",
  unsuspend:       "Account reinstated",
  email_change:    "Email updated",
  password_change: "Password changed",
  invite_sent:     "Invite sent",
};

export function HistoryTab({ clientId, initial }: { clientId: string; initial: AuditEntry[] }) {
  const [log, setLog] = useState<AuditEntry[]>(initial);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const fresh = await getAdminLog(clientId);
    setLog(fresh);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full lg:max-w-[58%] mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">History</h2>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCwIcon className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      {log.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border bg-sidebar px-6 py-14 text-center sm:rounded-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <HistoryIcon className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-medium tracking-tight">No history yet</p>
            <p className="text-[13px] text-muted-foreground">Account actions taken on this client will show up here.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-0 sm:rounded-sm sm:border sm:bg-sidebar sm:overflow-hidden">
          {log.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between gap-4 rounded-md border bg-sidebar px-5 py-4 sm:rounded-none sm:border-0 sm:border-b ${i === log.length - 1 ? "sm:border-b-0" : ""}`}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[15px] font-medium tracking-tight truncate">{ACTION_LABEL[entry.action] ?? entry.action}</span>
                {entry.detail && <span className="text-[13px] text-muted-foreground truncate">{entry.detail}</span>}
              </div>
              <span className="text-[13px] text-muted-foreground shrink-0">{fmtDate(entry.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
