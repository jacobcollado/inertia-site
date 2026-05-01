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
      <div className="flex items-center px-8 py-5 rise" style={{ ["--rise-delay" as any]: "0ms" }}>
        <Link
          href="/"
          className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          ← back
        </Link>
      </div>

      <div className="grid-rule" aria-hidden="true" />

      <div className="flex-1 rise" style={{ ["--rise-delay" as any]: "60ms" }}>
        <ContactForm />
      </div>

    </main>
  );
}
