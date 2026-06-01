"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/theme-toggle";
import { useTheme } from "@/app/theme-provider";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { signOut, getSignedFileUrl, sendClientMessage, markAdminMessagesRead, updateClientProfile } from "./actions";
import { useWebHaptics } from "web-haptics/react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";

/* ── Types ────────────────────────────────────────────────────────── */

type Client  = { id: string; email: string; name: string | null; company: string | null };
type Project = { id: string; title: string; status: string; phase: string | null; last_update: string | null; notes: string | null; start_date: string | null; target_date: string | null };
type ProjectUpdate = { id: string; project_id: string; status: string; note: string | null; created_at: string };
type Invoice = { id: string; label: string; amount: number; status: string; due_date: string | null; payment_url: string | null };
type DFile   = { id: string; label: string; url: string; uploaded_at: string };
type Message = { id: string; client_id: string; sender: "admin" | "client"; body: string; created_at: string; read_at: string | null };
type License = { id: string; key: string; email: string; domain: string | null; tier: string; status: string; created_at: string };
type Tab     = "overview" | "projects" | "invoices" | "files" | "messages" | "licenses" | "settings";

/* ── Helpers ──────────────────────────────────────────────────────── */

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

const currencyFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFmt     = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function fmt$(cents: number) { return currencyFmt.format(cents / 100); }
function fmtDate(iso: string | null) { return iso ? dateFmt.format(new Date(iso)) : null; }

function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}

function WhopCheckoutModal({ planId, clientEmail, onClose }: { planId: string; clientEmail: string; onClose: () => void }) {
  const { theme } = useTheme();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[rgb(var(--bg))] border border-[rgb(var(--line))] rounded-lg overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(var(--line))]">
          <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">Complete payment</span>
          <button onClick={onClose}
            className="text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors opacity-50 hover:opacity-100">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4">
              <line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          </button>
        </div>
        <div className="p-5">
          <WhopCheckoutEmbed
            planId={planId}
            theme={theme === "dark" ? "dark" : "light"}
            prefill={{ email: clientEmail }}
            skipRedirect
            onComplete={onClose}
          />
        </div>
      </div>
    </div>
  );
}

function InertiaLogo({ className }: { className?: string }) {
  return (
    <img src="/portal-logo.png" alt="Inertia Portal" className={`dark:invert invert-0 ${className ?? ""}`} style={{ display: "block" }} />
  );
}

function StatusPill({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? "rgb(var(--muted))";
  return (
    <span className="inline-flex items-center text-[13px] tracking-tight px-2.5 py-1 rounded-full capitalize shrink-0"
      style={{ color: "rgb(var(--bg))", background: `color-mix(in srgb, ${color} 70%, rgb(var(--fg)))` }}>
      {status.replace("_", " ")}
    </span>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="py-12 opacity-40">
      <p className="text-[14px] tracking-tight text-[rgb(var(--muted))]">{label}</p>
    </div>
  );
}

function DownloadButton({ url, label }: { url: string; label: string }) {
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    try {
      const signed = await getSignedFileUrl(url);
      if (!signed.url) return;
      const res = await fetch(signed.url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = label;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally { setLoading(false); }
  };
  return (
    <button onClick={onClick} disabled={loading}
      className="px-3.5 py-1.5 rounded-full text-[13px] tracking-tight text-[rgb(var(--bg))] transition-colors disabled:opacity-30 shrink-0"
      style={{ background: `color-mix(in srgb, rgb(var(--fg)) 70%, rgb(var(--bg)))` }}>
      {loading ? "..." : "Download"}
    </button>
  );
}

/* ── Nav icons ────────────────────────────────────────────────────── */

const icons: Record<Tab, React.ReactNode> = {
  overview: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <rect x="2" y="2" width="7" height="7" rx="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" />
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M2 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5z" />
      <path d="M12 8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V8z" />
    </svg>
  ),
  invoices: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <rect x="3" y="2" width="14" height="16" rx="1.5" />
      <line x1="6.5" y1="7" x2="13.5" y2="7" />
      <line x1="6.5" y1="10" x2="13.5" y2="10" />
      <line x1="6.5" y1="13" x2="10" y2="13" />
    </svg>
  ),
  files: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M11 2H5a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 5 18h10a1.5 1.5 0 0 0 1.5-1.5V7L11 2z" />
      <polyline points="11 2 11 7 16.5 7" />
    </svg>
  ),
  messages: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M17 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2v3l4-3h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" />
    </svg>
  ),
  licenses: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <rect x="2" y="5" width="16" height="11" rx="1.5" />
      <path d="M6 9h4M6 12h2" />
      <circle cx="14" cy="10.5" r="2" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <line x1="3" y1="6" x2="17" y2="6" />
      <line x1="3" y1="14" x2="17" y2="14" />
      <circle cx="7" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="13" cy="14" r="2" fill="currentColor" stroke="none" />
    </svg>
  ),
};

/* ── Top nav ──────────────────────────────────────────────────────── */

function TopNav({ client, tab, setTab, mobileOpen, setMobileOpen, unreadMessages }: {
  client: Client | null;
  tab: Tab;
  setTab: (t: Tab) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  unreadMessages: number;
}) {
  const [pending, startTransition] = useTransition();
  const { trigger } = useWebHaptics();

  const NAV: { id: Tab; label: string; badge?: number }[] = [
    { id: "overview",  label: "Overview"  },
    { id: "projects",  label: "Projects"  },
    { id: "invoices",  label: "Invoices"  },
    { id: "files",     label: "Files"     },
    { id: "messages",  label: "Messages", badge: unreadMessages },
    { id: "licenses",  label: "Licenses"  },
    { id: "settings",  label: "Settings"  },
  ];

  const displayName = client?.company ?? client?.name ?? "Client";
  const initials = (client?.company ?? client?.name ?? "C").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-[rgb(var(--bg))] border-b border-[rgb(var(--line))] md:border-b md:border-[rgb(var(--line))]">
      <div className="w-full pl-6 sm:max-w-[80rem] sm:mx-auto sm:px-6 flex items-center" style={{ height: 72 }}>
        {/* Logo — goes to overview */}
        <button onClick={() => { trigger("selection"); setTab("overview"); }}>
          <InertiaLogo className="h-[18px] w-auto" />
        </button>

        {/* Desktop pill tabs */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          <div className="flex items-center gap-1 bg-[rgb(var(--line)/0.4)] rounded-full p-1">
            {NAV.map(({ id, label, badge }) => {
              const active = tab === id;
              return (
                <button key={id} onClick={() => { trigger("selection"); setTab(id); }}
                  className="relative px-3.5 py-1.5 rounded-full text-[13px] font-medium tracking-tight transition-all duration-150 flex items-center gap-1.5"
                  style={{
                    background: active ? "rgb(var(--bg))" : "transparent",
                    color: active ? "rgb(var(--fg))" : "rgb(var(--muted))",
                    opacity: active ? 1 : 0.6,
                    boxShadow: active ? "0 1px 3px rgb(0 0 0 / 0.12)" : "none",
                  }}>
                  {label}
                  {!!badge && badge > 0 && (
                    <span className="min-w-[16px] h-4 px-1 rounded-full text-[10px] font-medium flex items-center justify-center bg-[rgb(var(--fg))] text-[rgb(var(--bg))]">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Right: avatar + sign out + mobile toggle */}
        <div className="flex items-center gap-1 ml-auto shrink-0 h-full px-4">
          <div className="hidden md:flex items-center gap-3">
            <Link href="/" className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 hover:opacity-100 transition-opacity">
              ← Site
            </Link>
            <ThemeToggle />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-medium tracking-tight text-[rgb(var(--muted))] shrink-0"
              style={{ background: "rgb(var(--line))" }}>
              {initials}
            </div>
            <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60 max-w-[120px] truncate">{displayName}</span>
            <button onClick={() => startTransition(() => signOut())} disabled={pending}
              className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 hover:opacity-100 transition-opacity disabled:opacity-20 ml-1">
              {pending ? "..." : "Sign out"}
            </button>
          </div>
          <div className="md:hidden flex items-center gap-4">
            <Link href="/" className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 hover:opacity-100 transition-opacity">
              ← Site
            </Link>
            <button
              className="flex flex-col justify-center items-center gap-[6px] shrink-0"
              onClick={() => { trigger("medium"); setMobileOpen(!mobileOpen); }}
              aria-label="Toggle menu">
              <span className="block rounded-sm transition-all duration-300"
                style={{ width: 22, height: 1.5, background: "rgb(var(--fg))", transform: mobileOpen ? "translateY(3.75px) rotate(45deg)" : "none" }} />
              <span className="block rounded-sm transition-all duration-300"
                style={{ width: 22, height: 1.5, background: "rgb(var(--fg))", transform: mobileOpen ? "translateY(-3.75px) rotate(-45deg)" : "none" }} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgb(var(--line))] bg-[rgb(var(--bg))] flex flex-col">
          {NAV.map(({ id, label, badge }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => { trigger("selection"); setTab(id); setMobileOpen(false); }}
                className="text-left px-6 py-3 text-[16px] font-medium tracking-[-0.03em] transition-colors flex items-center justify-between w-full"
                style={{
                  color: active ? "rgb(var(--fg))" : "rgb(var(--muted))",
                  opacity: active ? 1 : 0.5,
                }}>
                {label}
                {!!badge && badge > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-medium flex items-center justify-center bg-[rgb(var(--fg))] text-[rgb(var(--bg))]">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="flex items-center gap-3 px-6 py-3 border-t border-[rgb(var(--line))]">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-medium tracking-tight text-[rgb(var(--muted))]"
              style={{ background: "rgb(var(--line))" }}>
              {initials}
            </div>
            <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] flex-1 truncate">{displayName}</span>
            <button onClick={() => startTransition(() => signOut())} disabled={pending}
              className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60 hover:opacity-100 disabled:opacity-20">
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Overview ─────────────────────────────────────────────────────── */

function OverviewTab({ client, projects, invoices, files, messages, projectUpdates, setTab }: {
  client: Client | null;
  projects: Project[];
  invoices: Invoice[];
  files: DFile[];
  messages: Message[];
  projectUpdates: ProjectUpdate[];
  setTab: (t: Tab) => void;
}) {
  const firstName = client?.name?.split(" ")[0] ?? null;
  const displayName = client?.company ?? (firstName ? `Hey, ${firstName}.` : "Hey.");

  const activeProjects = projects.filter(p => p.status === "active");
  const completedCount = projects.filter(p => p.status === "completed").length;

  const unpaidInvoices = invoices.filter(i => i.status !== "paid" && i.status !== "draft");
  const totalOwed = unpaidInvoices.reduce((s, i) => s + i.amount, 0);
  const nextDue = unpaidInvoices
    .filter(i => i.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0] ?? null;

  const unreadFromAdmin = messages.filter(m => m.sender === "admin" && !m.read_at);
  const latestAdminMsg = messages.filter(m => m.sender === "admin").at(-1) ?? null;

  const cardStyle = { background: "rgb(var(--line) / 0.4)", border: "1px solid rgb(var(--line))" };

  return (
    <div className="flex flex-col gap-10">

      {/* Greeting */}
      <div>
        <h1 className="text-[2rem] font-semibold tracking-[-0.05em] leading-none text-[rgb(var(--fg))]">
          {displayName}
        </h1>
        <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] mt-2 opacity-60">
          {client?.company ? `Hey${firstName ? `, ${firstName}` : ""}. Here's where everything stands.` : "Here's where everything stands."}
        </p>
      </div>

      {/* Stat cards */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-6 pl-6 pr-6 pb-1 sm:mx-0 sm:pl-0 sm:pr-0 sm:pb-0 sm:grid sm:grid-cols-4 sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ scrollPaddingLeft: "1.5rem", scrollSnapType: "x mandatory" }}>

        {/* Projects */}
        <button onClick={() => setTab("projects")}
          className="text-left p-5 rounded-2xl transition-all flex flex-col gap-3 hover:opacity-90 snap-start shrink-0 w-[72vw] sm:w-auto sm:shrink"
          style={cardStyle}>
          <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]">Projects</p>
          <p className="text-[2rem] font-semibold tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">{projects.length}</p>
          {projects.length > 0 ? (
            <div className="flex gap-0.5 h-1.5 w-full rounded-full overflow-hidden">
              {(["active","paused","on_hold","completed"] as const).map(s => {
                const count = projects.filter(p => p.status === s).length;
                if (!count) return null;
                const color = STATUS_COLOR[s] ?? "rgb(var(--muted))";
                return <div key={s} className="h-full rounded-full" style={{ flex: count, background: color }} />;
              })}
            </div>
          ) : (
            <div className="h-1.5 w-full rounded-full bg-[rgb(var(--line))]" />
          )}
          <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">
            {completedCount > 0 ? `${completedCount} completed` : activeProjects.length > 0 ? `${activeProjects.length} active` : "None yet"}
          </p>
        </button>

        {/* Outstanding */}
        {(() => {
          const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
          const total = totalPaid + totalOwed;
          const pct = total > 0 ? totalPaid / total : 0;
          const r = 14, cx = 18, cy = 18, stroke = 3;
          const circ = 2 * Math.PI * r;
          const color = totalOwed > 0 ? "rgb(var(--amber))" : "rgb(var(--green))";
          return (
            <button onClick={() => setTab("invoices")}
              className="text-left p-5 rounded-2xl transition-all flex flex-col gap-3 hover:opacity-90 snap-start shrink-0 w-[72vw] sm:w-auto sm:shrink"
              style={cardStyle}>
              <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]">Outstanding</p>
              <div className="flex items-center gap-3">
                <p className="text-[2rem] font-semibold tracking-[-0.04em] leading-none" style={{ color }}>
                  {totalOwed > 0 ? fmt$(totalOwed) : "All clear"}
                </p>
                {total > 0 && (
                  <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0 -rotate-90" aria-hidden="true">
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgb(var(--line))" strokeWidth={stroke} />
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
                      strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 600ms cubic-bezier(0.22,1,0.36,1)" }} />
                  </svg>
                )}
              </div>
              <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">
                {nextDue?.due_date ? `Due ${fmtDate(nextDue.due_date)}` : totalOwed === 0 ? "No open invoices" : ""}
              </p>
            </button>
          );
        })()}

        {/* Files */}
        <button onClick={() => setTab("files")}
          className="text-left p-5 rounded-2xl transition-all flex flex-col gap-3 hover:opacity-90 snap-start shrink-0 w-[72vw] sm:w-auto sm:shrink"
          style={cardStyle}>
          <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]">Files</p>
          <p className="text-[2rem] font-semibold tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">{files.length}</p>
          {files.length > 0 ? (
            <div className="flex items-end gap-0.5 h-6">
              {files.slice(0, 12).map((f, i, arr) => {
                const opacity = 0.2 + (i / (arr.length - 1 || 1)) * 0.75;
                return (
                  <div key={f.id} className="flex-1 rounded-sm" style={{ height: `${60 + (i % 3) * 20}%`, background: "rgb(var(--fg))", opacity }} />
                );
              })}
            </div>
          ) : (
            <div className="h-6" />
          )}
          <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">
            {files.length > 0 ? `Last added ${fmtDate(files[0].uploaded_at)}` : "None yet"}
          </p>
        </button>

        {/* Messages */}
        {(() => {
          const recent = messages.slice(-12);
          const unread = unreadFromAdmin.length;
          return (
            <button onClick={() => setTab("messages")}
              className="text-left p-5 rounded-2xl transition-all flex flex-col gap-3 hover:opacity-90 snap-start shrink-0 w-[72vw] sm:w-auto sm:shrink"
              style={cardStyle}>
              <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]">Messages</p>
              <p className="text-[2rem] font-semibold tracking-[-0.04em] leading-none" style={{ color: unread > 0 ? "rgb(var(--blue))" : "rgb(var(--fg))" }}>
                {unread > 0 ? `${unread} new` : messages.length > 0 ? "Up to date" : "No messages"}
              </p>
              <div className="flex items-end gap-0.5 h-6">
                {recent.length > 0 ? recent.map((m, i) => (
                  <div key={m.id} className="flex-1 rounded-sm"
                    style={{
                      height: "100%",
                      background: m.sender === "admin" ? "rgb(var(--blue))" : "rgb(var(--fg))",
                      opacity: 0.2 + (i / recent.length) * 0.7,
                    }} />
                )) : (
                  <div className="w-full h-px bg-[rgb(var(--line))] self-center" />
                )}
              </div>
              <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">
                {latestAdminMsg ? `Last: ${new Date(latestAdminMsg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "Say hello"}
              </p>
            </button>
          );
        })()}
      </div>

      {/* Active projects */}
      {activeProjects.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">
              {activeProjects.length === 1 ? "Active project" : "Active projects"}
            </h2>
            {projects.length > activeProjects.length && (
              <button onClick={() => setTab("projects")} className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors opacity-60 hover:opacity-100">
                See all →
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {activeProjects.map((p) => {
              const updates = projectUpdates.filter(u => u.project_id === p.id);
              const latestUpdate = updates[0] ?? null;
              const statusColor = STATUS_COLOR[latestUpdate?.status ?? p.status] ?? "rgb(var(--muted))";
              return (
                <div key={p.id} className="rounded-2xl overflow-hidden" style={cardStyle}>
                  <div className="px-5 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))]">{p.title}</span>
                        {p.phase && <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">{p.phase}</span>}
                      </div>
                      <StatusPill status={latestUpdate?.status ?? p.status} />
                    </div>
                    {p.notes && (
                      <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60 leading-relaxed mt-3 max-w-lg">{p.notes}</p>
                    )}
                    {latestUpdate?.note && (
                      <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-70 leading-relaxed mt-3 pl-3 border-l-2" style={{ borderColor: statusColor }}>
                        {latestUpdate.note}
                      </p>
                    )}
                  </div>
                  {p.target_date && (
                    <div className="px-5 py-3 border-t border-[rgb(var(--line))]">
                      <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50">Target {fmtDate(p.target_date)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending invoices */}
      {unpaidInvoices.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">
              {unpaidInvoices.length === 1 ? "Pending invoice" : "Pending invoices"}
            </h2>
            <button onClick={() => setTab("invoices")} className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors opacity-60 hover:opacity-100">
              See all →
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {unpaidInvoices.slice(0, 3).map((inv) => {
              const overdue = inv.status === "overdue";
              return (
                <div key={inv.id} className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl"
                  style={{ border: `1px solid ${overdue ? "rgb(239 68 68 / 0.3)" : "rgb(var(--line))"}`, background: overdue ? "rgb(239 68 68 / 0.03)" : "rgb(var(--line) / 0.2)" }}>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] truncate">{inv.label}</p>
                    {inv.due_date && (
                      <p className="text-[13px] tracking-tight mt-0.5" style={{ color: overdue ? "#ef4444" : "rgb(var(--muted))", opacity: overdue ? 0.9 : 0.6 }}>
                        {overdue ? "Overdue " : "Due "}{fmtDate(inv.due_date)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[16px] font-semibold tabular-nums text-[rgb(var(--fg))]">{fmt$(inv.amount)}</span>
                    {inv.payment_url && (
                      inv.payment_url.startsWith("http") ? (
                        <a href={inv.payment_url} target="_blank" rel="noreferrer"
                          className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium transition-opacity hover:opacity-80 shrink-0"
                          style={{ background: overdue ? "#ef4444" : "rgb(var(--fg))", color: "rgb(var(--bg))" }}>
                          Pay
                        </a>
                      ) : null
                    )}
                    {!inv.payment_url && <StatusPill status={inv.status} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Latest message */}
      {latestAdminMsg && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">Latest message</h2>
            <button onClick={() => setTab("messages")} className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors opacity-60 hover:opacity-100">
              Open thread →
            </button>
          </div>
          <button onClick={() => setTab("messages")} className="text-left rounded-2xl overflow-hidden hover:opacity-90 transition-opacity" style={cardStyle}>
            <div className="px-5 py-4">
              <p className="text-[15px] tracking-tight text-[rgb(var(--fg))] leading-relaxed line-clamp-2">{latestAdminMsg.body}</p>
            </div>
            <div className="px-5 py-3 border-t border-[rgb(var(--line))] flex items-center justify-between">
              <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50">
                {new Date(latestAdminMsg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </span>
              {unreadFromAdmin.length > 0 && (
                <span className="text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ background: "rgb(var(--blue) / 0.12)", color: "rgb(var(--blue))" }}>
                  {unreadFromAdmin.length} unread
                </span>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Empty state */}
      {projects.length === 0 && invoices.length === 0 && files.length === 0 && messages.length === 0 && (
        <div className="rounded-2xl px-6 py-8 flex flex-col gap-3" style={cardStyle}>
          <p className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))]">Your project is being set up.</p>
          <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-60 leading-relaxed max-w-sm">
            We're getting everything ready. You'll see your project details, files, and invoices here once we kick things off.
          </p>
          <button onClick={() => setTab("messages")}
            className="self-start mt-1 px-4 py-2 rounded-full text-[13px] tracking-tight font-medium border border-[rgb(var(--line))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
            Send a message
          </button>
        </div>
      )}

      {/* All clear */}
      {(projects.length > 0 || invoices.length > 0 || files.length > 0) && activeProjects.length === 0 && unpaidInvoices.length === 0 && !latestAdminMsg && (
        <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] opacity-40 py-4">Nothing needs your attention right now.</p>
      )}
    </div>
  );
}

/* ── Projects ─────────────────────────────────────────────────────── */

function ProjectTimeline({ project, updates }: { project: Project; updates: ProjectUpdate[] }) {
  const [open, setOpen] = useState(false);
  const fmtD = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const latestStatus = updates[0]?.status ?? project.status;
  const latestUpdate = updates[0] ?? null;
  const isRecent = latestUpdate
    ? Date.now() - new Date(latestUpdate.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="flex flex-col">
      {/* Project row */}
      <button onClick={() => setOpen(o => !o)} className="flex items-start justify-between gap-4 py-5 text-left group w-full">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))] group-hover:opacity-70 transition-opacity">{project.title}</span>
            {updates.length > 0 && (
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                className="w-3 h-3 shrink-0 transition-transform duration-200"
                style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", color: "rgb(var(--muted))", opacity: 0.35 }}
                aria-hidden="true">
                <polyline points="2 4 6 8 10 4" />
              </svg>
            )}
          </div>
          {project.phase && (
            <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">{project.phase}</span>
          )}
          {project.notes && (
            <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 leading-relaxed max-w-lg">{project.notes}</p>
          )}
          {(project.start_date || project.target_date) && (
            <div className="flex items-center gap-3 flex-wrap">
              {project.start_date && <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40">Started {fmtDate(project.start_date)}</span>}
              {project.target_date && <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40">Target {fmtDate(project.target_date)}</span>}
            </div>
          )}
        </div>
        <StatusPill status={latestStatus} />
      </button>

      {/* Timeline entries */}
      {open && (
        <div className="flex flex-col gap-0 mb-6">
          {updates.length === 0 ? (
            <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-30 pb-4">No updates yet.</p>
          ) : (
            updates.map((u, i) => (
              <div key={u.id} className="flex gap-4">
                {/* Timeline spine */}
                <div className="flex flex-col items-center shrink-0 pt-1" style={{ width: 20 }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLOR[u.status] ?? "rgb(var(--muted))" }} />
                  {i < updates.length - 1 && (
                    <div className="flex-1 w-px mt-1" style={{ background: "rgb(var(--line))" }} />
                  )}
                </div>
                {/* Entry content */}
                <div className="flex flex-col gap-1 pb-5 min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-medium tracking-tight capitalize" style={{ color: STATUS_COLOR[u.status] ?? "rgb(var(--muted))" }}>
                      {u.status.replace("_", " ")}
                    </span>
                    <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40">{fmtD(u.created_at)}</span>
                  </div>
                  {u.note && (
                    <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-70 leading-relaxed">{u.note}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ProjectsTab({ projects, projectUpdates }: { projects: Project[]; projectUpdates: ProjectUpdate[] }) {
  const groups: { label: string; statuses: string[]; color: string }[] = [
    { label: "Active",    statuses: ["active"],             color: "rgb(var(--green))" },
    { label: "In review", statuses: ["paused", "on_hold"], color: "rgb(var(--amber))" },
    { label: "Completed", statuses: ["completed"],          color: "rgb(var(--blue))"  },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Projects</h1>
        <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] mt-1.5 opacity-60">{projects.length} total</p>
      </div>

      {projects.length === 0 ? <Empty label="No projects yet." /> : (
        <div className="flex flex-col gap-10">
          {groups.map(({ label, statuses, color }) => {
            const items = projects.filter(p => statuses.includes(p.status));
            if (items.length === 0) return null;
            return (
              <div key={label} className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">{label}</span>
                </div>
                <div className="flex flex-col">
                  {items.map((p, i) => (
                    <div key={p.id}>
                      <ProjectTimeline
                        project={p}
                        updates={projectUpdates.filter(u => u.project_id === p.id)}
                      />
                      {i < items.length - 1 && <GridRule />}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Invoices ─────────────────────────────────────────────────────── */

function InvoiceChart({ invoices }: { invoices: Invoice[] }) {
  const max = Math.max(...invoices.map(i => i.amount), 1);
  return (
    <div className="flex items-end gap-1.5 h-20 w-full">
      {invoices.map((inv) => {
        const pct = inv.amount / max;
        const color = STATUS_COLOR[inv.status] ?? "rgb(var(--muted))";
        return (
          <div key={inv.id} className="flex flex-col items-center gap-1 flex-1 min-w-0 h-full justify-end group relative">
            <div className="w-full rounded-sm transition-all duration-300 relative"
              style={{ height: `${Math.max(pct * 100, 6)}%`, background: color, opacity: 0.5 }}>
              <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: color, opacity: 0.85 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InvoicesTab({ invoices, clientEmail }: { invoices: Invoice[]; clientEmail: string }) {
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const totalOwed = invoices.filter(i => i.status !== "paid" && i.status !== "draft").reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const paidPct   = totalPaid + totalOwed > 0 ? Math.round((totalPaid / (totalPaid + totalOwed)) * 100) : 0;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Billing</h1>
          {totalOwed > 0
            ? <p className="text-[15px] tracking-tight mt-1.5" style={{ color: "rgb(var(--amber))" }}>{fmt$(totalOwed)} outstanding</p>
            : <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] mt-1.5 opacity-60">All paid up.</p>
          }
        </div>
        {totalPaid > 0 && (
          <div className="text-right shrink-0">
            <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40 mb-1">{paidPct}% paid</p>
            <p className="text-[1.4rem] font-medium tabular-nums" style={{ color: "rgb(var(--green))" }}>{fmt$(totalPaid)}</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {invoices.length > 0 && totalPaid + totalOwed > 0 && (
        <div className="flex flex-col gap-2">
          <div className="w-full h-1.5 rounded-full bg-[rgb(var(--line))] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${paidPct}%`, background: "rgb(var(--green))" }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40">{fmt$(totalPaid)} paid</span>
            {totalOwed > 0 && <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40">{fmt$(totalOwed)} remaining</span>}
          </div>
        </div>
      )}

      {/* Bar chart */}
      {invoices.length > 1 && (
        <div className="flex flex-col gap-3">
          <InvoiceChart invoices={invoices} />
          <div className="flex items-center gap-4 flex-wrap">
            {(["paid", "pending", "overdue", "draft"] as const).filter(s => invoices.some(i => i.status === s)).map(s => (
              <div key={s} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[s] ?? "rgb(var(--muted))", opacity: 0.7 }} />
                <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 capitalize">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {invoices.length === 0 ? <Empty label="No invoices yet." /> : (
        <div className="flex flex-col gap-3">
          {invoices.map((inv, i) => {
            const unpaid = inv.status !== "paid" && inv.status !== "draft";
            const overdue = inv.status === "overdue";
            return (
              <div key={inv.id} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${overdue ? "rgb(239 68 68 / 0.3)" : "rgb(var(--line))"}`, background: overdue ? "rgb(239 68 68 / 0.03)" : "rgb(var(--line) / 0.2)" }}>
                {/* Invoice header */}
                <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[11px] tracking-widest text-[rgb(var(--muted))] opacity-40 font-medium">INV-{String(i + 1).padStart(3, "0")}</span>
                    <span className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))] truncate">{inv.label}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[1.6rem] font-semibold tabular-nums tracking-tight text-[rgb(var(--fg))]">{fmt$(inv.amount)}</span>
                    <StatusPill status={inv.status} />
                  </div>
                </div>
                {/* Invoice footer */}
                <div className="flex items-center justify-between gap-4 px-5 py-3 border-t" style={{ borderColor: overdue ? "rgb(239 68 68 / 0.15)" : "rgb(var(--line))" }}>
                  <div className="flex items-center gap-4">
                    {inv.due_date && (
                      <span className="text-[13px] tracking-tight" style={{ color: overdue ? "#ef4444" : "rgb(var(--muted))", opacity: overdue ? 0.9 : 0.6 }}>
                        {overdue ? "Overdue " : "Due "}{fmtDate(inv.due_date)}
                      </span>
                    )}
                    {!inv.due_date && (
                      <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-40">No due date</span>
                    )}
                  </div>
                  {inv.payment_url && unpaid && (
                    inv.payment_url.startsWith("http") ? (
                      <a href={inv.payment_url} target="_blank" rel="noreferrer"
                        className="px-5 py-2 rounded-full text-[13px] tracking-tight font-medium transition-opacity hover:opacity-80 shrink-0 inline-flex items-center gap-1.5"
                        style={{ background: overdue ? "#ef4444" : "rgb(var(--fg))", color: "rgb(var(--bg))" }}>
                        Pay now
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                          <path d="M4 12L12 4M7 4h5v5" />
                        </svg>
                      </a>
                    ) : (
                      <button onClick={() => setCheckoutPlanId(inv.payment_url)}
                        className="px-5 py-2 rounded-full text-[13px] tracking-tight font-medium transition-opacity hover:opacity-80 shrink-0"
                        style={{ background: overdue ? "#ef4444" : "rgb(var(--fg))", color: "rgb(var(--bg))" }}>
                        Pay now
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {checkoutPlanId && (
        <WhopCheckoutModal planId={checkoutPlanId} clientEmail={clientEmail} onClose={() => setCheckoutPlanId(null)} />
      )}
    </div>
  );
}

/* ── Files ────────────────────────────────────────────────────────── */


function fileExt(label: string, url: string): string {
  const src = label || url;
  const match = src.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : "";
}

function FileIcon({ ext }: { ext: string }) {
  const groups: Record<string, { label: string; color: string }> = {
    pdf:  { label: "PDF",  color: "#ef4444" },
    doc:  { label: "DOC",  color: "#3b82f6" },
    docx: { label: "DOC",  color: "#3b82f6" },
    xls:  { label: "XLS",  color: "#22c55e" },
    xlsx: { label: "XLS",  color: "#22c55e" },
    ppt:  { label: "PPT",  color: "#f97316" },
    pptx: { label: "PPT",  color: "#f97316" },
    zip:  { label: "ZIP",  color: "#a855f7" },
    png:  { label: "IMG",  color: "#06b6d4" },
    jpg:  { label: "IMG",  color: "#06b6d4" },
    jpeg: { label: "IMG",  color: "#06b6d4" },
    gif:  { label: "IMG",  color: "#06b6d4" },
    webp: { label: "IMG",  color: "#06b6d4" },
    mp4:  { label: "VID",  color: "#ec4899" },
    mov:  { label: "VID",  color: "#ec4899" },
    fig:  { label: "FIG",  color: "#8b5cf6" },
  };
  const info = groups[ext] ?? { label: ext.toUpperCase().slice(0, 3) || "FILE", color: "rgb(var(--muted))" };
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-bold tracking-wider"
      style={{ background: `color-mix(in srgb, ${info.color} 15%, transparent)`, color: info.color }}>
      {info.label}
    </div>
  );
}

function FilesTab({ files }: { files: DFile[] }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Files</h1>
        <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] mt-1 opacity-60">{files.length} {files.length === 1 ? "file" : "files"} shared with you</p>
      </div>

      {files.length === 0 ? <Empty label="No files yet." /> : (
        <div className="flex flex-col gap-2">
          {files.map((f) => {
            const ext = fileExt(f.label, f.url);
            return (
              <div key={f.id} className="flex items-center gap-4 p-4 rounded-2xl transition-colors"
                style={{ border: "1px solid rgb(var(--line))", background: "rgb(var(--line) / 0.2)" }}>
                <FileIcon ext={ext} />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] truncate">{f.label}</p>
                  <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 mt-0.5">{fmtDate(f.uploaded_at)}</p>
                </div>
                <DownloadButton url={f.url} label={f.label} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Messages ─────────────────────────────────────────────────────── */

function MessagesTab({ clientId, messages, setMessages }: { clientId: string; messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>> }) {
  const { trigger } = useWebHaptics();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createBrowserClient>["channel"]> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markRead = () => {
    setMessages(prev => prev.map(m => m.sender === "admin" && !m.read_at ? { ...m, read_at: new Date().toISOString() } : m));
    markAdminMessagesRead(clientId);
  };

  useEffect(() => {
    if (!clientId) return;
    const supabase = createBrowserClient();
    markRead();

    const channel = supabase
      .channel(`client-messages:${clientId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `client_id=eq.${clientId}` },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages(prev => {
            const idx = prev.findIndex(m => m.id.startsWith("optimistic-") && m.sender === incoming.sender && m.body === incoming.body);
            if (idx !== -1) { const next = [...prev]; next[idx] = incoming; return next; }
            return [...prev, incoming];
          });
          if (incoming.sender === "admin") markRead();
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `client_id=eq.${clientId}` },
        (payload) => {
          const updated = payload.new as Message;
          setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
        })
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.sender === "admin") {
          setAdminTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setAdminTyping(false), 3000);
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
  }, [messages, adminTyping]);

  const onDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    channelRef.current?.send({ type: "broadcast", event: "typing", payload: { sender: "client" } });
  };

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    trigger("light");
    setSending(true);
    setDraft("");
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      client_id: clientId,
      sender: "client",
      body,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages(prev => [...prev, optimistic]);
    await sendClientMessage(body);
    setSending(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const fmtDay = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
    if (sameDay(d, today)) return "Today";
    if (sameDay(d, yesterday)) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(d.getFullYear() !== today.getFullYear() && { year: "numeric" }) });
  };

  let lastDay = "";

  return (
    <div className="flex flex-col gap-0" style={{ height: "calc(100vh - 160px)", minHeight: 400 }}>
      <div className="mb-6 shrink-0">
        <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Messages</h1>
        <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] mt-1.5 opacity-60">Direct line to your project team.</p>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 pb-4">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 opacity-40">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-[rgb(var(--muted))]" aria-hidden="true">
              <path d="M21 4H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h3v3l4.5-3H21a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z" />
            </svg>
            <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]">No messages yet. Say hello.</p>
          </div>
        )}
        {messages.map((msg) => {
          const day = fmtDay(msg.created_at);
          const showDay = day !== lastDay;
          lastDay = day;
          const isClient = msg.sender === "client";
          return (
            <div key={msg.id}>
              {showDay && (
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-[rgb(var(--line))]" />
                  <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40 shrink-0">{day}</span>
                  <div className="flex-1 h-px bg-[rgb(var(--line))]" />
                </div>
              )}
              <div className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
                <div className="flex flex-col max-w-[72%]" style={{ alignItems: isClient ? "flex-end" : "flex-start" }}>
                  <div className="px-4 py-2.5 text-[15px] tracking-tight leading-relaxed"
                    style={{
                      background: isClient ? "rgb(var(--fg))" : "rgb(var(--line))",
                      color: isClient ? "rgb(var(--bg))" : "rgb(var(--fg))",
                      borderRadius: isClient ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    }}>
                    {msg.body}
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40">
                      {new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                    {isClient && (
                      msg.read_at
                        ? <span className="text-[12px] tracking-tight opacity-40" style={{ color: "rgb(var(--blue))" }}>Read</span>
                        : !msg.id.startsWith("optimistic-") && <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40">Delivered</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {adminTyping && (
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

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); send(); }}
        className="shrink-0 mt-4 flex flex-col gap-2 p-3 rounded-2xl border border-[rgb(var(--line))] focus-within:border-[rgb(var(--fg))/0.2] transition-colors"
        style={{ background: "rgb(var(--line)/0.08)" }}>
        <textarea
          rows={1}
          value={draft}
          onChange={onDraftChange}
          onKeyDown={onKeyDown}
          placeholder="Type a message..."
          className="w-full resize-none tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-35 focus:outline-none leading-relaxed bg-transparent"
          style={{ maxHeight: 160, overflowY: "auto", fontSize: 16 }}
        />
        <div className="flex justify-end">
          <button type="submit" disabled={!draft.trim() || sending}
            className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium transition-all disabled:opacity-25"
            style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}>
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Licenses ─────────────────────────────────────────────────────── */

const LICENSE_STATUS: Record<string, { bg: string; text: string }> = {
  active:  { bg: "rgb(var(--green) / 0.12)", text: "rgb(var(--green))" },
  expired: { bg: "rgb(var(--amber) / 0.12)", text: "rgb(var(--amber))" },
  revoked: { bg: "rgb(239 68 68 / 0.1)",     text: "rgb(220 38 38)"    },
};

function LicensesTab({ licenses }: { licenses: License[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Licenses</h1>
        <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] mt-1.5 opacity-60">{licenses.length} {licenses.length === 1 ? "license" : "licenses"}</p>
      </div>

      {licenses.length === 0 ? <Empty label="No licenses yet." /> : (
        <div className="flex flex-col gap-3">
          {licenses.map((l) => {
            const s = LICENSE_STATUS[l.status] ?? LICENSE_STATUS.active;
            const tierLabel = l.tier === "lifetime" ? "Lifetime" : "Standard";
            return (
              <div key={l.id} className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgb(var(--line))", background: "rgb(var(--line) / 0.2)" }}>
                <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 flex-wrap">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">Aether {tierLabel}</span>
                      <span className="inline-block text-[11px] font-medium tracking-tight px-2 py-0.5 rounded-full capitalize"
                        style={{ background: s.bg, color: s.text }}>
                        {l.status}
                      </span>
                    </div>
                    <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40">
                      Purchased {fmtDate(l.created_at)}
                    </span>
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-[rgb(var(--line))] flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] tracking-widest uppercase text-[rgb(var(--muted))] opacity-40">License key</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-[14px] tracking-wide text-[rgb(var(--fg))] select-all">{l.key}</code>
                      <button onClick={() => copy(l.key)}
                        className="shrink-0 transition-colors"
                        style={{ color: copied === l.key ? "rgb(var(--green))" : "rgb(var(--muted))", opacity: copied === l.key ? 1 : 0.5 }}
                        title="Copy">
                        {copied === l.key ? (
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="2 8 6 12 14 4" /></svg>
                        ) : (
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="5" y="5" width="9" height="9" rx="1.5" /><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2H3.5A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] tracking-widest uppercase text-[rgb(var(--muted))] opacity-40">Store domain</span>
                    {l.domain ? (
                      <span className="font-mono text-[14px] tracking-tight text-[rgb(var(--fg))]">{l.domain}</span>
                    ) : (
                      <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-40">Not assigned yet — activates when you install the theme</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Settings ─────────────────────────────────────────────────────── */

function SettingsSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] opacity-50 px-1 mb-1">{label}</p>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgb(var(--line))", background: "rgb(var(--line) / 0.2)" }}>
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ label, hint, children, border = true }: { label: string; hint?: string; children: React.ReactNode; border?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-5 py-4 ${border ? "border-b border-[rgb(var(--line))]" : ""}`}>
      <div className="min-w-0">
        <p className="text-[15px] tracking-tight text-[rgb(var(--fg))]">{label}</p>
        {hint && <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 mt-0.5 leading-snug">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingsTab({ client, setTab }: { client: Client | null; setTab: (t: Tab) => void }) {
  const { theme, toggle } = useTheme();
  const { trigger } = useWebHaptics();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(client?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const onSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false); setError("");
    trigger("light");
    startTransition(async () => {
      const res = await updateClientProfile(name.trim());
      if (res.error) { setError(res.error); }
      else { trigger("success"); setSaved(true); }
    });
  };

  const initials = (client?.company ?? client?.name ?? "?").slice(0, 2).toUpperCase();
  const displayName = client?.company ?? client?.name ?? "Client";

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Settings</h1>

      {/* Profile card */}
      <div className="flex items-center gap-4 p-5 rounded-2xl" style={{ border: "1px solid rgb(var(--line))", background: "rgb(var(--line) / 0.2)" }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[15px] font-medium tracking-tight text-[rgb(var(--muted))] shrink-0"
          style={{ background: "rgb(var(--line))" }}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))] truncate">{displayName}</p>
          <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 truncate">{client?.email}</p>
        </div>
      </div>

      {/* Profile */}
      <SettingsSection label="Profile">
        <form onSubmit={onSaveProfile}>
          <div className="px-5 py-4 border-b border-[rgb(var(--line))]">
            <label className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 block mb-2">Display name</label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setSaved(false); }}
              placeholder="Your name"
              className="w-full bg-transparent text-[15px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none"
            />
          </div>
          <div className="px-5 py-4 border-b border-[rgb(var(--line))]">
            <label className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 block mb-2">Email</label>
            <p className="text-[15px] tracking-tight text-[rgb(var(--fg))] opacity-40">{client?.email}</p>
            <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40 mt-1">To change your email, message us.</p>
          </div>
          <div className="px-5 py-4 flex items-center gap-3">
            <button type="submit" disabled={pending || !name.trim() || name.trim() === (client?.name ?? "")}
              className="px-5 py-2 rounded-full text-[13px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-20">
              {pending ? "Saving..." : "Save changes"}
            </button>
            {saved && <span className="text-[13px] tracking-tight" style={{ color: "rgb(var(--green))" }}>Saved.</span>}
            {error && <span className="text-[13px] tracking-tight text-red-400">{error}</span>}
          </div>
        </form>
      </SettingsSection>

      {/* Appearance */}
      <SettingsSection label="Appearance">
        <SettingsRow label="Theme" hint={`Currently ${theme} mode`} border={false}>
          <div className="flex items-center gap-1 p-0.5 rounded-full" style={{ background: "rgb(var(--line))" }}>
            {(["light", "dark"] as const).map(t => (
              <button key={t} onClick={() => { if (theme !== t) toggle(); }}
                className="px-4 py-1.5 rounded-full text-[13px] tracking-tight capitalize transition-all duration-150"
                style={{
                  background: theme === t ? "rgb(var(--bg))" : "transparent",
                  color: theme === t ? "rgb(var(--fg))" : "rgb(var(--muted))",
                  boxShadow: theme === t ? "0 1px 3px rgb(0 0 0 / 0.12)" : "none",
                }}>
                {t}
              </button>
            ))}
          </div>
        </SettingsRow>
      </SettingsSection>

      {/* Support */}
      <SettingsSection label="Support">
        <SettingsRow label="Messages" hint="Questions, feedback, or change requests">
          <button onClick={() => setTab("messages")}
            className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium border border-[rgb(var(--line))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
            Open
          </button>
        </SettingsRow>
        <SettingsRow label="Files" hint="All documents shared with you" border={false}>
          <button onClick={() => setTab("files")}
            className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium border border-[rgb(var(--line))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
            Open
          </button>
        </SettingsRow>
      </SettingsSection>

      {/* Account */}
      <SettingsSection label="Account">
        <SettingsRow label="Sign out" hint="You'll be returned to the login screen." border={false}>
          <button onClick={() => startTransition(() => signOut())} disabled={pending}
            className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium border border-[rgb(var(--line))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors disabled:opacity-30">
            {pending ? "..." : "Sign out"}
          </button>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}

/* ── Shell ────────────────────────────────────────────────────────── */

export function DashboardShell({ client, projects, invoices, files, messages: initialMessages, projectUpdates, licenses }: {
  client: Client | null;
  projects: Project[];
  invoices: Invoice[];
  files: DFile[];
  messages: Message[];
  projectUpdates: ProjectUpdate[];
  licenses: License[];
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const unread = messages.filter(m => m.sender === "admin" && !m.read_at).length;

  useEffect(() => {
    const base = "Inertia";
    document.title = unread > 0 ? `(${unread}) ${base}` : base;
    return () => { document.title = base; };
  }, [unread]);

  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {!bannerDismissed && (
        <div className="w-full flex items-center justify-between gap-4 px-6 py-2 border-b border-[rgb(var(--line))]">
          <p className="flex-1 text-center text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-70">
            This portal is in early access. You may encounter rough edges as we continue to improve things.
          </p>
          <button onClick={() => setBannerDismissed(true)} className="shrink-0 opacity-30 hover:opacity-70 transition-opacity text-[rgb(var(--muted))]" aria-label="Dismiss">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3 h-3" aria-hidden="true">
              <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </button>
        </div>
      )}
      <TopNav client={client} tab={tab} setTab={setTab} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} unreadMessages={unread} />

      <main className="w-full px-6 sm:max-w-[80rem] sm:mx-auto py-10" style={{ animation: "rise-in 240ms cubic-bezier(0.22,1,0.36,1) both" }}>
        <div style={{ display: tab === "overview"  ? undefined : "none" }}>
          <OverviewTab client={client} projects={projects} invoices={invoices} files={files} messages={messages} projectUpdates={projectUpdates} setTab={setTab} />
        </div>
        <div style={{ display: tab === "projects"  ? undefined : "none" }}>
          <ProjectsTab projects={projects} projectUpdates={projectUpdates} />
        </div>
        <div style={{ display: tab === "invoices"  ? undefined : "none" }}>
          <InvoicesTab invoices={invoices} clientEmail={client?.email ?? ""} />
        </div>
        <div style={{ display: tab === "files"     ? undefined : "none" }}>
          <FilesTab files={files} />
        </div>
        <div style={{ display: tab === "messages"  ? undefined : "none" }}>
          <MessagesTab clientId={client?.id ?? ""} messages={messages} setMessages={setMessages} key={client?.id} />
        </div>
        <div style={{ display: tab === "licenses"  ? undefined : "none" }}>
          <LicensesTab licenses={licenses} />
        </div>
        <div style={{ display: tab === "settings"  ? undefined : "none" }}>
          <SettingsTab client={client} setTab={setTab} />
        </div>
      </main>
    </div>
  );
}
