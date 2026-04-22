import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";
import { getAllPosts, formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing — Jacob Collado",
  description: "Thoughts on design, engineering, and building things.",
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-6 pb-16 sm:pt-8 sm:pb-20">
      <header
        className="flex items-center justify-between mb-16 rise"
        style={{ ["--rise-delay" as any]: "0ms" }}
      >
        <Link
          href="/"
          className="text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← back
        </Link>
        <ThemeToggle />
      </header>

      <div className="rise mb-12" style={{ ["--rise-delay" as any]: "80ms" }}>
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tighter leading-[1.0]">
          writing
        </h1>
      </div>

      {posts.length === 0 ? (
        <p
          className="text-sm tracking-tight text-[rgb(var(--muted))] rise"
          style={{ ["--rise-delay" as any]: "140ms" }}
        >
          Nothing yet.
        </p>
      ) : (
        <ul className="divide-y divide-[rgb(var(--line))] border-t border-[rgb(var(--line))]">
          {posts.map((post, i) => (
            <li
              key={post.slug}
              className="rise"
              style={{ ["--rise-delay" as any]: `${140 + i * 50}ms` }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group flex items-baseline justify-between gap-6 py-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2.5 mb-1">
                    <span className="fluid-link text-base font-medium tracking-tight text-[rgb(var(--fg))] truncate">
                      <span className="fluid-link__text">{post.title}</span>
                    </span>
                    {post.pinned && (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] px-2 pt-[3px] pb-[4px] text-[10.5px] tracking-tight leading-none">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[10px] w-[10px]" aria-hidden="true">
                          <path d="M12 17v5" />
                          <path d="M9 3h6l-1 5 3 3v2H7v-2l3-3-1-5Z" />
                        </svg>
                        pinned
                      </span>
                    )}
                    {!post.pinned && i === 0 && (
                      <span className="shrink-0 inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-2.5 pt-[3px] pb-[4px] text-[11px] font-medium tracking-tight leading-none">
                        new
                      </span>
                    )}
                  </div>
                  {post.subtitle && (
                    <p className="text-sm tracking-tight text-[rgb(var(--muted))] leading-snug line-clamp-1">
                      {post.subtitle}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-sm tracking-tight text-[rgb(var(--muted))] tabular-nums">
                  {formatDate(post.date)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
