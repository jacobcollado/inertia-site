import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "./settings-view";

export const revalidate = 30;

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: client }, { data: profile }] = await Promise.all([
    supabase.from("clients").select("id, email, name, company, notification_prefs").eq("id", user.id).single(),
    supabase.from("profiles").select("avatar_url").eq("id", user.id).single(),
  ]);

  const providers = (user.identities ?? []).map(i => i.provider);

  return (
    <SettingsView
      client={client}
      avatarUrl={profile?.avatar_url ?? null}
      signInProviders={providers.length ? providers : ["email"]}
    />
  );
}
