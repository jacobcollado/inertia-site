"use client";

import { useState, useTransition } from "react";
import { addTool, deleteTool } from "../actions";

type Tool = { id: string; name: string; url: string | null; category: string | null; note: string | null; created_at: string };

const CATEGORIES = ["Design", "Development", "Communication", "Finance", "Analytics", "Hosting", "Other"];

export function ToolsView({ initialTools }: { initialTools: Tool[] }) {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

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
