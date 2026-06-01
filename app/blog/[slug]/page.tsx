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

const BODY_CLASSES = `px-0 pt-10 pb-8 rise
  text-[1.125rem] leading-[2.0] tracking-[0em] text-[rgb(var(--fg))]
  space-y-8
  [&_p:first-of-type]:text-[1.1875rem] [&_p:first-of-type]:leading-[1.85] [&_p:first-of-type]:text-[rgb(var(--fg))]
  [&_a]:text-blue-500 [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-blue-500/40 [&_a]:transition-colors hover:[&_a]:text-blue-400 hover:[&_a]:decoration-blue-400
  [&_strong]:font-medium [&_strong]:text-[rgb(var(--fg))]
  [&_em]:not-italic [&_em]:text-[rgb(var(--fg))] [&_em]:font-medium
  [&_mark]:bg-transparent [&_mark]:text-[rgb(var(--fg))] [&_mark]:font-medium [&_mark]:border-b [&_mark]:border-[rgb(var(--fg))/0.25] [&_mark]:pb-px
  [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:bg-[rgb(var(--line))/0.6] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
  [&_pre]:bg-[rgb(var(--line))/0.4] [&_pre]:rounded-lg [&_pre]:p-5 [&_pre]:overflow-x-auto [&_pre]:text-[0.875em]
  [&_blockquote]:border-l-[3px] [&_blockquote]:border-[rgb(var(--fg))/0.15] [&_blockquote]:pl-6 [&_blockquote]:text-[rgb(var(--muted))] [&_blockquote]:italic [&_blockquote]:text-[1.125rem]
  [&_ul]:list-none [&_ul]:space-y-2
  [&_ul_li]:relative [&_ul_li]:pl-4 [&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:top-[0.75em] [&_ul_li]:before:h-px [&_ul_li]:before:w-2.5 [&_ul_li]:before:bg-[rgb(var(--muted))] [&_ul_li]:before:opacity-30 [&_ul_li]:before:content-['']
  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2
  [&_h2]:[font-family:'Satoshi',sans-serif] [&_h2]:text-[1.5rem] [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:mt-16 [&_h2]:mb-4 [&_h2]:scroll-mt-24 [&_h2]:text-[rgb(var(--fg))]
  [&_h3]:[font-family:'Satoshi',sans-serif] [&_h3]:text-[1.1875rem] [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:scroll-mt-24
  [&_hr]:border-none [&_hr]:h-px [&_hr]:bg-[rgb(var(--line))] [&_hr]:my-14
  [&_table]:w-full [&_table]:text-[1rem] [&_th]:text-left [&_th]:pb-2 [&_th]:border-b [&_th]:border-[rgb(var(--line))] [&_th]:font-medium [&_td]:py-2 [&_td]:border-b [&_td]:border-[rgb(var(--line))/0.5]`;

const SECTION_SKETCHES: Record<string, React.ReactElement> = {
  "covid-and-the-shift-we-do-not-talk-about-enough": (
    <svg viewBox="0 0 480 96" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="24" y1="72" x2="456" y2="72" stroke="rgb(var(--muted))" strokeWidth="0.7" strokeDasharray="3 5" opacity="0.3" />
      <path d="M 24 70 L 190 69 L 210 68" stroke="rgb(var(--muted))" strokeWidth="1.6" opacity="0.35" />
      <path d="M 210 68 C 250 52 300 28 370 16 L 456 10" stroke="rgb(var(--blue))" strokeWidth="2.2" opacity="0.85" />
      <circle cx="210" cy="68" r="4.5" fill="rgb(var(--blue))" opacity="0.9" />
      <line x1="210" y1="68" x2="210" y2="80" stroke="rgb(var(--blue))" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
      <text x="30" y="86" fontSize="9.5" fill="rgb(var(--muted))" opacity="0.45" fontFamily="monospace">2019</text>
      <text x="196" y="86" fontSize="9.5" fill="rgb(var(--blue))" opacity="0.6" fontFamily="monospace">2020</text>
      <text x="370" y="86" fontSize="9.5" fill="rgb(var(--muted))" opacity="0.35" fontFamily="monospace">now</text>
      <polyline points="449,5 456,10 449,15" stroke="rgb(var(--blue))" strokeWidth="1.6" opacity="0.75" />
    </svg>
  ),
  "what-actually-kept-me-going": (
    <svg viewBox="0 0 480 96" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="24" y1="76" x2="456" y2="76" stroke="rgb(var(--muted))" strokeWidth="0.7" opacity="0.28" />
      {[52, 96, 148, 200, 252, 304, 356, 408].map((x, i) => {
        const heights = [12, 20, 15, 72, 22, 16, 11, 18];
        const h = heights[i];
        const accent = i === 3;
        return (
          <g key={x}>
            <rect x={x - 8} y={76 - h} width={16} height={h} rx="2"
              fill={accent ? "rgb(var(--green))" : "rgb(var(--muted))"}
              opacity={accent ? 0.85 : 0.28} />
          </g>
        );
      })}
    </svg>
  ),
  "where-i-am-now": (
    <svg viewBox="0 0 480 80" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="24" y1="54" x2="456" y2="54" stroke="rgb(var(--muted))" strokeWidth="0.8" opacity="0.3" />
      <path d="M 240 18 C 240 18 226 30 226 40 C 226 48 232.7 54 240 54 C 247.3 54 254 48 254 40 C 254 30 240 18 240 18 Z"
        fill="rgb(var(--green))" fillOpacity="0.18" stroke="rgb(var(--green))" strokeWidth="1.6" opacity="0.9" />
      <circle cx="240" cy="40" r="3.5" fill="rgb(var(--green))" opacity="0.85" />
    </svg>
  ),
  "the-current-plateau-is-misleading": (
    <svg viewBox="0 0 480 96" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="24" y1="72" x2="456" y2="72" stroke="rgb(var(--muted))" strokeWidth="0.6" strokeDasharray="3 5" opacity="0.22" />
      <path d="M 24 60 C 120 59 240 57 456 54" stroke="rgb(var(--muted))" strokeWidth="2" opacity="0.4" />
      <path d="M 24 68 C 100 60 200 42 320 26 C 380 18 430 13 456 10" stroke="rgb(var(--blue))" strokeWidth="2" strokeDasharray="5 3" opacity="0.8" />
      <text x="30" y="50" fontSize="9.5" fill="rgb(var(--muted))" opacity="0.5" fontFamily="monospace">visible</text>
      <text x="30" y="86" fontSize="9.5" fill="rgb(var(--blue))" opacity="0.7" fontFamily="monospace">interior</text>
      <polyline points="449,5 456,10 449,15" stroke="rgb(var(--blue))" strokeWidth="1.6" opacity="0.75" />
    </svg>
  ),
  "three-trajectories-id-bet-on": (
    <svg viewBox="0 0 480 96" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <line x1="24" y1="72" x2="456" y2="72" stroke="rgb(var(--muted))" strokeWidth="0.6" opacity="0.2" />
      <path d="M 60 68 C 180 60 300 28 448 10" stroke="rgb(var(--blue))" strokeWidth="2.2" opacity="0.85" />
      <path d="M 60 68 C 180 65 300 52 448 40" stroke="rgb(var(--green))" strokeWidth="2.2" opacity="0.8" />
      <path d="M 60 68 C 180 68 300 67 448 64" stroke="rgb(var(--amber))" strokeWidth="2.2" opacity="0.75" />
      <circle cx="60" cy="68" r="4" fill="rgb(var(--muted))" opacity="0.4" />
      <circle cx="448" cy="10" r="3.5" fill="rgb(var(--blue))" opacity="0.85" />
      <circle cx="448" cy="40" r="3.5" fill="rgb(var(--green))" opacity="0.8" />
      <circle cx="448" cy="64" r="3.5" fill="rgb(var(--amber))" opacity="0.75" />
    </svg>
  ),
};

function ArticleBody({ html }: { html: string }) {
  const parts = html.split(/(?=<h[23] id=")/);
  const rendered: React.ReactNode[] = [];

  parts.forEach((chunk, i) => {
    const idMatch = chunk.match(/^<h[23] id="([^"]+)"/);
    const headingId = idMatch?.[1];
    const sketch = headingId ? SECTION_SKETCHES[headingId] : null;

    if (sketch) {
      const firstPEnd = chunk.indexOf("</p>");
      if (firstPEnd !== -1) {
        const before = chunk.slice(0, firstPEnd + 4);
        const after = chunk.slice(firstPEnd + 4);
        rendered.push(
          <div key={`${i}a`} className={BODY_CLASSES} style={{ ["--rise-delay" as any]: "0ms" }} dangerouslySetInnerHTML={{ __html: before }} />,
          <div key={`${i}s`} className="px-0 py-6">{sketch}</div>,
          after.trim() && <div key={`${i}b`} className={BODY_CLASSES} style={{ ["--rise-delay" as any]: "0ms" }} dangerouslySetInnerHTML={{ __html: after }} />,
        );
        return;
      }
    }

    rendered.push(
      <div key={i} className={BODY_CLASSES} style={{ ["--rise-delay" as any]: "0ms" }} dangerouslySetInnerHTML={{ __html: chunk }} />
    );
  });

  return <>{rendered}</>;
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
  const title = `${post.title} - Inertia`;
  const description = post.summary || post.subtitle || `Published ${formatDate(post.date)}.`;
  const canonical = `https://byinertia.com/blog/${slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      publishedTime: post.date,
      images: [{ url: post.image ?? "/og.png", width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [post.image ?? "/og.png"] },
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
    <main className="relative mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] px-3">
      <ReadingProgress />

      <div className="xl:grid xl:grid-cols-[1fr_minmax(0,48rem)_1fr] xl:gap-8">
        {/* Left gutter — mobile TOC only */}
        <TOC headings={headings} />

        <article>

        {/* Back nav */}
        <div className="px-0 pt-10 pb-6 rise">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><path d="M13 8H3"/><path d="M7 4L3 8l4 4"/></svg>
            Writing & news
          </Link>
        </div>

        {/* Header */}
        <header className="px-0 pb-10 rise" style={{ ["--rise-delay" as any]: "40ms" }}>
          <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-medium tracking-[-0.04em] leading-[1.05] text-[rgb(var(--fg))] mb-5" style={{ fontFamily: "'Satoshi', sans-serif" }}>
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="text-[1.0625rem] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-xl mb-8" style={{ fontFamily: "'Satoshi', sans-serif" }}>
              {post.subtitle}
            </p>
          )}

          <div className="flex items-center justify-between pt-5 border-t border-[rgb(var(--line))]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--line))] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[rgb(var(--muted))]" aria-hidden="true">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] tracking-tight text-[rgb(var(--fg))]">Jacob Collado</span>
                <div className="flex items-center gap-1.5 text-[11px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.45 }}>
                  <span>Founder, Inertia</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDate(post.date)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{stats.minutes} min read</span>
                </div>
              </div>
            </div>
            <CopyURL />
          </div>
        </header>

        {/* Cover image */}
        {post.image && (
          <div className="px-0 pb-10 rise" style={{ ["--rise-delay" as any]: "80ms" }}>
            <div className="w-full rounded-2xl overflow-hidden border border-[rgb(var(--line))]" style={{ aspectRatio: "1200/630" }}>
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Body */}
        <ArticleBody html={html} />

        <Highlighter slug={slug} />

        <div className="px-0 pt-6 pb-20 flex items-center justify-between border-t border-[rgb(var(--line))]">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><path d="M13 8H3"/><path d="M7 4L3 8l4 4"/></svg>
            Writing & news
          </Link>
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

      </article>
        <div className="hidden xl:block" />
      </div>

    </main>
  );
}
