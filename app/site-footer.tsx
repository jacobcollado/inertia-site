"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

function BackToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="group flex items-center gap-2 text-[14px] sm:text-[15px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
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

export function MinimalFooter() {
  return (
    <footer className="w-full max-w-[88rem] mx-auto px-6 sm:px-8 py-8 flex flex-col items-center text-center gap-4">
      <p className="rise text-[17px] tracking-tight text-[rgb(var(--muted))] max-w-sm leading-relaxed" style={{ opacity: 0.5 }}>
        Good work takes the right people close to it.
      </p>
      <div className="rise flex items-center gap-5" style={{ "--rise-delay": "80ms" } as React.CSSProperties}>
        <Link href="/policies/terms-of-service" className="text-[15px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.4 }}>
          Terms of service
        </Link>
        <Link href="/policies/privacy-policy" className="text-[15px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.4 }}>
          Privacy policy
        </Link>
      </div>
    </footer>
  );
}

export function SiteFooter() {
  return (
    <div className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-6xl">
    <footer className="pt-12 pb-8">

      {/* Menu columns */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-12 gap-y-8 mb-12 px-3 sm:px-8">

        <div className="flex flex-col gap-2.5 min-w-[120px]">
          <p className="text-[14px] sm:text-[15px] font-[500] tracking-tight text-[rgb(var(--muted))] opacity-40 mb-1">Products</p>
          <Link href="/aether" className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Aether theme</Link>
          <Link href="/aether/commercial" className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Commercial</Link>
          <span className="inline-flex items-center gap-2">
            <span className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] opacity-30 cursor-not-allowed select-none">Add-ons</span>
            <span className="inline-flex items-center rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] opacity-40 px-1.5 pt-[2px] pb-[3px] text-[9px] tracking-tight leading-none">soon</span>
          </span>
        </div>

        <div className="flex flex-col gap-2.5 min-w-[130px]">
          <p className="text-[14px] sm:text-[15px] font-[500] tracking-tight text-[rgb(var(--muted))] opacity-40 mb-1">Work</p>
          <Link href="/contact" className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Work with us</Link>
          <Link href="/work" className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Shipped using Inertia</Link>
          <Link href="/aether#pricing" className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Pricing</Link>
        </div>

        <div className="flex flex-col gap-2.5 min-w-[100px]">
          <p className="text-[14px] sm:text-[15px] font-[500] tracking-tight text-[rgb(var(--muted))] opacity-40 mb-1">Resources</p>
          <Link href="/blog" className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Blog</Link>
          <Link href="/docs" className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Docs</Link>
          <Link href="/aether/changelog" className="inline-flex items-center gap-2 text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
            Changelog
            <span className="text-[11px] tabular-nums opacity-40">May 2026</span>
          </Link>
          <Link href="/components" className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Components</Link>
        </div>

        <div className="flex flex-col gap-2.5 min-w-[100px]">
          <p className="text-[14px] sm:text-[15px] font-[500] tracking-tight text-[rgb(var(--muted))] opacity-40 mb-1">Company</p>
          <Link href="/about" className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">About</Link>
          <Link href="/roadmap" className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Roadmap</Link>
          <Link href="/careers" className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Careers</Link>
          <Link href="/contact" className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Contact</Link>
          <Link href="/policies" className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Policies</Link>
        </div>

        <div className="flex flex-col gap-2.5 min-w-[100px]">
          <p className="text-[14px] sm:text-[15px] font-[500] tracking-tight text-[rgb(var(--muted))] opacity-40 mb-1">Follow</p>
          <a href="https://www.instagram.com/by.inertia/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
            </svg>
            Instagram
          </a>
          <a href="https://x.com/inertia_dev" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L2.25 2.25h6.562l4.258 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X (Twitter)
          </a>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 pt-5 px-3 sm:px-8">
        <div className="flex items-center gap-4">
          <EasterEgg />
          <span className="inline-flex items-center gap-1.5 text-[15px] sm:text-[16px] tracking-tight text-[rgb(var(--muted))] opacity-30">
            <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--muted))] shrink-0" />
            All systems operational
          </span>
        </div>
        <div className="flex items-center gap-6">
          <BackToTop />
          <Link href="/" className="text-[16px] sm:text-[17px] tracking-tight text-[rgb(var(--muted))] opacity-40 tabular-nums hover:opacity-60 transition-opacity">
            &copy; {new Date().getFullYear()} Inertia
          </Link>
        </div>
      </div>

    </footer>
    </div>
  );
}
