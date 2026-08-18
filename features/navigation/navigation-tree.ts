export interface NavigationTreeItem {
  availability?: "implemented" | "planned";
  children?: NavigationTreeItem[];
  href?: string;
  label: string;
}

const projectStatusItems: NavigationTreeItem[] = [
  { href: "/projects?status=on-track", label: "On track" },
  { href: "/projects?status=off-track", label: "Off track" },
  { href: "/projects?status=at-risk", label: "At risk" },
];

const workPackageDefaultItems: NavigationTreeItem[] = [
  { href: "/projects/:projectId/work-items", label: "All open" },
  { availability: "planned", label: "Latest activity" },
  { availability: "planned", label: "Recently created" },
  { availability: "planned", label: "Overdue" },
  { availability: "planned", label: "Created by me" },
  { availability: "planned", label: "Assigned to me" },
  { availability: "planned", label: "Shared with users" },
  { availability: "planned", label: "Shared with me" },
];

export const missingNavigationPages = [
  { label: "My time tracking", route: "/my/time-tracking" },
  { label: "Portfolios", route: "/portfolios" },
  { label: "Latest activity", route: "/work-packages/default/latest-activity" },
  { label: "Recently created", route: "/work-packages/default/recently-created" },
  { label: "Overdue", route: "/work-packages/default/overdue" },
  { label: "Created by me", route: "/work-packages/default/created-by-me" },
  { label: "Assigned to me", route: "/work-packages/default/assigned-to-me" },
  { label: "Shared with users", route: "/work-packages/default/shared-with-users" },
  { label: "Shared with me", route: "/work-packages/default/shared-with-me" },
  { label: "Milestones", route: "/gantt-charts/default/milestones" },
  { label: "Meetings", route: "/meetings" },
  { label: "News", route: "/news" },
  { label: "Main wiki pages", route: "/wiki/main" },
  { label: "Requirements", route: "/requirements" },
] as const;

export const navigationTree: NavigationTreeItem[] = [
  { href: "/home", label: "Home" },
  { href: "/my/page", label: "My page" },
  { href: "/my/time-tracking", label: "My time tracking" },
  { href: "/portfolios", label: "Portfolios" },
  {
    children: [
      { href: "/projects", label: "Active projects" },
      { href: "/projects?view=mine", label: "My projects" },
      { href: "/projects?view=favorites", label: "Favorite projects" },
      { href: "/projects?view=archived", label: "Archived projects" },
      { children: projectStatusItems, label: "Status" },
    ],
    href: "/projects",
    label: "Projects",
  },
  {
    children: [{ children: workPackageDefaultItems, label: "Default" }],
    href: "/projects/:projectId/work-items",
    label: "Work packages",
  },
  {
    children: [
      {
        children: [
          { href: "/projects/:projectId/gantt", label: "All open" },
          { availability: "planned", label: "Milestones" },
        ],
        label: "Default",
      },
    ],
    href: "/projects/:projectId/gantt",
    label: "Gantt charts",
  },
  { href: "/projects/:projectId/boards", label: "Boards" },
  {
    children: [
      { href: "/meetings", label: "My meetings" },
      { href: "/meetings?view=recurring", label: "Recurring meetings" },
      { href: "/meetings?view=all", label: "All meetings" },
      { availability: "planned", label: "Templates" },
      {
        children: [
          { availability: "planned", label: "Attended" },
          { availability: "planned", label: "Created by me" },
        ],
        label: "Involvement",
      },
    ],
    href: "/meetings",
    label: "Meetings",
  },
  { href: "/news", label: "News" },
  { href: "/projects/:projectId/reports/time-cost", label: "Time and costs" },
  {
    children: [
      { availability: "planned", label: "Main wiki pages" },
      { href: "/projects/:projectId/wiki", label: "All wiki pages" },
    ],
    href: "/projects/:projectId/wiki",
    label: "Wiki",
  },
  { href: "/requirements", label: "Requirements" },
];

export const projectWorkspaceNavigationTree: NavigationTreeItem[] = [
  { href: "/projects/:projectId", label: "Overview" },
  { href: "/projects/:projectId/activity", label: "Activity" },
  {
    children: [
      {
        children: workPackageDefaultItems,
        label: "Default views",
      },
    ],
    href: "/projects/:projectId/work-items",
    label: "Work packages",
  },
  {
    children: [
      {
        children: [
          { href: "/projects/:projectId/gantt", label: "All open" },
          { availability: "planned", label: "Milestones" },
        ],
        label: "Default",
      },
    ],
    href: "/projects/:projectId/gantt",
    label: "Gantt charts",
  },
  { href: "/projects/:projectId/boards", label: "Boards" },
  { href: "/projects/:projectId/backlogs", label: "Backlogs" },
  { href: "/projects/:projectId/team-planner", label: "Team planner" },
  { href: "/projects/:projectId/calendar", label: "Calendar" },
  { href: "/projects/:projectId/news", label: "News" },
  { href: "/projects/:projectId/reports/time-cost", label: "Time and costs" },
  {
    children: [
      { availability: "planned", label: "Main wiki page" },
      { href: "/projects/:projectId/wiki", label: "All wiki pages" },
    ],
    href: "/projects/:projectId/wiki",
    label: "Wiki",
  },
  { href: "/projects/:projectId/documents", label: "Documents" },
  { href: "/projects/:projectId/members", label: "Members" },
  {
    children: [
      { href: "/projects/:projectId/settings", label: "General" },
      { href: "/projects/:projectId/settings/life-cycle", label: "Life cycle" },
      { href: "/projects/:projectId/settings/modules", label: "Modules" },
      { href: "/projects/:projectId/settings/custom-fields", label: "Custom fields" },
      { href: "/projects/:projectId/settings/versions", label: "Versions" },
      { href: "/projects/:projectId/settings/categories", label: "Categories" },
    ],
    href: "/projects/:projectId/settings",
    label: "Project settings",
  },
];
