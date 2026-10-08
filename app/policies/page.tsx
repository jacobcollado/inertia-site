import type { Metadata } from "next";
import Link from "next/link";
import { CTA_HEADER_PILL_CLASS } from "@/lib/cta-chrome";

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

// The three documents as tiles of one size, the same flat tile, 6px corners
// and type as the homepage's cards: the title set like a card heading, the
// summary under it. No dates or separators; each document carries its own
// effective date.
export default function PoliciesPage() {
  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col px-3 sm:px-8 pb-16 sm:pb-24">
      <header className="flex flex-col items-center text-center pt-16 sm:pt-24 pb-12 sm:pb-16 rise">
        <h1 className="text-[clamp(30px,5vw,54px)] font-medium tracking-[-0.04em] leading-[1.06] text-[rgb(var(--fg))]">
          Policies
        </h1>
        <p className="mt-5 max-w-md text-[15px] sm:text-[18px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:balance]">
          The fine print, written plainly so it&rsquo;s actually worth reading.
        </p>
      </header>

      <ul className="rise rise-stagger grid gap-3 sm:grid-cols-3 sm:gap-4" data-stagger>
        {DOCS.map((doc) => (
          <li key={doc.href}>
            <Link
              href={doc.href}
              className="flex h-full min-h-[200px] flex-col justify-between gap-8 rounded-[6px] bg-[var(--tile)] p-6 transition-colors duration-300 hover:bg-[var(--tile-2)] sm:min-h-[240px] sm:p-7"
            >
              <h2 className="text-[22px] leading-[1.15] tracking-[-0.025em] text-[var(--ink)]" style={{ fontWeight: 450 }}>
                {doc.title}
              </h2>
              <p className="text-[15px] leading-snug tracking-tight text-[var(--ink-2)] [text-wrap:pretty]">{doc.description}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="flex flex-col items-center text-center pt-16 sm:pt-24 gap-6 rise">
        <p className="max-w-sm text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
          Questions about any of these? We&rsquo;re happy to explain anything in plain language.
        </p>
        <a
          href="https://cal.com/jacob-c-99otvp/15min"
          target="_blank"
          rel="noreferrer"
          className={CTA_HEADER_PILL_CLASS}
          style={{ background: "var(--tile-2)", color: "var(--ink)", whiteSpace: "nowrap" }}
        >
          <span className="relative">Reach out</span>
        </a>
      </section>
    </main>
  );
}
