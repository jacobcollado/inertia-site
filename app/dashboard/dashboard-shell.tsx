"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/theme-toggle";
import { signOut } from "./actions";

/* ── Types ────────────────────────────────────────────────────────── */

type Client  = { id: string; email: string; name: string | null; company: string | null };
type Project = { id: string; title: string; status: string; phase: string | null; last_update: string | null; notes: string | null };
type Invoice = { id: string; label: string; amount: number; status: string; due_date: string | null };
type DFile   = { id: string; label: string; url: string; uploaded_at: string };
type Tab     = "overview" | "projects" | "invoices" | "files" | "support";

/* ── Fake data ────────────────────────────────────────────────────── */

const FAKE_PROJECTS: Project[] = [
  { id: "f1", title: "Aether Storefront Build", status: "active",    phase: "Design review",  last_update: "Updated May 1",  notes: "Homepage and PDP layouts are ready for feedback. Collection page in progress." },
  { id: "f2", title: "Brand Identity",          status: "completed", phase: "Delivered",      last_update: "Apr 18",         notes: null },
  { id: "f3", title: "Email Sequence",          status: "paused",    phase: "Awaiting copy",  last_update: "Mar 30",         notes: "Holding until copy brief is returned." },
];

const FAKE_INVOICES: Invoice[] = [
  { id: "i1", label: "Project deposit — Aether build", amount: 350000, status: "paid",    due_date: "2026-03-01" },
  { id: "i2", label: "Milestone 2 — Design complete",  amount: 350000, status: "pending", due_date: "2026-05-15" },
  { id: "i3", label: "Final delivery",                 amount: 300000, status: "pending", due_date: "2026-06-01" },
];

const FAKE_FILES: DFile[] = [
  { id: "fl1", label: "Brand guidelines v2.pdf",  url: "#", uploaded_at: "2026-04-10T00:00:00Z" },
  { id: "fl2", label: "Homepage mockup — final",  url: "#", uploaded_at: "2026-04-28T00:00:00Z" },
  { id: "fl3", label: "Aether theme license.txt", url: "#", uploaded_at: "2026-05-01T00:00:00Z" },
];

/* ── Helpers ──────────────────────────────────────────────────────── */

const STATUS_COLOR: Record<string, string> = {
  active:    "rgb(var(--green))",
  completed: "rgb(var(--blue))",
  paused:    "rgb(var(--amber))",
  paid:      "rgb(var(--green))",
  pending:   "rgb(var(--amber))",
  overdue:   "#ef4444",
};

function fmt$(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}
function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}

function StatusPill({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? "rgb(var(--muted))";
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] tracking-tight px-2.5 py-1 rounded-full capitalize shrink-0"
      style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      {status}
    </span>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] py-10 opacity-40">{label}</p>;
}

/* ── Visuals ──────────────────────────────────────────────────────── */

function VisualProgressArc({ pct, color }: { pct: number; color: string }) {
  const r = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(pct / 100, 1);
  return (
    <svg viewBox="0 0 128 128" fill="none" className="w-full h-full" aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} stroke="rgb(var(--line))" strokeWidth="7" />
      <circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 800ms cubic-bezier(0.22,1,0.36,1)" }} />
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="22" fontWeight="500"
        fill="rgb(var(--fg))" fontFamily="inherit" letterSpacing="-1">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

function VisualTimeline({ projects }: { projects: Project[] }) {
  const muted = "rgb(var(--muted))";
  const statuses = projects.map(p => p.status);
  return (
    <svg viewBox="0 0 320 80" fill="none" className="w-full" aria-hidden="true">
      <line x1="24" y1="40" x2="296" y2="40" stroke={muted} strokeWidth="1" opacity="0.25" />
      {projects.map((p, i) => {
        const x = 24 + (i / Math.max(projects.length - 1, 1)) * 272;
        const color = STATUS_COLOR[p.status] ?? muted;
        const done = p.status === "completed";
        return (
          <g key={p.id}>
            <circle cx={x} cy="40" r={done ? 7 : 6} fill={done ? color : "rgb(var(--bg))"} stroke={color} strokeWidth="1.8" opacity="0.85" />
            {done && <polyline points={`${x-3},40 ${x-1},43 ${x+4},36`} stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />}
            <line x1={x} y1={i % 2 === 0 ? 34 : 46} x2={x} y2={i % 2 === 0 ? 18 : 62} stroke={color} strokeWidth="1" opacity="0.4" strokeDasharray="2 2" />
            <text x={x} y={i % 2 === 0 ? 13 : 72} textAnchor="middle" fontSize="9" fill={color} fontFamily="inherit" opacity="0.75">
              {p.title.split(" ").slice(0, 2).join(" ")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function VisualBars({ invoices }: { invoices: Invoice[] }) {
  const max = Math.max(...invoices.map(i => i.amount), 1);
  const muted = "rgb(var(--muted))";
  const w = 320, barW = Math.min(52, (w - 40) / invoices.length - 12);
  return (
    <svg viewBox={`0 0 ${w} 88`} fill="none" className="w-full" aria-hidden="true">
      <line x1="16" y1="72" x2={w - 16} y2="72" stroke={muted} strokeWidth="0.8" opacity="0.2" />
      {invoices.map((inv, i) => {
        const color = STATUS_COLOR[inv.status] ?? muted;
        const h = Math.max(6, ((inv.amount / max) * 56));
        const x = 16 + i * ((w - 32) / invoices.length) + ((w - 32) / invoices.length - barW) / 2;
        return (
          <g key={inv.id}>
            <rect x={x} y={72 - h} width={barW} height={h} rx="3"
              fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.2" opacity="0.75" />
            <text x={x + barW / 2} y="84" textAnchor="middle" fontSize="8.5" fill={color} fontFamily="inherit" opacity="0.65">
              {fmt$(inv.amount)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function VisualFiles({ files }: { files: DFile[] }) {
  const blue = "rgb(var(--blue))";
  const muted = "rgb(var(--muted))";
  const cols = 3, rows = Math.ceil(files.length / cols);
  const W = 220, H = rows * 56 + 8;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} fill="none" className="w-full max-w-[220px]" aria-hidden="true">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          const idx = row * cols + col;
          const x = col * 76, y = row * 56;
          const exists = idx < files.length;
          return (
            <g key={`${row}-${col}`} opacity={exists ? 1 : 0.15}>
              <rect x={x + 2} y={y + 2} width="66" height="48" rx="4"
                stroke={exists ? blue : muted} strokeWidth="1.2"
                fill={exists ? blue : muted} fillOpacity={exists ? 0.05 : 0.02} />
              <path d={`M${x+40} ${y+2} L${x+40} ${y+14} L${x+52} ${y+14}`}
                stroke={exists ? blue : muted} strokeWidth="1" opacity="0.5" />
              <path d={`M${x+38} ${y+2} L${x+52} ${y+14} L${x+68} ${y+14} L${x+68} ${y+2} Z`}
                fill={exists ? blue : muted} fillOpacity="0.08" stroke={exists ? blue : muted} strokeWidth="1" opacity="0.4" />
              <line x1={x+10} y1={y+26} x2={x+58} y2={y+26} stroke={exists ? blue : muted} strokeWidth="0.9" opacity="0.35" />
              <line x1={x+10} y1={y+34} x2={x+50} y2={y+34} stroke={exists ? blue : muted} strokeWidth="0.9" opacity="0.25" />
            </g>
          );
        })
      )}
    </svg>
  );
}

function VisualSupport() {
  const purple = "rgb(var(--purple))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 200 100" fill="none" className="w-full max-w-[200px]" aria-hidden="true">
      <path d="M8 8 Q8 2 14 2 L124 2 Q130 2 130 8 L130 58 Q130 64 124 64 L72 64 L56 80 L56 64 L14 64 Q8 64 8 58 Z"
        stroke={purple} strokeWidth="1.4" opacity="0.6" fill={purple} fillOpacity="0.05" />
      <line x1="22" y1="22" x2="116" y2="22" stroke={muted} strokeWidth="1" opacity="0.35" />
      <line x1="22" y1="34" x2="116" y2="34" stroke={muted} strokeWidth="1" opacity="0.35" />
      <line x1="22" y1="46" x2="90"  y2="46" stroke={muted} strokeWidth="1" opacity="0.3" />
      <line x1="102" y1="50" x2="102" y2="60" stroke={purple} strokeWidth="1.8" opacity="0.75" strokeLinecap="butt" />
      <path d="M148 30 Q148 24 154 24 L186 24 Q192 24 192 30 L192 60 Q192 66 186 66 L162 66 L154 76 L154 66 L154 66 Q148 66 148 60 Z"
        stroke={purple} strokeWidth="1" opacity="0.35" fill={purple} fillOpacity="0.03" />
      <line x1="158" y1="38" x2="184" y2="38" stroke={muted} strokeWidth="0.9" opacity="0.28" />
      <line x1="158" y1="48" x2="178" y2="48" stroke={muted} strokeWidth="0.9" opacity="0.22" />
    </svg>
  );
}

/* ── Nav icons ────────────────────────────────────────────────────── */

const icons: Record<Tab, React.ReactNode> = {
  overview: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <rect x="2" y="2" width="7" height="7" rx="1.5" /><rect x="11" y="2" width="7" height="7" rx="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" /><rect x="11" y="11" width="7" height="7" rx="1.5" />
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h8" />
    </svg>
  ),
  invoices: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <rect x="3" y="2" width="14" height="16" rx="2" /><path d="M7 7h6M7 10h6M7 13h3" />
    </svg>
  ),
  files: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M11 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
      <polyline points="11 2 11 7 16 7" />
    </svg>
  ),
  support: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2z" />
      <path d="M10 12v.5M10 7.5a1.5 1.5 0 0 1 1.5 1.5c0 1-1.5 1.5-1.5 2.5" />
    </svg>
  ),
};

/* ── Sidebar ──────────────────────────────────────────────────────── */

function Sidebar({ client, tab, setTab, mobileOpen, setMobileOpen }: {
  client: Client | null;
  tab: Tab;
  setTab: (t: Tab) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();

  const NAV: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "projects", label: "Projects" },
    { id: "invoices", label: "Invoices" },
    { id: "files",    label: "Files"    },
    { id: "support",  label: "Support"  },
  ];

  const inner = (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[rgb(var(--line))]">
        <p className="text-[14px] font-medium tracking-tight text-[rgb(var(--fg))]">Inertia</p>
        <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] mt-0.5 opacity-60">Client portal</p>
      </div>

      {/* Client */}
      <div className="px-5 py-4 border-b border-[rgb(var(--line))]">
        <p className="text-[14px] font-medium tracking-tight text-[rgb(var(--fg))] truncate">
          {client?.company ?? client?.name ?? "Client"}
        </p>
        <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-60 truncate mt-0.5">
          {client?.email}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
        {NAV.map(({ id, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => { setTab(id); setMobileOpen(false); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all duration-150"
              style={{
                background: active ? "rgb(var(--line))" : "transparent",
                color: active ? "rgb(var(--fg))" : "rgb(var(--muted))",
              }}
            >
              <span style={{ opacity: active ? 1 : 0.5 }}>{icons[id]}</span>
              <span className="text-[14px] tracking-tight">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 pb-5 pt-3 border-t border-[rgb(var(--line))] flex flex-col gap-3">
        <Link href="/" className="flex items-center gap-2 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 opacity-60" aria-hidden="true">
            <path d="M10 3L3 10l7 7M3 10h14" />
          </svg>
          Back to site
        </Link>
        <GridRule />
        <div className="flex items-center justify-between">
          <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">Theme</span>
          <ThemeToggle />
        </div>
        <GridRule />
        <button
          onClick={() => startTransition(() => signOut())}
          disabled={pending}
          className="flex items-center gap-2 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors disabled:opacity-40 w-full"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 opacity-60" aria-hidden="true">
            <path d="M13 15l3-5-3-5M16 10H7M7 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3" />
          </svg>
          {pending ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-[rgb(var(--line))] sticky top-0 h-screen">
        {inner}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-[rgb(var(--bg))]/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className="fixed inset-y-0 left-0 z-40 w-64 border-r border-[rgb(var(--line))] bg-[rgb(var(--bg))] md:hidden transition-transform duration-300"
        style={{ transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        {inner}
      </aside>
    </>
  );
}

/* ── Tabs ─────────────────────────────────────────────────────────── */

function OverviewTab({ client, projects, invoices, files, setTab }: {
  client: Client | null; projects: Project[]; invoices: Invoice[]; files: DFile[]; setTab: (t: Tab) => void;
}) {
  const firstName = client?.name?.split(" ")[0] ?? "there";
  const activeProjects = projects.filter(p => p.status === "active");
  const completedCount = projects.filter(p => p.status === "completed").length;
  const progressPct = projects.length > 0 ? Math.round((completedCount / projects.length) * 100) : 0;
  const unpaid = invoices.filter(i => i.status !== "paid");
  const totalOwed = unpaid.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex flex-col gap-10" style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both" }}>

      {/* Hero greeting */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">
            {client?.company ?? `Hey, ${firstName}.`}
          </h1>
          <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] mt-2">
            {client?.company ? `Hey, ${firstName}. Here's where everything stands.` : "Here's where everything stands."}
          </p>
        </div>
        {/* Progress arc */}
        <div className="shrink-0 w-20 h-20">
          <VisualProgressArc pct={progressPct} color="rgb(var(--green))" />
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-[rgb(var(--line))] divide-y sm:divide-y-0 sm:divide-x divide-[rgb(var(--line))]">
        {[
          { label: "Active projects", value: String(activeProjects.length), color: "rgb(var(--green))", tab: "projects" as Tab },
          { label: "Outstanding",     value: totalOwed > 0 ? fmt$(totalOwed) : "All clear", color: totalOwed > 0 ? "rgb(var(--amber))" : "rgb(var(--green))", tab: "invoices" as Tab },
          { label: "Files shared",    value: String(files.length), color: "rgb(var(--blue))", tab: "files" as Tab },
        ].map(({ label, value, color, tab }) => (
          <button key={label} onClick={() => setTab(tab)}
            className="text-left px-6 py-5 hover:bg-[rgb(var(--line))/0.15] transition-colors group">
            <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60 mb-2">{label}</p>
            <p className="text-[1.75rem] font-medium tracking-tight tabular-nums" style={{ color }}>{value}</p>
          </button>
        ))}
      </div>

      {/* Active project */}
      {activeProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))]">Active project</h2>
            <button onClick={() => setTab("projects")} className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">All projects</button>
          </div>
          <GridRule />
          {activeProjects.slice(0, 1).map(p => (
            <div key={p.id} className="flex items-start justify-between gap-4 py-6">
              <div className="flex flex-col gap-2">
                <span className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))]">{p.title}</span>
                {p.phase && <span className="text-[14px] tracking-tight text-[rgb(var(--muted))]">{p.phase}</span>}
                {p.notes && <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed opacity-70 max-w-md">{p.notes}</p>}
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <StatusPill status={p.status} />
                {p.last_update && <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50">{p.last_update}</span>}
              </div>
            </div>
          ))}
          <GridRule />
        </div>
      )}

      {/* Pending invoice */}
      {unpaid.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))]">Pending invoice</h2>
            <button onClick={() => setTab("invoices")} className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">All invoices</button>
          </div>
          <GridRule />
          {unpaid.slice(0, 1).map(inv => (
            <div key={inv.id} className="flex items-center justify-between gap-4 py-5">
              <span className="text-[15px] tracking-tight text-[rgb(var(--fg))]">{inv.label}</span>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-[15px] font-medium tabular-nums text-[rgb(var(--fg))]">{fmt$(inv.amount)}</span>
                <StatusPill status={inv.status} />
              </div>
            </div>
          ))}
          <GridRule />
        </div>
      )}
    </div>
  );
}

function ProjectsTab({ projects }: { projects: Project[] }) {
  return (
    <div className="flex flex-col gap-10" style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both" }}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Projects</h1>
          <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] mt-2">{projects.length} total</p>
        </div>
      </div>

      {projects.length > 0 && (
        <div className="w-full">
          <VisualTimeline projects={projects} />
        </div>
      )}

      <GridRule />
      {projects.length === 0 ? <Empty label="No projects yet." /> : (
        <div className="flex flex-col">
          {projects.map((p, i) => (
            <div key={p.id}>
              <div className="flex items-start justify-between gap-6 py-6">
                <div className="flex flex-col gap-2 min-w-0">
                  <span className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))] truncate">{p.title}</span>
                  {p.phase && <span className="text-[14px] tracking-tight text-[rgb(var(--muted))]">{p.phase}</span>}
                  {p.notes && <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed opacity-70 max-w-lg">{p.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusPill status={p.status} />
                  {p.last_update && <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50">{p.last_update}</span>}
                </div>
              </div>
              {i < projects.length - 1 && <GridRule />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InvoicesTab({ invoices }: { invoices: Invoice[] }) {
  const totalOwed = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  return (
    <div className="flex flex-col gap-10" style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both" }}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Billing</h1>
          {totalOwed > 0
            ? <p className="text-[15px] tracking-tight mt-2" style={{ color: "rgb(var(--amber))" }}>{fmt$(totalOwed)} outstanding</p>
            : <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] mt-2">All paid up.</p>
          }
        </div>
        {totalPaid > 0 && (
          <div className="text-right shrink-0">
            <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60 mb-1">Paid to date</p>
            <p className="text-[1.25rem] font-medium tabular-nums" style={{ color: "rgb(var(--green))" }}>{fmt$(totalPaid)}</p>
          </div>
        )}
      </div>

      {invoices.length > 0 && (
        <div className="w-full">
          <VisualBars invoices={invoices} />
        </div>
      )}

      <GridRule />
      {invoices.length === 0 ? <Empty label="No invoices yet." /> : (
        <div className="flex flex-col">
          {invoices.map((inv, i) => (
            <div key={inv.id}>
              <div className="flex items-center justify-between gap-6 py-5">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[15px] tracking-tight text-[rgb(var(--fg))] truncate">{inv.label}</span>
                  {inv.due_date && <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50">Due {fmtDate(inv.due_date)}</span>}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[15px] font-medium tabular-nums text-[rgb(var(--fg))]">{fmt$(inv.amount)}</span>
                  <StatusPill status={inv.status} />
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

function FilesTab({ files }: { files: DFile[] }) {
  return (
    <div className="flex flex-col gap-10" style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both" }}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Files</h1>
          <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] mt-2">{files.length} shared with you</p>
        </div>
        <div className="shrink-0 pt-1">
          <VisualFiles files={files} />
        </div>
      </div>

      <GridRule />
      {files.length === 0 ? <Empty label="No files yet." /> : (
        <div className="flex flex-col">
          {files.map((f, i) => (
            <div key={f.id}>
              <div className="flex items-center justify-between gap-6 py-5">
                <div className="flex items-center gap-3 min-w-0">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 opacity-40" aria-hidden="true">
                    <path d="M11 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" /><polyline points="11 2 11 7 16 7" />
                  </svg>
                  <div className="min-w-0">
                    <span className="text-[15px] tracking-tight text-[rgb(var(--fg))] truncate block">{f.label}</span>
                    <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50">{fmtDate(f.uploaded_at)}</span>
                  </div>
                </div>
                <a href={f.url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] tracking-tight rounded-full border border-[rgb(var(--line))] px-3.5 py-1.5 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--fg))/0.3] transition-colors shrink-0">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                    <path d="M10 3v10M6 9l4 4 4-4M3 15v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2" />
                  </svg>
                  Download
                </a>
              </div>
              {i < files.length - 1 && <GridRule />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SupportTab({ client }: { client: Client | null }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: client?.name ?? client?.email ?? "Client",
          email: client?.email ?? "",
          subject: `[Support] ${subject}`,
          message: body,
          kind: "dashboard:support",
        }),
      });
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  const inputBase = "w-full bg-transparent border-0 border-b border-[rgb(var(--line))] py-3 text-[16px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none transition-colors duration-200";

  return (
    <div className="flex flex-col gap-10" style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both" }}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))]">Get in touch</h1>
          <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] mt-2 max-w-sm">
            Questions about your project, revisions, or anything else. I'll get back to you within a day.
          </p>
        </div>
        <div className="shrink-0 pt-1">
          <VisualSupport />
        </div>
      </div>

      <GridRule />

      {sent ? (
        <div className="flex flex-col gap-3 py-8" style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}>
          <span className="text-[12px] tracking-tight" style={{ color: "rgb(var(--green))", opacity: 0.9 }}>Sent</span>
          <p className="text-[16px] tracking-tight text-[rgb(var(--fg))]">Got it. I'll follow up at {client?.email} shortly.</p>
          <button onClick={() => { setSent(false); setSubject(""); setBody(""); }}
            className="text-[14px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors self-start mt-2">
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-lg">
          <input type="text" required value={subject} onChange={e => setSubject(e.target.value)}
            placeholder="Subject" className={inputBase}
            onFocus={e => { e.target.style.borderColor = "rgb(var(--purple))"; }}
            onBlur={e => { e.target.style.borderColor = subject ? "rgb(var(--purple))" : "rgb(var(--line))"; }}
            style={{ borderColor: subject ? "rgb(var(--purple))" : "rgb(var(--line))" }}
          />
          <textarea required rows={5} value={body} onChange={e => setBody(e.target.value)}
            placeholder="Describe what you need..."
            className={`${inputBase} resize-none`}
            onFocus={e => { e.target.style.borderColor = "rgb(var(--purple))"; }}
            onBlur={e => { e.target.style.borderColor = body ? "rgb(var(--purple))" : "rgb(var(--line))"; }}
            style={{ borderColor: body ? "rgb(var(--purple))" : "rgb(var(--line))" }}
          />
          <div className="pt-1">
            <button type="submit" disabled={sending || !subject || !body}
              className="inline-flex items-center gap-2 rounded-full pl-6 pr-5 py-2.5 text-[14px] tracking-tight font-medium transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
              style={{ background: "rgb(var(--purple))", color: "white", border: "1px solid rgb(var(--purple))" }}>
              {sending ? "Sending..." : "Send message"}
              {!sending && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ── Shell ────────────────────────────────────────────────────────── */

export function DashboardShell({ client, projects: rp, invoices: ri, files: rf }: {
  client: Client | null; projects: Project[]; invoices: Invoice[]; files: DFile[];
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const projects = rp.length > 0 ? rp : FAKE_PROJECTS;
  const invoices = ri.length > 0 ? ri : FAKE_INVOICES;
  const files    = rf.length > 0 ? rf : FAKE_FILES;

  return (
    <div className="flex min-h-screen bg-[rgb(var(--bg))]">
      <Sidebar client={client} tab={tab} setTab={setTab} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(var(--line))] md:hidden">
          <button onClick={() => setMobileOpen(true)} className="flex items-center gap-2 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors" aria-label="Open menu">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="w-4 h-4" aria-hidden="true">
              <line x1="2" y1="5" x2="18" y2="5" /><line x1="2" y1="10" x2="18" y2="10" /><line x1="2" y1="15" x2="18" y2="15" />
            </svg>
            Menu
          </button>
          <span className="text-[14px] font-medium tracking-tight text-[rgb(var(--fg))]">Inertia</span>
          <ThemeToggle />
        </div>

        <main className="flex-1 px-6 sm:px-10 py-10 max-w-3xl w-full">
          {tab === "overview" && <OverviewTab client={client} projects={projects} invoices={invoices} files={files} setTab={setTab} />}
          {tab === "projects" && <ProjectsTab projects={projects} />}
          {tab === "invoices" && <InvoicesTab invoices={invoices} />}
          {tab === "files"    && <FilesTab    files={files} />}
          {tab === "support"  && <SupportTab  client={client} />}
        </main>
      </div>
    </div>
  );
}
