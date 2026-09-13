import type { Metadata } from "next";
import Link from "next/link";
import { ClaimAccount } from "./claim-account";

export const metadata: Metadata = {
  title: "Purchase complete — Aether by Inertia",
};

export default async function BuySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  // Height budget: the in-flow site header (72px) and minimal footer (~86px)
  // both sit outside this main, so a full-viewport min-height here would always
  // overflow by their combined height. svh (not vh) so mobile toolbars don't
  // create the same overflow dynamically. No bottom padding: it would sit below
  // the centered content and pull the optical centre up.
  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-[calc(100svh-158px)] flex flex-col">
      {/* Optical, not mathematical, centre: the block is visually top-heavy (a
          48px badge and a large headline over one short line and a button row),
          so true centre reads as sitting low. A small upward nudge corrects it.
          translate rather than margin so it doesn't alter the height budget. */}
      <div className="flex flex-col items-center justify-center flex-1 text-center px-3 py-10 rise -translate-y-[2%]">
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

        <ClaimAccount sessionId={session_id} />
      </div>
    </main>
  );
}
