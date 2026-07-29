"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon, ChevronDownIcon } from "lucide-react";
import { StatusPill } from "../status-pill";
import { fmtDate, type Project, type ProjectUpdate } from "../types";

const FILTERS = [
  { value: "all", label: "All projects" },
  { value: "active", label: "Active projects" },
  { value: "completed", label: "Completed projects" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

export function ProjectsView({ projects, projectUpdates }: { projects: Project[]; projectUpdates: ProjectUpdate[] }) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered = projects.filter(p => {
    if (filter === "active") return p.status === "active";
    if (filter === "completed") return p.status === "completed";
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const order: Record<string, number> = { active: 0, paused: 1, on_hold: 1, completed: 2 };
    const diff = (order[a.status] ?? 1) - (order[b.status] ?? 1);
    if (diff !== 0) return diff;
    return new Date(b.last_update ?? 0).getTime() - new Date(a.last_update ?? 0).getTime();
  });

  const filterLabel = FILTERS.find(f => f.value === filter)?.label ?? "All projects";

  return (
    <div className="flex flex-col gap-4 w-full lg:max-w-[58%] mx-auto">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex items-center justify-between gap-2 w-full rounded-md border bg-sidebar px-4 py-2 text-sm font-medium tracking-tight hover:bg-sidebar-accent/40 transition-colors"
            />
          }
        >
          {filterLabel}
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          {FILTERS.map(f => (
            <DropdownMenuItem key={f.value} onClick={() => setFilter(f.value)}>
              {f.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">No projects yet.</p>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-0 sm:rounded-sm sm:border sm:bg-sidebar sm:overflow-hidden">
          {sorted.map((p, i) => {
            const updates = projectUpdates.filter(u => u.project_id === p.id);
            const latestStatus = updates[0]?.status ?? p.status;
            return (
              <div
                key={p.id}
                className={`rounded-md border bg-sidebar px-5 py-4 sm:rounded-none sm:border-0 sm:border-b ${i === sorted.length - 1 ? "sm:border-b-0" : ""}`}
              >
                <div className="flex items-center justify-between gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center sm:gap-4">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[15px] font-medium tracking-tight truncate">{p.title}</span>
                      <StatusPill status={latestStatus} />
                    </div>
                    {p.phase && <span className="text-[13px] text-muted-foreground truncate">{p.phase}</span>}
                  </div>

                  <div className="hidden sm:flex flex-col gap-1 items-center">
                    <span className="text-[13px] text-muted-foreground">Updates</span>
                    <span className="text-[15px] font-semibold tabular-nums">{updates.length}</span>
                  </div>

                  <div className="hidden sm:flex flex-col gap-1 items-end pr-6">
                    <span className="text-[13px] text-muted-foreground">
                      {p.target_date ? `Target ${fmtDate(p.target_date)}` : "No target date"}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="shrink-0" />}>
                      <MoreHorizontalIcon />
                      <span className="sr-only">Project actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-44">
                      <DropdownMenuItem render={<Link href={`/dashboard/projects/${p.id}`} />}>
                        View details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="sm:hidden border-t mt-3 pt-3 flex items-end justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] text-muted-foreground">Updates</span>
                    <span className="text-[15px] font-semibold tabular-nums">{updates.length}</span>
                  </div>
                  <span className="text-[13px] text-muted-foreground">
                    {p.target_date ? `Target ${fmtDate(p.target_date)}` : "No target date"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
