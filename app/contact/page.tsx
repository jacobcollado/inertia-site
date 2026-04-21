import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";
import { CopyEmail } from "./copy-email";
import { ContactForm } from "./contact-form";

const EMAIL = "jacob@aftertone.agency";

export const metadata: Metadata = {
  title: "Contact — Jacob Collado",
  description: "Get in touch for work, collaborations, or a simple hello.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 pt-6 pb-16 sm:pt-8 sm:pb-20 text-lg">
      <header
        className="flex items-center justify-between mb-14 rise"
        style={{ ["--rise-delay" as any]: "0ms" }}
      >
        <Link
          href="/"
          className="text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← back
        </Link>
        <ThemeToggle />
      </header>

      <section className="mb-10 rise" style={{ ["--rise-delay" as any]: "120ms" }}>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tighter leading-[1.05] mb-4">
          Let&apos;s make something.
        </h1>
        <p className="text-lg leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-prose">
          Commissions, collaborations, or a hello. I read everything and reply to most within a day or two.
        </p>
      </section>

      <section
        className="mb-12 rise flex flex-wrap items-center gap-x-5 gap-y-2 text-sm tracking-tight text-[rgb(var(--muted))]"
        style={{ ["--rise-delay" as any]: "180ms" }}
      >
        <span className="inline-flex items-center gap-2">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Accepting new work
        </span>
        <span className="h-3 w-px bg-[rgb(var(--line))]" aria-hidden="true" />
        <span>Based in Chicago</span>
        <span className="h-3 w-px bg-[rgb(var(--line))]" aria-hidden="true" />
        <span>Typically replies within 24h</span>
      </section>

      <section className="mb-14 rise" style={{ ["--rise-delay" as any]: "260ms" }}>
        <h2 className="text-base font-medium tracking-tighter text-[rgb(var(--muted))] mb-4">
          Direct
        </h2>
        <ul className="divide-y divide-[rgb(var(--line))] border-y border-[rgb(var(--line))]">
          <li className="flex items-center justify-between gap-6 py-4">
            <span className="text-sm tracking-tight text-[rgb(var(--muted))]">email</span>
            <span className="flex items-center gap-3 min-w-0">
              <a
                href={`mailto:${EMAIL}`}
                className="group inline-flex"
              >
                <span className="fluid-link tracking-tight text-[rgb(var(--fg))] truncate">
                  <span className="fluid-link__text">{EMAIL}</span>
                </span>
              </a>
              <CopyEmail email={EMAIL} />
            </span>
          </li>
          <li>
            <a
              href="https://www.instagram.com/kayz.xyz/"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-6 py-4"
            >
              <span className="text-sm tracking-tight text-[rgb(var(--muted))]">instagram</span>
              <span className="fluid-link tracking-tight text-[rgb(var(--fg))]">
                <span className="fluid-link__text">@kayz.xyz</span>
              </span>
            </a>
          </li>
        </ul>
      </section>

      <section className="rise" style={{ ["--rise-delay" as any]: "340ms" }}>
        <h2 className="text-base font-medium tracking-tighter text-[rgb(var(--muted))] mb-5">
          Or send a note
        </h2>
        <ContactForm />
      </section>
    </main>
  );
}
