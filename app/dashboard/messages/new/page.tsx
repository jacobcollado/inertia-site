import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewCaseView } from "./new-case-view";

export default async function NewCasePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: client }, { data: profile }] = await Promise.all([
    supabase.from("clients").select("name, company").eq("id", user.id).single(),
    supabase.from("profiles").select("avatar_url").eq("id", user.id).single(),
  ]);

  const displayName = client?.company ?? client?.name ?? user.email ?? "You";

  return (
    <NewCaseView
      clientName={displayName}
      clientAvatarUrl={(profile?.avatar_url as string | null) ?? null}
    />
  );
}
