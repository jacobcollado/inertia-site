"use client";

import { useState, useTransition } from "react";
import { PencilIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateClient } from "../../actions";
import type { Client } from "./types";

export function ClientHeader({ client, avatarUrl }: { client: Client; avatarUrl?: string | null }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const displayName = client.company ?? client.name ?? client.email;
  const initials = (client.name ?? client.email).slice(0, 2).toUpperCase();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateClient(client.id, client.email, fd);
      setEditing(false);
    });
  };

  if (editing) {
    return (
      <Card className="p-4 w-full lg:max-w-[58%] mx-auto">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input name="name" defaultValue={client.name ?? ""} placeholder="Name" />
          <Input name="company" defaultValue={client.company ?? ""} placeholder="Company" />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending} size="sm">{pending ? "Saving..." : "Save"}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      </Card>
    );
  }

  const neverSignedIn = !client.confirmed_at;
  const lastSeen = client.last_sign_in_at
    ? new Date(client.last_sign_in_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <Card className="flex-row items-center gap-4 p-4 w-full lg:max-w-[58%] mx-auto">
      <Avatar className="h-10 w-10 shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
        <AvatarFallback className="text-[14px]">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-[1.15rem] font-semibold tracking-[-0.03em] leading-snug text-foreground truncate">
            {displayName}
          </h1>
          {client.banned && (
            <Badge variant="outline" className="border-transparent bg-destructive/15 text-destructive">Suspended</Badge>
          )}
          {neverSignedIn && !client.banned && (
            <Badge variant="outline" className="border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400">Invite pending</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[13px] tracking-tight text-muted-foreground truncate">{client.email}</span>
          {lastSeen && !neverSignedIn && (
            <span className="text-[13px] tracking-tight text-muted-foreground shrink-0">· Last seen {lastSeen}</span>
          )}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="shrink-0">
        <PencilIcon />
        Edit
      </Button>
    </Card>
  );
}
