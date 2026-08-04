import { ProjectsTab } from "../tabs/projects-tab";
import { getClientProjectsData } from "../data";

export const revalidate = 30;

export default async function ClientProjectsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { projects, projectUpdates } = await getClientProjectsData(id);
  return <ProjectsTab clientId={id} projects={projects} projectUpdates={projectUpdates} />;
}
