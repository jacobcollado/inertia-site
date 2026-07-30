"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createCase } from "../actions";
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
  const router = useRouter();
  const lastSenderByCase = useMemo(() => {
    const map = new Map<string, Message["sender"]>();
    for (const m of messages) {
      if (m.case_id) map.set(m.case_id, m.sender);
    }
    return map;
  }, [messages]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<CaseSeverity | "all">("all");
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    return cases.filter(c => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (severityFilter !== "all" && c.severity !== severityFilter) return false;
      if (search.trim() && !c.title.toLowerCase().includes(search.trim().toLowerCase()) && !c.case_number.includes(search.trim())) return false;
      return true;
    });
  }, [cases, statusFilter, severityFilter, search]);

  const statusLabel = STATUS_FILTERS.find(f => f.value === statusFilter)?.label ?? "All statuses";
  const severityLabel = SEVERITY_FILTERS.find(f => f.value === severityFilter)?.label ?? "All severities";

  const submitCase = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    const result = await createCase(title, body);
    setSubmitting(false);
    if (result.success && result.caseId) {
      router.push(`/dashboard/messages/${result.caseId}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full lg:max-w-[65%] mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cases..."
            className="w-full rounded-md border bg-sidebar pl-9 pr-4 py-2 text-sm tracking-tight placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium tracking-tight hover:bg-primary/90 transition-colors shrink-0"
        >
          <PlusIcon className="size-4" />
          New case
        </button>
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
        <p className="text-sm text-muted-foreground py-8">
          {cases.length === 0 ? "No cases yet. Start a new one if you need help." : "No cases match your filters."}
        </p>
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

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !submitting && setCreating(false)}>
          <div className="w-full max-w-md rounded-xl border bg-sidebar p-5 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold tracking-tight">New case</h2>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What's the issue?"
              autoFocus
              className="w-full rounded-md border bg-background px-3 py-2 text-sm tracking-tight placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Describe what's going on..."
              rows={4}
              className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm tracking-tight leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreating(false)}
                disabled={submitting}
                className="px-3.5 py-1.5 rounded-md text-sm font-medium tracking-tight hover:bg-sidebar-accent/40 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCase}
                disabled={!title.trim() || submitting}
                className="px-3.5 py-1.5 rounded-md text-sm font-medium tracking-tight bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create case"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
