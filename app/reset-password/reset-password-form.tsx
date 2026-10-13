"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ThemeSwitch } from "@/app/site-footer";
import { RoomsArt } from "@/components/rooms-art";
import { useMounted } from "@/hooks/use-mounted";

// The reset password page, laid out like /login (app/login/login-form.tsx):
// the form on the paper on the site's column, the homepage's rooms beside
// it, the heading in the hero's display type. Each step is a heading, one
// line, and at most one form.

type Phase = "checking" | "request" | "sent" | "verifying" | "expired" | "set-password" | "done";

const TITLE = "text-[clamp(2.3rem,9vw,3rem)] sm:text-[clamp(2.6rem,4.4vw,3.6rem)] tracking-[-0.05em] leading-[0.95]";
const LINE = "text-[16px] sm:text-[17px] leading-relaxed tracking-tight text-pretty";
const UI = "text-[14px] sm:text-[14.5px] tracking-tight";
const INPUT = "w-full h-12 px-4 text-[16px] tracking-tight rounded-[6px] outline-none transition-shadow duration-200 text-[var(--ink)] bg-[var(--tile)] focus:shadow-[0_0_0_1.5px_var(--ink)] placeholder:text-[var(--ink-4)]";
const PRIMARY = "flex items-center justify-center gap-2.5 w-full py-3 text-[15px] sm:text-[16px] tracking-tight rounded-[6px] transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed";

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
    <div className={`flex items-start gap-2.5 rounded-[6px] px-3.5 py-3 ${UI}`} style={{ background: "rgb(220 38 38 / 0.06)", color: "var(--ink)" }}>
      <svg viewBox="0 0 16 16" className="mt-0.5 w-3.5 h-3.5 shrink-0" fill="none" stroke="rgb(220 38 38)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" />
        <line x1="8" y1="5" x2="8" y2="8.5" />
        <circle cx="8" cy="11" r="0.5" fill="rgb(220 38 38)" stroke="none" />
      </svg>
      {msg}
    </div>
  );
}

const EyeIcon = ({ crossed }: { crossed: boolean }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" />
    <circle cx="8" cy="8" r="2" />
    {crossed && <line x1="2.5" y1="13.5" x2="13.5" y2="2.5" />}
  </svg>
);

function BackToSignIn() {
  return (
    <Link href="/login" className={`${UI} self-start text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]`}>
      Back to sign in
    </Link>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const mounted = useMounted();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<Phase>("checking");
  const phaseRef = useRef<Phase>("checking");

  const setPhaseTracked = (p: Phase) => { phaseRef.current = p; setPhase(p); };

  useEffect(() => {
    const supabase = createClient();
    const hasRecoveryParams = typeof window !== "undefined" && /type=recovery|code=/.test(window.location.search + window.location.hash);

    // The recovery session is established server-side by /auth/callback
    // before this page loads (PKCE flow), so the PASSWORD_RECOVERY event
    // from onAuthStateChange never fires client-side. Check for the
    // resulting session directly instead.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setPhaseTracked("set-password"); return; }
      if (!hasRecoveryParams) { setPhaseTracked("request"); return; }
      setPhaseTracked("verifying");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setPhaseTracked("set-password");
    });
    const timeout = setTimeout(() => {
      if (phaseRef.current === "verifying") setPhaseTracked("expired");
    }, 5000);
    return () => { subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

  const onRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    setLoading(false);
    // Always show success, even on error, so this can't be used to enumerate
    // which emails have accounts.
    if (error) console.error(error);
    setPhaseTracked("sent");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setPhaseTracked("done");
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  const passwordField = (value: string, onChange: (v: string) => void, placeholder: string) => (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        required
        minLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="new-password"
        className={INPUT}
        style={{ paddingRight: 48 }}
      />
      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
        className="absolute right-2 top-1/2 -translate-y-1/2 flex size-[30px] items-center justify-center rounded-md text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
      >
        <EyeIcon crossed={showPassword} />
      </button>
    </div>
  );

  // Each step: its heading, one line under it, and what to do.
  const step: { title: string; line: ReactNode; body?: ReactNode } = (() => {
    switch (phase) {
      case "checking":
      case "verifying":
        return { title: "One moment.", line: phase === "checking" ? "Getting things ready." : "Checking your link." };
      case "request":
        return {
          title: "Reset your password.",
          line: "Enter the email you sign in with and we'll send you a link to set a new one.",
          body: (
            <>
              <form onSubmit={onRequestSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  aria-label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={INPUT}
                />
                <button type="submit" disabled={loading || !email.trim()} className={PRIMARY} style={{ background: "var(--ink)", color: "var(--paper)", fontWeight: 450 }}>
                  {loading ? <Spinner /> : null}
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
              <BackToSignIn />
            </>
          ),
        };
      case "sent":
        return {
          title: "Check your email.",
          line: (
            <>
              If an account exists for <span style={{ color: "var(--ink)" }}>{email}</span>, we&apos;ve sent a link to reset your password.
            </>
          ),
          body: <BackToSignIn />,
        };
      case "expired":
        return {
          title: "Link expired.",
          line: "This reset link is no longer valid. Send yourself a new one.",
          body: (
            <>
              <button type="button" onClick={() => setPhaseTracked("request")} className={PRIMARY} style={{ background: "var(--ink)", color: "var(--paper)", fontWeight: 450 }}>
                Send a new link
              </button>
              <BackToSignIn />
            </>
          ),
        };
      case "done":
        return { title: "Password updated.", line: "Taking you to your dashboard." };
      default:
        return {
          title: "Set a new password.",
          line: "At least 6 characters. You'll go straight to your dashboard after.",
          body: (
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              {passwordField(password, setPassword, "New password")}
              {passwordField(confirm, setConfirm, "Confirm password")}
              {error && <ErrorMessage msg={error} />}
              <button type="submit" disabled={loading || !password || !confirm} className={`${PRIMARY} mt-1`} style={{ background: "var(--ink)", color: "var(--paper)", fontWeight: 450 }}>
                {loading ? <Spinner /> : null}
                {loading ? "Saving…" : "Set password"}
              </button>
            </form>
          ),
        };
    }
  })();

  // The rooms walk forward while a request is out, and all the way in once
  // the new password is set, on the way to the dashboard.
  const advance = phase === "done" ? 1 : loading ? 0.6 : 0;

  return (
    <div className="w-full">
      {/* The site header (app/visual-notch.tsx) sits above, 56px tall. */}
      <div className="min-h-[calc(100dvh-56px)] flex flex-col w-full max-w-[80rem] mx-auto px-6 sm:px-8">
        <div className="grid flex-1 content-start gap-6 pt-4 pb-10 sm:pt-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:content-center lg:items-center lg:gap-20 lg:py-10">
          <div className="order-1 lg:order-2" aria-hidden="true">
            {mounted && <RoomsArt frame="aspect-[16/10] w-full lg:aspect-[5/4]" advance={advance} delay={120} />}
          </div>

          {/* Keyed on the step, so each one settles in as it arrives. */}
          <div key={phase} className="order-2 lg:order-1 w-full max-w-[26rem]" style={{ animation: "rise-in 500ms cubic-bezier(0.22,1,0.36,1) both" }}>
            <h1 className={TITLE} style={{ color: "var(--ink)", fontWeight: 420 }}>
              {step.title}
            </h1>
            <p className={`${LINE} mt-4 sm:mt-5`} style={{ color: "var(--ink-2)" }}>
              {step.line}
            </p>
            {step.body && <div className="mt-8 sm:mt-10 flex flex-col gap-5">{step.body}</div>}
          </div>
        </div>

        <div className="flex shrink-0 pb-6 sm:pb-8">
          <ThemeSwitch />
        </div>
      </div>
    </div>
  );
}
