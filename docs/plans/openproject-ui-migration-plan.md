# Implementation Plan: OpenProject UI Migration

Status: Active

## Goal

Migrate the user-facing UI from `openproject/frontend/src/app` into the current
Next.js application. The OpenProject frontend is the source of truth for
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

| OpenProject area             | Target implementation                                         | Status                               |
| ---------------------------- | ------------------------------------------------------------- | ------------------------------------ |
| Main menu and top bar        | `features/navigation/components/NavigationShell.tsx`          | Basic navigation shell               |
| Global search                | `features/search/components/GlobalSearch.tsx`                 | Presentation-only search interaction |
| Login and session gate       | `features/auth/components/`                                   | Implemented                          |
| Project overview             | `features/projects/components/ProjectWorkspaceOverview.tsx`   | Basic overview                       |
| Project navigation           | `features/projects/components/ProjectWorkspaceNavigation.tsx` | Implemented                          |
| Work package list and detail | `features/work-items/components/`                             | Basic list, edit form, and tabs      |
| Boards                       | `features/projects/components/ProjectBoard.tsx`               | Read-only/static lanes               |
| Calendar                     | `features/projects/components/ProjectCalendar.tsx`            | Basic/static view                    |
| Gantt                        | `features/projects/components/ProjectGantt.tsx`               | Basic/static view                    |
| Backlog and burndown         | `features/projects/components/ProjectBacklog.tsx`             | Presentation-only                    |
| Sprint list and create       | `features/sprints/components/`                                | Basic workflow                       |
| In-app notifications         | `features/notifications/components/NotificationCenter.tsx`    | Bell and filtered panel              |

### Partial Areas

| Area                 | OpenProject source breadth                          | Missing Next.js parity                                                                                                                                                                                                     |
| -------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work packages        | 137 component/template files                        | Query/filter builder, table/card/grid variants, inline editing, hierarchy, timeline, activity history, full comments, relations, attachments, watchers, labels, share, copy, reminders, timer, baselines, and bulk actions |
| Boards               | 20 component/template files                         | Board menu, filters, configuration, inline add, partition strategies, and drag/drop                                                                                                                                        |
| Notifications        | Bell, center, and 14 entry components               | Entry variants, read state, pagination, project/reason filters, and settings link                                                                                                                                          |
| Calendar             | Work package and team calendar components           | Team calendar, filters, and calendar authoring                                                                                                                                                                             |
| Backlogs and sprints | Burndown source plus work-package planning behavior | Reorder, sprint planning, detail/edit/delete, real burndown, and velocity behavior                                                                                                                                         |

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

**Description:** Build project wiki list/detail/editor and document list/upload
surfaces.

**Acceptance criteria:**

- [ ] Wiki has list, detail, create, edit, and missing-page states.
- [ ] Documents have list, upload progress, detail, and delete confirmation.

**Dependencies:** Wiki and project document BFF contracts.

#### Task 4.3: Membership, invitation, and user preferences

**Source:** `features/invite-user-modal/` and `features/user-preferences/`

**Description:** Build project member management, invitation workflow, and
user-facing preference surfaces.

**Acceptance criteria:**

- [ ] Membership list clearly distinguishes role and active state.
- [ ] Destructive member removal requires confirmation.
- [ ] Preferences use controlled, accessible form fields.

**Dependencies:** Project membership and user-management contracts; preference
backend contract must be confirmed before live wiring.

### Wave 5: Deferred OpenProject Modules

- [ ] Team planner from `features/team-planner/`.
- [ ] Admin query/settings from `features/admin/`.
- [ ] My page from `features/my-page/`.
- [ ] Job status from `features/job-status/`.

These modules require product-priority confirmation before implementation.

## Explicitly Out of Scope

- `features/bim/`: BIM, BCF, IFC viewer, and Revit integration.
- `features/enterprise/`: licensing and commercial enterprise UI.
- `features/plugins/`: OpenProject plugin runtime and extension lifecycle.
- Rails/Turbo-only UI that has no corresponding component in
  `openproject/frontend`; migrate only after a separate source-of-truth is
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
