import type { Metadata } from "next";
import Link from "next/link";
import { BuyForm } from "./buy-form";

export const metadata: Metadata = {
  title: "Buy Aether",
  description: "Pick a license for Aether. Standard, Lifetime, or a custom build on the Aether foundation.",
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
    <main className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-6xl flex flex-col">

      <div className="flex items-center px-6 sm:px-8 py-5 rise">
        <Link
          href="/aether"
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] tracking-tight transition-opacity hover:opacity-70"
          style={{ border: "1px solid rgb(var(--fg) / 0.25)", color: "rgb(var(--fg))" }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
          Aether
        </Link>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      <div className="rise" style={{ ["--rise-delay" as any]: "40ms" }}>
        <BuyForm initialTier={initialTier} />
      </div>

    </main>
  );
}

