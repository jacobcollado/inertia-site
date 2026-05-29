import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllWork, getWork, renderWorkMarkdown } from "@/lib/work";

export function generateStaticParams() {
  return getAllWork().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const piece = getWork(slug);
  if (!piece) return { title: "Not found" };
  const title = `${piece.client} - Inertia Work`;
  const description = piece.summary || `A project built by Inertia for ${piece.client}.`;
  const canonical = `https://byinertia.com/work/${slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: `${piece.client} - Inertia` }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

function serviceTag(s: string | undefined) {
  if (!s) return "";
  return s.replace(/^An?\s+/i, "").replace(/\s+for\s+.+$/i, "").trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const piece = getWork(slug);
  if (!piece) notFound();

  const html = await renderWorkMarkdown(piece.content);
  const all = getAllWork();
  const idx = all.findIndex((w) => w.slug === slug);
  const next = idx >= 0 ? all[(idx + 1) % all.length] : null;

  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Hero */}
      <section className="px-3 pt-16 sm:pt-24 pb-14 rise">
        <Link
          href="/work"
          className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors mb-10"
          style={{ opacity: 0.5 }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M13 8H3M7 4L3 8l4 4" />
          </svg>
          Work
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
          <div className="flex flex-col gap-4">
            {piece.logo && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={piece.logo} alt={piece.client} className="h-8 w-auto object-contain object-left" style={{ filter: "var(--logo-filter, none)" }} />
            )}
            <h1 className="text-[clamp(2.6rem,6vw,4rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))]">
              {piece.client}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              {piece.service && (
                <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] border border-[rgb(var(--line))] rounded-full px-2.5 pt-[3px] pb-[4px] leading-none">
                  {serviceTag(piece.service)}
                </span>
              )}
              {piece.year && (
                <span className="text-[12px] tabular-nums tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.4 }}>
                  {piece.year.match(/\d{4}/)?.[0]}
                </span>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 shrink-0">
            {piece.url && (
              <a
                href={piece.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight text-white hover:opacity-85 transition-opacity"
                style={{ background: "var(--accent-gradient)" }}
              >
                Visit site
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                  <path d="M4 12L12 4M7 4h5v5"/>
                </svg>
              </a>
            )}
            {piece.instagram && (
              <a
                href={`https://instagram.com/${piece.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line))] px-5 py-2.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
              >
                @{piece.instagram}
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Summary */}
      {piece.summary && (
        <>
          <section className="px-3 pt-12 sm:pt-16 pb-12 rise">
            <p className="text-[clamp(1.1rem,2vw,1.4rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-2xl" style={{ opacity: 0.8 }}>
              {piece.summary}
            </p>
          </section>
          <div className="grid-rule" aria-hidden="true" />
        </>
      )}

      {/* Cover image */}
      {piece.cover && (
        <>
          <section className="rise">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={piece.cover}
              alt={piece.client}
              className="w-full h-auto"
              style={{ display: "block" }}
            />
          </section>
          <div className="grid-rule" aria-hidden="true" />
        </>
      )}

      {/* Preview image */}
      {piece.preview && (
        <>
          <section className="rise">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={piece.preview}
              alt={`${piece.client} preview`}
              className="w-full h-auto"
              style={{ display: "block" }}
            />
          </section>
          <div className="grid-rule" aria-hidden="true" />
        </>
      )}

      {/* Markdown body */}
      {html && html.trim() !== "" && (
        <>
          <section className="px-3 py-12 sm:py-16 rise">
            <div
              className="text-[15px] leading-relaxed tracking-tight max-w-2xl space-y-5
                [&_h2]:text-[20px] [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-[rgb(var(--fg))]
                [&_h3]:text-[15px] [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[rgb(var(--fg))]
                [&_p]:text-[rgb(var(--muted))]
                [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[rgb(var(--line))] hover:[&_a]:decoration-[rgb(var(--fg))]
                [&_img]:w-full [&_img]:border [&_img]:border-[rgb(var(--line))] [&_img]:my-6"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </section>
          <div className="grid-rule" aria-hidden="true" />
        </>
      )}

      {/* Next project */}
      {next && next.slug !== slug && (
        <Link
          href={`/work/${next.slug}`}
          className="group flex items-center justify-between gap-6 px-3 py-10 hover:bg-[rgb(var(--fg)/0.02)] transition-colors rise"
        >
          <div className="flex flex-col gap-2">
            <p className="text-[12px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.4 }}>Next project</p>
            <span className="text-[clamp(1.4rem,3vw,2rem)] font-normal tracking-[-0.03em] text-[rgb(var(--fg))]">
              {next.client}
            </span>
            {next.service && (
              <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
                {serviceTag(next.service)}
              </span>
            )}
          </div>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[rgb(var(--muted))] opacity-30 group-hover:opacity-70 group-hover:translate-x-1 transition-all duration-200 shrink-0" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>
      )}

    </main>
  );
}
