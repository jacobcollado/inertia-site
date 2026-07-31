import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { AccountTab } from "../tabs/account-tab";

export const revalidate = 30;

export default async function ClientAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: clientRow }, { data: { user: authUser } }] = await Promise.all([
    admin.from("clients").select("id, email, name, company, notes").eq("id", id).single(),
    admin.auth.admin.getUserById(id),
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

  return <AccountTab client={client} />;
}
