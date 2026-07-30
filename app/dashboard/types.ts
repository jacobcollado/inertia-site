export type NotificationPrefs = { new_message: boolean; invoice_due: boolean; project_update: boolean };
export type Client = { id: string; email: string; name: string | null; company: string | null; notification_prefs?: NotificationPrefs };
export type Project = { id: string; title: string; status: string; phase: string | null; last_update: string | null; notes: string | null; start_date: string | null; target_date: string | null };
export type ProjectUpdate = { id: string; project_id: string; status: string; note: string | null; created_at: string };
export type Invoice = { id: string; label: string; amount: number; status: string; due_date: string | null; paid_at: string | null; payment_url: string | null };
export type DFile = { id: string; label: string; url: string; uploaded_at: string };
export type Message = { id: string; client_id: string; case_id: string | null; sender: "admin" | "client"; body: string; created_at: string; read_at: string | null };
export type CaseStatus = "open" | "pending" | "closed";
export type CaseSeverity = "severity_1" | "severity_2" | "severity_3" | "severity_4";
export type Case = { id: string; client_id: string; case_number: string; title: string; status: CaseStatus; severity: CaseSeverity; created_at: string; updated_at: string };

export const CASE_STATUS_VARIANT: Record<CaseStatus, string> = {
  open:    "bg-[#2E873F]/15 text-[#2E873F]",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  closed:  "bg-muted text-muted-foreground",
};

export const CASE_SEVERITY_LABEL: Record<CaseSeverity, string> = {
  severity_1: "Severity 1",
  severity_2: "Severity 2",
  severity_3: "Severity 3",
  severity_4: "Severity 4",
};
export type License = { id: string; key: string; email: string; domain: string | null; tier: string; status: string; created_at: string; theme_file_path: string | null };

export const STATUS_VARIANT: Record<string, string> = {
  active:    "bg-[#2E873F]/15 text-[#2E873F]",
  completed: "bg-[#0a84ff]/15 text-[#0a84ff]",
  paused:    "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  on_hold:   "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  paid:      "bg-[#2E873F]/15 text-[#2E873F]",
  pending:   "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  overdue:   "bg-destructive/15 text-destructive",
  draft:     "bg-muted text-muted-foreground",
};

export const LICENSE_STATUS_VARIANT: Record<string, string> = {
  active:  "bg-[#2E873F]/15 text-[#2E873F]",
  expired: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  revoked: "bg-destructive/15 text-destructive",
};

const currencyFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export function fmt$(cents: number) { return currencyFmt.format(cents / 100); }
export function fmtDate(iso: string | null) { return iso ? dateFmt.format(new Date(iso)) : null; }
