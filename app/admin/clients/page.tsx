import { getClients } from "../data";
import { ClientsTable } from "./clients-table";

export const revalidate = 60;

export default async function AdminClientsPage() {
  const clients = await getClients();
  return <ClientsTable clients={clients} />;
}
