import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmail } from "./copy-email";
import { ContactForm } from "./contact-form";

const EMAIL = "jacob@aftertone.agency";

export const metadata: Metadata = {
  title: "Contact — Jacob Collado",
  description: "Get in touch for work, collaborations, or a simple hello.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex min-h-screen flex-col px-8 pt-6 pb-16 sm:pt-8 sm:pb-20">
      <header
        className="flex items-center mb-16 rise"
        style={{ ["--rise-delay" as any]: "0ms" }}
      >
        <Link
          href="/"
          className="text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← back
        </Link>
      </header>

      {/* Heading */}
      <div className="rise mb-10" style={{ ["--rise-delay" as any]: "80ms" }}>
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tighter leading-[1.0] mb-5">
          Let&apos;s make something.
        </h1>
        <p className="text-base leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-[36ch]">
          Commissions, collaborations, or a hello. I read everything.
        </p>
      </div>

      {/* Status row */}
      <div
        className="rise mb-10 inline-flex items-center gap-2 text-sm tracking-tight text-[rgb(var(--muted))]"
        style={{ ["--rise-delay" as any]: "140ms" }}
      >
        <span className="relative inline-flex h-2 w-2 shrink-0">
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Available for new work · Chicago · replies within 24h
      </div>

      {/* Contact links */}
      <div
        className="rise mb-12 border-t border-[rgb(var(--line))]"
        style={{ ["--rise-delay" as any]: "200ms" }}
      >
        <div className="flex items-center justify-between gap-6 py-4 border-b border-[rgb(var(--line))]">
          <span className="text-sm tracking-tight text-[rgb(var(--muted))] w-20 shrink-0">email</span>
          <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
            <a href={`mailto:${EMAIL}`} className="group inline-flex min-w-0">
              <span className="fluid-link text-sm tracking-tight text-[rgb(var(--fg))] truncate">
                <span className="fluid-link__text">{EMAIL}</span>
              </span>
            </a>
            <CopyEmail email={EMAIL} />
          </div>
        </div>
        <a
          href="https://www.instagram.com/kayz.xyz/"
          target="_blank"
          rel="noreferrer"
          className="group flex items-center justify-between gap-6 py-4 border-b border-[rgb(var(--line))]"
        >
          <span className="text-sm tracking-tight text-[rgb(var(--muted))] w-20 shrink-0">instagram</span>
          <span className="fluid-link text-sm tracking-tight text-[rgb(var(--fg))]">
            <span className="fluid-link__text">@kayz.xyz</span>
          </span>
        </a>
      </div>

      {/* Form */}
      <div className="rise" style={{ ["--rise-delay" as any]: "280ms" }}>
        <ContactForm />
      </div>
    </main>
  );
}
