import Link from "next/link";
import type { ReactNode } from "react";

const LINK = "hover:text-[rgb(var(--fg))] transition-colors";

// Just the policies, as one short line of links. The guarantee itself is
// stated under the checkout button; the refund policy has the 14 day window.
// Change of mind isn't covered, since the theme is delivered the moment it's
// paid.
export function PolicyDisclaimer({ className, lead }: { className?: string; lead?: ReactNode }) {
  return (
    <p
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))] ${className ?? ""}`}
      style={{ opacity: 0.75 }}
    >
      {lead}
      <Link href="/policies/terms-of-service" className={LINK}>Terms</Link>
      <Link href="/policies/refund-policy" className={LINK}>Refunds</Link>
      <Link href="/policies/privacy-policy" className={LINK}>Privacy</Link>
    </p>
  );
}