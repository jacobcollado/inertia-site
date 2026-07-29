"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusPill } from "./status-pill";
import { fmt$, fmtDate, type Client, type Project, type ProjectUpdate, type Invoice, type DFile, type Message } from "./types";

export function OverviewView({ client, projects, invoices, files, messages, projectUpdates }: {
  client: Client | null;
  projects: Project[];
  invoices: Invoice[];
  files: DFile[];
  messages: Message[];
  projectUpdates: ProjectUpdate[];
}) {
  const firstName = client?.name?.split(" ")[0] ?? null;
  const greeting = client?.company ?? (firstName ? `Hey, ${firstName}.` : "Hey.");

  const activeProjects = projects.filter(p => p.status === "active");
  const completedCount = projects.filter(p => p.status === "completed").length;

  const unpaidInvoices = invoices.filter(i => i.status !== "paid" && i.status !== "draft");
  const totalOwed = unpaidInvoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const nextDue = unpaidInvoices
    .filter(i => i.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0] ?? null;

  const unreadFromAdmin = messages.filter(m => m.sender === "admin" && !m.read_at);
  const latestAdminMsg = messages.filter(m => m.sender === "admin").at(-1) ?? null;

  const empty = projects.length === 0 && invoices.length === 0 && files.length === 0 && messages.length === 0;
  const allClear = !empty && activeProjects.length === 0 && unpaidInvoices.length === 0 && !latestAdminMsg;

  const projectTitleById = new Map(projects.map(p => [p.id, p.title]));

  type ActivityItem = { type: "update" | "invoice" | "file" | "message"; label: string; sublabel?: string; date: string; href: string };
  const activity: ActivityItem[] = [
    ...projectUpdates.map((u): ActivityItem => ({
      type: "update",
      label: projectTitleById.get(u.project_id) ?? "Project",
      sublabel: u.status.replace("_", " "),
      date: u.created_at,
      href: "/dashboard/projects",
    })),
    ...invoices.filter(i => i.status === "paid").map((i): ActivityItem => ({
      type: "invoice",
      label: i.label,
      sublabel: `${fmt$(i.amount)} paid`,
      date: i.paid_at ?? "",
      href: "/dashboard/invoices",
    })),
    ...files.map((f): ActivityItem => ({
      type: "file",
      label: f.label,
      sublabel: "shared",
      date: f.uploaded_at,
      href: "/dashboard/files",
    })),
    ...messages.filter(m => m.sender === "admin").map((m): ActivityItem => ({
      type: "message",
      label: m.body.length > 60 ? `${m.body.slice(0, 60)}…` : m.body,
      sublabel: "message",
      date: m.created_at,
      href: "/dashboard/messages",
    })),
  ]
    .filter(a => a.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const ACTIVITY_TYPE_LABEL: Record<ActivityItem["type"], string> = {
    update: "Update",
    invoice: "Invoice",
    file: "File",
    message: "Message",
  };

  const defaultOverviewTab =
    activeProjects.length > 0 ? "projects" :
    unpaidInvoices.length > 0 ? "invoices" :
    latestAdminMsg ? "message" :
    "activity";

  return (
    <div className="flex flex-col gap-8 pb-12 sm:pb-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{greeting}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {client?.company ? `Hey${firstName ? `, ${firstName}` : ""}. Here's where everything stands.` : "Here's where everything stands."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/projects">
          <Card className="gap-4 rounded-sm border hover:bg-sidebar-accent/40 transition-colors">
            <CardHeader>
              <CardDescription>Projects</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{projects.length}</CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 border-0 bg-transparent p-0 px-6 text-sm">
              <div className="text-muted-foreground">
                {completedCount > 0 ? `${completedCount} completed` : activeProjects.length > 0 ? `${activeProjects.length} active` : "None yet"}
              </div>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/dashboard/invoices">
          <Card className="gap-4 rounded-sm border hover:bg-sidebar-accent/40 transition-colors">
            <CardHeader>
              <CardDescription>Outstanding</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {totalOwed > 0 ? fmt$(totalOwed) : "All clear"}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 border-0 bg-transparent p-0 px-6 text-sm">
              <div className="text-muted-foreground">
                {nextDue?.due_date ? `Due ${fmtDate(nextDue.due_date)}` : totalOwed === 0 ? "No open invoices" : ""}
              </div>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/dashboard/files">
          <Card className="gap-4 rounded-sm border hover:bg-sidebar-accent/40 transition-colors">
            <CardHeader>
              <CardDescription>Files</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{files.length}</CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 border-0 bg-transparent p-0 px-6 text-sm">
              <div className="text-muted-foreground">
                {files.length > 0 ? `Last added ${fmtDate(files[0].uploaded_at)}` : "None yet"}
              </div>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/dashboard/messages">
          <Card className="gap-4 rounded-sm border hover:bg-sidebar-accent/40 transition-colors">
            <CardHeader>
              <CardDescription>Messages</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {unreadFromAdmin.length > 0 ? `${unreadFromAdmin.length} new` : messages.length > 0 ? "Up to date" : "No messages"}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 border-0 bg-transparent p-0 px-6 text-sm">
              <div className="text-muted-foreground">
                {latestAdminMsg ? `Last: ${fmtDate(latestAdminMsg.created_at)}` : "Say hello"}
              </div>
            </CardFooter>
          </Card>
        </Link>
      </div>

      {(activeProjects.length > 0 || unpaidInvoices.length > 0 || latestAdminMsg || activity.length > 0) && (
        <Tabs defaultValue={defaultOverviewTab} className="gap-1">
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
            <TabsList className="bg-sidebar rounded-lg border w-max sm:w-fit">
              {activeProjects.length > 0 && (
                <TabsTrigger value="projects" className="flex-none rounded-md data-[active]:rounded-md data-[active]:bg-background data-[active]:border-border data-[active]:shadow-sm">
                  {activeProjects.length === 1 ? "Active project" : "Active projects"}
                </TabsTrigger>
              )}
              {unpaidInvoices.length > 0 && (
                <TabsTrigger value="invoices" className="flex-none rounded-md data-[active]:rounded-md data-[active]:bg-background data-[active]:border-border data-[active]:shadow-sm">
                  {unpaidInvoices.length === 1 ? "Pending invoice" : "Pending invoices"}
                </TabsTrigger>
              )}
              {latestAdminMsg && (
                <TabsTrigger value="message" className="flex-none rounded-md data-[active]:rounded-md data-[active]:bg-background data-[active]:border-border data-[active]:shadow-sm">
                  Latest message
                </TabsTrigger>
              )}
              {activity.length > 0 && (
                <TabsTrigger value="activity" className="flex-none rounded-md data-[active]:rounded-md data-[active]:bg-background data-[active]:border-border data-[active]:shadow-sm">
                  Recent activity
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {activeProjects.length > 0 && (
            <TabsContent value="projects">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-end px-1">
                  {projects.length > activeProjects.length && (
                    <Link href="/dashboard/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">See all →</Link>
                  )}
                </div>
                <Card className="overflow-hidden py-0 rounded-sm border">
                  {activeProjects.map((p, i) => {
                    const updates = projectUpdates.filter(u => u.project_id === p.id);
                    const latestUpdate = updates[0] ?? null;
                    return (
                      <div
                        key={p.id}
                        className="flex items-start justify-between gap-4 px-5 py-4"
                        style={{ borderBottom: i < activeProjects.length - 1 ? "1px solid var(--sh-border)" : "none" }}
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-[15px] font-medium tracking-tight truncate">{p.title}</span>
                          {p.phase && <span className="text-[13px] text-muted-foreground">{p.phase}</span>}
                          {latestUpdate?.note && (
                            <p className="text-[13px] text-muted-foreground leading-relaxed mt-1 max-w-lg">{latestUpdate.note}</p>
                          )}
                        </div>
                        <StatusPill status={latestUpdate?.status ?? p.status} />
                      </div>
                    );
                  })}
                </Card>
              </div>
            </TabsContent>
          )}

          {unpaidInvoices.length > 0 && (
            <TabsContent value="invoices">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-end px-1">
                  <Link href="/dashboard/invoices" className="text-sm text-muted-foreground hover:text-foreground transition-colors">See all →</Link>
                </div>
                <Card className="overflow-hidden py-0 rounded-sm border">
                  {unpaidInvoices.slice(0, 3).map((inv, i) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between gap-4 px-5 py-4"
                      style={{ borderBottom: i < Math.min(unpaidInvoices.length, 3) - 1 ? "1px solid var(--sh-border)" : "none" }}
                    >
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium tracking-tight truncate">{inv.label}</p>
                        {inv.due_date && (
                          <p className={`text-[13px] mt-0.5 ${inv.status === "overdue" ? "text-destructive" : "text-muted-foreground"}`}>
                            {inv.status === "overdue" ? "Overdue " : "Due "}{fmtDate(inv.due_date)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[16px] font-semibold tabular-nums">{fmt$(inv.amount)}</span>
                        {inv.payment_url && inv.payment_url.startsWith("http") ? (
                          <a href={inv.payment_url} target="_blank" rel="noreferrer">
                            <Badge variant="outline" className="cursor-pointer border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400">Pay</Badge>
                          </a>
                        ) : (
                          <StatusPill status={inv.status} />
                        )}
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </TabsContent>
          )}

          {latestAdminMsg && (
            <TabsContent value="message">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-end px-1">
                  <Link href="/dashboard/messages" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Open thread →</Link>
                </div>
                <Link href="/dashboard/messages">
                  <Card className="overflow-hidden py-0 rounded-sm border hover:bg-sidebar-accent/40 transition-colors">
                    <div className="px-5 py-4">
                      <p className="text-[15px] leading-relaxed line-clamp-2">{latestAdminMsg.body}</p>
                    </div>
                    <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--sh-border)" }}>
                      <span className="text-[13px] text-muted-foreground">{fmtDate(latestAdminMsg.created_at)}</span>
                      {unreadFromAdmin.length > 0 && (
                        <Badge variant="outline" className="border-transparent bg-primary/15 text-primary">{unreadFromAdmin.length} unread</Badge>
                      )}
                    </div>
                  </Card>
                </Link>
              </div>
            </TabsContent>
          )}

          {activity.length > 0 && (
            <TabsContent value="activity">
              <div className="flex flex-col gap-3">
                <Card className="overflow-hidden py-0 rounded-sm border">
                  {activity.map((a, i) => (
                    <Link
                      key={i}
                      href={a.href}
                      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-sidebar-accent/40 transition-colors"
                      style={{ borderBottom: i < activity.length - 1 ? "1px solid var(--sh-border)" : "none" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant="outline" className="capitalize shrink-0 border-transparent bg-muted text-muted-foreground">
                          {ACTIVITY_TYPE_LABEL[a.type]}
                        </Badge>
                        <span className="text-[15px] tracking-tight truncate">{a.label}</span>
                        {a.sublabel && <span className="text-[13px] text-muted-foreground truncate hidden sm:block capitalize">{a.sublabel}</span>}
                      </div>
                      <span className="text-[13px] text-muted-foreground shrink-0">{fmtDate(a.date)}</span>
                    </Link>
                  ))}
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}

      {empty && (
        <Card className="gap-3 px-6 py-6 rounded-sm">
          <p className="text-[16px] font-medium tracking-tight">Your project is being set up.</p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            We're getting everything ready. You'll see your project details, files, and invoices here once we kick things off.
          </p>
          <Link href="/dashboard/messages" className="self-start mt-1 text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
            Send a message
          </Link>
        </Card>
      )}

      {allClear && (
        <p className="text-sm text-muted-foreground py-4">Nothing needs your attention right now.</p>
      )}
    </div>
  );
}
