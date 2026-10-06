"use client";

import Link from "next/link";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePref } from "./theme-provider";

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

export function MinimalFooter({ themeSwitch = false }: { themeSwitch?: boolean }) {
  return (
    <footer className="w-full max-w-[80rem] mx-auto px-6 sm:px-8 py-8 flex flex-col items-start text-left sm:items-center sm:text-center gap-4">
      <div className="rise flex flex-wrap items-center gap-x-5 gap-y-2" style={{ "--rise-delay": "80ms" } as React.CSSProperties}>
        <Link href="/policies/terms-of-service" className="text-[15px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.4 }}>
          Terms of service
        </Link>
        <Link href="/policies/privacy-policy" className="text-[15px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.4 }}>
          Privacy policy
        </Link>
        <Link href="/policies/refund-policy" className="text-[15px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors" style={{ opacity: 0.4 }}>
          Refund policy
        </Link>
      </div>
      {themeSwitch && (
        <div className="rise" style={{ "--rise-delay": "120ms" } as React.CSSProperties}>
          <ThemeSwitch />
        </div>
      )}
    </footer>
  );
}

