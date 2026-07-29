import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoicesView } from "./invoices-view";

export const revalidate = 30;

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, label, amount, status, due_date, paid_at, payment_url")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  return <InvoicesView invoices={invoices ?? []} clientEmail={user.email ?? ""} />;
}
