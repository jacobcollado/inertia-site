import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChangelogView } from "./changelog-view";

export const revalidate = 30;

export default async function ChangelogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <ChangelogView />;
}
