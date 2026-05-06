"use client";

import React from "react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import type { PostMeta } from "@/lib/posts";

const FILTERS = [
  { key: "all",    label: "All" },
  { key: "pinned", label: "Pinned" },
  { key: "new",    label: "New" },
] as const;

type Filter = typeof FILTERS[number]["key"];

export default function BlogIndex() {
  const [posts, setPosts]   = useState<PostMeta[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const [pillReady, setPillReady] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((d) => setPosts(d.posts ?? []));
  }, []);

  // Move the sliding pill to the active tab — suppress transition on first paint
  useEffect(() => {
    const idx = FILTERS.findIndex((f) => f.key === filter);
    const el = tabRefs.current[idx];
    if (!el) return;
    const next = { left: el.offsetLeft, width: el.offsetWidth };
    setPillStyle(next);
    if (!pillReady) requestAnimationFrame(() => setPillReady(true));
  }, [filter, posts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = posts.filter((p) => {
    if (filter === "pinned") return p.pinned;
    if (filter === "new")    return !p.pinned;
    return true;
  });

  return (
    <main className="page-container mx-auto w-full max-w-5xl min-h-screen flex flex-col">

      {/* Nav */}
      <div className="flex items-center justify-between px-8 py-5 rise">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
          back
        </Link>
        <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-40">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </span>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Filter — segmented control with sliding pill */}
      <div className="flex items-center justify-center py-5 rise">
        <div className="relative flex items-center gap-0 rounded-full border border-[rgb(var(--line))] p-1">
          {/* Sliding background pill */}
          <span
            className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-[rgb(var(--fg))]"
            style={{
              left: pillStyle.left,
              width: pillStyle.width,
              transition: pillReady ? "left 220ms cubic-bezier(0.4,0,0.2,1), width 220ms cubic-bezier(0.4,0,0.2,1)" : "none",
            }}
            aria-hidden="true"
          />
          {FILTERS.map(({ key, label }, idx) => (
            <button
              key={key}
              ref={(el) => { tabRefs.current[idx] = el; }}
              onClick={() => setFilter(key)}
              className={`relative z-10 px-4 py-1.5 text-[13px] tracking-tight rounded-full transition-colors duration-150 [-webkit-tap-highlight-color:transparent] ${
                filter === key ? "text-[rgb(var(--bg))]" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <p className="px-8 py-6 text-[13px] tracking-tight text-[rgb(var(--muted))]">Nothing here.</p>
      ) : (
        <div className="blog-grid grid grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="blog-card group flex flex-col px-5 sm:px-8 pt-8 pb-6 hover:bg-[rgb(var(--line))/0.1] transition-colors min-h-[300px] rise"
                style={{ ["--rise-delay" as any]: `${i * 70}ms` }}
              >
                {/* Sketch */}
                <div className="w-full mb-6">
                  <PostSketch slug={post.slug} index={i} />
                </div>

                {/* Title */}
                <h2 className="text-[14px] sm:text-[15px] font-medium tracking-tight leading-snug text-[rgb(var(--fg))] mb-2 flex-1">
                  {post.title}
                </h2>

                {/* Excerpt */}
                {(post.subtitle || post.summary) && (
                  <p className="text-[12px] sm:text-[13px] tracking-tight leading-relaxed text-[rgb(var(--muted))] line-clamp-2 mb-5">
                    {post.subtitle || post.summary}
                  </p>
                )}

                {/* Bottom row */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] tabular-nums tracking-tight text-[rgb(var(--muted))] opacity-50">
                      {formatDate(post.date)}
                    </span>
                    {post.pinned && (
                      <span className="inline-flex items-center rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] px-2 pt-[3px] pb-[4px] text-[10px] tracking-tight leading-none">
                        pinned
                      </span>
                    )}
                    {!post.pinned && i === 0 && filter === "all" && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-2.5 pt-[3px] pb-[4px] text-[10px] font-medium tracking-tight leading-none">
                        new
                      </span>
                    )}
                  </div>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-[rgb(var(--muted))] opacity-0 group-hover:opacity-60 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
          ))}
        </div>
      )}

    </main>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// ── Per-slug sketches ───────────────────────────────────────────────────────

function SketchAI() {
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {[30, 55, 80].map(y => (
        <line key={y} x1="18" y1={y} x2="188" y2={y} stroke="rgb(var(--muted))" strokeWidth="0.4" strokeDasharray="2 4" opacity="0.2" />
      ))}
      <line x1="18" y1="100" x2="188" y2="100" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      <line x1="18" y1="12"  x2="18"  y2="100" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      <path d="M 18 98 C 40 97 60 92 80 84 C 95 78 108 68 120 56" stroke="rgb(var(--blue))" strokeWidth="1.8" opacity="0.8" />
      <path d="M 120 56 C 133 44 148 30 165 18" stroke="rgb(var(--blue))" strokeWidth="1.4" strokeDasharray="4 3" opacity="0.55" />
      <path d="M 120 56 C 133 38 150 22 170 12" stroke="rgb(var(--blue))" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.3" />
      <path d="M 120 56 C 133 52 148 42 165 32" stroke="rgb(var(--blue))" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.3" />
      <line x1="120" y1="10" x2="120" y2="100" stroke="rgb(var(--muted))" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.25" />
      <line x1="120" y1="100" x2="120" y2="106" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.4" />
      <circle cx="50"  cy="95" r="2.5" fill="rgb(var(--blue))" opacity="0.5" />
      <circle cx="80"  cy="84" r="2.5" fill="rgb(var(--blue))" opacity="0.65" />
      <circle cx="120" cy="56" r="3.5" fill="rgb(var(--blue))" opacity="0.85" />
      <circle cx="120" cy="56" r="6"   stroke="rgb(var(--blue))" strokeWidth="0.8" opacity="0.25" />
      <polyline points="159,14 165,18 159,22" stroke="rgb(var(--blue))" strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}

function SketchTerminal() {
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Page chrome */}
      <rect x="14" y="10" width="172" height="100" rx="2" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.28" />
      {/* Nav bar */}
      <line x1="14" y1="26" x2="186" y2="26" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.2" />
      <line x1="24" y1="18" x2="52" y2="18" stroke="rgb(var(--fg))" strokeWidth="1.0" opacity="0.5" />
      <line x1="80" y1="18" x2="100" y2="18" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
      <line x1="108" y1="18" x2="128" y2="18" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.22" />
      {/* Big heading line — the "hello world" */}
      <line x1="24" y1="42" x2="130" y2="42" stroke="rgb(var(--fg))" strokeWidth="2.2" opacity="0.7" strokeLinecap="round" />
      <line x1="24" y1="52" x2="96" y2="52" stroke="rgb(var(--fg))" strokeWidth="2.2" opacity="0.7" strokeLinecap="round" />
      {/* Sub text */}
      <line x1="24" y1="64" x2="148" y2="64" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      <line x1="24" y1="71" x2="120" y2="71" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      <line x1="24" y1="78" x2="136" y2="78" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      {/* Cursor blink on last line */}
      <rect x="138" y="73" width="5" height="9" rx="0.5" fill="rgb(var(--fg))" opacity="0.6" />
      {/* URL bar hint */}
      <rect x="60" y="13" width="80" height="10" rx="2" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.18" />
      <circle cx="67" cy="18" r="2" fill="rgb(var(--green))" opacity="0.55" />
      <line x1="73" y1="18" x2="132" y2="18" stroke="rgb(var(--muted))" strokeWidth="0.5" opacity="0.2" />
    </svg>
  );
}

function SketchGrowth() {
  return (
    <svg viewBox="0 0 200 120" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {[30, 55, 80].map(y => (
        <line key={y} x1="18" y1={y} x2="188" y2={y} stroke="rgb(var(--muted))" strokeWidth="0.4" strokeDasharray="2 4" opacity="0.2" />
      ))}
      <line x1="18" y1="100" x2="188" y2="100" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      <line x1="18" y1="12"  x2="18"  y2="100" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      <path d="M 18 98 C 50 97 72 94 90 86 C 110 74 130 52 150 34 C 162 24 172 17 188 12"
        stroke="rgb(var(--green))" strokeWidth="2.0" opacity="0.85" />
      <circle cx="55"  cy="97" r="2.5" fill="rgb(var(--green))" opacity="0.5" />
      <circle cx="90"  cy="86" r="2.5" fill="rgb(var(--green))" opacity="0.65" />
      <circle cx="130" cy="52" r="3"   fill="rgb(var(--green))" opacity="0.8" />
      <circle cx="170" cy="18" r="3.5" fill="rgb(var(--green))" opacity="0.95" />
      <line x1="55"  y1="97" x2="55"  y2="100" stroke="rgb(var(--green))" strokeWidth="0.7" opacity="0.4" />
      <line x1="90"  y1="86" x2="90"  y2="100" stroke="rgb(var(--green))" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.35" />
      <line x1="130" y1="52" x2="130" y2="100" stroke="rgb(var(--green))" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.35" />
      <line x1="170" y1="18" x2="170" y2="100" stroke="rgb(var(--green))" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.3" />
      {[55, 90, 130, 170].map(x => (
        <line key={x} x1={x} y1="100" x2={x} y2="106" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.35" />
      ))}
      <polyline points="182,8 188,12 182,16" stroke="rgb(var(--green))" strokeWidth="1.3" opacity="0.75" />
    </svg>
  );
}

function SketchWave({ index }: { index: number }) {
  const shift = (index * 42) % 55;
  const a = 28 + (index * 7) % 14;
  return (
    <svg viewBox="0 0 280 100" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="10" y1="50" x2="270" y2="50" stroke="rgb(var(--muted))" strokeWidth="0.8" strokeDasharray="3 5" opacity="0.4" />
      <path d={`M 10 50 C ${35+shift} ${50-a} ${65+shift} ${50-a} ${90+shift} 50 C ${115+shift} ${50+a} ${145+shift} ${50+a} ${170+shift} 50 C ${195+shift} ${50-a} ${225+shift} ${50-a} 250 50`} stroke="rgb(var(--amber))" strokeWidth="2" />
      <path d={`M 10 50 C ${25+shift} ${50-a*0.5} ${55+shift} ${50-a*0.5} ${80+shift} 50 C ${105+shift} ${50+a*0.5} ${135+shift} ${50+a*0.5} ${160+shift} 50 C ${185+shift} ${50-a*0.5} ${215+shift} ${50-a*0.5} 250 50`} stroke="rgb(var(--muted))" strokeWidth="0.9" strokeDasharray="3 4" opacity="0.4" />
      <line x1={90+shift} y1={50-a} x2={90+shift} y2="50" stroke="rgb(var(--amber))" strokeWidth="1.2" />
      <line x1={85+shift} y1={50-a} x2={95+shift} y2={50-a} stroke="rgb(var(--amber))" strokeWidth="1.4" />
      <line x1="10" y1="88" x2={90+shift} y2="88" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.35" />
      <line x1="10" y1="84" x2="10" y2="92" stroke="rgb(var(--muted))" strokeWidth="1" opacity="0.35" />
      <line x1={90+shift} y1="84" x2={90+shift} y2="92" stroke="rgb(var(--muted))" strokeWidth="1" opacity="0.35" />
    </svg>
  );
}

const SLUG_SKETCHES: Record<string, () => React.ReactElement> = {
  "ai-capability-forecast": SketchAI,
  "hello-world": SketchTerminal,
  "four-years": SketchGrowth,
};

function PostSketch({ slug, index }: { slug: string; index: number }) {
  const Sketch = SLUG_SKETCHES[slug];
  if (Sketch) return <Sketch />;
  return <SketchWave index={index} />;
}
