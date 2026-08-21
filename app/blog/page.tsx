"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

export default function BlogIndex() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((d) => {
      setPosts(d.posts ?? []);
      setLoaded(true);
    });
  }, []);

  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col px-3">

      <div className="pt-12 sm:pt-16" />

      {/* Grid */}
      {!loaded ? null : posts.length === 0 ? (
        <p className="px-6 sm:px-8 py-6 text-[13px] tracking-tight text-[rgb(var(--muted))]">Nothing here yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-3"
            >
              {/* Image */}
              <div
                className="w-full rounded-2xl overflow-hidden border border-[rgb(var(--line))] group-hover:border-[rgb(var(--fg)/0.2)] transition-colors"
                style={{ aspectRatio: "1200/630", background: "rgb(var(--surface))" }}
              >
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-30">No image</span>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  {post.tag && (
                    <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">{post.tag}</span>
                  )}
                  <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-40">{formatDate(post.date)}</span>
                </div>
                <p className="text-[18px] tracking-tight text-[rgb(var(--fg))] leading-snug font-normal group-hover:opacity-70 transition-opacity">
                  {post.title}
                </p>
                {(post.subtitle || post.summary) && (
                  <p className="text-[14px] tracking-tight leading-relaxed text-[rgb(var(--muted))] line-clamp-2" style={{ opacity: 0.55 }}>
                    {post.subtitle || post.summary}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

    </main>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
