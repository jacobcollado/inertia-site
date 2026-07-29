"use client";

import { useState, useTransition } from "react";
import { useWebHaptics } from "web-haptics/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateClientProfile, signOut } from "../actions";
import { AccountDialog } from "../account-dialog";
import type { Client } from "../types";

function SettingsSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground px-1">{label}</p>
      <Card className="py-0 divide-y overflow-hidden">{children}</Card>
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

export function SettingsView({ client, avatarUrl: initialAvatarUrl }: { client: Client | null; avatarUrl: string | null }) {
  const { trigger } = useWebHaptics();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(client?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

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

  const initials = (client?.company ?? client?.name ?? "?").slice(0, 2).toUpperCase();
  const displayName = client?.company ?? client?.name ?? "Client";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card className="flex-row items-center gap-4 p-5">
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
      </Card>

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
            <p className="text-[15px] opacity-60">{client?.email}</p>
            <p className="text-xs text-muted-foreground mt-1">To change your email, message us.</p>
          </div>
          <div className="px-5 py-4 flex items-center gap-3">
            <Button type="submit" disabled={pending || !name.trim() || name.trim() === (client?.name ?? "")}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
            {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</span>}
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </form>
      </SettingsSection>

      <SettingsSection label="Account">
        <SettingsRow label="Sign out" hint="You'll be returned to the login screen.">
          <Button variant="outline" disabled={pending} onClick={() => startTransition(() => signOut())}>
            {pending ? "…" : "Sign out"}
          </Button>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
