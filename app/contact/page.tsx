import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project with Inertia. Tell us what you're building.",
};

export default function ContactPage() {
  return (
    <main className="page-container mx-3 sm:mx-auto w-auto sm:w-full max-w-6xl min-h-screen flex flex-col">

      {/* Nav */}
      <div className="flex items-center px-8 py-5 rise">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] tracking-tight transition-opacity hover:opacity-70"
          style={{ border: "1px solid rgb(var(--fg) / 0.25)", color: "rgb(var(--fg))" }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Home
        </Link>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      <div className="flex-1 rise" style={{ ["--rise-delay" as any]: "40ms" }}>
        <ContactForm />
      </div>

      <div className="grid-rule" aria-hidden="true" />

      <footer className="px-8 py-8 flex items-center text-[13px] tracking-tight text-[rgb(var(--muted))]">
        <Link href="/" className="hover:text-[rgb(var(--fg))] transition-colors">Inertia</Link>
      </footer>

    </main>
  );
}

