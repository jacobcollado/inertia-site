"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import type { Bonus } from "@/lib/bonuses";
import { useSetPageCrumb } from "../../page-crumb-context";

/* Rendered markdown, styled with descendant selectors since the HTML comes
 * from remark. A paragraph holding only images (the imagery references)
 * becomes a two-up grid. */
const BODY = [
  "text-[14.5px] leading-relaxed text-muted-foreground",
  "[&_h2]:scroll-mt-20 [&_h3]:scroll-mt-20 [&_h2]:mt-9 [&_h2]:mb-3 [&_h2]:text-[18px] [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-foreground [&>h2:first-child]:mt-0",
  "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[15px] [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:text-foreground",
  "[&_p]:my-3 [&_strong]:font-medium [&_strong]:text-foreground [&_em]:text-foreground",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1.5 [&_li]:pl-1",
  "[&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px]",
  "[&_p:has(>img)]:grid [&_p:has(>img)]:grid-cols-2 [&_p:has(>img)]:gap-2 [&_p:has(>img)]:my-5",
  "[&_img]:aspect-[4/5] [&_img]:w-full [&_img]:rounded-md [&_img]:object-cover",
].join(" ");

// Guides with three or more sections get one. The lists are a few entries
// long, so they scroll fine without it.
const TOC_MIN_SECTIONS = 3;

function TableOfContents({ headings }: { headings: Bonus["headings"] }) {
  const items = headings.filter((h) => h.level === 2 || h.level === 3);
  return (
    <nav aria-label="On this page" className="rounded-md bg-muted/40 px-4 py-3.5 sm:rounded-sm">
      <p className="text-[12px] font-medium text-muted-foreground">On this page</p>
      <ol className="mt-2 flex flex-col gap-1">
        {items.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-3.5" : undefined}>
            <a
              href={`#${h.id}`}
              className={
                h.level === 3
                  ? "text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  : "text-[13.5px] text-foreground/90 transition-colors hover:text-foreground"
              }
            >
              {h.text.replace(/\*\*/g, "")}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function BonusDetailView({ bonus }: { bonus: Bonus }) {
  useSetPageCrumb(bonus.title);
  const showToc = bonus.kind === "guide" && bonus.headings.filter((h) => h.level === 2).length >= TOC_MIN_SECTIONS;

  return (
    <div className="flex flex-col gap-4 w-full lg:max-w-[58%] mx-auto">
      <Link
        href="/dashboard/bonuses"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        All bonuses
      </Link>

      <article className="rounded-md border bg-sidebar px-5 py-6 sm:rounded-sm sm:px-8 sm:py-8">
        <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <span>{bonus.kind === "guide" ? "Guide" : "List"}</span>
          <span className="tabular-nums">Worth ${bonus.worth}</span>
        </p>
        <h1 className="mt-2 text-[22px] font-medium leading-tight tracking-tight sm:text-[26px]">{bonus.title}</h1>
        <p className="mt-1.5 text-[14.5px] text-muted-foreground">{bonus.summary}</p>
        <div className="my-6 border-t" />
        {showToc && (
          <div className="mb-8">
            <TableOfContents headings={bonus.headings} />
          </div>
        )}
        <div className={BODY} dangerouslySetInnerHTML={{ __html: bonus.html }} />
      </article>
    </div>
  );
}
