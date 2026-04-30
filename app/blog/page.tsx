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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((d) => setPosts(d.posts ?? []));
  }, []);

  // Move the sliding pill to the active tab
  useEffect(() => {
    const idx = FILTERS.findIndex((f) => f.key === filter);
    const el = tabRefs.current[idx];
    if (!el) return;
    setPillStyle({ left: el.offsetLeft, width: el.offsetWidth });
  }, [filter, posts.length]);

  const filtered = posts.filter((p) => {
    if (filter === "pinned") return p.pinned;
    if (filter === "new")    return !p.pinned;
    return true;
  });

  return (
    <main className="page-container mx-auto w-full max-w-5xl min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Nav */}
      <div className="flex items-center justify-between px-8 py-5">
        <Link href="/" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
          ← back
        </Link>
        <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-40">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </span>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Filter — segmented control with sliding pill */}
      <div className="flex items-center justify-center py-5">
        <div className="relative flex items-center gap-0 rounded-full border border-[rgb(var(--line))] p-1">
          {/* Sliding background pill */}
          <span
            className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-[rgb(var(--fg))]"
            style={{
              left: pillStyle.left,
              width: pillStyle.width,
              transition: "left 220ms cubic-bezier(0.4,0,0.2,1), width 220ms cubic-bezier(0.4,0,0.2,1)",
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="blog-card group flex flex-col p-8 hover:bg-[rgb(var(--line))/0.1] transition-colors min-h-[340px]"
            >
              {/* Sketch — fixed height so all cards align */}
              <div className="w-full h-[140px] flex items-center mb-8">
                <PostSketch slug={post.slug} index={i} />
              </div>

              {/* Title */}
              <h2 className="text-[1.15rem] font-medium tracking-tight leading-snug text-[rgb(var(--fg))] mb-3 flex-1">
                {post.title}
              </h2>

              {/* Excerpt */}
              {(post.subtitle || post.summary) && (
                <p className="text-[13px] tracking-tight leading-relaxed text-[rgb(var(--muted))] line-clamp-3 mb-6">
                  {post.subtitle || post.summary}
                </p>
              )}

              {/* Bottom row */}
              <div className="flex items-center justify-between mt-auto pt-3">
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
    <svg viewBox="0 0 280 100" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full text-[rgb(var(--muted))] opacity-[0.32]" aria-hidden="true">
      <circle cx="30"  cy="20"  r="5" strokeWidth="0.9" />
      <circle cx="30"  cy="50"  r="5" strokeWidth="0.9" />
      <circle cx="30"  cy="80"  r="5" strokeWidth="0.9" />
      <circle cx="110" cy="10"  r="5" strokeWidth="0.9" />
      <circle cx="110" cy="37"  r="5" strokeWidth="0.9" />
      <circle cx="110" cy="63"  r="5" strokeWidth="0.9" />
      <circle cx="110" cy="90"  r="5" strokeWidth="0.9" />
      <circle cx="190" cy="32"  r="5" strokeWidth="0.9" />
      <circle cx="190" cy="68"  r="5" strokeWidth="0.9" />
      {[20, 50, 80].flatMap(y1 => [10, 37, 63, 90].map(y2 => (
        <line key={`i${y1}h${y2}`} x1="35" y1={y1} x2="105" y2={y2} strokeWidth="0.28" />
      )))}
      {[10, 37, 63, 90].flatMap(y1 => [32, 68].map(y2 => (
        <line key={`h${y1}o${y2}`} x1="115" y1={y1} x2="185" y2={y2} strokeWidth="0.28" />
      )))}
      <line x1="35" y1="50" x2="105" y2="37" strokeWidth="1.1" strokeDasharray="4 3" />
      <line x1="115" y1="37" x2="185" y2="32" strokeWidth="1.1" strokeDasharray="4 3" />
      <line x1="195" y1="32" x2="250" y2="32" strokeWidth="0.6" />
      <line x1="195" y1="68" x2="250" y2="68" strokeWidth="0.6" />
      <polyline points="244,28 250,32 244,36" strokeWidth="0.7" />
      <polyline points="244,64 250,68 244,72" strokeWidth="0.7" />
    </svg>
  );
}

function SketchTerminal() {
  // Concept: signal origin — concentric arcs expanding from a single point, like a transmission beginning
  return (
    <svg viewBox="0 0 280 100" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full text-[rgb(var(--muted))] opacity-[0.32]" aria-hidden="true">
      {/* Origin point */}
      <circle cx="60" cy="50" r="3" fill="currentColor" stroke="none" opacity="0.7" />
      {/* Concentric arcs emanating outward */}
      <path d="M 72 34 A 22 22 0 0 1 72 66" strokeWidth="0.9" />
      <path d="M 86 22 A 36 36 0 0 1 86 78" strokeWidth="0.65" />
      <path d="M 102 12 A 50 50 0 0 1 102 88" strokeWidth="0.45" />
      <path d="M 120 6 A 64 64 0 0 1 120 94" strokeWidth="0.3" />
      {/* Horizontal axis line — the baseline signal travels along */}
      <line x1="60" y1="50" x2="240" y2="50" strokeWidth="0.3" strokeDasharray="2 5" />
      {/* Arriving tick at far end */}
      <line x1="240" y1="44" x2="240" y2="56" strokeWidth="0.7" />
      <line x1="248" y1="50" x2="262" y2="50" strokeWidth="0.5" />
      <polyline points="256,46 262,50 256,54" strokeWidth="0.6" />
    </svg>
  );
}

function SketchWave({ index }: { index: number }) {
  const shift = (index * 42) % 55;
  const a = 28 + (index * 7) % 14;
  return (
    <svg viewBox="0 0 280 100" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full text-[rgb(var(--muted))] opacity-[0.32]" aria-hidden="true">
      <line x1="10" y1="50" x2="270" y2="50" strokeWidth="0.3" strokeDasharray="2 4" />
      <path d={`M 10 50 C ${35+shift} ${50-a} ${65+shift} ${50-a} ${90+shift} 50 C ${115+shift} ${50+a} ${145+shift} ${50+a} ${170+shift} 50 C ${195+shift} ${50-a} ${225+shift} ${50-a} 250 50`} strokeWidth="1.1" />
      <path d={`M 10 50 C ${25+shift} ${50-a*0.5} ${55+shift} ${50-a*0.5} ${80+shift} 50 C ${105+shift} ${50+a*0.5} ${135+shift} ${50+a*0.5} ${160+shift} 50 C ${185+shift} ${50-a*0.5} ${215+shift} ${50-a*0.5} 250 50`} strokeWidth="0.45" strokeDasharray="3 3" />
      <line x1={90+shift} y1={50-a} x2={90+shift} y2="50" strokeWidth="0.4" />
      <line x1={86+shift} y1={50-a} x2={94+shift} y2={50-a} strokeWidth="0.5" />
      <line x1="10" y1="88" x2={90+shift} y2="88" strokeWidth="0.35" />
      <line x1="10" y1="85" x2="10" y2="91" strokeWidth="0.5" />
      <line x1={90+shift} y1="85" x2={90+shift} y2="91" strokeWidth="0.5" />
    </svg>
  );
}

const SLUG_SKETCHES: Record<string, () => React.ReactElement> = {
  "ai-capability-forecast": SketchAI,
  "hello-world": SketchTerminal,
};

function PostSketch({ slug, index }: { slug: string; index: number }) {
  const Sketch = SLUG_SKETCHES[slug];
  if (Sketch) return <Sketch />;
  return <SketchWave index={index} />;
}
