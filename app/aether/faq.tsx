import Link from "next/link";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";

export function AetherFaq() {
  return (
    <section className="flex flex-col items-center justify-center px-3 py-16 sm:py-24 text-center rise rise--liquid">
      <h2 className="text-[28px] sm:text-[36px] font-normal tracking-[-0.04em] leading-tight text-[rgb(var(--fg))]">
        Set up Aether yourself.
      </h2>
      <p className="mt-3 max-w-xl text-[15px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
        Step-by-step documentation covers installation, setup, and how to get the most from the theme.
      </p>
      <Link
        href="/docs?from=aether"
        className={`mt-6 inline-flex items-center justify-center gap-1.5 ${ACTION_RADIUS_CLASS} border border-[rgb(var(--line))] px-5 py-2.5 text-[15px] sm:text-[16px] font-medium tracking-tight text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.3)] transition-colors`}
      >
        Read the documentation
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
          <line x1="3" y1="8" x2="13" y2="8" />
          <polyline points="9 4 13 8 9 12" />
        </svg>
      </Link>
    </section>
  );
}
