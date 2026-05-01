"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "./actions";

export function HeaderAuth({ mobile = false }: { mobile?: boolean }) {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!ready) return null;

  if (mobile) {
    if (user) {
      return (
        <>
          <Link href="/dashboard" className="mobile-nav__item">
            <span className="mobile-nav__item-icon">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }} aria-hidden="true">
                <path d="M3 8.5L10 3l7 5.5V17H13v-4H7v4H3V8.5z" />
              </svg>
            </span>
            <span className="mobile-nav__item-text">
              <span className="mobile-nav__item-label">Dashboard</span>
              <span className="mobile-nav__item-desc">View your project, invoices, and files.</span>
            </span>
          </Link>
          <button
            onClick={() => startTransition(() => signOut())}
            disabled={pending}
            className="mobile-nav__item w-full text-left disabled:opacity-40"
          >
            <span className="mobile-nav__item-icon">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }} aria-hidden="true">
                <path d="M13 15l3-5-3-5M16 10H7M7 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3" />
              </svg>
            </span>
            <span className="mobile-nav__item-text">
              <span className="mobile-nav__item-label">{pending ? "Signing out…" : "Sign out"}</span>
              <span className="mobile-nav__item-desc">End your current session.</span>
            </span>
          </button>
        </>
      );
    }
    return (
      <>
        <Link href="/login" className="mobile-nav__item">
          <span className="mobile-nav__item-icon">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }} aria-hidden="true">
              <path d="M10 3H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h5M13 7l4 3-4 3M7 10h10" />
            </svg>
          </span>
          <span className="mobile-nav__item-text">
            <span className="mobile-nav__item-label">Sign in</span>
            <span className="mobile-nav__item-desc">Access your client portal.</span>
          </span>
        </Link>
        <Link href="/login?tab=signup" className="mobile-nav__item">
          <span className="mobile-nav__item-icon">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }} aria-hidden="true">
              <path d="M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM3 17a7 7 0 0 1 11.95-4.95" />
              <path d="M16 13v6M13 16h6" />
            </svg>
          </span>
          <span className="mobile-nav__item-text">
            <span className="mobile-nav__item-label">Request access</span>
            <span className="mobile-nav__item-desc">Already a client? Get set up here.</span>
          </span>
        </Link>
      </>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          Dashboard
        </Link>
        <button
          onClick={() => startTransition(() => signOut())}
          disabled={pending}
          className="inline-flex items-center rounded-full border border-[rgb(var(--line))] px-3.5 py-1.5 text-[12px] tracking-tight text-[rgb(var(--muted))] hover:border-[rgb(var(--fg))/0.3] hover:text-[rgb(var(--fg))] transition-colors disabled:opacity-40"
        >
          {pending ? "…" : "Sign out"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors px-2"
      >
        Sign in
      </Link>
      <Link
        href="/login?tab=signup"
        className="inline-flex items-center rounded-full border border-[rgb(var(--line))] px-3.5 py-1.5 text-[12px] tracking-tight text-[rgb(var(--fg))] hover:bg-[rgb(var(--line))/0.3] transition-colors"
      >
        Client portal →
      </Link>
    </div>
  );
}
