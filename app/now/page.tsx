import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";

export const metadata: Metadata = {
  title: "Now — Jacob Collado",
  description: "What Jacob Collado is working on right now.",
};

export default function NowPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 pt-6 pb-16 sm:pt-8 sm:pb-20">
      <header
        className="flex items-center justify-between mb-16 rise"
        style={{ ["--rise-delay" as any]: "0ms" }}
      >
        <Link
          href="/"
          className="text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← back
        </Link>
        <ThemeToggle />
      </header>

      <article className="rise" style={{ ["--rise-delay" as any]: "100ms" }}>
        <h1 className="text-5xl sm:text-6xl font-medium tracking-tighter leading-none mb-10">
          Now
        </h1>

        <div className="space-y-6 text-lg leading-relaxed tracking-tight text-[rgb(var(--muted))]">
          <p>
            Most of my time right now is split between two things — finishing Aether and getting Aftertone off the ground properly. Aether is close. The bones have been solid for a while; it&apos;s the last ten percent that takes the longest. First clients are in at Aftertone, which means the agency side is real now, not just something I say.
          </p>
          <p>
            This site is a third thing I keep picking at. It&apos;s never done. I think that&apos;s probably right.
          </p>
          <p>
            Reading <em className="text-[rgb(var(--fg))]">The Creative Act</em> by Rick Rubin — slowly, in the way it seems to want to be read. Also dipping back into <em className="text-[rgb(var(--fg))]">Thinking in Systems</em> by Donella Meadows whenever I need to think more clearly about something.
          </p>
          <p>
            GNX on repeat. Nick Drake late at night.
          </p>
          <p>
            Thinking a lot about how much of design is really just confidence. The best work often isn&apos;t the most considered — it&apos;s the most committed.
          </p>
        </div>

        <p className="mt-12 text-sm tracking-tight text-[rgb(var(--muted))]">
          April 2025 · Chicago
        </p>
      </article>
    </main>
  );
}
