import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "../../theme-toggle";
import { BuyForm } from "./buy-form";

export const metadata: Metadata = {
  title: "Buy Aether — Jacob Collado",
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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 pt-6 pb-16 sm:pt-8 sm:pb-20 text-lg">
      <header
        className="flex items-center justify-between mb-14 rise"
        style={{ ["--rise-delay" as any]: "0ms" }}
      >
        <Link
          href="/aether"
          className="text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← Aether
        </Link>
        <ThemeToggle />
      </header>

      <section className="mb-10 rise" style={{ ["--rise-delay" as any]: "120ms" }}>
        <p className="text-sm tracking-tight text-[rgb(var(--muted))] mb-3">
          Aether Theme
        </p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tighter mb-4 leading-[1.1]">
          Pick up a license
        </h1>
        <p className="text-lg leading-relaxed tracking-tight text-[rgb(var(--fg))]">
          Select a tier, share a few details, and I'll send an invoice and theme files within a day. Custom builds come back with a short scope call first.
        </p>
      </section>

      <section
        className="mb-10 rise"
        style={{ ["--rise-delay" as any]: "220ms" }}
      >
        <BuyForm initialTier={initialTier} />
      </section>

      <section
        className="rise text-sm tracking-tight text-[rgb(var(--muted))]"
        style={{ ["--rise-delay" as any]: "340ms" }}
      >
        <p className="mb-2">
          Not ready to buy?{" "}
          <Link
            href="/aether#demo"
            className="text-[rgb(var(--fg))] underline underline-offset-4 decoration-[rgb(var(--line))] hover:decoration-[rgb(var(--fg))]"
          >
            View the live demo
          </Link>{" "}
          or{" "}
          <Link
            href="/contact"
            className="text-[rgb(var(--fg))] underline underline-offset-4 decoration-[rgb(var(--line))] hover:decoration-[rgb(var(--fg))]"
          >
            send a general note
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
