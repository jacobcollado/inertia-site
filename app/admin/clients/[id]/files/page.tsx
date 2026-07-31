import { createAdminClient } from "@/lib/supabase/admin";
import { FilesTab } from "../tabs/files-tab";

export const revalidate = 30;

export default async function ClientFilesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: files } = await admin
    .from("files")
    .select("id, label, url, uploaded_at")
    .eq("client_id", id)
    .order("uploaded_at", { ascending: false });

  return <FilesTab clientId={id} files={files ?? []} />;
}
