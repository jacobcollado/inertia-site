"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  UsersIcon,
  ScrollTextIcon,
  FolderIcon,
  FolderKanbanIcon,
  ReceiptIcon,
  FileIcon,
  MessageCircleIcon,
  UserIcon,
  HistoryIcon,
  MenuIcon,
  SearchIcon,
  SparklesIcon,
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
} from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AdminThemeToggle } from "./admin-theme-toggle";
import { NavUser } from "./nav-user";
import { cn } from "@/lib/utils";
import { AdminClientNavProvider, useAdminClientNavValue } from "./admin-client-nav-context";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/admin/clients", label: "Clients", icon: UsersIcon },
  { href: "/admin/usage", label: "Usage", icon: SparklesIcon },
  { href: "/admin/logs", label: "Logs", icon: ScrollTextIcon },
];

const DOCUMENTS_NAV_ITEMS = [
  { href: "/admin/documents", label: "Documents", icon: FolderIcon },
];

const CLIENT_TAB_ITEMS = [
  { slug: "projects", label: "Projects", icon: FolderKanbanIcon },
  { slug: "invoices", label: "Invoices", icon: ReceiptIcon },
  { slug: "files", label: "Files", icon: FileIcon },
  { slug: "messages", label: "Messages", icon: MessageCircleIcon },
  { slug: "account", label: "Account", icon: UserIcon },
  { slug: "history", label: "History", icon: HistoryIcon },
];

// Renders directly beneath the "Clients" item in the same SidebarMenu (not
// as a separate group) so it reads as a submenu of Clients rather than an
// unrelated sidebar section — only shown while a client detail page has
// published itself via useSetAdminClientNav.
//
// The connecting spine is a single border on the wrapping li, not one per
// row: a border-l on each SidebarMenuItem individually breaks at every gap
// between rows (mb-0.5 etc.), reading as a dashed line instead of one
// continuous one. Wrapping everything in one li with the border means the
// line runs unbroken behind the rows, and each row's own left padding
// (instead of a margin) is what creates the indent from it.
function ClientSubItems({ pathname }: { pathname: string }) {
  const clientNav = useAdminClientNavValue();
  if (!clientNav) return null;

  const base = `/admin/clients/${clientNav.id}`;
  return (
    <SidebarMenuItem className="mb-1">
      <div className="ml-4 flex flex-col gap-0.5 border-l border-sidebar-border pl-1.5">
        {CLIENT_TAB_ITEMS.map(({ slug, label, icon: Icon }) => {
          const href = `${base}/${slug}`;
          const active = pathname === href;
          return (
            <SidebarMenuButton
              key={slug}
              tooltip={label}
              isActive={active}
              render={<Link href={href} />}
              className={cn(
                "h-8 text-[13px] [&_svg]:size-3.5",
                active
                  ? "bg-sidebar-accent font-semibold text-sidebar-foreground hover:bg-sidebar-accent"
                  : "hover:bg-sidebar-accent"
              )}
            >
              <Icon />
              <span className="truncate">{label}</span>
              {slug === "messages" && clientNav.unreadCount > 0 && (
                <Badge variant="default" size="sm" className="ml-auto">{clientNav.unreadCount}</Badge>
              )}
            </SidebarMenuButton>
          );
        })}
      </div>
    </SidebarMenuItem>
  );
}

function NavItems({ items, pathname }: { items: typeof NAV_ITEMS; pathname: string }) {
  const clientNav = useAdminClientNavValue();
  return (
    <SidebarMenu>
      {items.map(({ href, label, icon: Icon }, i) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        const showsSubItems = href === "/admin/clients" && !!clientNav;
        const isLast = i === items.length - 1;
        return (
          <Fragment key={href}>
            {/* SidebarMenu has gap-0, so two adjacent filled active/hover
                backgrounds (this item touching the next one, or the first
                sub-item beneath it) would otherwise merge into one block.
                Every item but the last gets the same spacing, regardless of
                whether it happens to have sub-items. */}
            <SidebarMenuItem className={!isLast || showsSubItems ? "mb-1" : undefined}>
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
            {showsSubItems && <ClientSubItems pathname={pathname} />}
          </Fragment>
        );
      })}
    </SidebarMenu>
  );
}

function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[slot=sidebar-menu-button]:!p-1.5" render={<Link href="/admin" />}>
              <img src="/logo.png" alt="Inertia" className="h-5 w-auto admin-dark:invert" style={{ display: "block" }} />
              <Badge variant="outline" size="sm" className="ml-1 border-transparent bg-foreground text-background">Admin</Badge>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <NavItems items={NAV_ITEMS} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Documents</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavItems items={DOCUMENTS_NAV_ITEMS} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

// Flattened top-level items for the mobile nav dock's menu/search, same as
// the client dashboard's ALL_NAV_ITEMS — Documents included since it has no
// separate sidebar group on mobile.
const ALL_TOP_NAV_ITEMS = [...NAV_ITEMS, ...DOCUMENTS_NAV_ITEMS];

// Replaces the sidebar entirely on mobile: a fixed pill at the bottom of the
// screen (search + menu triggers), each opening a Dialog instead of a
// side-sliding Sheet — mirrors the client dashboard's own MobileNavDock
// (client-sidebar-shell.tsx). Independent of SidebarContext; never mounts on
// desktop, where the real offcanvas Sidebar still handles things.
function MobileNavDock() {
  const pathname = usePathname();
  const clientNav = useAdminClientNavValue();
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const clientItems = useMemo(() => {
    if (!clientNav) return [];
    const base = `/admin/clients/${clientNav.id}`;
    return CLIENT_TAB_ITEMS.map(t => ({ href: `${base}/${t.slug}`, label: t.label, icon: t.icon }));
  }, [clientNav]);

  const allItems = useMemo(() => [...ALL_TOP_NAV_ITEMS, ...clientItems], [clientItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(item => item.label.toLowerCase().includes(q));
  }, [allItems, query]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const renderRow = (item: { href: string; label: string; icon: typeof LayoutDashboardIcon }, onNavigate: () => void) => {
    // Client sub-nav rows (/admin/clients/[id]/...) only match their exact
    // tab, not by prefix — otherwise every tab would show active at once.
    const isClientSubItem = item.href.startsWith("/admin/clients/");
    const active = item.href === "/admin"
      ? pathname === "/admin"
      : isClientSubItem
        ? pathname === item.href
        : pathname.startsWith(item.href);
    const Icon = item.icon;
    const badge = item.label === "Messages" && clientNav && item.href.endsWith("/messages") ? clientNav.unreadCount : undefined;
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
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-accent px-1.5 text-[11px] tabular-nums text-muted-foreground">
            {badge > 9 ? "9+" : badge}
          </span>
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
              {ALL_TOP_NAV_ITEMS.map(item => renderRow(item, () => setNavOpen(false)))}
            </div>
            {clientItems.length > 0 && (
              <div className="flex flex-col gap-0.5">
                <p className="px-3 pb-1 text-[11px] font-medium text-muted-foreground truncate">{clientNav!.label}</p>
                {clientItems.map(item => renderRow(item, () => setNavOpen(false)))}
              </div>
            )}
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
            onChange={e => setQuery(e.target.value)}
            placeholder="Search sections..."
            autoFocus
            className="w-full rounded-md border bg-background px-3 py-2 text-sm tracking-tight placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground/40 transition-colors"
            style={{ fontSize: 16 }}
          />
          <nav className="flex flex-col gap-0.5">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">No matches.</p>
            ) : (
              filtered.map(item => renderRow(item, closeSearch))
            )}
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
}

const TITLES: Record<string, string> = {
  "/admin": "Overview",
  "/admin/clients": "Clients",
  "/admin/usage": "Usage",
  "/admin/documents": "Documents",
  "/admin/logs": "API Logs",
};

// Same shape as the client dashboard's own SiteHeader (client-sidebar-shell.tsx):
// a centered "Section / trailing" breadcrumb, with the section root as a Link
// back to that section, rather than a left-aligned static page title.
function SiteHeader() {
  const pathname = usePathname();
  const clientNav = useAdminClientNavValue();

  const inClientDetail = clientNav && pathname.startsWith(`/admin/clients/${clientNav.id}`);
  const title = inClientDetail ? "Clients" : (TITLES[pathname] ?? "Admin");
  const titleHref = inClientDetail ? "/admin/clients" : undefined;
  const trailingLabel = inClientDetail
    ? CLIENT_TAB_ITEMS.find(t => pathname.endsWith(`/${t.slug}`))?.label ?? clientNav.label
    : null;
  // Client name shown as a second trailing segment when viewing a specific
  // tab, so the crumb reads "Clients / Acme Co. / Invoices" rather than just
  // "Clients / Invoices" — the tab alone doesn't say whose data this is.
  const clientLabel = inClientDetail && trailingLabel !== clientNav.label ? clientNav.label : null;

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border md:rounded-t-xl">
      <div className="relative flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 hidden md:flex" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 lg:px-6">
          <div className="flex items-center justify-center gap-1.5 min-w-0">
            {titleHref ? (
              <Link href={titleHref} className="pointer-events-auto text-[15px] font-medium tracking-tight text-muted-foreground hover:text-foreground transition-colors shrink-0">
                {title}
              </Link>
            ) : (
              <h1 className="text-[15px] font-medium tracking-tight shrink-0">{title}</h1>
            )}
            {clientLabel && (
              <>
                <span className="text-[15px] font-medium tracking-tight text-muted-foreground shrink-0">/</span>
                <h1 className="text-[15px] font-medium tracking-tight truncate">{clientLabel}</h1>
              </>
            )}
            {trailingLabel && (
              <>
                <span className="text-[15px] font-medium tracking-tight text-muted-foreground shrink-0">/</span>
                <h1 className="text-[15px] font-medium tracking-tight truncate">{trailingLabel}</h1>
              </>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <AdminThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function AdminSidebarShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminClientNavProvider>
      <SidebarProvider
        className="bg-sidebar text-foreground min-h-svh"
        style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
      >
        {/* Desktop-only: Sidebar renders a Sheet drawer on mobile by default,
            which MobileNavDock replaces entirely on this dashboard — so it's
            wrapped hidden md:contents rather than letting it mount its own
            mobile fallback. Same pattern as the client dashboard shell. */}
        <div className="hidden md:contents">
          <AppSidebar />
        </div>
        <MobileNavDock />
        <SidebarInset>
          <SiteHeader />
          <main className="flex flex-1 flex-col gap-6 p-4 pb-24 md:pb-4 lg:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminClientNavProvider>
  );
}
