import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What data Inertia collects, why we collect it, and how long we keep it. No surprises.",
};

const EFFECTIVE = "June 6, 2026";
const COMPANY = "Inertia Studio LLC";
const CONTACT = "hello@byinertia.com";

const SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    body: `${COMPANY} ("Inertia", "we", "us") operates byinertia.com, including the client portal at byinertia.com/dashboard. This Privacy Policy explains what personal information we collect from visitors and clients, why we collect it, how we use it, how long we retain it, and what rights you have over it. The short version: we collect as little as possible, we don't sell it, and we don't do anything with it that you wouldn't expect.`,
  },
  {
    id: "information-collected",
    title: "Information We Collect",
    body: "We collect information in three ways. First, information you give us directly: if you fill out the contact form, we receive your name, email address, and message content. If you create a client portal account, you sign in via Google OAuth — we receive your email address from Google and store it alongside any display name or company name you set in your portal settings. We do not receive or store your Google password. Second, project and billing data: your portal stores the projects, invoices, files, and messages associated with your engagement. Invoice payments are processed through Whop, which passes us confirmation and your email. We never receive or store your card details. Third, technical data: our hosting logs IP addresses, browser type, and request metadata for a rolling 30-day window, used exclusively for security monitoring and debugging. We also receive anonymised, aggregated page-view data. No individual user is identifiable from this.",
  },
  {
    id: "use",
    title: "How We Use Your Information",
    body: "Contact form submissions are used only to respond to your message. We do not add you to any mailing list unless you explicitly ask. Your portal account is used to give you access to your project status, phase notes, invoices, shared files, and the direct message thread with your project team. Nothing stored in the portal is used for advertising, profiling, or shared with any third party. Billing data is used to process payment, issue receipts, and provide post-purchase support. Server log data is used for security and debugging only. Aggregated analytics help us understand which pages are most useful so we can improve the site.",
  },
  {
    id: "sharing",
    title: "Sharing & Disclosure",
    body: "We do not sell, rent, or share your personal information with any third party for their own purposes. Google receives your sign-in request when you authenticate via Google OAuth, as governed by Google's own privacy policy. Whop receives payment information when you pay an invoice through the portal. Outside of those two processors, your data stays with us. We may share information with legal authorities if required by law, or if necessary to protect the rights, safety, or property of Inertia or others.",
  },
  {
    id: "cookies",
    title: "Cookies & Tracking",
    body: "We use a small number of browser storage entries. One stores your theme preference (light or dark mode) along with a timestamp so the site remembers your choice between visits. When you sign in to the client portal, Supabase sets a session cookie to keep you authenticated. This cookie contains a session token, not your password or payment details. We use PostHog to collect anonymised page-view analytics and to record anonymised session replays — these help us understand how visitors navigate the site so we can improve it. All form inputs and text fields are masked in session recordings; we never capture passwords, payment details, or personal data entered into forms. PostHog analytics data is routed through our own domain and stored on PostHog's US servers. We do not use advertising cookies, cross-site tracking cookies, or browser fingerprinting. You can clear cookies at any time in your browser settings. Doing so will sign you out of the portal and reset your theme preference.",
  },
  {
    id: "retention",
    title: "Data Retention",
    body: "We keep your data only for as long as we need it. Contact form messages are kept for the duration of the active conversation plus 12 months, then deleted. Portal account data — your profile, projects, invoices, files, and messages — is retained for as long as your account is active, plus 12 months after closure to handle any follow-up queries. Invoice and billing records are retained for 7 years to satisfy tax and accounting requirements. Server logs are purged automatically after 30 days. If you want your contact or portal data deleted sooner, email us and we will action it within 7 days.",
  },
  {
    id: "security",
    title: "Security",
    body: "Authentication for the client portal is handled via Google OAuth and Supabase, both of which use industry-standard token-based session management. We do not store passwords. Your portal data is stored in a Supabase database with row-level security policies, meaning your records are only accessible to your account and to Inertia admins. Client credentials shared during a project — store access, API keys, admin logins — are stored only for the duration they are needed and revoked on handover. That said, no system is perfectly secure, and we cannot guarantee that data transmitted over the internet will never be intercepted. If you have concerns about your account or data, contact us immediately.",
  },
  {
    id: "rights",
    title: "Your Rights",
    body: `You have the right to request a copy of the personal information we hold about you, to ask us to correct anything inaccurate, and to request deletion of your data where there is no legal obligation for us to retain it. You can update your display name directly in the portal under Settings. To request full data export or deletion, email ${CONTACT} with the subject line "Privacy Request". We will respond within 14 days. If you are based in the EU or UK, you also have the right to lodge a complaint with your local data protection authority. We would always rather hear from you first.`,
  },
  {
    id: "children",
    title: "Children's Privacy",
    body: "Our services are intended for businesses and adults. We do not knowingly collect personal information from anyone under the age of 16. If you believe we have inadvertently received data from a child, contact us and we will delete it promptly.",
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    body: `We may update this Privacy Policy from time to time as our services evolve or regulations change. When we do, the updated version will appear here with a new effective date. If a change is material, we will do our best to flag it clearly. Continued use of our site or services after a new effective date constitutes acceptance of the updated policy. The current version is effective ${EFFECTIVE}.`,
  },
];

export default function PrivacyPage() {
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
          Inertia Privacy Policy
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
