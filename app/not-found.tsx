import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not found — Inertia",
  description: "This page doesn't exist.",
};

export default function NotFound() {
  return (
    <main className="page-container mx-auto w-full max-w-5xl min-h-screen flex flex-col">

      <div className="flex items-center px-8 py-5 rise">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
          back
        </Link>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      <div className="flex-1 flex flex-col justify-center px-8 rise" style={{ ["--rise-delay" as any]: "40ms" }}>
        <p
          className="font-medium tracking-tighter text-[rgb(var(--line))] select-none leading-none mb-8"
          style={{ fontSize: "clamp(96px, 18vw, 220px)" }}
          aria-hidden="true"
        >
          404
        </p>

        <div className="grid-rule mb-8" aria-hidden="true" />

        <h1 className="text-2xl sm:text-3xl font-medium tracking-tighter mb-3">
          This page slipped through.
        </h1>
        <p className="text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm mb-8">
          The URL doesn't lead anywhere I've built yet. Maybe a typo, maybe something that moved.
        </p>

        <div className="flex items-center gap-5 text-sm tracking-tight">
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-[rgb(var(--fg))] bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-5 py-2 hover:opacity-85 transition-opacity [-webkit-tap-highlight-color:transparent]"
          >
            home
          </Link>
          <Link
            href="/contact"
            className="text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          >
            contact
          </Link>
        </div>
      </div>

    </main>
  );
}
