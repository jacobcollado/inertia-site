import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FilesView } from "./files-view";

export const revalidate = 30;

export default async function FilesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: files } = await supabase
    .from("files")
    .select("id, label, url, uploaded_at")
    .eq("client_id", user.id)
    .order("uploaded_at", { ascending: false });

  return <FilesView files={files ?? []} />;
}
