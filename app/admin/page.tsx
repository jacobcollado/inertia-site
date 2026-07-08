import { getClients, getOverview } from "./data";
import { OverviewCards } from "./overview-cards";

export const revalidate = 60; // re-fetch at most every 60s

export default async function AdminOverviewPage() {
  const clients = await getClients();
  const overview = await getOverview(clients);

  return <OverviewCards overview={overview} clients={clients} />;
}
