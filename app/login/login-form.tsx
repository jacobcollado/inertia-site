"use client";

import { useState, useEffect, useId, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SIGNUPS_ENABLED } from "@/lib/auth-flags";
import { MovementPlate } from "@/components/movement-plate";

// Typography from the homepage: the heading at the size of its closing line
// (light, large, tight), the line under it at the size of its section lines.
const LOGIN_TITLE =
  "text-[clamp(2.5rem,6.4vw,4.5rem)] tracking-[-0.05em] leading-[1.04] text-balance";
const LOGIN_SUBTITLE =
  "text-[17px] sm:text-[18px] leading-[1.45] tracking-[-0.015em] text-balance";
const LOGIN_INPUT = "text-[16px] tracking-tight";
const LOGIN_BTN = "text-[15px] sm:text-[16px] tracking-tight";
const LOGIN_UI = "text-[14px] sm:text-[14.5px] tracking-tight";
const LOGIN_CAPTION = "text-[13px] sm:text-[14px] tracking-tight";

function Spinner() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 animate-spin" aria-hidden="true" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Alert({ msg, tone }: { msg: string; tone: "error" | "info" }) {
  // Info sits on the plain tile in ink; only an error takes a colour.
  const color = tone === "error" ? "rgb(220 38 38)" : "var(--ink)";
  const cardBg = tone === "error" ? "rgb(220 38 38 / 0.06)" : "var(--tile)";
  return (
    <div
      className="flex items-start gap-2.5 rounded-[6px] px-3.5 py-3 text-left"
      style={{ background: cardBg }}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center"
        style={{ color }}
      >
        {tone === "error" ? (
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" />
            <line x1="8" y1="5" x2="8" y2="8.5" />
            <circle cx="8" cy="11" r="0.5" fill="currentColor" stroke="none" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
            <path d="M2 4l6 4.5L14 4" />
          </svg>
        )}
      </span>
      <p className={`${LOGIN_UI} leading-snug pt-0.5`} style={{ color: "var(--ink)" }}>
        {msg}
      </p>
    </div>
  );
}

function ErrorMessage({ msg }: { msg: string }) {
  return <Alert msg={msg} tone="error" />;
}

function InfoMessage({ msg }: { msg: string }) {
  return <Alert msg={msg} tone="info" />;
}

function EmailToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex h-12 items-center justify-center gap-2 w-full ${LOGIN_BTN} leading-none rounded-[6px] transition-[box-shadow,transform] duration-150 shadow-[inset_0_0_0_1px_rgb(var(--ink-rgb)/0.12)] hover:shadow-[inset_0_0_0_1px_rgb(var(--ink-rgb)/0.28)] active:scale-[0.99]`}
      style={{ background: "var(--paper)", color: "var(--ink)", fontWeight: 450 }}
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
  autoFocus = false,
}: {
  mode: "signin" | "signup";
  loading: boolean;
  onSubmit: (email: string, password: string, firstName?: string, lastName?: string) => void;
  onBack: () => void;
  // Only the live form takes focus; the hidden sizer copies must not.
  autoFocus?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [capsLock, setCapsLock] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  // Focus the first field once the card has slid in, so typing can start
  // straight away. preventScroll keeps phones from jumping mid-transition.
  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => emailRef.current?.focus({ preventScroll: true }), ENTER_MS);
    return () => clearTimeout(t);
  }, [autoFocus]);
  // White fields with a thin inset ring, like the site's outlined buttons,
  // which darkens to ink on focus.
  const inputBase = `w-full h-11 px-4 ${LOGIN_INPUT} rounded-[6px] outline-none transition-shadow duration-200 text-[var(--ink)] bg-[var(--paper)] shadow-[inset_0_0_0_1px_rgb(var(--ink-rgb)/0.12)] focus:shadow-[inset_0_0_0_1.5px_var(--ink)] placeholder:text-[var(--ink-4)]`;
  const label = `${LOGIN_UI} text-[var(--ink-3)]`;

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
  // Icons inside the right of the password field: the show/hide toggle, plus
  // caps lock and strength when they apply.
  const passwordIcons = 1 + (capsLock ? 1 : 0) + (mode === "signup" && strength ? 1 : 0);

  return (
    <>
      {/* Back to Google/email choice */}
      <button
        type="button"
        onClick={onBack}
        className={`flex items-center gap-1.5 ${LOGIN_UI} text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors self-start`}
      >
        <svg viewBox="0 0 16 16" className="size-[1em] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="13" y1="8" x2="5" y2="8" />
          <line x1="8" y1="5" x2="5" y2="8" />
          <line x1="8" y1="11" x2="5" y2="8" />
        </svg>
        All sign-in options
      </button>

      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(email, password, firstName, lastName); }}
        className="flex flex-col gap-4"
      >
        {mode === "signup" && (
          <div className="flex gap-3">
            <input
              type="text"
              required
              autoComplete="given-name"
              placeholder="First name"
              aria-label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputBase}
            />
            <input
              type="text"
              autoComplete="family-name"
              placeholder="Last name (optional)"
              aria-label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputBase}
            />
          </div>
        )}
        <label className="flex flex-col gap-1.5">
          <span className={label}>Email</span>
          <input
            ref={emailRef}
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputBase}
          />
        </label>
        <div className="flex flex-col gap-1.5">
          {/* Forgot password sits on the label's line, by the field it's about. */}
          <div className="flex items-baseline justify-between">
            <label htmlFor={passwordId} className={label}>Password</label>
            {mode === "signin" && (
              <Link
                href="/reset-password"
                className={`${LOGIN_UI} text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]`}
              >
                Forgot password?
              </Link>
            )}
          </div>
        <div className="relative">
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder={mode === "signin" ? "Your password" : "At least 8 characters"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyUp={checkCapsLock}
            onKeyDown={checkCapsLock}
            className={inputBase}
            style={{ paddingRight: 12 + passwordIcons * 30 }}
            onBlur={() => setCapsLock(false)}
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
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="flex size-[26px] items-center justify-center rounded-md text-[rgb(var(--muted))] transition-colors hover:bg-[rgb(var(--fg)/0.06)] hover:text-[rgb(var(--fg))]"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" />
                <circle cx="8" cy="8" r="2" />
                {showPassword && <line x1="2.5" y1="13.5" x2="13.5" y2="2.5" />}
              </svg>
            </button>
          </div>
        </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`mt-2 flex h-12 items-center justify-center gap-2.5 w-full ${LOGIN_BTN} leading-none rounded-[6px] transition-[opacity,transform] duration-150 hover:opacity-85 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed`}
          style={{ background: "#000", color: "#fff", fontWeight: 450 }}
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
      className={`flex h-12 items-center justify-center gap-2.5 w-full ${LOGIN_BTN} leading-none rounded-[6px] transition-[opacity,transform] duration-150 hover:opacity-85 active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed`}
      style={{ background: "#000", color: "#fff", fontWeight: 450 }}
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
  // With sign-ups closed, ?tab=signup must not open a tab that no longer
  // renders — fall back to signin.
  const startTab = SIGNUPS_ENABLED ? initialTab : "signin";
  const [tab, setTab] = useState<"signin" | "signup">(startTab);
  const [displayedTab, setDisplayedTab] = useState<"signin" | "signup">(startTab);
  const [view, setView] = useState<Record<"signin" | "signup", "auth" | "email">>({ signin: "auth", signup: "auth" });
  const [displayedView, setDisplayedView] = useState<"auth" | "email">("auth");
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<"google" | null>(null);
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);
  // Height of the initially-displayed view only (signin/auth), used purely as
  // the pre-hydration fallback so the first paint doesn't flash at 0 height.
  // This must NOT be the tallest of all variants — using the max meant the
  // card opened at the (taller) email form's height and then shrank down to
  // the auth view's height once the ResizeObserver reported in.
  const [maxCardHeight, setMaxCardHeight] = useState<number | undefined>(undefined);
  const signinSizerRef = useRef<HTMLDivElement>(null);
  const signupSizerRef = useRef<HTMLDivElement>(null);
  const signinEmailSizerRef = useRef<HTMLDivElement>(null);
  const signupEmailSizerRef = useRef<HTMLDivElement>(null);
  const liveContentRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<"signin" | "signup", HTMLButtonElement | null>>>({});
  const [pillRect, setPillRect] = useState<{ left: number; width: number } | null>(null);
  const checkEmail = searchParams.get("checkEmail") === "1";
  const oauthErrorParam = searchParams.get("error_description") ?? searchParams.get("error");

  // Measure only the view shown on first paint (signin/auth), so the
  // pre-hydration fallback height matches what's actually displayed instead
  // of the tallest of every tab × view combination.
  useEffect(() => {
    const measure = () => {
      const height = signinSizerRef.current?.offsetHeight ?? 0;
      if (height > 0) setMaxCardHeight(height);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [error, checkEmail]);

  // The card tracks the CURRENT view's height rather than the tallest of all
  // of them. Locking to the max meant the short OAuth view carried the email
  // form's height as dead space at the bottom. The height is a transitioned
  // property, so switching views grows/shrinks the card fluidly instead of
  // jumping.
  //
  // This must not clamp with Math.max against the previous value: that
  // ratchets the card upward and it never comes back down after a tall view.
  // Growth from within a view (caps-lock warning, password strength meter) is
  // handled naturally because the observer reports the new height directly.
  useEffect(() => {
    const el = liveContentRef.current;
    if (!el) return;
    // The full box, padding included (that padding is the focus ring's room).
    const obs = new ResizeObserver(() => {
      const h = el.offsetHeight;
      if (h > 0) setCardHeight(h);
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
  // Unlike tab switching, both directions here use the same right-to-left
  // motion (direction 1) rather than reversing on the way back — going back
  // to the main card should slide the same way it slid in, not mirror it.
  const switchView = (t: "signin" | "signup", v: "auth" | "email") => {
    setDirection(1);
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
    if (oauthErrorParam) {
      setError(oauthErrorParam.replace(/\+/g, " "));
    }
  }, [oauthErrorParam]);

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

  const onEmailSubmit = async (t: "signin" | "signup", email: string, password: string, firstName?: string, lastName?: string) => {
    // Belt-and-braces: the signup tab isn't reachable while sign-ups are
    // closed, but never fire signUp() if it somehow is.
    if (t === "signup" && !SIGNUPS_ENABLED) {
      setError("New accounts are temporarily unavailable. Please check back soon.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const name = [firstName, lastName].filter(Boolean).join(" ").trim();
    const { error: authError } = t === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: name ? { name } : undefined,
          },
        });

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
      {t === "signin" && checkEmail && <InfoMessage msg="Check your email to confirm your account." />}

      {/* The two ways in, stacked: Google first, email under it. */}
      <div className="flex flex-col gap-2.5">
        <GoogleButton onOAuth={() => onOAuth("google")} loading={loading} oauthProvider={oauthProvider} />
        <EmailToggle onToggle={() => switchView(t, "email")} />
      </div>

      {error && <ErrorMessage msg={error} />}

      {/* Switch tab link — only meaningful while there's another tab to
          switch to. The closed-sign-ups notice lives under the heading now. */}
      {SIGNUPS_ENABLED && (
        <button
          type="button"
          onClick={() => switchTab(t === "signin" ? "signup" : "signin")}
          className={`${LOGIN_UI} text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors text-left`}
        >
          {t === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
        </button>
      )}
    </>
  );

  const renderEmail = (t: "signin" | "signup", live = false) => (
    <>
      <EmailForm
        autoFocus={live}
        mode={t}
        loading={loading}
        onSubmit={(email, password, firstName, lastName) => onEmailSubmit(t, email, password, firstName, lastName)}
        onBack={() => switchView(t, "auth")}
      />
      {error && <ErrorMessage msg={error} />}
    </>
  );

  // `live` marks the copy actually on screen, as opposed to the hidden sizers.
  const renderBody = (t: "signin" | "signup", v: "auth" | "email", live = false) =>
    v === "auth" ? renderAuth(t) : renderEmail(t, live);

  const exitX = direction * -14;
  const enterX = direction * 14;

  const contentStyle: React.CSSProperties = phase === "exit"
    ? { opacity: 0, transform: `translateX(${exitX}px) scale(0.98)`, filter: "blur(3px)", transition: `opacity ${EXIT_MS}ms cubic-bezier(0.4,0,1,1), transform ${EXIT_MS}ms cubic-bezier(0.4,0,1,1), filter ${EXIT_MS}ms cubic-bezier(0.4,0,1,1)` }
    : phase === "enter"
    ? { opacity: 0, transform: `translateX(${enterX}px) scale(0.98)`, filter: "blur(3px)", transition: "none" }
    : { opacity: 1, transform: "translateX(0) scale(1)", filter: "blur(0px)", transition: `opacity ${ENTER_MS}ms cubic-bezier(0.16,1,0.3,1), transform ${ENTER_MS}ms cubic-bezier(0.16,1,0.3,1), filter ${ENTER_MS}ms cubic-bezier(0.16,1,0.3,1)` };

  // The column sits on the screen's optical centre. Its height is held at
  // what the first view (the two ways in) needs, so the email form grows
  // downward past it instead of re-centring the column: the heading never
  // moves.
  const restRef = useRef<HTMLDivElement>(null);
  const [restH, setRestH] = useState<number | null>(null);
  const atRest = displayedView === "auth" && phase === "idle";
  useEffect(() => {
    const el = restRef.current;
    if (!el || !atRest) return;
    const measure = () => setRestH(el.offsetHeight);
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, [atRest]);

  return (
    <div className="w-full lg:grid lg:grid-cols-2">

      {/* The site header sits above (--header-h). The free space splits 4:5
          above and below the column, as on the homepage's opening, so it sits
          a little above the geometric centre. From laptops up the form takes
          the left half and the homepage's movement the right. */}
      <div className="grid min-h-[calc(100dvh-var(--header-h))] w-full grid-rows-[4fr_auto_5fr] px-6 py-10 sm:px-8">
        <div className="row-start-2 mx-auto w-full max-w-[40rem]" style={{ animation: "rise-in 500ms cubic-bezier(0.22,1,0.36,1) both" }}>
            {/* The heading stays put while the options below it change. */}
            <h1 className={`${LOGIN_TITLE} text-center`} style={{ color: "var(--ink)", fontWeight: 420 }}>
              {displayedTab === "signin" ? "Welcome back." : "Make an account."}
            </h1>
            <p className={`${LOGIN_SUBTITLE} mt-4 text-center`} style={{ color: "var(--ink-3)" }}>
              {SIGNUPS_ENABLED
                ? "Follow your project and your Aether licenses."
                : "For Inertia clients and Aether owners."}
            </p>

            {/* Tabs, only while sign-ups are open: collapses on the email
                view, since its own link already leads back. */}
            {SIGNUPS_ENABLED && (
              <div
                className="mt-8 flex overflow-hidden"
                style={{
                  height: displayedView === "auth" ? 40 : 0,
                  opacity: displayedView === "auth" ? 1 : 0,
                  transition: "height 280ms cubic-bezier(0.22,1,0.36,1), opacity 200ms ease",
                }}
              >
                <div className="relative flex items-center gap-1 rounded-[8px] p-1" style={{ background: "var(--tile)" }}>
                  {pillRect && (
                    <div
                      aria-hidden="true"
                      className="absolute top-1 bottom-1 rounded-[6px]"
                      style={{
                        left: pillRect.left,
                        width: pillRect.width,
                        background: "var(--paper)",
                        transition: "left 320ms cubic-bezier(0.65,0,0.35,1), width 320ms cubic-bezier(0.65,0,0.35,1)",
                      }}
                    />
                  )}
                  {(["signin", "signup"] as const).map((t) => (
                    <button
                      key={t}
                      ref={(el) => { tabRefs.current[t] = el; }}
                      onClick={() => switchTab(t)}
                      className="relative px-4 py-1.5 text-[14px] tracking-tight rounded-[6px] transition-colors duration-200"
                      style={{ color: tab === t ? "var(--ink)" : "var(--ink-3)" }}
                    >
                      {t === "signin" ? "Sign in" : "Create account"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* The form, narrower than the heading above it. Held at the
                first view's height (see restH); what grows past it hangs
                below. */}
            <div className="mx-auto h-[var(--rest-h)] w-full max-w-[24rem]" style={{ ["--rest-h" as string]: restH ? `${restH}px` : "auto" }}>
            <div ref={restRef}>
            {/* The options, which slide between the two ways in and the
                email form. The height eases with whichever is showing. */}
            <div
              className="relative mt-8 sm:mt-10"
              style={{
                height: cardHeight ?? maxCardHeight,
                transition: "height 280ms cubic-bezier(0.22,1,0.36,1)",
                // clip, not hidden: a hidden box can still be scrolled, and
                // the browser scrolls it to keep focus in view when an error
                // grows the form, hiding its top.
                overflow: "clip",
                // Room for the focus ring, which the clip would cut.
                marginLeft: -3,
                marginRight: -3,
                paddingLeft: 3,
                paddingRight: 3,
              }}
            >
              <div ref={liveContentRef} style={contentStyle} className="flex flex-col gap-5 py-[3px]">
                {renderBody(displayedTab, displayedView, true)}
              </div>

              {/* Hidden sizers: off-screen copies of each view, only to
                  measure their natural height. */}
              <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 3, right: 3, visibility: "hidden", pointerEvents: "none", zIndex: -1 }}>
                <div ref={signinSizerRef} className="flex flex-col gap-5 py-[3px]">
                  {renderBody("signin", "auth")}
                </div>
                <div ref={signinEmailSizerRef} className="flex flex-col gap-5 py-[3px]">
                  {renderBody("signin", "email")}
                </div>
                {SIGNUPS_ENABLED && (
                  <>
                    <div ref={signupSizerRef} className="flex flex-col gap-5 py-[3px]">
                      {renderBody("signup", "auth")}
                    </div>
                    <div ref={signupEmailSizerRef} className="flex flex-col gap-5 py-[3px]">
                      {renderBody("signup", "email")}
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className={`${LOGIN_CAPTION} mt-8 text-center text-[var(--ink-3)] [text-wrap:balance]`}>
              By continuing, you agree to our{" "}
              <Link href="/policies/terms-of-service" className="underline decoration-[var(--ink-4)] underline-offset-2 transition-colors hover:text-[var(--ink)]">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/policies/privacy-policy" className="underline decoration-[var(--ink-4)] underline-offset-2 transition-colors hover:text-[var(--ink)]">
                Privacy Policy
              </Link>
              .
            </p>
            </div>
            </div>
        </div>
      </div>

      {/* The movement from the homepage, closed. Signing in is what opens
          it: while the account is checked, it comes apart into its drawing,
          so the wait is the opening. */}
      <div className="relative hidden h-[calc(100dvh-var(--header-h))] lg:block" aria-hidden>
        <MovementPlate opened={loading} />
      </div>
    </div>
  );
}
