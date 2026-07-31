import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type Project = { id: string; status: string };
export type Client = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  avatar_url: string | null;
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
    admin.from("profiles").select("id, role, avatar_url"),
  ]);

  const clientMap = new Map((clientRows ?? []).map((c: Record<string, unknown>) => [c.id, c]));
  const profileMap = new Map((profileRows ?? []).map((p: { id: string; role: string; avatar_url: string | null }) => [p.id, p]));

  return (authUsers ?? [])
    .filter(u => profileMap.get(u.id)?.role !== "admin")
    .map(u => {
      const row = clientMap.get(u.id) as Record<string, unknown> | undefined;
      const metaName = (u.user_metadata?.name as string | null) ?? null;
      return {
        id: u.id,
        email: u.email ?? "",
        name: (row?.name as string | null) ?? metaName,
        company: (row?.company as string | null) ?? null,
        avatar_url: profileMap.get(u.id)?.avatar_url ?? null,
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
  outstandingInvoices: { clientName: string; clientId: string; label: string; amount: number; dueDate: string; overdue: boolean }[];
  needsAttention: { clientName: string; clientId: string; reason: string }[];
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

  const outstandingInvoices = allInvoices
    .filter((inv: Record<string, unknown>) => inv.status !== "paid" && inv.status !== "draft")
    .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      new Date(a.due_date as string || 0).getTime() - new Date(b.due_date as string || 0).getTime()
    )
    .slice(0, 5)
    .map((inv: Record<string, unknown>) => ({
      clientName: (clientNameMap.get(inv.client_id as string) ?? "") as string,
      clientId: inv.client_id as string,
      label: inv.label as string,
      amount: inv.amount as number,
      dueDate: inv.due_date ? fmtDate(inv.due_date as string) : "",
      overdue: inv.due_date ? new Date(inv.due_date as string) < now : false,
    }));

  const needsAttention: { clientName: string; clientId: string; reason: string }[] = [];
  for (const c of clients) {
    if (c.banned) {
      needsAttention.push({ clientName: c.company ?? c.name ?? c.email, clientId: c.id, reason: "Suspended" });
      continue;
    }
    const stalled = c.projects.filter(p => p.status === "paused" || p.status === "on_hold");
    if (stalled.length > 0) {
      needsAttention.push({
        clientName: c.company ?? c.name ?? c.email,
        clientId: c.id,
        reason: stalled.length === 1 ? "1 project on hold" : `${stalled.length} projects on hold`,
      });
    }
  }

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
    outstandingInvoices,
    needsAttention: needsAttention.slice(0, 5),
  };
}

export type DocumentInvoice = {
  id: string;
  clientId: string;
  clientName: string;
  label: string;
  amount: number;
  status: string;
  dueDate: string | null;
};

export type DocumentFile = {
  id: string;
  clientId: string;
  clientName: string;
  label: string;
  url: string;
  uploadedAt: string;
};

export async function getDocuments(clients: Client[]): Promise<{ invoices: DocumentInvoice[]; files: DocumentFile[] }> {
  const admin = createAdminClient();

  const [{ data: invoiceRows }, { data: fileRows }] = await Promise.all([
    admin.from("invoices").select("id, client_id, label, amount, status, due_date"),
    admin.from("files").select("id, client_id, label, url, uploaded_at"),
  ]);

  const clientIdSet = new Set(clients.map(c => c.id));
  const clientNameMap = new Map(clients.map(c => [c.id, c.company ?? c.name ?? c.email]));

  const invoices = (invoiceRows ?? [])
    .filter((inv: Record<string, unknown>) => clientIdSet.has(inv.client_id as string))
    .map((inv: Record<string, unknown>) => ({
      id: inv.id as string,
      clientId: inv.client_id as string,
      clientName: clientNameMap.get(inv.client_id as string) ?? "",
      label: inv.label as string,
      amount: inv.amount as number,
      status: inv.status as string,
      dueDate: inv.due_date as string | null,
    }));

  const files = (fileRows ?? [])
    .filter((f: Record<string, unknown>) => clientIdSet.has(f.client_id as string))
    .map((f: Record<string, unknown>) => ({
      id: f.id as string,
      clientId: f.client_id as string,
      clientName: clientNameMap.get(f.client_id as string) ?? "",
      label: f.label as string,
      url: f.url as string,
      uploadedAt: f.uploaded_at as string,
    }));

  return { invoices, files };
}

export type AiUsageBucket = { date: string; sonnetCents: number; haikuCents: number; otherCents: number };
export type AiUsageGranularity = "hour" | "day" | "week";
export type AiUsage = {
  totalCostCents: number;
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  byModel: { model: string; label: string; costCents: number; calls: number }[];
  byFeature: { feature: string; costCents: number; calls: number }[];
  daily: AiUsageBucket[];
  isDemo: boolean;
};

const MODEL_LABELS: Record<string, string> = {
  "claude-sonnet-5": "Sonnet 5",
  "claude-haiku-4-5-20251001": "Haiku 4.5",
};

// Deterministic placeholder rows so the usage dashboard has something to show
// before real ai_usage rows accumulate. Seeded on the day index (not Math.random)
// so the chart looks the same on every render instead of reshuffling on refresh.
function demoAiUsageRows(days: number) {
  const features = ["client-auto-reply", "admin-quick-reply"];
  const rows: { model: string; feature: string; input_tokens: number; output_tokens: number; cost_cents: number; created_at: string }[] = [];
  const dayStart = (i: number) => Date.now() - i * 24 * 60 * 60 * 1000;
  for (let i = days - 1; i >= 0; i--) {
    const wave = Math.sin(i / 3.5) * 0.5 + 0.5;
    const sonnetCalls = Math.round(2 + wave * 6);
    const haikuCalls = Math.round(3 + (1 - wave) * 9);
    for (let c = 0; c < sonnetCalls; c++) {
      const inputTokens = 800 + Math.round(wave * 1400);
      const outputTokens = 200 + Math.round(wave * 500);
      const hourOffset = ((c * 7 + 1) % 24) * 60 * 60 * 1000;
      rows.push({
        model: "claude-sonnet-5",
        feature: features[c % features.length],
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_cents: (inputTokens / 1_000_000) * 2 * 100 + (outputTokens / 1_000_000) * 10 * 100,
        created_at: new Date(dayStart(i) + hourOffset).toISOString(),
      });
    }
    for (let c = 0; c < haikuCalls; c++) {
      const inputTokens = 500 + Math.round((1 - wave) * 900);
      const outputTokens = 150 + Math.round((1 - wave) * 350);
      const hourOffset = ((c * 5 + 3) % 24) * 60 * 60 * 1000;
      rows.push({
        model: "claude-haiku-4-5-20251001",
        feature: features[c % features.length],
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_cents: (inputTokens / 1_000_000) * 1 * 100 + (outputTokens / 1_000_000) * 5 * 100,
        created_at: new Date(dayStart(i) + hourOffset).toISOString(),
      });
    }
  }
  return rows;
}

export async function getAiUsage(days = 30, granularity: AiUsageGranularity = "day"): Promise<AiUsage> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: rows } = await admin
    .from("ai_usage")
    .select("model, feature, input_tokens, output_tokens, cost_cents, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  const isDemo = !rows || rows.length === 0;
  const usage = isDemo
    ? demoAiUsageRows(days)
    : (rows as { model: string; feature: string; input_tokens: number; output_tokens: number; cost_cents: number; created_at: string }[]);

  const totalCostCents = usage.reduce((s, r) => s + r.cost_cents, 0);
  const totalInputTokens = usage.reduce((s, r) => s + r.input_tokens, 0);
  const totalOutputTokens = usage.reduce((s, r) => s + r.output_tokens, 0);

  const modelTotals = new Map<string, { costCents: number; calls: number }>();
  for (const r of usage) {
    const cur = modelTotals.get(r.model) ?? { costCents: 0, calls: 0 };
    cur.costCents += r.cost_cents;
    cur.calls += 1;
    modelTotals.set(r.model, cur);
  }
  const byModel = Array.from(modelTotals.entries())
    .map(([model, v]) => ({ model, label: MODEL_LABELS[model] ?? model, ...v }))
    .sort((a, b) => b.costCents - a.costCents);

  const featureTotals = new Map<string, { costCents: number; calls: number }>();
  for (const r of usage) {
    const cur = featureTotals.get(r.feature) ?? { costCents: 0, calls: 0 };
    cur.costCents += r.cost_cents;
    cur.calls += 1;
    featureTotals.set(r.feature, cur);
  }
  const byFeature = Array.from(featureTotals.entries())
    .map(([feature, v]) => ({ feature, ...v }))
    .sort((a, b) => b.costCents - a.costCents);

  // Breakdown split by model bucket (sonnet / haiku / other) so the chart
  // can stack them — matches the two models actually in use today without
  // hardcoding a per-model series list that'd need updating for every
  // future model added to MODEL_LABELS.
  //
  // Bucket key/step depend on granularity: hourly buckets truncate to the
  // hour, daily to the day (existing behavior), weekly to the Monday that
  // starts each ISO week — so the same aggregation loop below works for all three.
  const MS_HOUR = 60 * 60 * 1000;
  const MS_DAY = 24 * MS_HOUR;
  const startOfWeek = (d: Date) => {
    const day = d.getUTCDay(); // 0 = Sunday
    const mondayOffset = (day + 6) % 7;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - mondayOffset);
    monday.setUTCHours(0, 0, 0, 0);
    return monday;
  };
  const bucketKey = (iso: string): string => {
    const d = new Date(iso);
    if (granularity === "hour") {
      d.setUTCMinutes(0, 0, 0);
      return d.toISOString();
    }
    if (granularity === "week") {
      return startOfWeek(d).toISOString();
    }
    return iso.slice(0, 10);
  };

  const dailyMap = new Map<string, AiUsageBucket>();
  if (granularity === "hour") {
    const hours = Math.min(days * 24, 48);
    for (let i = hours - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * MS_HOUR);
      d.setUTCMinutes(0, 0, 0);
      const key = d.toISOString();
      dailyMap.set(key, { date: key, sonnetCents: 0, haikuCents: 0, otherCents: 0 });
    }
  } else if (granularity === "week") {
    const weeks = Math.max(1, Math.ceil(days / 7));
    for (let i = weeks - 1; i >= 0; i--) {
      const key = startOfWeek(new Date(Date.now() - i * 7 * MS_DAY)).toISOString();
      dailyMap.set(key, { date: key, sonnetCents: 0, haikuCents: 0, otherCents: 0 });
    }
  } else {
    for (let i = days - 1; i >= 0; i--) {
      const key = new Date(Date.now() - i * MS_DAY).toISOString().slice(0, 10);
      dailyMap.set(key, { date: key, sonnetCents: 0, haikuCents: 0, otherCents: 0 });
    }
  }

  const bucketWindowStart = granularity === "hour" ? Date.now() - Math.min(days * 24, 48) * MS_HOUR : null;
  for (const r of usage) {
    if (bucketWindowStart !== null && new Date(r.created_at).getTime() < bucketWindowStart) continue;
    const key = bucketKey(r.created_at);
    const entry = dailyMap.get(key);
    if (!entry) continue;
    if (r.model === "claude-sonnet-5") entry.sonnetCents += r.cost_cents;
    else if (r.model === "claude-haiku-4-5-20251001") entry.haikuCents += r.cost_cents;
    else entry.otherCents += r.cost_cents;
  }

  return {
    totalCostCents,
    totalCalls: usage.length,
    totalInputTokens,
    totalOutputTokens,
    byModel,
    byFeature,
    daily: Array.from(dailyMap.values()),
    isDemo,
  };
}
