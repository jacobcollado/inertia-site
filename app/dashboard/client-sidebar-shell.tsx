"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  FolderIcon,
  ReceiptIcon,
  FileIcon,
  MessageSquareIcon,
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
import { ThemeToggle } from "@/app/theme-toggle";
import { NavUser } from "./nav-user";
import { cn } from "@/lib/utils";

const OVERVIEW_NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
];

const WORKSPACE_NAV_ITEMS = [
  { href: "/dashboard/projects", label: "Projects", icon: FolderIcon },
  { href: "/dashboard/invoices", label: "Invoices", icon: ReceiptIcon },
  { href: "/dashboard/files", label: "Files", icon: FileIcon },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquareIcon },
  { href: "/dashboard/licenses", label: "Licenses", icon: KeyRoundIcon },
];

const SETTINGS_NAV_ITEMS = [
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

function NavItems({ items, pathname, unreadMessages }: { items: typeof WORKSPACE_NAV_ITEMS; pathname: string; unreadMessages?: number }) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
        const badge = label === "Messages" ? unreadMessages : undefined;
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
            </SidebarMenuButton>
            {!!badge && badge > 0 && <SidebarMenuBadge>{badge > 9 ? "9+" : badge}</SidebarMenuBadge>}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function AppSidebar({ unreadMessages }: { unreadMessages: number }) {
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
            <NavItems items={WORKSPACE_NAV_ITEMS} pathname={pathname} unreadMessages={unreadMessages} />
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
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/projects": "Projects",
  "/dashboard/invoices": "Invoices",
  "/dashboard/files": "Files",
  "/dashboard/messages": "Messages",
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
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-medium tracking-tight">{title}</h1>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/" className="text-[13px] tracking-tight text-muted-foreground opacity-60 hover:opacity-100 transition-opacity">
            ← Site
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function ClientSidebarShell({ children, unreadMessages = 0 }: { children: React.ReactNode; unreadMessages?: number }) {
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
      <AppSidebar unreadMessages={unreadMessages} />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
