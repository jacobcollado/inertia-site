import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Digital products are final sale, but we will always work to make things right. Here's how refunds work at Inertia.",
};

const EFFECTIVE = "June 1, 2026";
const COMPANY = "Inertia Studio LLC";
const CONTACT = "hello@byinertia.com";

const SECTIONS = [
  {
    id: "digital-products",
    title: "Digital Products",
    body: `All products sold by ${COMPANY} ("Inertia", "we", "us") — including Shopify themes such as Aether — are digital goods delivered electronically. Because the product is accessible immediately upon purchase and cannot be returned, all sales are final. We do not offer refunds as a matter of standard policy.`,
  },
  {
    id: "our-commitment",
    title: "Our Commitment",
    body: `That said, we stand behind everything we sell. If you run into a problem — a bug, something that isn't working as documented, or any other issue with your purchase — contact us at ${CONTACT} and we will do our best to make it right. We take every complaint seriously and will work with you to resolve the issue. We would rather spend the time fixing something than leave a customer frustrated.`,
  },
  {
    id: "exceptions",
    title: "Exceptions",
    body: "In rare cases where a product is found to be materially defective or significantly not as described, and where we are unable to resolve the issue through support, we may issue a refund at our sole discretion. Refund requests of this kind must be submitted within 14 days of purchase. We do not issue refunds for: change of mind, purchases made by mistake, incompatibility with third-party apps or custom code not provided by Inertia, or issues arising from modifications made to the theme after purchase.",
  },
  {
    id: "service-engagements",
    title: "Service Engagements",
    body: "Custom project work and retainer engagements are governed by the Terms of Service, not this policy. Deposits on service engagements are non-refundable in all cases.",
  },
  {
    id: "contact",
    title: "Questions",
    body: `If you have a problem with your purchase, please reach out before assuming there is no path forward. Most issues are fixable and we are happy to help. You can contact us any time at ${CONTACT}.`,
  },
];

export default function RefundPolicyPage() {
  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full pt-6 pb-24 px-3" style={{ maxWidth: "80rem" }}>

      {/* TOC */}
      <div className="mb-10 p-6 rounded-xl bg-[rgb(var(--surface))]">
        <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] opacity-60 mb-4">Contents</p>
        <div className="flex flex-col gap-1.5">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[16px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors py-0.5"
            >
              {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Document header */}
      <div className="mb-10">
        <h1 className="text-[2.4rem] font-medium tracking-[-0.03em] leading-tight text-[rgb(var(--fg))] mb-4">
          Inertia Refund Policy
        </h1>
        <div className="flex flex-wrap gap-x-8 gap-y-1">
          <p className="text-[16px] tracking-tight text-[rgb(var(--muted))]">{COMPANY}</p>
          <p className="text-[16px] tracking-tight text-[rgb(var(--muted))] tabular-nums">Effective {EFFECTIVE}</p>
          <a href={`mailto:${CONTACT}`} className="text-[16px] tracking-tight text-[rgb(var(--muted))] hover:opacity-80 transition-opacity">{CONTACT}</a>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-12">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="text-[20px] font-medium tracking-tight text-[rgb(var(--fg))] mb-4">{s.title}</h2>
            <p className="text-[17px] leading-[1.8] tracking-tight text-[rgb(var(--muted))]">
              {s.body}
            </p>
          </section>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-[16px] tracking-tight text-[rgb(var(--muted))] opacity-50">
          Questions?{" "}
          <a href={`mailto:${CONTACT}`} className="underline underline-offset-2 hover:opacity-80 transition-opacity">
            {CONTACT}
          </a>
        </p>
        <Link href="/policies/terms-of-service" className="text-[15px] tracking-tight text-[rgb(var(--muted))] opacity-40 hover:opacity-70 transition-opacity">
          Terms of Service →
        </Link>
      </div>

    </main>
  );
}
