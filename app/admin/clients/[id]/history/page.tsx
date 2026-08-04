import { HistoryTab } from "../tabs/history-tab";
import { getClientHistoryData } from "../data";

export const revalidate = 30;

export default async function ClientHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminLog = await getClientHistoryData(id);
  return <HistoryTab clientId={id} initial={adminLog} />;
}
