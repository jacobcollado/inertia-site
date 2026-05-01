"use client";

import Link from "next/link";
import { WelcomeBack } from "./ambient";

function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}

export function SiteFooter() {
  return (
    <div className="page-container mx-auto w-full max-w-5xl">
    <GridRule />
    <footer className="px-8 pt-12 pb-10">

      {/* Menu columns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-10 mb-14">

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

        {/* Company */}
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] opacity-50">Company</p>
          <ul className="space-y-2.5">
            <li><Link href="/about" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">About</Link></li>
            <li className="flex items-center gap-2">
              <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-30 cursor-not-allowed select-none">Careers</span>
              <span className="inline-flex items-center rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] opacity-40 px-1.5 pt-[2px] pb-[3px] text-[9px] tracking-tight leading-none">soon</span>
            </li>
            <li><Link href="/contact" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Help</Link></li>
            <li><span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-30 cursor-not-allowed select-none">Legal</span></li>
            <li><span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-30 cursor-not-allowed select-none">Privacy policy</span></li>
          </ul>
        </div>

        {/* Community */}
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-medium tracking-tight text-[rgb(var(--muted))] opacity-50">Community</p>
          <ul className="space-y-2.5">
            <li><Link href="/work" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">Shipped using Inertia</Link></li>
            <li>
              <a href="https://www.instagram.com/inertia.dev/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
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
                X / Twitter
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <GridRule />
      <div className="flex items-center justify-between gap-6 pt-6">
        <WelcomeBack />
        <p className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40 tabular-nums">
          © {new Date().getFullYear()} Inertia
        </p>
      </div>

    </footer>
    </div>
  );
}
