"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/app/theme-toggle";

type Phase = "checking" | "verifying" | "expired" | "set-password" | "done";

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

const EyeIcon = ({ crossed }: { crossed: boolean }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" />
    <circle cx="10" cy="10" r="2.5" />
    {crossed && <line x1="3" y1="3" x2="17" y2="17" />}
  </svg>
);

export function AcceptInviteForm() {
  const router = useRouter();
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

    // Unlike password recovery, Supabase's invite link uses the implicit
    // flow — the tokens arrive in the URL hash fragment (#access_token=...),
    // which never reaches the server, so there's no /auth/callback exchange
    // step here. createClient() auto-detects and consumes that fragment on
    // construction, so by the time this runs the session may already exist;
    // if not yet, onAuthStateChange below catches it once detection finishes.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setPhaseTracked("set-password"); return; }
      setPhaseTracked("verifying");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setPhaseTracked("set-password");
    });
    const timeout = setTimeout(() => {
      if (phaseRef.current === "verifying") setPhaseTracked("expired");
    }, 5000);
    return () => { subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

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

  const inputClass = "w-full px-4 py-3 text-[14px] tracking-tight rounded-xl outline-none transition-colors bg-[rgb(var(--fg)/0.035)] placeholder:text-[rgb(var(--muted))] placeholder:opacity-70";
  const inputStyle: React.CSSProperties = { border: "1.5px solid rgb(var(--fg) / 0.14)", color: "rgb(var(--fg))" };
  const onInputFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = "rgb(var(--fg) / 0.4)");
  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = "rgb(var(--fg) / 0.14)");

  const submitButtonClass = "flex items-center justify-center gap-2.5 w-full py-2.5 text-[14px] font-medium tracking-tight rounded-full transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed";
  const submitButtonStyle: React.CSSProperties = { background: "rgb(var(--fg))", color: "rgb(var(--bg))" };

  return (
    <div className="w-full min-h-screen">
      <div className="fixed top-0 inset-x-0 z-10 px-6" style={{ height: 72 }}>
        <div className="flex items-center justify-between h-full mx-auto" style={{ maxWidth: "88rem" }}>
          <Link href="/">
            <img src="/logo.png" alt="Inertia" className="h-6 w-auto" style={{ display: "block" }} />
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        <div
          className="w-full max-w-[420px] rounded-2xl border border-[rgb(var(--line))] p-8 sm:p-10"
          style={{
            position: "relative",
            overflow: "hidden",
            background: "rgb(var(--surface-elevated))",
            animation: "rise-in 400ms cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {phase === "checking" || phase === "verifying" ? (
            <div className="flex flex-col gap-4">
              <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] opacity-70">Verifying your invite…</p>
            </div>
          ) : phase === "done" ? (
            <div className="flex flex-col text-center gap-3">
              <h1 className="text-[2.2rem] font-medium tracking-[-0.045em] leading-[1.1] text-[rgb(var(--fg))]">
                You&rsquo;re all set
              </h1>
              <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                Taking you to your dashboard…
              </p>
            </div>
          ) : phase === "expired" ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col text-center">
                <h1 className="text-[2.2rem] font-medium tracking-[-0.045em] leading-[1.1] text-[rgb(var(--fg))]">
                  Link expired
                </h1>
                <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed mt-3">
                  This invite link is no longer valid. Contact us for a new one.
                </p>
              </div>
              <Link href="/login" className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors text-center">
                Back to sign in
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col text-center">
                <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] opacity-50 mb-2">Inertia</p>
                <h1 className="text-[2.2rem] font-medium tracking-[-0.045em] leading-[1.1] text-[rgb(var(--fg))]">
                  Welcome. Set a password
                </h1>
                <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed mt-3">
                  Choose a password to finish setting up your client portal.
                </p>
              </div>
              <form onSubmit={onSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete="new-password"
                    className={inputClass}
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[rgb(var(--muted))] opacity-50 hover:opacity-90 transition-opacity"
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    <EyeIcon crossed={showPassword} />
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    className={inputClass}
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[rgb(var(--muted))] opacity-50 hover:opacity-90 transition-opacity"
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    <EyeIcon crossed={showPassword} />
                  </button>
                </div>
                {error && <ErrorMessage msg={error} />}
                <button type="submit" disabled={loading || !password || !confirm} className={submitButtonClass} style={submitButtonStyle}>
                  {loading ? <Spinner /> : null}
                  {loading ? "Saving…" : "Set password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
