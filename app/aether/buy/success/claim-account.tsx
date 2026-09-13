"use client";

import { useState } from "react";
import Link from "next/link";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";

type State = "idle" | "working" | "invite_sent" | "already_claimed" | "error";

function DocsLink() {
  return (
    <Link
      href="/aether/docs"
      className={`inline-flex items-center gap-2 ${ACTION_RADIUS_CLASS} px-6 py-3 text-[14px] font-medium tracking-tight border border-[rgb(var(--line))] text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.4)] transition-colors`}
    >
      Installation docs
    </Link>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ClaimAccount({ sessionId }: { sessionId?: string }) {
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // No session id means the page was opened directly rather than via Stripe's
  // redirect. There's nothing to claim, but the docs still apply.
  if (!sessionId) return <DocsLink />;

  const claim = async () => {
    if (state === "working") return;
    setState("working");
    setError("");
    try {
      const res = await fetch("/api/claim-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          body.state === "no_license"
            ? "Your license is still being issued. Try again in a moment."
            : body.error || "Could not set up your account",
        );
      }
      setEmail(body.email ?? "");
      setState(body.state === "already_claimed" ? "already_claimed" : "invite_sent");
    } catch (err: unknown) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (state === "invite_sent") {
    return (
      <div className="flex flex-col items-center gap-5">
        <p className="text-[14px] tracking-tight leading-relaxed text-[rgb(var(--muted))] max-w-sm" style={{ opacity: 0.7 }}>
          Account setup link sent to{" "}
          <span style={{ color: "rgb(var(--fg))" }}>{email}</span>. Open it to choose a
          password, then your license will be waiting in the portal.
        </p>
        <DocsLink />
      </div>
    );
  }

  if (state === "already_claimed") {
    return (
      <div className="flex flex-col items-center gap-5">
        <p className="text-[14px] tracking-tight leading-relaxed text-[rgb(var(--muted))] max-w-sm" style={{ opacity: 0.7 }}>
          You already have an account for{" "}
          <span style={{ color: "rgb(var(--fg))" }}>{email}</span>.{" "}
          <Link href="/login" className="underline hover:text-[rgb(var(--fg))] transition-colors">
            Sign in
          </Link>{" "}
          to see your license.
        </p>
        <DocsLink />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={claim}
          disabled={state === "working"}
          className={`inline-flex items-center justify-center gap-2 ${ACTION_RADIUS_CLASS} px-6 py-3 text-[14px] font-medium tracking-tight transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed`}
          style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}
        >
          {state === "working" ? <Spinner /> : null}
          {state === "working" ? "Setting up…" : "Create your account"}
        </button>
        <DocsLink />
      </div>
      <span className="text-[12px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
        Optional. Your key is in your inbox either way.
      </span>
      {state === "error" && (
        <span className="text-[13px] tracking-tight text-red-500">{error}</span>
      )}
    </div>
  );
}
