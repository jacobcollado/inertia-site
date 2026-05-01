"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/* ── Sketch ───────────────────────────────────────────────────────── */

function SketchPortal() {
  const blue = "rgb(var(--blue))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 260 180" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      {/* Outer portal ring */}
      <circle cx="130" cy="90" r="70" stroke={muted} strokeWidth="1" opacity="0.2" />
      <circle cx="130" cy="90" r="56" stroke={blue} strokeWidth="1.4" opacity="0.45" strokeDasharray="5 4" />
      {/* Inner circle */}
      <circle cx="130" cy="90" r="38" stroke={blue} strokeWidth="1.6" opacity="0.6" fill={blue} fillOpacity="0.05" />
      {/* Lock body */}
      <rect x="116" y="88" width="28" height="22" rx="3" stroke={blue} strokeWidth="1.6" opacity="0.75" fill={blue} fillOpacity="0.08" />
      {/* Lock shackle */}
      <path d="M120 88 L120 80 Q120 72 130 72 Q140 72 140 80 L140 88" stroke={blue} strokeWidth="1.6" opacity="0.75" fill="none" />
      {/* Keyhole */}
      <circle cx="130" cy="97" r="3.5" stroke={blue} strokeWidth="1.2" opacity="0.8" fill={blue} fillOpacity="0.2" />
      <line x1="130" y1="100" x2="130" y2="106" stroke={blue} strokeWidth="1.4" opacity="0.7" />
      {/* Tick marks around dashed ring */}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const r = (Math.PI * deg) / 180;
        const x1 = 130 + Math.cos(r) * 62;
        const y1 = 90 + Math.sin(r) * 62;
        const x2 = 130 + Math.cos(r) * 68;
        const y2 = 90 + Math.sin(r) * 68;
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={blue} strokeWidth="1.2" opacity="0.45" />;
      })}
      {/* Corner label */}
      <rect x="18" y="14" width="52" height="16" rx="3" stroke={muted} strokeWidth="0.8" opacity="0.25" />
      <line x1="26" y1="22" x2="62" y2="22" stroke={blue} strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

/* ── Main ─────────────────────────────────────────────────────────── */

export function LoginForm({ initialTab }: { initialTab: "signin" | "signup" }) {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => { setEmail(""); setPassword(""); setName(""); setError(""); setMessage(""); };

  const switchTab = (t: "signin" | "signup") => { setTab(t); reset(); };

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Invalid email or password."); setLoading(false); return; }
    router.push("/dashboard");
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

  const inputBase =
    "w-full bg-transparent border-0 border-b py-3 text-[16px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none transition-colors duration-200";

  const accent = "rgb(var(--blue))";

  return (
    <div className="w-full flex flex-col sm:flex-row">

      {/* Left — sketch panel */}
      <div className="sm:w-[44%] border-b sm:border-b-0 sm:border-r border-[rgb(var(--line))] flex flex-col items-center justify-center px-10 py-14 sm:py-0 gap-8">
        <div
          className="w-full max-w-[280px]"
          style={{ animation: "rise-in 400ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "80ms" }}
        >
          <SketchPortal />
        </div>
        <div className="text-center" style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "160ms" }}>
          <p className="text-[14px] font-medium tracking-tight text-[rgb(var(--fg))]">Client portal</p>
          <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] mt-1">
            Your project, invoices, and files — in one place.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="sm:w-[56%] flex flex-col justify-center px-8 sm:px-14 py-14">

        {/* Back link */}
        <Link
          href="/"
          className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors mb-10 self-start"
        >
          ← Inertia
        </Link>

        {/* Tabs */}
        <div
          className="flex items-center gap-1 mb-10 border border-[rgb(var(--line))] rounded-full p-1 self-start"
          style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both" }}
        >
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className="rounded-full px-4 py-1.5 text-[13px] tracking-tight transition-all duration-150"
              style={{
                background: tab === t ? accent : "transparent",
                color: tab === t ? "white" : "rgb(var(--muted))",
              }}
            >
              {t === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {/* Heading */}
        <div style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "40ms" }}>
          <h1 className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))] mb-2">
            {tab === "signin" ? "Welcome back." : "Request access."}
          </h1>
          <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] mb-8">
            {tab === "signin"
              ? "Sign in to view your project status, invoices, and files."
              : "Already a client? Sign up to access your dedicated dashboard."}
          </p>
        </div>

        {/* Sent state */}
        {message ? (
          <div
            className="flex flex-col gap-3"
            style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}
          >
            <span className="text-[11px] tracking-widest uppercase" style={{ color: accent, opacity: 0.8 }}>confirmed</span>
            <p className="text-[15px] tracking-tight text-[rgb(var(--fg))]">{message}</p>
            <button
              onClick={() => switchTab("signin")}
              className="text-[13px] tracking-tight mt-2 self-start"
              style={{ color: accent }}
            >
              Back to sign in →
            </button>
          </div>
        ) : tab === "signin" ? (

          /* Sign in form */
          <form
            onSubmit={onSignIn}
            className="flex flex-col gap-6 w-full max-w-sm"
            noValidate
            style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "80ms" }}
          >
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email" autoComplete="email"
              className={inputBase}
              style={{ borderColor: email ? accent : "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = accent; }}
              onBlur={(e) => { e.target.style.borderColor = email ? accent : "rgb(var(--line))"; }}
            />
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password" autoComplete="current-password"
              className={inputBase}
              style={{ borderColor: password ? accent : "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = accent; }}
              onBlur={(e) => { e.target.style.borderColor = password ? accent : "rgb(var(--line))"; }}
            />
            {error && <p className="text-[13px] tracking-tight text-red-500">{error}</p>}
            <div className="flex items-center gap-4 pt-1">
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="inline-flex items-center gap-2 rounded-full pl-6 pr-5 py-2.5 text-[14px] tracking-tight font-medium transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                style={{ background: accent, color: "white", border: `1px solid ${accent}` }}
              >
                {loading ? "Signing in…" : "Sign in"}
                {!loading && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </button>
            </div>
          </form>

        ) : (

          /* Sign up form */
          <form
            onSubmit={onSignUp}
            className="flex flex-col gap-6 w-full max-w-sm"
            noValidate
            style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "80ms" }}
          >
            <input
              type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your name" autoComplete="name"
              className={inputBase}
              style={{ borderColor: name ? accent : "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = accent; }}
              onBlur={(e) => { e.target.style.borderColor = name ? accent : "rgb(var(--line))"; }}
            />
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email" autoComplete="email"
              className={inputBase}
              style={{ borderColor: email ? accent : "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = accent; }}
              onBlur={(e) => { e.target.style.borderColor = email ? accent : "rgb(var(--line))"; }}
            />
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="choose a password" autoComplete="new-password"
              className={inputBase}
              style={{ borderColor: password ? accent : "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = accent; }}
              onBlur={(e) => { e.target.style.borderColor = password ? accent : "rgb(var(--line))"; }}
            />
            <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-60 -mt-2">
              Access is granted once we've confirmed your project.
            </p>
            {error && <p className="text-[13px] tracking-tight text-red-500">{error}</p>}
            <div className="flex items-center gap-4 pt-1">
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="inline-flex items-center gap-2 rounded-full pl-6 pr-5 py-2.5 text-[14px] tracking-tight font-medium transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                style={{ background: accent, color: "white", border: `1px solid ${accent}` }}
              >
                {loading ? "Requesting…" : "Request access"}
                {!loading && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
