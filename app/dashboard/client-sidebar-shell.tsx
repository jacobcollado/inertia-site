"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  FolderIcon,
  LayersIcon,
  FileIcon,
  LifeBuoyIcon,
  BadgeCheckIcon,
  SettingsIcon,
  HistoryIcon,
  MenuIcon,
  SearchIcon,
  ArrowLeftIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { NavUser } from "./nav-user";
import { cn } from "@/lib/utils";
import { PageCrumbProvider, usePageCrumbValues } from "./page-crumb-context";

const OVERVIEW_NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
];

const WORKSPACE_NAV_ITEMS = [
  { href: "/dashboard/projects", label: "Projects", icon: FolderIcon },
  { href: "/dashboard/messages", label: "Support", icon: LifeBuoyIcon },
  { href: "/dashboard/licenses", label: "Licenses", icon: BadgeCheckIcon },
  { href: "/dashboard/changelog", label: "Changelog", icon: HistoryIcon },
];

const SETTINGS_NAV_ITEMS = [
  { href: "/dashboard/invoices", label: "Invoices", icon: LayersIcon },
  { href: "/dashboard/files", label: "Files", icon: FileIcon },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

// Flattened for the mobile nav dock's dialog and search — same items as the
// three groups above, kept in one list since the dock renders them without
// the desktop sidebar's grouped sections.
const ALL_NAV_ITEMS = [...OVERVIEW_NAV_ITEMS, ...WORKSPACE_NAV_ITEMS, ...SETTINGS_NAV_ITEMS];

function NavItems({ items, pathname, casesNeedingResponse }: { items: typeof WORKSPACE_NAV_ITEMS; pathname: string; casesNeedingResponse?: number }) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
        const badge = label === "Support" ? casesNeedingResponse : undefined;
        return (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton
              tooltip={label}
              isActive={active}
              render={<Link href={href} onClick={() => setOpenMobile(false)} />}
              className={cn(
                "h-10 text-[14px] [&_svg]:size-3.5",
                active
                  ? "bg-sidebar-accent font-semibold text-sidebar-foreground hover:bg-sidebar-accent"
                  : "hover:bg-sidebar-accent"
              )}
            >
              <Icon />
              <span className="flex-1">{label}</span>
              {!!badge && badge > 0 && (
                <Badge
                  variant="outline"
                  className="ml-auto h-5 min-w-5 shrink-0 justify-center border-border/70 bg-background px-1.5 text-[11px] font-semibold tabular-nums text-foreground shadow-sm"
                >
                  {badge > 9 ? "9+" : badge}
                </Badge>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function AppSidebar({ casesNeedingResponse, email, displayName, avatarUrl }: { casesNeedingResponse: number; email: string; displayName: string; avatarUrl: string | null }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[slot=sidebar-menu-button]:!p-1.5" render={<Link href="/dashboard" onClick={() => setOpenMobile(false)} />}>
              <img src="/portal-logo.png" alt="Inertia" className="h-5 w-auto dark:invert" style={{ display: "block" }} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <NavItems items={OVERVIEW_NAV_ITEMS} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavItems items={WORKSPACE_NAV_ITEMS} pathname={pathname} casesNeedingResponse={casesNeedingResponse} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavItems items={SETTINGS_NAV_ITEMS} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser email={email} initialDisplayName={displayName} initialAvatarUrl={avatarUrl} />
      </SidebarFooter>
    </Sidebar>
  );
}

// Replaces the sidebar entirely on mobile: a fixed pill at the bottom of the
// screen holding a nav trigger and a search trigger, each opening their own
// dialog rather than a side-sliding Sheet. Deliberately independent of
// SidebarContext/useSidebar — this never mounts on desktop, where the real
// Sidebar (with its own Sheet-based mobile fallback) still handles things.
function MobileNavDock({ casesNeedingResponse }: { casesNeedingResponse: number }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_NAV_ITEMS;
    return ALL_NAV_ITEMS.filter(item => item.label.toLowerCase().includes(q));
  }, [query]);

  // Only the empty-query default list is capped — typed queries are already
  // a deliberate narrowing, so they show every match with nothing hidden.
  const isDefaultList = query.trim().length === 0;
  const visible = isDefaultList && !showAll ? filtered.slice(0, 4) : filtered;
  const hiddenCount = filtered.length - visible.length;

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setShowAll(false);
  };

  const renderRow = (item: (typeof ALL_NAV_ITEMS)[number], onNavigate: () => void) => {
    const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
    const badge = item.label === "Support" ? casesNeedingResponse : undefined;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] transition-colors",
          active ? "bg-sidebar-accent font-semibold text-sidebar-foreground" : "hover:bg-sidebar-accent"
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        {!!badge && badge > 0 && (
          <Badge
            variant="outline"
            className="h-5 min-w-5 shrink-0 justify-center border-border/70 bg-background px-1.5 text-[11px] font-semibold tabular-nums text-foreground shadow-sm"
          >
            {badge > 9 ? "9+" : badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <>
      <div className="md:hidden fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <div className="flex items-center gap-1 rounded-full border border-sidebar-border bg-sidebar p-1 shadow-lg">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <SearchIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground transition-opacity hover:opacity-85"
          >
            <MenuIcon className="size-4" />
          </button>
        </div>
      </div>

      <Dialog open={navOpen} onOpenChange={setNavOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Menu</DialogTitle>
          </DialogHeader>
          <nav className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              {OVERVIEW_NAV_ITEMS.map(item => renderRow(item, () => setNavOpen(false)))}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="px-3 pb-1 text-[11px] font-medium text-muted-foreground">Workspace</p>
              {WORKSPACE_NAV_ITEMS.map(item => renderRow(item, () => setNavOpen(false)))}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="px-3 pb-1 text-[11px] font-medium text-muted-foreground">Account</p>
              {SETTINGS_NAV_ITEMS.map(item => renderRow(item, () => setNavOpen(false)))}
            </div>
          </nav>
        </DialogContent>
      </Dialog>

      <Dialog open={searchOpen} onOpenChange={(open) => (open ? setSearchOpen(true) : closeSearch())}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setShowAll(false); }}
            placeholder="Search sections..."
            autoFocus
            className="w-full rounded-md border bg-background px-3 py-2 text-sm tracking-tight placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground/40 transition-colors"
            style={{ fontSize: 16 }}
          />
          <nav className="flex flex-col gap-0.5">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">No matches.</p>
            ) : (
              <>
                {visible.map(item => renderRow(item, closeSearch))}
                {hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="flex items-center justify-center rounded-lg px-3 py-2.5 text-[14px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  >
                    View {hiddenCount} more
                  </button>
                )}
              </>
            )}
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
}

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/projects": "Projects",
  "/dashboard/invoices": "Invoices",
  "/dashboard/files": "Files",
  "/dashboard/messages": "Support",
  "/dashboard/licenses": "Licenses",
  "/dashboard/changelog": "Changelog",
  "/dashboard/settings": "Settings",
};

// Section roots that have their own sub-pages needing a trailing breadcrumb
// segment: /messages/new (static "New") and the /licenses/[id], /invoices/[id],
// /projects/[id] detail routes, whose label is only known once that page's own
// data has loaded — those publish it via PageCrumbProvider instead of a static map.
const CRUMB_SECTIONS: { prefix: string; base: string }[] = [
  { prefix: "/dashboard/messages", base: "Support" },
  { prefix: "/dashboard/licenses", base: "Licenses" },
  { prefix: "/dashboard/invoices", base: "Invoices" },
  { prefix: "/dashboard/projects", base: "Projects" },
];

function SiteHeader() {
  const pathname = usePathname();
  const { crumb, actions } = usePageCrumbValues();

  const section = CRUMB_SECTIONS.find(s => pathname !== s.prefix && pathname.startsWith(`${s.prefix}/`));
  const title = TITLES[pathname] ?? section?.base ?? "Dashboard";
  const titleHref = TITLES[pathname] ? undefined : section?.prefix;
  const trailingLabel = section
    ? (pathname === "/dashboard/messages/new" ? "New" : crumb)
    : null;

  // Pages that publish `actions` (currently just the case thread) render
  // their own full header row — back arrow, centered crumb, badges/menu —
  // in place of the usual centered "Section / crumb" breadcrumb, since that
  // row used to live duplicated inside the page content instead of the
  // shared topbar. /messages/new has no actions of its own, but needs the
  // same bare "back arrow only" treatment (its old in-page header — arrow +
  // "New case" label — was removed in favor of this).
  const isNewCase = pathname === "/dashboard/messages/new";
  if (actions || isNewCase) {
    return (
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border md:rounded-t-xl">
        <div className="flex w-full items-center gap-2 px-4 lg:px-6">
          <div className="flex min-w-0 flex-1 items-center justify-start">
            {titleHref && (
              <Link href={titleHref} className="text-primary hover:text-primary/80 transition-colors shrink-0">
                <ArrowLeftIcon className="size-4" />
                <span className="sr-only">{title}</span>
              </Link>
            )}
          </div>
          <div className="flex shrink-0 items-center justify-center">
            {isNewCase ? (
              <span className="flex items-center gap-1.5 text-[15px] font-medium tracking-tight">
                <span className="text-muted-foreground">{title}</span>
                <span className="text-muted-foreground">/</span>
                <span>{trailingLabel}</span>
              </span>
            ) : crumb && (
              <span className="text-[13px] tabular-nums text-muted-foreground">{crumb}</span>
            )}
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            {actions}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border md:rounded-t-xl">
      <div className="relative flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 hidden md:flex" />
        <div className="pointer-events-none absolute inset-0 flex items-center px-4 lg:px-6">
          {/* The content column below (e.g. licenses-view.tsx) is itself
              perfectly centered — but individual rows inside it (like the
              license row's [1fr_auto_1fr_auto] grid) place their own
              "center" column left of that true center, since the trailing
              actions column has no mirrored spacer on the left. Rather than
              rework every row's grid, the topbar's label is nudged left by
              the same amount so it visually lines up with what users
              actually see as centered in the row below. */}
          <div className="w-full lg:max-w-[58%] mx-auto lg:-translate-x-5 flex items-center justify-center gap-1.5">
            {titleHref ? (
              <Link href={titleHref} className="pointer-events-auto text-[15px] font-medium tracking-tight text-muted-foreground hover:text-foreground transition-colors">
                {title}
              </Link>
            ) : (
              <h1 className="text-[15px] font-medium tracking-tight">{title}</h1>
            )}
            {trailingLabel && (
              <>
                <span className="text-[15px] font-medium tracking-tight text-muted-foreground">/</span>
                <h1 className="text-[15px] font-medium tracking-tight truncate">{trailingLabel}</h1>
              </>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <SidebarTrigger className="invisible pointer-events-none" />
        </div>
      </div>
    </header>
  );
}

export function ClientSidebarShell({ children, casesNeedingResponse = 0, email, displayName, avatarUrl }: {
  children: React.ReactNode;
  casesNeedingResponse?: number;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  // iOS Safari tints its top/bottom toolbars (and the overscroll rubber-band)
  // from <html>'s background, not <meta theme-color>. The dashboard is
  // uniformly dark, so pin <html>'s background to the dashboard's dark token
  // — see .dashboard-dark in globals.css. Removed on unmount so leaving
  // /dashboard doesn't leave the dark background on other routes.
  useEffect(() => {
    document.documentElement.classList.add("dashboard-dark");
    return () => {
      document.documentElement.classList.remove("dashboard-dark");
    };
  }, []);

  return (
    <SidebarProvider
      className="bg-sidebar text-foreground min-h-svh"
      style={{ "--sidebar-width": "16rem" } as React.CSSProperties}
    >
      {/* Desktop-only: Sidebar renders a Sheet drawer on mobile by default
          (see components/ui/sidebar.tsx), which the fixed bottom dock below
          replaces entirely on this dashboard — so it's wrapped hidden md:contents
          rather than letting it mount its own mobile fallback. */}
      <div className="hidden md:contents">
        <AppSidebar casesNeedingResponse={casesNeedingResponse} email={email} displayName={displayName} avatarUrl={avatarUrl} />
      </div>
      <MobileNavDock casesNeedingResponse={casesNeedingResponse} />
      <SidebarInset>
        <PageCrumbProvider>
          <SiteHeader />
          <main className="flex flex-1 flex-col gap-6 p-4 pb-24 md:pb-4 lg:p-6">
            {children}
          </main>
        </PageCrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
