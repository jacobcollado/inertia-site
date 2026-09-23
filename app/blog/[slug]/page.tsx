import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TOCInline } from "./toc";
import { Highlighter } from "./highlighter";
import { CopyURL } from "./copy-url";
import { PostGlyph, postTint } from "@/components/post-glyph";
import { PostCover, hasPostCover, postFigure } from "@/components/post-figures";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";
import {
  getAllPosts,
  getPost,
  formatDate,
  renderMarkdown,
  extractHeadings,
  readingStats,
} from "@/lib/posts";

const BODY_CLASSES = `px-0 pt-10 pb-8 rise prose-marker
  text-[15px] sm:text-[19px] leading-[1.75] sm:leading-[1.85] tracking-[0em] text-[rgb(var(--fg))]
  space-y-8
  [&_p]:[text-wrap:pretty] [&_li]:[text-wrap:pretty] [&_blockquote]:[text-wrap:pretty]
  [&_h2]:[text-wrap:balance] [&_h3]:[text-wrap:balance]
  [&_p:first-of-type]:text-[16px] sm:[&_p:first-of-type]:text-[20px] [&_p:first-of-type]:leading-[1.7] sm:[&_p:first-of-type]:leading-[1.8] [&_p:first-of-type]:text-[rgb(var(--fg))]
  [&_a]:text-blue-500 [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-blue-500/40 [&_a]:transition-colors hover:[&_a]:text-blue-400 hover:[&_a]:decoration-blue-400
  [&_strong]:font-medium [&_strong]:text-[rgb(var(--fg))]
  [&_em]:not-italic [&_em]:text-[rgb(var(--fg))] [&_em]:font-medium
  [&_mark]:bg-transparent [&_mark]:text-[rgb(var(--fg))] [&_mark]:font-medium [&_mark]:border-b [&_mark]:border-[rgb(var(--fg))/0.25] [&_mark]:pb-px
  [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:bg-[rgb(var(--line))/0.6] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
  [&_pre]:bg-[rgb(var(--line))/0.4] [&_pre]:rounded-lg [&_pre]:p-5 [&_pre]:overflow-x-auto [&_pre]:text-[0.875em]
  [&_blockquote]:border-l-[3px] [&_blockquote]:border-[rgb(var(--fg))/0.15] [&_blockquote]:pl-6 [&_blockquote]:text-[rgb(var(--muted))] [&_blockquote]:italic [&_blockquote]:text-[15px] sm:[&_blockquote]:text-[19px]
  [&_ul]:list-none [&_ul]:space-y-2
  [&_ul_li]:relative [&_ul_li]:pl-4 [&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:top-[0.75em] [&_ul_li]:before:h-px [&_ul_li]:before:w-2.5 [&_ul_li]:before:bg-[rgb(var(--muted))] [&_ul_li]:before:opacity-30 [&_ul_li]:before:content-['']
  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2
  [&_h2]:[font-family:'Satoshi',sans-serif] [&_h2]:text-[19px] sm:[&_h2]:text-[25px] [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:mt-16 [&_h2]:mb-4 [&_h2]:scroll-mt-24 [&_h2]:text-[rgb(var(--fg))]
  [&_h3]:[font-family:'Satoshi',sans-serif] [&_h3]:text-[16px] sm:[&_h3]:text-[20px] [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:scroll-mt-24
  [&_hr]:border-none [&_hr]:h-px [&_hr]:bg-[rgb(var(--line))] [&_hr]:my-14
  [&_table]:w-full [&_table]:text-[1rem] [&_th]:text-left [&_th]:pb-2 [&_th]:border-b [&_th]:border-[rgb(var(--line))] [&_th]:font-medium [&_td]:py-2 [&_td]:border-b [&_td]:border-[rgb(var(--line))/0.5]`;

function ArticleBody({ html, slug }: { html: string; slug: string }) {
  const parts = html.split(/(?=<h[23] id=")/);
  const rendered: React.ReactNode[] = [];

  parts.forEach((chunk, i) => {
    const idMatch = chunk.match(/^<h[23] id="([^"]+)"/);
    const headingId = idMatch?.[1];
    const sketch = headingId ? postFigure(slug, headingId) : null;

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
      {/* Single centred column: the TOC that used to occupy the left gutter
          now sits inline above the title. */}
      <div className="mx-auto w-full max-w-[48rem]">
        <article>

        {/* Collapsed contents tab, above the title */}
        <div className="px-0 pt-10 pb-6 rise">
          <TOCInline headings={headings} />
        </div>

        {/* Header */}
        <header className="px-0 pb-10 rise" style={{ ["--rise-delay" as any]: "40ms" }}>
          {/* clamp in px, not rem: the root is 15px, so rem values here read
              15/16ths of their number and made the scale hard to reason about
              against the index's px sizes. */}
          <h1 className="text-[clamp(26px,4.4vw,46px)] font-medium tracking-[-0.04em] leading-[1.08] text-[rgb(var(--fg))] mb-4 [text-wrap:balance]" style={{ fontFamily: "'Satoshi', sans-serif" }}>
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="text-[14px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-xl mb-7 [text-wrap:pretty]" style={{ fontFamily: "'Satoshi', sans-serif" }}>
              {post.subtitle}
            </p>
          )}

          {/* Dashed hairline between the subtitle and the byline. Drawn as a
              background gradient rather than border-top: a 1px dashed border
              renders as chunky 3px-on-3px segments with no way to tune them,
              where a repeating gradient lets the dash and gap be set
              independently and stay fine at this weight. */}
          <div
            className="flex items-center justify-between pt-5 bg-no-repeat bg-top"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, rgb(var(--line)) 0 4px, transparent 4px 8px)",
              backgroundSize: "100% 1px",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border border-[rgb(var(--line))] overflow-hidden shrink-0">
                {/* Source is a 1000x1000 square, so the portrait fills the
                    circle without a crop hint. Served at 2x for retina. */}
                <Image
                  src="/blog/author-jacob.png"
                  alt="Jacob Collado"
                  width={88}
                  height={88}
                  quality={75}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] sm:text-[15px] tracking-tight text-[rgb(var(--fg))]">Jacob Collado</span>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
                  <span>Founder, Inertia</span>
                  <span aria-hidden="true">/</span>
                  <span>{formatDate(post.date)}</span>
                  <span aria-hidden="true">/</span>
                  <span>{stats.minutes} min read</span>
                </div>
              </div>
            </div>
            <CopyURL />
          </div>
        </header>

        {/* Header cover: the post's own drawing on the shared tint (see
            PostCover), falling back to its glyph for a post without one. */}
        <div className="px-0 pb-10 rise" style={{ ["--rise-delay" as any]: "80ms" }}>
          <div
            className="relative w-full rounded-2xl overflow-hidden border border-[rgb(var(--line))] flex items-center justify-center"
            style={{
              aspectRatio: "1200/630",
              background: postTint(slug),
            }}
          >
            {hasPostCover(slug) ? (
              <PostCover slug={slug} />
            ) : (
              <PostGlyph slug={slug} tag={post.tag} className="w-28 h-28 sm:w-36 sm:h-36" />
            )}
          </div>
        </div>

        {/* Body */}
        <ArticleBody html={html} slug={slug} />

        <Highlighter slug={slug} />

        {/* Same dashed hairline as the byline rule above, drawn the same way
            and with matching dash/gap so the page opens and closes on the
            same mark. */}
        <div
          className="px-0 pt-6 pb-20 bg-no-repeat bg-top"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, rgb(var(--line)) 0 4px, transparent 4px 8px)",
            backgroundSize: "100% 1px",
          }}
        >
          {/* Full width of the article column, with the label centred: the
              CTA reads as the end of the post rather than a stray chip. */}
          <Link
            href="/"
            className={`flex w-full items-center justify-center ${ACTION_RADIUS_CLASS} px-3.5 py-3 text-[13px] tracking-tight text-[rgb(var(--muted))] bg-[#f1f1f1] hover:bg-[#e9e9e9] hover:text-[rgb(var(--fg))] transition-colors`}
          >
            Back home
          </Link>
        </div>

      </article>
        <div className="hidden xl:block" />
      </div>

    </main>
  );
}
