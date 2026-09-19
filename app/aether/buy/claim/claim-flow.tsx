"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ACTION_RADIUS_CLASS } from "@/lib/cta-chrome";

type State = "working" | "invite_sent" | "already_claimed" | "error";

function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function DocsLink({ label = "Installation docs" }: { label?: string }) {
  return (
    <Link
      href="/aether/docs"
      className={`inline-flex items-center gap-2 ${ACTION_RADIUS_CLASS} px-6 py-3 text-[14px] font-medium tracking-tight border border-[rgb(var(--line))] text-[rgb(var(--fg))] hover:border-[rgb(var(--fg)/0.4)] transition-colors`}
    >
      {label}
    </Link>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-4">
      {children}
    </h1>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[15px] tracking-tight leading-relaxed text-[rgb(var(--muted))] max-w-sm mb-8"
      style={{ opacity: 0.7 }}
    >
      {children}
    </p>
  );
}

export function ClaimFlow({ sessionId }: { sessionId?: string }) {
  const [state, setState] = useState<State>("working");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  // The claim runs on mount rather than on a click. React 18 StrictMode in dev
  // mounts effects twice, and this one invites a user, so it's guarded.
  const started = useRef(false);

  useEffect(() => {
    if (!sessionId || started.current) return;
    started.current = true;

    (async () => {
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
              ? "Your license is still being issued. Refresh in a moment and we'll pick up where we left off."
              : body.error || "We couldn't set up your account",
          );
        }
        setEmail(body.email ?? "");
        setState(body.state === "already_claimed" ? "already_claimed" : "invite_sent");
      } catch (err: unknown) {
        setState("error");
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    })();
  }, [sessionId]);

  // Opened without a session id, so there's nothing to claim. Most likely a
  // forwarded or hand-edited link.
  if (!sessionId) {
    return (
      <>
        <Heading>Nothing to set up</Heading>
        <Body>
          This link is missing its purchase details. If you bought Aether, your license key is
          in your email, and you can create an account from that message.
        </Body>
        <DocsLink />
      </>
    );
  }

  if (state === "working") {
    return (
      <>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6 text-[rgb(var(--muted))]">
          <Spinner />
        </div>
        <Heading>Setting up your account</Heading>
        <Body>This takes just a moment.</Body>
      </>
    );
  }

  if (state === "invite_sent") {
    return (
      <>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
          style={{ background: "rgb(var(--green) / 0.15)" }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: "rgb(var(--green))" }} aria-hidden="true">
            <polyline points="2 8 6 12 14 4" />
          </svg>
        </div>
        <Heading>Check your inbox</Heading>
        <Body>
          We sent a setup link to{" "}
          <span style={{ color: "rgb(var(--fg))" }}>{email}</span>. Open it to choose a password,
          then your license and receipt will be waiting in your dashboard.
        </Body>
        <DocsLink />
      </>
    );
  }

  if (state === "already_claimed") {
    return (
      <>
        <Heading>You already have an account</Heading>
        <Body>
          There's already an account for{" "}
          <span style={{ color: "rgb(var(--fg))" }}>{email}</span>. Sign in and your license will
          be waiting.
        </Body>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className={`inline-flex items-center justify-center gap-2 ${ACTION_RADIUS_CLASS} px-6 py-3 text-[14px] font-medium tracking-tight transition-opacity hover:opacity-85`}
            style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}
          >
            Sign in
          </Link>
          <DocsLink />
        </div>
      </>
    );
  }

  return (
    <>
      <Heading>We hit a snag</Heading>
      <Body>{error}</Body>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={`inline-flex items-center justify-center gap-2 ${ACTION_RADIUS_CLASS} px-6 py-3 text-[14px] font-medium tracking-tight transition-opacity hover:opacity-85`}
          style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}
        >
          Try again
        </button>
        <DocsLink />
      </div>
      <span className="text-[12px] tracking-tight text-[rgb(var(--muted))] mt-4" style={{ opacity: 0.5 }}>
        Your license key is in your email either way.
      </span>
    </>
  );
}
