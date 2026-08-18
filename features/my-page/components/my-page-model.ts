export type MyPageWidgetType =
  | "calendar"
  | "customText"
  | "favoriteProjects"
  | "spentTime"
  | "workPackagesAssigned"
  | "workPackagesCreated";

export interface MyPageWidgetDefinition {
  id: string;
  title: string;
  type: MyPageWidgetType;
}

export interface MyPageWidgetData {
  calendarEvents: string[];
  favoriteProjects: { id: string; name: string }[];
  spentTime: { day: string; hours: number }[];
  workPackages: {
    id: string;
    projectId: string;
    status: string;
    subject: string;
  }[];
}

export const myPageWidgetCatalog: MyPageWidgetDefinition[] = [
  { id: "assigned", title: "Work packages assigned to me", type: "workPackagesAssigned" },
  { id: "spent-time", title: "My spent time", type: "spentTime" },
  { id: "favorites", title: "Favorite projects", type: "favoriteProjects" },
  { id: "calendar", title: "Calendar", type: "calendar" },
  { id: "created", title: "Work packages created by me", type: "workPackagesCreated" },
  { id: "custom-text", title: "Custom text", type: "customText" },
];
