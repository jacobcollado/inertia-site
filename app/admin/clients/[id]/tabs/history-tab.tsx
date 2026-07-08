"use client";

import { useState } from "react";
import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">History</h2>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCwIcon className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      {log.length === 0 ? (
        <p className="text-[14px] tracking-tight text-muted-foreground py-4">No history yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-sidebar-border">
          <Table>
            <TableHeader className="bg-sidebar-accent">
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {log.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium tracking-tight text-foreground">{ACTION_LABEL[entry.action] ?? entry.action}</span>
                      {entry.detail && <span className="text-[12px] tracking-tight text-muted-foreground">{entry.detail}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{fmtDate(entry.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
