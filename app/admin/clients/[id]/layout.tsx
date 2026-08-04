import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientHeader } from "./client-header";
import { ClientNavPublisher } from "./client-nav-publisher";
import { PrefetchClientTabs } from "./prefetch-client-tabs";
import { getClientLayoutData } from "./data";

export const revalidate = 30;

export default async function ClientDetailLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const layoutData = await getClientLayoutData(id);
  if (!layoutData) notFound();

  const { client, label, avatarUrl, unreadCount } = layoutData;

  return (
    <div className="flex flex-col gap-6">
      <PrefetchClientTabs clientId={id} />
      <ClientNavPublisher id={id} label={label} unreadCount={unreadCount} />
      <ClientHeader client={client} avatarUrl={avatarUrl} />
      {children}
    </div>
  );
}
