import { getProjects } from "@/features/projects/service";
import { getWorkItems } from "@/features/work-items/service";
import type { StatusTone } from "@/theme/tokens";

import type {
  MyPageCalendarEvent,
  MyPageNewsItem,
  MyPageWidgetData,
  MyPageWorkPackageItem,
} from "./components/my-page-model";

function mapStatusTone(status: string): StatusTone {
  const normalized = status.toLowerCase().replace(/[\s_]+/g, "-");
  if (["closed", "completed", "done", "resolved"].includes(normalized)) return "success";
  if (["on-track", "in-progress", "open", "active"].includes(normalized)) return "info";
  if (["at-risk", "review", "testing", "pending"].includes(normalized)) return "warning";
  if (["off-track", "blocked", "rejected", "failed"].includes(normalized)) return "error";
  return "neutral";
}

function mapPriorityTone(priority?: string): StatusTone {
  if (!priority) return "neutral";
  const normalized = priority.toLowerCase();
  if (["immediate", "critical", "urgent"].includes(normalized)) return "error";
  if (["high"].includes(normalized)) return "warning";
  if (["normal", "medium"].includes(normalized)) return "info";
  if (["low"].includes(normalized)) return "neutral";
  return "neutral";
}

export const defaultSpentTimeWeekly = [
  { date: "Aug 18", day: "Mon", hours: 7.5 },
  { date: "Aug 19", day: "Tue", hours: 8.0 },
  { date: "Aug 20", day: "Wed", hours: 8.0 },
  { date: "Aug 21", day: "Thu", hours: 6.5 },
  { date: "Aug 22", day: "Fri", hours: 7.0 },
];

export const defaultMyPageNews: MyPageNewsItem[] = [
  {
    author: "Product Team",
    date: "Today at 09:00",
    id: "my-news-1",
    summary: "Release v2.0 introduces customizable My Page widgets, sprint boards, and Gantt charts.",
    title: "Platform Update: Enhanced Workspace Navigation & Dashboards",
  },
  {
    author: "Operations",
    date: "Yesterday",
    id: "my-news-2",
    summary: "Scheduled maintenance completed successfully. All services are fully operational.",
    title: "System Performance & Infrastructure Upgrades",
  },
];

export async function loadMyPageData(): Promise<MyPageWidgetData> {
  const projectsResponse = await getProjects().catch(() => ({
    items: [],
    page: 1,
    pageSize: 10,
    total: 0,
  }));

  const projects = projectsResponse.items;
  const workItemPages = await Promise.all(
    projects.slice(0, 6).map((project) =>
      getWorkItems(project.id).catch(() => ({
        hasItems: false,
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
      })),
    ),
  );

  const allWorkItems: MyPageWorkPackageItem[] = workItemPages.flatMap((page, index) =>
    page.items.map((item) => ({
      dueDate: null,
      id: item.id,
      priority: item.priority || "Normal",
      priorityTone: mapPriorityTone(item.priority),
      projectId: item.projectId,
      projectName: item.projectName || projects[index]?.name || "Project",
      status: item.status,
      statusTone: mapStatusTone(item.status),
      subject: item.subject,
    })),
  );

  const favoriteProjects = projects.map((p) => ({
    code: p.code,
    id: p.id,
    name: p.name,
    status: p.status || "Active",
    statusTone: mapStatusTone(p.status || "active"),
  }));

  const calendarEvents: MyPageCalendarEvent[] = allWorkItems.slice(0, 4).map((item, idx) => {
    const daysOffset = idx + 1;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysOffset);
    const dateFormatted = targetDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });

    return {
      date: dateFormatted,
      href: `/projects/${item.projectId}/work-items`,
      id: `cal-event-${item.id}`,
      projectName: item.projectName,
      title: `${item.subject} (Target Due)`,
    };
  });

  return {
    calendarEvents: calendarEvents.length > 0 ? calendarEvents : ["No upcoming deadlines scheduled."],
    customText: "Welcome to your personal dashboard. Track your assigned tasks, log your spent time, and monitor key project milestones.",
    favoriteProjects,
    news: defaultMyPageNews,
    spentTime: defaultSpentTimeWeekly,
    workPackages: allWorkItems,
  };
}