import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LicenseDetailView } from "./license-detail-view";

export const revalidate = 30;

export default async function LicenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: license } = await supabase
    .from("licenses")
    .select("id, key, email, domain, tier, status, created_at, theme_file_path, amount_total, currency, receipt_url, paid_at, downloaded_at, downloaded_version")
    .eq("email", user.email!)
    .eq("id", id)
    .single();

  if (!license) notFound();

  return <LicenseDetailView license={license} />;
}
