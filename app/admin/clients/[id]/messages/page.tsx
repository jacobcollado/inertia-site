import { createAdminClient } from "@/lib/supabase/admin";
import { MessagesTabWrapper } from "./messages-tab-wrapper";

export const revalidate = 30;

export default async function ClientMessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: messages }, { data: cases }, { data: clientRow }, { data: profileRow }] = await Promise.all([
    admin.from("messages").select("id, client_id, case_id, sender, body, read_at, created_at").eq("client_id", id).order("created_at", { ascending: true }),
    admin.from("cases").select("id, client_id, case_number, title, status, severity, created_at, updated_at, human_requested").eq("client_id", id).order("updated_at", { ascending: false }),
    admin.from("clients").select("email, name, company").eq("id", id).single(),
    admin.from("profiles").select("avatar_url").eq("id", id).single(),
  ]);

  const clientName = clientRow?.company ?? clientRow?.name ?? clientRow?.email ?? "Client";

  return (
    <MessagesTabWrapper
      clientId={id}
      messages={messages ?? []}
      cases={cases ?? []}
      clientName={clientName}
      clientAvatarUrl={(profileRow?.avatar_url as string | null) ?? null}
    />
  );
}
