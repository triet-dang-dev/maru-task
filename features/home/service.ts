import { getProjects } from "@/features/projects/service";
import { getWorkItems } from "@/features/work-items/service";
import type { StatusTone } from "@/theme/tokens";

import type {
  HomeAssignedTask,
  HomeData,
  HomeMeeting,
  HomeNewsItem,
  HomeRecentProject,
  HomeResourceLinkItem,
} from "./types";

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

export const defaultResourceLinks: HomeResourceLinkItem[] = [
  {
    description: "Learn how to manage projects, agile boards, and workflows.",
    external: false,
    href: "/docs/user-guides",
    iconName: "book-open",
    title: "User guides",
  },
  {
    description: "Speed up navigation with global quick keys and keyboard commands.",
    external: false,
    href: "/docs/shortcuts",
    iconName: "keyboard",
    title: "Keyboard shortcuts",
  },
  {
    description: "Definitions of terminology, work package types, and statuses.",
    external: false,
    href: "/docs/glossary",
    iconName: "help-circle",
    title: "Glossary & Workflows",
  },
  {
    description: "Discuss best practices and collaborate with the community.",
    external: true,
    href: "https://community.openproject.org",
    iconName: "users",
    title: "Community & Forums",
  },
  {
    description: "Explore the REST API schemas and backend developer endpoints.",
    external: false,
    href: "/docs/api",
    iconName: "file-code",
    title: "API Documentation",
  },
  {
    description: "Security advisories, role permissions, and access controls.",
    external: false,
    href: "/docs/security",
    iconName: "shield",
    title: "Security & Permissions",
  },
];

export const defaultNewsItems: HomeNewsItem[] = [
  {
    authorName: "System Administration",
    id: "news-1",
    publishedAt: "Today at 09:00",
    summary: "Welcome to Maru Task. Multi-project workspaces, Gantt charts, and Sprints are live.",
    title: "Maru Task Platform Launch & Features Overview",
  },
  {
    authorName: "Product Team",
    id: "news-2",
    publishedAt: "Yesterday",
    summary: "Agile boards with interactive drag-and-drop workflow status updates are enabled.",
    title: "Agile Backlogs and Team Planner Enhancements",
  },
];

export const defaultUpcomingMeetings: HomeMeeting[] = [
  {
    endAt: "10:30 AM",
    id: "meeting-1",
    location: "Online / Room A",
    participantsCount: 6,
    startAt: "Today, 10:00 AM",
    title: "Sprint Planning & Backlog Refinement",
  },
  {
    endAt: "03:30 PM",
    id: "meeting-2",
    location: "Main Boardroom",
    participantsCount: 4,
    startAt: "Tomorrow, 02:30 PM",
    title: "Weekly Engineering & Architecture Sync",
  },
];

function getFavoriteProjectIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("maru_task_favorite_projects");
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

export async function loadHomeData(): Promise<HomeData> {
  const projectsResponse = await getProjects().catch(() => ({
    items: [],
    page: 1,
    pageSize: 10,
    total: 0,
  }));

  const projects = projectsResponse.items;
  const favoriteIds = getFavoriteProjectIds();

  const workItemResponses = await Promise.all(
    projects.slice(0, 10).map((project) =>
      getWorkItems(project.id).catch(() => ({
        hasItems: false,
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
      })),
    ),
  );

  const allWorkItems = workItemResponses.flatMap((res, index) =>
    res.items.map((item) => ({
      ...item,
      projectName: item.projectName || projects[index]?.name || "Project",
    })),
  );

  const openWorkItems = allWorkItems.filter(
    (item) => !["closed", "done", "resolved"].includes(item.status.toLowerCase()),
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const dueTodayTasks = openWorkItems.filter((item) => {
    if (item.dueDate && item.dueDate.slice(0, 10) === todayStr) return true;
    const normPriority = (item.priority || "").toLowerCase();
    return ["immediate", "critical", "urgent"].includes(normPriority);
  });

  const assignedTasks: HomeAssignedTask[] = openWorkItems.slice(0, 5).map((item) => ({
    dueDate: item.dueDate || null,
    id: item.id,
    priorityLabel: item.priority || "Normal",
    priorityTone: mapPriorityTone(item.priority),
    projectId: item.projectId,
    projectName: item.projectName,
    status: item.status,
    statusTone: mapStatusTone(item.status),
    subject: item.subject,
  }));

  const sortedProjects = [...projects].sort((a, b) => {
    const aFav = favoriteIds.has(a.id) ? 1 : 0;
    const bFav = favoriteIds.has(b.id) ? 1 : 0;
    return bFav - aFav;
  });

  const recentProjects: HomeRecentProject[] = sortedProjects.slice(0, 6).map((project) => ({
    code: project.code,
    description: null,
    id: project.id,
    isFavorite: favoriteIds.size > 0 ? favoriteIds.has(project.id) : true,
    name: project.name,
    statusLabel: project.status || "Active",
    statusTone: mapStatusTone(project.status || "active"),
    updatedAt: project.updatedAt,
  }));

  const metrics = {
    activeProjectsCount: projects.length,
    activeSprintsCount: Math.max(1, Math.min(projects.length, 3)),
    dueTodayCount: dueTodayTasks.length,
    openWorkPackagesCount: openWorkItems.length,
  };

  return {
    announcement: {
      id: "announcement-system-1",
      message: "Welcome to Maru Task! Explore projects, track work packages, and manage agile sprints.",
      title: "System Notice",
      type: "info",
    },
    assignedTasks,
    meetings: defaultUpcomingMeetings,
    metrics,
    news: defaultNewsItems,
    recentProjects,
    resourceLinks: defaultResourceLinks,
  };
}
