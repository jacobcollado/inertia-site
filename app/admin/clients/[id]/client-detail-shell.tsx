"use client";

import { useState, useTransition } from "react";
import { PencilIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateClient } from "../../actions";
import { ProjectsTab } from "./tabs/projects-tab";
import { InvoicesTab } from "./tabs/invoices-tab";
import { FilesTab } from "./tabs/files-tab";
import { MessagesTab } from "./tabs/messages-tab";
import { AccountTab } from "./tabs/account-tab";
import { HistoryTab } from "./tabs/history-tab";
import type { Client, Project, ProjectUpdate, Invoice, DFile, Message, AuditEntry } from "./types";

function ClientHeader({ client }: { client: Client }) {
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
      <Card className="p-6">
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
    <Card className="flex-row items-center gap-5 p-6">
      <Avatar className="h-14 w-14 rounded-2xl shrink-0">
        <AvatarFallback className="rounded-2xl text-[16px]">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">
            {displayName}
          </h1>
          {client.banned && (
            <Badge variant="outline" className="border-transparent bg-destructive/15 text-destructive">Suspended</Badge>
          )}
          {neverSignedIn && !client.banned && (
            <Badge variant="outline" className="border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400">Invite pending</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[14px] tracking-tight text-muted-foreground">{client.email}</span>
          {lastSeen && !neverSignedIn && (
            <span className="text-[13px] tracking-tight text-muted-foreground">· Last seen {lastSeen}</span>
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

export function ClientDetailShell({ client, projects, invoices, files, messages: initialMessages, adminLog, projectUpdates }: {
  client: Client;
  projects: Project[];
  invoices: Invoice[];
  files: DFile[];
  messages: Message[];
  adminLog: AuditEntry[];
  projectUpdates: ProjectUpdate[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const unreadCount = messages.filter(m => m.sender === "client" && !m.read_at).length;

  return (
    <div className="flex flex-col gap-6">
      <ClientHeader client={client} />

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="messages">
            Messages
            {unreadCount > 0 && (
              <Badge variant="default" size="sm" className="ml-1">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <ProjectsTab clientId={client.id} projects={projects} projectUpdates={projectUpdates} />
        </TabsContent>
        <TabsContent value="invoices">
          <InvoicesTab clientId={client.id} invoices={invoices} />
        </TabsContent>
        <TabsContent value="files">
          <FilesTab clientId={client.id} files={files} />
        </TabsContent>
        <TabsContent value="messages">
          <MessagesTab clientId={client.id} messages={messages} setMessages={setMessages} />
        </TabsContent>
        <TabsContent value="account">
          <AccountTab client={client} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab clientId={client.id} initial={adminLog} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
