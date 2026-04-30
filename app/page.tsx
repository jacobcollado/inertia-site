"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AboutCard } from "./about";
import { PastWork } from "./past-work";
import { WelcomeBack } from "./ambient";
import { SoundwaveHero } from "./soundwave-hero";
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
    name: "Inertia",
    description: "We turn your vision into something real.",
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


function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}

function VisualLayout({ posts, work }: { posts: PostMeta[]; work: WorkMeta[] }) {
  return (
    <main className="page-container mx-auto w-full max-w-5xl pb-16 sm:pb-20 min-h-screen flex flex-col">

      {/* Soundwave hero — touches both grid lines */}
      <SoundwaveHero />

      {/* Past work — label padded, work-list spans edge to edge */}
      <section className="rise pt-8 pb-16" style={{ ["--rise-delay" as any]: "60ms" }}>
        <h2 className="px-8 text-sm tracking-tight text-[rgb(var(--muted))] mb-6">Past work</h2>
        <PastWork work={work} />
      </section>

      <GridRule />

      {/* Shipping + Thoughts | About */}
      <div className="flex flex-col md:flex-row py-16 gap-y-12 md:gap-y-0 overflow-visible">

        {/* Left: shipping + thoughts */}
        <div className="px-8 md:w-5/12 rise flex flex-col gap-10 md:pr-10" style={{ ["--rise-delay" as any]: "120ms" }}>

          <div>
            <h2 className="text-sm tracking-tight text-[rgb(var(--muted))] mb-4">What we're shipping</h2>
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

          <div>
            <div className="flex items-baseline justify-between gap-6 mb-4">
              <h2 className="text-sm tracking-tight text-[rgb(var(--muted))]">Thoughts</h2>
              <Link href="/blog" className="text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">all posts →</Link>
            </div>
            {posts.length === 0 ? (
              <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]">Nothing yet.</p>
            ) : (
              <ul className="space-y-4">
                {posts.slice(0, 3).map((post, i) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="group flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="fluid-link text-[15px] tracking-tight text-[rgb(var(--fg))]">
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

        {/* Internal vertical divider — only visible on md+ */}
        <div className="inner-divider hidden md:block shrink-0" aria-hidden="true" />

        {/* Right: about */}
        <div className="px-8 md:w-7/12 rise md:pl-10" style={{ ["--rise-delay" as any]: "180ms" }}>
          <AboutCard />
        </div>

      </div>

      <GridRule />

      <footer className="px-8 py-8 flex items-center justify-between gap-6 text-sm tracking-tight text-[rgb(var(--muted))] rise" style={{ ["--rise-delay" as any]: "260ms" }}>
        <WelcomeBack />
        <a href="https://www.instagram.com/inertia.dev/" target="_blank" rel="noreferrer" aria-label="Instagram — @inertia.dev" className="inline-flex items-center gap-[3px] hover:text-[rgb(var(--fg))] transition-colors ml-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[14px] w-[14px]" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
          </svg>
          inertia.dev
        </a>
      </footer>

    </main>
  );
}
