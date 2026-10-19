import type { Metadata } from "next";
import Link from "next/link";
import { PlaneIcon, ReachOut } from "@/components/reach-out";

export const metadata: Metadata = {
  title: "Policies",
  description: "The fine print, kept plain. Terms, privacy, and refunds for working with Inertia and buying Aether.",
  alternates: { canonical: "https://byinertia.com/policies" },
};

const DOCS = [
  {
    href: "/policies/terms-of-service",
    title: "Terms of Service",
    description: "How engagements work: ownership, payment, revisions, liability, and disputes.",
  },
  {
    href: "/policies/privacy-policy",
    title: "Privacy Policy",
    description: "What data we collect, why we collect it, and how long we keep it.",
  },
  {
    href: "/policies/refund-policy",
    title: "Refund Policy",
    description: "Digital products are final sale, but we will always work to make things right.",
  },
];

// The three documents as three cards of one size, on the paper with a
// hairline ring, like the Reach out pop-up's ways in: the title set like a
// section heading, the summary under it, and an arrow that leans the way it
// points on hover. Then where to ask about any of it.
export default function PoliciesPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[80rem] flex-col px-6 pb-16 sm:px-8 sm:pb-24">
      <header className="policy-head rise">
        <h1 className="policy-title">Policies</h1>
        <p className="policy-meta">The fine print, written plainly so it&rsquo;s actually worth reading.</p>
      </header>

      <ul className="rise rise-stagger grid gap-3 sm:grid-cols-3 sm:gap-4" data-stagger>
        {DOCS.map((doc) => (
          <li key={doc.href}>
            <Link href={doc.href} className="policy-card">
              <span className="flex items-start justify-between gap-4">
                <span className="policy-card__title">{doc.title}</span>
                <svg className="policy-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M5 11 11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="policy-card__line">{doc.description}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="rise flex flex-col items-center gap-6 pt-20 text-center sm:pt-28">
        <p className="max-w-sm text-[16px] leading-relaxed tracking-tight text-[var(--ink-3)] [text-wrap:balance]">
          Questions about any of these? We&rsquo;re happy to explain anything in plain language.
        </p>
        <ReachOut className="header-cta">
          <PlaneIcon className="header-cta__icon" />
          Reach out
        </ReachOut>
      </section>
    </main>
  );
}
