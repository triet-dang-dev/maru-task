import { getProjects } from "@/features/projects/service";
import { getWorkItems } from "@/features/work-items/service";

import type { MyPageWidgetData } from "./components/my-page-model";

export async function loadMyPageData(): Promise<MyPageWidgetData> {
  const projects = await getProjects();
  const workItemPages = await Promise.all(projects.items.map((project) => getWorkItems(project.id)));

  return {
    calendarEvents: [],
    favoriteProjects: projects.items.map(({ id, name }) => ({ id, name })),
    spentTime: [],
    workPackages: workItemPages.flatMap((page) =>
      page.items.map(({ id, projectId, status, subject }) => ({ id, projectId, status, subject })),
    ),
  };
}