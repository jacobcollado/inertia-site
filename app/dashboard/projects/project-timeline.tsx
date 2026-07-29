"use client";

import { STATUS_VARIANT, type ProjectUpdate } from "../types";

export function ProjectTimeline({ updates }: { updates: ProjectUpdate[] }) {
  const fmtD = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (updates.length === 0) {
    return <p className="text-[13px] text-muted-foreground opacity-60">No updates yet.</p>;
  }

  return (
    <div className="flex flex-col gap-0">
      {updates.map((u, i) => (
        <div key={u.id} className="flex gap-4">
          <div className="flex flex-col items-center shrink-0 pt-1" style={{ width: 20 }}>
            <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_VARIANT[u.status]?.split(" ")[0] ?? "bg-muted-foreground"}`} />
            {i < updates.length - 1 && <div className="flex-1 w-px mt-1 bg-border" />}
          </div>
          <div className="flex flex-col gap-1 pb-5 min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium capitalize">{u.status.replace("_", " ")}</span>
              <span className="text-xs text-muted-foreground">{fmtD(u.created_at)}</span>
            </div>
            {u.note && <p className="text-sm text-muted-foreground leading-relaxed">{u.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
