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
  const title = `${piece.client} — Jacob Collado`;
  const description = piece.summary || `Case study: ${piece.client} by Jacob Collado.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary", title, description },
  };
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
    <main className="mx-auto w-full max-w-5xl px-8 pt-6 pb-16 sm:pt-8 sm:pb-24">
      {/* Nav */}
      <header
        className="flex items-center mb-16 rise"
        style={{}}
      >
        <Link
          href="/"
          className="text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← back
        </Link>
      </header>

      <article>
        {/* Hero */}
        <div
          className="rise"
          style={{ ["--rise-delay" as any]: "40ms" }}
        >
          <h1 className="text-5xl sm:text-6xl font-medium tracking-tighter leading-[1.0] text-[rgb(var(--fg))] mb-6">
            {piece.client}
          </h1>

          <div className="flex items-center gap-2 text-sm tracking-tight text-[rgb(var(--muted))]">
            {piece.year && <span className="tabular-nums">{piece.year}</span>}
            {piece.year && piece.role && <span aria-hidden="true">·</span>}
            {piece.role && <span>{piece.role}</span>}
          </div>
        </div>

        {/* Summary */}
        {piece.summary && (
          <p
            className="mt-10 text-lg sm:text-xl leading-[1.5] tracking-tight text-[rgb(var(--muted))] rise"
            style={{ ["--rise-delay" as any]: "80ms" }}
          >
            {piece.summary}
          </p>
        )}

        {/* Preview */}
        {piece.preview && (
          <div
            className="mt-10 overflow-hidden rounded-xl border border-[rgb(var(--line))] rise"
            style={{ ["--rise-delay" as any]: "0ms" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={piece.preview} alt={`${piece.client} site`} className="w-full h-auto" />
          </div>
        )}

        {/* Cover */}
        {piece.cover && (
          <div
            className="mt-10 overflow-hidden rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--line))]/20 aspect-[16/9] rise"
            style={{ ["--rise-delay" as any]: "0ms" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={piece.cover} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Body */}
        <div
          className="rise mt-12 space-y-5 text-base leading-relaxed tracking-tight text-[rgb(var(--fg))] [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-tighter [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:text-[rgb(var(--fg))] [&_h3]:text-base [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:mt-8 [&_h3]:mb-2 [&_p]:text-[rgb(var(--muted))] [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[rgb(var(--line))] hover:[&_a]:decoration-[rgb(var(--fg))] [&_img]:rounded-xl [&_img]:border [&_img]:border-[rgb(var(--line))] [&_img]:my-8 [&_img]:w-full"
          style={{ ["--rise-delay" as any]: "0ms" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      {/* Next project */}
      {next && next.slug !== slug && (
        <nav
          className="mt-20 rise"
          style={{ ["--rise-delay" as any]: "0ms" }}
        >
          <Link
            href={`/work/${next.slug}`}
            className="group flex items-center justify-between gap-6 transition-colors duration-300"
          >
            <div>
              <p className="text-xs tracking-tight text-[rgb(var(--muted))] mb-2">Next project</p>
              <span className="text-2xl font-medium tracking-tighter text-[rgb(var(--fg))]">
                {next.client}
              </span>
            </div>
            <span
              aria-hidden="true"
              className="text-xl text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </nav>
      )}
    </main>
  );
}
