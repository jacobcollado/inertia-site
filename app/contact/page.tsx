import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmail } from "./copy-email";
import { ContactForm } from "./contact-form";

const EMAIL = "jacob@aftertone.agency";

export const metadata: Metadata = {
  title: "Contact — Inertia",
  description: "Get in touch for work, collaborations, or a simple hello.",
};

export default function ContactPage() {
  return (
    <main className="page-container mx-auto w-full max-w-5xl min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Nav */}
      <div className="flex items-center px-8 py-5 rise" style={{ ["--rise-delay" as any]: "0ms" }}>
        <Link
          href="/"
          className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← back
        </Link>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Hero */}
      <div className="px-8 pt-14 pb-12 text-center rise" style={{ ["--rise-delay" as any]: "60ms" }}>
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">Start a</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[13px] tracking-tight text-[rgb(var(--fg))]">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            conversation
          </span>
        </div>
        <h1 className="text-[clamp(2.25rem,5.5vw,4rem)] font-medium tracking-[-0.04em] leading-[1.05] text-[rgb(var(--fg))]">
          Let&apos;s make something.
        </h1>
        <p className="mt-4 text-[15px] tracking-tight leading-relaxed text-[rgb(var(--muted))] max-w-xs mx-auto">
          Commissions, collaborations, or a hello. I read everything.
        </p>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Contact links */}
      <div className="rise" style={{ ["--rise-delay" as any]: "120ms" }}>
        <div className="flex items-center justify-between gap-6 px-8 py-4 border-b border-[rgb(var(--line))]">
          <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-60 w-20 shrink-0">email</span>
          <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
            <a href={`mailto:${EMAIL}`} className="text-[13px] tracking-tight text-[rgb(var(--fg))] hover:text-[rgb(var(--muted))] transition-colors truncate">
              {EMAIL}
            </a>
            <CopyEmail email={EMAIL} />
          </div>
        </div>
        <a
          href="https://www.instagram.com/kayz.xyz/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-6 px-8 py-4 border-b border-[rgb(var(--line))] hover:bg-[rgb(var(--line))/0.1] transition-colors"
        >
          <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-60 w-20 shrink-0">instagram</span>
          <span className="text-[13px] tracking-tight text-[rgb(var(--fg))]">@kayz.xyz</span>
        </a>
        <div className="flex items-center justify-between gap-6 px-8 py-4 border-b border-[rgb(var(--line))]">
          <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-60 w-20 shrink-0">location</span>
          <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]">Chicago · replies within 24h</span>
        </div>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      {/* Form */}
      <div className="px-6 sm:px-8 py-10 rise" style={{ ["--rise-delay" as any]: "200ms" }}>
        <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] mb-6">Send a note</p>
        <ContactForm />
      </div>

    </main>
  );
}
