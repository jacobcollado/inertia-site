"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRightIcon, FolderKanbanIcon, XIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsIndicator } from "@/components/ui/tabs";
import { WelcomeDialog, startDashboardTour } from "./welcome-tour";
import { StatusPill } from "./status-pill";
import { getSignedFileUrl } from "./actions";
import { WhopCheckoutModal } from "./invoices/whop-checkout-modal";
import { countCasesNeedingResponse } from "./support-cases";
import { SetupBanner } from "./setup-banner";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { fmt$, fmtDate, type Case, type Client, type Project, type ProjectUpdate, type Invoice, type DFile, type Message, type License } from "./types";

function QuickActionPill({ label, badge, badgeCount, badgeUrgent, onClick, href }: {
  label: string;
  badge?: string;
  badgeCount?: number;
  badgeUrgent?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const className = "flex items-center gap-1.5 rounded-full border bg-sidebar px-3.5 py-1.5 text-[13px] font-medium tracking-tight hover:bg-sidebar-accent/40 transition-colors shrink-0";
  const countBadgeClass =
    "h-5 min-w-5 shrink-0 justify-center border-border/70 bg-background px-1.5 text-[11px] font-semibold tabular-nums shadow-sm";
  const content = (
    <>
      {label}
      {!!badgeCount && badgeCount > 0 && (
        <Badge variant="outline" className={`${countBadgeClass} text-foreground`}>
          {badgeCount > 9 ? "9+" : badgeCount}
        </Badge>
      )}
      {badge && (
        <Badge
          variant="outline"
          className={`${countBadgeClass} ${badgeUrgent ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}
        >
          {badge}
        </Badge>
      )}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

/* Persistent strip that replaces the welcome dialog once it's closed,
   pointing the new client straight at their first project instead of
   repeating anything already covered in the dialog. Only rendered when a
   project actually exists to link to. */
function FirstProjectBar({ project, onDismiss }: { project: Project; onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-sidebar px-4 py-2.5">
      <FolderKanbanIcon className="size-4 text-muted-foreground shrink-0" />
      <p className="flex-1 min-w-0 text-[13px] tracking-tight truncate">
        <span className="text-muted-foreground">Your project </span>
        <span className="font-medium text-foreground">{project.title}</span>
        <span className="text-muted-foreground"> is under way.</span>
      </p>
      <Link
        href={`/dashboard/projects/${project.id}`}
        className="shrink-0 text-[13px] font-medium tracking-tight underline underline-offset-4 hover:text-muted-foreground transition-colors"
      >
        View project
      </Link>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 flex items-center justify-center size-6 rounded-full text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}

/* One of the four overview stat cards. The whole card is a link to its
   section — clicking anywhere navigates away. The arrow in the bottom right
   corner is a plain visual affordance signalling that (not a control of its
   own); it's a decorative sibling of the link rather than nested inside it,
   so it doesn't turn into a second, redundant tab stop. Fixed min-height
   gives the arrow real breathing room below the header content instead of
   sitting flush against it. */
function SummaryCard({ href, description, title, action }: {
  href: string;
  description: string;
  title: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <Card className="relative gap-4 rounded-sm border overflow-hidden">
      <Link href={href} className="flex flex-col hover:bg-sidebar-accent/40 transition-colors min-h-[118px]">
        <CardHeader>
          <CardDescription>{description}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">{title}</CardTitle>
          <CardAction className="text-sm text-muted-foreground">{action}</CardAction>
        </CardHeader>
      </Link>
      <span aria-hidden className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border bg-sidebar text-muted-foreground pointer-events-none">
        <ArrowUpRightIcon className="size-5" />
      </span>
    </Card>
  );
}

export function OverviewView({ firstName, welcomeSeen, client, clientEmail, projects, invoices, files, messages, projectUpdates, cases, licenses }: {
  firstName?: string;
  welcomeSeen: boolean;
  client: Client | null;
  clientEmail: string;
  projects: Project[];
  invoices: Invoice[];
  files: DFile[];
  messages: Message[];
  projectUpdates: ProjectUpdate[];
  cases: Pick<Case, "id" | "status">[];
  licenses: License[];
}) {
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showFirstProjectBar, setShowFirstProjectBar] = useState(false);

  // Accept-invite redirects here with ?welcome=1 right after a new client
  // finishes setting up their account. Strip the param immediately so a
  // refresh or back-navigation doesn't re-trigger the dialog, and record it
  // on the user so reusing the link or another device never shows it again.
  useEffect(() => {
    if (searchParams.get("welcome") !== "1") return;
    router.replace("/dashboard");
    if (welcomeSeen) return;
    setShowWelcome(true);
    createSupabaseClient().auth.updateUser({ data: { welcome_seen: true } });
  }, [searchParams, router, welcomeSeen]);

  const firstProject = projects[0] ?? null;

  // Independent of the welcome dialog: the project an admin creates for a
  // client is rarely ready the moment they first log in, so this can't be
  // tied to the dialog closing (it fires once, at first login, and never
  // again). Instead it shows any time a project exists and hasn't been
  // dismissed for that specific project id, tracked in localStorage so a
  // dismissal survives across sessions and devices don't reset it every load.
  useEffect(() => {
    if (!firstProject) return;
    const dismissedId = localStorage.getItem("dashboard-first-project-dismissed");
    if (dismissedId !== firstProject.id) setShowFirstProjectBar(true);
  }, [firstProject]);

  const dismissFirstProjectBar = () => {
    setShowFirstProjectBar(false);
    if (firstProject) localStorage.setItem("dashboard-first-project-dismissed", firstProject.id);
  };

  const activeProjects = projects.filter(p => p.status === "active");
  const completedCount = projects.filter(p => p.status === "completed").length;

  const unpaidInvoices = invoices.filter(i => i.status !== "paid" && i.status !== "draft");
  const totalOwed = unpaidInvoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const nextDue = unpaidInvoices
    .filter(i => i.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0] ?? null;

  const casesNeedingResponse = countCasesNeedingResponse(cases, messages);
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
      href: "/dashboard/support",
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

  const latestFile = files[0] ?? null;

  const defaultOverviewTab =
    activeProjects.length > 0 ? "projects" :
    unpaidInvoices.length > 0 ? "invoices" :
    latestAdminMsg ? "message" :
    "activity";

  return (
    <div className="flex flex-col gap-8 pb-12 sm:pb-0">
      <SetupBanner licenses={licenses} />
      {showFirstProjectBar && firstProject && (
        <FirstProjectBar project={firstProject} onDismiss={dismissFirstProjectBar} />
      )}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] sm:[mask-image:none]">
        <div data-tour="overview-actions" className="flex items-center gap-2 w-max sm:w-fit sm:flex-wrap">
          {unpaidInvoices.length > 0 && (
            <QuickActionPill
              label="Pay now"
              badge={fmt$(totalOwed)}
              badgeUrgent={unpaidInvoices.some(i => i.status === "overdue")}
              onClick={() => {
                const payable = unpaidInvoices.find(i => i.payment_url);
                if (!payable?.payment_url) return;
                if (payable.payment_url.startsWith("http")) window.open(payable.payment_url, "_blank", "noreferrer");
                else setCheckoutPlanId(payable.payment_url);
              }}
            />
          )}
          <QuickActionPill
            label="Message support"
            badgeCount={casesNeedingResponse}
            href="/dashboard/support"
          />
          {latestFile && (
            <QuickActionPill
              label="Download latest file"
              onClick={async () => {
                const res = await getSignedFileUrl(latestFile.url);
                if (res.url) window.open(res.url, "_blank", "noreferrer");
              }}
            />
          )}
          <QuickActionPill label="New case" href="/dashboard/support" />
        </div>
      </div>

      <div data-tour="overview-summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          href="/dashboard/projects"
          description="Projects"
          title={projects.length}
          action={completedCount > 0 ? `${completedCount} completed` : activeProjects.length > 0 ? `${activeProjects.length} active` : "None yet"}
        />

        <SummaryCard
          href="/dashboard/invoices"
          description="Outstanding"
          title={totalOwed > 0 ? fmt$(totalOwed) : "All clear"}
          action={nextDue?.due_date ? `Due ${fmtDate(nextDue.due_date)}` : totalOwed === 0 ? "No open invoices" : ""}
        />

        <SummaryCard
          href="/dashboard/files"
          description="Files"
          title={files.length}
          action={files.length > 0 ? `Last added ${fmtDate(files[0].uploaded_at)}` : "None yet"}
        />

        <SummaryCard
          href="/dashboard/support"
          description="Support"
          title={casesNeedingResponse > 0 ? `${casesNeedingResponse} need response` : messages.length > 0 ? "Up to date" : "No messages"}
          action={latestAdminMsg ? `Last: ${fmtDate(latestAdminMsg.created_at)}` : "Say hello"}
        />
      </div>

      {(activeProjects.length > 0 || unpaidInvoices.length > 0 || latestAdminMsg || activity.length > 0) && (
        <Tabs defaultValue={defaultOverviewTab} className="gap-4">
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
            <TabsList className="relative bg-sidebar rounded-md border w-max sm:w-fit h-10 p-1">
              <TabsIndicator />
              {activeProjects.length > 0 && (
                <TabsTrigger value="projects" className="relative z-10 flex-none rounded-sm px-3 data-[active]:bg-transparent data-[active]:shadow-none">
                  {activeProjects.length === 1 ? "Active project" : "Active projects"}
                </TabsTrigger>
              )}
              {unpaidInvoices.length > 0 && (
                <TabsTrigger value="invoices" className="relative z-10 flex-none rounded-sm px-3 data-[active]:bg-transparent data-[active]:shadow-none">
                  {unpaidInvoices.length === 1 ? "Pending invoice" : "Pending invoices"}
                </TabsTrigger>
              )}
              {latestAdminMsg && (
                <TabsTrigger value="message" className="relative z-10 flex-none rounded-sm px-3 data-[active]:bg-transparent data-[active]:shadow-none">
                  Latest message
                </TabsTrigger>
              )}
              {activity.length > 0 && (
                <TabsTrigger value="activity" className="relative z-10 flex-none rounded-sm px-3 data-[active]:bg-transparent data-[active]:shadow-none">
                  Recent activity
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {activeProjects.length > 0 && (
            <TabsContent value="projects">
              <div className="flex flex-col gap-3">
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
                <Link href="/dashboard/support">
                  <Card className="overflow-hidden py-0 rounded-sm border hover:bg-sidebar-accent/40 transition-colors">
                    <div className="px-5 py-4">
                      <p className="text-[15px] leading-relaxed line-clamp-2">{latestAdminMsg.body}</p>
                    </div>
                    <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--sh-border)" }}>
                      <span className="text-[13px] text-muted-foreground">{fmtDate(latestAdminMsg.created_at)}</span>
                      {casesNeedingResponse > 0 && (
                        <Badge variant="outline" className="border-transparent bg-primary/15 text-primary">{casesNeedingResponse} need response</Badge>
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
          <Link href="/dashboard/support" className="self-start mt-1 text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
            Send a message
          </Link>
        </Card>
      )}

      {allClear && (
        <p className="text-sm text-muted-foreground py-4">Nothing needs your attention right now.</p>
      )}

      {checkoutPlanId && (
        <WhopCheckoutModal planId={checkoutPlanId} clientEmail={clientEmail} onClose={() => setCheckoutPlanId(null)} />
      )}

      <WelcomeDialog
        open={showWelcome}
        onOpenChange={setShowWelcome}
        firstName={firstName}
        onStartTour={startDashboardTour}
      />
    </div>
  );
}
