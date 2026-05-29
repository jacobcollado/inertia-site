"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/app/theme-toggle";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import {
  createProject, updateProject, deleteProject, addProjectUpdate,
  createInvoice, updateInvoiceStatus, deleteInvoice,
  addFile, deleteFile, updateClient,
  suspendAccount, unsuspendAccount, deleteAccount,
  updateAccountEmail, updateAccountPassword, resendInvite,
  forceSignOut, generateMagicLink, updateClientNotes,
  addFileFromUrl, getSignedFileUrl, sendAdminMessage, markMessagesRead,
  getAdminLog,
} from "../../actions";

/* ── Types ────────────────────────────────────────────────────────── */

type Client  = { id: string; email: string; name: string | null; company: string | null; notes?: string | null; banned?: boolean; last_sign_in_at?: string | null; confirmed_at?: string | null };
type Project = { id: string; title: string; status: string; phase: string | null; last_update: string | null; notes: string | null; start_date: string | null; target_date: string | null };
type ProjectUpdate = { id: string; project_id: string; status: string; note: string | null; created_at: string };
type Invoice = { id: string; label: string; amount: number; status: string; due_date: string | null; paid_at: string | null; payment_url: string | null };
type DFile   = { id: string; label: string; url: string; uploaded_at: string };
type Message = { id: string; client_id: string; sender: "admin" | "client"; body: string; created_at: string; read_at: string | null };
type AuditEntry = { id: string; action: string; detail: string | null; created_at: string };
type Tab     = "projects" | "invoices" | "files" | "messages" | "account" | "history";

/* ── Helpers ──────────────────────────────────────────────────────── */

function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}

function fmt$(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_COLOR: Record<string, string> = {
  active:    "rgb(var(--green))",
  completed: "rgb(var(--blue))",
  paused:    "rgb(var(--amber))",
  on_hold:   "rgb(var(--amber))",
  paid:      "rgb(var(--green))",
  pending:   "rgb(var(--amber))",
  overdue:   "#ef4444",
  draft:     "rgb(var(--muted))",
};

function StatusPill({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? "rgb(var(--muted))";
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] sm:text-[14px] tracking-tight px-3 py-1.5 rounded-full capitalize shrink-0"
      style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
      {status.replace("_", " ")}
    </span>
  );
}

const inputClass = "w-full bg-transparent border-b border-[rgb(var(--line))] py-4 text-[16px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none focus:border-[rgb(var(--fg))] transition-colors";

const selectClass = "w-full bg-[rgb(var(--bg))] border-b border-[rgb(var(--line))] py-4 text-[16px] tracking-tight text-[rgb(var(--fg))] focus:outline-none focus:border-[rgb(var(--fg))] transition-colors";

/* ── Projects tab ─────────────────────────────────────────────────── */

function ProjectTimeline({ project, updates, clientId }: { project: Project; updates: ProjectUpdate[]; clientId: string }) {
  const [open, setOpen] = useState(false);
  const [addingUpdate, setAddingUpdate] = useState(false);
  const [status, setStatus] = useState(project.status);
  const [note, setNote] = useState("");
  const [localUpdates, setLocalUpdates] = useState(updates);
  const [pending, startTransition] = useTransition();

  const onPostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;
    const newEntry: ProjectUpdate = {
      id: `optimistic-${Date.now()}`,
      project_id: project.id,
      status,
      note: note || null,
      created_at: new Date().toISOString(),
    };
    setLocalUpdates(prev => [newEntry, ...prev]);
    const s = status, n = note;
    setNote("");
    setAddingUpdate(false);
    startTransition(async () => {
      await addProjectUpdate(project.id, clientId, s, n || null);
    });
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="flex flex-col">
      {/* Project header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 group">
        <div className="flex flex-col gap-1 min-w-0">
          <button onClick={() => setOpen(o => !o)} className="text-left">
            <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] hover:opacity-70 transition-opacity">{project.title}</span>
          </button>
          {project.phase && <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">{project.phase}</span>}
          {project.notes && <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 leading-relaxed max-w-md">{project.notes}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusPill status={localUpdates[0]?.status ?? project.status} />
          <button
            onClick={() => { setOpen(true); setAddingUpdate(true); }}
            className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
          >
            Update
          </button>
        </div>
      </div>

      {/* Timeline — shown when expanded */}
      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-[rgb(var(--line))] pt-4">

          {/* Post update form */}
          {addingUpdate ? (
            <form onSubmit={onPostUpdate} className="flex flex-col gap-3 pt-1">
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="bg-[rgb(var(--bg))] border border-[rgb(var(--line))] rounded-full px-4 py-2 text-[13px] tracking-tight text-[rgb(var(--fg))] focus:outline-none w-fit"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="on_hold">On hold</option>
                <option value="completed">Completed</option>
              </select>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Note (optional)"
                rows={2}
                className="bg-transparent border border-[rgb(var(--line))] rounded-xl px-4 py-3 text-[14px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-35 focus:outline-none resize-none transition-colors"
              />
              <div className="flex items-center gap-3">
                <button type="submit" disabled={pending}
                  className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-30">
                  {pending ? "Posting..." : "Post update"}
                </button>
                <button type="button" onClick={() => setAddingUpdate(false)}
                  className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 hover:opacity-100 transition-opacity">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAddingUpdate(true)}
              className="self-start text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-40 hover:opacity-80 transition-opacity flex items-center gap-1.5 pt-1"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                <line x1="8" y1="3" x2="8" y2="13" /><line x1="3" y1="8" x2="13" y2="8" />
              </svg>
              Add update
            </button>
          )}

          {/* Timeline entries */}
          {localUpdates.length === 0 ? (
            <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-30">No updates yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {localUpdates.map(u => (
                <div key={u.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <StatusPill status={u.status} />
                    <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40">{fmtDate(u.created_at)}</span>
                  </div>
                  {u.note && <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-70 leading-relaxed ml-1">{u.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectsTab({ clientId, projects, projectUpdates }: { clientId: string; projects: Project[]; projectUpdates: ProjectUpdate[] }) {
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();

  const onAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createProject(clientId, fd);
      setAdding(false);
    });
  };

  const cardStyle = { border: "1px solid rgb(var(--line))", background: "rgb(var(--line) / 0.2)" };
  const btnClass = "px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium border border-[rgb(var(--line))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors disabled:opacity-30";
  const btnPrimary = "px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-30";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Projects</h2>
        {!adding && (
          <button onClick={() => setAdding(true)} className={btnClass}>
            + Add project
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <form onSubmit={onAdd} className="flex flex-col">
            {[
              { name: "title", placeholder: "Project title", required: true },
              { name: "phase", placeholder: "Phase (e.g. Design review)" },
            ].map(f => (
              <div key={f.name} className="px-5 py-4 border-b border-[rgb(var(--line))]">
                <input name={f.name} required={f.required} placeholder={f.placeholder}
                  className="w-full bg-transparent text-[15px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none" />
              </div>
            ))}
            <div className="px-5 py-4 border-b border-[rgb(var(--line))]">
              <select name="status" defaultValue="active"
                className="w-full bg-transparent text-[15px] tracking-tight text-[rgb(var(--fg))] focus:outline-none appearance-none">
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="on_hold">On hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="grid grid-cols-2 border-b border-[rgb(var(--line))]">
              <div className="px-5 py-4 border-r border-[rgb(var(--line))]">
                <label className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-50 block mb-1.5">Start date</label>
                <input name="start_date" type="date" className="w-full bg-transparent text-[14px] tracking-tight text-[rgb(var(--fg))] focus:outline-none" />
              </div>
              <div className="px-5 py-4">
                <label className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-50 block mb-1.5">Target date</label>
                <input name="target_date" type="date" className="w-full bg-transparent text-[14px] tracking-tight text-[rgb(var(--fg))] focus:outline-none" />
              </div>
            </div>
            <div className="px-5 py-4 border-b border-[rgb(var(--line))]">
              <textarea name="notes" rows={2} placeholder="Notes visible to client"
                className="w-full bg-transparent text-[15px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none resize-none" />
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              <button type="submit" disabled={pending} className={btnPrimary}>{pending ? "Saving..." : "Save"}</button>
              <button type="button" onClick={() => setAdding(false)} className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {projects.length === 0 && !adding ? (
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-40 py-4">No projects yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((p) => (
            <div key={p.id} className="rounded-2xl overflow-hidden" style={cardStyle}>
              <ProjectTimeline project={p} updates={projectUpdates.filter(u => u.project_id === p.id)} clientId={clientId} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Invoices tab ─────────────────────────────────────────────────── */

function InvoicesTab({ clientId, invoices }: { clientId: string; invoices: Invoice[] }) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const onAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createInvoice(clientId, fd);
      if (res.error) { setError(res.error); return; }
      setAdding(false);
    });
  };

  const onStatusChange = (invoiceId: string, status: string) => {
    startTransition(async () => {
      await updateInvoiceStatus(invoiceId, clientId, status);
    });
  };

  const onDelete = (invoiceId: string) => {
    startTransition(async () => {
      await deleteInvoice(invoiceId, clientId);
    });
  };

  const totalOwed = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0);

  const cardStyle = { border: "1px solid rgb(var(--line))", background: "rgb(var(--line) / 0.2)" };
  const btnClass = "px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium border border-[rgb(var(--line))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors disabled:opacity-30";
  const btnPrimary = "px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-30";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Invoices</h2>
          {totalOwed > 0 && <p className="text-[13px] tracking-tight mt-0.5" style={{ color: "rgb(var(--amber))" }}>{fmt$(totalOwed)} outstanding</p>}
        </div>
        {!adding && <button onClick={() => setAdding(true)} className={btnClass}>+ Add invoice</button>}
      </div>

      {adding && (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <form onSubmit={onAdd} className="flex flex-col">
            {[
              { name: "label", placeholder: "Invoice label", required: true, type: "text" },
              { name: "amount", placeholder: "Amount (USD)", required: true, type: "number" },
              { name: "due_date", placeholder: "Due date", type: "date" },
              { name: "payment_url", placeholder: "Payment link (optional)", type: "url" },
            ].map(f => (
              <div key={f.name} className="px-5 py-4 border-b border-[rgb(var(--line))]">
                {f.name === "due_date" && <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-50 mb-1.5">Due date</p>}
                <input name={f.name} type={f.type} required={f.required} placeholder={f.placeholder}
                  className="w-full bg-transparent text-[15px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none" />
              </div>
            ))}
            <div className="px-5 py-4 border-b border-[rgb(var(--line))]">
              <select name="status" defaultValue="pending"
                className="w-full bg-transparent text-[15px] tracking-tight text-[rgb(var(--fg))] focus:outline-none appearance-none">
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            {error && <p className="px-5 pt-2 text-[13px] text-red-400 tracking-tight">{error}</p>}
            <div className="flex items-center gap-3 px-5 py-4">
              <button type="submit" disabled={pending} className={btnPrimary}>{pending ? "Saving..." : "Save"}</button>
              <button type="button" onClick={() => setAdding(false)} className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {invoices.length === 0 && !adding ? (
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-40 py-4">No invoices yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {invoices.map((inv) => {
            const overdue = inv.status === "overdue";
            return (
              <div key={inv.id} className="rounded-2xl overflow-hidden group"
                style={{ border: `1px solid ${overdue ? "rgb(239 68 68 / 0.3)" : "rgb(var(--line))"}`, background: overdue ? "rgb(239 68 68 / 0.03)" : "rgb(var(--line) / 0.2)" }}>
                <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] truncate">{inv.label}</span>
                    {inv.paid_at
                      ? <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">Paid {fmtDate(inv.paid_at)}</span>
                      : inv.due_date
                        ? <span className="text-[13px] tracking-tight" style={{ color: overdue ? "#ef4444" : "rgb(var(--muted))", opacity: overdue ? 0.9 : 0.6 }}>
                            {overdue ? "Overdue " : "Due "}{fmtDate(inv.due_date)}
                          </span>
                        : null
                    }
                  </div>
                  <span className="text-[1.4rem] font-semibold tabular-nums tracking-tight text-[rgb(var(--fg))] shrink-0">{fmt$(inv.amount)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 px-5 py-3 border-t" style={{ borderColor: overdue ? "rgb(239 68 68 / 0.15)" : "rgb(var(--line))" }}>
                  <select value={inv.status} onChange={e => onStatusChange(inv.id, e.target.value)}
                    className="bg-transparent text-[13px] tracking-tight text-[rgb(var(--muted))] focus:outline-none cursor-pointer appearance-none">
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <button onClick={() => onDelete(inv.id)} disabled={pending}
                    className="text-[13px] tracking-tight text-red-400 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity disabled:opacity-20">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Files tab ────────────────────────────────────────────────────── */

function OpenFileButton({ url }: { url: string }) {
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    const res = await getSignedFileUrl(url);
    setLoading(false);
    if (res.url) window.open(res.url, "_blank", "noreferrer");
  };
  return (
    <button onClick={onClick} disabled={loading}
      className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors disabled:opacity-40">
      {loading ? "..." : "Open"}
    </button>
  );
}

function FilesTab({ clientId, files }: { clientId: string; files: DFile[] }) {
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pending, startTransition] = useTransition();

  const uploadFile = async (file: File, label?: string) => {
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("label", label || file.name);
    const res = await addFile(clientId, fd);
    setUploading(false);
    if (res.error) { setError(res.error); return; }
    setAdding(false);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const file = (form.querySelector("input[type=file]") as HTMLInputElement)?.files?.[0];
    const label = (form.querySelector("input[name=label]") as HTMLInputElement)?.value;
    if (!file) return;
    uploadFile(file, label);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const onDelete = (fileId: string) => {
    startTransition(async () => {
      await deleteFile(fileId, clientId);
    });
  };

  const cardStyle = { border: "1px solid rgb(var(--line))", background: "rgb(var(--line) / 0.2)" };
  const btnClass = "px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium border border-[rgb(var(--line))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors disabled:opacity-30";
  const btnPrimary = "px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-30";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Files</h2>
        {!adding && <button onClick={() => setAdding(true)} className={btnClass}>+ Upload file</button>}
      </div>

      {adding && (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <form onSubmit={onSubmit} className="flex flex-col">
            <label
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className="flex flex-col items-center justify-center gap-2 mx-5 my-4 border border-dashed rounded-xl px-6 py-8 cursor-pointer transition-colors"
              style={{ borderColor: dragOver ? "rgb(var(--fg))" : "rgb(var(--line))", background: dragOver ? "rgb(var(--line)/0.15)" : "transparent" }}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 opacity-30" aria-hidden="true">
                <path d="M10 3v10M6 7l4-4 4 4M3 15v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2" />
              </svg>
              <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">
                {uploading ? "Uploading..." : "Drop a file or click to browse"}
              </span>
              <input type="file" className="hidden" disabled={uploading}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
            </label>
            <div className="px-5 py-4 border-t border-[rgb(var(--line))]">
              <input name="label" placeholder="Custom label (optional)" className="w-full bg-transparent text-[15px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none" />
            </div>
            {error && <p className="px-5 text-[13px] text-red-400 tracking-tight">{error}</p>}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[rgb(var(--line))]">
              <button type="submit" disabled={uploading} className={btnPrimary}>{uploading ? "Uploading..." : "Upload"}</button>
              <button type="button" onClick={() => { setAdding(false); setError(""); }} className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {files.length === 0 && !adding ? (
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-40 py-4">No files yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {files.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-4 px-4 py-4 rounded-2xl group" style={cardStyle}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-bold tracking-wider"
                  style={{ background: "rgb(var(--line))", color: "rgb(var(--muted))" }}>
                  {(f.label.match(/\.([a-zA-Z0-9]+)$/) ?? ["",""])[1].toUpperCase().slice(0,4) || "FILE"}
                </div>
                <div className="min-w-0">
                  <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] truncate block">{f.label}</span>
                  <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50">{fmtDate(f.uploaded_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <OpenFileButton url={f.url} />
                <button onClick={() => onDelete(f.id)} disabled={pending}
                  className="text-[13px] tracking-tight text-red-400 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity disabled:opacity-20">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Messages tab ─────────────────────────────────────────────────── */

function MessagesTab({ clientId, messages, setMessages }: { clientId: string; messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>> }) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [clientTyping, setClientTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createBrowserClient>["channel"]> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    markMessagesRead(clientId);
    setMessages(prev => prev.map(m => m.sender === "client" && !m.read_at ? { ...m, read_at: new Date().toISOString() } : m));
  }, [clientId]);

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`client-messages:${clientId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `client_id=eq.${clientId}`,
      }, (payload) => {
        const incoming = payload.new as Message;
        setMessages(prev => {
          const idx = prev.findIndex(m =>
            m.id.startsWith("optimistic-") &&
            m.sender === incoming.sender &&
            m.body === incoming.body
          );
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = incoming;
            return next;
          }
          return [...prev, incoming];
        });
        if (incoming.sender === "client") {
          markMessagesRead(clientId);
          setMessages(prev => prev.map(m => m.sender === "client" && !m.read_at ? { ...m, read_at: new Date().toISOString() } : m));
        }
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `client_id=eq.${clientId}`,
      }, (payload) => {
        const updated = payload.new as Message;
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      })
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.sender === "client") {
          setClientTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setClientTyping(false), 3000);
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [clientId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, clientTyping]);

  const onBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    channelRef.current?.send({ type: "broadcast", event: "typing", payload: { sender: "admin" } });
  };

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    const text = body.trim();
    setBody("");
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      client_id: clientId,
      sender: "admin",
      body: text,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages(prev => [...prev, optimistic]);
    startTransition(async () => {
      await sendAdminMessage(clientId, text);
    });
  };

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const fmtDay = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
    if (sameDay(d, today)) return "Today";
    if (sameDay(d, yesterday)) return "Yesterday";
    const sameYear = d.getFullYear() === today.getFullYear();
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(!sameYear && { year: "numeric" }) });
  };

  let lastDay = "";

  return (
    <div className="flex flex-col gap-0" style={{ height: "calc(100vh - 280px)", minHeight: 360 }}>
      <h2 className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))] mb-6">Messages</h2>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 pb-4">
        {messages.length === 0 && (
          <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-40 py-6">No messages yet.</p>
        )}
        {messages.map((m) => {
          const day = fmtDay(m.created_at);
          const showDay = day !== lastDay;
          lastDay = day;
          const isAdmin = m.sender === "admin";
          return (
            <div key={m.id}>
              {showDay && (
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-[rgb(var(--line))]" />
                  <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40 shrink-0">{day}</span>
                  <div className="flex-1 h-px bg-[rgb(var(--line))]" />
                </div>
              )}
              <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-2.5 text-[15px] tracking-tight leading-relaxed ${
                    isAdmin
                      ? "bg-[rgb(var(--fg))] text-[rgb(var(--bg))]"
                      : "bg-[rgb(var(--line))] text-[rgb(var(--fg))]"
                  }`} style={{ borderRadius: isAdmin ? "16px 16px 4px 16px" : "16px 16px 16px 4px" }}>
                    {m.body}
                  </div>
                  <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40 px-1">
                    {fmtTime(m.created_at)}
                    {isAdmin && m.read_at && " · Read"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {/* Typing indicator */}
        {clientTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-[16px_16px_16px_4px] flex items-center gap-1" style={{ background: "rgb(var(--line))" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--muted))] opacity-40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--muted))] opacity-40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--muted))] opacity-40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSend}
        className="flex flex-col gap-2 p-3 rounded-2xl border border-[rgb(var(--line))] focus-within:border-[rgb(var(--fg))/0.2] transition-colors"
        style={{ background: "rgb(var(--line)/0.08)" }}>
        <textarea
          value={body}
          onChange={onBodyChange}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(e as unknown as React.FormEvent); } }}
          placeholder="Send a message..."
          rows={1}
          className="w-full resize-none tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-35 focus:outline-none leading-relaxed bg-transparent"
          style={{ maxHeight: 160, overflowY: "auto", fontSize: 16 }}
        />
        <div className="flex justify-end">
          <button type="submit" disabled={pending || !body.trim()}
            className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium transition-all disabled:opacity-25"
            style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}>
            {pending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Account tab ──────────────────────────────────────────────────── */

function AccountRow({ label, hint, children, last = false }: { label: string; hint?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-5 py-4 ${!last ? "border-b border-[rgb(var(--line))]" : ""}`}>
      <div className="min-w-0">
        <p className="text-[15px] tracking-tight text-[rgb(var(--fg))]">{label}</p>
        {hint && <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 mt-0.5">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function AccountSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] opacity-50 px-1">{label}</p>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgb(var(--line))", background: "rgb(var(--line) / 0.2)" }}>
        {children}
      </div>
    </div>
  );
}

function AccountTab({ client }: { client: Client }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState(client.email);
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState(client.notes ?? "");
  const [notesSaved, setNotesSaved] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const run = (fn: () => Promise<{ success?: boolean; error?: string }>, successMsg: string) => {
    setMsg(""); setError("");
    startTransition(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else setMsg(successMsg);
    });
  };

  const onDelete = () => {
    startTransition(async () => {
      const res = await deleteAccount(client.id);
      if (res.error) { setError(res.error); return; }
      router.push("/admin?deleted=1");
    });
  };

  const onCopyPortalLink = () => {
    const url = `${window.location.origin}/dashboard`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onGenerateMagicLink = () => {
    startTransition(async () => {
      const res = await generateMagicLink(client.id, client.email);
      if (res.error) { setError(res.error); return; }
      if (res.url) {
        setMagicLink(res.url);
        navigator.clipboard.writeText(res.url);
      }
    });
  };

  const onSaveNotes = () => {
    setNotesSaved(false);
    startTransition(async () => {
      const res = await updateClientNotes(client.id, notes);
      if (res.error) setError(res.error);
      else setNotesSaved(true);
    });
  };

  const lastSeen = client.last_sign_in_at
    ? new Date(client.last_sign_in_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "Never";

  const btn = "px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium border border-[rgb(var(--line))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.3)] transition-colors disabled:opacity-30";
  const btnPrimary = "px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-20";

  return (
    <div className="flex flex-col gap-6">

      {(msg || error) && (
        <p className={`text-[13px] tracking-tight px-1 ${error ? "text-red-400" : "text-[rgb(var(--green))]"}`}>
          {error || msg}
        </p>
      )}

      {/* Status */}
      <AccountSection label="Status">
        <AccountRow label={client.banned ? "Account suspended" : "Account active"} hint={client.banned ? "Client cannot sign in." : "Client can sign in normally."}>
          {client.banned ? (
            <button disabled={pending} onClick={() => run(() => unsuspendAccount(client.id), "Account reinstated.")}
              className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium border text-[rgb(var(--green))] hover:opacity-80 transition-opacity disabled:opacity-30"
              style={{ borderColor: "rgb(var(--green) / 0.4)" }}>
              Reinstate
            </button>
          ) : (
            <button disabled={pending} onClick={() => run(() => suspendAccount(client.id), "Account suspended.")}
              className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium border text-[rgb(var(--amber))] hover:opacity-80 transition-opacity disabled:opacity-30"
              style={{ borderColor: "rgb(var(--amber) / 0.4)" }}>
              Suspend
            </button>
          )}
        </AccountRow>
        <AccountRow label="Last seen" hint={lastSeen} last>
          <button disabled={pending} onClick={() => run(() => forceSignOut(client.id), "Sessions invalidated.")}
            className={btn}>
            Force sign out
          </button>
        </AccountRow>
      </AccountSection>

      {/* Access */}
      <AccountSection label="Access">
        <AccountRow label="Resend invite" hint="Send a new magic link to their email.">
          <button disabled={pending} onClick={() => run(() => resendInvite(client.id, client.email), "Invite sent.")} className={btn}>
            Send
          </button>
        </AccountRow>
        <AccountRow label="View as client" hint="Generate a sign-in link and open the portal as this client.">
          <button disabled={pending} onClick={onGenerateMagicLink} className={btn}>
            {pending ? "Generating..." : magicLink ? "Copied" : "Generate"}
          </button>
        </AccountRow>
        <AccountRow label="Portal link" hint="Copy the client's direct dashboard URL." last>
          <button onClick={onCopyPortalLink} className={btn}>
            {copied ? "Copied" : "Copy link"}
          </button>
        </AccountRow>
      </AccountSection>

      {magicLink && (
        <div className="px-4 py-3 rounded-xl text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-60 break-all" style={{ background: "rgb(var(--line) / 0.3)", border: "1px solid rgb(var(--line))" }}>
          {magicLink}
        </div>
      )}

      {/* Credentials */}
      <AccountSection label="Credentials">
        <div className="px-5 py-4 border-b border-[rgb(var(--line))]">
          <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 mb-2">Email</p>
          <div className="flex items-center gap-3">
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="flex-1 bg-transparent text-[15px] tracking-tight text-[rgb(var(--fg))] focus:outline-none" />
            <button disabled={pending || email === client.email} onClick={() => run(() => updateAccountEmail(client.id, email), "Email updated.")} className={btnPrimary}>Save</button>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 mb-2">New password</p>
          <div className="flex items-center gap-3">
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Min. 6 characters" className="flex-1 bg-transparent text-[15px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-30 focus:outline-none" />
            <button disabled={pending || password.length < 6} onClick={() => { run(() => updateAccountPassword(client.id, password), "Password updated."); setPassword(""); }} className={btnPrimary}>Save</button>
          </div>
        </div>
      </AccountSection>

      {/* Notes */}
      <AccountSection label="Internal notes">
        <div className="px-5 py-4">
          <textarea
            value={notes}
            onChange={e => { setNotes(e.target.value); setNotesSaved(false); }}
            placeholder="Billing notes, communication preferences, anything relevant..."
            rows={4}
            className="w-full bg-transparent text-[14px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-35 focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[rgb(var(--line))]">
            <button disabled={pending} onClick={onSaveNotes} className={btnPrimary}>Save notes</button>
            {notesSaved && <span className="text-[13px] tracking-tight" style={{ color: "rgb(var(--green))" }}>Saved.</span>}
          </div>
        </div>
      </AccountSection>

      {/* Danger */}
      <AccountSection label="Danger zone">
        <div className="px-5 py-4">
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium border border-red-400/30 text-red-400 hover:opacity-80 transition-opacity">
              Delete account
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-[14px] tracking-tight text-[rgb(var(--fg))]">This permanently deletes the account and all data. Cannot be undone.</p>
              <div className="flex items-center gap-3">
                <button disabled={pending} onClick={onDelete}
                  className="px-4 py-1.5 rounded-full text-[13px] tracking-tight bg-red-500 text-white hover:opacity-80 transition-opacity disabled:opacity-30">
                  {pending ? "Deleting..." : "Confirm delete"}
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </AccountSection>
    </div>
  );
}

/* ── Audit log tab ────────────────────────────────────────────────── */

const ACTION_LABEL: Record<string, string> = {
  suspend:         "Account suspended",
  unsuspend:       "Account reinstated",
  email_change:    "Email updated",
  password_change: "Password changed",
  invite_sent:     "Invite sent",
};

function AuditTab({ clientId, initial }: { clientId: string; initial: AuditEntry[] }) {
  const [log, setLog] = useState<AuditEntry[]>(initial);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const fresh = await getAdminLog(clientId);
    setLog(fresh);
    setLoading(false);
  };

  const cardStyle = { border: "1px solid rgb(var(--line))", background: "rgb(var(--line) / 0.2)" };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">History</h2>
        <button onClick={refresh} disabled={loading}
          className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium border border-[rgb(var(--line))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors disabled:opacity-30">
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {log.length === 0 ? (
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-40 py-4">No history yet.</p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          {log.map((entry, i) => (
            <div key={entry.id} className="flex items-center justify-between gap-4 px-5 py-4"
              style={{ borderBottom: i < log.length - 1 ? "1px solid rgb(var(--line))" : "none" }}>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">
                  {ACTION_LABEL[entry.action] ?? entry.action}
                </span>
                {entry.detail && (
                  <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 truncate">{entry.detail}</span>
                )}
              </div>
              <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-40 shrink-0">
                {fmtDate(entry.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Client header ────────────────────────────────────────────────── */

function ClientHeader({ client }: { client: Client }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const displayName = client.company ?? client.name ?? client.email;
  const initials = (client.name ?? client.email).slice(0, 2).toUpperCase();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateClient(client.id, client.email, fd);
      setEditing(false);
    });
  };

  if (editing) {
    return (
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input name="name" defaultValue={client.name ?? ""} placeholder="Name" className={inputClass} />
        <input name="company" defaultValue={client.company ?? ""} placeholder="Company" className={inputClass} />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending}
            className="px-5 py-2 rounded-full text-[14px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-30">
            {pending ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(false)}
            className="text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  const neverSignedIn = !client.confirmed_at;
  const lastSeen = client.last_sign_in_at
    ? new Date(client.last_sign_in_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="flex items-center gap-5">
      {/* Avatar */}
      <div className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-[16px] font-medium tracking-tight text-[rgb(var(--muted))]"
        style={{ background: "rgb(var(--line))" }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">
            {displayName}
          </h1>
          {client.banned && (
            <span className="text-[11px] tracking-tight px-2 py-0.5 rounded-full" style={{ background: "rgb(239 68 68 / 0.1)", color: "#ef4444" }}>Suspended</span>
          )}
          {neverSignedIn && !client.banned && (
            <span className="text-[11px] tracking-tight px-2 py-0.5 rounded-full" style={{ background: "rgb(var(--amber) / 0.1)", color: "rgb(var(--amber))" }}>Invite pending</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-60">{client.email}</span>
          {lastSeen && !neverSignedIn && (
            <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-40">· Last seen {lastSeen}</span>
          )}
        </div>
      </div>
      <button onClick={() => setEditing(true)}
        className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 hover:opacity-100 hover:text-[rgb(var(--fg))] transition-all shrink-0 border border-[rgb(var(--line))] px-3 py-1.5 rounded-full">
        Edit
      </button>
    </div>
  );
}

/* ── Shell ────────────────────────────────────────────────────────── */

export function ClientDetailShell({ client, projects, invoices, files, messages: initialMessages, adminLog, projectUpdates }: {
  client: Client;
  projects: Project[];
  invoices: Invoice[];
  files: DFile[];
  messages: Message[];
  adminLog: AuditEntry[];
  projectUpdates: ProjectUpdate[];
}) {
  const [tab, setTab] = useState<Tab>("projects");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const displayName = client.company ?? client.name ?? client.email;
  const unreadCount = messages.filter(m => m.sender === "client" && !m.read_at).length;

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id: "projects", label: "Projects" },
    { id: "invoices", label: "Invoices" },
    { id: "files",    label: "Files"    },
    { id: "messages", label: "Messages", badge: unreadCount },
    { id: "account",  label: "Account"  },
    { id: "history",  label: "History"  },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">

      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-[rgb(var(--bg))] border-b border-[rgb(var(--line))]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4">
          {/* Back */}
          <Link href="/admin" className="flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60 hover:opacity-100 transition-opacity shrink-0 group">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true">
              <polyline points="12 4 6 10 12 16" />
            </svg>
            Clients
          </Link>

          <span className="text-[rgb(var(--line))] opacity-60 select-none">/</span>

          {/* Client name */}
          <span className="text-[14px] font-medium tracking-tight text-[rgb(var(--fg))] truncate flex-1">{displayName}</span>

          {/* Tab pills — desktop */}
          <nav className="hidden sm:flex items-center gap-1 bg-[rgb(var(--line)/0.4)] rounded-full p-1 shrink-0">
            {TABS.map(({ id, label, badge }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className="relative px-3.5 py-1.5 rounded-full text-[13px] font-medium tracking-tight transition-all duration-150 flex items-center gap-1.5"
                  style={{
                    background: active ? "rgb(var(--bg))" : "transparent",
                    color: active ? "rgb(var(--fg))" : "rgb(var(--muted))",
                    opacity: active ? 1 : 0.6,
                    boxShadow: active ? "0 1px 3px rgb(0 0 0 / 0.12)" : "none",
                  }}
                >
                  {label}
                  {badge ? (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))]">
                      {badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            {/* Mobile menu toggle */}
            <button
              className="sm:hidden text-[rgb(var(--muted))] opacity-60 hover:opacity-100 transition-opacity"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                <line x1="3" y1="6" x2="17" y2="6" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14" x2="17" y2="14" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile tab dropdown */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-[rgb(var(--line))] bg-[rgb(var(--bg))] px-4 py-3 flex flex-col gap-1">
            {TABS.map(({ id, label, badge }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => { setTab(id); setMobileOpen(false); }}
                  className="text-left px-3 py-2.5 rounded-lg text-[14px] tracking-tight transition-colors flex items-center justify-between"
                  style={{
                    color: active ? "rgb(var(--fg))" : "rgb(var(--muted))",
                    background: active ? "rgb(var(--line))" : "transparent",
                    opacity: active ? 1 : 0.7,
                  }}
                >
                  {label}
                  {badge ? (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))]">
                      {badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">
        <ClientHeader client={client} />

        {tab === "projects" && <ProjectsTab clientId={client.id} projects={projects} projectUpdates={projectUpdates} />}
        {tab === "invoices" && <InvoicesTab clientId={client.id} invoices={invoices} />}
        {tab === "files"    && <FilesTab    clientId={client.id} files={files} />}
        {tab === "messages" && <MessagesTab clientId={client.id} messages={messages} setMessages={setMessages} />}
        {tab === "account"  && <AccountTab  client={client} />}
        {tab === "history"  && <AuditTab    clientId={client.id} initial={adminLog} />}
      </main>
    </div>
  );
}
