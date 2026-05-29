"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { WorkMeta } from "@/lib/work";

function serviceTag(s: string | undefined) {
  if (!s) return "";
  return s.replace(/^An?\s+/i, "").replace(/\s+for\s+.+$/i, "").trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function WorkIndexPage() {
  const [work, setWork] = useState<WorkMeta[]>([]);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((d) => {
      const sorted = (d.work ?? []).sort((a: WorkMeta, b: WorkMeta) => (a.order ?? 99) - (b.order ?? 99));
      setWork(sorted);
    });
  }, []);

  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-3 pt-16 sm:pt-24 pb-14 rise">
        <h1 className="text-[clamp(2.6rem,6vw,4rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-4 max-w-2xl">
          Selected work
        </h1>
        <p className="text-[clamp(1rem,1.8vw,1.15rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md" style={{ opacity: 0.7 }}>
          A few of the things we've built.
        </p>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Work list */}
      <section className="rise">
        {work.map((w, i) => (
          <Link
            key={w.slug}
            href={`/work/${w.slug}`}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-3 py-7 border-t border-[rgb(var(--line))] hover:bg-[rgb(var(--fg)/0.02)] transition-colors"
            style={{ ["--rise-delay" as any]: `${i * 40}ms` }}
          >
            <div className="flex flex-col gap-2 max-w-lg">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))]">{w.client}</span>
                {w.service && (
                  <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] border border-[rgb(var(--line))] rounded-full px-2.5 pt-[3px] pb-[4px] leading-none">
                    {serviceTag(w.service)}
                  </span>
                )}
                {w.year && (
                  <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] tabular-nums" style={{ opacity: 0.4 }}>
                    {w.year.match(/\d{4}/)?.[0]}
                  </span>
                )}
              </div>
              {w.summary && (
                <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{w.summary}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0 text-[13px] tracking-tight text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] transition-colors">
              View project
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 -translate-x-1 group-hover:translate-x-0 transition-transform duration-200" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </div>
          </Link>
        ))}
        {work.length > 0 && <div className="border-t border-[rgb(var(--line))]" />}
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* CTA */}
      <section className="flex flex-col items-center text-center px-3 py-16 sm:py-24 gap-5 rise">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">
          Want your project here?
        </p>
        <p className="text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm" style={{ opacity: 0.6 }}>
          Tell us what you're building and we'll take it from brief to live.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight text-white hover:opacity-85 transition-opacity"
            style={{ background: "var(--accent-gradient)" }}
          >
            Start a project
          </Link>
          <Link
            href="/aether"
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line))] px-5 py-2.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          >
            Explore Aether
          </Link>
        </div>
      </section>

    </main>
  );
}
