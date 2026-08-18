import type { StatusTone } from "@/theme/tokens";

export type MyPageWidgetType =
  | "calendar"
  | "customText"
  | "favoriteProjects"
  | "news"
  | "spentTime"
  | "workPackagesAssigned"
  | "workPackagesCreated";

export interface MyPageWidgetDefinition {
  description?: string;
  id: string;
  title: string;
  type: MyPageWidgetType;
}

export interface MyPageCalendarEvent {
  date: string;
  href?: string;
  id: string;
  projectName?: string;
  title: string;
}

export interface MyPageNewsItem {
  author?: string;
  date: string;
  id: string;
  summary: string;
  title: string;
}

export interface MyPageWorkPackageItem {
  dueDate?: string | null;
  id: string;
  priority?: string;
  priorityTone?: StatusTone;
  projectId: string;
  projectName?: string;
  status: string;
  statusTone?: StatusTone;
  subject: string;
}

export interface MyPageWidgetData {
  calendarEvents: (string | MyPageCalendarEvent)[];
  customText?: string;
  favoriteProjects: {
    code?: string;
    id: string;
    name: string;
    status?: string;
    statusTone?: StatusTone;
  }[];
  news?: MyPageNewsItem[];
  spentTime: { date?: string; day: string; hours: number }[];
  workPackages: MyPageWorkPackageItem[];
}

export const myPageWidgetCatalog: MyPageWidgetDefinition[] = [
  {
    description: "Open work packages where you are assigned as the responsible owner.",
    id: "assigned",
    title: "Work packages assigned to me",
    type: "workPackagesAssigned",
  },
  {
    description: "Work packages you authored or reported across all projects.",
    id: "created",
    title: "Work packages created by me",
    type: "workPackagesCreated",
  },
  {
    description: "Weekly breakdown of logged time and total hours.",
    id: "spent-time",
    title: "My spent time",
    type: "spentTime",
  },
  {
    description: "Quick access to your starred and active workspaces.",
    id: "favorites",
    title: "Favorite projects",
    type: "favoriteProjects",
  },
  {
    description: "Upcoming milestone deadlines, sprint deliverables, and task due dates.",
    id: "calendar",
    title: "Calendar",
    type: "calendar",
  },
  {
    description: "Latest news, announcements, and release updates from your projects.",
    id: "news",
    title: "Subscribed news",
    type: "news",
  },
  {
    description: "Personal note pad, scratch space, or custom markdown instructions.",
    id: "custom-text",
    title: "Custom text",
    type: "customText",
  },
];
