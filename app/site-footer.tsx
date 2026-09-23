"use client";

import Link from "next/link";

export function MinimalFooter() {
  return (
    <footer className="w-full max-w-[80rem] mx-auto px-6 sm:px-8 py-8 flex flex-col items-start text-left sm:items-center sm:text-center gap-4">
      <div className="rise flex flex-wrap items-center gap-x-5 gap-y-2" style={{ "--rise-delay": "80ms" } as React.CSSProperties}>
        <Link href="/policies/terms-of-service" className="text-[15px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.4 }}>
          Terms of service
        </Link>
        <Link href="/policies/privacy-policy" className="text-[15px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.4 }}>
          Privacy policy
        </Link>
        <Link href="/policies/refund-policy" className="text-[15px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.4 }}>
          Refund policy
        </Link>
      </div>
    </footer>
  );
}

