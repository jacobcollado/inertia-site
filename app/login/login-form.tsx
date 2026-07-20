"use client";

import { useState, useEffect, useRef } from "react";
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

function InfoMessage({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-full text-[13px] tracking-tight" style={{ background: "rgb(10 132 255 / 0.08)", color: "#0a84ff" }}>
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
        <path d="M2 4l6 4.5L14 4" />
      </svg>
      {msg}
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="flex-1 h-px" style={{ background: "rgb(var(--line))" }} />
      <span className="text-[12px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>or</span>
      <div className="flex-1 h-px" style={{ background: "rgb(var(--line))" }} />
    </div>
  );
}

function EmailToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-center gap-2 w-full py-2.5 text-[14px] tracking-tight rounded-full transition-colors hover:bg-[rgb(var(--fg)/0.1)]"
      style={{ background: "rgb(var(--fg) / 0.06)", color: "rgb(var(--fg))" }}
    >
      Continue with email
    </button>
  );
}

function EmailForm({
  mode,
  loading,
  onSubmit,
  onBack,
}: {
  mode: "signin" | "signup";
  loading: boolean;
  onSubmit: (email: string, password: string) => void;
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [capsLock, setCapsLock] = useState(false);
  const inputBase = "w-full px-4 py-3 text-[14px] tracking-tight rounded-xl outline-none transition-colors bg-transparent";

  const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === "function") setCapsLock(e.getModifierState("CapsLock"));
  };

  // Lightweight strength check — length plus a mix of character classes.
  // Not a full policy, just a nudge in the right direction for new accounts.
  const strength = (() => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (score <= 2) return { label: "Weak", color: "rgb(220 38 38)", score };
    if (score <= 3) return { label: "Okay", color: "rgb(217 119 6)", score };
    return { label: "Strong", color: "rgb(22 163 74)", score };
  })();

  return (
    <>
      {/* Back to Google/email choice */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors self-start"
      >
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="10 4 6 8 10 12" />
        </svg>
        Back
      </button>

      {/* Heading */}
      <div className="flex items-center justify-center gap-2">
        <h2 className="text-[1.4rem] font-medium tracking-[-0.03em] leading-[1.1] text-[rgb(var(--fg))]">
          Continue with email
        </h2>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(email, password); }}
        className="flex flex-col gap-3"
      >
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputBase}
          style={{ border: "1.5px solid rgb(var(--line))", color: "rgb(var(--fg))" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgb(var(--fg) / 0.4)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgb(var(--line))")}
        />
        <div className="relative">
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
            className={inputBase}
            style={{
              border: "1.5px solid rgb(var(--line))",
              color: "rgb(var(--fg))",
              paddingRight: capsLock && mode === "signup" && strength ? 68 : capsLock || (mode === "signup" && strength) ? 44 : undefined,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgb(var(--fg) / 0.4)")}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgb(var(--line))"; setCapsLock(false); }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {capsLock && (
              <span
                title="Caps Lock is on"
                className="flex items-center justify-center rounded-md"
                style={{ width: 26, height: 26, background: "rgb(var(--fg) / 0.06)", color: "rgb(var(--muted))" }}
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 2l4.5 4.5h-3V11h-3V6.5h-3L8 2z" />
                  <rect x="4.5" y="12.5" width="7" height="1.5" rx="0.5" fill="currentColor" stroke="none" />
                </svg>
              </span>
            )}
            {mode === "signup" && strength && (
              <span className="group relative flex items-center" tabIndex={0}>
                <span
                  className="flex items-center justify-center rounded-md"
                  style={{ width: 26, height: 26, background: "rgb(var(--fg) / 0.06)" }}
                >
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none" stroke={strength.color} strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                    <line x1="3" y1="12" x2="3" y2="8" opacity={strength.score >= 1 ? 1 : 0.25} />
                    <line x1="8" y1="12" x2="8" y2="5" opacity={strength.score >= 2 ? 1 : 0.25} />
                    <line x1="13" y1="12" x2="13" y2="2" opacity={strength.score >= 4 ? 1 : 0.25} />
                  </svg>
                </span>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute top-full right-0 mt-2 w-max max-w-[200px] rounded-lg px-2.5 py-1.5 text-[11.5px] leading-snug tracking-tight opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100"
                  style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))", zIndex: 20 }}
                >
                  <span style={{ color: strength.color }}>{strength.label} password.</span>{" "}
                  Use 12+ characters with a mix of letters, numbers, and symbols.
                </span>
              </span>
            )}
          </div>
        </div>
        {mode === "signin" && (
          <Link
            href="/reset-password"
            className="self-end text-[12.5px] tracking-tight text-[rgb(var(--muted))] transition-colors hover:text-[rgb(var(--fg))]"
          >
            Forgot password?
          </Link>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2.5 w-full py-2.5 text-[14px] font-medium tracking-tight rounded-full transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}
        >
          {loading ? <Spinner /> : null}
          {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </>
  );
}

function GoogleButton({ onOAuth, loading, oauthProvider }: { onOAuth: () => void; loading: boolean; oauthProvider: "google" | null }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onOAuth}
      className="flex items-center justify-center gap-2.5 w-full py-2.5 text-[14px] tracking-tight rounded-full hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
      style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}
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

const EXIT_MS = 180;
const ENTER_MS = 380;

export function LoginForm({ initialTab }: { initialTab: "signin" | "signup" }) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"signin" | "signup">(initialTab);
  const [displayedTab, setDisplayedTab] = useState<"signin" | "signup">(initialTab);
  const [view, setView] = useState<Record<"signin" | "signup", "auth" | "email">>({ signin: "auth", signup: "auth" });
  const [displayedView, setDisplayedView] = useState<"auth" | "email">("auth");
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<"google" | null>(null);
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);
  const signinSizerRef = useRef<HTMLDivElement>(null);
  const signupSizerRef = useRef<HTMLDivElement>(null);
  const signinEmailSizerRef = useRef<HTMLDivElement>(null);
  const signupEmailSizerRef = useRef<HTMLDivElement>(null);
  const liveContentRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<"signin" | "signup", HTMLButtonElement | null>>>({});
  const [pillRect, setPillRect] = useState<{ left: number; width: number } | null>(null);
  const checkEmail = searchParams.get("checkEmail") === "1";

  // Measure every tab × view combination and lock the card to the tallest,
  // so switching tabs or swapping to the email card never reflows it.
  useEffect(() => {
    const measure = () => {
      const heights = [
        signinSizerRef.current?.offsetHeight ?? 0,
        signupSizerRef.current?.offsetHeight ?? 0,
        signinEmailSizerRef.current?.offsetHeight ?? 0,
        signupEmailSizerRef.current?.offsetHeight ?? 0,
      ];
      const tallest = Math.max(...heights);
      if (tallest > 0) setCardHeight(tallest);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [error, checkEmail]);

  // Also track the live content's real height — typing into the password
  // field can grow it beyond the static sizer baseline (caps lock warning,
  // strength meter), so the card should grow to fit rather than clip it.
  useEffect(() => {
    const el = liveContentRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      setCardHeight((prev) => (prev === undefined ? h : Math.max(prev, h)));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [displayedTab, displayedView]);

  // Track the active tab button's position so the pill indicator can glide
  // between "Sign in" and "Create account" instead of just swapping color.
  useEffect(() => {
    const measurePill = () => {
      const el = tabRefs.current[tab];
      if (!el) return;
      setPillRect({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measurePill();
    window.addEventListener("resize", measurePill);
    return () => window.removeEventListener("resize", measurePill);
  }, [tab]);

  const switchTab = (t: "signin" | "signup") => {
    if (t === tab) return;
    setDirection(t === "signup" ? 1 : -1);
    setError("");
    setTab(t);
    setPhase("exit");
    setTimeout(() => {
      setDisplayedTab(t);
      setDisplayedView(view[t]);
      setPhase("enter");
      setTimeout(() => setPhase("idle"), ENTER_MS);
    }, EXIT_MS);
  };

  // Swap the card between the Google/email-choice screen and the dedicated
  // email-form screen, reusing the same slide transition as tab switching.
  const switchView = (t: "signin" | "signup", v: "auth" | "email") => {
    setDirection(v === "email" ? 1 : -1);
    setError("");
    setView((s) => ({ ...s, [t]: v }));
    setPhase("exit");
    setTimeout(() => {
      setDisplayedView(v);
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

  const onEmailSubmit = async (t: "signin" | "signup", email: string, password: string) => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = t === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (t === "signup") {
      setLoading(false);
      setError("");
      window.location.href = "/login?checkEmail=1";
      return;
    }

    window.location.href = "/dashboard";
  };

  const renderAuth = (t: "signin" | "signup") => (
    <>
      {/* Heading */}
      <div className="flex flex-col text-center">
        <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] opacity-50 mb-2">
          {t === "signin" ? "Welcome back to Inertia" : "Welcome to Inertia"}
        </p>
        <h1 className="text-[2.2rem] font-medium tracking-[-0.045em] leading-[1.1] text-[rgb(var(--fg))]">
          {t === "signin" ? "Sign in to your portal" : "Create your account"}
        </h1>
      </div>

      {t === "signin" && checkEmail && <InfoMessage msg="Check your email to confirm your account." />}

      {/* Google button */}
      <GoogleButton onOAuth={() => onOAuth("google")} loading={loading} oauthProvider={oauthProvider} />

      <Divider />

      <EmailToggle onToggle={() => switchView(t, "email")} />

      {error && <ErrorMessage msg={error} />}

      {/* Switch tab link */}
      <button
        type="button"
        onClick={() => switchTab(t === "signin" ? "signup" : "signin")}
        className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors text-center"
      >
        {t === "signin" ? "No account? Create one →" : "Already have an account? Sign in →"}
      </button>
    </>
  );

  const renderEmail = (t: "signin" | "signup") => (
    <>
      <EmailForm
        mode={t}
        loading={loading}
        onSubmit={(email, password) => onEmailSubmit(t, email, password)}
        onBack={() => switchView(t, "auth")}
      />
      {error && <ErrorMessage msg={error} />}
    </>
  );

  const renderBody = (t: "signin" | "signup", v: "auth" | "email") => (v === "auth" ? renderAuth(t) : renderEmail(t));

  const exitX = direction * -14;
  const enterX = direction * 14;

  const contentStyle: React.CSSProperties = phase === "exit"
    ? { opacity: 0, transform: `translateX(${exitX}px) scale(0.98)`, filter: "blur(3px)", transition: `opacity ${EXIT_MS}ms cubic-bezier(0.4,0,1,1), transform ${EXIT_MS}ms cubic-bezier(0.4,0,1,1), filter ${EXIT_MS}ms cubic-bezier(0.4,0,1,1)` }
    : phase === "enter"
    ? { opacity: 0, transform: `translateX(${enterX}px) scale(0.98)`, filter: "blur(3px)", transition: "none" }
    : { opacity: 1, transform: "translateX(0) scale(1)", filter: "blur(0px)", transition: `opacity ${ENTER_MS}ms cubic-bezier(0.16,1,0.3,1), transform ${ENTER_MS}ms cubic-bezier(0.16,1,0.3,1), filter ${ENTER_MS}ms cubic-bezier(0.16,1,0.3,1)` };

  return (
    <div className="w-full min-h-screen">

      {/* Top bar — fixed so it doesn't affect centering */}
      <div className="fixed top-0 inset-x-0 z-10 px-6" style={{ height: 72 }}>
        <div className="flex items-center justify-between h-full mx-auto" style={{ maxWidth: "88rem" }}>
          <Link href="/">
            <img src="/logo.png" alt="Inertia" className="h-6 w-auto" style={{ display: "block" }} />
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="https://cal.com/jacob-c-99otvp/15min"
              target="_blank"
              rel="noreferrer"
              className="inline-flex px-4 py-2.5 text-[15px] sm:px-5 sm:py-2.5 sm:text-[16px]"
              style={{
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
                borderRadius: 999,
                background: "rgb(var(--fg))",
                color: "rgb(var(--bg))",
                fontWeight: 500,
                letterSpacing: "-0.01em",
                textDecoration: "none",
                transition: "opacity 150ms ease, transform 150ms ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Book a call
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Form — centered against full viewport */}
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
          <div className="flex flex-col gap-6">

            {/* Tab notch — hidden while on the dedicated email card, since
                Back already covers navigation there */}
            <div
              className="flex justify-center overflow-hidden"
              style={{
                height: displayedView === "auth" ? 32 : 0,
                opacity: displayedView === "auth" ? 1 : 0,
                transition: "height 280ms cubic-bezier(0.22,1,0.36,1), opacity 200ms ease",
              }}
            >
              <div className="relative flex items-center gap-1 rounded-full p-[3px]" style={{ background: "rgb(var(--fg) / 0.06)" }}>
                {pillRect && (
                  <div
                    aria-hidden="true"
                    className="absolute top-[3px] bottom-[3px] rounded-full"
                    style={{
                      left: pillRect.left,
                      width: pillRect.width,
                      background: "rgb(var(--fg))",
                      transition: "left 320ms cubic-bezier(0.65,0,0.35,1), width 320ms cubic-bezier(0.65,0,0.35,1)",
                    }}
                  />
                )}
                {(["signin", "signup"] as const).map((t) => (
                  <button
                    key={t}
                    ref={(el) => { tabRefs.current[t] = el; }}
                    onClick={() => switchTab(t)}
                    className="relative px-4 py-1.5 text-[12px] tracking-tight rounded-full transition-colors duration-200"
                    style={{ color: tab === t ? "rgb(var(--bg))" : "rgb(var(--muted))" }}
                  >
                    {t === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>
            </div>

            {/* Animated content — height locked to the taller of the two tabs
                so switching never resizes the card. */}
            <div style={{ height: cardHeight, transition: "height 280ms cubic-bezier(0.22,1,0.36,1)", overflow: "hidden" }}>
              <div ref={liveContentRef} style={contentStyle} className="flex flex-col gap-6">
                {renderBody(displayedTab, displayedView)}
              </div>
            </div>

          </div>

          {/* Hidden sizers — off-screen copies of every tab × view combo used
              only to measure natural height. Not visible, not interactive. */}
          <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, visibility: "hidden", pointerEvents: "none", zIndex: -1 }}>
            <div ref={signinSizerRef} className="flex flex-col gap-6">
              {renderBody("signin", "auth")}
            </div>
            <div ref={signupSizerRef} className="flex flex-col gap-6">
              {renderBody("signup", "auth")}
            </div>
            <div ref={signinEmailSizerRef} className="flex flex-col gap-6">
              {renderBody("signin", "email")}
            </div>
            <div ref={signupEmailSizerRef} className="flex flex-col gap-6">
              {renderBody("signup", "email")}
            </div>
          </div>
        </div>

        <p className="w-full max-w-[420px] text-[12px] tracking-tight text-[rgb(var(--muted))] text-center mt-6" style={{ opacity: 0.5 }}>
          By continuing, you agree to our{" "}
          <Link href="/policies/terms-of-service" className="underline hover:text-[rgb(var(--fg))] transition-colors">
            Terms of service
          </Link>{" "}
          and{" "}
          <Link href="/policies/privacy-policy" className="underline hover:text-[rgb(var(--fg))] transition-colors">
            Privacy policy
          </Link>
          .
        </p>
      </div>

    </div>
  );
}
