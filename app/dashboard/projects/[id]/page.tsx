import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectDetailView } from "./project-detail-view";

export const revalidate = 30;

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: project }, { data: updates }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title, status, phase, last_update, notes, start_date, target_date")
      .eq("client_id", user.id)
      .eq("id", id)
      .single(),
    supabase
      .from("project_updates")
      .select("id, project_id, status, note, created_at")
      .eq("client_id", user.id)
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!project) notFound();

  return <ProjectDetailView project={project} updates={updates ?? []} />;
}
