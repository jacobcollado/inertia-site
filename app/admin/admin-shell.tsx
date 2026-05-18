"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/theme-toggle";
import { inviteClient, addTool, deleteTool } from "./actions";

type Tool = { id: string; name: string; url: string | null; category: string | null; note: string | null; created_at: string };

type Project = { id: string; status: string };
type Client = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed_at: string | null;
  projects: Project[];
  in_clients_table: boolean;
  banned: boolean;
};
type Overview = {
  totalRevenue: number;
  outstanding: number;
  activeProjects: number;
  totalClients: number;
  recentActivity: { clientName: string; clientId: string; type: string; label: string; date: string }[];
  change: {
    revenue: number | null;
    outstanding: number | null;
    clients: number | null;
    activeProjects: number | null;
  };
  monthlyRevenue: { month: string; amount: number }[];
};

function fmt$(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}

function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}

function ChangeBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const up = pct >= 0;
  const color = up ? "rgb(var(--green))" : "#ef4444";
  return (
    <span className="inline-flex items-center gap-1 text-[13px] tracking-tight" style={{ color }}>
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
        {up
          ? <><line x1="6" y1="10" x2="6" y2="2" /><polyline points="2 6 6 2 10 6" /></>
          : <><line x1="6" y1="2" x2="6" y2="10" /><polyline points="2 6 6 10 10 6" /></>
        }
      </svg>
      {Math.abs(pct)}%
    </span>
  );
}

function StatCard({ label, value, sub, accent, change }: { label: string; value: string; sub?: string; accent?: string; change?: number | null }) {
  return (
    <div className="flex flex-col gap-3 p-5 border border-[rgb(var(--line))]">
      <span className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-60">{label}</span>
      <span className="text-[2.25rem] font-medium tracking-[-0.03em] leading-none" style={accent ? { color: accent } : { color: "rgb(var(--fg))" }}>
        {value}
      </span>
      <div className="flex items-center gap-2 min-h-[18px]">
        {change !== undefined && change !== null
          ? <ChangeBadge pct={change} />
          : sub
            ? <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50">{sub}</span>
            : null
        }
        {change !== undefined && change !== null && sub && (
          <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-40">{sub}</span>
        )}
      </div>
    </div>
  );
}

function RevenueChart({ data }: { data: { month: string; amount: number }[] }) {
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div className="flex flex-col gap-4">
      <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">Revenue collected</span>
      <div className="flex items-end gap-2 h-28">
        {data.map((d, i) => {
          const pct = d.amount / max;
          const isLast = i === data.length - 1;
          return (
            <div key={d.month} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <div className="w-full flex flex-col justify-end" style={{ height: "88px" }}>
                <div
                  className="w-full transition-all duration-300"
                  style={{
                    height: `${Math.max(pct * 100, d.amount > 0 ? 4 : 1)}%`,
                    background: isLast ? "rgb(var(--fg))" : "rgb(var(--line))",
                    opacity: isLast ? 1 : 0.6,
                  }}
                />
              </div>
              <span className="text-[10px] tracking-tight text-[rgb(var(--muted))] opacity-40 truncate w-full text-center">{d.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OverviewDashboard({ overview, clients }: { overview: Overview; clients: Client[] }) {
  const suspended = clients.filter(c => c.banned).length;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total clients"
          value={String(overview.totalClients)}
          change={overview.change.clients}
          sub={suspended > 0 ? `${suspended} suspended` : "vs. last 30 days"}
        />
        <StatCard
          label="Active projects"
          value={String(overview.activeProjects)}
          change={overview.change.activeProjects}
          sub="vs. last 30 days"
        />
        <StatCard
          label="Revenue collected"
          value={fmt$(overview.totalRevenue)}
          change={overview.change.revenue}
          sub="vs. last 30 days"
        />
        <StatCard
          label="Outstanding"
          value={fmt$(overview.outstanding)}
          change={overview.change.outstanding}
          accent={overview.outstanding > 0 ? "rgb(var(--amber))" : undefined}
          sub="vs. last 30 days"
        />
      </div>

      {overview.monthlyRevenue.some(d => d.amount > 0) && (
        <RevenueChart data={overview.monthlyRevenue} />
      )}

      {overview.recentActivity.length > 0 && (
        <div className="flex flex-col gap-5">
          <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">Recent activity</span>
          <div className="flex flex-col">
            {overview.recentActivity.map((item, i) => (
              <div key={i}>
                <Link href={`/admin/clients/${item.clientId}`}
                  className="flex items-center justify-between gap-4 py-4 group hover:opacity-70 transition-opacity">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[13px] tracking-tight px-2.5 py-1 rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] opacity-60 shrink-0 capitalize">{item.type}</span>
                    <span className="text-[16px] tracking-tight text-[rgb(var(--fg))] truncate">{item.label}</span>
                    <span className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-40 truncate hidden sm:block">{item.clientName}</span>
                  </div>
                  <span className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-40 shrink-0">{item.date}</span>
                </Link>
                {i < overview.recentActivity.length - 1 && <GridRule />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "rgb(var(--green))",
    completed: "rgb(var(--blue))",
    paused: "rgb(var(--amber))",
    on_hold: "rgb(var(--amber))",
  };
  return (
    <span className="w-1.5 h-1.5 rounded-full shrink-0 inline-block"
      style={{ background: colors[status] ?? "rgb(var(--muted))" }} />
  );
}

function InviteForm({ onDone }: { onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await inviteClient(fd);
      if (res.error) { setError(res.error); return; }
      onDone();
    });
  };

  const inputClass = "w-full bg-transparent border-b border-[rgb(var(--line))] py-4 text-[16px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none focus:border-[rgb(var(--fg))] transition-colors";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <input name="email" type="email" required placeholder="Client email" className={inputClass} />
      <input name="name" type="text" placeholder="Name (optional)" className={inputClass} />
      <input name="company" type="text" placeholder="Company (optional)" className={inputClass} />
      {error && <p className="text-[14px] text-red-500 tracking-tight">{error}</p>}
      <div className="flex items-center gap-4 pt-1">
        <button type="submit" disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-30">
          {pending ? "Sending invite..." : "Send invite"}
        </button>
        <button type="button" onClick={onDone}
          className="text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

const CATEGORIES = ["Design", "Development", "Communication", "Finance", "Analytics", "Hosting", "Other"];

function ToolsView({ initialTools }: { initialTools: Tool[] }) {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const inputClass = "w-full bg-transparent border-b border-[rgb(var(--line))] py-3.5 text-[15px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none focus:border-[rgb(var(--fg))] transition-colors";

  const onAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addTool(fd);
      if (res.error) { setError(res.error); return; }
      const name = fd.get("name") as string;
      const url = fd.get("url") as string || null;
      const category = fd.get("category") as string || null;
      const note = fd.get("note") as string || null;
      setTools(prev => [...prev, { id: Date.now().toString(), name, url, category, note, created_at: new Date().toISOString() }].sort((a, b) => (a.category ?? "").localeCompare(b.category ?? "") || a.name.localeCompare(b.name)));
      setAdding(false);
      (e.target as HTMLFormElement).reset();
    });
  };

  const onDelete = (id: string) => {
    startTransition(async () => {
      await deleteTool(id);
      setTools(prev => prev.filter(t => t.id !== id));
    });
  };

  const grouped = CATEGORIES.reduce<Record<string, Tool[]>>((acc, cat) => {
    const items = tools.filter(t => t.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});
  const uncategorized = tools.filter(t => !t.category || !CATEGORIES.includes(t.category));
  if (uncategorized.length) grouped["Other"] = [...(grouped["Other"] ?? []), ...uncategorized];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Tools</h1>
          <p className="text-[16px] tracking-tight text-[rgb(var(--muted))] mt-1">{tools.length} platforms and URLs</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] tracking-tight font-medium border border-[rgb(var(--line))] text-[rgb(var(--fg))] hover:border-[rgb(var(--fg))/0.4] transition-colors shrink-0">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
              <line x1="10" y1="4" x2="10" y2="16" /><line x1="4" y1="10" x2="16" y2="10" />
            </svg>
            Add tool
          </button>
        )}
      </div>

      {adding && (
        <div className="border border-[rgb(var(--line))] p-6">
          <h2 className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))] mb-6">Add a tool</h2>
          <form onSubmit={onAdd} className="flex flex-col gap-5">
            <input name="name" required placeholder="Name" className={inputClass} />
            <input name="url" type="url" placeholder="URL (optional)" className={inputClass} />
            <select name="category" className={`${inputClass} appearance-none`} defaultValue="">
              <option value="">Category (optional)</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="note" placeholder="Note (optional)" className={inputClass} />
            {error && <p className="text-[14px] text-red-500 tracking-tight">{error}</p>}
            <div className="flex items-center gap-4 pt-1">
              <button type="submit" disabled={pending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-30">
                {pending ? "Adding..." : "Add tool"}
              </button>
              <button type="button" onClick={() => setAdding(false)}
                className="text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <GridRule />

      {tools.length === 0 ? (
        <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] opacity-40 py-10">No tools added yet.</p>
      ) : (
        <div className="flex flex-col gap-10">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="flex flex-col gap-4">
              <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50">{cat}</span>
              <div className="flex flex-col">
                {items.map((t, i) => (
                  <div key={t.id}>
                    <div className="flex items-center justify-between gap-6 py-4 group">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          {t.url ? (
                            <a href={t.url} target="_blank" rel="noopener noreferrer"
                              className="text-[15px] tracking-tight text-[rgb(var(--fg))] hover:opacity-70 transition-opacity truncate">
                              {t.name}
                            </a>
                          ) : (
                            <span className="text-[15px] tracking-tight text-[rgb(var(--fg))] truncate">{t.name}</span>
                          )}
                          {t.url && (
                            <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40 truncate hidden sm:block">
                              {t.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                            </span>
                          )}
                        </div>
                        {t.note && <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50">{t.note}</span>}
                      </div>
                      <button onClick={() => onDelete(t.id)} disabled={pending}
                        className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity text-[rgb(var(--muted))] hover:text-red-400 shrink-0">
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                          <polyline points="3 6 17 6" /><path d="M8 6V4h4v2" /><path d="M5 6l1 11h8l1-11" />
                        </svg>
                      </button>
                    </div>
                    {i < items.length - 1 && <GridRule />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type View = "overview" | "clients" | "tools";

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "clients", label: "Clients" },
  { id: "tools", label: "Tools" },
];

function Sidebar({
  view,
  setView,
  onClose,
}: {
  view: View;
  setView: (v: View) => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-[rgb(var(--line))] shrink-0">
        <div className="flex flex-col gap-0.5">
          <span className="text-[17px] font-medium tracking-tight text-[rgb(var(--fg))]">Inertia</span>
          <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40">Admin</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[rgb(var(--muted))] opacity-50 hover:opacity-100 transition-opacity lg:hidden"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
              <line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 pt-4 flex-1">
        {NAV_ITEMS.map(({ id, label }) => {
          const active = view === id;
          return (
            <button
              key={id}
              onClick={() => { setView(id); onClose?.(); }}
              className="flex items-center gap-3 px-3 py-2.5 text-[14px] tracking-tight transition-colors text-left w-full"
              style={{
                color: active ? "rgb(var(--fg))" : "rgb(var(--muted))",
                background: active ? "rgb(var(--line))" : "transparent",
                opacity: active ? 1 : 0.6,
              }}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 pt-3 border-t border-[rgb(var(--line))] flex items-center justify-between shrink-0">
        <Link
          href="/"
          className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-40 hover:opacity-100 transition-opacity font-medium"
        >
          byinertia.com
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
}

export function AdminShell({ clients, overview, tools }: { clients: Client[]; overview: Overview; tools: Tool[] }) {
  const [inviting, setInviting] = useState(false);
  const [view, setView] = useState<View>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] flex">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-[rgb(var(--bg))]/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop fixed, mobile slide-in */}
      <aside
        className={[
          "fixed top-0 left-0 h-full z-30 w-[220px] border-r border-[rgb(var(--line))] bg-[rgb(var(--bg))] transition-transform duration-200 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <Sidebar view={view} setView={setView} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar spacer */}
      <div className="hidden lg:block w-[220px] shrink-0" />

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-[rgb(var(--line))] lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-[rgb(var(--muted))] opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
              <line x1="3" y1="6" x2="17" y2="6" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14" x2="17" y2="14" />
            </svg>
          </button>
          <span className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))]">Inertia</span>
          <ThemeToggle />
        </div>

        <main className="flex-1 px-6 sm:px-10 lg:px-14 py-12 sm:py-14 max-w-4xl w-full">

          {view === "overview" && (
            <div className="flex flex-col gap-10">
              <div>
                <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">
                  Overview
                </h1>
                <p className="text-[16px] tracking-tight text-[rgb(var(--muted))] mt-1">
                  Your current standings at a glance.
                </p>
              </div>
              <OverviewDashboard overview={overview} clients={clients} />
            </div>
          )}

          {view === "clients" && (
            <div className="flex flex-col gap-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">
                    Clients
                  </h1>
                  <p className="text-[16px] tracking-tight text-[rgb(var(--muted))] mt-1">
                    {clients.length} {clients.length === 1 ? "client" : "clients"}
                  </p>
                </div>
                {!inviting && (
                  <button onClick={() => setInviting(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] tracking-tight font-medium border border-[rgb(var(--line))] text-[rgb(var(--fg))] hover:border-[rgb(var(--fg))/0.4] transition-colors shrink-0">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                      <line x1="10" y1="4" x2="10" y2="16" /><line x1="4" y1="10" x2="16" y2="10" />
                    </svg>
                    Invite client
                  </button>
                )}
              </div>

              {inviting && (
                <div className="border border-[rgb(var(--line))] p-6">
                  <h2 className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))] mb-6">Invite a client</h2>
                  <InviteForm onDone={() => setInviting(false)} />
                </div>
              )}

              <GridRule />
              {clients.length === 0 ? (
                <p className="text-[16px] tracking-tight text-[rgb(var(--muted))] opacity-40 py-10">No clients yet.</p>
              ) : (
                <div className="flex flex-col">
                  {clients.map((c, i) => {
                    const active = c.projects?.filter(p => p.status === "active") ?? [];
                    const displayName = c.company ?? c.name ?? c.email;
                    return (
                      <div key={c.id}>
                        <Link href={`/admin/clients/${c.id}`}
                          className="flex items-center justify-between gap-6 py-5 group hover:opacity-70 transition-opacity">
                          <div className="flex flex-col gap-1.5 min-w-0">
                            <span className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))] truncate">{displayName}</span>
                            <span className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-50 truncate">{c.email}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {c.banned && (
                              <span className="text-[12px] tracking-tight px-2.5 py-1 rounded-full border border-red-400/30 text-red-400 opacity-80">
                                suspended
                              </span>
                            )}
                            {!c.confirmed_at && !c.banned && (
                              <span className="text-[12px] tracking-tight px-2.5 py-1 rounded-full border border-[rgb(var(--amber))/0.4] text-[rgb(var(--amber))] opacity-70">
                                invite pending
                              </span>
                            )}
                            {!c.in_clients_table && (
                              <span className="text-[12px] tracking-tight px-2.5 py-1 rounded-full border border-[rgb(var(--amber))/0.4] text-[rgb(var(--amber))] opacity-70">
                                no profile
                              </span>
                            )}
                            {active.length > 0 && (
                              <div className="flex items-center gap-2">
                                <StatusDot status="active" />
                                <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">
                                  {active.length} active
                                </span>
                              </div>
                            )}
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[rgb(var(--muted))] opacity-40 group-hover:opacity-80 transition-opacity" aria-hidden="true">
                              <line x1="4" y1="10" x2="16" y2="10" /><polyline points="10 4 16 10 10 16" />
                            </svg>
                          </div>
                        </Link>
                        {i < clients.length - 1 && <GridRule />}
                      </div>
                    );
                  })}
                </div>
              )}
              <GridRule />
            </div>
          )}

          {view === "tools" && <ToolsView initialTools={tools} />}

        </main>
      </div>
    </div>
  );
}
