"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/app/theme-toggle";

function Spinner() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 animate-spin" aria-hidden="true" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ErrorMessage({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-full text-[13px] tracking-tight" style={{ background: "rgb(239 68 68 / 0.08)", color: "rgb(220 38 38)" }}>
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" />
        <line x1="8" y1="5" x2="8" y2="8.5" />
        <circle cx="8" cy="11" r="0.5" fill="currentColor" stroke="none" />
      </svg>
      {msg}
    </div>
  );
}

function GoogleButton({ onOAuth, loading, oauthProvider }: { onOAuth: () => void; loading: boolean; oauthProvider: "google" | null }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onOAuth}
      className="flex items-center justify-center gap-2.5 w-full border border-[rgb(var(--line))] py-3.5 text-[14px] tracking-tight text-[rgb(var(--fg))] rounded-full hover:border-[rgb(var(--fg))/0.4] hover:bg-[rgb(var(--line))/0.3] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {oauthProvider === "google" ? <Spinner /> : (
        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )}
      {oauthProvider === "google" ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}

const EXIT_MS = 160;
const ENTER_MS = 280;

export function LoginForm({ initialTab }: { initialTab: "signin" | "signup" }) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"signin" | "signup">(initialTab);
  const [displayedTab, setDisplayedTab] = useState<"signin" | "signup">(initialTab);
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<"google" | null>(null);

  const switchTab = (t: "signin" | "signup") => {
    if (t === tab) return;
    setError("");
    setTab(t);
    setPhase("exit");
    setTimeout(() => {
      setDisplayedTab(t);
      setPhase("enter");
      setTimeout(() => setPhase("idle"), ENTER_MS);
    }, EXIT_MS);
  };

  // Handle OAuth callback errors
  useEffect(() => {
    const oauthError = searchParams.get("error_description") ?? searchParams.get("error");
    if (oauthError) setError(oauthError.replace(/\+/g, " "));
  }, [searchParams]);

  const onOAuth = async (provider: "google") => {
    setLoading(true);
    setOauthProvider(provider);
    setError("");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const heading = displayedTab === "signin" ? "Sign in to your portal." : "Create your account.";
  const subheading = displayedTab === "signin"
    ? "View your project, invoices, and files."
    : "New or existing client. Once you're in, we'll confirm your access.";

  const contentStyle: React.CSSProperties = phase === "exit"
    ? { opacity: 0, transform: "translateY(6px) scale(0.98)", filter: "blur(2px)", transition: `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease, filter ${EXIT_MS}ms ease` }
    : phase === "enter"
    ? { opacity: 0, transform: "translateY(-6px) scale(0.98)", filter: "blur(2px)", transition: "none" }
    : { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0px)", transition: `opacity ${ENTER_MS}ms cubic-bezier(0.22,1,0.36,1), transform ${ENTER_MS}ms cubic-bezier(0.22,1,0.36,1), filter ${ENTER_MS}ms cubic-bezier(0.22,1,0.36,1)` };

  return (
    <div className="w-full min-h-screen">

      {/* Top bar — fixed so it doesn't affect centering */}
      <div className="fixed top-0 inset-x-0 z-10 px-6" style={{ height: 72 }}>
        <div className="flex items-center justify-between h-full mx-auto" style={{ maxWidth: "88rem" }}>
          <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">
            <img src="/logo.png" alt="Inertia" className="h-5 w-auto dark:invert invert-0" />
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Form — centered against full viewport */}
      <div className="min-h-screen flex items-center justify-center px-6 py-24">
        <div
          className="w-full max-w-[420px] rounded-2xl border border-[rgb(var(--line))] p-8 sm:p-10"
          style={{
            background: "rgb(var(--surface-elevated))",
            animation: "rise-in 400ms cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          <div className="flex flex-col gap-6">

            {/* Tab notch */}
            <div className="flex justify-center">
              <div className="flex items-center gap-1 rounded-full p-[3px]" style={{ background: "rgb(var(--fg) / 0.06)" }}>
                {(["signin", "signup"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => switchTab(t)}
                    className="px-4 py-1.5 text-[12px] tracking-tight rounded-full transition-all duration-200"
                    style={{
                      background: tab === t ? "var(--btn-bg)" : "transparent",
                      color: tab === t ? "var(--btn-fg)" : "rgb(var(--muted))",
                    }}
                  >
                    {t === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>
            </div>

            {/* Animated content */}
            <div style={contentStyle} className="flex flex-col gap-6">

              {/* Heading */}
              <div className="flex flex-col text-center">
                <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] opacity-50">
                  {tab === "signin" ? "Welcome back to Inertia" : "Welcome to Inertia"}
                </p>
                <h1 className="text-[2.2rem] font-medium tracking-[-0.045em] leading-[1.1] text-[rgb(var(--fg))]">
                  {heading}
                </h1>
                <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed mt-3">
                  {subheading}
                </p>
              </div>

              {/* Google button */}
              <GoogleButton onOAuth={() => onOAuth("google")} loading={loading} oauthProvider={oauthProvider} />

              {error && <ErrorMessage msg={error} />}

              {/* Switch tab link */}
              <button
                type="button"
                onClick={() => switchTab(tab === "signin" ? "signup" : "signin")}
                className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors text-center"
              >
                {displayedTab === "signin" ? "No account? Create one →" : "Already have an account? Sign in →"}
              </button>

            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
