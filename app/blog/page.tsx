"use client";

import React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { PostMeta } from "@/lib/posts";
import { ContourCanvas } from "@/app/contour-canvas";

const FILTERS = [
  { key: "all",    label: "All" },
  { key: "pinned", label: "Pinned" },
  { key: "new",    label: "New" },
] as const;

type Filter = typeof FILTERS[number]["key"];

export default function BlogIndex() {
  const [posts, setPosts]   = useState<PostMeta[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((d) => setPosts(d.posts ?? []));
  }, []);

  const filtered = posts.filter((p) => {
    if (filter === "pinned") return p.pinned;
    if (filter === "new")    return !p.pinned;
    return true;
  });

  return (
    <main className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-6xl min-h-screen flex flex-col">

      {/* Back nav */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[rgb(var(--line))]">
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] tracking-tight transition-opacity hover:opacity-70" style={{ border: "1px solid rgb(var(--fg) / 0.25)", color: "rgb(var(--fg))" }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
          Home
        </Link>
        <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-40">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </span>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[rgb(var(--line))]" style={{ minHeight: 340 }}>
        <ContourCanvas />
        {/* fade bottom edge into page */}
        <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none" style={{ background: "linear-gradient(to top, rgb(var(--bg)) 0%, transparent 100%)" }} />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-12" style={{ minHeight: 340 }}>
          <h1 className="text-[clamp(2.6rem,6vw,4rem)] font-[400] tracking-tight leading-none text-[rgb(var(--fg))]">
            Inertia Writes
          </h1>
          <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] leading-snug mt-2" style={{ opacity: 0.55 }}>
            Honest takes on building, selling, and why most of it gets done wrong.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-stretch border-t border-b border-[rgb(var(--line))] rise">
        {FILTERS.map(({ key, label }, i) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="relative py-3 px-5 text-[12px] tracking-tight transition-colors duration-150"
            style={{
              color: filter === key ? "rgb(var(--fg))" : "rgb(var(--muted))",
              opacity: filter === key ? 1 : 0.5,
            }}
          >
            {label}
            {filter === key && <span className="absolute inset-x-0 bottom-0 h-px bg-[rgb(var(--fg))]" />}
            {i < FILTERS.length - 1 && (
              <span className="absolute top-0 right-0 bottom-0 w-px bg-[rgb(var(--line))]" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <p className="px-8 py-6 text-[13px] tracking-tight text-[rgb(var(--muted))]">Nothing here.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 border-b border-[rgb(var(--line))]">
          {filtered.map((post, i) => {
            const cols = 3;
            const notLastInRow2 = i % 2 !== 1;
            const notLastInRow3 = i % cols !== cols - 1;
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={[
                  "group flex flex-col px-5 sm:px-7 pt-7 pb-6 hover:bg-[rgb(var(--line))/0.1] transition-colors min-h-[300px] rise border-b border-[rgb(var(--line))]",
                  notLastInRow2 ? "border-r border-[rgb(var(--line))]" : "",
                  notLastInRow3 ? "sm:border-r" : "sm:border-r-0",
                ].join(" ")}
                style={{ ["--rise-delay" as any]: `${i * 70}ms` }}
              >
                {/* Sketch */}
                <div className="w-full mb-5">
                  <PostSketch slug={post.slug} index={i} />
                </div>

                {/* Title */}
                <h2 className="text-[14px] sm:text-[15px] font-medium tracking-tight leading-snug text-[rgb(var(--fg))] mb-2 flex-1">
                  {post.title}
                </h2>

                {/* Excerpt */}
                {(post.subtitle || post.summary) && (
                  <p className="text-[12px] sm:text-[13px] tracking-tight leading-relaxed text-[rgb(var(--muted))] line-clamp-2 mb-5" style={{ opacity: 0.6 }}>
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
            );
          })}
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
    <svg viewBox="0 0 200 110" fill="none" className="w-full" aria-hidden="true">
      {/* Grid lines */}
      {[25, 50, 75].map((y, i) => (
        <line key={y} x1="20" y1={y} x2="188" y2={y} stroke="rgb(var(--fg))" strokeWidth="0.35" opacity={0.04 + i * 0.02} />
      ))}
      {/* Axes */}
      <line x1="20" y1="95" x2="188" y2="95" stroke="rgb(var(--fg))" strokeWidth="0.6" opacity="0.15" />
      <line x1="20" y1="10" x2="20"  y2="95" stroke="rgb(var(--fg))" strokeWidth="0.6" opacity="0.15" />
      {/* Area fill */}
      <path d="M 20 93 C 55 92 80 88 105 78 C 128 68 145 48 162 28 L 188 8 L 188 95 L 20 95 Z"
        fill="rgb(var(--blue))" opacity="0.07" />
      {/* Main curve */}
      <path d="M 20 93 C 55 92 80 88 105 78 C 128 68 145 48 162 28 L 188 8"
        stroke="rgb(var(--blue))" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      {/* Inflection point */}
      <circle cx="105" cy="78" r="3" fill="rgb(var(--blue))" opacity="0.8" />
      <circle cx="105" cy="78" r="6.5" stroke="rgb(var(--blue))" strokeWidth="0.7" opacity="0.2" />
      {/* Diverging projections from inflection */}
      <path d="M 105 78 C 128 60 148 38 172 18" stroke="rgb(var(--blue))" strokeWidth="0.9" strokeDasharray="3 4" opacity="0.35" />
      <path d="M 105 78 C 128 72 152 62 176 52" stroke="rgb(var(--blue))" strokeWidth="0.9" strokeDasharray="3 4" opacity="0.2" />
      {/* Axis tick marks */}
      {[55, 90, 130, 165].map(x => (
        <line key={x} x1={x} y1="95" x2={x} y2="99" stroke="rgb(var(--fg))" strokeWidth="0.6" opacity="0.2" />
      ))}
    </svg>
  );
}

function SketchTerminal() {
  return (
    <svg viewBox="0 0 200 110" fill="none" className="w-full" aria-hidden="true">
      {/* Browser chrome */}
      <rect x="12" y="8" width="176" height="94" rx="3" stroke="rgb(var(--fg))" strokeWidth="0.6" opacity="0.18" />
      {/* Title bar */}
      <rect x="12" y="8" width="176" height="20" rx="3" fill="rgb(var(--fg))" fillOpacity="0.04" />
      <line x1="12" y1="28" x2="188" y2="28" stroke="rgb(var(--fg))" strokeWidth="0.5" opacity="0.12" />
      {/* Traffic lights */}
      <circle cx="26" cy="18" r="2.5" fill="rgb(var(--fg))" opacity="0.15" />
      <circle cx="34" cy="18" r="2.5" fill="rgb(var(--fg))" opacity="0.15" />
      <circle cx="42" cy="18" r="2.5" fill="rgb(var(--fg))" opacity="0.15" />
      {/* URL bar */}
      <rect x="62" y="11" width="76" height="14" rx="2" fill="rgb(var(--fg))" fillOpacity="0.05" stroke="rgb(var(--fg))" strokeWidth="0.4" strokeOpacity="0.12" />
      <line x1="70" y1="18" x2="130" y2="18" stroke="rgb(var(--fg))" strokeWidth="0.6" opacity="0.18" />
      {/* Hero heading lines */}
      <rect x="22" y="38" width="110" height="8" rx="1.5" fill="rgb(var(--fg))" fillOpacity="0.55" />
      <rect x="22" y="50" width="84"  height="8" rx="1.5" fill="rgb(var(--fg))" fillOpacity="0.38" />
      {/* Subtext */}
      <rect x="22" y="64" width="130" height="4" rx="1" fill="rgb(var(--fg))" fillOpacity="0.14" />
      <rect x="22" y="71" width="108" height="4" rx="1" fill="rgb(var(--fg))" fillOpacity="0.1" />
      <rect x="22" y="78" width="120" height="4" rx="1" fill="rgb(var(--fg))" fillOpacity="0.07" />
      {/* CTA pill */}
      <rect x="22" y="88" width="46" height="9" rx="4.5" fill="rgb(var(--fg))" fillOpacity="0.55" />
      <rect x="74" y="88" width="36" height="9" rx="4.5" stroke="rgb(var(--fg))" strokeWidth="0.6" strokeOpacity="0.25" />
    </svg>
  );
}

function SketchGrowth() {
  return (
    <svg viewBox="0 0 200 110" fill="none" className="w-full" aria-hidden="true">
      {/* Four bands, bottom to top, growing in weight */}
      <rect x="12" y="82" width="176" height="9"  fill="rgb(var(--green))" opacity="0.12" />
      <rect x="12" y="64" width="176" height="13" fill="rgb(var(--green))" opacity="0.22" />
      <rect x="12" y="42" width="176" height="17" fill="rgb(var(--green))" opacity="0.38" />
      <rect x="12" y="14" width="176" height="22" fill="rgb(var(--green))" opacity="0.6" />
      {/* Top edge highlight on heaviest band */}
      <line x1="12" y1="14" x2="188" y2="14" stroke="rgb(var(--green))" strokeWidth="1" opacity="0.45" />
      {/* Year labels */}
      {[
        { y: 91, op: 0.22, label: "01" },
        { y: 72, op: 0.32, label: "02" },
        { y: 52, op: 0.45, label: "03" },
        { y: 27, op: 0.65, label: "04" },
      ].map(({ y, op, label }) => (
        <text key={label} x="18" y={y} fontFamily="monospace" fontSize="7" fill="rgb(var(--fg))" opacity={op}>{label}</text>
      ))}
      {/* Thin baseline */}
      <line x1="12" y1="100" x2="188" y2="100" stroke="rgb(var(--fg))" strokeWidth="0.4" opacity="0.1" />
    </svg>
  );
}

function SketchDefault({ index }: { index: number }) {
  const hues = ["var(--blue)", "var(--green)", "var(--amber)", "var(--muted)"];
  const color = `rgb(${hues[index % hues.length]})`;
  const shift = (index * 37) % 40;
  const amp = 22 + (index * 9) % 16;
  return (
    <svg viewBox="0 0 200 110" fill="none" className="w-full" aria-hidden="true">
      {/* Subtle grid */}
      {[30, 55, 80].map((y, i) => (
        <line key={y} x1="12" y1={y} x2="188" y2={y} stroke="rgb(var(--fg))" strokeWidth="0.3" opacity={0.03 + i * 0.01} />
      ))}
      {/* Baseline */}
      <line x1="12" y1="95" x2="188" y2="95" stroke="rgb(var(--fg))" strokeWidth="0.5" opacity="0.1" />
      {/* Wave */}
      <path
        d={`M 12 55 C ${40+shift} ${55-amp} ${70+shift} ${55-amp} ${100+shift} 55 C ${130+shift} ${55+amp} ${155+shift} ${55+amp} 188 55`}
        stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.6"
      />
      {/* Secondary ghost wave */}
      <path
        d={`M 12 55 C ${32+shift} ${55-amp*0.5} ${62+shift} ${55-amp*0.5} ${92+shift} 55 C ${122+shift} ${55+amp*0.5} ${152+shift} ${55+amp*0.5} 188 55`}
        stroke={color} strokeWidth="0.8" strokeLinecap="round" strokeDasharray="3 4" opacity="0.25"
      />
      {/* Peak annotation */}
      <line x1={55+shift} y1={55-amp} x2={55+shift} y2="95" stroke={color} strokeWidth="0.6" strokeDasharray="2 3" opacity="0.25" />
      <circle cx={55+shift} cy={55-amp} r="2.5" fill={color} opacity="0.65" />
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
  return <SketchDefault index={index} />;
}
