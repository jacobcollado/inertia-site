import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Perspectives — Inertia",
  description: "How we think about design, engineering, and building things that last.",
};

const ICONS = [
  <svg key="tri" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8"><polygon points="20,5 37,35 3,35" fill="currentColor"/></svg>,
  <svg key="sq" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8"><rect x="4" y="4" width="32" height="32" fill="currentColor"/></svg>,
  <svg key="circ" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8"><circle cx="20" cy="20" r="16" fill="currentColor"/></svg>,
  <svg key="dia" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8"><polygon points="20,3 37,20 20,37 3,20" fill="currentColor"/></svg>,
  <svg key="pent" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8"><polygon points="20,3 37,14 31,34 9,34 3,14" fill="currentColor"/></svg>,
  <svg key="hex" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8"><polygon points="20,3 35,11.5 35,28.5 20,37 5,28.5 5,11.5" fill="currentColor"/></svg>,
];

function postIcon(index: number) {
  return ICONS[index % ICONS.length];
}

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="page-container mx-auto w-full max-w-5xl min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Nav */}
      <div className="flex items-center justify-between px-8 py-5 rise" style={{ ["--rise-delay" as any]: "0ms" }}>
        <Link href="/" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
          ← back
        </Link>
        <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] tabular-nums opacity-40">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </span>
      </div>

      {/* Header */}
      <div className="px-8 pt-6 pb-12 rise" style={{ ["--rise-delay" as any]: "60ms" }}>
        <h1 className="text-[clamp(2.2rem,5vw,3.75rem)] font-medium tracking-[-0.04em] leading-[1.0] text-[rgb(var(--fg))]">
          We write when<br />something's worth saying.
        </h1>
      </div>

      {/* Cards grid */}
      {posts.length === 0 ? (
        <p className="px-8 text-[13px] tracking-tight text-[rgb(var(--muted))]">Nothing yet.</p>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-[rgb(var(--line))] rise"
          style={{ ["--rise-delay" as any]: "120ms" }}
        >
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="blog-card group flex flex-col p-8 hover:bg-[rgb(var(--line))/0.1] transition-colors"
            >
              {/* Top row: icon + date */}
              <div className="flex items-start justify-between mb-8">
                <span className="text-[rgb(var(--fg))] opacity-90">
                  {postIcon(i)}
                </span>
                <span className="text-[12px] tabular-nums tracking-tight text-[rgb(var(--muted))] opacity-60 pt-1">
                  {formatDate(post.date)}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-[1.25rem] font-medium tracking-tight leading-snug text-[rgb(var(--fg))] mb-3 flex-1">
                {post.title}
              </h2>

              {/* Excerpt */}
              {(post.subtitle || post.summary) && (
                <p className="text-[13px] tracking-tight leading-relaxed text-[rgb(var(--muted))] line-clamp-4 mb-6">
                  {post.subtitle || post.summary}
                </p>
              )}

              {/* Bottom: tags / arrow */}
              <div className="flex items-center justify-between mt-auto pt-4">
                <div className="flex items-center gap-2">
                  {post.pinned && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] px-2 pt-[3px] pb-[4px] text-[10.5px] tracking-tight leading-none">
                      pinned
                    </span>
                  )}
                  {!post.pinned && i === 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-2.5 pt-[3px] pb-[4px] text-[10.5px] font-medium tracking-tight leading-none">
                      new
                    </span>
                  )}
                </div>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-[rgb(var(--muted))] opacity-0 group-hover:opacity-60 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}

    </main>
  );
}
