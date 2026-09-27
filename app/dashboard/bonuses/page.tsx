import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllBonuses, hasActiveLicense } from "@/lib/bonuses";
import { BonusesView } from "./bonuses-view";
import { MarkBonusesSeen } from "./mark-bonuses-seen";

export const revalidate = 30;

export default async function BonusesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const unlocked = await hasActiveLicense(supabase, user.email);
  return (
    <>
      {unlocked && user.user_metadata?.bonuses_seen !== true && <MarkBonusesSeen />}
      <BonusesView bonuses={getAllBonuses()} unlocked={unlocked} />
    </>
  );
}
