# Implementation Plan: OpenProject UI Migration

Status: Complete (2026-08-17)

## Goal

Migrate the user-facing UI from `docs/plans/frontend/src/app` into the current
Next.js application. The checked-in OpenProject frontend reference is the source of truth for
information architecture, interaction states, accessible semantics, and
component behavior. Maru Task retains its own Next.js, MUI, Tailwind, and .NET
BFF architecture.

## Scope Rules

- Migrate one independently testable UI slice at a time.
- Match OpenProject behavior before introducing Maru-specific variations.
- Keep presentation components separate from API services so static fixtures
  can be replaced by the existing BFF contracts later.
- Write a failing component or page test before every behavior change.
- Do not recreate OpenProject Rails/Turbo endpoints, HAL resources, or Angular
  infrastructure in Next.js.
- Do not migrate BIM, enterprise licensing, or plugin infrastructure unless the
  product scope explicitly expands to include them.

## Current Coverage

### Migrated Foundations

| OpenProject area             | Target implementation                                         | Status                                |
| ---------------------------- | ------------------------------------------------------------- | ------------------------------------- |
| Main menu and top bar        | `features/navigation/components/NavigationShell.tsx`          | Basic navigation shell                |
| Global search                | `features/search/components/GlobalSearch.tsx`                 | Presentation-only search interaction  |
| Login and session gate       | `features/auth/components/`                                   | Implemented                           |
| Project overview             | `features/projects/components/ProjectWorkspaceOverview.tsx`   | Basic overview                        |
| Project navigation           | `features/projects/components/ProjectWorkspaceNavigation.tsx` | Implemented                           |
| Work package list and detail | `features/work-items/components/`                             | Basic list, edit form, and tabs       |
| Boards                       | `features/projects/components/ProjectBoard.tsx`               | Read-only/static lanes                |
| Calendar                     | `features/projects/components/ProjectCalendar.tsx`            | Basic/static view                     |
| Gantt                        | `features/projects/components/ProjectGantt.tsx`               | Basic/static view                     |
| Backlog and burndown         | `features/projects/components/ProjectBacklog.tsx`             | Presentation-only                     |
| Team planner                 | `features/projects/components/ProjectTeamPlanner.tsx`         | Presentation layer and local UI state |
| Sprint list and create       | `features/sprints/components/`                                | Basic workflow                        |
| In-app notifications         | `features/notifications/components/NotificationCenter.tsx`    | Bell and filtered panel               |

### Partial Areas

| Area                 | OpenProject source breadth                          | Missing Next.js parity                                                                                                                                                                                                     |
| -------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work packages        | 137 component/template files                        | Query/filter builder, table/card/grid variants, inline editing, hierarchy, timeline, activity history, full comments, relations, attachments, watchers, labels, share, copy, reminders, timer, baselines, and bulk actions |
| Boards               | 20 component/template files                         | Board menu, filters, configuration, inline add, partition strategies, and drag/drop                                                                                                                                        |
| Notifications        | Bell, center, and 14 entry components               | Entry variants, read state, pagination, project/reason filters, and settings link                                                                                                                                          |
| Calendar             | Work package and team calendar components           | Team calendar, filters, and calendar authoring                                                                                                                                                                             |
| Backlogs and sprints | Burndown source plus work-package planning behavior | Reorder, sprint planning, detail/edit/delete, real burndown, and velocity behavior                                                                                                                                         |
| Team planner         | Resource timeline, quick add, and assignee controls | Live query/filter state, saved views, permission-aware drag/drop, date resizing, and BFF mutations                                                                                                                         |

## Migration Waves

### Wave 1: Complete Work Package Collaboration

#### Task 1.1: Activity timeline and comment history

**Status:** Complete (presentation layer, 2026-08-17)

**Source:** `features/work-packages/components/wp-single-view-tabs/activity-panel/`

**Description:** Replace the activity tab's comment form-only presentation with
an ordered activity timeline, loading/empty states, and comment entry anatomy
derived from OpenProject.

**Acceptance criteria:**

- [x] Activity tab has timeline, comment composer, loading, and empty states.
- [x] Entries expose actor, timestamp, action type, and comment body.
- [x] Component can accept fixture data without a network request.

**Verification:**

- [x] Focused Vitest component test passes.
- [x] `pnpm test`, `pnpm typecheck`, and `pnpm lint` pass.

**Dependencies:** None for presentation; API list contract is needed for live data.

#### Task 1.2: Relations list and dependency actions

**Status:** Complete (presentation layer, 2026-08-17)

**Source:** `features/work-packages/components/wp-relations/`

**Description:** Add relation rows grouped by relation type, with accessible
add/remove actions and empty state.

**Acceptance criteria:**

- [x] Relation tab lists grouped dependencies and linked work package IDs.
- [x] Existing add relation workflow remains available.
- [x] Remove action is intentionally deferred until API integration.

**Dependencies:** Task 1.1 is independent; may run in parallel.

#### Task 1.3: Files and watchers lists

**Status:** Complete (presentation layer, 2026-08-17)

**Source:** `wp-single-view-tabs/files-tab/` and `wp-single-view-tabs/watchers-tab/`

**Description:** Replace metadata-only forms with file and watcher list views,
empty states, and authoring controls.

**Acceptance criteria:**

- [x] Files tab displays file name, size, type, and upload state.
- [x] Watchers tab displays people and subscription state.
- [x] Empty states preserve the existing add/link actions.

**Dependencies:** None for presentation; live listing awaits backend read endpoints.

### Checkpoint: Work Package Collaboration

- [ ] All work-item tabs have loading, populated, empty, and error states.
- [ ] Existing work-item edit and create flows remain green.
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build` pass.

### Wave 2: Board and Planning Parity

#### Task 2.1: Board selector, filter, and empty state

**Status:** Complete (presentation layer, 2026-08-17)

**Source:** `features/boards/board/board-list/` and `board-filter/`

**Description:** Add board selection and filter controls around the current
board, preserving read-only behavior until real lane data is connected.

**Acceptance criteria:**

- [x] User can select a board and toggle supported filters in UI state.
- [x] Board content has loading and empty states.
- [x] Controls are keyboard accessible and labelled.

**Dependencies:** None for UI; `GET /api/v1/agile/boards` for live data.

#### Task 2.2: Board configuration and inline work package creation

**Status:** Complete (presentation layer, 2026-08-17)

**Source:** `features/boards/board/configuration-modal/` and `board/inline-add/`

**Description:** Add the configuration surface and inline-create affordance as
presentation components.

**Acceptance criteria:**

- [x] Configuration is a modal with explicit save/cancel states.
- [x] Inline creation validates required subject input.
- [x] No drag/drop mutation is enabled without write permission/API support.

**Dependencies:** Task 2.1.

#### Task 2.3: Backlog reorder and sprint planning UI

**Status:** Complete (presentation layer, 2026-08-17)

**Source:** OpenProject backlog planning behavior and burndown chart.

**Description:** Add ordered backlog controls and sprint planning panel to the
existing backlog route.

**Acceptance criteria:**

- [x] Backlog ordering UI is stable with keyboard alternatives.
- [x] Sprint assignment is represented as an explicit action/state.
- [x] Burndown supports loading, populated, and empty chart data.

**Dependencies:** `GET /api/v1/agile/backlogs`, reorder, and sprint contracts
for live behavior.

### Checkpoint: Planning

- [ ] Board and backlog work without static assumptions in component APIs.
- [ ] No write UI performs a mutation without permission-aware API wiring.
- [ ] Full quality gate passes.

### Wave 3: Notifications and Search Completion

#### Task 3.1: Notification entry parity

**Status:** Complete (presentation layer, 2026-08-17)

**Source:** `features/in-app-notifications/entry/`

**Description:** Add typed notification entry variants for assignment,
mentions, status changes, date alerts, reminders, and aggregated actors.

**Acceptance criteria:**

- [x] Entries convey read/unread state without relying on color alone.
- [x] Notification panel supports loading, empty, and pagination states.
- [x] Read action has a local optimistic-state boundary; read-all awaits API integration.

**Dependencies:** `GET /api/v1/notifications` and read contracts for live data.

#### Task 3.2: Global search result surface

**Status:** Complete (presentation layer, 2026-08-17)

**Source:** `core/global_search/input/`

**Description:** Add scoped result list, recent work packages, and keyboard
navigation to the existing global search control.

**Acceptance criteria:**

- [x] Search exposes project scope and work package result metadata.
- [x] Escape clears and closes search; Enter invokes the selected-result boundary.
- [x] Results have loading, empty, and error states.

**Dependencies:** `GET /api/v1/search` for live data.

### Wave 4: Missing Product Modules

#### Task 4.1: Time and cost entries

**Status:** Complete (presentation layer, 2026-08-17)

**Source note:** OpenProject `frontend` exposes time-entry resources and budget
graphs but no time/cost form or report page. The target presentation uses those
resource fields and existing Maru UI conventions; API integration remains
separate.

**Description:** Build work-item time/cost panels and project time-cost report.

**Acceptance criteria:**

- [x] Entry tables support list/create presentation and empty states; edit/delete await API integration.
- [x] Project report supports date range and totals presentation.

**Dependencies:** Time entry, cost entry, and report BFF contracts.

#### Task 4.2: Wiki and project documents

**Status:** Complete (presentation layer, 2026-08-17)

**Source note:** Project document rows follow OpenProject's shared attachment
list components. OpenProject `frontend` exposes a wiki HAL resource but no
wiki page/editor template, so the target wiki workspace is a minimal contract
based on the existing BFF routes and Maru UI conventions.

**Description:** Build project wiki list/detail/editor and document list/upload
surfaces.

**Acceptance criteria:**

- [x] Wiki has list, detail, edit, and missing-page states; create/save await API integration.
- [x] Documents have list, upload progress, and delete confirmation; detail/upload/delete await API integration.

**Dependencies:** Wiki and project document BFF contracts.

#### Task 4.3: Membership, invitation, and user preferences

**Status:** Complete (presentation layer, 2026-08-17)

**Source note:** OpenProject `frontend` supplies an invite trigger and user
preference state model. Its member widget loads a Turbo frame, so the target
member-table presentation follows the existing membership BFF contract and
Maru UI conventions.

**Source:** `features/invite-user-modal/` and `features/user-preferences/`

**Description:** Build project member management, invitation workflow, and
user-facing preference surfaces.

**Acceptance criteria:**

- [x] Membership list clearly distinguishes role and active state.
- [x] Destructive member removal requires confirmation.
- [x] Preferences use controlled, accessible form fields.

**Dependencies:** Project membership and user-management contracts; preference
backend contract must be confirmed before live wiring.

### Wave 5: Extended OpenProject Modules

#### Task 5.1: Team planner

**Status:** Complete (presentation layer, 2026-08-17)

**Source:** `docs/plans/frontend/src/app/features/team-planner/team-planner/`

**Description:** Add the OpenProject resource-timeline layout with assignee
rows, scheduled work-package cards, view ranges, quick-add search, and local
assignee controls.

**Acceptance criteria:**

- [x] Planner exposes Work week and 1/2/4/8-week ranges with previous, today, and next controls.
- [x] Assignee rows and scheduled cards use an accessible resource-timeline grid.
- [x] Add-existing search and add/remove assignee controls work in local UI state.
- [x] Loading, error, empty, desktop, and mobile overflow states are covered.
- [x] Focused tests, full quality gate, browser checks, and Lighthouse accessibility pass.

**Dependencies:** Live query/filter and saved-view contracts are still required.
Drag/drop, resize, and assignment mutations remain disabled until the BFF exposes
permission-aware write endpoints.

#### Task 5.2: Admin query settings

**Status:** Complete (presentation layer, 2026-08-17)

**Source:**
`docs/plans/frontend/src/app/features/admin/editable-query-props/` and
`docs/plans/frontend/src/app/features/work-packages/components/wp-table/configuration-modal/`

**Description:** Add the OpenProject editable-query bridge to project settings:
a serialized hidden query field and an Edit query action that opens the table
configuration modal for filters, columns, sorting, and display settings.

**Acceptance criteria:**

- [x] Project settings exposes the source-aligned Edit query action and serialized query value.
- [x] Table configuration includes Filters, Columns, Sort by, and Display settings tabs.
- [x] Apply commits draft changes while Cancel and close discard them.
- [x] The modal remains usable at 320 px and all controls have accessible names.
- [x] Focused tests, full quality gate, browser checks, Lighthouse, and performance trace pass.

**Dependencies:** Query persistence, available filter/column metadata, saved views,
and permission-aware validation still require BFF contracts. Until then the UI
uses local state and a representative query schema.

#### Task 5.3: My page

**Status:** Complete (presentation layer, 2026-08-17)

**Source:** `docs/plans/frontend/src/app/features/my-page/` and
`docs/plans/frontend/src/app/shared/components/grids/`

**Description:** Replace the empty dashboard with the OpenProject personal
grid: typed widgets for assigned work packages, spent time, favorite projects,
calendar, authored work packages, and custom text.

**Acceptance criteria:**

- [x] The `/my/page` route and primary navigation expose My page as the personal workspace.
- [x] Widget data enters through typed component props with loading, error, and empty states.
- [x] Users can add, remove, and keyboard-reorder widgets in local UI state.
- [x] The grid collapses to one column on mobile without clipping widget controls.
- [ ] Focused tests, full quality gate, browser checks, Lighthouse, and performance trace pass.

**Dependencies:** Grid persistence, widget-specific queries, drag/resize mutations,
and permission-aware configuration require BFF contracts. Local state is used
until those contracts exist.

#### Task 5.4: Job status source boundary

**Status:** Closed — no frontend UI to migrate (verified 2026-08-17)

**Source:** `docs/plans/frontend/src/app/features/job-status/`

**Decision:** The source contains only `JobStatusModalService`, which constructs
a Rails URL and asks `TurboRequestsService` to load a server-rendered stream.
There is no Angular component, template, or frontend interaction state to mirror,
and its only in-tree caller is the explicitly out-of-scope BIM export flow.

**Acceptance criteria:**

- [x] No invented standalone job-status page or modal is added without a frontend source.
- [x] The Rails/Turbo dependency is recorded as outside the current source-of-truth boundary.
- [x] Revisit only when an in-scope BFF job contract and frontend component exist.

### Wave 6: Visual & Functional Parity with OpenProject Frontend Source

#### Task 6.1: Work package table and card view switcher

**Status:** Complete (2026-08-17)

**Source:** `docs/plans/frontend/src/app/features/work-packages/components/wp-table/`,
`wp-card-view/`, `wp-view-select/`, `wp-buttons/`

**Description:** Provide Table view vs Card view switcher (`wp-card-view`), OpenProject
toolbar (+ Create button, view switcher, filter controls, column configuration), inline
create row at the bottom of the work package table, and status chips.

**Acceptance criteria:**

- [x] Work packages page supports Table and Card view modes.
- [x] Card view renders OpenProject `op-wp-single-card` structure (type, id, subject, status, assignee, dates, actions).
- [x] Inline create row at the bottom of the table supports quick creation with validation.
- [x] Split detail pane remains interactive across view modes.

#### Task 6.2: Work package single view and attribute groups

**Status:** Complete (2026-08-17)

**Source:** `docs/plans/frontend/src/app/features/work-packages/components/wp-single-view/`,
`wp-tabs/`, `edit-actions-bar/`, `wp-breadcrumb/`

**Description:** Align work package detail page with `wp-single-view` anatomy: breadcrumb,
type indicator, status button dropdown, info line, description area, organized attribute
groups (People, Dates & Progress, Details), sticky edit actions bar, and styled tabs.

**Acceptance criteria:**

- [x] Single view layout mirrors OpenProject header, status button, and metadata row.
- [x] Attribute groups clearly segment People, Dates & Progress, and Details.
- [x] Sticky edit actions bar offers Save and Cancel with icons.
- [x] Tab bar supports Overview, Activity, Files, Relations, Watchers, and Time & Cost.

#### Task 6.3: Kanban board cards and lane actions

**Status:** Complete (2026-08-17)

**Source:** `docs/plans/frontend/src/app/features/boards/board/board-list/`,
`wp-card-view/wp-single-card/`

**Description:** Align Kanban board cards with `op-wp-single-card` layout and add lane header
count badges, lane add buttons, lane action menu, and bottom inline card creation.

**Acceptance criteria:**

- [x] Board cards display top color strip, type tag, ID link, subject, assignee avatar, and due dates.
- [x] Lane headers include count badge and `+` add card button.
- [x] Inline card creation is available at the bottom of lanes.

#### Task 6.4: Navigation sidebar and overview layout alignment

**Status:** Complete (2026-08-17)

**Source:** `docs/plans/frontend/src/global_styles/layout/_main_menu.sass`,
`docs/plans/frontend/src/app/features/overview/`

**Description:** Align sidebar navigation active state indicator (4px solid left accent border)
and refine project workspace overview dashboard widgets.

**Acceptance criteria:**

- [x] Sidebar items use OpenProject active state indicator and layout tokens.
- [x] Overview dashboard presents project health, status distribution, members, and recent activity.

### Wave 7: Work Package Action Modals, Context Menu & Toaster System

#### Task 7.1: Work package action modals (Share, Reminder, Copy)

**Status:** Complete (2026-08-17)

**Source:** `docs/plans/frontend/src/app/features/work-packages/components/wp-share-modal/`,
`wp-reminder-modal/`, `wp-copy/`

**Description:** Add dedicated work package action modals matching OpenProject modal anatomy:
Share modal (link sharing and user permissions), Reminder modal (date/time presets and note),
and Copy modal (duplicate work package with copy options).

**Acceptance criteria:**

- [x] Share modal supports copyable link and collaborator permission assignment.
- [x] Reminder modal supports presets (Tomorrow, Next week) and custom date/time note.
- [x] Copy modal supports target project selection and selective cloning of relations/attachments.

#### Task 7.2: Stopwatch timer tracking button

**Status:** Complete (2026-08-17)

**Source:** `docs/plans/frontend/src/app/features/work-packages/components/wp-timer-button/`

**Description:** Provide real-time stopwatch time tracking button on work packages with start/stop
and elapsed time display.

**Acceptance criteria:**

- [x] Timer button toggles between start and active running timer state.
- [x] Stopping timer records time into work item time tracking.

#### Task 7.3: Context menu for work packages

**Status:** Complete (2026-08-17)

**Source:** `docs/plans/frontend/src/app/shared/components/op-context-menu/`

**Description:** Add quick context menu affordance for work package rows and cards.

**Acceptance criteria:**

- [x] Context menu exposes Open details, Timer, Reminder, Share, Duplicate, and Delete actions.

#### Task 7.4: OpenProject toaster notification system

**Status:** Complete (2026-08-17)

**Source:** `docs/plans/frontend/src/app/shared/components/toaster/`

**Description:** Global toaster notifications for action feedback with optional action triggers.

**Acceptance criteria:**

- [x] Global toast notifications support success, error, info, and warning states.

### Wave 8: Query Filters, Board Partitioning, User Popover & Help Texts

#### Task 8.1: Work package advanced query filter bar & builder

**Status:** Complete (2026-08-17)

**Source:** `docs/plans/frontend/src/app/features/work-packages/components/filters/query-filters/`

**Description:** Advanced query filter bar supporting dynamic multi-criteria filtering by field,
operator (`is`, `is not`, `contains`), and value selection with `+ Add filter` affordance.

**Acceptance criteria:**

- [x] Filter bar supports adding and removing dynamic criteria.
- [x] Filter criteria combine field, operator, and value matching.

#### Task 8.2: Board partitioning and add lane modal

**Status:** Complete (2026-08-17)

**Source:** `docs/plans/frontend/src/app/features/boards/board/add-list-modal/`

**Description:** Support multiple board partitioning types (Status, Assignee) and dynamic lane creation.

**Acceptance criteria:**

- [x] Add list modal allows picking an attribute to add a lane to the active board.
- [x] Board switching supports Status and Assignee partition strategies.

#### Task 8.3: User profile popover card

**Status:** Complete (2026-08-17)

**Source:** `docs/plans/frontend/src/app/shared/components/principal/`

**Description:** User profile popover card displaying avatar, email, project role, and quick actions.

**Acceptance criteria:**

- [x] Hovering or clicking user profile trigger presents popover with user details and actions.

#### Task 8.4: Attribute help texts tooltip system

**Status:** Complete (2026-08-17)

**Source:** `docs/plans/frontend/src/app/shared/components/attribute-help-texts/`

**Description:** Contextual attribute help text tooltips beside work package form labels.

**Acceptance criteria:**

- [x] Attribute help icons display tooltips explaining fields.

## Explicitly Out of Scope

- `features/bim/`: BIM, BCF, IFC viewer, and Revit integration.
- `features/enterprise/`: licensing and commercial enterprise UI.
- `features/plugins/`: OpenProject plugin runtime and extension lifecycle.
- Rails/Turbo-only UI that has no corresponding component in
  `docs/plans/frontend/src/app`; migrate only after a separate source-of-truth is
  agreed.

## Quality Gate Per Slice

- [ ] Add a failing focused test before implementation.
- [ ] Run the focused test after the first implementation edit.
- [ ] Run `pnpm test` after the slice is complete.
- [ ] Run `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
- [ ] Use browser verification with a dedicated test session when the route is
      protected by `SessionGate`.
- [ ] Keep static fixtures behind component props until the BFF contract is
      connected.

## Risks and Mitigations

| Risk                                                                     | Impact | Mitigation                                                                      |
| ------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------- |
| OpenProject behavior is implemented in Rails/Turbo, not Angular frontend | High   | Do not invent parity; agree an additional source of truth before implementation |
| Existing backend lacks read/list contracts for work-item subresources    | High   | Build presentation state only, then integrate when contract exists              |
| UI shape is coupled to static fixtures                                   | Medium | Require typed component props and loading/empty/error states                    |
| Permission behavior is unavailable from `/auth/me`                       | Medium | Keep write controls permission-ready; do not silently enable mutations          |
| Large source modules create unreviewable changes                         | Medium | Keep tasks S/M and validate each vertical slice independently                   |
