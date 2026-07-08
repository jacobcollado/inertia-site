import { getTools } from "../actions";
import { ToolsView } from "./tools-view";

export default async function AdminToolsPage() {
  const tools = await getTools();
  return <ToolsView initialTools={tools} />;
}
