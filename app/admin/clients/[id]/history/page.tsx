import { createAdminClient } from "@/lib/supabase/admin";
import { HistoryTab } from "../tabs/history-tab";

export const revalidate = 30;

export default async function ClientHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: adminLog } = await admin
    .from("admin_log")
    .select("id, action, detail, created_at")
    .eq("client_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  return <HistoryTab clientId={id} initial={adminLog ?? []} />;
}
