import React from "react";
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

// ai-capability-forecast: neural network / signal diagram
function SketchAI() {
  return (
    <svg viewBox="0 0 560 160" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <g stroke="rgb(var(--muted))" opacity="0.5">
        {[40, 80, 120].flatMap(y1 => [28, 64, 100, 136].map(y2 => (
          <line key={`i${y1}h${y2}`} x1="66" y1={y1} x2="184" y2={y2} strokeWidth="0.7" />
        )))}
        {[28, 64, 100, 136].flatMap(y1 => [40, 80, 120].map(y2 => (
          <line key={`h1${y1}h2${y2}`} x1="196" y1={y1} x2="314" y2={y2} strokeWidth="0.7" />
        )))}
        {[40, 80, 120].flatMap(y1 => [56, 104].map(y2 => (
          <line key={`h2${y1}o${y2}`} x1="326" y1={y1} x2="444" y2={y2} strokeWidth="0.7" />
        )))}
      </g>
      <g stroke="#60a5fa" strokeDasharray="5 3" strokeWidth="2">
        <line x1="66" y1="80" x2="184" y2="64" />
        <line x1="196" y1="64" x2="314" y2="80" />
        <line x1="326" y1="80" x2="444" y2="104" />
      </g>
      <g stroke="rgb(var(--muted))" strokeWidth="1.2" opacity="0.5">
        <circle cx="60"  cy="40"  r="6" /><circle cx="60"  cy="80"  r="6" /><circle cx="60"  cy="120" r="6" />
        <circle cx="190" cy="28"  r="6" /><circle cx="190" cy="64"  r="6" /><circle cx="190" cy="100" r="6" /><circle cx="190" cy="136" r="6" />
        <circle cx="320" cy="40"  r="6" /><circle cx="320" cy="80"  r="6" /><circle cx="320" cy="120" r="6" />
        <circle cx="450" cy="56"  r="6" /><circle cx="450" cy="104" r="6" />
      </g>
      <g fill="#60a5fa" stroke="none">
        <circle cx="60"  cy="80"  r="5" />
        <circle cx="190" cy="64"  r="5" />
        <circle cx="320" cy="80"  r="5" />
        <circle cx="450" cy="104" r="5" />
      </g>
      <g stroke="rgb(var(--muted))" strokeWidth="1.2" opacity="0.5">
        <line x1="456" y1="56"  x2="500" y2="56"  />
        <line x1="456" y1="104" x2="500" y2="104" />
        <polyline points="493,51 500,56 493,61" />
        <polyline points="493,99 500,104 493,109" />
      </g>
    </svg>
  );
}

function SketchTerminal() {
  return (
    <svg viewBox="0 0 560 160" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <circle cx="120" cy="80" r="6" fill="#34d399" stroke="none" />
      <path d="M 138 54 A 30 30 0 0 1 138 106" stroke="#34d399" strokeWidth="2" />
      <path d="M 158 36 A 50 50 0 0 1 158 124" stroke="#34d399" strokeWidth="1.4" opacity="0.6" />
      <path d="M 182 20 A 70 70 0 0 1 182 140" stroke="rgb(var(--muted))" strokeWidth="1" opacity="0.5" />
      <path d="M 210 8 A 90 90 0 0 1 210 152" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.3" />
      <line x1="120" y1="80" x2="460" y2="80" stroke="rgb(var(--muted))" strokeWidth="0.8" strokeDasharray="4 6" opacity="0.4" />
      <line x1="460" y1="64" x2="460" y2="96" stroke="rgb(var(--muted))" strokeWidth="1.5" opacity="0.5" />
      <line x1="470" y1="80" x2="496" y2="80" stroke="rgb(var(--muted))" strokeWidth="1.2" opacity="0.5" />
      <polyline points="488,73 496,80 488,87" stroke="rgb(var(--muted))" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

function SketchWave() {
  return (
    <svg viewBox="0 0 560 160" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="20" y1="80" x2="540" y2="80" stroke="rgb(var(--muted))" strokeWidth="0.8" strokeDasharray="3 5" opacity="0.4" />
      <path d="M 20 80 C 60 20 100 20 140 80 C 180 140 220 140 260 80 C 300 20 340 20 380 80 C 420 140 460 140 500 80 C 520 40 530 30 540 80" stroke="#fbbf24" strokeWidth="2" />
      <path d="M 20 80 C 50 50 90 50 120 80 C 150 110 190 110 220 80 C 250 50 290 50 320 80 C 350 110 390 110 420 80 C 450 50 490 50 520 80" stroke="rgb(var(--muted))" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
      <line x1="140" y1="20" x2="140" y2="80"  stroke="#fbbf24" strokeWidth="1.2" />
      <line x1="134" y1="20" x2="146" y2="20"  stroke="#fbbf24" strokeWidth="1.4" />
      <line x1="134" y1="80" x2="146" y2="80"  stroke="#fbbf24" strokeWidth="1.4" />
      <line x1="260" y1="80" x2="260" y2="140" stroke="#fbbf24" strokeWidth="1.2" />
      <line x1="254" y1="140" x2="266" y2="140" stroke="#fbbf24" strokeWidth="1.4" />
      <line x1="20"  y1="152" x2="260" y2="152" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.35" />
      <line x1="20"  y1="148" x2="20"  y2="156" stroke="rgb(var(--muted))" strokeWidth="1" opacity="0.35" />
      <line x1="260" y1="148" x2="260" y2="156" stroke="rgb(var(--muted))" strokeWidth="1" opacity="0.35" />
    </svg>
  );
}

const SLUG_SKETCHES: Record<string, () => React.ReactElement> = {
  "ai-capability-forecast": SketchAI,
  "hello-world": SketchTerminal,
};

function PostSketch({ slug }: { slug: string }) {
  const Sketch = SLUG_SKETCHES[slug] ?? SketchWave;
  return <Sketch />;
}

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
        <header className="px-8 pt-12 pb-8 text-center rise" style={{ ["--rise-delay" as any]: "60ms" }}>
          {/* Author byline — directly under title */}
          <div className="flex items-center justify-center gap-2 mb-7">
            <div className="w-5 h-5 rounded-full bg-[rgb(var(--line))] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-[rgb(var(--muted))]" aria-hidden="true">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <span className="text-[12px] tracking-tight text-[rgb(var(--muted))]">Jacob Collado</span>
            <span className="text-[rgb(var(--line))] text-[10px]">·</span>
            <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-60">Founder, Inertia</span>
          </div>

          <h1 className="text-[clamp(2.25rem,5.5vw,4rem)] font-medium tracking-[-0.04em] leading-[1.05] text-[rgb(var(--fg))] max-w-3xl mx-auto">
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="mt-5 text-[1.0625rem] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-xl mx-auto">
              {post.subtitle}
            </p>
          )}
        </header>

        {/* Meta bar */}
        <div className="mx-auto max-w-2xl px-8 rise" style={{ ["--rise-delay" as any]: "120ms" }}>
          <div className="flex items-center justify-between gap-6 py-3.5 border-y border-[rgb(var(--line))]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[12px] tracking-tight text-[rgb(var(--muted))]">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 opacity-50" aria-hidden="true">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 5v3.5l2 1" />
                </svg>
                {stats.minutes} min read
              </span>
              <CopyURL />
            </div>
            <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-60">
              {formatDate(post.date)}
            </span>
          </div>
        </div>

        {/* Article sketch */}
        <div className="mx-auto max-w-2xl px-8 pt-12 pb-4 rise" style={{ ["--rise-delay" as any]: "160ms" }}>
          <PostSketch slug={post.slug} />
        </div>

        {/* Body */}
        <div
          className="mx-auto max-w-2xl px-8 pt-10 pb-8 rise
            text-[1.0625rem] leading-[1.85] tracking-tight text-[rgb(var(--fg))]
            space-y-6
            [&_p:first-of-type]:text-[1.125rem] [&_p:first-of-type]:leading-[1.8] [&_p:first-of-type]:text-[rgb(var(--fg))]
            [&_a]:text-blue-500 [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-blue-500/40 [&_a]:transition-colors hover:[&_a]:text-blue-400 hover:[&_a]:decoration-blue-400
            [&_strong]:font-medium [&_strong]:text-[rgb(var(--fg))]
            [&_em]:text-[rgb(var(--muted))]
            [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:bg-[rgb(var(--line))/0.6] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
            [&_pre]:bg-[rgb(var(--line))/0.4] [&_pre]:rounded-lg [&_pre]:p-5 [&_pre]:overflow-x-auto [&_pre]:text-[0.875em]
            [&_blockquote]:border-l-[3px] [&_blockquote]:border-[rgb(var(--fg))/0.15] [&_blockquote]:pl-6 [&_blockquote]:text-[rgb(var(--muted))] [&_blockquote]:italic [&_blockquote]:text-[1.0625rem]
            [&_ul]:list-none [&_ul]:space-y-2
            [&_ul_li]:relative [&_ul_li]:pl-4 [&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:top-[0.75em] [&_ul_li]:before:h-px [&_ul_li]:before:w-2.5 [&_ul_li]:before:bg-[rgb(var(--muted))] [&_ul_li]:before:opacity-30 [&_ul_li]:before:content-['']
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2
            [&_h2]:text-[1.375rem] [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:mt-16 [&_h2]:mb-4 [&_h2]:scroll-mt-24 [&_h2]:text-[rgb(var(--fg))]
            [&_h3]:text-[1.0625rem] [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:scroll-mt-24
            [&_hr]:border-none [&_hr]:h-px [&_hr]:bg-[rgb(var(--line))] [&_hr]:my-14
            [&_table]:w-full [&_table]:text-[0.9375rem] [&_th]:text-left [&_th]:pb-2 [&_th]:border-b [&_th]:border-[rgb(var(--line))] [&_th]:font-medium [&_td]:py-2 [&_td]:border-b [&_td]:border-[rgb(var(--line))/0.5]"
          style={{ ["--rise-delay" as any]: "200ms" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      <Highlighter slug={slug} />

      <div className="mx-auto max-w-2xl px-8 pt-6 pb-16 flex items-center justify-end">
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
          Back to top
        </a>
      </div>
    </main>
  );
}
