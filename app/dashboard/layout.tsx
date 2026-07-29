import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientSidebarShell } from "./client-sidebar-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("client_id", user.id)
    .eq("sender", "admin")
    .is("read_at", null);

  return <ClientSidebarShell unreadMessages={count ?? 0}>{children}</ClientSidebarShell>;
}
