import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

export const getClientLayoutData = cache(async (id: string) => {
  const admin = createAdminClient();

  const [{ data: clientRow }, { data: { user: authUser } }, { count: unreadCount }, { data: profileRow }] = await Promise.all([
    admin.from("clients").select("id, email, name, company, notes").eq("id", id).single(),
    admin.auth.admin.getUserById(id),
    admin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("client_id", id)
      .eq("sender", "client")
      .is("read_at", null),
    admin.from("profiles").select("avatar_url").eq("id", id).single(),
  ]);

  if (!clientRow && !authUser) return null;

  const isBanned = !!authUser?.banned_until && new Date(authUser.banned_until) > new Date();

  const client = {
    ...(clientRow ?? {
      id: authUser!.id,
      email: authUser!.email ?? "",
      name: (authUser!.user_metadata?.name as string | null) ?? null,
      company: null,
      notes: null,
    }),
    banned: isBanned,
    last_sign_in_at: authUser?.last_sign_in_at ?? null,
    confirmed_at: authUser?.confirmed_at ?? null,
  };

  const label = client.company ?? client.name ?? client.email;

  return {
    client,
    label,
    avatarUrl: (profileRow?.avatar_url as string | null) ?? null,
    unreadCount: unreadCount ?? 0,
  };
});

export const getClientProjectsData = cache(async (id: string) => {
  const admin = createAdminClient();
  const [{ data: projects }, { data: projectUpdates }] = await Promise.all([
    admin.from("projects").select("id, title, status, phase, last_update, notes, created_at, start_date, target_date").eq("client_id", id).order("created_at", { ascending: false }),
    admin.from("project_updates").select("id, project_id, status, note, created_at").eq("client_id", id).order("created_at", { ascending: false }),
  ]);
  return { projects: projects ?? [], projectUpdates: projectUpdates ?? [] };
});

export const getClientInvoicesData = cache(async (id: string) => {
  const admin = createAdminClient();
  const { data: invoices } = await admin
    .from("invoices")
    .select("id, label, amount, status, due_date, paid_at, payment_url, created_at")
    .eq("client_id", id)
    .order("created_at", { ascending: false });
  return invoices ?? [];
});

export const getClientFilesData = cache(async (id: string) => {
  const admin = createAdminClient();
  const { data: files } = await admin
    .from("files")
    .select("id, label, url, uploaded_at")
    .eq("client_id", id)
    .order("uploaded_at", { ascending: false });
  return files ?? [];
});

export const getClientMessagesData = cache(async (id: string) => {
  const admin = createAdminClient();
  const [{ data: messages }, { data: cases }, { data: clientRow }, { data: profileRow }] = await Promise.all([
    admin.from("messages").select("id, client_id, case_id, sender, body, read_at, created_at").eq("client_id", id).order("created_at", { ascending: true }),
    admin.from("cases").select("id, client_id, case_number, title, status, severity, created_at, updated_at, human_requested").eq("client_id", id).order("updated_at", { ascending: false }),
    admin.from("clients").select("email, name, company").eq("id", id).single(),
    admin.from("profiles").select("avatar_url").eq("id", id).single(),
  ]);
  const clientName = clientRow?.company ?? clientRow?.name ?? clientRow?.email ?? "Client";
  return {
    messages: messages ?? [],
    cases: cases ?? [],
    clientName,
    clientAvatarUrl: (profileRow?.avatar_url as string | null) ?? null,
  };
});

export const getClientHistoryData = cache(async (id: string) => {
  const admin = createAdminClient();
  const { data: adminLog } = await admin
    .from("admin_log")
    .select("id, action, detail, created_at")
    .eq("client_id", id)
    .order("created_at", { ascending: false })
    .limit(50);
  return adminLog ?? [];
});
