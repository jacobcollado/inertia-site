import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project with Inertia. Tell us what you're building.",
};

export default function ContactPage() {
  return (
    <main className="page-container mx-auto w-full max-w-lg flex flex-col justify-center px-6 pt-0 pb-16" style={{ minHeight: "calc(100vh - 64px)" }}>
      <ContactForm />
    </main>
  );
}
