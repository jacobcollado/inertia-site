"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "./actions";

export function HeaderAuth() {
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

  if (user) {
    return (
      <div className="hidden sm:flex items-center gap-3">
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
    <div className="hidden sm:flex items-center gap-2">
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
