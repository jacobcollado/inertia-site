import { redirect, notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ClientDetailShell } from "./client-detail-shell";

export const revalidate = 30;

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const [{ data: clientRow }, { data: projects }, { data: invoices }, { data: files }, { data: { user: authUser } }, { data: messages }, { data: adminLog }, { data: projectUpdates }] =
    await Promise.all([
      admin.from("clients").select("id, email, name, company").eq("id", id).single(),
      admin.from("projects").select("id, title, status, phase, last_update, notes, created_at, start_date, target_date").eq("client_id", id).order("created_at", { ascending: false }),
      admin.from("invoices").select("id, label, amount, status, due_date, paid_at, payment_url, created_at").eq("client_id", id).order("created_at", { ascending: false }),
      admin.from("files").select("id, label, url, uploaded_at").eq("client_id", id).order("uploaded_at", { ascending: false }),
      admin.auth.admin.getUserById(id),
      admin.from("messages").select("id, client_id, sender, body, read_at, created_at").eq("client_id", id).order("created_at", { ascending: true }),
      admin.from("admin_log").select("id, action, detail, created_at").eq("client_id", id).order("created_at", { ascending: false }).limit(50),
      admin.from("project_updates").select("id, project_id, status, note, created_at").eq("client_id", id).order("created_at", { ascending: false }),
    ]);

  if (!clientRow && !authUser) notFound();

  const isBanned = !!authUser?.banned_until && new Date(authUser.banned_until) > new Date();

  const client = {
    ...(clientRow ?? {
      id: authUser!.id,
      email: authUser!.email ?? "",
      name: (authUser!.user_metadata?.name as string | null) ?? null,
      company: null,
    }),
    banned: isBanned,
    last_sign_in_at: authUser?.last_sign_in_at ?? null,
    confirmed_at: authUser?.confirmed_at ?? null,
  };

  return (
    <ClientDetailShell
      client={client}
      projects={projects ?? []}
      invoices={invoices ?? []}
      files={files ?? []}
      messages={messages ?? []}
      adminLog={adminLog ?? []}
      projectUpdates={projectUpdates ?? []}
    />
  );
}
