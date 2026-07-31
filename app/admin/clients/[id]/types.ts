export type Client = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  notes?: string | null;
  banned?: boolean;
  last_sign_in_at?: string | null;
  confirmed_at?: string | null;
};
export type Project = { id: string; title: string; status: string; phase: string | null; last_update: string | null; notes: string | null; start_date: string | null; target_date: string | null };
export type ProjectUpdate = { id: string; project_id: string; status: string; note: string | null; created_at: string };
export type Invoice = { id: string; label: string; amount: number; status: string; due_date: string | null; paid_at: string | null; payment_url: string | null };
export type DFile = { id: string; label: string; url: string; uploaded_at: string };
export type Message = { id: string; client_id: string; case_id: string | null; sender: "admin" | "client"; body: string; created_at: string; read_at: string | null };
export type AuditEntry = { id: string; action: string; detail: string | null; created_at: string };
export type CaseStatus = "open" | "pending" | "closed";
export type CaseSeverity = "severity_1" | "severity_2" | "severity_3" | "severity_4";
export type Case = { id: string; client_id: string; case_number: string; title: string; status: CaseStatus; severity: CaseSeverity; created_at: string; updated_at: string; human_requested: boolean };

export const CASE_STATUS_VARIANT: Record<CaseStatus, string> = {
  open:    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  closed:  "bg-muted text-muted-foreground",
};

export const CASE_SEVERITY_LABEL: Record<CaseSeverity, string> = {
  severity_1: "Severity 1",
  severity_2: "Severity 2",
  severity_3: "Severity 3",
  severity_4: "Severity 4",
};

export function fmt$(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}

export function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const STATUS_VARIANT: Record<string, string> = {
  active:    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  completed: "bg-primary/15 text-primary",
  paused:    "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  on_hold:   "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  paid:      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending:   "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  overdue:   "bg-destructive/15 text-destructive",
  draft:     "bg-muted text-muted-foreground",
};
