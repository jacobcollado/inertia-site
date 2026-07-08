import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type Project = { id: string; status: string };
export type Client = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed_at: string | null;
  projects: Project[];
  in_clients_table: boolean;
  banned: boolean;
};

export async function getClients(): Promise<Client[]> {
  const admin = createAdminClient();

  const [
    { data: { users: authUsers } },
    { data: clientRows },
    { data: profileRows },
  ] = await Promise.all([
    admin.auth.admin.listUsers(),
    admin.from("clients").select("*, projects(id, status)"),
    admin.from("profiles").select("id, role"),
  ]);

  const clientMap = new Map((clientRows ?? []).map((c: Record<string, unknown>) => [c.id, c]));
  const profileMap = new Map((profileRows ?? []).map((p: { id: string; role: string }) => [p.id, p.role]));

  return (authUsers ?? [])
    .filter(u => profileMap.get(u.id) !== "admin")
    .map(u => {
      const row = clientMap.get(u.id) as Record<string, unknown> | undefined;
      const metaName = (u.user_metadata?.name as string | null) ?? null;
      return {
        id: u.id,
        email: u.email ?? "",
        name: (row?.name as string | null) ?? metaName,
        company: (row?.company as string | null) ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        confirmed_at: u.confirmed_at ?? null,
        projects: (row?.projects as { id: string; status: string }[]) ?? [],
        in_clients_table: !!row,
        banned: !!u.banned_until && new Date(u.banned_until) > new Date(),
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export type Overview = {
  totalRevenue: number;
  outstanding: number;
  activeProjects: number;
  totalClients: number;
  recentActivity: { clientName: string; clientId: string; type: string; label: string; date: string }[];
  change: {
    revenue: number | null;
    outstanding: number | null;
    clients: number | null;
    activeProjects: number | null;
  };
  monthlyRevenue: { month: string; amount: number }[];
  monthlyClients: { month: string; amount: number }[];
  dailyClients: { date: string; amount: number }[];
};

export async function getOverview(clients: Client[]): Promise<Overview> {
  const admin = createAdminClient();

  const [{ data: invoiceRows }, { data: projectRows }] = await Promise.all([
    admin.from("invoices").select("id, client_id, label, amount, status, due_date"),
    admin.from("projects").select("id, client_id, title, status, created_at"),
  ]);

  const now = new Date();
  const ms30 = 30 * 24 * 60 * 60 * 1000;
  const cutCurrent = new Date(now.getTime() - ms30);
  const cutPrev    = new Date(now.getTime() - ms30 * 2);

  const clientIdSet = new Set(clients.map(c => c.id));
  const allInvoices = (invoiceRows ?? []).filter((inv: Record<string, unknown>) => clientIdSet.has(inv.client_id as string));
  const allProjects = (projectRows ?? []).filter((p: Record<string, unknown>) => clientIdSet.has(p.client_id as string));

  const paidInvoices = allInvoices.filter((inv: Record<string, unknown>) => inv.status === "paid");

  const totalRevenue = paidInvoices
    .reduce((sum: number, inv: Record<string, unknown>) => sum + (inv.amount as number), 0);

  const outstanding = allInvoices
    .filter((inv: Record<string, unknown>) => inv.status !== "paid" && inv.status !== "draft")
    .reduce((sum: number, inv: Record<string, unknown>) => sum + (inv.amount as number), 0);

  const activeProjects = allProjects.filter((p: Record<string, unknown>) => p.status === "active").length;

  const pctChange = (curr: number, prev: number): number | null => {
    if (prev === 0 && curr === 0) return null; // nothing in either period — not enough data
    if (prev === 0) return 100; // went from 0 to something — full growth, not "no data"
    return Math.round(((curr - prev) / prev) * 100);
  };

  const revCurrent = paidInvoices
    .filter((inv: Record<string, unknown>) => {
      const d = inv.due_date ? new Date(inv.due_date as string) : null;
      return d && d >= cutCurrent && d <= now;
    })
    .reduce((s: number, inv: Record<string, unknown>) => s + (inv.amount as number), 0);

  const revPrev = paidInvoices
    .filter((inv: Record<string, unknown>) => {
      const d = inv.due_date ? new Date(inv.due_date as string) : null;
      return d && d >= cutPrev && d < cutCurrent;
    })
    .reduce((s: number, inv: Record<string, unknown>) => s + (inv.amount as number), 0);

  const outCurrent = allInvoices
    .filter((inv: Record<string, unknown>) => {
      const d = inv.due_date ? new Date(inv.due_date as string) : null;
      return inv.status !== "paid" && inv.status !== "draft" && d && d >= cutCurrent && d <= now;
    })
    .reduce((s: number, inv: Record<string, unknown>) => s + (inv.amount as number), 0);

  const outPrev = allInvoices
    .filter((inv: Record<string, unknown>) => {
      const d = inv.due_date ? new Date(inv.due_date as string) : null;
      return inv.status !== "paid" && inv.status !== "draft" && d && d >= cutPrev && d < cutCurrent;
    })
    .reduce((s: number, inv: Record<string, unknown>) => s + (inv.amount as number), 0);

  const clientsCurrent = clients.filter(c => new Date(c.created_at) >= cutCurrent).length;
  const clientsPrev    = clients.filter(c => {
    const d = new Date(c.created_at);
    return d >= cutPrev && d < cutCurrent;
  }).length;

  const projCurrent = allProjects.filter((p: Record<string, unknown>) => {
    return p.status === "active" && new Date(p.created_at as string) >= cutCurrent;
  }).length;
  const projPrev = allProjects.filter((p: Record<string, unknown>) => {
    const d = new Date(p.created_at as string);
    return p.status === "active" && d >= cutPrev && d < cutCurrent;
  }).length;

  const change = {
    revenue:        pctChange(revCurrent, revPrev),
    outstanding:    pctChange(outCurrent, outPrev),
    clients:        pctChange(clientsCurrent, clientsPrev),
    activeProjects: pctChange(projCurrent, projPrev),
  };

  // Monthly revenue for the last 6 months
  const monthlyRevenue = (() => {
    const months: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const amount = paidInvoices
        .filter((inv: Record<string, unknown>) => {
          const pd = inv.due_date ? new Date(inv.due_date as string) : null;
          return pd && pd >= start && pd < end;
        })
        .reduce((s: number, inv: Record<string, unknown>) => s + (inv.amount as number), 0);
      months.push({ month: label, amount });
    }
    return months;
  })();

  // Monthly new-client counts for the last 6 months
  const monthlyClients = (() => {
    const months: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const count = clients.filter(c => {
        const cd = new Date(c.created_at);
        return cd >= start && cd < end;
      }).length;
      months.push({ month: label, amount: count });
    }
    return months;
  })();

  // Daily new-client counts for the last 90 days, so the client chart can
  // filter to 3 months / 30 days / 7 days without a new server round-trip.
  const dailyClients = (() => {
    const days: { date: string; amount: number }[] = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      const count = clients.filter(c => {
        const cd = new Date(c.created_at);
        return cd >= start && cd < end;
      }).length;
      days.push({ date: start.toISOString().slice(0, 10), amount: count });
    }
    return days;
  })();

  const clientNameMap = new Map(clients.map(c => [c.id, c.company ?? c.name ?? c.email]));

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const recentInvoices = [...allInvoices]
    .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      new Date(b.due_date as string || 0).getTime() - new Date(a.due_date as string || 0).getTime()
    )
    .slice(0, 3)
    .map((inv: Record<string, unknown>) => ({
      clientName: clientNameMap.get(inv.client_id as string) ?? "",
      clientId: inv.client_id as string,
      type: "invoice",
      label: inv.label as string,
      date: inv.due_date ? fmtDate(inv.due_date as string) : "",
    }));

  const recentProjects = [...allProjects]
    .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
    )
    .slice(0, 3)
    .map((p: Record<string, unknown>) => ({
      clientName: clientNameMap.get(p.client_id as string) ?? "",
      clientId: p.client_id as string,
      type: "project",
      label: p.title as string,
      date: fmtDate(p.created_at as string),
    }));

  const recentActivity = [...recentInvoices, ...recentProjects]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);

  return {
    totalRevenue,
    outstanding,
    activeProjects,
    totalClients: clients.length,
    recentActivity,
    change,
    monthlyRevenue,
    monthlyClients,
    dailyClients,
  };
}
