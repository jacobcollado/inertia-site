import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not found — Jacob Collado",
  description: "This page doesn't exist.",
};

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-5xl flex min-h-screen flex-col px-8 pt-6 pb-16 sm:pt-8 sm:pb-20 text-lg">
      <header
        className="flex items-center mb-14 rise"
        style={{ ["--rise-delay" as any]: "0ms" }}
      >
        <Link
          href="/"
          className="text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← back
        </Link>
      </header>

      <section
        className="flex-1 flex flex-col justify-center rise"
        style={{ ["--rise-delay" as any]: "120ms" }}
      >
        <p className="text-sm tracking-tight text-[rgb(var(--muted))] mb-3">404</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tighter mb-4">
          This page slipped through.
        </h1>
        <p className="text-lg leading-relaxed tracking-tight text-[rgb(var(--fg))] max-w-md mb-8">
          The URL doesn't lead anywhere I've built yet. Maybe a typo, maybe something I moved.
        </p>
        <div className="flex items-center gap-5 text-sm tracking-tight">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-[rgb(var(--fg))] bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-5 py-2 hover:opacity-85 transition-opacity duration-300 [-webkit-tap-highlight-color:transparent]"
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
      </section>
    </main>
  );
}
