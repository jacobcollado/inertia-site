"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AETHER_CHANGELOG,
  formatChangelogDate,
  type NoteType,
  type ReleaseLabel,
} from "@/lib/aether-changelog";

const TYPE_META: Record<NoteType, { label: string; color: string; bg: string }> = {
  added:    { label: "Added",    color: "rgb(var(--green))",  bg: "rgb(var(--green) / 0.08)"  },
  improved: { label: "Improved", color: "rgb(var(--accent))", bg: "rgb(var(--accent) / 0.08)" },
  fixed:    { label: "Fixed",    color: "rgb(var(--amber))",  bg: "rgb(var(--amber) / 0.08)"  },
  removed:  { label: "Removed",  color: "rgb(var(--muted))",  bg: "rgb(var(--muted) / 0.08)"  },
};

const LABEL_META: Record<ReleaseLabel, { label: string; color: string; bg: string }> = {
  major: { label: "Major", color: "rgb(var(--fg))",    bg: "rgb(var(--fg) / 0.1)"    },
  minor: { label: "Minor", color: "rgb(var(--muted))", bg: "rgb(var(--fg) / 0.05)"   },
  patch: { label: "Patch", color: "rgb(var(--muted))", bg: "rgb(var(--fg) / 0.05)"   },
};

export default function AetherChangelog() {
  const [open, setOpen] = useState<string | null>(AETHER_CHANGELOG[0].version);

  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[88rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Back nav */}
      <div className="px-3 pt-6 pb-2 rise">
        <Link
          href="/aether"
          className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M13 8H3M7 4L3 8l4 4" />
          </svg>
          Aether
        </Link>
      </div>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-3 pt-10 sm:pt-16 pb-14 rise">
        <h1 className="text-[clamp(2.6rem,6vw,4rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-4">
          Changelog
        </h1>
        <p className="text-[clamp(1rem,1.8vw,1.15rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm" style={{ opacity: 0.7 }}>
          Every update to Aether, documented.
        </p>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Releases */}
      <section className="rise px-3 pt-2">
        <div className="flex flex-col">
          {AETHER_CHANGELOG.map((entry, ei) => {
            const isOpen = open === entry.version;
            const lm = LABEL_META[entry.label];
            const noteCount = entry.notes.length;

            return (
              <div key={entry.version} id={`v${entry.version}`} className="scroll-mt-20 border-b border-[rgb(var(--line))]">

                {/* Row header */}
                <button
                  className="w-full flex items-start sm:items-center gap-4 sm:gap-6 py-7 sm:py-8 text-left [-webkit-tap-highlight-color:transparent] group"
                  onClick={() => setOpen(isOpen ? null : entry.version)}
                >
                  {/* Left: version + badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shrink-0 sm:min-w-[200px]">
                    <span className="text-[18px] sm:text-[20px] font-semibold tracking-tight tabular-nums text-[rgb(var(--fg))] leading-none">
                      v{entry.version}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-medium tracking-tight px-2.5 py-1 rounded-full"
                        style={{ background: lm.bg, color: lm.color }}
                      >
                        {lm.label}
                      </span>
                      {ei === 0 && (
                        <span className="text-[11px] font-medium tracking-tight px-2.5 py-1 rounded-full bg-[rgb(var(--accent))] text-[rgb(var(--bg))]">
                          Latest
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center: summary + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] leading-relaxed tracking-tight text-[rgb(var(--fg))]" style={{ opacity: 0.65 }}>
                      {entry.summary}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[12px] tabular-nums tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
                        {formatChangelogDate(entry.date)}
                      </span>
                      <span className="text-[rgb(var(--line))]" aria-hidden="true">·</span>
                      <span className="text-[12px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
                        {noteCount} {noteCount === 1 ? "change" : "changes"}
                      </span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <div className="shrink-0 flex items-center self-center ml-auto sm:ml-0">
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-200"
                      style={{ background: isOpen ? "rgb(var(--fg) / 0.07)" : "transparent" }}
                    >
                      <svg
                        viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"
                        className="w-3.5 h-3.5 text-[rgb(var(--muted))] shrink-0 transition-transform duration-300"
                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        aria-hidden="true"
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                    </span>
                  </div>
                </button>

                {/* Expanded notes */}
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: isOpen ? `${noteCount * 200}px` : "0px",
                    opacity: isOpen ? 1 : 0,
                    transition: "max-height 420ms cubic-bezier(0.22,1,0.36,1), opacity 280ms ease",
                  }}
                >
                  <div className="flex flex-col pb-8">
                    {entry.notes.map((note, i) => {
                      const tm = TYPE_META[note.type];
                      return (
                        <div key={i} className="flex flex-col gap-1 py-4 border-t border-[rgb(var(--line))] first:border-t-0">
                          <div className="flex items-baseline gap-2.5">
                            <span className="text-[11px] font-medium tracking-tight shrink-0 w-16" style={{ color: tm.color }}>
                              {tm.label}
                            </span>
                            <span className="text-[14px] font-medium tracking-tight text-[rgb(var(--fg))] leading-snug">
                              {note.title}
                            </span>
                          </div>
                          <p className="text-[13px] leading-relaxed tracking-tight text-[rgb(var(--muted))] pl-[4.5rem]" style={{ opacity: 0.75 }}>
                            {note.detail}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      <div className="grid-rule mt-2" aria-hidden="true" />

      {/* CTA */}
      <section className="flex flex-col items-center text-center px-3 py-16 sm:py-24 gap-5 rise">
        <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-normal tracking-[-0.03em] leading-none text-[rgb(var(--fg))]">
          Not on Aether yet?
        </p>
        <p className="text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-sm" style={{ opacity: 0.6 }}>
          Every update above ships to your store automatically when you renew. No manual installs.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <Link
            href="/aether/buy"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-80 transition-opacity"
          >
            Get Aether
          </Link>
          <Link
            href="/aether"
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line))] px-5 py-2.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
          >
            Learn more
          </Link>
        </div>
      </section>

    </main>
  );
}
