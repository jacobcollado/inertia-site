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

