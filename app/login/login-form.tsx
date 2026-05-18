"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function OAuthButtons({ onOAuth, loading }: { onOAuth: (p: "google" | "apple") => void; loading: boolean }) {
  const btnClass =
    "flex items-center justify-center gap-2.5 w-full border border-[rgb(var(--line))] py-3 text-[14px] tracking-tight text-[rgb(var(--fg))] hover:border-[rgb(var(--fg))/0.4] hover:bg-[rgb(var(--line))/0.3] transition-colors disabled:opacity-30 disabled:cursor-not-allowed";
  return (
    <div className="flex flex-col gap-3">
      <button type="button" disabled={loading} onClick={() => onOAuth("google")} className={btnClass}>
        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
      <button type="button" disabled={loading} onClick={() => onOAuth("apple")} className={btnClass}>
        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M16.05 1c-1.27.08-2.76.9-3.63 1.96-.79.96-1.44 2.4-1.19 3.8 1.39.04 2.82-.8 3.66-1.87.79-.99 1.37-2.42 1.16-3.89zM20.95 17.9c-.6 1.32-1.3 2.52-2.33 3.59-.76.8-1.55 1.52-2.69 1.54-1.1.02-1.47-.67-2.74-.67-1.27 0-1.68.65-2.73.69-1.1.04-1.95-.78-2.72-1.58C5.5 19.07 4.1 15.9 4.1 12.85c0-3.5 2.26-5.35 4.48-5.38 1.1-.02 2.14.74 2.82.74.67 0 1.93-.91 3.26-.78.56.02 2.12.22 3.12 1.69-.08.05-1.86 1.1-1.84 3.27.02 2.6 2.26 3.46 2.28 3.47-.02.07-.35 1.24-1.27 2.04z"/>
        </svg>
        Continue with Apple
      </button>
      <div className="flex items-center gap-3 pt-1">
        <div className="flex-1 h-px bg-[rgb(var(--line))]" />
        <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40">or</span>
        <div className="flex-1 h-px bg-[rgb(var(--line))]" />
      </div>
    </div>
  );
}

export function LoginForm({ initialTab }: { initialTab: "signin" | "signup" }) {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const reset = () => { setEmail(""); setPassword(""); setName(""); setError(""); setMessage(""); };
  const switchTab = (t: "signin" | "signup") => { setTab(t); reset(); };

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("banned") || msg.includes("suspended")) {
        setError("Your account has been suspended. Contact us at hello@byinertia.com.");
      } else {
        setError("Wrong email or password.");
      }
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    const dest = profile?.role === "admin" ? "/admin" : "/dashboard";
    router.push(dest);
    router.refresh();
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setMessage("Check your email to confirm your account.");
    setLoading(false);
  };

  const onForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setResetSent(true);
  };

  const onOAuth = async (provider: "google" | "apple") => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const inputClass =
    "w-full bg-transparent border-b border-[rgb(var(--line))] py-4 text-[16px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-35 focus:outline-none focus:border-[rgb(var(--fg))] transition-colors duration-200";

  return (
    <div className="w-full min-h-screen flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 sm:px-12 h-14 border-b border-[rgb(var(--line))] shrink-0">
        <Link href="/" className="text-[13px] tracking-tight text-[rgb(var(--fg))] opacity-70 hover:opacity-100 transition-opacity">
          ← Inertia
        </Link>
        <div className="flex items-center gap-1 border border-[rgb(var(--line))] rounded-full p-[3px]">
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className="px-4 py-1.5 text-[12px] tracking-tight rounded-full transition-all duration-200"
              style={{
                background: tab === t ? "rgb(var(--fg))" : "transparent",
                color: tab === t ? "rgb(var(--bg))" : "rgb(var(--muted))",
              }}
            >
              {t === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>
      </div>

      {/* Form - vertically centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]" style={{ animation: "rise-in 400ms cubic-bezier(0.22,1,0.36,1) both" }}>

          {message ? (
            <div className="flex flex-col gap-6">
              <h1 className="text-[2rem] font-medium tracking-[-0.04em] leading-tight text-[rgb(var(--fg))]">
                Check your inbox.
              </h1>
              <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                We sent a confirmation link to <span className="text-[rgb(var(--fg))]">{email}</span>. Once confirmed, you're in.
              </p>
              <button onClick={() => switchTab("signin")}
                className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors self-start">
                Back to sign in →
              </button>
            </div>

          ) : tab === "signin" ? (
            <div className="flex flex-col gap-10">
              {forgotMode ? (
                resetSent ? (
                  <div className="flex flex-col gap-6">
                    <h1 className="text-[2.2rem] font-medium tracking-[-0.04em] leading-tight text-[rgb(var(--fg))]">
                      Check your inbox.
                    </h1>
                    <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                      We sent a reset link to <span className="text-[rgb(var(--fg))]">{email}</span>. Click it to set a new password.
                    </p>
                    <button onClick={() => { setForgotMode(false); setResetSent(false); setEmail(""); }}
                      className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors self-start">
                      Back to sign in
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-2">
                      <h1 className="text-[2.2rem] font-medium tracking-[-0.04em] leading-tight text-[rgb(var(--fg))]">
                        Reset your password.
                      </h1>
                      <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                        Enter your email and we'll send you a link.
                      </p>
                    </div>
                    <form onSubmit={onForgot} className="flex flex-col gap-8" noValidate>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email" autoComplete="email" className={inputClass} />
                      {error && <p className="text-[13px] tracking-tight text-red-500 -mt-4">{error}</p>}
                      <div className="flex items-center gap-5">
                        <button type="submit" disabled={loading || !email}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13.5px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity duration-150 disabled:opacity-20 disabled:cursor-not-allowed">
                          {loading ? "Sending…" : "Send reset link"}
                          {!loading && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                          )}
                        </button>
                        <button type="button" onClick={() => { setForgotMode(false); setError(""); }}
                          className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <h1 className="text-[2.2rem] font-medium tracking-[-0.04em] leading-tight text-[rgb(var(--fg))]">
                      Good to have you back.
                    </h1>
                    <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                      Your project is waiting.
                    </p>
                  </div>
                  <OAuthButtons onOAuth={onOAuth} loading={loading} />
                  <form onSubmit={onSignIn} className="flex flex-col gap-8" noValidate>
                    <div className="flex flex-col gap-5">
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email" autoComplete="email" className={inputClass} />
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password" autoComplete="current-password" className={`${inputClass} pr-10`} />
                        <button type="button" onClick={() => setShowPassword(v => !v)}
                          className="absolute right-0 inset-y-0 flex items-center text-[rgb(var(--muted))] opacity-40 hover:opacity-80 transition-opacity" aria-label={showPassword ? "Hide password" : "Show password"}>
                          {showPassword ? (
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
                              <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" /><circle cx="10" cy="10" r="2.5" /><line x1="3" y1="3" x2="17" y2="17" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
                              <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" /><circle cx="10" cy="10" r="2.5" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    {error && <p className="text-[13px] tracking-tight text-red-500 -mt-4">{error}</p>}
                    <div className="flex items-center gap-5">
                      <button type="submit" disabled={loading || !email || !password}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13.5px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity duration-150 disabled:opacity-20 disabled:cursor-not-allowed">
                        {loading ? "Signing in…" : "Sign in"}
                        {!loading && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                          </svg>
                        )}
                      </button>
                      <button type="button" onClick={() => switchTab("signup")}
                        className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
                        New here?
                      </button>
                    </div>
                    <button type="button" onClick={() => { setForgotMode(true); setError(""); }}
                      className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50 hover:opacity-100 transition-opacity self-start -mt-4">
                      Forgot password?
                    </button>
                  </form>
                </>
              )}
            </div>

          ) : (
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-2">
                <h1 className="text-[2.2rem] font-medium tracking-[-0.04em] leading-tight text-[rgb(var(--fg))]">
                  Let's get you in.
                </h1>
                <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                  Already working with us? Create your account and we'll confirm access once your project is set up.
                </p>
              </div>
              <OAuthButtons onOAuth={onOAuth} loading={loading} />
              <form onSubmit={onSignUp} className="flex flex-col gap-8" noValidate>
                <div className="flex flex-col gap-5">
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Your name" autoComplete="name" className={inputClass} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email" autoComplete="email" className={inputClass} />
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password" autoComplete="new-password" className={`${inputClass} pr-10`} />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-0 inset-y-0 flex items-center text-[rgb(var(--muted))] opacity-40 hover:opacity-80 transition-opacity" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? (
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
                          <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" /><circle cx="10" cy="10" r="2.5" /><line x1="3" y1="3" x2="17" y2="17" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
                          <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" /><circle cx="10" cy="10" r="2.5" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {error && <p className="text-[13px] tracking-tight text-red-500 -mt-4">{error}</p>}
                <div className="flex items-center gap-5">
                  <button type="submit" disabled={loading || !email || !password}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13.5px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity duration-150 disabled:opacity-20 disabled:cursor-not-allowed">
                    {loading ? "Requesting…" : "Request access"}
                    {!loading && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    )}
                  </button>
                  <button type="button" onClick={() => switchTab("signin")}
                    className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
                    Already in?
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Bottom bar */}
      <div className="shrink-0 px-6 sm:px-12 h-12 border-t border-[rgb(var(--line))] flex items-center">
        <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-30">
          Built for clients who care about their build.
        </span>
      </div>

    </div>
  );
}
