import type { StatusTone } from "@/theme/tokens";

export interface HomeMetrics {
  activeProjectsCount: number;
  activeSprintsCount: number;
  dueTodayCount: number;
  openWorkPackagesCount: number;
}

export interface HomeRecentProject {
  code?: string | null;
  description?: string | null;
  id: string;
  isFavorite?: boolean;
  name: string;
  statusLabel?: string;
  statusTone?: StatusTone;
  updatedAt?: string;
}

export interface HomeAssignedTask {
  dueDate?: string | null;
  id: string;
  priorityLabel?: string;
  priorityTone?: StatusTone;
  projectId: string;
  projectName?: string;
  status: string;
  statusTone?: StatusTone;
  subject: string;
}

export interface HomeMeeting {
  endAt?: string;
  id: string;
  location?: string;
  participantsCount?: number;
  startAt: string;
  title: string;
}

export interface HomeNewsItem {
  authorName?: string;
  id: string;
  publishedAt: string;
  summary: string;
  title: string;
}

export interface HomeResourceLinkItem {
  description: string;
  external?: boolean;
  href: string;
  iconName: "book-open" | "help-circle" | "keyboard" | "users" | "file-code" | "shield";
  title: string;
}

export interface HomeAnnouncement {
  id: string;
  message: string;
  title: string;
  type?: "info" | "warning" | "success";
}

export interface HomeData {
  announcement?: HomeAnnouncement | null;
  assignedTasks: HomeAssignedTask[];
  meetings: HomeMeeting[];
  metrics: HomeMetrics;
  news: HomeNewsItem[];
  recentProjects: HomeRecentProject[];
  resourceLinks: HomeResourceLinkItem[];
}
