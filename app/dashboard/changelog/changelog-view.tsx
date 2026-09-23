"use client";

import { useMemo, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsIndicator } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  PORTAL_CHANGELOG,
  formatChangelogDate,
  type PortalChangelogEntry,
  type PortalNoteType,
} from "@/lib/portal-changelog";
import { AETHER_CHANGELOG } from "@/lib/aether-changelog";

// Theme releases carry their notes under one version, so each release
// becomes one group, dated and labeled with its version.
type ChangeGroup = { date: string; version?: string; items: Pick<PortalChangelogEntry, "type" | "title" | "detail">[] };

const THEME_GROUPS: ChangeGroup[] = AETHER_CHANGELOG.map(release => ({
  date: release.date,
  version: release.version,
  items: release.notes,
}));

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
  const groups: ChangeGroup[] = [];
  for (const entry of entries) {
    const last = groups.at(-1);
    if (last?.date === entry.date) last.items.push(entry);
    else groups.push({ date: entry.date, items: [entry] });
  }
  return groups;
}

// Titles only by default; a note's description opens from its title so a
// long release reads as a scannable list.
function ChangeItem({ entry }: { entry: ChangeGroup["items"][number] }) {
  const [open, setOpen] = useState(false);
  const badge = (
    <Badge variant="outline" className={cn("shrink-0 gap-1.5 font-medium", TYPE_PILL)} style={TYPE_PILL_BG}>
      <span className={cn("size-1.5 shrink-0 rounded-full", TYPE_DOT[entry.type])} aria-hidden />
      {TYPE_LABELS[entry.type]}
    </Badge>
  );

  if (!entry.detail) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {badge}
        <span className="text-[15px] font-medium tracking-tight">{entry.title}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="group flex w-full items-start gap-2 text-left"
      >
        <span className="flex flex-1 flex-wrap items-center gap-2">
          {badge}
          <span className="text-[15px] font-medium tracking-tight group-hover:text-muted-foreground transition-colors">{entry.title}</span>
        </span>
        <ChevronDownIcon className={cn("mt-1 size-3.5 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <p className="text-[13px] leading-relaxed text-muted-foreground animate-in fade-in-0 duration-200">{entry.detail}</p>
      )}
    </div>
  );
}

function DateGroup({ date, version, items, isLatest }: ChangeGroup & { isLatest: boolean }) {
  const [improvedOpen, setImprovedOpen] = useState(false);
  const primary = items.filter(item => item.type !== "improved");
  const improved = items.filter(item => item.type === "improved");

  return (
    <div className="flex flex-col gap-4 rounded-md border bg-sidebar px-5 py-4 sm:rounded-sm">
      <div className="flex items-center gap-2">
        {version && <span className="text-[13px] font-medium tabular-nums tracking-tight">v{version}</span>}
        <span className={cn("text-[13px] tabular-nums tracking-tight", version ? "text-muted-foreground" : "font-medium")}>
          {formatChangelogDate(date)}
        </span>
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

function GroupList({ groups }: { groups: ChangeGroup[] }) {
  return (
    <div className="flex flex-col gap-3">
      {groups.map((group, i) => (
        <DateGroup key={`${group.date}-${group.version ?? ""}`} {...group} isLatest={i === 0} />
      ))}
    </div>
  );
}

const TRIGGER = "relative z-10 flex-none rounded-sm px-3 data-[active]:bg-transparent data-[active]:shadow-none";

export function ChangelogView() {
  const dashboardGroups = useMemo(() => groupByDate(PORTAL_CHANGELOG), []);

  return (
    <div className="flex w-full flex-col gap-4 lg:max-w-[58%] mx-auto">
      <Tabs defaultValue="theme" className="gap-4">
        <TabsList className="relative bg-sidebar rounded-md border w-fit h-10 p-1">
          <TabsIndicator />
          <TabsTrigger value="theme" className={TRIGGER}>Aether theme</TabsTrigger>
          <TabsTrigger value="dashboard" className={TRIGGER}>Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <GroupList groups={dashboardGroups} />
        </TabsContent>
        <TabsContent value="theme">
          <GroupList groups={THEME_GROUPS} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
