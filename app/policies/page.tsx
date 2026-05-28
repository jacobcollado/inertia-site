import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Policies - Inertia" };

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
];

export default function PoliciesPage() {
  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full pt-6 pb-24 px-3" style={{ maxWidth: "80rem" }}>
      <div className="mb-14">
        <h1 className="text-[2rem] font-medium tracking-[-0.03em] text-[rgb(var(--fg))] mb-3">Policies</h1>
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
          Our legal documents. Written plainly so they're worth reading.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-[rgb(var(--line))] border-y border-[rgb(var(--line))]">
        {DOCS.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="group flex items-start justify-between gap-6 py-6 hover:opacity-80 transition-opacity"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))]">{doc.title}</span>
              <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">{doc.description}</span>
              <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40 tabular-nums mt-1">Effective {doc.effective}</span>
            </div>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 mt-0.5 text-[rgb(var(--muted))] opacity-40 group-hover:opacity-80 transition-opacity" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50">
        Questions?{" "}
        <Link href="/contact" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
          Contact us.
        </Link>
      </p>
    </main>
  );
}
