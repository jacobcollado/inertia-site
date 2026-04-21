"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { AboutCard } from "./about";
import { PastWork } from "./past-work";
import { WelcomeBack } from "./ambient";
import { NameHeader } from "./name-header";
import { VisualNotch } from "./visual-notch";
import { useViewMode } from "./view-mode-context";
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
    description: "A creative agency for design, brand, and motion.",
    href: "https://www.instagram.com/kayz.xyz/",
  },
  {
    name: "Aether Theme",
    description: "A high-end Shopify theme.",
    href: "/aether",
  },
];

export default function Home() {
  const { mode } = useViewMode();
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [work, setWork] = useState<WorkMeta[]>([]);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((d) => {
      setPosts(d.posts ?? []);
      setWork(d.work ?? []);
    });
  }, []);

  if (mode === "visual") {
    return <VisualLayout posts={posts} work={work} />;
  }
  return <TextLayout posts={posts} work={work} />;
}

/* ── Text layout (original) ─────────────────────────────────── */

function TextLayout({ posts, work }: { posts: PostMeta[]; work: WorkMeta[] }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-6 pb-16 sm:pt-8 sm:pb-20 min-h-screen flex flex-col">
      <VisualNotch />

      <header className="flex items-center justify-between mb-12 rise" style={{ ["--rise-delay" as any]: "0ms" }}>
        <NameHeader />
        <ThemeToggle />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-14">

        <div className="md:col-span-12 rise" style={{ ["--rise-delay" as any]: "100ms" }}>
          <AboutCard />
        </div>

        <div className="md:col-span-4 rise" style={{ ["--rise-delay" as any]: "180ms" }}>
          <h2 className="text-sm tracking-tight text-[rgb(var(--muted))] mb-5">Building</h2>
          <ul className="space-y-5">
            {BUILDING.map((item) => {
              const external = item.href.startsWith("http");
              const Cmp: any = external ? "a" : Link;
              const extra = external ? { target: "_blank", rel: "noreferrer" } : {};
              return (
                <li key={item.name}>
                  <Cmp href={item.href} {...extra} className="group block">
                    <div className="fluid-link text-base tracking-tight text-[rgb(var(--fg))] mb-1">
                      <span className="fluid-link__text">{item.name}</span>
                    </div>
                    <div className="text-sm tracking-tight text-[rgb(var(--muted))] leading-snug">{item.description}</div>
                  </Cmp>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="md:col-span-5 rise" style={{ ["--rise-delay" as any]: "240ms" }}>
          <h2 className="text-sm tracking-tight text-[rgb(var(--muted))] mb-5">Writing</h2>
          {posts.length === 0 ? (
            <p className="text-sm tracking-tight text-[rgb(var(--muted))]">No posts yet.</p>
          ) : (
            <ul className="space-y-5">
              {posts.map((post, i) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="group block">
                    <span className="flex items-baseline gap-2 mb-0.5">
                      <span className="fluid-link text-base tracking-tight text-[rgb(var(--fg))]">
                        <span className="fluid-link__text">{post.title}</span>
                      </span>
                      {post.pinned ? (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] px-2 pt-[3px] pb-[4px] text-[10.5px] tracking-tight leading-none translate-y-[-1px]">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[10px] w-[10px]" aria-hidden="true">
                            <path d="M12 17v5" />
                            <path d="M9 3h6l-1 5 3 3v2H7v-2l3-3-1-5Z" />
                          </svg>
                          Pinned
                        </span>
                      ) : i === 0 ? (
                        <span className="shrink-0 inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] px-2.5 pt-[3px] pb-[4px] text-[11px] font-medium tracking-tight leading-none translate-y-[-1px]">
                          New
                        </span>
                      ) : null}
                    </span>
                    <span className="text-sm tracking-tight text-[rgb(var(--muted))] tabular-nums">{formatDate(post.date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-3 rise flex flex-col gap-6" style={{ ["--rise-delay" as any]: "300ms" }}>
          <Link href="/now" className="group block">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm tracking-tight text-[rgb(var(--muted))]">Now</span>
              <span className="text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 text-sm">↗</span>
            </div>
            <p className="mt-1.5 text-base tracking-tight text-[rgb(var(--fg))] leading-snug">
              Finishing Aether. Building Aftertone.
            </p>
          </Link>
          <Link href="/contact" className="group block">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm tracking-tight text-[rgb(var(--muted))]">Contact</span>
              <span className="text-[rgb(var(--muted))] group-hover:text-[rgb(var(--fg))] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 text-sm">↗</span>
            </div>
            <p className="mt-1.5 text-base tracking-tight text-[rgb(var(--fg))] leading-snug">
              Open for work and collaborations.
            </p>
          </Link>
        </div>

        <div className="md:col-span-12 rise" style={{ ["--rise-delay" as any]: "360ms" }}>
          <h2 className="text-sm tracking-tight text-[rgb(var(--muted))] mb-5">Past work</h2>
          <PastWork work={work} />
        </div>

      </div>

      <footer className="mt-14 flex items-center justify-between gap-6 text-sm tracking-tight text-[rgb(var(--muted))] rise" style={{ ["--rise-delay" as any]: "440ms" }}>
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

/* ── Visual layout ───────────────────────────────────────────── */

function VisualLayout({ posts, work }: { posts: PostMeta[]; work: WorkMeta[] }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-20 pb-16 sm:pt-24 sm:pb-20 min-h-screen flex flex-col">
      <VisualNotch />

      {/* ThemeToggle stays top-right */}
      <div className="fixed top-[18px] right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Past work — leads the visual layout */}
      <section className="rise" style={{ ["--rise-delay" as any]: "60ms" }}>
        <h2 className="text-sm tracking-tight text-[rgb(var(--muted))] mb-6">Past work</h2>
        <PastWork work={work} />
      </section>

      {/* Two-col: bio left, sidebar right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-10 mt-16">

        <div className="md:col-span-7 rise" style={{ ["--rise-delay" as any]: "120ms" }}>
          <AboutCard />
        </div>

        <div className="md:col-span-5 rise flex flex-col gap-10" style={{ ["--rise-delay" as any]: "180ms" }}>

          {/* Building */}
          <div>
            <h2 className="text-sm tracking-tight text-[rgb(var(--muted))] mb-5">Building</h2>
            <ul className="space-y-5">
              {BUILDING.map((item) => {
                const external = item.href.startsWith("http");
                const Cmp: any = external ? "a" : Link;
                const extra = external ? { target: "_blank", rel: "noreferrer" } : {};
                return (
                  <li key={item.name}>
                    <Cmp href={item.href} {...extra} className="group block">
                      <div className="fluid-link text-base tracking-tight text-[rgb(var(--fg))] mb-1">
                        <span className="fluid-link__text">{item.name}</span>
                      </div>
                      <div className="text-sm tracking-tight text-[rgb(var(--muted))] leading-snug">{item.description}</div>
                    </Cmp>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Writing */}
          <div>
            <h2 className="text-sm tracking-tight text-[rgb(var(--muted))] mb-5">Writing</h2>
            {posts.length === 0 ? (
              <p className="text-sm tracking-tight text-[rgb(var(--muted))]">No posts yet.</p>
            ) : (
              <ul className="space-y-4">
                {posts.slice(0, 3).map((post, i) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="group block">
                      <span className="fluid-link text-base tracking-tight text-[rgb(var(--fg))]">
                        <span className="fluid-link__text">{post.title}</span>
                      </span>
                      <span className="block text-sm tracking-tight text-[rgb(var(--muted))] tabular-nums mt-0.5">{formatDate(post.date)}</span>
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
