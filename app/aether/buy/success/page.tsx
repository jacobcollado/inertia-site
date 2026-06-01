import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Purchase complete — Aether by Inertia",
};

export default async function BuySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  await searchParams; // consumed but not used — session data handled by webhook

  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col pb-16 sm:pb-20">
      <div className="flex flex-col items-center justify-center flex-1 text-center px-3 py-24 rise">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
          style={{ background: "rgb(var(--green) / 0.15)" }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: "rgb(var(--green))" }} aria-hidden="true">
            <polyline points="2 8 6 12 14 4" />
          </svg>
        </div>

        <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-4">
          You're all set.
        </h1>
        <p className="text-[15px] tracking-tight leading-relaxed text-[rgb(var(--muted))] max-w-sm mb-8" style={{ opacity: 0.7 }}>
          Your license key is on its way to your inbox. It usually arrives within a minute.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/portal/licenses"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium tracking-tight text-white transition-opacity hover:opacity-85"
            style={{ background: "var(--accent-gradient)" }}
          >
            View my licenses
          </Link>
          <Link
            href="/aether/docs"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium tracking-tight border border-[rgb(var(--line))] text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.4)] transition-colors"
          >
            Installation docs
          </Link>
        </div>
      </div>
    </main>
  );
}
