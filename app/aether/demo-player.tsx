"use client";

import { useEffect, useRef, useState } from "react";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";
import { AETHER_LIQUID_EASE, AETHER_LIQUID_MS } from "./motion";

/* Pieces shared by the demo dialog and the demo section on the page: the
 * device toggle, the framed recording, and the button that hands off to the
 * live store.
 *
 * Shopify refuses to load storefronts inside another site (frame-ancestors
 * 'none'), so these play a screen recording of the demo store instead.
 */

export type DemoMode = "desktop" | "mobile";

const VIDEOS: Record<DemoMode, { src: string; poster: string; w: number; h: number }> = {
  desktop: { src: "/aether/demo/desktop.mp4", poster: "/aether/demo/desktop-poster.jpg", w: 1440, h: 902 },
  mobile: { src: "/aether/demo/mobile.mp4", poster: "/aether/demo/mobile-poster.jpg", w: 548, h: 1194 },
};

export function DemoToggle({
  mode,
  onChange,
  tone = "surface",
}: {
  mode: DemoMode;
  onChange: (m: DemoMode) => void;
  /** "surface" sits on the page, "bg" sits inside a surface panel. */
  tone?: "surface" | "bg";
}) {
  return (
    <div
      role="tablist"
      aria-label="Preview device"
      className={`relative grid grid-cols-2 rounded-[6px] p-1 ${
        tone === "bg" ? "bg-[rgb(var(--bg))]" : "bg-[rgb(var(--surface)/0.6)]"
      }`}
    >
      {/* The same white chip as the other segmented controls on /aether,
          sliding between the two options. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-[6px] shadow-[0_0_0_1px_rgb(var(--line)),0_1px_2px_rgb(0_0_0/0.06)] motion-reduce:transition-none ${
          tone === "bg" ? "bg-[rgb(var(--surface))]" : "bg-[rgb(var(--bg))]"
        }`}
        style={{
          transform: `translateX(${mode === "desktop" ? 0 : 100}%)`,
          transition: `transform ${AETHER_LIQUID_MS}ms ${AETHER_LIQUID_EASE}`,
        }}
      />
      {(["desktop", "mobile"] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          onClick={() => onChange(m)}
          className={`relative h-7 px-3 text-[13px] capitalize tracking-tight transition-colors [-webkit-tap-highlight-color:transparent] sm:h-8 sm:px-4 sm:text-[14px] ${
            mode === m ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

/**
 * The recording in a browser or phone frame. `load` gates the download so a
 * section can wait until it's near the viewport; `playing` lets it pause
 * once scrolled away.
 */
export function DemoFrame({
  mode,
  host,
  load = true,
  playing = true,
}: {
  mode: DemoMode;
  host: string;
  load?: boolean;
  playing?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const video = VIDEOS[mode];

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !load) return;
    if (playing) void el.play().catch(() => {});
    else el.pause();
  }, [playing, load, mode]);

  const player = (
    <video
      ref={videoRef}
      src={load ? video.src : undefined}
      poster={video.poster}
      width={video.w}
      height={video.h}
      muted
      loop
      playsInline
      preload={load ? "auto" : "none"}
      aria-label={`Screen recording of the Aether demo store on ${mode}`}
      className={mode === "desktop" ? "block h-auto w-full" : "block h-[min(62dvh,36rem)] w-auto rounded-[1.4rem]"}
    />
  );

  // Keyed by mode so each recording starts from the top and the frame fades
  // in fresh on a switch.
  return (
    <div key={mode} className="flex justify-center animate-in fade-in duration-500 motion-reduce:animate-none">
      {mode === "desktop" ? (
        <div className="w-full overflow-hidden rounded-[6px] bg-[rgb(var(--bg))] shadow-[0_0_0_1px_rgb(var(--line)),0_24px_48px_-24px_rgb(0_0_0/0.25)]">
          <div className="flex items-center gap-3 border-b border-[rgb(var(--line))] px-3 py-2">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-[rgb(var(--fg)/0.12)]" />
              <span className="size-2.5 rounded-full bg-[rgb(var(--fg)/0.12)]" />
              <span className="size-2.5 rounded-full bg-[rgb(var(--fg)/0.12)]" />
            </span>
            <span className="mx-auto truncate rounded-[6px] bg-[rgb(var(--surface))] px-3 py-0.5 text-[12px] tracking-tight text-[rgb(var(--muted))]">
              {host}
            </span>
            <span className="w-[2.625rem]" aria-hidden="true" />
          </div>
          {player}
        </div>
      ) : (
        // The one exception to the 6px radius: this draws a phone, and a
        // phone with square corners stops reading as one.
        <div className="overflow-hidden rounded-[1.75rem] bg-[rgb(var(--bg))] p-1.5 shadow-[0_0_0_1px_rgb(var(--line)),0_24px_48px_-24px_rgb(0_0_0/0.25)]">
          {player}
        </div>
      )}
    </div>
  );
}

/** Copies the store password, then opens the store (same tab on phones,
 * where a new tab is easy to lose). */
export function LiveStoreButton({ href, password }: { href: string; password: string }) {
  const [copied, setCopied] = useState(false);

  const openStore = async () => {
    try {
      await navigator.clipboard.writeText(password);
    } catch {}
    setCopied(true);
    window.setTimeout(() => {
      if (window.matchMedia("(max-width: 639px)").matches) {
        window.location.assign(href);
      } else {
        window.open(href, "_blank", "noreferrer");
      }
      setCopied(false);
    }, 900);
  };

  return (
    <button
      type="button"
      onClick={openStore}
      className={`inline-flex h-10 w-full items-center justify-center gap-1.5 ${ACTION_RADIUS_CLASS} border border-[rgb(var(--line))] bg-[rgb(var(--bg))] px-4 text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] transition-colors hover:border-[rgb(var(--fg)/0.4)] sm:w-auto [-webkit-tap-highlight-color:transparent]`}
    >
      {copied ? (
        <>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[0.85em] text-[rgb(var(--muted))]" aria-hidden="true">
            <polyline points="2 8 6 12 14 4" />
          </svg>
          <span className="text-[rgb(var(--muted))]">Password copied</span>
        </>
      ) : (
        <>
          Open the live store
          <span aria-hidden="true" className="text-[rgb(var(--muted))]">{"↗"}</span>
        </>
      )}
    </button>
  );
}

export function PasswordNote({ password, className = "" }: { password: string; className?: string }) {
  return (
    <p className={`text-[13px] tracking-tight text-[rgb(var(--muted))] sm:text-[14px] ${className}`}>
      Want to click around? Store password <span className="text-[rgb(var(--fg))]">{password}</span>, copied for you.
    </p>
  );
}

/** Pause and play for the looping recording. Autoplaying motion that runs
 * longer than a few seconds needs a way to stop it. */
export function PlayPauseButton({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={paused}
      className="inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2.5 text-[13px] tracking-tight text-[rgb(var(--muted))] transition-colors hover:bg-[rgb(var(--surface)/0.6)] hover:text-[rgb(var(--fg))] sm:text-[14px] [-webkit-tap-highlight-color:transparent]"
    >
      {paused ? (
        <svg viewBox="0 0 16 16" fill="currentColor" className="size-[0.9em]" aria-hidden="true">
          <path d="M4.5 2.8v10.4a.6.6 0 0 0 .9.5l8.2-5.2a.6.6 0 0 0 0-1L5.4 2.3a.6.6 0 0 0-.9.5Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" fill="currentColor" className="size-[0.9em]" aria-hidden="true">
          <rect x="3.5" y="2.5" width="3" height="11" rx="0.8" />
          <rect x="9.5" y="2.5" width="3" height="11" rx="0.8" />
        </svg>
      )}
      {paused ? "Play" : "Pause"}
    </button>
  );
}

export function hostOf(href: string) {
  return href.replace(/^https?:\/\//, "");
}
