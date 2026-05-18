import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "./admin-shell";

export const revalidate = 60; // re-fetch at most every 60s

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const [
    { data: { users: authUsers } },
    { data: clientRows },
    { data: profileRows },
    { data: invoiceRows },
    { data: projectRows },
  ] = await Promise.all([
    admin.auth.admin.listUsers(),
    admin.from("clients").select("*, projects(id, status)"),
    admin.from("profiles").select("id, role"),
    admin.from("invoices").select("id, client_id, label, amount, status, due_date"),
    admin.from("projects").select("id, client_id, title, status, created_at"),
  ]);

  const clientMap = new Map((clientRows ?? []).map((c: Record<string, unknown>) => [c.id, c]));
  const profileMap = new Map((profileRows ?? []).map((p: { id: string; role: string }) => [p.id, p.role]));

  const clients = (authUsers ?? [])
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
        projects: (row?.projects as { id: string; status: string }[]) ?? [],
        in_clients_table: !!row,
        banned: !!u.banned_until && new Date(u.banned_until) > new Date(),
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
    if (prev === 0 && curr === 0) return null;
    if (prev === 0) return null;
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

  const overview = {
    totalRevenue,
    outstanding,
    activeProjects,
    totalClients: clients.length,
    recentActivity,
    change,
  };

  return <AdminShell clients={clients} overview={overview} />;
}
