import Link from "next/link";

// The site footer: one quiet line. The year and the policies on one side,
// where to find us on the other. Everything else the old footer carried (a
// second wordmark, link columns, "Ask AI about us", the DMCA link, the theme
// switch) was cut as noise; bring a piece back only once it's shown to help.

type FooterLink = { label: string; href: string; external?: boolean };

const LEGAL: FooterLink[] = [
  { label: "Terms", href: "/policies/terms-of-service" },
  { label: "Privacy", href: "/policies/privacy-policy" },
  { label: "Refunds", href: "/policies/refund-policy" },
];

const CONTACT: FooterLink[] = [
  { label: "hello@byinertia.com", href: "mailto:hello@byinertia.com", external: true },
  { label: "Instagram", href: "https://www.instagram.com/by.inertia/", external: true },
  { label: "X", href: "https://x.com/inertia_dev", external: true },
];

const LINK = "inline-flex h-9 items-center text-[14px] leading-none tracking-tight text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]";

function FooterAnchor({ link }: { link: FooterLink }) {
  return link.external ? (
    <a href={link.href} className={LINK} {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={LINK}>
      {link.label}
    </Link>
  );
}

export function MinimalFooter() {
  return (
    <footer className="w-full">
      <div className="mx-auto flex w-full max-w-[80rem] flex-col gap-2 px-6 pt-16 pb-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:pt-24">
        <div className="flex flex-wrap items-center gap-x-5">
          <span className="inline-flex h-9 items-center text-[14px] leading-none tracking-tight text-[var(--ink-3)]">
            &copy; {new Date().getFullYear()} Inertia
          </span>
          {LEGAL.map((link) => (
            <FooterAnchor key={link.label} link={link} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-5">
          {CONTACT.map((link) => (
            <FooterAnchor key={link.label} link={link} />
          ))}
        </div>
      </div>
    </footer>
  );
}
