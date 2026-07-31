import { createAdminClient } from "@/lib/supabase/admin";
import { ProjectsTab } from "../tabs/projects-tab";

export const revalidate = 30;

export default async function ClientProjectsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: projects }, { data: projectUpdates }] = await Promise.all([
    admin.from("projects").select("id, title, status, phase, last_update, notes, created_at, start_date, target_date").eq("client_id", id).order("created_at", { ascending: false }),
    admin.from("project_updates").select("id, project_id, status, note, created_at").eq("client_id", id).order("created_at", { ascending: false }),
  ]);

  return <ProjectsTab clientId={id} projects={projects ?? []} projectUpdates={projectUpdates ?? []} />;
}
