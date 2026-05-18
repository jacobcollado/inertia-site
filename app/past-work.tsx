"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { WorkMeta } from "@/lib/work";

function serviceTag(s: string | undefined) {
  if (!s) return "";
  return s.replace(/^An?\s+/i, "").replace(/\s+for\s+.+$/i, "").trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PastWork({ work, showViewAll = true }: { work: WorkMeta[]; showViewAll?: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("All");

  // Derive unique service tags
  const tags = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = ["All"];
    for (const w of work) {
      const t = serviceTag(w.service);
      if (t && !seen.has(t)) { seen.add(t); out.push(t); }
    }
    return out;
  }, [work]);

  const filtered = filter === "All" ? work : work.filter((w) => serviceTag(w.service) === filter);

  if (!work.length) return null;

  return (
    <div>

      {/* Filter tabs */}
      <div className="flex items-stretch border-b border-[rgb(var(--line))] overflow-x-auto">
        {tags.map((tag) => {
          const active = filter === tag;
          return (
            <button
              key={tag}
              onClick={() => { setFilter(tag); setHovered(null); }}
              className="relative shrink-0 py-3 text-[12px] tracking-tight transition-colors duration-150"
              style={{
                color: active ? "rgb(var(--fg))" : "rgb(var(--muted))",
                paddingLeft: tag === "E-Commerce Site" ? "11px" : "20px",
                paddingRight: tag === "E-Commerce Site" ? "11px" : "20px",
              }}
            >
              <span style={{ opacity: active ? 1 : 0.45 }}>{tag}</span>
              {active && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: "rgb(var(--fg))" }}
                />
              )}
              <span className="absolute top-0 right-0 bottom-0 w-px bg-[rgb(var(--line))]" aria-hidden="true" />
            </button>
          );
        })}
        {showViewAll && (
          <div className="ml-auto shrink-0 px-5 py-3 border-l border-[rgb(var(--line))]">
            <Link
              href="/work"
              className="text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
              style={{ opacity: 0.55 }}
            >
              View all &#8594;
            </Link>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3">
        {filtered.map((w, i) => {
          const active = hovered === w.slug;
          const cols = 3; // sm+ cols for border logic
          const notLastIn2 = i % 2 !== 1;
          const notLastIn3 = i % cols !== cols - 1;
          const isLastRow = i >= filtered.length - (filtered.length % cols || cols);
          return (
            <Link
              key={w.slug}
              href={`/work/${w.slug}`}
              className={[
                "relative overflow-hidden group border-b border-[rgb(var(--line))]",
                notLastIn2 ? "border-r border-[rgb(var(--line))]" : "",
                notLastIn3 ? "sm:border-r" : "sm:border-r-0",
                isLastRow ? "sm:border-b-0" : "",
              ].join(" ")}
              style={{ aspectRatio: "4 / 3" }}
              onMouseEnter={() => setHovered(w.slug)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5">
                <span
                  className="font-[400] tracking-tight leading-none text-center transition-opacity duration-200"
                  style={{
                    fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
                    color: "rgb(var(--fg))",
                    opacity: active ? 1 : 0.55,
                  }}
                >
                  {w.client}
                </span>
                <span
                  className="text-center transition-opacity duration-200"
                  style={{
                    fontSize: 11,
                    color: "rgb(var(--muted))",
                    opacity: active ? 0.55 : 0.25,
                  }}
                >
                  {serviceTag(w.service)}{w.year ? ` . ${w.year.match(/\d{4}/)?.[0]}` : ""}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
