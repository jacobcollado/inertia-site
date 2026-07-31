import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CaseThreadView } from "./case-thread-view";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: caseRow }, { data: messages }, { data: client }, { data: profile }] = await Promise.all([
    supabase
      .from("cases")
      .select("id, client_id, case_number, title, status, severity, created_at, updated_at, human_requested")
      .eq("client_id", user.id)
      .eq("id", id)
      .single(),
    supabase
      .from("messages")
      .select("id, client_id, case_id, sender, body, read_at, created_at, suggest_close, suggest_human")
      .eq("client_id", user.id)
      .eq("case_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("clients").select("name, company, ai_barred_until").eq("id", user.id).single(),
    supabase.from("profiles").select("avatar_url").eq("id", user.id).single(),
  ]);

  if (!caseRow) notFound();

  const displayName = client?.company ?? client?.name ?? user.email ?? "You";

  return (
    <CaseThreadView
      clientId={user.id}
      caseData={caseRow}
      messages={messages ?? []}
      clientName={displayName}
      clientAvatarUrl={(profile?.avatar_url as string | null) ?? null}
      aiBarredUntil={(client?.ai_barred_until as string | null) ?? null}
    />
  );
}
