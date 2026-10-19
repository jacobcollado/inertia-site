import Link from "next/link";
import { TOCSticky } from "@/app/blog/[slug]/toc";
import { PolicyText } from "./policy-text";

type Section = { id: string; title: string; body: string };

// A policy document, in the same order as ever: the title block, centred,
// with its effective date on a tag; the body under the same Contents bar as
// a post; and a close that leads to the next policy. Set on the paper like
// the homepage, with no sheet or rails: the title in display type, the
// sections in the homepage's section type, and the next policy on a button
// in the family of the work's tags.
export function PolicyDoc({
  title,
  effective,
  meta,
  sections,
  self,
  next,
}: {
  title: string;
  effective: string;
  meta: string[];
  sections: Section[];
  self: "terms" | "privacy" | "refund";
  next: { href: string; label: string };
}) {
  return (
    <main className="relative w-full">
      <article className="mx-auto w-full max-w-[80rem]">
        <header className="policy-head rise">
          <span className="policy-tag">Effective {effective}</span>
          <h1 className="policy-title">{title}</h1>
          {/* One line each, no separators. */}
          <p className="policy-meta">
            {meta.map((m) => (
              <span key={m} className="block">
                {m}
              </span>
            ))}
          </p>
        </header>

        <div className="mx-auto w-full max-w-[52rem] px-6 sm:px-12">
          <TOCSticky headings={sections.map((s) => ({ id: s.id, text: s.title, level: 2 }))} />

          <div className="rise flex flex-col gap-14 pt-12 pb-8">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="policy-section">{s.title}</h2>
                <p className="policy-body">
                  <PolicyText text={s.body} self={self} />
                </p>
              </section>
            ))}
          </div>

          {/* The close: the next policy, and where to ask about any of it. */}
          <div className="flex flex-col items-center gap-4 pt-16 pb-20">
            <Link href={next.href} className="index-more">
              <span>Next: {next.label}</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <p className="text-[14px] tracking-tight text-[var(--ink-3)]">
              Questions?{" "}
              <a href="mailto:hello@byinertia.com" className="policy-link">
                hello@byinertia.com
              </a>
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
