import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell us what you're building. Shopify storefronts, brand identities, and custom web work, shipped on time. We reply within one business day.",
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
