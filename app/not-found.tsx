import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page moved, or never existed. Head back and pick up where you left off.",
};

export default function NotFound() {
  return (
    <main className="page-container mx-auto w-full max-w-6xl">

      <div className="flex flex-col items-center justify-center px-8 text-center rise" style={{ minHeight: "calc(100vh - 48px)", ["--rise-delay" as any]: "40ms" }}>
        <p className="text-[11px] tracking-widest text-[rgb(var(--muted))] opacity-40 mb-6 select-none uppercase">
          404
        </p>

        <h1 className="text-[clamp(2rem,5vw,3rem)] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug mb-4">
          This page doesn't exist.
        </h1>
        <p className="text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm mb-10 opacity-70">
          Maybe a typo, maybe something that moved. Either way, nothing here.
        </p>

        <div className="flex items-center gap-6 text-[14px] tracking-tight">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[rgb(var(--fg))] hover:opacity-60 transition-opacity"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
            Go home
          </Link>
          <Link
            href="/contact"
            className="text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors opacity-60 hover:opacity-100"
          >
            Contact
          </Link>
        </div>
      </div>

    </main>
  );
}

