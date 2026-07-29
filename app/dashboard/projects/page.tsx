import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectsView } from "./projects-view";

export const revalidate = 30;

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: projects }, { data: projectUpdates }] = await Promise.all([
    supabase.from("projects")
      .select("id, title, status, phase, last_update, notes, start_date, target_date")
      .eq("client_id", user.id).order("created_at", { ascending: false }),
    supabase.from("project_updates")
      .select("id, project_id, status, note, created_at")
      .eq("client_id", user.id).order("created_at", { ascending: false }),
  ]);

  return <ProjectsView projects={projects ?? []} projectUpdates={projectUpdates ?? []} />;
}
