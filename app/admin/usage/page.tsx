import { getAiUsage } from "../data";
import { UsageView } from "./usage-view";

export const revalidate = 60;

export default async function AdminUsagePage() {
  const usage = await getAiUsage(30);
  return <UsageView usage={usage} />;
}
