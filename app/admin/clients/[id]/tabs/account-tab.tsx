"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  suspendAccount, unsuspendAccount, deleteAccount,
  updateAccountEmail, updateAccountPassword, resendInvite,
  forceSignOut, generateMagicLink, updateClientNotes,
} from "../../../actions";
import type { Client } from "../types";

function AccountRow({ label, hint, children, last = false }: { label: string; hint?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-5 py-4 ${!last ? "border-b border-sidebar-border" : ""}`}>
      <div className="min-w-0">
        <p className="text-[15px] tracking-tight text-foreground">{label}</p>
        {hint && <p className="text-[13px] tracking-tight text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function AccountSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12px] font-medium tracking-tight text-muted-foreground px-1">{label}</p>
      <Card className="overflow-hidden py-0">{children}</Card>
    </div>
  );
}

function DeleteAccountDialog({ clientId, open, onOpenChange }: { clientId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const onDelete = () => {
    startTransition(async () => {
      const res = await deleteAccount(clientId);
      if (res.error) { setError(res.error); return; }
      router.push("/admin/clients?deleted=1");
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>This permanently deletes the account and all data. This cannot be undone.</DialogDescription>
        </DialogHeader>
        {error && <p className="text-[13px] text-destructive tracking-tight">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" variant="destructive" disabled={pending} onClick={onDelete}>
            {pending ? "Deleting..." : "Confirm delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AccountTab({ client }: { client: Client }) {
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState(client.email);
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState(client.notes ?? "");
  const [notesSaved, setNotesSaved] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const run = (fn: () => Promise<{ success?: boolean; error?: string }>, successMsg: string) => {
    setMsg(""); setError("");
    startTransition(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else setMsg(successMsg);
    });
  };

  const onCopyPortalLink = () => {
    const url = `${window.location.origin}/dashboard`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onGenerateMagicLink = () => {
    startTransition(async () => {
      const res = await generateMagicLink(client.id, client.email);
      if (res.error) { setError(res.error); return; }
      if (res.url) {
        setMagicLink(res.url);
        navigator.clipboard.writeText(res.url);
      }
    });
  };

  const onSaveNotes = () => {
    setNotesSaved(false);
    startTransition(async () => {
      const res = await updateClientNotes(client.id, notes);
      if (res.error) setError(res.error);
      else setNotesSaved(true);
    });
  };

  const lastSeen = client.last_sign_in_at
    ? new Date(client.last_sign_in_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "Never";

  return (
    <div className="flex flex-col gap-6">

      {(msg || error) && (
        <p className={`text-[13px] tracking-tight px-1 ${error ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
          {error || msg}
        </p>
      )}

      <AccountSection label="Status">
        <AccountRow label={client.banned ? "Account suspended" : "Account active"} hint={client.banned ? "Client cannot sign in." : "Client can sign in normally."}>
          {client.banned ? (
            <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => unsuspendAccount(client.id), "Account reinstated.")}>
              Reinstate
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => suspendAccount(client.id), "Account suspended.")}>
              Suspend
            </Button>
          )}
        </AccountRow>
        <AccountRow label="Last seen" hint={lastSeen} last>
          <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => forceSignOut(client.id), "Sessions invalidated.")}>
            Force sign out
          </Button>
        </AccountRow>
      </AccountSection>

      <AccountSection label="Access">
        <AccountRow label="Resend invite" hint="Send a new magic link to their email.">
          <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => resendInvite(client.id, client.email), "Invite sent.")}>
            Send
          </Button>
        </AccountRow>
        <AccountRow label="View as client" hint="Generate a sign-in link and open the portal as this client.">
          <Button variant="outline" size="sm" disabled={pending} onClick={onGenerateMagicLink}>
            {pending ? "Generating..." : magicLink ? "Copied" : "Generate"}
          </Button>
        </AccountRow>
        <AccountRow label="Portal link" hint="Copy the client's direct dashboard URL." last>
          <Button variant="outline" size="sm" onClick={onCopyPortalLink}>
            {copied ? "Copied" : "Copy link"}
          </Button>
        </AccountRow>
      </AccountSection>

      {magicLink && (
        <div className="px-4 py-3 rounded-xl text-[12px] tracking-tight text-muted-foreground break-all bg-sidebar-accent border border-sidebar-border">
          {magicLink}
        </div>
      )}

      <AccountSection label="Credentials">
        <div className="px-5 py-4 border-b border-sidebar-border">
          <Label className="text-[12px] text-muted-foreground mb-2 block">Email</Label>
          <div className="flex items-center gap-3">
            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="flex-1" />
            <Button size="sm" disabled={pending || email === client.email} onClick={() => run(() => updateAccountEmail(client.id, email), "Email updated.")}>Save</Button>
          </div>
        </div>
        <div className="px-5 py-4">
          <Label className="text-[12px] text-muted-foreground mb-2 block">New password</Label>
          <div className="flex items-center gap-3">
            <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Min. 6 characters" className="flex-1" />
            <Button size="sm" disabled={pending || password.length < 6} onClick={() => { run(() => updateAccountPassword(client.id, password), "Password updated."); setPassword(""); }}>Save</Button>
          </div>
        </div>
      </AccountSection>

      <AccountSection label="Internal notes">
        <div className="px-5 py-4">
          <Textarea
            value={notes}
            onChange={e => { setNotes(e.target.value); setNotesSaved(false); }}
            placeholder="Billing notes, communication preferences, anything relevant..."
            rows={4}
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 resize-none"
          />
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-sidebar-border">
            <Button size="sm" disabled={pending} onClick={onSaveNotes}>Save notes</Button>
            {notesSaved && <span className="text-[13px] tracking-tight text-emerald-600 dark:text-emerald-400">Saved.</span>}
          </div>
        </div>
      </AccountSection>

      <AccountSection label="Danger zone">
        <div className="px-5 py-4">
          <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
            Delete account
          </Button>
        </div>
      </AccountSection>

      <DeleteAccountDialog clientId={client.id} open={confirmDelete} onOpenChange={setConfirmDelete} />
    </div>
  );
}
