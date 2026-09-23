import Link from "next/link";

type PolicyPage = "terms" | "privacy" | "refund";

// Everything a policy body can mention that has somewhere to go. Longer
// patterns first, so "byinertia.com/dashboard" wins over "byinertia.com".
const LINKS: { pattern: string; href: string; page?: PolicyPage }[] = [
  { pattern: "hello@byinertia.com", href: "mailto:hello@byinertia.com" },
  { pattern: "byinertia.com/dashboard", href: "/dashboard" },
  { pattern: "byinertia.com", href: "/" },
  { pattern: "Terms of Service", href: "/policies/terms-of-service", page: "terms" },
  { pattern: "Privacy Policy", href: "/policies/privacy-policy", page: "privacy" },
  { pattern: "Refund Policy", href: "/policies/refund-policy", page: "refund" },
  { pattern: "Intellectual Property & Ownership", href: "/policies/terms-of-service#ip" },
];

const LINK_CLASS =
  "text-blue-500 underline underline-offset-2 decoration-blue-500/40 hover:text-blue-400 hover:decoration-blue-400 transition-colors";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* A policy section's body with every mention of a page, section or address
   rendered as a visible link. A page's mentions of itself ("these Terms of
   Service" on the terms page) stay plain text. */
export function PolicyText({ text, self }: { text: string; self: PolicyPage }) {
  const links = LINKS.filter((l) => l.page !== self);
  const splitter = new RegExp(`(${links.map((l) => escape(l.pattern)).join("|")})`, "g");

  return (
    <>
      {text.split(splitter).map((part, i) => {
        const link = links.find((l) => l.pattern === part);
        if (!link) return part;
        return link.href.startsWith("mailto:") ? (
          <a key={i} href={link.href} className={LINK_CLASS}>{part}</a>
        ) : (
          <Link key={i} href={link.href} className={LINK_CLASS}>{part}</Link>
        );
      })}
    </>
  );
}
