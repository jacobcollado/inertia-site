"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeOffIcon, ArrowUpIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateClientProfile } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Phase = "checking" | "expired" | "set-password" | "done";

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
    <p
      className="w-full text-[13px] tracking-tight rounded-lg px-3 py-1.5 text-center"
      style={{
        color: "#ef4444",
        background: "rgba(239, 68, 68, 0.15)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        animation: "rise-in 200ms cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      {msg}
    </p>
  );
}

function HintMessage({ msg }: { msg: string }) {
  return (
    <p
      className="w-full text-[13px] tracking-tight text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-center"
      style={{ animation: "rise-in 200ms cubic-bezier(0.22,1,0.36,1) both" }}
    >
      {msg}
    </p>
  );
}

export function AcceptInviteForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [phase, setPhase] = useState<Phase>("checking");

  // Dashboard routes render uniformly dark — iOS Safari tints its top/bottom
  // toolbars (and the overscroll rubber-band) from <html>'s background, so
  // this pins it to the dashboard's dark token to match, same as
  // ClientSidebarShell does for the rest of /dashboard.
  useEffect(() => {
    document.documentElement.classList.add("dashboard-dark");
    return () => {
      document.documentElement.classList.remove("dashboard-dark");
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Unlike password recovery, Supabase's invite link uses the implicit
    // flow — the tokens arrive in the URL hash fragment (#access_token=...),
    // which never reaches the server, so there's no /auth/callback exchange
    // step. @supabase/ssr's browser client defaults to the PKCE flow and does
    // NOT auto-detect/consume implicit-flow hash fragments the way the plain
    // supabase-js client does, so the tokens have to be parsed out of the
    // hash and applied manually via setSession — getSession() alone never
    // picks them up.
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(({ data, error }) => {
        // Clear the tokens from the URL regardless of outcome so they don't
        // linger in browser history or get resubmitted on refresh.
        window.history.replaceState(null, "", window.location.pathname);
        if (!error && data.session) setPhase("set-password");
        else setPhase("expired");
      });
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) { setPhase("set-password"); return; }
        setPhase("expired");
      });
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHint("");
    setError("");
    if (!name.trim()) { setError("Name is required."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setHint("Password must be at least 6 characters."); return; }
    if (!/\d/.test(password)) { setHint("Password must include a number."); return; }
    if (!/[^A-Za-z0-9]/.test(password)) { setHint("Password must include a symbol."); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setLoading(false); setError(error.message); return; }
    const profileRes = await updateClientProfile(name.trim());
    setLoading(false);
    if (profileRes.error) { setError(profileRes.error); return; }
    setPhase("done");
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  const onPasswordKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState("CapsLock"));
  };

  const onGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const supabase = createClient();
    // linkIdentity (not signInWithOAuth) attaches Google to the invited
    // account that's already signed in from the invite link, rather than
    // starting a fresh sign-in that could create or collide with a separate
    // account. The redirect back through /auth/callback already syncs
    // Google's name/avatar into clients/profiles and lands on /dashboard.
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setGoogleLoading(false); setError(error.message); }
  };

  return (
    <div className="min-h-svh w-full flex items-center justify-center bg-sidebar px-6 py-8">
      <div className="w-full max-w-[380px] rounded-xl border bg-background p-8">
        {phase === "checking" ? (
          <div className="flex flex-col gap-4">
            <p className="text-[14px] tracking-tight text-muted-foreground">Verifying your invite…</p>
          </div>
        ) : phase === "done" ? (
          <div className="flex flex-col text-center gap-2">
            <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">
              You&rsquo;re all set
            </h1>
            <p className="text-[13px] tracking-tight text-muted-foreground">
              Taking you to your dashboard…
            </p>
          </div>
        ) : phase === "expired" ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col text-center gap-2">
              <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">
                Link expired
              </h1>
              <p className="text-[13px] tracking-tight text-muted-foreground">
                This invite link is no longer valid. Contact us for a new one.
              </p>
            </div>
            <Link href="/login" className="text-[13px] tracking-tight text-muted-foreground hover:text-foreground transition-colors text-center">
              Back to sign in
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col text-center gap-2">
              <p className="text-[13px] tracking-tight text-muted-foreground">Welcome to Inertia</p>
              <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">
                Set a password
              </h1>
              <p className="text-[13px] tracking-tight text-muted-foreground">
                Tell us your name and choose a password to finish setting up your client portal.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={googleLoading || loading}
              onClick={onGoogle}
              className="w-full h-10 text-white"
            >
              {googleLoading ? <Spinner /> : (
                <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {googleLoading ? "Redirecting…" : "Continue with Google"}
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[12px] tracking-tight text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-muted-foreground">Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="h-9 text-foreground transition-[color,box-shadow] placeholder:text-[12px] placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-0 focus-visible:border-foreground/30 focus-visible:ring-foreground/15"
                  style={{ fontSize: 16 }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-muted-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={onPasswordKey}
                    onKeyDown={onPasswordKey}
                    placeholder="6+ characters"
                    autoComplete="new-password"
                    className="h-9 pr-14 text-foreground transition-[color,box-shadow] placeholder:text-[12px] placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-0 focus-visible:border-foreground/30 focus-visible:ring-foreground/15"
                    style={{ fontSize: 16 }}
                  />
                  {capsLockOn && (
                    <span
                      className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground"
                      title="Caps Lock is on"
                      aria-label="Caps Lock is on"
                    >
                      <ArrowUpIcon className="size-3.5" />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-password" className="text-muted-foreground">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    disabled={loading}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyUp={onPasswordKey}
                    onKeyDown={onPasswordKey}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    className="h-9 pr-14 text-foreground transition-[color,box-shadow] placeholder:text-[12px] placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-0 focus-visible:border-foreground/30 focus-visible:ring-foreground/15"
                    style={{ fontSize: 16 }}
                  />
                  {capsLockOn && (
                    <span
                      className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground"
                      title="Caps Lock is on"
                      aria-label="Caps Lock is on"
                    >
                      <ArrowUpIcon className="size-3.5" />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                  </button>
                </div>
              </div>
              {hint && <HintMessage msg={hint} />}
              {error && <ErrorMessage msg={error} />}
              <Button type="submit" variant="secondary" disabled={loading || !name.trim() || !password || !confirm} className="w-full h-10 transition-opacity">
                {loading ? <Spinner /> : null}
                {loading ? "Saving…" : "Set password"}
              </Button>
              <p className="text-[12px] tracking-tight text-muted-foreground text-center leading-relaxed">
                By creating an account, you agree to our{" "}
                <Link href="/policies/terms-of-service" className="underline hover:text-foreground transition-colors">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/policies/privacy-policy" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
