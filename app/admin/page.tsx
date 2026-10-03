import { getClients, getOverview } from "./data";
import { OverviewCards } from "./overview-cards";

export const revalidate = 60; // re-fetch at most every 60s

export default async function AdminOverviewPage() {
  // Demo accounts carry seeded sample data, so every overview number is
  // computed from real clients only.
  const clients = (await getClients()).filter(c => !c.is_demo);
  const overview = await getOverview(clients);

  return <OverviewCards overview={overview} clients={clients} />;
}
