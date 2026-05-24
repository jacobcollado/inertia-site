import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "./dashboard-shell";

export const revalidate = 30; // re-fetch at most every 30s

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = user.id;

  const [{ data: client }, { data: projects }, { data: invoices }, { data: files }, { data: messages }, { data: projectUpdates }] =
    await Promise.all([
      supabase.from("clients")
        .select("id, email, name, company")
        .eq("id", id).single(),
      supabase.from("projects")
        .select("id, title, status, phase, last_update, notes, created_at")
        .eq("client_id", id).order("created_at", { ascending: false }),
      supabase.from("invoices")
        .select("id, label, amount, status, due_date")
        .eq("client_id", id).order("created_at", { ascending: false }),
      supabase.from("files")
        .select("id, label, url, uploaded_at")
        .eq("client_id", id).order("uploaded_at", { ascending: false }),
      supabase.from("messages")
        .select("id, client_id, sender, body, read_at, created_at")
        .eq("client_id", id).order("created_at", { ascending: true }),
      supabase.from("project_updates")
        .select("id, project_id, status, note, created_at")
        .eq("client_id", id).order("created_at", { ascending: false }),
    ]);

  // Fetch optional columns added in migration 003 separately so a missing
  // column doesn't break the whole query before the migration is applied.
  const [{ data: projectDates }, { data: invoicePayment }] = await Promise.all([
    supabase.from("projects")
      .select("id, start_date, target_date")
      .eq("client_id", id),
    supabase.from("invoices")
      .select("id, payment_url")
      .eq("client_id", id),
  ]);

  const projectDateMap = Object.fromEntries((projectDates ?? []).map(p => [p.id, { start_date: p.start_date ?? null, target_date: p.target_date ?? null }]));
  const invoicePaymentMap = Object.fromEntries((invoicePayment ?? []).map(i => [i.id, { payment_url: i.payment_url ?? null }]));

  const enrichedProjects = (projects ?? []).map(p => ({ ...p, ...( projectDateMap[p.id] ?? { start_date: null, target_date: null }) }));
  const enrichedInvoices = (invoices ?? []).map(i => ({ ...i, ...( invoicePaymentMap[i.id] ?? { payment_url: null }) }));

  return (
    <DashboardShell
      client={client}
      projects={enrichedProjects}
      invoices={enrichedInvoices}
      files={files ?? []}
      messages={messages ?? []}
      projectUpdates={projectUpdates ?? []}
    />
  );
}
