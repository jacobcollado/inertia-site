import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OverviewView } from "./overview-view";

export const revalidate = 30;

export default async function DashboardOverviewPage() {
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
        .select("id, title, status, phase, last_update, notes, start_date, target_date")
        .eq("client_id", id).order("created_at", { ascending: false }),
      supabase.from("invoices")
        .select("id, label, amount, status, due_date, paid_at, payment_url")
        .eq("client_id", id).order("created_at", { ascending: false }),
      supabase.from("files")
        .select("id, label, url, uploaded_at")
        .eq("client_id", id).order("uploaded_at", { ascending: false }),
      supabase.from("messages")
        .select("id, client_id, case_id, sender, body, read_at, created_at")
        .eq("client_id", id).order("created_at", { ascending: true }),
      supabase.from("project_updates")
        .select("id, project_id, status, note, created_at")
        .eq("client_id", id).order("created_at", { ascending: false }),
    ]);

  return (
    <OverviewView
      client={client}
      clientEmail={client?.email ?? user.email ?? ""}
      projects={projects ?? []}
      invoices={invoices ?? []}
      files={files ?? []}
      messages={messages ?? []}
      projectUpdates={projectUpdates ?? []}
    />
  );
}
