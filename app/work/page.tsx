"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PastWork } from "@/app/past-work";
import { ContourCanvas } from "@/app/contour-canvas";
import type { WorkMeta } from "@/lib/work";

function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
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
    <main className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-6xl min-h-screen flex flex-col">

      {/* Nav */}
      <div className="flex items-center justify-between px-6 sm:px-8 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
          back
        </Link>
        <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-40">
          {work.length > 0 ? `${work.length} ${work.length === 1 ? "project" : "projects"}` : ""}
        </span>
      </div>

      <GridRule />

      {/* Hero header with contour background */}
      <div className="relative overflow-hidden flex flex-col items-center justify-center text-center px-6 sm:px-8 py-16 sm:py-24">
        <div className="absolute inset-x-px inset-y-0">
          <ContourCanvas />
        </div>
        {/* Fade edges */}
        <div className="pointer-events-none absolute top-0 h-14 z-10" style={{ left: 1, right: 1, background: "linear-gradient(to bottom, rgb(var(--bg)) 0%, transparent 100%)" }} />
        <div className="pointer-events-none absolute z-10" style={{ left: 1, right: 1, bottom: 1, height: 56, background: "linear-gradient(to top, rgb(var(--bg)) 0%, transparent 100%)" }} />

        <div className="relative z-20 pointer-events-none">
          <h1 className="text-[clamp(2.4rem,7vw,5rem)] font-[450] tracking-tighter leading-[1.0] text-[rgb(var(--fg))]">
            Shipped using Inertia
          </h1>
          <p className="mt-4 text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.6 }}>
            Every project here went live. Real clients, real stakes, real results.
          </p>
        </div>
      </div>

      <GridRule />

      {/* Work grid */}
      <PastWork work={work} showViewAll={false} />

    </main>
  );
}
