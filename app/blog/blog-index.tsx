"use client";

import Link from "next/link";
import { useState } from "react";
import { MaterialCover } from "@/components/post-covers";
import { useMounted } from "@/hooks/use-mounted";

// The journal index, in the homepage's language: every post is its monoline
// cover on the tile with its title set inside, like the Our thoughts cards.
// The newest post (in the chosen topic) leads a bento, large on the left
// with the next two stacked beside it in the same 7/5 split as the
// execution bento; everything after runs in a grid of cards. A topic filter
// narrows the set, and the bento re-forms around whatever's left. No dates:
// the list reads as a body of thinking, not a feed.

export type BlogCard = { slug: string; title: string; tag?: string; line?: string };

const EASE = "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

function Tag({ tag }: { tag?: string }) {
  if (!tag) return null;
  return (
    <span className="block text-[13px] tracking-tight" style={{ color: "var(--ink-3)" }}>
      {tag}
    </span>
  );
}

// A bento cell: cover filling the top, the text along the bottom. The lead
// shows its line; the stacked two reveal theirs on hover, like the grid.
function Cell({ post, lead, className = "" }: { post: BlogCard; lead?: boolean; className?: string }) {
  const mounted = useMounted();
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-[6px] bg-[var(--tile)] ${className}`}
    >
      {/* The whole drawing, fitted into whatever shape the cell gives it. */}
      <div className={`relative aspect-[16/9] w-full transition-transform ${EASE} lg:aspect-auto lg:min-h-0 lg:flex-1 [@media(hover:hover)]:group-hover:-translate-y-3 group-focus-visible:-translate-y-3`}>
        {mounted && <MaterialCover slug={post.slug} fit />}
      </div>
      <div className={`relative ${lead ? "p-6 sm:p-8" : "p-5 sm:p-6"}`}>
        <Tag tag={post.tag} />
        <h2
          className={`mt-1.5 text-balance tracking-[-0.025em] ${lead ? "text-[24px] leading-[1.1] sm:text-[32px]" : "text-[21px] leading-[1.15] sm:text-[22px]"}`}
          style={{ color: "var(--ink)", fontWeight: 450 }}
        >
          {post.title}
        </h2>
        {post.line &&
          (lead ? (
            <p className="mt-3 max-w-lg text-pretty text-[15px] leading-relaxed tracking-tight sm:text-[17px]" style={{ color: "var(--ink-2)" }}>
              {post.line}
            </p>
          ) : (
            <Reveal line={post.line} />
          ))}
      </div>
    </Link>
  );
}

// The line under a card's title: always shown on touch screens, opened on
// hover where there is one.
function Reveal({ line }: { line: string }) {
  return (
    <div className={`grid grid-rows-[1fr] transition-[grid-template-rows] ${EASE} [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]`}>
      <p className="overflow-hidden">
        <span
          className={`line-clamp-2 pt-2 text-pretty text-[14px] leading-snug tracking-tight transition-[opacity,transform] ${EASE} sm:text-[15px] [@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:delay-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100`}
          style={{ color: "var(--ink-3)" }}
        >
          {line}
        </span>
      </p>
    </div>
  );
}

// The grid card, the same as the homepage's Our thoughts card: the cover in
// the top of a square tile, lifting on hover to make room for the line.
function Card({ post }: { post: BlogCard }) {
  const mounted = useMounted();
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-[6px] bg-[var(--tile)] sm:aspect-square"
    >
      {/* Centred in the room the text leaves it, gliding up with its middle
          as the line opens. */}
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-x-0 top-1/2 aspect-[4/3] -translate-y-1/2">
          {mounted && <MaterialCover slug={post.slug} />}
        </div>
      </div>
      <div className="relative p-5 sm:p-6">
        <Tag tag={post.tag} />
        <h2 className="mt-1.5 text-balance text-[21px] leading-[1.15] tracking-[-0.025em] sm:text-[22px]" style={{ color: "var(--ink)", fontWeight: 450 }}>
          {post.title}
        </h2>
        {post.line && <Reveal line={post.line} />}
      </div>
    </Link>
  );
}

export function BlogIndex({ posts }: { posts: BlogCard[] }) {
  const topics = ["All", ...Array.from(new Set(posts.map((p) => p.tag).filter((t): t is string => Boolean(t))))];
  const [topic, setTopic] = useState("All");
  const shown = topic === "All" ? posts : posts.filter((p) => p.tag === topic);
  const [lead, ...rest] = shown;
  const side = rest.slice(0, 2);
  const more = rest.slice(2);

  return (
    <main className="mx-auto w-full max-w-[80rem] px-6 pb-24 pt-12 sm:px-8 sm:pt-20">
      <header className="mb-8 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h1 className="text-[clamp(1.8rem,3vw,2.5rem)] leading-[1.1] tracking-[-0.03em]" style={{ color: "var(--ink)", fontWeight: 450 }}>
            Our thoughts
          </h1>
          <p className="mt-3 text-pretty text-[16.5px] leading-relaxed tracking-tight sm:mt-4 sm:text-[19px]" style={{ color: "var(--ink-2)" }}>
            Essays on design, standards and judgment: the details people feel before they notice.
          </p>
        </div>
        {topics.length > 2 && (
          <div
            role="radiogroup"
            aria-label="Topic"
            className="no-scrollbar -mx-6 flex shrink-0 overflow-x-auto px-6 sm:mx-0 sm:px-0"
          >
            <div className="inline-flex gap-0.5 rounded-[8px] p-0.5" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--ink-rgb) / 0.1)" }}>
              {topics.map((t) => {
                const on = t === topic;
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setTopic(t)}
                    className="whitespace-nowrap rounded-[6px] px-3 py-1.5 text-[14px] tracking-tight transition-colors duration-150"
                    style={{ background: on ? "rgb(var(--ink-rgb) / 0.08)" : "transparent", color: on ? "var(--ink)" : "var(--ink-3)" }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {!lead ? (
        <p className="text-[15px] tracking-tight" style={{ color: "var(--ink-3)" }}>Nothing here yet.</p>
      ) : (
        <>
          {/* Keyed on the topic so the set re-forms cleanly when it changes. */}
          <div
            key={topic}
            className={`grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12 ${side.length === 2 ? "lg:grid-rows-[repeat(2,20rem)]" : "lg:grid-rows-[40rem]"}`}
          >
            <Cell post={lead} lead className={`sm:col-span-2 ${side.length ? "lg:col-span-7" : "lg:col-span-12"} ${side.length === 2 ? "lg:row-span-2" : ""}`} />
            {side.map((p) => (
              <Cell key={p.slug} post={p} className={`lg:col-span-5 ${side.length === 1 ? "sm:col-span-2" : ""}`} />
            ))}
          </div>

          {more.length > 0 && (
            <ul key={`${topic}-more`} className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {more.map((p) => (
                <li key={p.slug}>
                  <Card post={p} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
