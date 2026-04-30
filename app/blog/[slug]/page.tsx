import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOC } from "./toc";
import { ReadingProgress } from "./progress";
import { Highlighter } from "./highlighter";
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
  const title = `${post.title} - Jacob Collado`;
  const description =
    post.summary ||
    `A post by Jacob Collado, published ${formatDate(post.date)}.`;
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

  return (
    <main className="relative mx-auto w-full max-w-5xl px-8 pt-6 pb-16 text-lg sm:pt-8 sm:pb-20">
      <ReadingProgress />
      <TOC headings={headings} />

      <article className="mx-auto w-full max-w-3xl">
        <header className="mb-14">
          <div
            className="mb-10 flex items-center rise"
            style={{ ["--rise-delay" as any]: "0ms" }}
          >
            <Link
              href="/blog"
              className="text-sm tracking-tight text-[rgb(var(--muted))] transition-colors hover:text-[rgb(var(--fg))]"
            >
              {"<- back"}
            </Link>
          </div>

          <h1
            className="mb-2 text-2xl font-medium tracking-tighter rise sm:text-3xl"
            style={{ ["--rise-delay" as any]: "120ms" }}
          >
            {post.title}
          </h1>
          {post.subtitle && (
            <p
              className="mb-3 max-w-2xl text-lg italic leading-snug tracking-tight text-[rgb(var(--muted))] rise"
              style={{ ["--rise-delay" as any]: "160ms" }}
            >
              {post.subtitle}
            </p>
          )}
          <div
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm tabular-nums text-[rgb(var(--muted))] rise"
            style={{ ["--rise-delay" as any]: "200ms" }}
          >
            <span>{formatDate(post.date)}</span>
            <span aria-hidden="true">·</span>
            <span>{stats.minutes} min read</span>
            <span aria-hidden="true">·</span>
            <span>{stats.words.toLocaleString()} words</span>
          </div>
        </header>

        <div
          className="prose-custom rise space-y-5 leading-relaxed tracking-tight text-[rgb(var(--fg))] [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[rgb(var(--line))] hover:[&_a]:decoration-[rgb(var(--fg))] [&_code]:font-mono [&_code]:text-sm [&_h1]:mt-10 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-medium [&_h1]:tracking-tighter [&_h1]:scroll-mt-20 [&_h2]:mt-9 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-tighter [&_h2]:scroll-mt-20 [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:scroll-mt-20]"
          style={{ ["--rise-delay" as any]: "300ms" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      <Highlighter slug={slug} />

      <div className="mx-auto mt-12 flex w-full max-w-3xl justify-end">
        <a
          href="#"
          className="inline-flex items-center gap-2 text-sm tracking-tight text-[rgb(var(--muted))] transition-colors duration-200 hover:text-[rgb(var(--fg))]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
          Back to top
        </a>
      </div>
    </main>
  );
}
