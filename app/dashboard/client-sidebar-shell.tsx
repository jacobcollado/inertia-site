"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  FolderIcon,
  LayersIcon,
  FileIcon,
  LifeBuoyIcon,
  KeyRoundIcon,
  SettingsIcon,
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { cn } from "@/lib/utils";

const OVERVIEW_NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
];

const WORKSPACE_NAV_ITEMS = [
  { href: "/dashboard/projects", label: "Projects", icon: FolderIcon },
  { href: "/dashboard/messages", label: "Support", icon: LifeBuoyIcon },
  { href: "/dashboard/licenses", label: "Licenses", icon: KeyRoundIcon },
];

const SETTINGS_NAV_ITEMS = [
  { href: "/dashboard/invoices", label: "Invoices", icon: LayersIcon },
  { href: "/dashboard/files", label: "Files", icon: FileIcon },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

function NavItems({ items, pathname, unreadMessages, needsResponse }: { items: typeof WORKSPACE_NAV_ITEMS; pathname: string; unreadMessages?: number; needsResponse?: boolean }) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
        const badge = label === "Support" ? unreadMessages : undefined;
        const showDot = label === "Support" && needsResponse && !badge;
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
              <span>{label}</span>
              {showDot && <span className="ml-auto size-1.5 rounded-full bg-amber-500 shrink-0" />}
            </SidebarMenuButton>
            {!!badge && badge > 0 && <SidebarMenuBadge>{badge > 9 ? "9+" : badge}</SidebarMenuBadge>}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function AppSidebar({ unreadMessages, needsResponse, email, displayName, avatarUrl }: { unreadMessages: number; needsResponse?: boolean; email: string; displayName: string; avatarUrl: string | null }) {
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
            <NavItems items={WORKSPACE_NAV_ITEMS} pathname={pathname} unreadMessages={unreadMessages} needsResponse={needsResponse} />
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

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/projects": "Projects",
  "/dashboard/invoices": "Invoices",
  "/dashboard/files": "Files",
  "/dashboard/messages": "Support",
  "/dashboard/licenses": "Licenses",
  "/dashboard/settings": "Settings",
};

function SiteHeader() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Dashboard";
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border md:rounded-t-xl">
      <div className="relative flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 lg:px-6">
          <div className="w-full lg:max-w-[58%] flex justify-center">
            <h1 className="text-[15px] font-medium tracking-tight">{title}</h1>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <SidebarTrigger className="invisible pointer-events-none" />
        </div>
      </div>
    </header>
  );
}

export function ClientSidebarShell({ children, unreadMessages = 0, needsResponse = false, email, displayName, avatarUrl }: {
  children: React.ReactNode;
  unreadMessages?: number;
  needsResponse?: boolean;
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
      <AppSidebar unreadMessages={unreadMessages} needsResponse={needsResponse} email={email} displayName={displayName} avatarUrl={avatarUrl} />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
