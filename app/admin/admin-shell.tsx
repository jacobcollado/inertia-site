"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/theme-toggle";
import { inviteClient } from "./actions";

type Project = { id: string; status: string };
type Client = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  created_at: string;
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

function OverviewDashboard({ overview, clients }: { overview: Overview; clients: Client[] }) {
  const suspended = clients.filter(c => c.banned).length;

  return (
    <div className="flex flex-col gap-10">
      {/* Stat grid */}
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

      {/* Recent activity */}
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

export function AdminShell({ clients, overview }: { clients: Client[]; overview: Overview }) {
  const [inviting, setInviting] = useState(false);
  const [view, setView] = useState<"overview" | "clients">("overview");

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 sm:px-10 h-14 border-b border-[rgb(var(--line))]">
        <div className="flex items-center gap-4">
          <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">Inertia</span>
          <div className="flex items-center gap-1 border border-[rgb(var(--line))] rounded-full p-0.5">
            {(["overview", "clients"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1 rounded-full text-[13px] tracking-tight capitalize transition-colors"
                style={{
                  background: view === v ? "rgb(var(--fg))" : "transparent",
                  color: view === v ? "rgb(var(--bg))" : "rgb(var(--muted))",
                }}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/" className="text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
            Site
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 sm:px-12 py-12 sm:py-14 flex flex-col gap-10">

        {view === "overview" && (
          <>
            <div>
              <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">
                Overview
              </h1>
              <p className="text-[16px] tracking-tight text-[rgb(var(--muted))] mt-1">
                Your current standings at a glance.
              </p>
            </div>
            <OverviewDashboard overview={overview} clients={clients} />
          </>
        )}

        {view === "clients" && (
          <>
            {/* Header */}
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

            {/* Invite form */}
            {inviting && (
              <div className="border border-[rgb(var(--line))] p-6">
                <h2 className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))] mb-6">Invite a client</h2>
                <InviteForm onDone={() => setInviting(false)} />
              </div>
            )}

            {/* Client list */}
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
          </>
        )}
      </main>
    </div>
  );
}
