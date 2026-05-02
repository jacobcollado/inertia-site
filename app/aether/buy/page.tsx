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
    <main className="page-container mx-auto w-full max-w-5xl flex flex-col">

      {/* Nav */}
      <div className="flex items-center px-8 py-5 rise">
        <Link
          href="/aether"
          className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← Aether
        </Link>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      <div className="rise" style={{ ["--rise-delay" as any]: "40ms" }}>
        <BuyForm initialTier={initialTier} />
      </div>

    </main>
  );
}
