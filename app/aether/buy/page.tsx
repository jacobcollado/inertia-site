import type { Metadata } from "next";
import Link from "next/link";
import { BuyForm } from "./buy-form";

export const metadata: Metadata = {
  title: "Buy Aether — Inertia",
  description:
    "Pick a license for Aether. Standard, Lifetime, or a custom build on the Aether foundation.",
};

type Search = { tier?: string };

export default async function BuyAetherPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { tier } = await searchParams;
  const initialTier =
    tier === "standard" || tier === "lifetime" || tier === "custom"
      ? tier
      : undefined;

  return (
    <main className="page-container mx-auto w-full max-w-5xl min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Nav */}
      <div className="flex items-center px-8 py-5 rise" style={{ ["--rise-delay" as any]: "0ms" }}>
        <Link
          href="/aether"
          className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← Aether
        </Link>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Hero */}
      <div className="px-8 pt-14 pb-12 text-center rise" style={{ ["--rise-delay" as any]: "60ms" }}>
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">Get started with</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[13px] tracking-tight text-[rgb(var(--fg))]">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 opacity-60" aria-hidden="true">
              <path d="M3 5h10M3 8h7M3 11h4" />
            </svg>
            Aether
          </span>
        </div>
        <h1 className="text-[clamp(2.25rem,5.5vw,4rem)] font-medium tracking-[-0.04em] leading-[1.05] text-[rgb(var(--fg))]">
          Pick up a license
        </h1>
        <p className="mt-4 text-[15px] tracking-tight leading-relaxed text-[rgb(var(--muted))] max-w-md mx-auto">
          Select a tier, share a few details, and I&apos;ll send an invoice and theme files within a day.
        </p>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Form */}
      <div className="px-6 sm:px-8 py-10 rise" style={{ ["--rise-delay" as any]: "160ms" }}>
        <BuyForm initialTier={initialTier} />
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Footer note */}
      <div className="px-8 py-6 rise" style={{ ["--rise-delay" as any]: "260ms" }}>
        <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]">
          Not ready to buy?{" "}
          <Link
            href="/aether"
            className="text-[rgb(var(--fg))] underline underline-offset-4 decoration-[rgb(var(--line))] hover:decoration-[rgb(var(--fg))] transition-colors"
          >
            View the demo
          </Link>{" "}
          or{" "}
          <Link
            href="/contact"
            className="text-[rgb(var(--fg))] underline underline-offset-4 decoration-[rgb(var(--line))] hover:decoration-[rgb(var(--fg))] transition-colors"
          >
            send a note
          </Link>
          .
        </p>
      </div>

    </main>
  );
}
