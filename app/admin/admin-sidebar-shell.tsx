"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  UsersIcon,
  WrenchIcon,
  ScrollTextIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/app/theme-toggle";
import { NavUser } from "./nav-user";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/admin/clients", label: "Clients", icon: UsersIcon },
  { href: "/admin/tools", label: "Tools", icon: WrenchIcon },
  { href: "/admin/logs", label: "Logs", icon: ScrollTextIcon },
];

function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[slot=sidebar-menu-button]:!p-1.5" render={<Link href="/admin" />}>
              <img src="/logo.png" alt="Inertia" className="h-5 w-auto" style={{ display: "block" }} />
              <Badge variant="outline" size="sm" className="ml-1 border-transparent bg-foreground text-background">Admin</Badge>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      tooltip={label}
                      isActive={active}
                      render={<Link href={href} />}
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
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
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
  "/admin": "Overview",
  "/admin/clients": "Clients",
  "/admin/tools": "Tools",
  "/admin/logs": "API Logs",
};

function SiteHeader() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Admin";
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border md:rounded-t-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 self-auto" />
        <h1 className="text-[15px] font-medium tracking-tight">{title}</h1>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function AdminSidebarShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="bg-sidebar">
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
