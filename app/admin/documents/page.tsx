import { getClients, getDocuments } from "../data";
import { DocumentsView } from "./documents-view";

export const revalidate = 60;

export default async function DocumentsPage() {
  const clients = await getClients();
  const { invoices, files } = await getDocuments(clients);

  return <DocumentsView invoices={invoices} files={files} />;
}
