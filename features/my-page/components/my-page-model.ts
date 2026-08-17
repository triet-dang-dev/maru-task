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

export const defaultMyPageWidgets = myPageWidgetCatalog.slice(0, 3);

export const defaultMyPageWidgetData: MyPageWidgetData = {
  calendarEvents: ["Aug 18 · Release readiness review", "Aug 20 · Sprint retrospective"],
  favoriteProjects: [
    { id: "42", name: "Migration" },
    { id: "43", name: "Website relaunch" },
    { id: "44", name: "Operations" },
  ],
  spentTime: [
    { day: "Mon", hours: 2 },
    { day: "Tue", hours: 4 },
    { day: "Wed", hours: 1.5 },
    { day: "Thu", hours: 3 },
    { day: "Fri", hours: 0 },
  ],
  workPackages: [
    {
      id: "WP-142",
      projectId: "42",
      status: "In progress",
      subject: "Review the release checklist",
    },
    {
      id: "WP-138",
      projectId: "42",
      status: "Open",
      subject: "Confirm stakeholder access",
    },
    {
      id: "WP-131",
      projectId: "42",
      status: "Open",
      subject: "Prepare migration notes",
    },
  ],
};
