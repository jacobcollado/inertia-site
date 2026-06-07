import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project with Inertia. Tell us what you're building.",
};

export default function ContactPage() {
  return (
    <main className="page-container mx-auto w-full max-w-lg px-6 pt-16 pb-24">
      <Suspense fallback={null}>
        <ContactForm />
      </Suspense>
    </main>
  );
}
