import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "How engagements with Inertia work. Ownership, payment, revisions, support, and the rest, in plain terms.",
};

const EFFECTIVE = "May 1, 2026";
const COMPANY = "Inertia Studio LLC";
const CONTACT = "hello@byinertia.com";
const JURISDICTION = "Illinois, United States";

const SECTIONS = [
  {
    id: "overview",
    title: "Acceptance of Terms",
    body: `By engaging ${COMPANY} ("Inertia", "we", "us") for paid services, you ("Client") agree to be bound by these Terms of Service. If you do not agree, do not engage our services. These terms govern all projects, deliverables, and ongoing work between Inertia and the Client unless a separate written agreement has been signed by both parties. Engaging us for any paid work, including one-time projects, retainers, or product purchases, constitutes acceptance of these terms in full. Creating an account on the client portal at byinertia.com/dashboard also constitutes acceptance.`,
  },
  {
    id: "services",
    title: "Scope of Services",
    body: "The specific services to be provided will be outlined in a written project proposal or statement of work agreed upon before work begins. This includes the deliverables, timeline, and total cost. Any work requested outside that agreed scope constitutes a change order and requires a new written estimate before we proceed. We reserve the right to decline any project, change order, or request at our discretion, including those that conflict with our values or resource availability.",
  },
  {
    id: "client-portal",
    title: "Client Portal",
    body: "Active clients are given access to a private dashboard at byinertia.com/dashboard. You sign in via Google and will see tabs for your project status, invoices, shared files, and a direct message thread with your project team. The portal is provided as a convenience — all project-critical communications are also available via email. Access to the portal may be suspended if your account is in breach of these Terms, including non-payment of outstanding invoices. Portal access does not constitute a separate subscription; it is tied to your active or recently completed engagement with Inertia.",
  },
  {
    id: "ip",
    title: "Intellectual Property & Ownership",
    body: `Upon receipt of full payment, Client receives full ownership of all final deliverables created specifically for the project — including custom code, design files, copy, and assets. You can use, modify, resell, or build on those deliverables however you like. Inertia retains ownership of all pre-existing work brought into the project: base themes, internal component libraries, frameworks, tooling, and anything developed outside the scope of your engagement. Where pre-existing Inertia work is incorporated into a deliverable, you receive a perpetual, non-exclusive licence to use that work within your project. You may not extract, resell, or sublicence those underlying components separately from the delivered project.`,
  },
  {
    id: "payment",
    title: "Payment Terms",
    body: "A non-refundable deposit of 50% of the total project fee is due before any work begins. The remaining 50% is due before the final deliverable is handed over or the site goes live, whichever comes first. Work does not start until the deposit has cleared. Invoices appear in the Billing section of your portal and are payable within 7 days of issue. You can pay directly through the portal using the Pay Now button on each invoice, which opens a secure checkout. Balances unpaid after 14 days accrue a late fee of 1.5% per month on the outstanding amount. If payment is not received within 30 days of the due date, Inertia reserves the right to pause all active work, suspend portal access, or terminate the project entirely. All deposits paid are non-refundable.",
  },
  {
    id: "revisions",
    title: "Revisions & Scope Changes",
    body: "Every project includes two rounds of revisions against the original agreed brief. A revision means adjusting or correcting something already built — not adding new features, redesigning sections, or changing the direction of the work. Revisions that fall outside the original brief are treated as scope changes. Additional revision rounds beyond the included two are billed at our current hourly rate, agreed in writing before proceeding. Any change that materially alters what was originally scoped requires a written change order. Projects that go quiet for more than 30 days without a scheduled pause will be treated as stalled: we will invoice for all completed work and close out the project.",
  },
  {
    id: "post-launch",
    title: "Post-Delivery Support",
    body: "Following handover, Inertia provides a 14-day correction window. During this period, we will fix any defects that prevent the delivered work from functioning as specified in the original brief, at no additional charge. You can report issues directly through the Messages tab in your portal. This correction window does not cover: new feature requests, design changes, content updates, issues caused by Shopify platform updates or third-party app changes, or any modifications made by your team or a third party after handover. If you need ongoing support beyond this window, we offer separate retainer arrangements.",
  },
  {
    id: "confidentiality",
    title: "Confidentiality",
    body: "Both parties agree to keep confidential all non-public information shared during the project — including business plans, unreleased products, financial data, customer lists, and internal strategies. We do not share your information with anyone outside the team working on your project. Client credentials (store access, API keys, admin logins) are stored only for the duration they are needed and revoked on handover. Files shared via the portal are accessible only to your account and Inertia admins. If you need a formal NDA before we begin, send it over. We sign reasonable ones without issue.",
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    body: `We build carefully and stand behind our work. That said, our total liability for any claim arising from these Terms or the services provided is capped at the total fees you paid us for the relevant project. We are not liable for indirect, incidental, consequential, or punitive damages of any kind — including lost revenue, missed launches, lost data, or downstream business impact. We are also not liable for issues caused by Shopify platform changes, third-party integrations, hosting providers, or modifications to delivered work made by you or anyone you have authorised. This limitation applies to the fullest extent permitted by the laws of ${JURISDICTION}.`,
  },
  {
    id: "termination",
    title: "Termination",
    body: "Either party may terminate a project engagement with 14 days written notice. If you terminate, you are responsible for payment of all work completed to the termination date. We will deliver everything produced up to that point in a reasonable, transferable format and files already in your portal will remain accessible for 30 days. Deposits paid are non-refundable under any circumstances. If Inertia terminates due to a breach on your end — including non-payment, abusive conduct, or misrepresentation — all outstanding invoices become immediately due, and we reserve the right to suspend portal access and withhold final deliverables until payment is received.",
  },
  {
    id: "disputes",
    title: "Dispute Resolution",
    body: `We have never had a dispute reach a formal stage, and we would like to keep it that way. If something goes wrong, the right first step is a direct conversation — the Messages tab in your portal is a good place to start. Most issues can be resolved quickly when both parties are straightforward about what happened. If a dispute cannot be resolved through direct communication within 30 days, both parties agree to attempt non-binding mediation before pursuing any legal action. These Terms are governed by the laws of ${JURISDICTION}. Any formal legal proceedings will be conducted in the appropriate courts of ${JURISDICTION}. The prevailing party is entitled to recover reasonable legal fees.`,
  },
  {
    id: "changes",
    title: "Amendments",
    body: "Inertia may update these Terms at any time. When we do, the updated version will be posted here with a new effective date. Continued use of our services or the client portal after the effective date constitutes acceptance of the updated Terms. For projects already in progress, the Terms in effect at the time your project agreement was signed will apply for the duration of that project, unless both parties agree otherwise in writing.",
  },
];

export default function TermsPage() {
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
          Inertia Terms of Service
        </h1>
        <div className="flex flex-wrap gap-x-8 gap-y-1">
          <p className="text-[16px] tracking-tight text-[rgb(var(--muted))]">{COMPANY}</p>
          <p className="text-[16px] tracking-tight text-[rgb(var(--muted))] tabular-nums">Effective {EFFECTIVE}</p>
          <p className="text-[16px] tracking-tight text-[rgb(var(--muted))]">{JURISDICTION}</p>
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
        <Link href="/policies/privacy-policy" className="text-[15px] tracking-tight text-[rgb(var(--muted))] opacity-40 hover:opacity-70 transition-opacity">
          Privacy Policy →
        </Link>
      </div>

    </main>
  );
}
