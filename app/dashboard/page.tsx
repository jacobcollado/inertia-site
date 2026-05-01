import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: client }, { data: projects }, { data: invoices }, { data: files }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", user.id).single(),
      supabase.from("projects").select("*").eq("client_id", user.id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").eq("client_id", user.id).order("created_at", { ascending: false }),
      supabase.from("files").select("*").eq("client_id", user.id).order("uploaded_at", { ascending: false }),
    ]);

  return (
    <DashboardShell
      client={client}
      projects={projects ?? []}
      invoices={invoices ?? []}
      files={files ?? []}
    />
  );
}
