import { activityFeedApiService } from "./activity-feed";
import { agileApiService } from "./agile";
import { authApiService } from "./auth";
import { costEntriesApiService } from "./cost-entries";
import { healthApiService } from "./health";
import { navigationApiService } from "./navigation";
import { notificationsApiService } from "./notifications";
import { oidcApiService } from "./oidc";
import { projectDocumentsApiService } from "./project-documents";
import { projectsApiService } from "./projects";
import { reportsApiService } from "./reports";
import { searchApiService } from "./search";
import { sprintsApiService } from "./sprints";
import { timeEntriesApiService } from "./time-entries";
import { usersApiService } from "./users";
import { wikiPagesApiService } from "./wiki-pages";
import { workPackagesApiService } from "./work-packages";

export * from "./activity-feed";
export * from "./agile";
export * from "./auth";
export * from "./client";
export * from "./cost-entries";
export * from "./health";
export * from "./navigation";
export * from "./notifications";
export * from "./oidc";
export * from "./project-documents";
export * from "./projects";
export * from "./reports";
export * from "./search";
export * from "./sprints";
export * from "./time-entries";
export * from "./users";
export * from "./wiki-pages";
export * from "./work-packages";

export const backendApiServices = {
  ActivityFeed: activityFeedApiService,
  Agile: agileApiService,
  Auth: authApiService,
  CostEntries: costEntriesApiService,
  Health: healthApiService,
  Navigation: navigationApiService,
  Notifications: notificationsApiService,
  Oidc: oidcApiService,
  ProjectDocuments: projectDocumentsApiService,
  Projects: projectsApiService,
  Reports: reportsApiService,
  Search: searchApiService,
  Sprints: sprintsApiService,
  TimeEntries: timeEntriesApiService,
  Users: usersApiService,
  WikiPages: wikiPagesApiService,
  WorkPackages: workPackagesApiService,
} as const;
