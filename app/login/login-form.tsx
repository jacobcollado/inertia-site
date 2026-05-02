"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/* ── Sketch — dashboard preview ──────────────────────────────────── */

function SketchPortal() {
  const blue = "rgb(var(--blue))";
  const green = "rgb(var(--green))";
  const muted = "rgb(var(--muted))";
  return (
    <svg viewBox="0 0 320 220" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full" aria-hidden="true">
      <rect x="4" y="4" width="312" height="212" rx="3" stroke={muted} strokeWidth="0.8" opacity="0.2" />
      <rect x="4" y="4" width="72" height="212" rx="3" stroke={muted} strokeWidth="0.7" opacity="0.18" fill={muted} fillOpacity="0.03" />
      <line x1="16" y1="22" x2="48" y2="22" stroke={muted} strokeWidth="1.1" opacity="0.35" />
      <line x1="16" y1="29" x2="38" y2="29" stroke={muted} strokeWidth="0.7" opacity="0.2" />
      <line x1="16" y1="44" x2="64" y2="44" stroke={muted} strokeWidth="0.5" opacity="0.15" />
      <rect x="14" y="50" width="18" height="18" rx="1" stroke={muted} strokeWidth="0.7" opacity="0.25" fill={muted} fillOpacity="0.05" />
      <line x1="38" y1="56" x2="66" y2="56" stroke={muted} strokeWidth="0.9" opacity="0.3" />
      <line x1="38" y1="62" x2="60" y2="62" stroke={muted} strokeWidth="0.6" opacity="0.18" />
      <line x1="16" y1="78" x2="64" y2="78" stroke={muted} strokeWidth="0.5" opacity="0.12" />
      {[{ y: 88, active: true }, { y: 104 }, { y: 120 }, { y: 136 }, { y: 152 }].map(({ y, active }) => (
        <g key={y}>
          <rect x="12" y={y - 6} width="52" height="14" rx="1"
            fill={active ? blue : "transparent"} fillOpacity={active ? 0.08 : 0}
            stroke={active ? blue : "transparent"} strokeWidth="0.5" opacity={active ? 0.5 : 0} />
          <rect x="12" y={y - 1} width="3" height="4" rx="1"
            fill={active ? blue : muted} opacity={active ? 0.9 : 0} />
          <line x1="20" y1={y + 1} x2={active ? 52 : 48} y2={y + 1}
            stroke={active ? blue : muted} strokeWidth={active ? 1.0 : 0.7}
            opacity={active ? 0.75 : 0.22} />
        </g>
      ))}
      <line x1="16" y1="174" x2="64" y2="174" stroke={muted} strokeWidth="0.5" opacity="0.12" />
      <line x1="16" y1="184" x2="44" y2="184" stroke={muted} strokeWidth="0.7" opacity="0.2" />
      <line x1="16" y1="192" x2="36" y2="192" stroke={muted} strokeWidth="0.5" opacity="0.15" />
      <line x1="90" y1="22" x2="160" y2="22" stroke={muted} strokeWidth="1.6" opacity="0.45" />
      <line x1="90" y1="31" x2="136" y2="31" stroke={muted} strokeWidth="0.9" opacity="0.25" />
      {[0, 1, 2].map((i) => {
        const x = 90 + i * 76;
        const isFirst = i === 0;
        return (
          <g key={i}>
            <rect x={x} y="46" width="66" height="38" rx="2"
              stroke={isFirst ? blue : muted} strokeWidth={isFirst ? 0.8 : 0.6}
              fill={isFirst ? blue : "transparent"} fillOpacity={isFirst ? 0.04 : 0}
              opacity={isFirst ? 0.7 : 0.22} />
            <line x1={x + 8} y1="58" x2={x + 34} y2="58"
              stroke={isFirst ? blue : muted} strokeWidth={isFirst ? 1.4 : 0.9}
              opacity={isFirst ? 0.7 : 0.28} />
            <line x1={x + 8} y1="66" x2={x + 26} y2="66"
              stroke={isFirst ? blue : muted} strokeWidth="0.6"
              opacity={isFirst ? 0.4 : 0.18} />
            {isFirst && <circle cx={x + 56} cy={50} r="3" fill={green} opacity="0.7" />}
          </g>
        );
      })}
      <rect x="90" y="96" width="160" height="52" rx="2" stroke={muted} strokeWidth="0.6" opacity="0.22" />
      <line x1="100" y1="108" x2="190" y2="108" stroke={muted} strokeWidth="1.1" opacity="0.35" />
      <line x1="100" y1="117" x2="168" y2="117" stroke={muted} strokeWidth="0.7" opacity="0.22" />
      <line x1="100" y1="126" x2="180" y2="126" stroke={muted} strokeWidth="0.6" opacity="0.18" />
      <rect x="196" y="104" width="44" height="14" rx="7"
        fill={green} fillOpacity="0.12" stroke={green} strokeWidth="0.7" opacity="0.6" />
      <circle cx="206" cy="111" r="2.5" fill={green} opacity="0.7" />
      <line x1="213" y1="111" x2="232" y2="111" stroke={green} strokeWidth="0.8" opacity="0.5" />
      <rect x="90" y="158" width="160" height="38" rx="2" stroke={muted} strokeWidth="0.6" opacity="0.2" />
      <line x1="100" y1="170" x2="176" y2="170" stroke={muted} strokeWidth="0.9" opacity="0.28" />
      <line x1="100" y1="179" x2="152" y2="179" stroke={muted} strokeWidth="0.6" opacity="0.18" />
      <line x1="208" y1="170" x2="240" y2="170" stroke={blue} strokeWidth="1.1" opacity="0.55" />
      <line x1="90" y1="92" x2="316" y2="92" stroke={muted} strokeWidth="0.4" opacity="0.15" />
      <line x1="90" y1="154" x2="316" y2="154" stroke={muted} strokeWidth="0.4" opacity="0.15" />
    </svg>
  );
}

/* ── Feature list ────────────────────────────────────────────────── */

const FEATURES = [
  { label: "Project status", desc: "Live updates on every phase of your build." },
  { label: "Invoices", desc: "View, download, and track payment history." },
  { label: "Shared files", desc: "Assets, deliverables, and docs in one place." },
];

function FeatureList({ accent }: { accent: string }) {
  return (
    <ul className="flex flex-col gap-4">
      {FEATURES.map((f) => (
        <li key={f.label} className="flex items-start gap-3">
          <span className="mt-[3px] w-4 h-4 flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 16 16" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full" aria-hidden="true">
              <polyline points="2 8 6 12 14 4" />
            </svg>
          </span>
          <span>
            <span className="block text-[13.5px] font-medium tracking-tight text-[rgb(var(--fg))]">{f.label}</span>
            <span className="block text-[12.5px] tracking-tight text-[rgb(var(--muted))] opacity-70 mt-0.5">{f.desc}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */

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
    "w-full bg-transparent border-0 border-b py-3 text-[15px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-40 focus:outline-none";

  const accent = "rgb(var(--blue))";

  return (
    <div className="w-full min-h-screen flex flex-col sm:flex-row">

      {/* Left panel — value prop, desktop only */}
      <div className="hidden sm:flex sm:w-[48%] flex-col justify-between px-14 py-16 border-r border-[rgb(var(--line))]">
        <Link
          href="/"
          className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors self-start"
        >
          ← Inertia
        </Link>

        <div style={{ animation: "rise-in 500ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "60ms" }}>
          <div className="w-full max-w-[340px] mb-10">
            <SketchPortal />
          </div>
          <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-60 mb-3">
            Client portal
          </p>
          <h2 className="text-[1.6rem] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))] mb-6 max-w-xs">
            Everything about your project, in one place.
          </h2>
          <FeatureList accent={accent} />
        </div>

        <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-40">
          Inertia. Built for clients who care about their build.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="sm:w-[52%] flex flex-col px-6 sm:px-14 pt-10 pb-14 sm:py-0 sm:justify-center">

        {/* Mobile: back link */}
        <Link
          href="/"
          className="sm:hidden text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors mb-8 self-start"
        >
          ← Inertia
        </Link>

        {/* Mobile: value prop summary */}
        <div className="sm:hidden mb-8 pb-8 border-b border-[rgb(var(--line))]">
          <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] mb-1">Client portal</p>
          <p className="text-[15px] font-medium tracking-tight text-[rgb(var(--fg))] mb-5">
            Your project status, invoices, and files in one view.
          </p>
          <FeatureList accent={accent} />
        </div>

        {/* Tab switcher */}
        <div
          className="flex items-center gap-1 mb-7 border border-[rgb(var(--line))] p-1 self-start"
          style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both" }}
        >
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className="px-4 py-1.5 text-[13px] tracking-tight transition-all duration-150"
              style={{
                background: tab === t ? "rgb(var(--fg))" : "transparent",
                color: tab === t ? "rgb(var(--bg))" : "rgb(var(--muted))",
              }}
            >
              {t === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {/* Heading */}
        <div style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "40ms" }}>
          <h1 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-medium tracking-[-0.04em] leading-snug text-[rgb(var(--fg))] mb-2">
            {tab === "signin" ? "Welcome back." : "Get access."}
          </h1>
          <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] mb-7 max-w-xs leading-relaxed">
            {tab === "signin"
              ? "Sign in to view your project status, invoices, and shared files."
              : "Already working with us? Create an account to access your client dashboard."}
          </p>
        </div>

        {/* Confirmed state */}
        {message ? (
          <div className="flex flex-col gap-3" style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}>
            <p className="text-[13px] tracking-tight" style={{ color: accent }}>Confirmed</p>
            <p className="text-[15px] tracking-tight text-[rgb(var(--fg))]">{message}</p>
            <button onClick={() => switchTab("signin")} className="text-[13px] tracking-tight mt-2 self-start" style={{ color: accent }}>
              Back to sign in
            </button>
          </div>

        ) : tab === "signin" ? (
          <form onSubmit={onSignIn} className="flex flex-col gap-6 w-full max-w-sm" noValidate
            style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "80ms" }}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email" autoComplete="email" className={inputBase}
              style={{ borderColor: "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = accent; }}
              onBlur={(e) => { e.target.style.borderColor = "rgb(var(--line))"; }} />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" autoComplete="current-password" className={inputBase}
              style={{ borderColor: "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = accent; }}
              onBlur={(e) => { e.target.style.borderColor = "rgb(var(--line))"; }} />
            {error && <p className="text-[13px] tracking-tight text-red-500">{error}</p>}
            <div className="flex items-center gap-5 pt-1">
              <button type="submit" disabled={loading || !email || !password}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-[14px] tracking-tight font-medium transition-opacity duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
                style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}>
                {loading ? "Signing in..." : "Sign in"}
                {!loading && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </button>
              <button type="button" onClick={() => switchTab("signup")}
                className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
                No account? Sign up
              </button>
            </div>
          </form>

        ) : (
          <form onSubmit={onSignUp} className="flex flex-col gap-6 w-full max-w-sm" noValidate
            style={{ animation: "rise-in 280ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: "80ms" }}>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Your name" autoComplete="name" className={inputBase}
              style={{ borderColor: "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = accent; }}
              onBlur={(e) => { e.target.style.borderColor = "rgb(var(--line))"; }} />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email" autoComplete="email" className={inputBase}
              style={{ borderColor: "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = accent; }}
              onBlur={(e) => { e.target.style.borderColor = "rgb(var(--line))"; }} />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password" autoComplete="new-password" className={inputBase}
              style={{ borderColor: "rgb(var(--line))" }}
              onFocus={(e) => { e.target.style.borderColor = accent; }}
              onBlur={(e) => { e.target.style.borderColor = "rgb(var(--line))"; }} />
            <p className="text-[12px] tracking-tight text-[rgb(var(--muted))] opacity-60 -mt-2">
              Access is granted once we have confirmed your project.
            </p>
            {error && <p className="text-[13px] tracking-tight text-red-500">{error}</p>}
            <div className="flex items-center gap-5 pt-1">
              <button type="submit" disabled={loading || !email || !password}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-[14px] tracking-tight font-medium transition-opacity duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
                style={{ background: "rgb(var(--fg))", color: "rgb(var(--bg))" }}>
                {loading ? "Requesting..." : "Request access"}
                {!loading && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </button>
              <button type="button" onClick={() => switchTab("signin")}
                className="text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
                Have an account? Sign in
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
