"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/theme-toggle";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import {
  createProject, updateProject, deleteProject,
  createInvoice, updateInvoiceStatus, deleteInvoice,
  addFile, deleteFile, updateClient,
  suspendAccount, unsuspendAccount, deleteAccount,
  updateAccountEmail, updateAccountPassword, resendInvite,
  addFileFromUrl, getSignedFileUrl, sendAdminMessage, markMessagesRead,
  getAdminLog,
} from "../../actions";

/* ── Types ────────────────────────────────────────────────────────── */

type Client  = { id: string; email: string; name: string | null; company: string | null; banned?: boolean; last_sign_in_at?: string | null; confirmed_at?: string | null };
type Project = { id: string; title: string; status: string; phase: string | null; last_update: string | null; notes: string | null; start_date: string | null; target_date: string | null };
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

function ProjectsTab({ clientId, projects }: { clientId: string; projects: Project[] }) {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createProject(clientId, fd);
      setAdding(false);
    });
  };

  const onUpdate = (projectId: string) => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateProject(projectId, clientId, fd);
      setEditId(null);
    });
  };

  const onDelete = (projectId: string) => {
    startTransition(async () => {
      await deleteProject(projectId, clientId);
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">Projects</h2>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors border border-[rgb(var(--line))] px-4 py-2 rounded-full">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
              <line x1="10" y1="4" x2="10" y2="16" /><line x1="4" y1="10" x2="16" y2="10" />
            </svg>
            Add project
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={onAdd} className="border border-[rgb(var(--line))] p-5 flex flex-col gap-4">
          <input name="title" required placeholder="Project title" className={inputClass} />
          <select name="status" defaultValue="active" className={selectClass}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="on_hold">On hold</option>
            <option value="completed">Completed</option>
          </select>
          <input name="phase" placeholder="Phase (e.g. Design review)" className={inputClass} />
          <input name="last_update" placeholder="Last update label (e.g. Updated May 1)" className={inputClass} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 block mb-1">Start date</label>
              <input name="start_date" type="date" className={inputClass} />
            </div>
            <div>
              <label className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 block mb-1">Target date</label>
              <input name="target_date" type="date" className={inputClass} />
            </div>
          </div>
          <textarea name="notes" rows={3} placeholder="Notes visible to client" className={`${inputClass} resize-none`} />
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={pending}
              className="px-5 py-2 rounded-full text-[14px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-30">
              {pending ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setAdding(false)}
              className="text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      <GridRule />

      {projects.length === 0 && !adding ? (
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-40 py-6">No projects yet.</p>
      ) : (
        <div className="flex flex-col gap-0">
          {projects.map((p, i) => (
            <div key={p.id}>
              {editId === p.id ? (
                <form onSubmit={onUpdate(p.id)} className="py-5 flex flex-col gap-4">
                  <input name="title" required defaultValue={p.title} className={inputClass} />
                  <select name="status" defaultValue={p.status} className={selectClass}>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="on_hold">On hold</option>
                    <option value="completed">Completed</option>
                  </select>
                  <input name="phase" defaultValue={p.phase ?? ""} placeholder="Phase" className={inputClass} />
                  <input name="last_update" defaultValue={p.last_update ?? ""} placeholder="Last update label" className={inputClass} />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 block mb-1">Start date</label>
                      <input name="start_date" type="date" defaultValue={p.start_date ?? ""} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 block mb-1">Target date</label>
                      <input name="target_date" type="date" defaultValue={p.target_date ?? ""} className={inputClass} />
                    </div>
                  </div>
                  <textarea name="notes" rows={3} defaultValue={p.notes ?? ""} placeholder="Notes" className={`${inputClass} resize-none`} />
                  <div className="flex items-center gap-3">
                    <button type="submit" disabled={pending}
                      className="px-5 py-2 rounded-full text-[14px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-30">
                      {pending ? "Saving..." : "Save"}
                    </button>
                    <button type="button" onClick={() => setEditId(null)}
                      className="text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-4 py-5 group">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))]">{p.title}</span>
                    {p.phase && <span className="text-[14px] tracking-tight text-[rgb(var(--muted))]">{p.phase}</span>}
                    {p.notes && <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60 leading-relaxed max-w-md">{p.notes}</p>}
                    {p.last_update && <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40">{p.last_update}</span>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusPill status={p.status} />
                    <button onClick={() => setEditId(p.id)}
                      className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity">
                      Edit
                    </button>
                    <button onClick={() => onDelete(p.id)} disabled={pending}
                      className="text-[13px] tracking-tight text-red-400 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity disabled:opacity-20">
                      Delete
                    </button>
                  </div>
                </div>
              )}
              {i < projects.length - 1 && <GridRule />}
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">Invoices</h2>
          {totalOwed > 0 && (
            <p className="text-[13px] tracking-tight mt-0.5" style={{ color: "rgb(var(--amber))" }}>
              {fmt$(totalOwed)} outstanding
            </p>
          )}
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors border border-[rgb(var(--line))] px-4 py-2 rounded-full">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
              <line x1="10" y1="4" x2="10" y2="16" /><line x1="4" y1="10" x2="16" y2="10" />
            </svg>
            Add invoice
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={onAdd} className="border border-[rgb(var(--line))] p-5 flex flex-col gap-4">
          <input name="label" required placeholder="Invoice label" className={inputClass} />
          <input name="amount" required type="number" step="0.01" min="0" placeholder="Amount (USD)" className={inputClass} />
          <select name="status" defaultValue="pending" className={selectClass}>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <input name="due_date" type="date" className={inputClass} />
          <input name="payment_url" type="url" placeholder="Payment link (optional)" className={inputClass} />
          {error && <p className="text-[13px] tracking-tight text-red-400">{error}</p>}
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={pending}
              className="px-5 py-2 rounded-full text-[14px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-30">
              {pending ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setAdding(false)}
              className="text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      <GridRule />

      {invoices.length === 0 && !adding ? (
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-40 py-6">No invoices yet.</p>
      ) : (
        <div className="flex flex-col">
          {invoices.map((inv, i) => (
            <div key={inv.id}>
              <div className="flex items-center justify-between gap-4 py-5 group">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[16px] tracking-tight text-[rgb(var(--fg))] truncate">{inv.label}</span>
                  {inv.paid_at
                    ? <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50">Paid {fmtDate(inv.paid_at)}</span>
                    : inv.due_date
                      ? <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50">Due {fmtDate(inv.due_date)}</span>
                      : null
                  }
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[16px] font-medium tabular-nums text-[rgb(var(--fg))]">{fmt$(inv.amount)}</span>
                  <select
                    value={inv.status}
                    onChange={e => onStatusChange(inv.id, e.target.value)}
                    className="bg-transparent text-[13px] tracking-tight border border-[rgb(var(--line))] rounded-full px-3.5 py-1.5 text-[rgb(var(--muted))] focus:outline-none cursor-pointer">
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
              {i < invoices.length - 1 && <GridRule />}
            </div>
          ))}
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
  const fileInputRef = useState<HTMLInputElement | null>(null);

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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">Files</h2>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors border border-[rgb(var(--line))] px-4 py-2 rounded-full">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
              <line x1="10" y1="4" x2="10" y2="16" /><line x1="4" y1="10" x2="16" y2="10" />
            </svg>
            Upload file
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={onSubmit} className="border border-[rgb(var(--line))] p-5 flex flex-col gap-4">
          <label
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className="flex flex-col items-center justify-center gap-2 border border-dashed rounded px-6 py-8 cursor-pointer transition-colors"
            style={{ borderColor: dragOver ? "rgb(var(--fg))" : "rgb(var(--line))", background: dragOver ? "rgb(var(--line)/0.15)" : "transparent" }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 opacity-30" aria-hidden="true">
              <path d="M10 3v10M6 7l4-4 4 4M3 15v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2" />
            </svg>
            <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">
              {uploading ? "Uploading..." : "Drop a file or click to browse"}
            </span>
            <input type="file" className="hidden" disabled={uploading}
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
          </label>
          <input name="label" placeholder="Custom label (optional, defaults to filename)" className={inputClass} />
          {error && <p className="text-[13px] tracking-tight text-red-400">{error}</p>}
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={uploading}
              className="px-5 py-2 rounded-full text-[14px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-30">
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <button type="button" onClick={() => { setAdding(false); setError(""); }}
              className="text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      <GridRule />

      {files.length === 0 && !adding ? (
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-40 py-6">No files yet.</p>
      ) : (
        <div className="flex flex-col">
          {files.map((f, i) => (
            <div key={f.id}>
              <div className="flex items-center justify-between gap-4 py-5 group">
                <div className="flex items-center gap-3 min-w-0">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 opacity-30" aria-hidden="true">
                    <path d="M11 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" /><polyline points="11 2 11 7 16 7" />
                  </svg>
                  <div className="min-w-0">
                    <span className="text-[14px] tracking-tight text-[rgb(var(--fg))] truncate block">{f.label}</span>
                    <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40">{fmtDate(f.uploaded_at)}</span>
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
              {i < files.length - 1 && <GridRule />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Messages tab ─────────────────────────────────────────────────── */

function MessagesTab({ clientId, initial }: { clientId: string; initial: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initial);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markMessagesRead(clientId);
  }, [clientId]);

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`messages:${clientId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `client_id=eq.${clientId}`,
      }, (payload) => {
        const incoming = payload.new as Message;
        setMessages(prev => {
          // Replace a matching optimistic message, or append if none found
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
        if (incoming.sender === "client") markMessagesRead(clientId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [clientId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      {/* Thread */}
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
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={onSend} className="flex items-end gap-3 pt-4 border-t border-[rgb(var(--line))]">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(e as unknown as React.FormEvent); } }}
          placeholder="Send a message…"
          rows={2}
          className="flex-1 bg-transparent resize-none text-[15px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none leading-relaxed"
        />
        <button type="submit" disabled={pending || !body.trim()}
          className="px-4 py-2 rounded-full text-[14px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-20 shrink-0">
          Send
        </button>
      </form>
    </div>
  );
}

/* ── Account tab ──────────────────────────────────────────────────── */

function AccountTab({ client }: { client: Client }) {
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState(client.email);
  const [password, setPassword] = useState("");
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

  return (
    <div className="flex flex-col gap-10">
      <h2 className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">Account</h2>

      {(msg || error) && (
        <p className={`text-[14px] tracking-tight ${error ? "text-red-400" : "text-[rgb(var(--green))]"}`}>
          {error || msg}
        </p>
      )}

      {/* Status */}
      <div className="flex flex-col gap-4">
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-60">Status</p>
        <div className="flex items-center justify-between gap-4 py-4 border-b border-[rgb(var(--line))]">
          <div>
            <p className="text-[15px] tracking-tight text-[rgb(var(--fg))]">
              {client.banned ? "Account suspended" : "Account active"}
            </p>
            <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 mt-0.5">
              {client.banned ? "Client cannot sign in." : "Client can sign in normally."}
            </p>
          </div>
          {client.banned ? (
            <button disabled={pending} onClick={() => run(() => unsuspendAccount(client.id), "Account reinstated.")}
              className="px-5 py-2 rounded-full text-[14px] tracking-tight border border-[rgb(var(--green))/0.4] text-[rgb(var(--green))] hover:bg-[rgb(var(--green))/0.08] transition-colors disabled:opacity-30">
              Reinstate
            </button>
          ) : (
            <button disabled={pending} onClick={() => run(() => suspendAccount(client.id), "Account suspended.")}
              className="px-5 py-2 rounded-full text-[14px] tracking-tight border border-[rgb(var(--amber))/0.4] text-[rgb(var(--amber))] hover:bg-[rgb(var(--amber))/0.08] transition-colors disabled:opacity-30">
              Suspend
            </button>
          )}
        </div>

        {/* Resend invite */}
        <div className="flex items-center justify-between gap-4 py-4 border-b border-[rgb(var(--line))]">
          <div>
            <p className="text-[15px] tracking-tight text-[rgb(var(--fg))]">Resend invite</p>
            <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 mt-0.5">Send a new magic link to their email.</p>
          </div>
          <button disabled={pending} onClick={() => run(() => resendInvite(client.id, client.email), "Invite sent.")}
            className="px-5 py-2 rounded-full text-[14px] tracking-tight border border-[rgb(var(--line))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg))/0.3] transition-colors disabled:opacity-30">
            Send
          </button>
        </div>
      </div>

      {/* Update email */}
      <div className="flex flex-col gap-4">
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-60">Update email</p>
        <div className="flex items-end gap-3">
          <input value={email} onChange={e => setEmail(e.target.value)} type="email"
            className={`${inputClass} flex-1`} />
          <button disabled={pending || email === client.email}
            onClick={() => run(() => updateAccountEmail(client.id, email), "Email updated.")}
            className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-20 shrink-0">
            Save
          </button>
        </div>
      </div>

      {/* Reset password */}
      <div className="flex flex-col gap-4">
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-60">Set new password</p>
        <div className="flex items-end gap-3">
          <input value={password} onChange={e => setPassword(e.target.value)} type="password"
            placeholder="New password" className={`${inputClass} flex-1`} />
          <button disabled={pending || password.length < 6}
            onClick={() => { run(() => updateAccountPassword(client.id, password), "Password updated."); setPassword(""); }}
            className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-20 shrink-0">
            Save
          </button>
        </div>
      </div>

      {/* Delete account */}
      <div className="flex flex-col gap-4 pt-4 border-t border-[rgb(var(--line))]">
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-60">Danger zone</p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)}
            className="self-start px-4 py-1.5 rounded-full text-[13px] tracking-tight border border-red-400/30 text-red-400 hover:bg-red-400/08 transition-colors">
            Delete account
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-[15px] tracking-tight text-[rgb(var(--fg))]">
              This permanently deletes the account and all associated data. Cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button disabled={pending}
                onClick={() => run(() => deleteAccount(client.id), "Account deleted.")}
                className="px-4 py-1.5 rounded-full text-[13px] tracking-tight bg-red-500 text-white hover:opacity-80 transition-opacity disabled:opacity-30">
                Confirm delete
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">History</h2>
        <button onClick={refresh} disabled={loading}
          className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors disabled:opacity-30">
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      <GridRule />
      {log.length === 0 ? (
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-40 py-6">No history yet.</p>
      ) : (
        <div className="flex flex-col">
          {log.map((entry, i) => (
            <div key={entry.id}>
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[15px] tracking-tight text-[rgb(var(--fg))]">
                    {ACTION_LABEL[entry.action] ?? entry.action}
                  </span>
                  {entry.detail && (
                    <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50">{entry.detail}</span>
                  )}
                </div>
                <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-40 shrink-0">
                  {fmtDate(entry.created_at)}
                </span>
              </div>
              {i < log.length - 1 && <GridRule />}
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
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">
            {displayName}
          </h1>
          <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-50 mt-1">{client.email}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {neverSignedIn ? (
            <span className="text-[12px] tracking-tight px-2.5 py-1 rounded-full border border-[rgb(var(--amber))/0.4] text-[rgb(var(--amber))]">
              Invite pending
            </span>
          ) : lastSeen ? (
            <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40">
              Last seen {lastSeen}
            </span>
          ) : null}
        </div>
      </div>
      <button onClick={() => setEditing(true)}
        className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors shrink-0 mt-1">
        Edit
      </button>
    </div>
  );
}

/* ── Shell ────────────────────────────────────────────────────────── */

export function ClientDetailShell({ client, projects, invoices, files, messages, adminLog }: {
  client: Client;
  projects: Project[];
  invoices: Invoice[];
  files: DFile[];
  messages: Message[];
  adminLog: AuditEntry[];
}) {
  const [tab, setTab] = useState<Tab>("projects");
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
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 sm:px-10 h-14 border-b border-[rgb(var(--line))]">
        <div className="flex items-center gap-4">
          <Link href="/admin"
            className="inline-flex items-center gap-2 text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors group">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true">
              <polyline points="12 4 6 10 12 16" />
            </svg>
            Back
          </Link>
          <span className="text-[rgb(var(--line))] select-none">|</span>
          <span className="text-[15px] tracking-tight text-[rgb(var(--fg))] truncate max-w-[200px]">{displayName}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
            Site
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 sm:px-12 py-12 sm:py-14 flex flex-col gap-10">
        {/* Client header */}
        <ClientHeader client={client} />

        {/* Tab nav */}
        <div className="flex items-center gap-1 border-b border-[rgb(var(--line))]">
          {TABS.map(({ id, label, badge }) => (
            <button key={id} onClick={() => setTab(id)}
              className="px-4 py-3 text-[15px] tracking-tight transition-colors relative inline-flex items-center gap-1.5"
              style={{ color: tab === id ? "rgb(var(--fg))" : "rgb(var(--muted))", opacity: tab === id ? 1 : 0.5 }}>
              {label}
              {badge ? (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))]">
                  {badge}
                </span>
              ) : null}
              {tab === id && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-[rgb(var(--fg))]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "projects" && <ProjectsTab clientId={client.id} projects={projects} />}
        {tab === "invoices" && <InvoicesTab clientId={client.id} invoices={invoices} />}
        {tab === "files"    && <FilesTab    clientId={client.id} files={files} />}
        {tab === "messages" && <MessagesTab clientId={client.id} initial={messages} />}
        {tab === "account"  && <AccountTab  client={client} />}
        {tab === "history"  && <AuditTab    clientId={client.id} initial={adminLog} />}
      </main>
    </div>
  );
}
