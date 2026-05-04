"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

function BackToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="group flex items-center gap-2 text-[12px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
    >
      <span
        className="flex items-center justify-center w-6 h-6 border border-[rgb(var(--line))] group-hover:border-[rgb(var(--fg))/0.3] transition-colors"
        aria-hidden="true"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
          <path d="M8 12V4M4 7l4-4 4 4" />
        </svg>
      </span>
      Back to top
    </button>
  );
}

function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}

const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

function EasterEgg() {
  const [unlocked, setUnlocked] = useState(false);
  const [visible, setVisible] = useState(false);
  const seq = useRef<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      seq.current = [...seq.current, e.key].slice(-KONAMI.length);
      if (seq.current.join(",") === KONAMI.join(",")) {
        setUnlocked(true);
        setVisible(true);
        setTimeout(() => setVisible(false), 4000);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!unlocked) return null;

  return (
    <span
      className="text-[11px] tracking-tight text-[rgb(var(--muted))] tabular-nums"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 600ms ease",
        pointerEvents: "none",
      }}
    >
      you found it ✦
    </span>
  );
}

export function SiteFooter() {
  return (
    <div className="page-container mx-auto w-full max-w-5xl">
    <GridRule />
    <footer className="px-8 pt-12 pb-10">

      {/* Menu columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-10 mb-14">

        {/* Get started */}
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] opacity-50">Get started</p>
          <ul className="space-y-2.5">
            <li><Link href="/aether/changelog" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Changelog</Link></li>
            <li><Link href="/aether" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Shopify themes</Link></li>
            <li><Link href="/contact" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Work with us</Link></li>
          </ul>
        </div>

        {/* Learn */}
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] opacity-50">Learn</p>
          <ul className="space-y-2.5">
            <li><Link href="/blog" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Blog</Link></li>
            <li><Link href="/aether/changelog" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Changelog</Link></li>
            <li><Link href="/docs" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Docs</Link></li>
          </ul>
        </div>

        {/* Pricing */}
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] opacity-50">Pricing</p>
          <ul className="space-y-2.5">
            <li><Link href="/aether" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Aether theme</Link></li>
            <li><Link href="/aether/enterprise" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Enterprise</Link></li>
            <li className="flex items-center gap-2">
              <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-30 cursor-not-allowed select-none">Add-ons</span>
              <span className="inline-flex items-center rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] opacity-40 px-1.5 pt-[2px] pb-[3px] text-[9px] tracking-tight leading-none">soon</span>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] opacity-50">Company</p>
          <ul className="space-y-2.5">
            <li><Link href="/about" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">About</Link></li>
            <li><Link href="/careers" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Careers</Link></li>
            <li><Link href="/contact" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Help</Link></li>
            <li><Link href="/legal" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Legal</Link></li>
          </ul>
        </div>

        {/* Community */}
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] opacity-50">Community</p>
          <ul className="space-y-2.5">
            <li><Link href="/work" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Shipped using Inertia</Link></li>
            <li>
              <a href="https://www.instagram.com/by.inertia/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
                </svg>
                Instagram
              </a>
            </li>
            <li>
              <a href="https://x.com/inertia_dev" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L2.25 2.25h6.562l4.258 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X (Twitter)
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <GridRule />
      <div className="flex items-center justify-between gap-6 pt-6">
        <div className="flex items-center gap-4">
          <EasterEgg />
          <div className="flex items-center gap-1.5 border border-[rgb(var(--line))] px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-sm bg-[rgb(var(--muted))] opacity-30 shrink-0" />
            <span className="text-[10px] font-mono tracking-wider text-[rgb(var(--muted))] opacity-40 uppercase">sys:ok</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <BackToTop />
          <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40 tabular-nums">
            © {new Date().getFullYear()} Inertia
          </p>
        </div>
      </div>

    </footer>
    </div>
  );
}
