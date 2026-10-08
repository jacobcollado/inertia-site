import Link from "next/link";
import { TOCSticky } from "@/app/blog/[slug]/toc";
import { FrameRule } from "@/components/page-frame";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";
import { PolicyText } from "./policy-text";

type Section = { id: string; title: string; body: string };

// A policy document, laid out like a blog post (app/blog/[slug]/page.tsx):
// one sheet with hairline rails, the title block centred in its own cell,
// the body opening below a rounded split with the same Contents bar, and a
// closing cell that leads to the next policy. Rails and splits show from sm
// up; on phones the sheet runs edge to edge, with plain hairlines instead.
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
      <article className="relative mx-auto w-full max-w-[56rem] bg-[var(--paper)] sm:rounded-b-[14px] sm:border-x sm:border-b sm:border-[rgb(var(--ink-rgb)/0.09)]">
        <header className="flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center sm:px-16 rise">
          <p className="text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))] tabular-nums">Effective {effective}</p>
          <h1 className="mt-5 text-[clamp(30px,5vw,54px)] font-medium tracking-[-0.04em] leading-[1.06] text-[rgb(var(--fg))] [text-wrap:balance]">
            {title}
          </h1>
          <p className="mt-5 max-w-lg text-[15px] sm:text-[18px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
            {meta.join(" · ")}
          </p>
        </header>

        <Split />

        <div className="px-6 sm:px-12">
          <TOCSticky headings={sections.map((s) => ({ id: s.id, text: s.title, level: 2 }))} />

          <div className="rise flex flex-col gap-14 pt-12 pb-8">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="mb-4 text-[19px] sm:text-[25px] font-medium tracking-tight text-[rgb(var(--fg))] [text-wrap:balance]">
                  {s.title}
                </h2>
                <p className="text-[15px] sm:text-[17px] leading-[1.75] sm:leading-[1.85] text-[rgb(var(--fg))] [text-wrap:pretty]">
                  <PolicyText text={s.body} self={self} />
                </p>
              </section>
            ))}
          </div>

          <div className="-mx-6 mt-12 sm:-mx-12">
            <Split flush />
          </div>

          {/* The closing cell: the next policy, the same full-width tile as a
              post's "Back home", and where to ask about any of it. */}
          <div className="flex flex-col items-center gap-5 pt-10 pb-16">
            <Link
              href={next.href}
              className={`flex w-full items-center justify-center ${ACTION_RADIUS_CLASS} px-3.5 py-3 text-[13px] tracking-tight text-[rgb(var(--muted))] bg-[var(--tile-2)] hover:bg-[var(--tile-3)] hover:text-[rgb(var(--fg))] transition-colors`}
            >
              Next: {next.label}
            </Link>
            <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]">
              Questions?{" "}
              <a href="mailto:hello@byinertia.com" className="text-[rgb(var(--fg))] hover:opacity-70 transition-opacity">
                hello@byinertia.com
              </a>
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}

// Where one cell ends and the next begins. From sm up, where the sheet has
// its rails, the rounded split; on phones, where it has none, a hairline.
// `flush` drops the gap height, for a split that sits between padded blocks.
function Split({ flush = false }: { flush?: boolean }) {
  return (
    <>
      <FrameRule tone="light" inset="-inset-x-px" className={flush ? "hidden sm:block" : "hidden h-[10px] sm:block"} />
      <div aria-hidden="true" className="h-px bg-[rgb(var(--ink-rgb)/0.09)] sm:hidden" />
    </>
  );
}
