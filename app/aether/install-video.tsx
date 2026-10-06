"use client";

import { useState } from "react";

// The install walkthrough (unlisted on YouTube), next to the checkout button
// so "how hard is setup?" gets answered at the moment of deciding. Starts as
// a small row with the video's thumbnail; tapping it swaps in the player in
// place. Nothing loads from YouTube until then, and the embed uses the
// no-cookie domain (allowed in next.config.mjs's frame-src).

const VIDEO_ID = "HupTjcFMU08";

export function InstallVideo() {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="overflow-hidden rounded-[6px] bg-black" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title="How to install Aether"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="block h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group flex w-full items-center gap-3 rounded-[6px] border border-[rgb(var(--line))] p-2 pr-4 text-left transition-colors hover:border-[rgb(var(--fg)/0.25)]"
    >
      <span className="relative h-12 w-[85px] shrink-0 overflow-hidden rounded-[4px] bg-[rgb(var(--surface))]">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote thumbnail, tiny, lazy */}
        <img
          src={`https://i.ytimg.com/vi/${VIDEO_ID}/mqdefault.jpg`}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
          <svg viewBox="0 0 16 16" className="size-4 text-white" fill="currentColor" aria-hidden="true">
            <path d="M5 3.5v9l7.5-4.5Z" />
          </svg>
        </span>
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--fg))]">See how install works</span>
        <span className="block text-[13px] tracking-tight text-[rgb(var(--muted))]">A quick walkthrough, start to live store</span>
      </span>
    </button>
  );
}
