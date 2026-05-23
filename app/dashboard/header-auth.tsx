"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "./actions";

export function HeaderAuth({ mobile = false }: { mobile?: boolean }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user ?? null;
      setUser(u);
      if (u) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", u.id).single();
        setRole(profile?.role ?? "client");
      }
      setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setRole(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const portalHref = role === "admin" ? "/admin" : "/dashboard";
  const portalLabel = role === "admin" ? "Admin" : "Dashboard";
  const portalDesc = role === "admin" ? "Manage clients, projects, and invoices." : "View your project, invoices, and files.";

  if (mobile) {
    if (user) {
      return (
        <div style={{ display: "flex", gap: "10px", padding: "20px" }}>
          <button
            onClick={() => startTransition(() => signOut())}
            disabled={pending}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "44px",
              borderRadius: "100px",
              border: "1px solid rgb(var(--line))",
              background: "transparent",
              fontSize: "15px",
              fontWeight: 500,
              letterSpacing: "-0.03em",
              color: "rgb(var(--fg))",
              cursor: "pointer",
              transition: "background 140ms ease",
              opacity: pending ? 0.4 : 1,
            }}
          >
            {pending ? "Signing out…" : "Sign out"}
          </button>
          <Link
            href={portalHref}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "44px",
              borderRadius: "100px",
              background: "rgb(var(--fg))",
              fontSize: "15px",
              fontWeight: 500,
              letterSpacing: "-0.03em",
              color: "rgb(var(--bg))",
              textDecoration: "none",
              transition: "opacity 140ms ease",
            }}
          >
            {portalLabel}
          </Link>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", gap: "10px", padding: "20px" }}>
        <Link
          href="/login"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "44px",
            borderRadius: "100px",
            border: "1px solid rgb(var(--line))",
            fontSize: "15px",
            fontWeight: 500,
            letterSpacing: "-0.03em",
            color: "rgb(var(--fg))",
            textDecoration: "none",
            transition: "background 140ms ease",
          }}
        >
          Sign in
        </Link>
        <Link
          href="/login?tab=signup"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "44px",
            borderRadius: "100px",
            background: "rgb(var(--fg))",
            fontSize: "15px",
            fontWeight: 500,
            letterSpacing: "-0.03em",
            color: "rgb(var(--bg))",
            textDecoration: "none",
            transition: "opacity 140ms ease",
          }}
        >
          Request access
        </Link>
      </div>
    );
  }

  const fadeStyle: React.CSSProperties = {
    opacity: ready ? 1 : 0,
    transition: ready ? "opacity 300ms ease" : "none",
  };

  if (user) {
    return (
      <div className="flex items-center gap-3" style={fadeStyle}>
        <Link
          href={portalHref}
          className="text-[13.5px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          {portalLabel}
        </Link>
        <button
          onClick={() => startTransition(() => signOut())}
          disabled={pending}
          className="inline-flex items-center rounded-full border border-[rgb(var(--line))] px-3.5 py-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:border-[rgb(var(--fg))/0.3] hover:text-[rgb(var(--fg))] transition-colors disabled:opacity-40"
        >
          {pending ? "…" : "Sign out"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" style={fadeStyle}>
      <Link
        href="/login"
        className="text-[13.5px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors px-2"
      >
        Sign in
      </Link>
      <Link
        href="/login?tab=signup"
        className="inline-flex items-center rounded-full border border-[rgb(var(--line))] px-3.5 py-1.5 text-[13px] tracking-tight text-[rgb(var(--fg))] hover:bg-[rgb(var(--line))/0.3] transition-colors"
      >
        Client portal →
      </Link>
    </div>
  );
}
