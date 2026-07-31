"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "lucide-react";
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
  return <p className="text-[13px] tracking-tight text-destructive">{msg}</p>;
}

export function AcceptInviteForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    if (!name.trim()) { setError("Name is required."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setLoading(false); setError(error.message); return; }
    const profileRes = await updateClientProfile(name.trim());
    setLoading(false);
    if (profileRes.error) { setError(profileRes.error); return; }
    setPhase("done");
    setTimeout(() => router.push("/dashboard"), 2000);
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
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-muted-foreground">Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="h-9 text-foreground transition-[color,box-shadow] placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-0 focus-visible:border-foreground/30 focus-visible:ring-foreground/15"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className="h-9 pr-9 text-foreground transition-[color,box-shadow] placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-0 focus-visible:border-foreground/30 focus-visible:ring-foreground/15"
                  />
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
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    className="h-9 pr-9 text-foreground transition-[color,box-shadow] placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-0 focus-visible:border-foreground/30 focus-visible:ring-foreground/15"
                  />
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
              {error && <ErrorMessage msg={error} />}
              <Button type="submit" variant="secondary" disabled={loading || !name.trim() || !password || !confirm} className="w-full h-10">
                {loading ? <Spinner /> : null}
                {loading ? "Saving…" : "Set password"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
