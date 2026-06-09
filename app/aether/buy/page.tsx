import type { Metadata } from "next";
import Link from "next/link";
import { BuyForm } from "./buy-form";

export const metadata: Metadata = {
  title: "Get Aether",
  description: "Pick a license for Aether. Standard from $85/yr or Lifetime for $105. One purchase, one store, live in under an hour.",
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
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Back nav */}
      <div className="px-3 pt-6 pb-2">
        <Link
          href="/aether"
          className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M13 8H3M7 4L3 8l4 4" />
          </svg>
          Aether
        </Link>
      </div>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-3 pt-10 sm:pt-16 pb-12 rise">
        <h1 className="text-[clamp(2.6rem,6vw,4rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-4">
          Get Aether
        </h1>
        <p className="text-[clamp(1rem,1.8vw,1.1rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-xs" style={{ opacity: 0.6 }}>
          Pick a license and go straight to checkout.
        </p>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Centered form */}
      <div className="rise w-full max-w-lg mx-auto px-3 py-12 sm:py-16" style={{ ["--rise-delay" as any]: "40ms" }}>
        <BuyForm initialTier={initialTier} />
      </div>

    </main>
  );
}
