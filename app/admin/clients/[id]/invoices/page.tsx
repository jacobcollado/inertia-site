import { InvoicesTab } from "../tabs/invoices-tab";
import { getClientInvoicesData } from "../data";

export const revalidate = 30;

export default async function ClientInvoicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoices = await getClientInvoicesData(id);
  return <InvoicesTab clientId={id} invoices={invoices} />;
}
