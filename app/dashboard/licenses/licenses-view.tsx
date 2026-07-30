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
import { CheckIcon, CopyIcon, MoreHorizontalIcon, ChevronDownIcon } from "lucide-react";
import { StatusPill } from "../status-pill";
import { fmtDate, type License } from "../types";

const FILTERS = [
  { value: "all", label: "All licenses" },
  { value: "lifetime", label: "Forever" },
  { value: "standard", label: "Core" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

export function LicensesView({ licenses }: { licenses: License[] }) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = licenses.filter(l => {
    if (filter === "lifetime") return l.tier === "lifetime";
    if (filter === "standard") return l.tier === "standard";
    return true;
  });

  const filterLabel = FILTERS.find(f => f.value === filter)?.label ?? "All licenses";

  const copy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

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

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">No licenses yet.</p>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-0 sm:rounded-sm sm:border sm:bg-sidebar sm:overflow-hidden">
          {filtered.map((l, i) => {
            const tierLabel = l.tier === "lifetime" ? "Forever" : "Core";
            return (
              <div
                key={l.id}
                className={`rounded-md border bg-sidebar px-5 py-4 sm:rounded-none sm:border-0 sm:border-b ${i === filtered.length - 1 ? "sm:border-b-0" : ""}`}
              >
                <div className="flex items-center justify-between gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center sm:gap-4">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[15px] font-medium tracking-tight truncate">Aether {tierLabel}</span>
                      <StatusPill status={l.status} />
                    </div>
                    <span className="text-[13px] text-muted-foreground font-mono truncate">{l.key}</span>
                  </div>

                  <div className="hidden sm:flex flex-col gap-1 items-center">
                    <span className="text-[13px] text-muted-foreground">Domain</span>
                    <span className="text-[15px] font-medium truncate max-w-40">{l.domain ?? "Not assigned"}</span>
                  </div>

                  <div className="hidden sm:flex flex-col gap-1 items-end">
                    <span className="text-[13px] text-muted-foreground">
                      Purchased {fmtDate(l.created_at)}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="shrink-0" />}>
                      <MoreHorizontalIcon />
                      <span className="sr-only">License actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-44">
                      <DropdownMenuItem render={<Link href={`/dashboard/licenses/${l.id}`} />}>
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copy(l.key)}>
                        {copied === l.key ? <CheckIcon className="text-[#2E873F]" /> : <CopyIcon />}
                        {copied === l.key ? "Copied" : "Copy key"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="sm:hidden border-t mt-3 pt-3 flex items-end justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] text-muted-foreground">Domain</span>
                    <span className="text-[15px] font-medium">{l.domain ?? "Not assigned"}</span>
                  </div>
                  <span className="text-[13px] text-muted-foreground">
                    Purchased {fmtDate(l.created_at)}
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
