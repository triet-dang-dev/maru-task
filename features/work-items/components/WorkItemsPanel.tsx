import { getWorkItems } from "../service";
import type { WorkItemsViewModel } from "../types";
import { WorkItemsPanelClient } from "./WorkItemsPanelClient";

interface WorkItemsPanelProps {
  projectId: string;
}

async function loadWorkItems(projectId: string): Promise<WorkItemsViewModel> {
  return getWorkItems(projectId);
}

export async function WorkItemsPanel({ projectId }: WorkItemsPanelProps) {
  const data = await loadWorkItems(projectId);

  return (
    <WorkItemsPanelClient data={data} projectId={projectId} onRefresh={async () => undefined} />
  );
}
