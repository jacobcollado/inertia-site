import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact — Inertia",
  description: "Get in touch for work, collaborations, or a simple hello.",
};

export default function ContactPage() {
  return (
    <main className="page-container mx-auto w-full max-w-5xl min-h-screen flex flex-col">

      {/* Nav */}
      <div className="flex items-center px-8 py-5 rise">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
          back
        </Link>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      <div className="flex-1 rise" style={{ ["--rise-delay" as any]: "40ms" }}>
        <ContactForm />
      </div>

      <div className="grid-rule" aria-hidden="true" />

      <footer className="px-8 py-8 flex items-center justify-between gap-6 text-[13px] tracking-tight text-[rgb(var(--muted))]">
        <Link href="/" className="hover:text-[rgb(var(--fg))] transition-colors">Inertia</Link>
        <div className="flex items-center gap-1.5 text-[11px] tracking-tight">
          <svg viewBox="0 0 8 8" className="w-2 h-2 shrink-0" aria-hidden="true">
            <circle cx="4" cy="4" r="3" fill="rgb(var(--green))" />
          </svg>
          All systems operational
        </div>
      </footer>

    </main>
  );
}
