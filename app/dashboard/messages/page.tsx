import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CasesView } from "./cases-view";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: cases } = await supabase
    .from("cases")
    .select("id, client_id, case_number, title, status, severity, created_at, updated_at")
    .eq("client_id", user.id)
    .order("updated_at", { ascending: false });

  return <CasesView cases={cases ?? []} />;
}
