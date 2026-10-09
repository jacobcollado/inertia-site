"use client";

import Link from "next/link";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  AETHER_CHANGELOG,
  formatChangelogDate,
  type ChangelogEntry,
  type NoteType,
  type ReleaseLabel,
} from "@/lib/aether-changelog";
import { FrameRails, FrameRule } from "@/components/page-frame";
import { ACTION_RADIUS_CLASS, CTA_SHELL_HEIGHT_CLASS } from "@/lib/cta-chrome";
import { AETHER_LIQUID_EASE, AETHER_LIQUID_MS } from "../motion";
import { previousPath } from "@/lib/previous-path";

// Notes are grouped by type inside a release, in this order.
const TYPE_ORDER: NoteType[] = ["added", "improved", "fixed", "removed"];
const TYPE_LABEL: Record<NoteType, string> = {
  added: "Added",
  improved: "Improved",
  fixed: "Fixed",
  removed: "Removed",
};
const RELEASE_LABEL: Record<ReleaseLabel, string> = {
  major: "Major release",
  minor: "Minor release",
  patch: "Patch",
};

const LATEST = AETHER_CHANGELOG[0].version;

const noSubscribe = () => () => {};
// True when the visitor reached the changelog from /aether. False on the
// server, so a full load from /aether shows the link once hydrated.
const useFromAether = () =>
  useSyncExternalStore(noSubscribe, () => previousPath("/aether/changelog") === "/aether", () => false);

export default function AetherChangelog() {
  const [open, setOpen] = useState<string | null>(LATEST);
  const fromAether = useFromAether();
  const router = useRouter();

  // A link to one release (/aether/changelog#v1.4.0) opens that release.
  useEffect(() => {
    const v = window.location.hash.replace(/^#v/, "");
    if (AETHER_CHANGELOG.some((r) => r.version === v)) setOpen(v);
  }, []);

  const toggle = (v: string) => setOpen((o) => (o === v ? null : v));

  return (
    // Laid out in cells like /aether (components/page-frame.tsx): the
    // releases, then the way back to the theme.
    <main className="relative mx-auto w-full max-w-[80rem] min-h-screen flex flex-col px-3 sm:px-8">
      <FrameRails tone="light" />

      {/* The heading, one line and an index of versions on the left from lg
          up; the releases on the right, newest first and open. */}
      <section className="rise rise-stagger w-full pt-10 sm:pt-16 pb-16 sm:pb-24">
        <div className="grid w-full items-start gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20">
          <div className="lg:sticky lg:top-24">
            {/* Back to the theme, only for visitors who came from it: a chip
                in the release cards' fill and radius, tall enough to tap, the
                arrow leaning back on hover. Going back in history returns
                them to where they were on /aether. */}
            {fromAether && (
              <Link
                href="/aether"
                onClick={(e) => {
                  if (window.history.length > 1) {
                    e.preventDefault();
                    router.back();
                  }
                }}
                className="group inline-flex h-9 items-center gap-2 rounded-[6px] bg-[rgb(var(--surface)/0.45)] pl-3 pr-3.5 text-[14px] tracking-tight leading-none text-[rgb(var(--muted))] transition-colors hover:bg-[rgb(var(--surface)/0.8)] hover:text-[rgb(var(--fg))] [-webkit-tap-highlight-color:transparent]"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-[1em] transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none" aria-hidden="true">
                  <path d="M13 8H3M7 4L3 8l4 4" />
                </svg>
                Back to Aether
              </Link>
            )}
            <h1 className={`${fromAether ? "mt-6" : ""} text-[clamp(2.4rem,5vw,3.5rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))]`}>
              Changelog
            </h1>
            <p className="mt-3 max-w-sm text-[15.5px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
              Every update to Aether. Each one is free for life on every license.
            </p>

            <nav aria-label="Versions" className="mt-8 hidden flex-col lg:flex">
              {AETHER_CHANGELOG.map((r) => (
                <a
                  key={r.version}
                  href={`#v${r.version}`}
                  onClick={() => setOpen(r.version)}
                  className={`flex items-baseline justify-between gap-6 py-1.5 text-[16px] tracking-tight transition-colors duration-200 ${
                    open === r.version ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
                  }`}
                >
                  <span className="tabular-nums">v{r.version}</span>
                  <span className="text-[13px] tabular-nums text-[rgb(var(--muted))] opacity-70">
                    {formatChangelogDate(r.date)}
                  </span>
                </a>
              ))}
            </nav>
          </div>

          <ol className="flex min-w-0 flex-col gap-2">
            {AETHER_CHANGELOG.map((r) => (
              <Release key={r.version} release={r} open={open === r.version} onToggle={() => toggle(r.version)} />
            ))}
          </ol>
        </div>
      </section>

      <Split />

      <section className="rise rise-stagger w-full py-16 sm:py-24">
        <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-[1.1] text-[rgb(var(--fg))]">
          Not on Aether yet?
        </h2>
        <p className="mt-2 max-w-lg text-[15.5px] sm:text-[17px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
          Every update above lands in your Inertia dashboard. Nothing changes on your store until you choose to update.
        </p>
        <div className="mt-6 flex w-full max-w-sm gap-2">
          <Link
            href="/aether#pricing"
            // Same raised fill as the checkout's buy button (.cta-buy).
            className={`cta-buy flex-1 min-w-0 inline-flex items-center justify-center ${ACTION_RADIUS_CLASS} ${CTA_SHELL_HEIGHT_CLASS} px-3 sm:px-5 text-[16px] sm:text-[19px] font-medium tracking-tight leading-none`}
          >
            Get Aether
          </Link>
          <Link
            href="/aether"
            className={`flex-1 min-w-0 inline-flex items-center justify-center ${ACTION_RADIUS_CLASS} ${CTA_SHELL_HEIGHT_CLASS} border border-[rgb(var(--line))] px-3 sm:px-5 text-[16px] sm:text-[19px] font-medium tracking-tight leading-none text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.3)] transition-colors`}
          >
            Learn more
          </Link>
        </div>
      </section>

      {/* The page's last cell closes before the footer's. */}
      <Split className="py-10 sm:py-12" />
    </main>
  );
}

/* One release as a card (6px radius, surface fill, no border): the version,
 * its kind and date, and the summary, with a plus that turns into a close
 * mark. The notes open under it in place, grouped by type. Height animates
 * via grid rows (0fr to 1fr), same as the FAQ. */
function Release({ release: r, open, onToggle }: { release: ChangelogEntry; open: boolean; onToggle: () => void }) {
  const id = useId();
  const transition = `${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`;
  const groups = TYPE_ORDER.map((type) => ({ type, notes: r.notes.filter((n) => n.type === type) })).filter(
    (g) => g.notes.length > 0,
  );

  return (
    <li id={`v${r.version}`} className="rise-item scroll-mt-24 rounded-[6px] bg-[rgb(var(--surface)/0.45)]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="group flex w-full items-start justify-between gap-6 p-5 sm:p-6 text-left [-webkit-tap-highlight-color:transparent]"
      >
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="text-[19px] sm:text-[22px] tracking-tight leading-none tabular-nums text-[rgb(var(--fg))]">
              v{r.version}
            </span>
            {r.version === LATEST && (
              <span className="rounded-[6px] bg-[var(--tile)] px-2 py-1 text-[12px] sm:text-[13px] tracking-tight leading-none text-[rgb(var(--fg))]">
                Latest
              </span>
            )}
          </span>
          <span className="mt-2 block text-[13px] sm:text-[14px] tracking-tight tabular-nums text-[rgb(var(--muted))]">
            {RELEASE_LABEL[r.label]} · {formatChangelogDate(r.date)} · {r.notes.length} {r.notes.length === 1 ? "change" : "changes"}
          </span>
          <span className="mt-3 block max-w-2xl text-[15px] sm:text-[16px] leading-relaxed tracking-tight text-[rgb(var(--fg))] [text-wrap:pretty]">
            {r.summary}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-[rgb(var(--muted))] transition-colors group-hover:text-[rgb(var(--fg))] motion-reduce:transition-none"
          style={{ transform: open ? "rotate(45deg)" : "none", transition: `transform ${transition}` }}
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="size-3.5">
            <line x1="6" y1="1.5" x2="6" y2="10.5" />
            <line x1="1.5" y1="6" x2="10.5" y2="6" />
          </svg>
        </span>
      </button>

      <div
        id={id}
        role="region"
        aria-label={`v${r.version} changes`}
        className="grid motion-reduce:transition-none"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transition: `grid-template-rows ${transition}, opacity ${transition}`,
        }}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="flex flex-col gap-8 px-5 pb-6 sm:px-6 sm:pb-8">
            {groups.map(({ type, notes }) => (
              <div key={type}>
                <h3 className="flex items-baseline gap-2 text-[13px] sm:text-[14px] tracking-tight text-[rgb(var(--muted))]">
                  {TYPE_LABEL[type]}
                  <span className="tabular-nums opacity-70">{notes.length}</span>
                </h3>
                <ul className="mt-3 flex flex-col gap-4">
                  {notes.map((n) => (
                    <li key={n.title} className="max-w-2xl">
                      <p className="text-[15px] sm:text-[16px] tracking-tight leading-snug text-[rgb(var(--fg))]">{n.title}</p>
                      <p className="mt-1 text-[14px] sm:text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))] [text-wrap:pretty]">
                        {n.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

// A split between cells. The page pads its content in from the cell edges,
// so the split steps back out across that padding to meet the edges.
function Split({ className = "" }: { className?: string }) {
  return (
    <div className="-mx-3 sm:-mx-8">
      <FrameRule tone="light" className={className} />
    </div>
  );
}
