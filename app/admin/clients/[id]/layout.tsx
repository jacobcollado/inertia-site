import { redirect, notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ClientHeader } from "./client-header";
import { ClientNavPublisher } from "./client-nav-publisher";

export const revalidate = 30;

export default async function ClientDetailLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const [{ data: clientRow }, { data: { user: authUser } }, { count: unreadCount }, { data: profileRow }] = await Promise.all([
    admin.from("clients").select("id, email, name, company, notes").eq("id", id).single(),
    admin.auth.admin.getUserById(id),
    admin.from("messages").select("id", { count: "exact", head: true }).eq("client_id", id).eq("sender", "client").is("read_at", null),
    admin.from("profiles").select("avatar_url").eq("id", id).single(),
  ]);

  if (!clientRow && !authUser) notFound();

  const isBanned = !!authUser?.banned_until && new Date(authUser.banned_until) > new Date();

  const client = {
    ...(clientRow ?? {
      id: authUser!.id,
      email: authUser!.email ?? "",
      name: (authUser!.user_metadata?.name as string | null) ?? null,
      company: null,
    }),
    banned: isBanned,
    last_sign_in_at: authUser?.last_sign_in_at ?? null,
    confirmed_at: authUser?.confirmed_at ?? null,
  };

  const label = client.company ?? client.name ?? client.email;

  return (
    <div className="flex flex-col gap-6">
      <ClientNavPublisher id={id} label={label} unreadCount={unreadCount ?? 0} />
      <ClientHeader client={client} avatarUrl={(profileRow?.avatar_url as string | null) ?? null} />
      {children}
    </div>
  );
}
