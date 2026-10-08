"use client";

import Link from "next/link";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePref } from "./theme-provider";
import { ASK_AI_STUDIO_PROMPT, AskAiLinks } from "@/components/ask-ai-links";
import { FRAME_TONES, FrameColumnRails, FrameRule, type FrameTone } from "@/components/page-frame";

const THEME_OPTIONS: { pref: ThemePref; label: string; Icon: typeof Sun }[] = [
  { pref: "light", label: "Light", Icon: Sun },
  { pref: "dark", label: "Dark", Icon: Moon },
  { pref: "system", label: "System", Icon: Monitor },
];

// Light / dark / follow the system. Offered in the footer on every themed
// route (see SiteShell); pages without the site footer (/docs, /login,
// /reset-password) place it themselves.
export function ThemeSwitch() {
  const { pref, setPref } = useTheme();
  return (
    <div role="radiogroup" aria-label="Theme" className="inline-flex items-center gap-0.5 rounded-[8px] p-0.5" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--fg) / 0.1)" }}>
      {THEME_OPTIONS.map(({ pref: p, label, Icon }) => {
        const on = pref === p;
        return (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={label}
            title={label}
            onClick={() => setPref(p)}
            className="inline-flex size-7 items-center justify-center rounded-[6px] transition-colors duration-150"
            style={{ background: on ? "rgb(var(--fg) / 0.1)" : "transparent", color: on ? "rgb(var(--fg))" : "rgb(var(--muted) / 0.7)" }}
          >
            <Icon className="size-[15px]" strokeWidth={1.75} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

type FooterLink = { label: string; href: string; external?: boolean };

const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Studio",
    links: [
      { label: "Our work", href: "/work" },
      { label: "Our thoughts", href: "/blog" },
      { label: "Guides & docs", href: "/docs" },
    ],
  },
  {
    title: "Aether",
    links: [
      { label: "Aether", href: "/aether" },
      { label: "Changelog", href: "/aether/changelog" },
      { label: "Live demo", href: "https://aether-starter.myshopify.com", external: true },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "hello@byinertia.com", href: "mailto:hello@byinertia.com", external: true },
      { label: "Instagram", href: "https://www.instagram.com/by.inertia/", external: true },
      { label: "X", href: "https://x.com/inertia_dev", external: true },
    ],
  },
];

const LEGAL: FooterLink[] = [
  { label: "Terms", href: "/policies/terms-of-service" },
  { label: "Privacy", href: "/policies/privacy-policy" },
  { label: "Refunds", href: "/policies/refund-policy" },
];

const LINK = "text-[15px] tracking-tight text-[rgb(var(--muted))] transition-colors hover:text-[rgb(var(--fg))]";

function FooterAnchor({ link, className = LINK }: { link: FooterLink; className?: string }) {
  return link.external ? (
    <a href={link.href} className={className} {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

// The Inertia wordmark, as a mask filled with the page's text colour, so it
// reads on light pages, in dark mode and on the homepage's dark zone without
// inverting the image.
function Wordmark() {
  return (
    <span
      role="img"
      aria-label="Inertia"
      className="block h-[22px] w-[72px]"
      style={{
        background: "rgb(var(--fg))",
        WebkitMaskImage: "url(/logo.png)",
        maskImage: "url(/logo.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }}
    />
  );
}

// The site footer, in the page frame: the column's two rails run through it,
// and a frame rule separates the bottom row. Above it,
// the wordmark on the left and three short link columns on the right; below,
// the year, the policies and (where the route follows the theme) the theme
// switch. Plain type in the theme's tokens, so it reads on the light pages,
// in dark mode and on the homepage's dark zone (tone="dark") alike. Comes in
// with the same staggered reveal as the homepage sections. `rails` is off on
// blog posts, which frame their own narrower sheet.
export function MinimalFooter({ themeSwitch = false, tone = "light", rails = true }: { themeSwitch?: boolean; tone?: FrameTone; rails?: boolean }) {
  return (
    <footer className="relative w-full">
      {rails && <FrameColumnRails tone={tone} />}
      <div className="rise rise-stagger relative w-full max-w-[80rem] mx-auto px-6 sm:px-8 pt-16 sm:pt-20">
        <div data-stagger className="grid gap-10 sm:grid-cols-[1fr_auto] sm:gap-16">
          <div>
            <Wordmark />
            {/* A quiet way to hear about us from someone else: each mark
                opens that assistant with the question already asked. */}
            <div className="mt-8 flex items-center gap-2.5">
              <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">Ask AI about us</p>
              <AskAiLinks prompt={ASK_AI_STUDIO_PROMPT} variant="icons" className="-my-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 sm:gap-x-14">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-2">
                <p className="mb-1 text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">{col.title}</p>
                {col.links.map((link) => (
                  <FooterAnchor key={link.label} link={link} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* With rails, the frame's split into rounded cells; without them
            (blog posts) there's nothing for the corners to meet, so a plain
            hairline. */}
        <div className="-mx-6 sm:-mx-8">
          {rails ? (
            <FrameRule tone={tone} className="py-8 sm:py-10" />
          ) : (
            <div aria-hidden="true" className="py-8 sm:py-10">
              <div className="h-px" style={{ background: FRAME_TONES[tone].line }} />
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse items-start gap-4 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60">&copy; {new Date().getFullYear()} Inertia</span>
            {LEGAL.map((link) => (
              <FooterAnchor key={link.label} link={link} className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60 transition-opacity hover:opacity-100" />
            ))}
          </div>
          {themeSwitch && <ThemeSwitch />}
        </div>
      </div>
    </footer>
  );
}
