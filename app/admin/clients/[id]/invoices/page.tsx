import { createAdminClient } from "@/lib/supabase/admin";
import { InvoicesTab } from "../tabs/invoices-tab";

export const revalidate = 30;

export default async function ClientInvoicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: invoices } = await admin
    .from("invoices")
    .select("id, label, amount, status, due_date, paid_at, payment_url, created_at")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  return <InvoicesTab clientId={id} invoices={invoices ?? []} />;
}
