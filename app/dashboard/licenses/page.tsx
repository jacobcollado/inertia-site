import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LicensesView } from "./licenses-view";

export const revalidate = 30;

export default async function LicensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: licenses } = await supabase
    .from("licenses")
    .select("id, key, email, domain, tier, status, created_at, theme_file_path")
    .eq("email", user.email!)
    .order("created_at", { ascending: false });

  return <LicensesView licenses={licenses ?? []} />;
}
