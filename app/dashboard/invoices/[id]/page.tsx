import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceDetailView } from "./invoice-detail-view";

export const revalidate = 30;

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: invoice }, { data: client }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, label, amount, status, due_date, paid_at, payment_url")
      .eq("client_id", user.id)
      .eq("id", id)
      .single(),
    supabase.from("clients").select("email").eq("id", user.id).single(),
  ]);

  if (!invoice) notFound();

  return (
    <InvoiceDetailView
      invoice={invoice}
      clientEmail={client?.email ?? user.email ?? ""}
    />
  );
}
