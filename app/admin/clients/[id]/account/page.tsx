import { notFound } from "next/navigation";
import { AccountTab } from "../tabs/account-tab";
import { getClientLayoutData } from "../data";

export const revalidate = 30;

export default async function ClientAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const layoutData = await getClientLayoutData(id);
  if (!layoutData) notFound();

  return <AccountTab client={layoutData.client} />;
}
