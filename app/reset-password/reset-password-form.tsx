"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
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
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  const inputClass =
    "w-full bg-transparent border-b border-[rgb(var(--line))] py-4 text-[16px] tracking-tight text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] placeholder:opacity-35 focus:outline-none focus:border-[rgb(var(--fg))] transition-colors duration-200";

  const EyeIcon = ({ crossed }: { crossed: boolean }) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" />
      <circle cx="10" cy="10" r="2.5" />
      {crossed && <line x1="3" y1="3" x2="17" y2="17" />}
    </svg>
  );

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-6 sm:px-12 h-14 border-b border-[rgb(var(--line))] shrink-0">
        <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">
          <img src="/logo.png" alt="Inertia" className="h-4 w-auto dark:invert invert-0" />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]" style={{ animation: "rise-in 400ms cubic-bezier(0.22,1,0.36,1) both" }}>
          {done ? (
            <div className="flex flex-col gap-6">
              <h1 className="text-[2.2rem] font-medium tracking-[-0.04em] leading-tight text-[rgb(var(--fg))]">
                Password updated.
              </h1>
              <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                Taking you to your dashboard…
              </p>
            </div>
          ) : !ready ? (
            <div className="flex flex-col gap-4">
              <p className="text-[16px] tracking-tight text-[rgb(var(--muted))]">Verifying your link…</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-2">
                <h1 className="text-[2.2rem] font-medium tracking-[-0.04em] leading-tight text-[rgb(var(--fg))]">
                  Set a new password.
                </h1>
                <p className="text-[14px] tracking-tight text-[rgb(var(--muted))] leading-relaxed">
                  Choose something you'll remember.
                </p>
              </div>
              <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
                <div className="flex flex-col gap-5">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="New password"
                      autoComplete="new-password"
                      className={`${inputClass} pr-10`}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-0 inset-y-0 flex items-center text-[rgb(var(--muted))] opacity-40 hover:opacity-80 transition-opacity"
                      aria-label={showPassword ? "Hide password" : "Show password"}>
                      <EyeIcon crossed={showPassword} />
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      className={`${inputClass} pr-10`}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-0 inset-y-0 flex items-center text-[rgb(var(--muted))] opacity-40 hover:opacity-80 transition-opacity"
                      aria-label={showPassword ? "Hide password" : "Show password"}>
                      <EyeIcon crossed={showPassword} />
                    </button>
                  </div>
                </div>
                {error && <p className="text-[13px] tracking-tight text-red-500 -mt-4">{error}</p>}
                <button type="submit" disabled={loading || !password || !confirm}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13.5px] tracking-tight font-medium bg-[rgb(var(--fg))] text-[rgb(var(--bg))] hover:opacity-80 transition-opacity duration-150 disabled:opacity-20 disabled:cursor-not-allowed self-start">
                  {loading ? "Saving…" : "Set password"}
                  {!loading && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 px-6 sm:px-12 h-12 border-t border-[rgb(var(--line))] flex items-center">
        <span className="text-[11px] tracking-tight text-[rgb(var(--muted))] opacity-30">
          Built for clients who care about their build.
        </span>
      </div>
    </div>
  );
}
