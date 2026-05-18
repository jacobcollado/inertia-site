import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "./dashboard-shell";

export const revalidate = 30; // re-fetch at most every 30s

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = user.id;

  const [{ data: client }, { data: projects }, { data: invoices }, { data: files }, { data: messages }] =
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
    ]);

  return (
    <DashboardShell
      client={client}
      projects={projects ?? []}
      invoices={invoices ?? []}
      files={files ?? []}
      messages={messages ?? []}
    />
  );
}
