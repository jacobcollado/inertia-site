import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOC } from "./toc";
import { ReadingProgress } from "./progress";
import { Highlighter } from "./highlighter";
import { CopyURL } from "./copy-url";
import {
  getAllPosts,
  getPost,
  formatDate,
  renderMarkdown,
  extractHeadings,
  readingStats,
} from "@/lib/posts";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  const title = `${post.title} — Inertia`;
  const description = post.summary || post.subtitle || `Published ${formatDate(post.date)}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.content);
  const headings = extractHeadings(post.content);
  const stats = readingStats(post.content);

  const allPosts = getAllPosts();
  const idx = allPosts.findIndex((p) => p.slug === slug);
  const prev = idx < allPosts.length - 1 ? allPosts[idx + 1] : null;
  const next = idx > 0 ? allPosts[idx - 1] : null;

  return (
    <main className="relative mx-auto w-full max-w-5xl pb-24 sm:pb-32">
      <ReadingProgress />
      <TOC headings={headings} />

      {/* Back nav */}
      <div className="px-8 py-5 rise" style={{ ["--rise-delay" as any]: "0ms" }}>
        <Link
          href="/blog"
          className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← Perspectives
        </Link>
      </div>

      <article>
        {/* Hero header — centered */}
        <header className="px-8 pt-8 pb-14 text-center rise" style={{ ["--rise-delay" as any]: "60ms" }}>
          <h1 className="text-[clamp(2.25rem,5.5vw,4rem)] font-medium tracking-[-0.04em] leading-[1.05] text-[rgb(var(--fg))] max-w-3xl mx-auto">
            {post.title}
          </h1>
        </header>

        {/* Meta bar — constrained to article width */}
        <div
          className="mx-auto max-w-2xl px-8 rise"
          style={{ ["--rise-delay" as any]: "120ms" }}
        >
        <div className="flex items-center justify-between gap-6 py-4 border-y border-[rgb(var(--line))]">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-[12px] tracking-tight text-[rgb(var(--muted))]">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 opacity-60" aria-hidden="true">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3.5l2 1" />
              </svg>
              {stats.minutes} min read
            </span>
            <CopyURL />
          </div>
          <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums">
            {formatDate(post.date)}
          </span>
        </div>
        </div>

        {/* Body */}
        <div
          className="mx-auto max-w-2xl px-8 pt-12 pb-8 rise
            text-[1.0625rem] leading-[1.8] tracking-tight text-[rgb(var(--fg))]
            space-y-6
            [&_a]:text-blue-500 [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-blue-500/40 [&_a]:transition-colors hover:[&_a]:text-blue-400 hover:[&_a]:decoration-blue-400
            [&_strong]:font-medium [&_strong]:text-[rgb(var(--fg))]
            [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:bg-[rgb(var(--line))/0.5] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
            [&_blockquote]:border-l-2 [&_blockquote]:border-[rgb(var(--line))] [&_blockquote]:pl-5 [&_blockquote]:text-[rgb(var(--muted))] [&_blockquote]:italic
            [&_ul]:list-none [&_ul]:space-y-2
            [&_ul_li]:relative [&_ul_li]:pl-4 [&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:top-[0.7em] [&_ul_li]:before:h-px [&_ul_li]:before:w-2 [&_ul_li]:before:bg-[rgb(var(--muted))] [&_ul_li]:before:opacity-40 [&_ul_li]:before:content-['']
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2
            [&_h2]:text-[1.3125rem] [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:mt-14 [&_h2]:mb-4 [&_h2]:scroll-mt-24
            [&_h3]:text-[1.0625rem] [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:scroll-mt-24
            [&_hr]:border-none [&_hr]:h-px [&_hr]:bg-[rgb(var(--line))] [&_hr]:my-12"
          style={{ ["--rise-delay" as any]: "200ms" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      <Highlighter slug={slug} />

      {/* Footer nav */}
      <footer className="mx-auto max-w-2xl px-8 pt-10 mt-8 border-t border-[rgb(var(--line))]">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 min-w-0">
            {prev && (
              <Link href={`/blog/${prev.slug}`} className="group flex flex-col gap-1">
                <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40">← Previous</span>
                <span className="text-[14px] font-medium tracking-tight text-[rgb(var(--fg))] group-hover:opacity-60 transition-opacity leading-snug line-clamp-2">
                  {prev.title}
                </span>
              </Link>
            )}
          </div>

          <a
            href="#"
            className="shrink-0 flex items-center gap-1.5 text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors mt-1"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
            Top
          </a>

          <div className="flex-1 min-w-0 text-right">
            {next && (
              <Link href={`/blog/${next.slug}`} className="group flex flex-col gap-1 items-end">
                <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40">Next →</span>
                <span className="text-[14px] font-medium tracking-tight text-[rgb(var(--fg))] group-hover:opacity-60 transition-opacity leading-snug line-clamp-2">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        </div>
      </footer>
    </main>
  );
}
