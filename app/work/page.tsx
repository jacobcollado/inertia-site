"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { WorkMeta } from "@/lib/work";

function serviceShort(s: string | undefined): string {
  if (!s) return "";
  const l = s.toLowerCase();
  if (l.includes("shopify") || l.includes("storefront") || l.includes("e-commerce") || l.includes("merch")) return "Shopify";
  if (l.includes("logo") || l.includes("brand") || l.includes("identity")) return "Brand";
  if (l.includes("portfolio")) return "Portfolio";
  return "Web";
}

function WorkCard({ w, i }: { w: WorkMeta; i: number }) {
  const cover = w.cover ?? `/work/${w.slug}/cover.jpg`;
  const isWide = i % 3 === 0;

  return (
    <Link
      href={`/work/${w.slug}`}
      className={`group relative block overflow-hidden rounded-2xl bg-[rgb(var(--surface))]`}
      style={{
        aspectRatio: isWide ? "16/9" : "4/5",
        gridColumn: isWide ? "span 2" : "span 1",
        ["--rise-delay" as any]: `${i * 60}ms`,
      }}
    >
      {/* image */}
      <img
        src={cover}
        alt={w.client}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        draggable={false}
      />

      {/* overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* meta */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[18px] sm:text-[22px] font-normal tracking-[-0.02em] leading-none text-white">
            {w.client}
          </span>
          {w.service && (
            <span className="text-[11px] tracking-tight text-white/50 leading-none mt-1">
              {serviceShort(w.service)}
              {w.year ? ` · ${w.year.match(/\d{4}/)?.[0]}` : ""}
            </span>
          )}
        </div>
        <div
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white transition-all duration-300 group-hover:bg-white group-hover:text-black"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function WorkIndexPage() {
  const [work, setWork] = useState<WorkMeta[]>([]);

  useEffect(() => {
    fetch("/api/content").then(r => r.json()).then(d => {
      const sorted = (d.work ?? []).sort((a: WorkMeta, b: WorkMeta) => (a.order ?? 99) - (b.order ?? 99));
      setWork(sorted);
    });
  }, []);

  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[88rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-3 pt-16 sm:pt-24 pb-12 sm:pb-16 rise">
        <h1 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))] mb-4 max-w-2xl">
          The work speaks. We just ship it.
        </h1>
        <p className="text-[clamp(1rem,1.8vw,1.15rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm" style={{ opacity: 0.7 }}>
          Every project below was taken from brief to live without cutting corners.
        </p>
      </section>

      {/* Grid */}
      <section className="px-3 rise">
        {work.length > 0 ? (
          <>
            {/* mobile: single column, uniform 3/2 */}
            <div className="flex flex-col gap-3 sm:hidden">
              {work.map((w, i) => (
                <Link
                  key={w.slug}
                  href={`/work/${w.slug}`}
                  className="group relative block overflow-hidden rounded-2xl bg-[rgb(var(--surface))]"
                  style={{ aspectRatio: "3/2", ["--rise-delay" as any]: `${i * 60}ms` }}
                >
                  <img src={w.cover ?? `/work/${w.slug}/cover.jpg`} alt={w.client} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 55%)" }} />
                  <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[18px] font-normal tracking-[-0.02em] leading-none text-white">{w.client}</span>
                      {w.service && <span className="text-[11px] tracking-tight text-white/50 mt-1">{serviceShort(w.service)}{w.year ? ` · ${w.year.match(/\d{4}/)?.[0]}` : ""}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* desktop: masonry 3-col */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-4">
              {work.map((w, i) => (
                <WorkCard key={w.slug} w={w} i={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-[rgb(var(--surface))] animate-pulse" style={{ aspectRatio: "3/2" }} />
            ))}
          </div>
        )}
      </section>

      <div className="grid-rule mt-16 sm:mt-24" aria-hidden="true" />

      {/* CTA */}
      <section className="px-3 py-16 sm:py-24 rise">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
          <p className="text-[clamp(2rem,4vw,3.2rem)] font-normal tracking-[-0.04em] leading-[1.05] text-[rgb(var(--fg))] max-w-lg">
            Your brand deserves to look like it means it.
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight text-[rgb(var(--bg))] hover:opacity-85 transition-opacity"
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
        </div>
      </section>

    </main>
  );
}
