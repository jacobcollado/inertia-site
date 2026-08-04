"use client";

import { useMemo, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PORTAL_CHANGELOG,
  formatChangelogDate,
  type PortalChangelogEntry,
  type PortalNoteType,
} from "@/lib/portal-changelog";

const TYPE_PILL =
  "border-transparent text-muted-foreground";
const TYPE_PILL_BG = { backgroundColor: "color-mix(in srgb, var(--sh-foreground) 10%, transparent)" };

const TYPE_LABELS: Record<PortalNoteType, string> = {
  added: "Added",
  improved: "Improved",
  fixed: "Fixed",
  removed: "Removed",
};

const TYPE_DOT: Record<PortalNoteType, string> = {
  added: "bg-[#2E873F]",
  improved: "bg-primary",
  fixed: "bg-amber-500",
  removed: "bg-muted-foreground/60",
};

function groupByDate(entries: PortalChangelogEntry[]) {
  const groups: { date: string; items: PortalChangelogEntry[] }[] = [];
  for (const entry of entries) {
    const last = groups.at(-1);
    if (last?.date === entry.date) last.items.push(entry);
    else groups.push({ date: entry.date, items: [entry] });
  }
  return groups;
}

function ChangeItem({ entry }: { entry: PortalChangelogEntry }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={cn("shrink-0 gap-1.5 font-medium", TYPE_PILL)} style={TYPE_PILL_BG}>
          <span className={cn("size-1.5 shrink-0 rounded-full", TYPE_DOT[entry.type])} aria-hidden />
          {TYPE_LABELS[entry.type]}
        </Badge>
        <span className="text-[15px] font-medium tracking-tight">{entry.title}</span>
      </div>
      {entry.detail && (
        <p className="text-[13px] leading-relaxed text-muted-foreground">{entry.detail}</p>
      )}
    </div>
  );
}

function DateGroup({ date, items, isLatest }: { date: string; items: PortalChangelogEntry[]; isLatest: boolean }) {
  const [improvedOpen, setImprovedOpen] = useState(false);
  const primary = items.filter(item => item.type !== "improved");
  const improved = items.filter(item => item.type === "improved");

  return (
    <div className="flex flex-col gap-4 rounded-md border bg-sidebar px-5 py-4 sm:rounded-sm">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium tabular-nums tracking-tight">{formatChangelogDate(date)}</span>
        {isLatest && (
          <Badge variant="outline" className="border-transparent bg-primary/15 text-primary">
            Latest
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {primary.map(entry => (
          <ChangeItem key={entry.title} entry={entry} />
        ))}
        {improved.length > 0 && (
          <>
            <button
              type="button"
              className="flex w-fit items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setImprovedOpen(open => !open)}
            >
              {improved.length} improvement{improved.length === 1 ? "" : "s"}
              <ChevronDownIcon className={cn("size-3.5 transition-transform duration-200", improvedOpen && "rotate-180")} />
            </button>
            {improvedOpen && improved.map(entry => (
              <ChangeItem key={entry.title} entry={entry} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export function ChangelogView() {
  const groups = useMemo(() => groupByDate(PORTAL_CHANGELOG), []);

  return (
    <div className="flex w-full flex-col gap-4 lg:max-w-[58%] mx-auto">
      <div className="flex flex-col gap-3">
        {groups.map((group, i) => (
          <DateGroup key={group.date} date={group.date} items={group.items} isLatest={i === 0} />
        ))}
      </div>
    </div>
  );
}
