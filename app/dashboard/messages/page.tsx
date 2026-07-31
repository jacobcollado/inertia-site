import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CasesView } from "./cases-view";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: cases }, { data: messages }] = await Promise.all([
    supabase
      .from("cases")
      .select("id, client_id, case_number, title, status, severity, created_at, updated_at, human_requested")
      .eq("client_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("messages")
      .select("id, client_id, case_id, sender, body, read_at, created_at")
      .eq("client_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  return <CasesView cases={cases ?? []} messages={messages ?? []} />;
}
