import { redirect, notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ClientDetailShell } from "./client-detail-shell";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const [{ data: clientRow }, { data: projects }, { data: invoices }, { data: files }, { data: { user: authUser } }] =
    await Promise.all([
      admin.from("clients").select("*").eq("id", id).single(),
      admin.from("projects").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      admin.from("invoices").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      admin.from("files").select("*").eq("client_id", id).order("uploaded_at", { ascending: false }),
      admin.auth.admin.getUserById(id),
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
  };

  return (
    <ClientDetailShell
      client={client}
      projects={projects ?? []}
      invoices={invoices ?? []}
      files={files ?? []}
    />
  );
}
