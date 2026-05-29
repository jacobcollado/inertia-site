"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/app/theme-toggle";
import { inviteClient, addTool, deleteTool, deleteAccount } from "./actions";

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

// Inline sparkline for a stat card
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 80, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-8" aria-hidden="true" style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

// Donut ring for a ratio
function DonutRing({ value, total, color }: { value: number; total: number; color: string }) {
  const r = 20, cx = 24, cy = 24, stroke = 4;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(value / total, 1) : 0;
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12" aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgb(var(--line))" strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 600ms cubic-bezier(0.22,1,0.36,1)" }}
      />
    </svg>
  );
}

// Mini bar chart for a stat card
function MiniBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((d, i) => {
        const pct = Math.max(d.value / max, d.value > 0 ? 0.05 : 0.02);
        const isLast = i === data.length - 1;
        return (
          <div key={d.label} className="flex-1 rounded-sm transition-all duration-300"
            style={{ height: `${pct * 100}%`, background: color, opacity: isLast ? 1 : 0.3 + (i / data.length) * 0.4 }} />
        );
      })}
    </div>
  );
}

function MetricCards({ overview, clients }: { overview: Overview; clients: Client[] }) {
  const suspended = clients.filter(c => c.banned).length;
  const totalProjects = clients.reduce((s, c) => s + c.projects.length, 0);
  const revenueSparkData = overview.monthlyRevenue.map(d => d.amount);
  const hasRevChart = overview.monthlyRevenue.some(d => d.amount > 0);
  const outstandingColor = overview.outstanding > 0 ? "rgb(var(--amber))" : "rgb(var(--green))";

  const cards = [
    /* Revenue */
    <div key="revenue" className="flex flex-col gap-4 p-6 rounded-2xl h-full" style={{ background: "rgb(var(--line) / 0.4)", border: "1px solid rgb(var(--line))" }}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">Revenue collected</span>
        <ChangeBadge pct={overview.change.revenue} />
      </div>
      <span className="text-[3.25rem] font-semibold tracking-[-0.05em] leading-none text-[rgb(var(--fg))]">{fmt$(overview.totalRevenue)}</span>
      {hasRevChart ? (
        <div className="flex flex-col gap-1.5 mt-auto">
          <MiniBarChart data={overview.monthlyRevenue.map(d => ({ label: d.month, value: d.amount }))} color="rgb(var(--fg))" />
          <div className="flex justify-between">
            {overview.monthlyRevenue.map(d => (
              <span key={d.month} className="text-[9px] tracking-tight text-[rgb(var(--muted))] opacity-40 flex-1 text-center">{d.month}</span>
            ))}
          </div>
        </div>
      ) : (
        <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-40 mt-auto">No revenue yet</span>
      )}
    </div>,

    /* Outstanding */
    <div key="outstanding" className="flex flex-col gap-4 p-6 rounded-2xl h-full" style={{ background: "rgb(var(--line) / 0.4)", border: "1px solid rgb(var(--line))" }}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">Outstanding</span>
        <ChangeBadge pct={overview.change.outstanding} />
      </div>
      <span className="text-[3.25rem] font-semibold tracking-[-0.05em] leading-none" style={{ color: outstandingColor }}>
        {fmt$(overview.outstanding)}
      </span>
      <div className="flex items-center gap-4 mt-auto">
        <DonutRing value={overview.outstanding} total={overview.totalRevenue + overview.outstanding} color={outstandingColor} />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "rgb(var(--green))" }} />
            <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">{fmt$(overview.totalRevenue)} collected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: outstandingColor }} />
            <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">{fmt$(overview.outstanding)} owed</span>
          </div>
        </div>
      </div>
    </div>,

    /* Clients */
    <div key="clients" className="flex flex-col gap-4 p-6 rounded-2xl h-full" style={{ background: "rgb(var(--line) / 0.4)", border: "1px solid rgb(var(--line))" }}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">Clients</span>
        <ChangeBadge pct={overview.change.clients} />
      </div>
      <span className="text-[3.25rem] font-semibold tracking-[-0.05em] leading-none text-[rgb(var(--fg))]">{overview.totalClients}</span>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">{overview.totalClients - suspended} active</span>
          {suspended > 0 && (
            <span className="text-[13px] tracking-tight" style={{ color: "#ef4444" }}>{suspended} suspended</span>
          )}
        </div>
        <Sparkline data={revenueSparkData} color="rgb(var(--fg))" />
      </div>
    </div>,

    /* Active projects */
    <div key="projects" className="flex flex-col gap-4 p-6 rounded-2xl h-full" style={{ background: "rgb(var(--line) / 0.4)", border: "1px solid rgb(var(--line))" }}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">Active projects</span>
        <ChangeBadge pct={overview.change.activeProjects} />
      </div>
      <span className="text-[3.25rem] font-semibold tracking-[-0.05em] leading-none text-[rgb(var(--fg))]">{overview.activeProjects}</span>
      <div className="flex flex-col gap-2 mt-auto">
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgb(var(--line))" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: totalProjects > 0 ? `${(overview.activeProjects / totalProjects) * 100}%` : "0%", background: "rgb(var(--green))" }} />
        </div>
        <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">{overview.activeProjects} of {totalProjects} total</span>
      </div>
    </div>,
  ];

  return <MetricCarousel cards={cards} />;
}

function MetricCarousel({ cards }: { cards: React.ReactNode[] }) {
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const touchDelta = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    touchDelta.current = e.touches[0].clientX - touchStart.current;
  };
  const onTouchEnd = () => {
    if (Math.abs(touchDelta.current) > 40) {
      if (touchDelta.current < 0) setActive(a => Math.min(a + 1, cards.length - 1));
      else setActive(a => Math.max(a - 1, 0));
    }
    touchStart.current = null;
    touchDelta.current = 0;
  };

  return (
    <>
      {/* Mobile: carousel */}
      <div className="sm:hidden flex flex-col gap-3">
        <div className="overflow-hidden" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div
            className="flex transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {cards.map((card, i) => (
              <div key={i} className="w-full shrink-0">{card}</div>
            ))}
          </div>
        </div>
        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="transition-all duration-200 rounded-full [-webkit-tap-highlight-color:transparent]"
              style={{
                width: i === active ? 20 : 6,
                height: 6,
                background: "rgb(var(--fg))",
                opacity: i === active ? 1 : 0.15,
              }}
            />
          ))}
        </div>
      </div>

      {/* Desktop: 4-col grid */}
      <div className="hidden sm:grid sm:grid-cols-4 gap-3">
        {cards}
      </div>
    </>
  );
}

function OverviewDashboard({ overview, clients }: { overview: Overview; clients: Client[] }) {
  const cardStyle = { border: "1px solid rgb(var(--line))", background: "rgb(var(--line) / 0.2)" };

  return (
    <div className="flex flex-col gap-8">
      <MetricCards overview={overview} clients={clients} />

      {overview.recentActivity.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] opacity-50 px-1">Recent activity</span>
          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            {overview.recentActivity.map((item, i) => (
              <Link key={i} href={`/admin/clients/${item.clientId}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[rgb(var(--line)/0.3)] transition-colors"
                style={{ borderBottom: i < overview.recentActivity.length - 1 ? "1px solid rgb(var(--line))" : "none" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[11px] tracking-tight px-2 py-0.5 rounded-full shrink-0 capitalize font-medium"
                    style={
                      item.type === "invoice"
                        ? { background: "rgb(60 100 255 / 0.12)", color: "rgb(60,100,255)" }
                        : item.type === "project"
                        ? { background: "rgb(var(--green) / 0.12)", color: "rgb(var(--green))" }
                        : { background: "rgb(var(--line))", color: "rgb(var(--muted))" }
                    }
                  >{item.type}</span>
                  <span className="text-[15px] tracking-tight text-[rgb(var(--fg))] truncate">{item.label}</span>
                  <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 truncate hidden sm:block">{item.clientName}</span>
                </div>
                <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-40 shrink-0">{item.date}</span>
              </Link>
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

  const fieldClass = "w-full bg-transparent text-[15px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      {[
        { name: "email", type: "email", placeholder: "Client email", required: true },
        { name: "name", type: "text", placeholder: "Name (optional)" },
        { name: "company", type: "text", placeholder: "Company (optional)" },
      ].map(f => (
        <div key={f.name} className="px-5 py-4 border-t border-[rgb(var(--line))]">
          <input name={f.name} type={f.type} required={f.required} placeholder={f.placeholder} className={fieldClass} />
        </div>
      ))}
      {error && <p className="px-5 pt-2 text-[13px] text-red-400 tracking-tight">{error}</p>}
      <div className="flex items-center gap-3 px-5 py-4 border-t border-[rgb(var(--line))]">
        <button type="submit" disabled={pending}
          className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-30">
          {pending ? "Sending..." : "Send invite"}
        </button>
        <button type="button" onClick={onDone}
          className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
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

  const cardStyle = { border: "1px solid rgb(var(--line))", background: "rgb(var(--line) / 0.2)" };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Tools</h1>
          <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-60 mt-0.5">{tools.length} platforms and URLs</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] tracking-tight font-medium border border-[rgb(var(--line))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors shrink-0">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
              <line x1="10" y1="4" x2="10" y2="16" /><line x1="4" y1="10" x2="16" y2="10" />
            </svg>
            Add tool
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <form onSubmit={onAdd} className="flex flex-col">
            {[
              { name: "name", placeholder: "Name", required: true, type: "text" },
              { name: "url", placeholder: "URL (optional)", type: "url" },
              { name: "note", placeholder: "Note (optional)", type: "text" },
            ].map(f => (
              <div key={f.name} className="px-5 py-4 border-b border-[rgb(var(--line))]">
                <input name={f.name} type={f.type} required={f.required} placeholder={f.placeholder}
                  className="w-full bg-transparent text-[15px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none" />
              </div>
            ))}
            <div className="px-5 py-4 border-b border-[rgb(var(--line))]">
              <select name="category" defaultValue=""
                className="w-full bg-transparent text-[15px] tracking-tight text-[rgb(var(--fg))] focus:outline-none appearance-none">
                <option value="">Category (optional)</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {error && <p className="px-5 pt-3 text-[13px] text-red-400 tracking-tight">{error}</p>}
            <div className="flex items-center gap-3 px-5 py-4">
              <button type="submit" disabled={pending}
                className="px-4 py-1.5 rounded-full text-[13px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity disabled:opacity-30">
                {pending ? "Adding..." : "Add tool"}
              </button>
              <button type="button" onClick={() => setAdding(false)}
                className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {tools.length === 0 ? (
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-40 py-6">No tools added yet.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="flex flex-col gap-2">
              <span className="text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] opacity-50 px-1">{cat}</span>
              <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                {items.map((t, i) => (
                  <div key={t.id} className="flex items-center justify-between gap-6 px-5 py-4 group"
                    style={{ borderBottom: i < items.length - 1 ? "1px solid rgb(var(--line))" : "none" }}>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        {t.url ? (
                          <a href={t.url} target="_blank" rel="noopener noreferrer"
                            className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] hover:opacity-70 transition-opacity truncate">
                            {t.name}
                          </a>
                        ) : (
                          <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] truncate">{t.name}</span>
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientList({ clients }: { clients: Client[] }) {
  const [list, setList] = useState(clients);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onDelete = (id: string) => {
    startTransition(async () => {
      await deleteAccount(id);
      setList(prev => prev.filter(c => c.id !== id));
      setConfirmId(null);
    });
  };

  if (list.length === 0) return (
    <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-40 py-6">No clients yet.</p>
  );

  const cardStyle = { border: "1px solid rgb(var(--line))", background: "rgb(var(--line) / 0.2)" };

  return (
    <div className="rounded-2xl overflow-hidden" style={cardStyle}>
      {list.map((c, i) => {
        const activeProjects = c.projects?.filter(p => p.status === "active") ?? [];
        const displayName = c.company ?? c.name ?? c.email;
        const initials = (c.name ?? c.email).slice(0, 2).toUpperCase();
        const confirming = confirmId === c.id;
        return (
          <div key={c.id} className="flex items-center justify-between gap-4 px-5 py-3.5 group"
            style={{ borderBottom: i < list.length - 1 ? "1px solid rgb(var(--line))" : "none" }}>
            <Link href={`/admin/clients/${c.id}`} className="flex items-center gap-4 min-w-0 flex-1 hover:opacity-75 transition-opacity">
              <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-[12px] font-medium tracking-tight text-[rgb(var(--muted))]"
                style={{ background: "rgb(var(--line))" }}>
                {initials}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] truncate leading-snug">{displayName}</span>
                <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60 truncate">{c.email}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.banned && <span className="text-[11px] tracking-tight px-2 py-0.5 rounded-full font-medium" style={{ background: "rgb(239 68 68 / 0.1)", color: "#ef4444" }}>Suspended</span>}
                {!c.confirmed_at && !c.banned && <span className="text-[11px] tracking-tight px-2 py-0.5 rounded-full font-medium" style={{ background: "rgb(var(--amber) / 0.1)", color: "rgb(var(--amber))" }}>Pending</span>}
                {activeProjects.length > 0 && (
                  <span className="text-[11px] tracking-tight px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1.5 font-medium" style={{ background: "rgb(var(--green) / 0.1)", color: "rgb(var(--green))" }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "rgb(var(--green))" }} />
                    {activeProjects.length} active
                  </span>
                )}
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[rgb(var(--muted))] opacity-30 group-hover:opacity-70 transition-opacity" aria-hidden="true">
                  <line x1="4" y1="10" x2="16" y2="10" /><polyline points="10 4 16 10 10 16" />
                </svg>
              </div>
            </Link>
            <div className="shrink-0">
              {confirming ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => onDelete(c.id)} disabled={pending} className="text-[12px] tracking-tight text-red-400 hover:opacity-80 transition-opacity disabled:opacity-30">
                    {pending ? "Deleting..." : "Confirm"}
                  </button>
                  <button onClick={() => setConfirmId(null)} className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 hover:opacity-100 transition-opacity">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmId(c.id)} className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity text-red-400" aria-label="Delete account">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                    <polyline points="3 6 17 6" /><path d="M8 6V4h4v2" /><path d="M5 6l1 11h8l1-11" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type View = "overview" | "clients" | "tools";

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "clients", label: "Clients" },
  { id: "tools", label: "Tools" },
];

function TopNav({
  view,
  setView,
  mobileOpen,
  setMobileOpen,
}: {
  view: View;
  setView: (v: View) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-30 bg-[rgb(var(--bg))] border-b border-[rgb(var(--line))]">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">Inertia</span>
          <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40 border border-[rgb(var(--line))] rounded px-1.5 py-0.5">Admin</span>
        </div>

        {/* Desktop nav — pill tabs */}
        <nav className="hidden sm:flex items-center gap-1 flex-1 justify-center">
          <div className="flex items-center gap-1 bg-[rgb(var(--line)/0.4)] rounded-full p-1">
            {NAV_ITEMS.map(({ id, label }) => {
              const active = view === id;
              return (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className="px-4 py-1.5 rounded-full text-[13px] font-medium tracking-tight transition-all duration-150"
                  style={{
                    background: active ? "rgb(var(--bg))" : "transparent",
                    color: active ? "rgb(var(--fg))" : "rgb(var(--muted))",
                    opacity: active ? 1 : 0.6,
                    boxShadow: active ? "0 1px 3px rgb(0 0 0 / 0.12)" : "none",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60 hover:opacity-100 transition-opacity"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
              <path d="M3 10.5L10 4l7 6.5V17h-4v-4H7v4H3v-6.5z" />
            </svg>
            Site
          </Link>
          <ThemeToggle />
          {/* Mobile hamburger */}
          <button
            className="sm:hidden text-[rgb(var(--muted))] opacity-60 hover:opacity-100 transition-opacity"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
              <line x1="3" y1="6" x2="17" y2="6" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14" x2="17" y2="14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[rgb(var(--line))] bg-[rgb(var(--bg))] px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, label }) => {
            const active = view === id;
            return (
              <button
                key={id}
                onClick={() => { setView(id); setMobileOpen(false); }}
                className="text-left px-3 py-2.5 rounded-lg text-[14px] tracking-tight transition-colors"
                style={{
                  color: active ? "rgb(var(--fg))" : "rgb(var(--muted))",
                  background: active ? "rgb(var(--line))" : "transparent",
                  opacity: active ? 1 : 0.7,
                }}
              >
                {label}
              </button>
            );
          })}
          <Link href="/" className="px-3 py-2.5 text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-60">
            Back to site
          </Link>
        </div>
      )}
    </header>
  );
}

export function AdminShell({ clients, overview, tools }: { clients: Client[]; overview: Overview; tools: Tool[] }) {
  const [inviting, setInviting] = useState(false);
  const [view, setView] = useState<View>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("deleted") === "1") {
      setToast("Account deleted.");
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-[13px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] shadow-lg" style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}>
          {toast}
        </div>
      )}

      <TopNav view={view} setView={setView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="max-w-5xl mx-auto px-6 py-10">

        {view === "overview" && (
          <div className="flex flex-col gap-8">
            <OverviewDashboard overview={overview} clients={clients} />
          </div>
        )}

        {view === "clients" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Clients</h1>
                <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-60 mt-0.5">
                  {clients.length} {clients.length === 1 ? "client" : "clients"}
                </p>
              </div>
              {!inviting && (
                <button onClick={() => setInviting(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] tracking-tight font-medium border border-[rgb(var(--line))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors shrink-0">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                    <line x1="10" y1="4" x2="10" y2="16" /><line x1="4" y1="10" x2="16" y2="10" />
                  </svg>
                  Invite client
                </button>
              )}
            </div>

            {inviting && (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgb(var(--line))", background: "rgb(var(--line) / 0.2)" }}>
                <p className="text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] opacity-50 px-5 pt-4 pb-2">Invite a client</p>
                <InviteForm onDone={() => setInviting(false)} />
              </div>
            )}

            <ClientList clients={clients} />
          </div>
        )}

        {view === "tools" && <ToolsView initialTools={tools} />}

      </main>
    </div>
  );
}
