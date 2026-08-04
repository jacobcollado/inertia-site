"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusIcon, ChevronDownIcon, SearchIcon, MessageCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLastSenderByCase } from "../support-cases";
import { CASE_STATUS_VARIANT, CASE_SEVERITY_LABEL, fmtDate, type Case, type CaseStatus, type CaseSeverity, type Message } from "../types";

const STATUS_FILTERS: { value: CaseStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "closed", label: "Closed" },
];

const SEVERITY_FILTERS: { value: CaseSeverity | "all"; label: string }[] = [
  { value: "all", label: "All severities" },
  { value: "severity_1", label: "Severity 1" },
  { value: "severity_2", label: "Severity 2" },
  { value: "severity_3", label: "Severity 3" },
  { value: "severity_4", label: "Severity 4" },
];

export function CasesView({ cases, messages }: { cases: Case[]; messages: Message[] }) {
  const lastSenderByCase = useMemo(() => getLastSenderByCase(messages), [messages]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<CaseSeverity | "all">("all");

  const filtered = useMemo(() => {
    return cases.filter(c => {
      // Closed cases are archived out of the default view — they only
      // surface once the status filter explicitly asks for them, so "All
      // statuses" reads as "all active statuses" rather than the full
      // (ever-growing) history of every case that's ever existed.
      if (statusFilter === "all" && c.status === "closed") return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (severityFilter !== "all" && c.severity !== severityFilter) return false;
      if (search.trim() && !c.title.toLowerCase().includes(search.trim().toLowerCase()) && !c.case_number.includes(search.trim())) return false;
      return true;
    });
  }, [cases, statusFilter, severityFilter, search]);

  const statusLabel = STATUS_FILTERS.find(f => f.value === statusFilter)?.label ?? "All statuses";
  const severityLabel = SEVERITY_FILTERS.find(f => f.value === severityFilter)?.label ?? "All severities";

  return (
    <div className="flex flex-col gap-4 w-full lg:max-w-[55%] mx-auto">
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cases..."
            className="w-full rounded-md border bg-sidebar pl-9 pr-4 py-2 text-sm tracking-tight placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            style={{ "--sh-ring": "var(--sh-muted-foreground)" } as React.CSSProperties}
          />
        </div>
        <Link
          href="/dashboard/messages/new"
          className="flex items-center justify-center gap-1.5 rounded-md border bg-sidebar text-foreground px-3.5 py-2 text-sm font-medium tracking-tight hover:bg-sidebar-accent/40 transition-colors shrink-0"
        >
          <PlusIcon className="size-4" />
          New case
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border bg-sidebar px-3.5 py-1.5 text-[13px] font-medium tracking-tight hover:bg-sidebar-accent/40 transition-colors"
              />
            }
          >
            {statusLabel}
            <ChevronDownIcon className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44">
            {STATUS_FILTERS.map(f => (
              <DropdownMenuItem key={f.value} onClick={() => setStatusFilter(f.value)}>
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border bg-sidebar px-3.5 py-1.5 text-[13px] font-medium tracking-tight hover:bg-sidebar-accent/40 transition-colors"
              />
            }
          >
            {severityLabel}
            <ChevronDownIcon className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44">
            {SEVERITY_FILTERS.map(f => (
              <DropdownMenuItem key={f.value} onClick={() => setSeverityFilter(f.value)}>
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border bg-sidebar px-6 py-14 text-center sm:rounded-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <MessageCircleIcon className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-medium tracking-tight">
              {cases.length === 0 ? "No cases yet" : "No matching cases"}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {cases.length === 0 ? "Start a new one if you need help with anything." : "Try different filters to see other cases."}
            </p>
          </div>
          {cases.length === 0 && (
            <Button variant="outline" size="sm" className="mt-1" nativeButton={false} render={<Link href="/dashboard/messages/new" />}>
              New case
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-0 sm:rounded-sm sm:border sm:bg-sidebar sm:overflow-hidden">
          {filtered.map((c, i) => {
            const waitingOnClient = c.status !== "closed" && lastSenderByCase.get(c.id) === "admin";
            return (
            <Link
              key={c.id}
              href={`/dashboard/messages/${c.id}`}
              className={`flex items-center justify-between gap-4 rounded-md border bg-sidebar px-5 py-4 hover:bg-sidebar-accent/40 transition-colors sm:rounded-none sm:border-0 sm:border-b ${i === filtered.length - 1 ? "sm:border-b-0" : ""}`}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[15px] font-medium tracking-tight truncate">
                  {c.title} <span className="text-muted-foreground font-normal">#{c.case_number}</span>
                </span>
                <span className="text-[13px] text-muted-foreground">Last updated {fmtDate(c.updated_at)}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {waitingOnClient && (
                  <Badge variant="outline" className="border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400 hidden sm:inline-flex">
                    We need your response
                  </Badge>
                )}
                <Badge variant="outline" className="border-transparent bg-muted text-muted-foreground">
                  {CASE_SEVERITY_LABEL[c.severity]}
                </Badge>
                <Badge variant="outline" className={`border-transparent capitalize ${CASE_STATUS_VARIANT[c.status]}`}>
                  {c.status}
                </Badge>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
