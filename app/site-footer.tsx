import { PoliciesMenu } from "./policies-menu";

// The site footer: one quiet line. The year and the policies (one button,
// its menu opening upward) on one side, where to find us on the other.
// Everything else the old footer carried (a second wordmark, link columns,
// "Ask AI about us", the DMCA link, the theme switch) was cut as noise;
// bring a piece back only once it's shown to help.

type FooterLink = { label: string; href: string };

const CONTACT: FooterLink[] = [
  { label: "hello@byinertia.com", href: "mailto:hello@byinertia.com" },
  { label: "Telegram", href: "https://t.me/Jacob_inertia" },
  { label: "Instagram", href: "https://www.instagram.com/by.inertia/" },
  { label: "X", href: "https://x.com/inertia_dev" },
];

const LINK = "inline-flex h-9 items-center text-[14px] leading-none tracking-tight text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]";

export function MinimalFooter() {
  return (
    // The phone dock steps aside here, so it never covers the footer and the
    // page needs no room reserved under it.
    <footer className="w-full" data-dock-hide>
      <div className="mx-auto flex w-full max-w-[80rem] flex-col gap-2 px-6 pt-16 pb-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:pt-24">
        <div className="flex flex-wrap items-center gap-x-5">
          <span className="inline-flex h-9 items-center text-[14px] leading-none tracking-tight text-[var(--ink-3)]">
            &copy; {new Date().getFullYear()} Inertia
          </span>
          <PoliciesMenu />
        </div>
        <div className="flex flex-wrap items-center gap-x-5">
          {CONTACT.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={LINK}
              {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
