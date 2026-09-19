import type { Metadata } from "next";
import { ClaimFlow } from "./claim-flow";

export const metadata: Metadata = {
  title: "Set up your account, Aether by Inertia",
  robots: { index: false, follow: false },
};

/* The destination for the "Create your account" link in the license email.
 *
 * Separate from /aether/buy/success on purpose: that page's job is to confirm
 * a payment that just happened, and someone arriving from the email has
 * already seen it. This page skips the confirmation and starts the claim
 * immediately, so the click that said "create my account" is the only one
 * they need to make. */

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-[calc(100svh-158px)] flex flex-col">
      <div className="flex flex-col items-center justify-center flex-1 text-center px-3 py-10 rise -translate-y-[2%]">
        <ClaimFlow sessionId={session_id} />
      </div>
    </main>
  );
}
