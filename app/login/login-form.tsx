"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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

      {/* Form — vertically centered */}
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
