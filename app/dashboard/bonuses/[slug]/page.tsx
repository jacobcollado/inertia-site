import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBonus, hasActiveLicense } from "@/lib/bonuses";
import { BonusDetailView } from "./bonus-detail-view";
import { MarkBonusesSeen } from "../mark-bonuses-seen";

export const revalidate = 30;

export default async function BonusPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await hasActiveLicense(supabase, user.email))) redirect("/dashboard/bonuses");

  const { slug } = await params;
  const bonus = await getBonus(slug);
  if (!bonus) notFound();

  return (
    <>
      {user.user_metadata?.bonuses_seen !== true && <MarkBonusesSeen />}
      <BonusDetailView bonus={bonus} />
    </>
  );
}
