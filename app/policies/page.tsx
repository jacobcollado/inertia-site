import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Policies",
  description: "The fine print, kept plain. Terms, privacy, and refunds for working with Inertia and buying Aether.",
};

const DOCS = [
  {
    href: "/policies/terms-of-service",
    title: "Terms of Service",
    description: "How engagements work: ownership, payment, revisions, liability, and disputes.",
    effective: "May 1, 2026",
  },
  {
    href: "/policies/privacy-policy",
    title: "Privacy Policy",
    description: "What data we collect, why we collect it, and how long we keep it.",
    effective: "May 1, 2026",
  },
  {
    href: "/policies/refund-policy",
    title: "Refund Policy",
    description: "Digital products are final sale, but we will always work to make things right.",
    effective: "June 1, 2026",
  },
];

export default function PoliciesPage() {
  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-3 pt-16 sm:pt-24 pb-14 rise">
        <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-5">
          Policies
        </h1>
        <p className="text-[clamp(1rem,1.8vw,1.15rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm" style={{ opacity: 0.7 }}>
          Legal documents. Written plainly so they're actually worth reading.
        </p>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Doc list */}
      <section className="rise">
        {DOCS.map((doc, i) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="group flex items-center justify-between gap-6 px-3 py-8 border-t border-[rgb(var(--line))] hover:bg-[rgb(var(--fg)/0.02)] transition-colors"
            style={{ ["--rise-delay" as any]: `${i * 60}ms` }}
          >
            <div className="flex items-start">
              <div className="flex flex-col gap-2">
                <span className="text-[16px] font-medium tracking-tight text-[rgb(var(--fg))]">{doc.title}</span>
                <span className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">{doc.description}</span>
                <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] tabular-nums" style={{ opacity: 0.35 }}>
                  Effective {doc.effective}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-0 group-hover:opacity-100 transition-opacity">
              Read
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 -translate-x-1 group-hover:translate-x-0 transition-transform duration-200" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </div>
          </Link>
        ))}
        <div className="border-t border-[rgb(var(--line))]" />
      </section>

      {/* Footer note */}
      <section className="flex flex-col items-center text-center px-3 py-16 sm:py-24 gap-4 rise">
        <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] max-w-sm leading-relaxed" style={{ opacity: 0.6 }}>
          Questions about any of these? We're happy to explain anything in plain language.
        </p>
        <Link
          href="/contact"
          className="text-[13px] tracking-tight text-[rgb(var(--fg))] hover:text-[rgb(var(--muted))] transition-colors"
        >
          Get in touch &rarr;
        </Link>
      </section>

    </main>
  );
}
