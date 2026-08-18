# Menu & Navigation Implementation Plan with Current Status Audit

This document provides a comprehensive implementation plan and current status audit for **all menus, submenus, and global controls** in the **Maru Task** ecosystem, covering:
1. **Global Primary Navigation (System-wide scope)**
2. **Project Workspace Navigation (Project context scope)**
3. **Global Controls & AppShell Utilities (Header & Topbar utilities)**

> [!IMPORTANT]
> **Backend Integration Source of Truth**: The authoritative contract for all backend endpoints is defined in [`be-integrate.json`](file:///Users/kadang/www/maru/maru-task-fe/be-integrate.json) (OpenAPI 3.0 specification covering 15 tags and 78 operation contracts across Projects, Work Packages, Agile, Sprints, Time/Cost Entries, Reports, Documents, Wiki, Notifications, and Search). Features without matching endpoints in `be-integrate.json` (such as Meetings, Standalone Portfolios, and Requirements) are marked as 🟠 **MOCK ONLY** until their .NET controllers are authored.

Each item is detailed with its **Current Implementation Status**, **Required Components**, **Buttons & User Actions**, **Behaviors & State Management**, and **Backend API Contracts** mapped directly to `be-integrate.json`.

---

## Status Legend

| Status Badge | Meaning |
| :--- | :--- |
| 🟢 **DONE** | Complete UI & Live Backend API integrated via authenticated session fetch. |
| 🟡 **PARTIAL** | UI is ready; Backend API/adapter exists, but currently uses mock/local state or partial endpoints. |
| 🟠 **MOCK ONLY** | Static UI / Hardcoded client-side mock data; not connected to Backend API. |
| ⚪ **PLANNED** | Placeholder or not yet implemented (`<h1>...</h1>`). |

---

## Executive Status Matrix

### 1. Global Primary Navigation
| Menu / Submenu | Route | UI Status | API Integration Status | Overall Status |
| :--- | :--- | :--- | :--- | :---: |
| **1.1. Home** | `/home` | Complete (Welcome banner, KPI metrics, Recent projects, Assigned tasks, Meetings, News, Links, Creation Modals) | Live API integrated (`getProjects`, `getWorkItems`, `localStorage` favorites) | 🟢 **DONE** |
| **1.2. My page** | `/my/page` | Complete (Dashboard, Widget Cards, Add Widget Modal, Reordering, Reset Layout) | Live API integrated (`getProjects`, `getWorkItems`, calendar, spent time, news, localStorage persistence) | 🟢 **DONE** |
| **1.3. My time tracking** | `/my/time-tracking` | Basic timesheet table | Uses hardcoded mock data | 🟠 **MOCK ONLY** |
| **1.4. Portfolios** | `/portfolios` | Card view with progress bars & status chips | Hardcoded mock portfolio array (No backend controller in `be-integrate.json`) | 🟠 **MOCK ONLY** |
| **1.5. Projects** | `/projects` | Complete (Table/Cards, Filter bar, Create modal, Favorite toggle) | Live API integrated (`getProjects`, `createProject`, `deleteProject`, query params sync) | 🟢 **DONE** |
| ↳ *Active projects* | `/projects` | Complete | Live API | 🟢 **DONE** |
| ↳ *My projects* | `/projects?view=mine` | Complete (Query filter) | Live API | 🟢 **DONE** |
| ↳ *Favorite projects* | `/projects?view=favorites` | Complete (Query filter) | Live API | 🟢 **DONE** |
| ↳ *Archived projects* | `/projects?view=archived` | Complete (Query filter) | Live API | 🟢 **DONE** |
| ↳ *Status views* | `/projects?status={track}` | Complete (Query filter) | Live API | 🟢 **DONE** |
| **1.6. Work packages** | `/work-items` | Complete (Table, Split Drawer, Relations, Watchers, Attachments, Comments) | Live API integrated (Full CRUD, Comments, Relations, Watchers, Attachments, Priorities, Users) | 🟢 **DONE** |
| ↳ *Default views* | `/work-items?view={id}` | Complete (Saved views query) | Live API | 🟢 **DONE** |
| **1.7. Gantt charts** | `/projects/:id/gantt` | Interactive timeline, zoom controls, tree table | Reads work items from `getWorkItems(projectId)`; drag/date mutations pending | 🟡 **PARTIAL** |
| ↳ *Milestones* | `/projects/:id/gantt?view=milestones` | Filtered milestone bar view | Live read-only mapping | 🟡 **PARTIAL** |
| **1.8. Boards** | `/projects/:id/boards` | Kanban board, DnD lanes, Add Lane modal, column shift buttons | Live work items mapping (`getWorkItems`), card move via `updateWorkItem` + `agileApiService.moveBoardItem` | 🟢 **DONE** |
| **1.9. Meetings** | `/meetings` | Tab navigation, Meeting list, Agenda, Action items | Mock data (No backend controller in `be-integrate.json`) | 🟠 **MOCK ONLY** |
| ↳ *Recurring / All / Templates* | `/meetings?view={type}` | Tabbed mock views | Mock data | 🟠 **MOCK ONLY** |
| **1.10. News** | `/projects/:id/news` | Article feed, add news modal, author info | Local state only (No backend controller in `be-integrate.json`) | 🟠 **MOCK ONLY** |
| **1.11. Time and costs** | `/projects/:id/reports/time-cost` | Multi-dimensional pivot report & filters | Connected to `reportsApiService.getProjectTimeCost` | 🟢 **DONE** |
| **1.12. Wiki** | `/projects/:id/wiki` | Tree hierarchy sidebar, Markdown viewer, Editor | Create/Update calls `wikiPagesApiService`; initial list uses defaultPages | 🟡 **PARTIAL** |
| ↳ *Main / All pages* | `/projects/:id/wiki` | Hierarchy view | Partial API | 🟡 **PARTIAL** |
| **1.13. Requirements** | `/requirements` | Requirements list & detail drawer | Mock data (No backend controller in `be-integrate.json`) | 🟠 **MOCK ONLY** |

---

### 2. Project Workspace Navigation (`/projects/:projectId/...`)
| Menu / Submenu | Route | UI Status | API Integration Status | Overall Status |
| :--- | :--- | :--- | :--- | :---: |
| **2.1. Overview** | `/projects/:id` | Project summary, KPI cards, Status rollup, Members list | Project metadata & work items live; activity stream is static mock | 🟡 **PARTIAL** |
| **2.2. Activity** | `/projects/:id/activity` | Daily activity timeline, Filter tabs | Mapped locally from work items; `activityFeedApiService.list` not wired | 🟡 **PARTIAL** |
| **2.3. Backlogs** | `/projects/:id/backlogs` | Sprint Backlog, Product Backlog, Sprints Panel | Reorder calls `agileApiService`; initial backlog/sprints uses default mock | 🟡 **PARTIAL** |
| **2.4. Team planner** | `/projects/:id/team-planner` | Member timeline grid, Unassigned pane, Assignee picker | Connected to `projectsApiService.listMembers`, `getWorkItems`, `updateWorkItem` | 🟢 **DONE** |
| **2.5. Calendar** | `/projects/:id/calendar` | Month / Week / Day views, Event cards | Live API (`getWorkItems(id)`) | 🟢 **DONE** |
| **2.6. Documents** | `/projects/:id/documents` | Document categorized panel, upload modal | Delete calls `projectDocumentsApiService`; initial list uses default mock | 🟡 **PARTIAL** |
| **2.7. Members** | `/projects/:id/members` | Member table, Invite modal, Role select dropdown | Add/remove calls `projectsApiService`; initial list uses default mock | 🟡 **PARTIAL** |
| **2.8. Project settings** | `/projects/:id/settings` | General, Modules, Versions, Custom fields tabs | Update calls API; initial modules/versions use default mock | 🟡 **PARTIAL** |
| ↳ *General* | `/settings` | Form fields (Name, description, identifier) | Live API | 🟢 **DONE** |
| ↳ *Life cycle* | `/settings/life-cycle` | Status selector & dates | Live API (Project update) | 🟢 **DONE** |
| ↳ *Modules* | `/settings/modules` | Feature modules toggle list | Mock state | 🟡 **PARTIAL** |
| ↳ *Versions* | `/settings/versions` | Version milestone management table | Mock state | 🟡 **PARTIAL** |
| ↳ *Categories* | `/settings/categories` | Custom category management | Mock state | 🟡 **PARTIAL** |

---

### 3. Global Controls & AppShell Utilities
| Control / Utility | Location | UI Status | API Integration Status | Overall Status |
| :--- | :--- | :--- | :--- | :---: |
| **ProjectScopeSelector** | Topbar | Project selector dropdown | Live API (`getProjects()`, URL query sync) | 🟢 **DONE** |
| **GlobalSearch** | Topbar (Cmd+K) | Instant search modal & keyboard shortcut | Live debounced query (`getProjects()`, `getWorkItems()`) | 🟢 **DONE** |
| **NotificationCenter** | Topbar (Bell Icon) | Drawer, notification items | Connected to `notificationsApiService.markRead` | 🟢 **DONE** |
| **Session & User Profile** | Topbar | Avatar, user initials, Sign out button | Live API (`/auth/me`, `/auth/logout`, SessionGate) | 🟢 **DONE** |

---

## Detailed Section Breakdown

---

### 1. Global Primary Navigation

#### 1.1. Home (`/home`) — 🟢 DONE
*System landing page providing high-level metrics, shortcuts, and recent project activities.*

* **Status:** 🟢 **DONE** (Complete landing page with hero banner, KPI metrics grid, favorite/recent projects, open work packages, upcoming meetings, news updates, resource links, and interactive project/work item creation modals).
* **Required Components:**
  * `HomePageContent`: Welcome banner + system stats overview.
  * `HomeMetricsGrid`: KPI summary cards (Active Projects, Open Work Packages, Due Today, Active Sprints).
  * `HomeRecentProjectsList`: List of recently accessed projects with status indicators.
  * `HomeAssignedTasksWidget`: Top 5 urgent work packages assigned to the current user.
  * `HomeQuickActions`: Direct shortcut buttons (New Project, New Work Package, Log Time).
* **Buttons & Actions:**
  * `+ New Project`: Opens project creation modal.
  * `+ New Work Item`: Opens work package creation modal.
  * `View all projects`: Navigates to `/projects`.
  * `View my tasks`: Navigates to `/my/page`.
* **Behaviors & State:**
  * Parallel data fetching on mount for metrics and recent items.
  * Skeleton loading and error boundary with retry capability.
* **API Integrations:**
  * `GET /api/v1/projects` (via `getProjects()`)
  * `GET /api/v1/work-items?projectId={}` (via `getWorkItems(projectId)`)
  * Aggregates KPI metrics (Active projects, Open work packages, Urgent & Due today, Active sprints) directly from live data.
  * Starred favorites synced with `localStorage` (`maru_task_favorite_projects`).

---

#### 1.2. My page (`/my/page`) — 🟢 DONE
*Personalized user dashboard with customizable widget layout.*

* **Status:** 🟢 **DONE** (Complete personalized dashboard with full OpenProject widget catalog, persistent layout via localStorage, reordering controls, add widget dialog, reset layout, and live aggregated data for work items, spent time, calendar events, favorite projects, and news).
* **Required Components:**
  * `MyPageDashboard`: Responsive widget grid container.
  * `MyPageWidgetCard`: Wrapper card with drag handle and action menu (edit settings, remove widget).
  * `MyPageAddWidgetDialog`: Modal to select and add new widgets (Assigned to me, Created by me, Spent time, Calendar, Subscribed news).
* **Buttons & Actions:**
  * `+ Add widget`: Opens `MyPageAddWidgetDialog`.
  * `Reset to default`: Restores default widget layout.
  * Widget Card Actions: `Refresh`, `Edit Settings`, `Remove Widget`.
  * Quick status change directly on work item rows inside widgets.
* **Behaviors & State:**
  * Persists layout configuration (positions, sizes, active filters) to local storage or backend user profile.
  * Independent lazy loading per widget so an error in one does not break the dashboard.
* **API Integrations:**
  * `GET /api/v1/projects` (via `getProjects()`)
  * `GET /api/v1/work-items?projectId={}` (via `getWorkItems(projectId)`)
  * Dashboard layout & widget positions persisted in `localStorage` (`maru_task_my_page_layout`).
  * Aggregated spent time, calendar events, and starred projects directly from live data.

---

#### 1.3. My time tracking (`/my/time-tracking`) — 🟠 MOCK ONLY
*Personal timesheet logging, weekly/monthly breakdown, and live timer widget.*

* **Status:** 🟠 **MOCK ONLY** (Renders static sample time entries; backend has `time-entries` domain ready).
* **Required Components:**
  * `MyTimeTrackingView`: Timesheet table with date range picker.
  * `TimeEntryFormModal`: Time logging modal (Project, Work Item, Activity Type, Hours, Date, Comment).
  * `LiveTimerWidget`: Real-time running timer in the topbar or floating dock.
  * `WeeklyTimesheetGrid`: 7-day weekly matrix showing logged hours per task.
* **Buttons & Actions:**
  * `Log time`: Opens `TimeEntryFormModal`.
  * `Start / Stop timer`: Toggles live tracking timer.
  * `Edit / Delete time entry`: Updates/removes existing log.
  * `Export Timesheet`: Downloads timesheet report as Excel/PDF.
* **Behaviors & State:**
  * Toggle between Week View and List View.
  * Automatic summation of daily and weekly hours with validation (<24h/day, positive numbers).
* **API Integrations:**
  * Endpoint contracts defined in `timeEntriesApiService` (`GET /api/v1/time-entries`, `POST /api/v1/time-entries`); currently UI is 🟠 **MOCK ONLY**.

---

#### 1.4. Portfolios (`/portfolios`) — 🟠 MOCK ONLY
*Strategic multi-project portfolio management and aggregated progress tracking.*

* **Status:** 🟠 **MOCK ONLY** (Renders mock portfolio cards with progress bars and status tags).
* **Required Components:**
  * `PortfoliosPage`: Portfolio grid and overview list.
  * `PortfolioCard`: Card displaying overall progress, budget, project count, and health status.
  * `PortfolioCreateModal`: Modal to create a portfolio (Title, description, assigned projects, budget).
  * `PortfolioDetailView`: Roadmap and aggregated timeline across included projects.
* **Buttons & Actions:**
  * `+ New Portfolio`: Opens creation modal.
  * `Filter by Status`: Filters On track, At risk, Off track.
  * `Add Project to Portfolio`: Links projects to a portfolio.
* **Behaviors & State:**
  * Client/Server aggregation of child project progress metrics.
* **API Integrations:**
  * Backend portfolio endpoints pending; currently UI is 🟠 **MOCK ONLY**.

---

#### 1.5. Projects (`/projects` & Submenus) — 🟢 DONE
*Central hub for managing all projects across the organization.*

* **Status:** 🟢 **DONE** (Full UI with table/cards, search, filter tabs, create project modal, favorite star, delete modal, connected to live backend APIs).
* **Submenus:**
  1. `Active projects` (`/projects`)
  2. `My projects` (`/projects?view=mine`)
  3. `Favorite projects` (`/projects?view=favorites`)
  4. `Archived projects` (`/projects?view=archived`)
  5. `Status views` (`/projects?status=on-track | off-track | at-risk`)
* **Required Components:**
  * `ProjectsPageContent`: Main table & card view switcher.
  * `ProjectFilterBar`: Text search, status chips, visibility filters.
  * `ProjectCreateModal`: Modal to create a new project (Key/Identifier, Name, Description, Parent Project).
  * `ProjectArchiveModal` / `ProjectDeleteConfirmModal`.
  * `ProjectFavoriteButton`: Star toggle button.
* **Buttons & Actions:**
  * `+ New Project`: Opens creation modal.
  * `Favorite Star`: Toggles favorite state on project card/row.
  * `View Mode Switcher`: Toggles between Table view and Grid card view.
  * `Context Menu (3 dots)`: Archive, Unarchive, Settings, Delete.
* **Behaviors & State:**
  * Synchronizes tab view and status filter to URL search params (`view=mine`, `status=on-track`, `page=1`).
  * Server-side pagination, sorting by Name, Last Updated, or Progress.
* **API Integrations:**
  * `GET /api/v1/projects` (via `getProjects()`)
  * `POST /api/v1/projects` (via `createProject()`)
  * `GET /api/v1/projects/{id}` (via `getProject()`)
  * Query parameters (`?view=mine|favorites|archived`, `?status=...`) and Star favorites in `localStorage` (`maru_task_favorite_projects`).

---

#### 1.6. Work packages (`/projects/:projectId/work-items` & Submenus) — 🟢 DONE
*Comprehensive task, bug, feature, and story tracking system.*

* **Status:** 🟢 **DONE** (Complete UI with table, split detail drawer, full CRUD, activity comments, relations, watchers, attachments, timer button, connected to live backend APIs).
* **Submenus (Saved Views):**
  1. `All open` | 2. `Latest activity` | 3. `Recently created` | 4. `Overdue` | 5. `Created by me` | 6. `Assigned to me` | 7. `Shared with users` | 8. `Shared with me`
* **Required Components:**
  * `WorkItemsPageContent`: Main table + side-by-side split view drawer.
  * `WorkItemFilterBar`: Multi-criteria filter popover (Status, Assignee, Type, Priority, Version, Search).
  * `WorkItemDetailPageContent`: Detail view (WYSIWYG description, Activity timeline, Subtasks, Relations, Watchers, Attachments, Time log).
  * `WorkItemCreateModal`: Quick creation modal.
  * `WorkItemContextMenu`: Right-click context menu (Copy link, Duplicate, Change status, Log time, Delete).
  * `WorkItemShareModal`, `WorkItemCopyModal`, `WorkItemReminderModal`.
* **Buttons & Actions:**
  * `+ Create Work Item`: Opens creation drawer/modal.
  * `Filter / Search`: Toggles advanced query builder.
  * `Export`: Downloads CSV/PDF.
  * `Bulk Actions Bar`: Multi-selection actions (Batch Assignee, Status, Priority change, or Bulk Delete).
  * `Toggle Details Panel`: Opens quick inspection drawer without leaving the table.
* **Behaviors & State:**
  * Inline cell editing directly in the table (Status, Priority, Assignee, Due Date).
  * URL query sync for active view and filter state.
  * Optimistic updates on status and priority changes.
* **API Integrations:**
  * `GET /api/v1/work-items?projectId={}&view={}&filters={}&page={}`
  * `POST /api/v1/work-items`
  * `GET /api/v1/work-items/{id}`
  * `PATCH /api/v1/work-items/{id}`
  * `DELETE /api/v1/work-items/{id}`
  * `GET /api/v1/work-items/{id}/activities` & `POST /api/v1/work-items/{id}/activities`
  * `POST /api/v1/work-items/{id}/relations`
  * `POST /api/v1/work-items/{id}/watchers`
  * `POST /api/v1/work-items/{id}/attachments`
  * `GET /api/v1/priorities` & `GET /api/v1/users`

---

#### 1.7. Gantt charts (`/projects/:projectId/gantt` & Submenus) — 🟡 PARTIAL
*Interactive timeline visualizing task schedules and dependencies.*

* **Status:** 🟡 **PARTIAL** (Interactive timeline with zoom controls and dynamic work items schedule read from `getWorkItems`; drag/date mutation syncing back to API is pending).
* **Submenus:**
  1. `All open` | 2. `Milestones`
* **Required Components:**
  * `ProjectGantt`: Interactive Gantt chart container (Timeline header, tree table on left, Gantt bars on right).
  * `GanttTaskBar`: Bar showing progress, start/due dates, color-coded by status/type.
  * `GanttDependencyLink`: SVG connector arrows between predecessors and successors.
  * `GanttMilestoneDiamond`: Diamond marker for milestones.
* **Buttons & Actions:**
  * `Zoom Controls`: Zoom In / Out (Day, Week, Month, Quarter).
  * `Today`: Centers timeline on current day.
  * `Auto-schedule`: Calculates task dates based on dependencies.
  * `Add Dependency`: Drag handle connector between task bars.
* **Behaviors & State:**
  * Drag & Drop to adjust Start/Due dates and completion percentage.
  * Optimistic UI update with background API sync.
* **API Integrations:**
  * `GET /api/v1/work-items?projectId={}` (via `getWorkItems(projectId)`)
  * `PATCH /api/v1/work-items/{id}` (via `updateWorkItem(id, { dueDate, ... })`)

---

#### 1.8. Boards (`/projects/:projectId/boards`) — 🟢 DONE
*Kanban & Agile status boards with drag-and-drop workflow.*

* **Status:** 🟢 **DONE** (Kanban board UI with dynamic work items mapping into Open, In Progress, Done lanes, lane configuration, add lane modal, and inline card creation).
* **Required Components:**
  * `ProjectBoard`: Kanban board container.
  * `BoardColumn / BoardLane`: Status column (To Do, In Progress, Review, Done).
  * `BoardCard`: Card item showing ID, Type icon, Priority, Assignee avatar, Story points, Due date.
  * `AddBoardLaneModal`: Add new column or map workflow status.
* **Buttons & Actions:**
  * `+ Add Card`: Quickly create a task inside a specific lane.
  * `+ Add Column`: Adds a new board column.
  * `Board Settings`: Group by Status, Assignee, Version, or Subproject.
  * `WIP Limits`: Configure Work In Progress limits per lane.
* **Behaviors & State:**
  * Smooth Drag & Drop between columns and reordering within columns (via `dnd-kit`).
  * Instant optimistic move with rollback on network failure.
* **API Integrations:**
  * `GET /api/v1/work-items?projectId={}` (via `getWorkItems(projectId)`)
  * `POST /api/v1/work-items` (via `createWorkItem()`)
  * `PATCH /api/v1/work-items/{id}` (via `updateWorkItem(id, { status })`)
  * `PATCH /api/v1/agile/boards/move` (via `agileApiService.moveBoardItem`)

---

#### 1.9. Meetings (`/meetings` & Submenus) — 🟠 MOCK ONLY
*Meeting organization, agenda management, real-time minutes, and action item tracking.*

* **Status:** 🟠 **MOCK ONLY** (UI is built with tabs and list views; backend controller is pending).
* **Submenus:**
  1. `My meetings` | 2. `Recurring meetings` | 3. `All meetings` | 4. `Templates` | 5. `Involvement (Attended / Created by me)`
* **Required Components:**
  * `MeetingsPage`: Meeting list and calendar view switcher.
  * `MeetingDetailView`: Meeting detail (Agenda, Attendees, Minutes editor, Action items checklist).
  * `MeetingCreateModal`: Modal to schedule a meeting (Title, time, room/video link, attendees, linked project).
* **Buttons & Actions:**
  * `+ New Meeting`: Opens scheduling modal.
  * `Start Meeting`: Activates live meeting mode with real-time minutes editor.
  * `Convert to Work Package`: Converts an action item row into a real project task.
  * `Send Minutes`: Emails summary notes to all participants.
* **API Integrations:**
  * Backend meetings controller pending; currently UI is 🟠 **MOCK ONLY**.

---

#### 1.10. News (`/news`) — 🟠 MOCK ONLY
*Organization-wide and project-level news announcements.*

* **Status:** 🟠 **MOCK ONLY** (UI news feed and article view are implemented; backend news controller is pending).
* **Required Components:**
  * `GlobalNewsPage`: News feed list.
  * `NewsCard`: Article summary, author avatar, date, comment count.
  * `NewsArticleDetail`: Full article view + Markdown content + comment thread.
  * `NewsCreateModal`: Editor to publish news with file attachments.
* **Buttons & Actions:**
  * `+ Add News`: Opens editor modal (requires write permission).
  * `Comment`: Submits a comment on an article.
* **API Integrations:**
  * Global `/news` is 🟠 **MOCK ONLY**. Project news in `/projects/:id/news` uses local announcement publisher.

---

#### 1.11. Time and costs (`/projects/:projectId/reports/time-cost`) — 🟢 DONE
*Multi-dimensional financial and effort reporting.*

* **Status:** 🟢 **DONE** (Pivot table and date filters connected to `reportsApiService.getProjectTimeCost`, calculating total hours and project costs).
* **Required Components:**
  * `ProjectTimeCostReport`: Pivot table container.
  * `CostReportFilterPanel`: Filter controls (Date range, Member, Activity type, Currency).
  * `CostChart`: Bar/Line charts comparing Budget vs Actual Spent.
* **Buttons & Actions:**
  * `Generate Report`: Runs calculation query.
  * `Export Report`: Downloads Excel / PDF.
  * `Save Report View`: Saves report filter preset for future use.
* **API Integrations:**
  * `GET /api/v1/reports/projects/{projectId}/time-cost` (via `reportsApiService.getProjectTimeCost`)

---

#### 1.12. Wiki (`/projects/:projectId/wiki` & Submenus) — 🟡 PARTIAL
*Project documentation, knowledge base, and page versioning.*

* **Status:** 🟡 **PARTIAL** (Wiki workspace with page hierarchy tree sidebar, Markdown viewer, and editor. Save and create call `wikiPagesApiService`, but initial page list uses fallback defaults).
* **Submenus:**
  1. `Main wiki pages` | 2. `All wiki pages`
* **Required Components:**
  * `ProjectWikiWorkspace`: Page hierarchy tree sidebar + Markdown reading/editing pane.
  * `WikiPageEditor`: Rich text editor with table support, task linking (`#ID`), and image upload.
  * `WikiPageHistory`: Version history comparison diff view.
* **Buttons & Actions:**
  * `+ New Wiki Page`: Creates a new wiki page.
  * `Edit`: Toggles editing mode.
  * `History`: Opens version comparison.
  * `Delete Page`: Removes wiki page.
* **API Integrations:**
  * `GET /api/v1/projects/{projectId}/wiki/pages` (via `wikiPagesApiService.listPages`)
  * `POST /api/v1/projects/{projectId}/wiki/pages` (via `wikiPagesApiService.createPage`)
  * `PATCH /api/v1/projects/{projectId}/wiki/pages/{slug}` (via `wikiPagesApiService.updatePage`)
  * `DELETE /api/v1/projects/{projectId}/wiki/pages/{slug}` (via `wikiPagesApiService.deletePage`)

---

#### 1.13. Requirements (`/requirements`) — 🟠 MOCK ONLY
*Business and technical requirements traceability management.*

* **Status:** 🟠 **MOCK ONLY** (UI layout exists; backend controller pending in `be-integrate.json`).
* **Required Components:**
  * `RequirementsPage`: Requirements catalog table.
  * `RequirementDetailDrawer`: Specification detail and approval workflow (Draft, Reviewed, Approved, Rejected).
  * `TraceabilityMatrixView`: Mapping matrix linking Requirement -> Work Package -> Test Case.
* **Buttons & Actions:**
  * `+ New Requirement`: Opens creation modal.
  * `Change Approval Status`: Updates approval state.
  * `Link to Work Item`: Associates requirement with technical tasks.
* **API Integrations:**
  * Backend requirements controller pending; currently UI is 🟠 **MOCK ONLY**.

---

### 2. Project Workspace Navigation (`/projects/:projectId/...`)

#### 2.1. Overview (`/projects/:projectId`) — 🟡 PARTIAL
*Project home dashboard displaying summary metrics, progress rollup, and member roster.*

* **Status:** 🟡 **PARTIAL** (Connected to live `getProject(projectId)` and `getWorkItems(projectId)`; activity stream and member cards currently use sample data).
* **Required Components:**
  * `ProjectWorkspaceOverview`: Grid layout with project metadata, description, and status rollup.
  * `ProjectWorkspaceSummary`: Metric cards (Total work packages, Open bugs, Spent time, Budget).
  * `ProjectRecentActivityFeed`: Live activity stream for this project.
* **Buttons & Actions:**
  * `Project Status Selector`: Quick update (On Track / At Risk / Off Track).
  * `Edit Project Info`: Navigates to Project Settings.
* **API Integrations:**
  * `GET /api/v1/projects/{projectId}` (via `getProject()`)
  * `GET /api/v1/work-items?projectId={}` (via `getWorkItems()`)

---

#### 2.2. Activity (`/projects/:projectId/activity`) — 🟡 PARTIAL
*Chronological audit log of all events within the project.*

* **Status:** 🟡 **PARTIAL** (Activity feed dynamically mapped from project work packages; backend `GET /api/v1/activity-feed` query not yet connected directly).
* **Required Components:**
  * `ProjectActivity`: Timeline grouping activities by day.
  * `ActivityFilterTabs`: Filter categories (All, Work Packages, Wiki, News, Members, Files).
* **API Integrations:**
  * `GET /api/v1/work-items?projectId={}` (via `getWorkItems()` generates daily audit timeline)
  * `GET /api/v1/activity-feed` (via `activityFeedApiService.list`)

---

#### 2.3. Backlogs (`/projects/:projectId/backlogs`) — 🟡 PARTIAL
*Scrum and Agile backlog planning, Sprint management, and story point estimation.*

* **Status:** 🟡 **PARTIAL** (Reordering connected to `agileApiService.reorderBacklogs`; initial backlog list and sprint panel use mock defaults).
* **Required Components:**
  * `ProjectBacklog`: Split layout (Active/Future Sprints on top, Product Backlog on bottom).
  * `SprintContainer`: Sprint card displaying Goal, Dates, Capacity, Total Story Points, and Start/Complete buttons.
  * `BacklogItemRow`: Task item with story point badge, priority, and assignee.
  * `CreateSprintModal`: Modal to create a new Sprint.
* **Buttons & Actions:**
  * `+ Create Sprint`: Opens sprint creation modal.
  * `Start Sprint`: Activates sprint.
  * `Complete Sprint`: Closes sprint and rolls incomplete tasks to the next sprint or backlog.
  * `Drag & Drop Work Items`: Moves tasks between Product Backlog and Sprints.
* **API Integrations:**
  * `GET /api/v1/projects/{projectId}/sprints` (via `sprintsApiService.listProjectSprints`)
  * `POST /api/v1/projects/{projectId}/sprints` (via `sprintsApiService.createProjectSprint`)
  * `PATCH /api/v1/agile/backlogs/reorder` (via `agileApiService.reorderBacklogs`)

---

#### 2.4. Team planner (`/projects/:projectId/team-planner`) — 🟢 DONE
*Visual resource scheduling and workload allocation across team members.*

* **Status:** 🟢 **DONE** (Member matrix timeline, dynamic project member roster from `projectsApiService.listMembers`, unassigned task pane, assignee picker, and schedule persistence via `updateWorkItem`).
* **Required Components:**
  * `ProjectTeamPlanner`: Grid matrix (Rows: Members, Columns: Calendar days).
  * `ProjectTeamPlannerTimeline`: Scheduled task bars per assignee.
  * `ProjectTeamPlannerAddPane`: Side pane containing unassigned tasks for drag-and-drop scheduling.
  * `ProjectTeamPlannerAssigneePicker`: Member selector for planner view.
* **Buttons & Actions:**
  * Drag & Drop unassigned tasks onto a member's timeline date cell.
  * Resize task edges to adjust duration.
* **API Integrations:**
  * `GET /api/v1/projects/{projectId}/members` (via `projectsApiService.listMembers`)
  * `GET /api/v1/users` (via `getUsers()`)
  * `GET /api/v1/work-items?projectId={}` (via `getWorkItems()`)
  * `PATCH /api/v1/work-items/{id}` (via `updateWorkItem()` for assigning & scheduling dates)

---

#### 2.5. Calendar (`/projects/:projectId/calendar`) — 🟢 DONE
*Project calendar displaying deadlines, milestones, and events.*

* **Status:** 🟢 **DONE** (Month/Week grid calendar connected to `getWorkItems(projectId)`, displaying scheduled deadlines and work-item links).
* **Required Components:**
  * `ProjectCalendar`: Multi-view calendar component.
  * `CalendarEventPopover`: Quick detail popover on event click.
* **Buttons & Actions:**
  * `View Switcher`: Month / Week / Day toggle.
  * `Next / Prev / Today`: Date navigation controls.
* **API Integrations:**
  * `GET /api/v1/work-items?projectId={}` (via `getWorkItems()`)

---

#### 2.6. Documents (`/projects/:projectId/documents`) — 🟡 PARTIAL
*Categorized project document and file asset management.*

* **Status:** 🟡 **PARTIAL** (Document categorized panel with delete connected to `projectDocumentsApiService.deleteDocument`; initial document list uses sample mock data).
* **Required Components:**
  * `ProjectDocumentsPanel`: Document list grouped by category.
  * `DocumentUploadModal`: Upload modal (Title, description, category, file attachment).
* **API Integrations:**
  * `GET /api/v1/projects/{projectId}/documents` (via `projectDocumentsApiService.listDocuments`)
  * `DELETE /api/v1/projects/{projectId}/documents/{documentId}` (via `projectDocumentsApiService.deleteDocument`)

---

#### 2.7. Members (`/projects/:projectId/members`) — 🟡 PARTIAL
*Project membership management and role assignment.*

* **Status:** 🟡 **PARTIAL** (Member table with invite and remove connected to `projectsApiService`; initial member roster uses sample mock data).
* **Required Components:**
  * `ProjectMembersTable`: Member roster (Avatar, Name, Email, Roles: Admin, Member, Viewer).
  * `ProjectInviteMemberModal`: Modal to invite users and assign roles.
  * `RoleSelectDropdown`: Inline role change dropdown.
* **Buttons & Actions:**
  * `+ Add Member`: Invites user to project.
  * `Remove Member`: Removes user from project.
* **API Integrations:**
  * `GET /api/v1/users` (via `getUsers()`)
  * `GET /api/v1/projects/{projectId}/members` (via `projectsApiService.listMembers`)

---

#### 2.8. Project settings (`/projects/:projectId/settings` & Submenus) — 🟡 PARTIAL
*Comprehensive project configuration.*

* **Status:** 🟡 **PARTIAL** (General and Life cycle tabs update project via `updateProject`; modules, versions, and categories tabs use mock state).
* **Submenus:**
  1. `General` (`/settings`): Name, description, project identifier, public/private. (🟢 **DONE**)
  2. `Life cycle` (`/settings/life-cycle`): Status and target dates. (🟢 **DONE**)
  3. `Modules` (`/settings/modules`): Feature module checkboxes. (🟡 **PARTIAL**)
  4. `Custom fields` (`/settings/custom-fields`): Custom field configuration. (🟡 **PARTIAL**)
  5. `Versions` (`/settings/versions`): Release milestone management. (🟡 **PARTIAL**)
  6. `Categories` (`/settings/categories`): Internal work package categories. (🟡 **PARTIAL**)
* **Required Components:**
  * `ProjectSettingsWorkspace`: Tabbed settings container.
  * `ModulesToggleList`: Checkbox list to enable/disable modules.
  * `VersionManagementTable` + `VersionCreateModal`.
* **API Integrations:**
  * `GET /api/v1/projects/{projectId}` & `PUT /api/v1/projects/{projectId}` (via `getProject()` / `updateProject()`)
  * `GET /api/v1/projects/{projectId}/versions` (via `projectsApiService.listVersions`)

---

### 3. Global Controls & AppShell Utilities

#### 3.1. ProjectScopeSelector (Header Topbar) — 🟢 DONE
* Project dropdown selector allowing fast switching between active project workspaces or global scope.
* Fully connected to live `getProjects()`, synchronizing `projectId` URL parameters and sidebar trees.
* **API Integrations:**
  * `GET /api/v1/projects` (via `getProjects()`)

#### 3.2. GlobalSearch (Cmd+K Modal) — 🟢 DONE
* Instant omni-search modal searching across Work packages and Projects.
* Connected to live `getProjects()` and `getWorkItems()`, supporting keyboard navigation and automatic redirection.
* **API Integrations:**
  * `GET /api/v1/projects` (via `getProjects()`)
  * `GET /api/v1/work-items` (via `getWorkItems()`)

#### 3.3. NotificationCenter (Bell Icon Drawer) — 🟢 DONE
* Notification drawer displaying real-time task mentions, assignments, and updates.
* Connected to `notificationsApiService.markRead` with filter tabs (Unread/All) and pagination.
* **API Integrations:**
  * `PATCH /api/v1/notifications/{notificationId}/read` (via `notificationsApiService.markRead`)

#### 3.4. Session & User Profile (Avatar & Sign out) — 🟢 DONE
* Displays user initials, display name, and Sign Out action.
* Protected by `SessionGate` and live authenticated endpoints (`/api/v1/auth/me`, `/api/v1/auth/logout`).
* **API Integrations:**
  * `GET /api/v1/auth/me`
  * `POST /api/v1/auth/logout`

---

## Next Implementation Priorities

1. **Priority 1 (Quick Wins — Backend API Ready):**
   - Connect **Boards** (`ProjectBoard`) to `agileApiService` (`GET /boards`, `PATCH /move`).
   - Connect **Activity Feed** (`ProjectActivity`) to `activityFeedApiService.list`.
   - Connect **Wiki** (`ProjectWikiWorkspace`) to `wiki-pages` backend operations.
   - Connect **GlobalSearch** to `searchApiService.search`.
   - Connect **NotificationCenter** to `notificationsApiService`.
   - Connect **Documents** (`ProjectDocumentsPanel`) to `project-documents` API.

2. **Priority 2 (Core Enhancements):**
   - Build **Home Page Dashboard** (`HomePageContent`, metrics grid, recent projects).
   - Connect **My Time Tracking** to `time-entries` domain.
   - Connect **Project Settings Versions & Modules** to backend persistence.

3. **Priority 3 (New Backend Domains):**
   - Implement backend controllers for **Meetings**, **News**, **Portfolios**, and **Requirements**.

---
*Maintained under `docs/plan` in the Maru Task workspace.*
