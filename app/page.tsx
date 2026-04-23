"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AboutCard } from "./about";
import { PastWork } from "./past-work";
import { WelcomeBack } from "./ambient";
import type { WorkMeta } from "@/lib/work";
import type { PostMeta } from "@/lib/posts";

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const BUILDING = [
  {
    name: "Aftertone",
    description: "Creative agency. Design, brand, motion.",
    tag: "active",
    href: "https://www.instagram.com/kayz.xyz/",
  },
  {
    name: "Aether Theme",
    description: "High-end Shopify theme.",
    tag: "in progress",
    href: "/aether",
  },
];

export default function Home() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [work, setWork] = useState<WorkMeta[]>([]);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((d) => {
      setPosts(d.posts ?? []);
      setWork(d.work ?? []);
    });
  }, []);

  return <VisualLayout posts={posts} work={work} />;
}


function VisualLayout({ posts, work }: { posts: PostMeta[]; work: WorkMeta[] }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 sm:pb-20 min-h-screen flex flex-col">
      {/* Past work — leads the visual layout */}
      <section className="rise pt-16 sm:pt-20 md:pt-32" style={{ ["--rise-delay" as any]: "60ms" }}>
        <h2 className="text-sm tracking-tight text-[rgb(var(--muted))] mb-6">Past work</h2>
        <PastWork work={work} />
      </section>

      {/* Two-col: bio left, sidebar right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-10 mt-16">

        <div className="md:col-span-7 md:order-2 rise" style={{ ["--rise-delay" as any]: "120ms" }}>
          <AboutCard />
        </div>

        <div className="md:col-span-5 md:order-1 rise flex flex-col gap-10" style={{ ["--rise-delay" as any]: "180ms" }}>

          {/* Building */}
          <div>
            <h2 className="text-sm tracking-tight text-[rgb(var(--muted))] mb-4">Building</h2>
            <ul className="space-y-4">
              {BUILDING.map((item) => {
                const external = item.href.startsWith("http");
                const Cmp: any = external ? "a" : Link;
                const extra = external ? { target: "_blank", rel: "noreferrer" } : {};
                return (
                  <li key={item.name}>
                    <Cmp href={item.href} {...extra} className="group flex items-start justify-between gap-4">
                      <div>
                        <div className="fluid-link text-[15px] tracking-tight text-[rgb(var(--fg))] mb-0.5">
                          <span className="fluid-link__text">{item.name}</span>
                        </div>
                        <div className="text-[13px] tracking-tight text-[rgb(var(--muted))] leading-snug">{item.description}</div>
                      </div>
                      <span className="shrink-0 mt-0.5 text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-60">{item.tag}</span>
                    </Cmp>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Writing */}
          <div>
            <h2 className="text-sm tracking-tight text-[rgb(var(--muted))] mb-4">Writing</h2>
            {posts.length === 0 ? (
              <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]">Nothing yet.</p>
            ) : (
              <ul className="space-y-4">
                {posts.slice(0, 3).map((post, i) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="group flex items-start justify-between gap-4">
                      <div>
                        <div className="fluid-link text-[15px] tracking-tight text-[rgb(var(--fg))] mb-1.5">
                          <span className="fluid-link__text">{post.title}</span>
                        </div>
                        <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] tabular-nums">{formatDate(post.date)}</span>
                      </div>
                      {i === 0 && (
                        <span className="shrink-0 mt-0.5 inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-2.5 pt-[3px] pb-[4px] text-[10.5px] font-medium tracking-tight leading-none">
                          new
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>

      <footer className="mt-14 flex items-center justify-between gap-6 text-sm tracking-tight text-[rgb(var(--muted))] rise" style={{ ["--rise-delay" as any]: "260ms" }}>
        <WelcomeBack />
        <a href="https://www.instagram.com/kayz.xyz/" target="_blank" rel="noreferrer" aria-label="Instagram — @kayz.xyz" className="inline-flex items-center gap-[3px] hover:text-[rgb(var(--fg))] transition-colors ml-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px]" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
          </svg>
          kayz.xyz
        </a>
      </footer>
    </main>
  );
}
