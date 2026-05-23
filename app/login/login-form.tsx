"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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

function OAuthButtons({ onOAuth, loading, oauthProvider }: { onOAuth: (p: "google" | "apple") => void; loading: boolean; oauthProvider: "google" | "apple" | null }) {
  const btnClass =
    "flex items-center justify-center gap-2.5 flex-1 border border-[rgb(var(--line))] py-3 text-[13.5px] tracking-tight text-[rgb(var(--fg))] rounded-full hover:border-[rgb(var(--fg))/0.4] hover:bg-[rgb(var(--line))/0.3] transition-colors disabled:opacity-30 disabled:cursor-not-allowed";
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2.5">
        <button type="button" disabled={loading} onClick={() => onOAuth("google")} className={btnClass}>
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
        <button type="button" disabled={loading} onClick={() => onOAuth("apple")} className={btnClass}>
          {oauthProvider === "apple" ? <Spinner /> : (
            <svg viewBox="0 0 814 1000" className="w-3.5 h-3.5 shrink-0" fill="currentColor" aria-hidden="true">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.1 46.4 42.8 0 109.6-49 191.4-49 30.8 0 132.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
            </svg>
          )}
          {oauthProvider === "apple" ? "Redirecting…" : "Continue with Apple"}
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[rgb(var(--line))]" />
        <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-40">or</span>
        <div className="flex-1 h-px bg-[rgb(var(--line))]" />
      </div>
    </div>
  );
}

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","guerrillamail.net","guerrillamail.org",
  "guerrillamail.de","guerrillamail.biz","guerrillamail.info","sharklasers.com",
  "guerrillamailblock.com","spam4.me","trashmail.com","trashmail.me","trashmail.net",
  "trashmail.org","trashmail.io","trashmail.at","trashmail.de","trashmail.eu",
  "trashmail.me","dispostable.com","mailnull.com","spamgourmet.com","spamgourmet.net",
  "yopmail.com","yopmail.fr","cool.fr.nf","jetable.fr.nf","nospam.ze.tc",
  "nomail.xl.cx","mega.zik.dj","speed.1s.fr","courriel.fr.nf","moncourrier.fr.nf",
  "monemail.fr.nf","monmail.fr.nf","maildrop.cc","spamfree24.org","spamfree24.de",
  "spamfree24.eu","spamfree24.net","spamfree24.info","throwam.com","throwaway.email",
  "tempmail.com","temp-mail.org","tempr.email","discard.email","fakeinbox.com",
  "mailnesia.com","mailnull.com","spamhole.com","spamspot.com","spamthisplease.com",
  "tempemail.net","tempinbox.com","tempomail.fr","temporaryemail.net","throwam.com",
  "getairmail.com","filzmail.com","email-fake.com","crazymailing.com",
]);

function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak", color: "rgb(239 68 68)" };
  if (score <= 3) return { score, label: "Fair", color: "rgb(234 179 8)" };
  return { score, label: "Strong", color: "rgb(34 197 94)" };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label, color } = passwordStrength(password);
  if (!password) return null;
  return (
    <div className="flex items-center gap-2.5 px-1">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? color : "rgb(var(--line))" }} />
        ))}
      </div>
      <span className="text-[11px] tracking-tight transition-colors duration-300" style={{ color, minWidth: 36, textAlign: "right" }}>{label}</span>
    </div>
  );
}

export function LoginForm({ initialTab }: { initialTab: "signin" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"signin" | "signup">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<"google" | "apple" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [honeypot, setHoneypot] = useState("");
  const mountTime = useRef(Date.now());

  const reset = () => { setEmail(""); setPassword(""); setName(""); setError(""); setMessage(""); setShowPassword(false); };
  const switchTab = (t: "signin" | "signup") => { setTab(t); reset(); mountTime.current = Date.now(); };

  // Clear password from state on unmount
  useEffect(() => () => { setPassword(""); }, []);

  // Handle OAuth callback errors
  useEffect(() => {
    const oauthError = searchParams.get("error_description") ?? searchParams.get("error");
    if (oauthError) setError(oauthError.replace(/\+/g, " "));
  }, [searchParams]);

  const isBotSubmission = () => {
    if (honeypot) return true;
    if (Date.now() - mountTime.current < 2000) return true;
    return false;
  };

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
      } else if (msg.includes("rate") || msg.includes("too many") || msg.includes("429")) {
        setError("Too many attempts. Wait a few minutes and try again.");
      } else {
        setError("Wrong email or password.");
      }
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    const dest = profile?.role === "admin" ? "/admin" : "/dashboard";
    setRedirecting(true);
    router.push(dest);
    router.refresh();
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBotSubmission()) return;
    if (isDisposableEmail(email)) {
      setError("Please use a real email address.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("rate") || msg.includes("too many") || msg.includes("429")) {
        setError("Too many attempts. Wait a few minutes and try again.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }
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
    setOauthProvider(provider);
    setError("");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const inputClass =
    "w-full bg-transparent border border-[rgb(var(--line))] rounded-full px-4 py-3 text-[16px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-35 focus:outline-none focus:border-[rgb(var(--fg)/0.5)] transition-colors duration-200";

  if (redirecting) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4">
        <Spinner />
        <p className="text-[13px] tracking-tight text-[rgb(var(--muted))]">Signing you in…</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 sm:px-12 h-14 border-b border-[rgb(var(--line))] shrink-0">
        <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">
          <img src="/logo.png" alt="Inertia" className="h-4 w-auto dark:invert invert-0" />
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
              {t === "signin" ? "Sign in" : "Create account"}
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
                Confirm your email.
              </h1>
              <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                We sent a link to <span className="text-[rgb(var(--fg))]">{email}</span>. Click it to activate your account.
              </p>
            </div>

          ) : tab === "signin" ? (
            <div className="flex flex-col gap-10">
              {forgotMode ? (
                resetSent ? (
                  <div className="flex flex-col gap-6">
                    <h1 className="text-[2.2rem] font-medium tracking-[-0.04em] leading-tight text-[rgb(var(--fg))]">
                      Check your email.
                    </h1>
                    <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                      We sent a password reset link to <span className="text-[rgb(var(--fg))]">{email}</span>.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-2">
                      <h1 className="text-[2.2rem] font-medium tracking-[-0.04em] leading-tight text-[rgb(var(--fg))]">
                        Forgot your password?
                      </h1>
                      <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                        Enter your email and we'll send a reset link.
                      </p>
                    </div>
                    <form onSubmit={onForgot} className="flex flex-col gap-4" noValidate>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email" autoComplete="email" className={inputClass} />
                      {error && <ErrorMessage msg={error} />}
                      <div className="flex items-center gap-5 mt-2">
                        <button type="submit" disabled={loading || !email}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13.5px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity duration-150 disabled:opacity-20 disabled:cursor-not-allowed">
                          {loading ? <><Spinner />Sending…</> : <>Send reset link <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>}
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
                      Sign in to your portal.
                    </h1>
                    <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                      View your project, invoices, and files.
                    </p>
                  </div>
                  <OAuthButtons onOAuth={onOAuth} loading={loading} oauthProvider={oauthProvider} />
                  <form onSubmit={onSignIn} className="flex flex-col gap-4" noValidate>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email" autoComplete="email" className={inputClass} />
                    <div className="flex flex-col gap-1.5">
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password" autoComplete="current-password" className={`${inputClass} pr-10`} />
                        <button type="button" onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 inset-y-0 flex items-center text-[rgb(var(--muted))] opacity-40 hover:opacity-80 transition-opacity" aria-label={showPassword ? "Hide password" : "Show password"}>
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
                      <button type="button" onClick={() => { setForgotMode(true); setError(""); }}
                        className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-50 hover:opacity-100 transition-opacity self-end">
                        Forgot password?
                      </button>
                    </div>
                    {error && <ErrorMessage msg={error} />}
                    <div className="flex items-center gap-5 mt-2">
                      <button type="submit" disabled={loading || !email || !password}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13.5px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity duration-150 disabled:opacity-20 disabled:cursor-not-allowed">
                        {loading && !oauthProvider ? <><Spinner />Signing in…</> : <>Sign in <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>}
                      </button>
                      <button type="button" onClick={() => switchTab("signup")}
                        className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors underline underline-offset-2 decoration-[rgb(var(--line))]">
                        Create account →
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>

          ) : (
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-2">
                <h1 className="text-[2.2rem] font-medium tracking-[-0.04em] leading-tight text-[rgb(var(--fg))]">
                  Create your account.
                </h1>
                <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                  New or existing client. Once you're set up, we'll confirm your access and get things moving.
                </p>
              </div>
              <OAuthButtons onOAuth={onOAuth} loading={loading} oauthProvider={oauthProvider} />
              <form onSubmit={onSignUp} className="flex flex-col gap-4" noValidate>
                {/* Honeypot — hidden from real users, bots fill it */}
                <input
                  type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1} autoComplete="off" aria-hidden="true"
                  style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
                />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name" autoComplete="name" className={inputClass} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email" autoComplete="email" className={inputClass} />
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" autoComplete="new-password" className={`${inputClass} pr-10`} />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 inset-y-0 flex items-center text-[rgb(var(--muted))] opacity-40 hover:opacity-80 transition-opacity" aria-label={showPassword ? "Hide password" : "Show password"}>
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
                <PasswordStrengthBar password={password} />
                {error && <ErrorMessage msg={error} />}
                <div className="flex items-center gap-5 mt-2">
                  <button type="submit" disabled={loading || !email || !password}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13.5px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity duration-150 disabled:opacity-20 disabled:cursor-not-allowed">
                    {loading && !oauthProvider ? <><Spinner />Creating account…</> : <>Create account <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>}
                  </button>
                  <button type="button" onClick={() => switchTab("signin")}
                    className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors underline underline-offset-2 decoration-[rgb(var(--line))]">
                    Sign in →
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
