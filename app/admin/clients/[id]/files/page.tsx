import { FilesTab } from "../tabs/files-tab";
import { getClientFilesData } from "../data";

export const revalidate = 30;

export default async function ClientFilesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const files = await getClientFilesData(id);
  return <FilesTab clientId={id} files={files} />;
}
