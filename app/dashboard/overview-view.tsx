"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRightIcon, FolderKanbanIcon, ReceiptIcon, FileIcon, LifeBuoyIcon, XIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsIndicator } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StatusPill } from "./status-pill";
import { getSignedFileUrl } from "./actions";
import { WhopCheckoutModal } from "./invoices/whop-checkout-modal";
import { countCasesNeedingResponse } from "./support-cases";
import { fmt$, fmtDate, type Case, type Client, type Project, type ProjectUpdate, type Invoice, type DFile, type Message } from "./types";

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

/* Decorative header for the welcome dialog. An isometric box stands in for
   "your project taking shape," annotated with dimension lines and a callout
   label like a real architectural drawing. Pure line art in the dashboard's
   own neutral tokens (border, muted foreground), no accent color, so it
   reads as a diagram, not a logo. Dimension lines sit clear of the cube's
   silhouette (widest point is x = +-42, y = +-48) so they never cross it. */
function BlueprintHero() {
  return (
    <div
      aria-hidden
      className="relative -mx-4 -mt-4 mb-1 h-44 overflow-hidden rounded-t-xl border-b"
      style={{ backgroundColor: "var(--sh-sidebar)" }}
    >
      <svg viewBox="0 0 220 176" className="absolute inset-0 h-full w-full" fill="none">
        <g transform="translate(110 88)">
          {/* dimension line, left edge, with tick marks and a measurement label */}
          <g stroke="var(--sh-muted-foreground)" strokeOpacity="0.45" strokeWidth="1">
            <line x1="-64" y1="-48" x2="-64" y2="48" />
            <line x1="-67" y1="-48" x2="-61" y2="-48" />
            <line x1="-67" y1="48" x2="-61" y2="48" />
          </g>
          <text x="-70" y="0" textAnchor="end" dominantBaseline="middle" fontSize="8" letterSpacing="0.02em" fill="var(--sh-muted-foreground)" fillOpacity="0.65">48</text>

          {/* dimension line, bottom edge */}
          <g stroke="var(--sh-muted-foreground)" strokeOpacity="0.45" strokeWidth="1">
            <line x1="-42" y1="60" x2="42" y2="60" />
            <line x1="-42" y1="57" x2="-42" y2="63" />
            <line x1="42" y1="57" x2="42" y2="63" />
          </g>
          <text x="0" y="72" textAnchor="middle" fontSize="8" letterSpacing="0.02em" fill="var(--sh-muted-foreground)" fillOpacity="0.65">+84</text>

          {/* the cube itself */}
          <g stroke="var(--sh-foreground)" strokeOpacity="0.55" strokeWidth="1.5" strokeLinejoin="round">
            <path d="M0 -48 L42 -24 L0 0 L-42 -24 Z" fill="var(--sh-sidebar)" />
            <path d="M-42 -24 L0 0 L0 48 L-42 24 Z" fill="var(--sh-border)" fillOpacity="0.35" />
            <path d="M42 -24 L0 0 L0 48 L42 24 Z" fill="var(--sh-border)" fillOpacity="0.6" />
          </g>

          {/* leader line + label, top face */}
          <line x1="0" y1="-24" x2="48" y2="-45" stroke="var(--sh-muted-foreground)" strokeOpacity="0.45" strokeWidth="1" />
          <circle cx="0" cy="-24" r="1.8" fill="var(--sh-muted-foreground)" fillOpacity="0.65" />
          <text x="51" y="-43" fontSize="8" letterSpacing="0.02em" fill="var(--sh-muted-foreground)" fillOpacity="0.65">Project</text>
        </g>
      </svg>
    </div>
  );
}

/* Icon-led action tile for the welcome dialog. Distinct from QuickActionPill
   (a pill-shaped filter/toggle used elsewhere on this page) since this needs
   to read clearly as a button a first-time visitor should press, not a
   filter chip. */
function WelcomeAction({ label, href, icon: Icon }: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-lg border bg-sidebar px-2 py-3 text-center hover:bg-sidebar-accent/60 hover:border-foreground/20 transition-colors"
    >
      <Icon className="size-4 text-foreground" />
      <span className="text-[12px] font-medium tracking-tight text-foreground">{label}</span>
    </Link>
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

export function OverviewView({ client, clientEmail, projects, invoices, files, messages, projectUpdates, cases }: {
  client: Client | null;
  clientEmail: string;
  projects: Project[];
  invoices: Invoice[];
  files: DFile[];
  messages: Message[];
  projectUpdates: ProjectUpdate[];
  cases: Pick<Case, "id" | "status">[];
}) {
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showFirstProjectBar, setShowFirstProjectBar] = useState(false);

  // Accept-invite redirects here with ?welcome=1 right after a new client
  // finishes setting up their account. Strip the param immediately so a
  // refresh or back-navigation doesn't re-trigger the dialog.
  useEffect(() => {
    if (searchParams.get("welcome") === "1") {
      setShowWelcome(true);
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

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

  const latestFile = files[0] ?? null;

  const defaultOverviewTab =
    activeProjects.length > 0 ? "projects" :
    unpaidInvoices.length > 0 ? "invoices" :
    latestAdminMsg ? "message" :
    "activity";

  return (
    <div className="flex flex-col gap-8 pb-12 sm:pb-0">
      {showFirstProjectBar && firstProject && (
        <FirstProjectBar project={firstProject} onDismiss={dismissFirstProjectBar} />
      )}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] sm:[mask-image:none]">
        <div className="flex items-center gap-2 w-max sm:w-fit sm:flex-wrap">
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
            href="/dashboard/messages"
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
          <QuickActionPill label="New case" href="/dashboard/messages" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          href="/dashboard/messages"
          description="Messages"
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
                <Link href="/dashboard/messages">
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
          <Link href="/dashboard/messages" className="self-start mt-1 text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
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

      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-md text-center">
          <BlueprintHero />
          <DialogHeader>
            <DialogTitle className="text-[1.4rem] font-semibold tracking-[-0.03em]">
              Welcome{client?.name ? `, ${client.name.split(" ")[0]}` : ""}
            </DialogTitle>
            <DialogDescription className="text-[13px] tracking-tight leading-relaxed">
              Your account is set up. This is your client portal, where your projects, invoices, files, and messages all live. Check back for updates as work progresses, and reach out anytime through Support if you have questions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2">
            <WelcomeAction label="Projects" href="/dashboard/projects" icon={FolderKanbanIcon} />
            <WelcomeAction label="Invoices" href="/dashboard/invoices" icon={ReceiptIcon} />
            <WelcomeAction label="Files" href="/dashboard/files" icon={FileIcon} />
            <WelcomeAction label="Support" href="/dashboard/messages" icon={LifeBuoyIcon} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
