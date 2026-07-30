"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useWebHaptics } from "web-haptics/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MailIcon } from "lucide-react";
import { updateClientProfile, updateNotificationPrefs, deleteOwnAccount, signOut } from "../actions";
import { AccountDialog } from "../account-dialog";
import type { Client, NotificationPrefs } from "../types";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

const PROVIDER_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  google: GoogleIcon,
  email: MailIcon,
};

function SettingsSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground px-1">{label}</p>
      <div className="rounded-sm border bg-sidebar overflow-hidden">{children}</div>
    </div>
  );
}

function SettingsRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="text-[15px]">{label}</p>
        {hint && <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const DEFAULT_PREFS: NotificationPrefs = { new_message: true, invoice_due: true, project_update: true };

const PROVIDER_LABEL: Record<string, string> = {
  email: "Email & password",
  google: "Google",
};

export function SettingsView({ client, avatarUrl: initialAvatarUrl, signInProviders }: {
  client: Client | null;
  avatarUrl: string | null;
  signInProviders: string[];
}) {
  const { trigger } = useWebHaptics();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(client?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  const [prefs, setPrefs] = useState<NotificationPrefs>(client?.notification_prefs ?? DEFAULT_PREFS);
  const [prefsPending, startPrefsTransition] = useTransition();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const onSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setError("");
    trigger("light");
    startTransition(async () => {
      const res = await updateClientProfile(name.trim());
      if (res.error) setError(res.error);
      else { trigger("success"); setSaved(true); }
    });
  };

  const togglePref = (key: keyof NotificationPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    trigger("light");
    startPrefsTransition(async () => {
      await updateNotificationPrefs(next);
    });
  };

  const onDeleteAccount = () => {
    setDeleteError("");
    setDeletePending(true);
    startTransition(async () => {
      const res = await deleteOwnAccount();
      setDeletePending(false);
      if (res.error) { setDeleteError(res.error); return; }
      router.push("/login");
    });
  };

  const initials = (client?.company ?? client?.name ?? "?").slice(0, 2).toUpperCase();
  const displayName = client?.company ?? client?.name ?? "Client";

  return (
    <div className="flex flex-col gap-6 w-full lg:max-w-[58%] mx-auto">
      <div className="flex items-center gap-4 rounded-sm border bg-sidebar p-5">
        <button type="button" onClick={() => setAccountOpen(true)} className="shrink-0">
          <Avatar className="h-12 w-12">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="text-base">{initials}</AvatarFallback>
          </Avatar>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-medium tracking-tight truncate">{displayName}</p>
          <p className="text-sm text-muted-foreground truncate">{client?.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setAccountOpen(true)} className="shrink-0">
          Change photo
        </Button>
      </div>

      <AccountDialog
        open={accountOpen}
        onOpenChange={setAccountOpen}
        displayName={displayName}
        email={client?.email ?? ""}
        avatarUrl={avatarUrl}
        onAvatarChange={setAvatarUrl}
      />

      <SettingsSection label="Profile">
        <form onSubmit={onSaveProfile}>
          <div className="px-5 py-4 border-b">
            <Label htmlFor="display-name" className="text-xs text-muted-foreground mb-2">Display name</Label>
            <Input
              id="display-name"
              value={name}
              onChange={e => { setName(e.target.value); setSaved(false); }}
              placeholder="Your name"
            />
          </div>
          <div className="px-5 py-4 border-b">
            <Label className="text-xs text-muted-foreground mb-2">Email</Label>
            <div className="rounded-md border bg-muted/40 px-3 py-2">
              <p className="text-[15px] text-muted-foreground">{client?.email}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">To change your email, message us.</p>
          </div>
          <div className="px-5 py-4 flex items-center gap-3">
            <Button
              type="submit"
              variant="ghost"
              className="text-foreground hover:text-foreground"
              style={{ backgroundColor: "color-mix(in srgb, var(--sh-foreground) 10%, transparent)" }}
              disabled={pending || !name.trim() || name.trim() === (client?.name ?? "")}
            >
              {pending ? "Saving…" : "Save changes"}
            </Button>
            {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</span>}
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </form>
      </SettingsSection>

      <SettingsSection label="Notifications">
        <div className="border-b">
          <label htmlFor="notif-message" className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer">
            <div className="min-w-0">
              <p className="text-[15px]">New message from support</p>
            </div>
            <Checkbox
              id="notif-message"
              checked={prefs.new_message}
              onCheckedChange={() => togglePref("new_message")}
              disabled={prefsPending}
            />
          </label>
        </div>
        <div className="border-b">
          <label htmlFor="notif-invoice" className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer">
            <div className="min-w-0">
              <p className="text-[15px]">New invoice</p>
            </div>
            <Checkbox
              id="notif-invoice"
              checked={prefs.invoice_due}
              onCheckedChange={() => togglePref("invoice_due")}
              disabled={prefsPending}
            />
          </label>
        </div>
        <div>
          <label htmlFor="notif-project" className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer">
            <div className="min-w-0">
              <p className="text-[15px]">Project updates</p>
            </div>
            <Checkbox
              id="notif-project"
              checked={prefs.project_update}
              onCheckedChange={() => togglePref("project_update")}
              disabled={prefsPending}
            />
          </label>
        </div>
      </SettingsSection>

      <SettingsSection label="Sign-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 px-5 py-4">
          <p className="text-[15px]">Connected sign-in methods</p>
          <div className="flex items-center gap-2 flex-wrap">
            {signInProviders.map(p => {
              const Icon = PROVIDER_ICON[p] ?? MailIcon;
              return (
                <span key={p} className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-[13px] text-muted-foreground">
                  <Icon className="size-3.5" />
                  {PROVIDER_LABEL[p] ?? p}
                </span>
              );
            })}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection label="Account">
        <SettingsRow label="Sign out">
          <Button variant="outline" disabled={pending} onClick={() => startTransition(() => signOut())}>
            {pending ? "…" : "Sign out"}
          </Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection label="Danger zone">
        <SettingsRow label="Delete account" hint="Permanently deletes your account and all associated data. This can't be undone.">
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            style={{ backgroundColor: "color-mix(in srgb, var(--sh-destructive) 12%, transparent)" }}
            onClick={() => setDeleteOpen(true)}
          >
            Delete account
          </Button>
        </SettingsRow>
      </SettingsSection>

      <Dialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) { setDeleteConfirmText(""); setDeleteError(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              This permanently deletes your account, projects, invoices, files, and messages. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="delete-confirm" className="text-xs text-muted-foreground">Type DELETE to confirm</Label>
            <Input id="delete-confirm" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="DELETE" />
            {deleteError && <span className="text-sm text-destructive">{deleteError}</span>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              style={{ backgroundColor: "color-mix(in srgb, var(--sh-destructive) 12%, transparent)" }}
              disabled={deleteConfirmText !== "DELETE" || deletePending}
              onClick={onDeleteAccount}
            >
              {deletePending ? "Deleting…" : "Delete my account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
