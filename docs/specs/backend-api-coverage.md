# Backend API Coverage and Frontend UI Backlog

Status: active migration contract  
Verified: 2026-08-13  
Backend source: `maru-task-be` controllers at commit `f9544ead75c5cf31add0bfcb3a5a5e875259f43a`

This is the exhaustive comparison between the API implemented by `.NET` and the current Next.js frontend. The backend is unchanged. The machine-readable counterpart is `utils/backend-api-contracts.ts`; a test requires every endpoint ID below to remain documented.

## Coverage summary

- 73 backend method/path contracts across 15 frontend domains.
- 22 contracts use specialized BFF adapters that validate or transform data for current UI flows.
- 51 contracts use the allowlisted catch-all BFF transport at `app/api/v1/[...path]/route.ts`.
- 19 contracts are used by live UI.
- 3 contracts are adapter-only; two are intentionally background/session operations.
- 5 contracts have an existing UI surface that is not yet connected to the backend endpoint.
- 45 contracts have no UI yet.
- 1 contract is infrastructure-only and should not have product UI.

Browser code must call the same-origin frontend paths below. The catch-all BFF is not an open proxy: method and path must match the explicit contract registry, numeric IDs must be positive, cookies stay HTTP-only, and authorization remains authoritative in `.NET`.

Legend:

- `live-ui`: used by the current product UI.
- `adapter-only`: mapped in FE but intentionally background-only or awaiting UI.
- `ui-not-integrated`: a related page exists but still renders local/static data.
- `no-ui`: endpoint is mapped at the BFF transport boundary and recorded for a later feature slice.
- `infrastructure`: operational endpoint; no product UI is expected.

## Specialized adapter audit

The adapters used by live UI were rechecked against the current C# request/response classes, rather than the older frontend assumptions:

- Project, sprint, and work-package lists now send the backend keyset fields `Take`, `Last…Id`, and `CursorAction`; they no longer send unsupported `Page`/`PageSize` query fields.
- Work-package list filters map `ProjectId`, `Status`, `Assignee`, `SortBy`, and `SortDir`. `ProjectId` remains optional at the BFF boundary, matching BE.
- Work-package create and PUT/PATCH accept all fields implemented by `CreateWorkPackageRequest` and `UpdateWorkPackageRequest`. The existing UI may continue to send a smaller subset.
- User list parses the actual `displayName` field and preserves role, role name, email-confirmation, last-login, and created-at data. The previous `name` parser would reject a real BE response.
- Project detail, sprint list, work-package summary/detail, comment, and attachment adapters preserve response fields that were previously dropped.
- Sprint dates, relation type, and attachment size now enforce the same validation direction as the C# validators.

Passthrough contracts preserve the backend status, content type, and response body. `USE_MOCK_API=true` intentionally returns `501 mock_not_implemented` for these deferred-UI contracts instead of inventing product data.

## Activity feed

- `activity-feed.list` — `GET /activity-feed` → `GET /api/v1/activity-feed`; `CanRead`; passthrough; `no-ui`. Build a scoped/cursor activity panel later.

## Agile

- `agile.backlogs.list` — `GET /agile/backlogs` → `GET /api/v1/agile/backlogs`; `CanRead`; passthrough; `no-ui`.
- `agile.backlogs.reorder` — `PATCH /agile/backlogs/reorder` → `PATCH /api/v1/agile/backlogs/reorder`; `CanWriteProject`; passthrough; `no-ui`.
- `agile.boards.get` — `GET /agile/boards` → `GET /api/v1/agile/boards`; `CanRead`; passthrough; `ui-not-integrated`. Replace static lanes on the existing board page.
- `agile.boards.active-sprint` — `GET /agile/sprints/active/board` → `GET /api/v1/agile/sprints/active/board`; `CanRead`; passthrough; `ui-not-integrated`.
- `agile.sprints.burndown` — `GET /agile/sprints/{sprintId}/burndown` → `GET /api/v1/agile/sprints/{sprintId}/burndown`; `CanRead`; passthrough; `no-ui`.
- `agile.boards.move` — `PATCH /agile/boards/move` → `PATCH /api/v1/agile/boards/move`; `CanWriteProject`; passthrough; `ui-not-integrated`. Add board drag/drop only after loading real lanes and permissions.

## Authentication and OIDC

- `auth.login` — `POST /auth/login/web-app` → `POST /api/auth/login/web-app`; anonymous; specialized; `live-ui`.
- `auth.register` — `POST /auth/register` → `POST /api/auth/register`; `CanWriteSystem`; specialized; `adapter-only`. Add only inside a future Admin user-management UI.
- `auth.refresh` — `POST /auth/refresh` → `POST /api/auth/refresh`; anonymous cookie rotation; specialized; `adapter-only` by design.
- `auth.logout` — `POST /auth/logout` → `POST /api/auth/logout`; `CanRead`; specialized; `live-ui`.
- `auth.me` — `GET /auth/me` → `GET /api/auth/me`; `CanRead`; specialized; `live-ui`, but BE currently returns only `data: true`.
- `auth.oidc.start` — `GET /auth/oidc/{provider}/start` → `GET /api/auth/oidc/{provider}/start`; anonymous; specialized; `live-ui`.
- `auth.oidc.callback` — `GET /auth/oidc/{provider}/callback` → `GET /api/auth/oidc/{provider}/callback`; anonymous; specialized; `live-ui`.

See `auth-session-integration.md` for cookie, Entra, and refresh constraints.

## Cost entries

- `cost-entries.create` — `POST /cost-entries/work-packages/{workPackageId}` → same path below `/api/v1`; `CanWrite`; passthrough; `no-ui`.
- `cost-entries.update` — `PATCH /cost-entries/work-packages/{workPackageId}/{costEntryId}` → same path below `/api/v1`; `CanWrite`; passthrough; `no-ui`.
- `cost-entries.delete` — `DELETE /cost-entries/work-packages/{workPackageId}/{costEntryId}` → same path below `/api/v1`; `CanWrite`; passthrough; `no-ui`.
- `cost-entries.by-work-item` — `GET /cost-entries/work-packages/{workPackageId}` → same path below `/api/v1`; `CanRead`; passthrough; `no-ui`.
- `cost-entries.by-project` — `GET /cost-entries/projects/{projectId}` → same path below `/api/v1`; `CanRead`; passthrough; `no-ui`.
- `cost-entries.by-actor` — `GET /cost-entries/actors/{actorUserId}` → same path below `/api/v1`; `CanRead`; passthrough; `no-ui`.

## Health

- `health.get` — `GET /api/health` → `GET /api/v1/health`; public; passthrough; `infrastructure`. Use for deployment probes, not product UI.

## Navigation

- `navigation.get` — `GET /navigation` → `GET /api/v1/navigation`; `CanRead`; passthrough; `ui-not-integrated`. Replace the local `NavigationShell` menu after `/auth/me` and module visibility behavior are agreed.

## Notifications

- `notifications.list` — `GET /notifications` → `GET /api/v1/notifications`; `CanRead`; passthrough; `no-ui`.
- `notifications.read` — `PATCH /notifications/{notificationId}/read` → same path below `/api/v1`; `CanRead`; passthrough; `no-ui`.
- `notifications.read-all` — `PATCH /notifications/read-all` → same path below `/api/v1`; `CanRead`; passthrough; `no-ui`.

## Projects and membership

- `projects.list` — `GET /projects` → `GET /api/v1/projects`; `CanWriteSystem`; specialized; `live-ui`. Policy currently means Admin-only even though the page is part of the main navigation.
- `projects.detail` — `GET /projects/{projectId}` → `GET /api/v1/projects/{projectId}`; `CanRead`; specialized; `live-ui`.
- `projects.members.list` — `GET /projects/{projectId}/members` → same path below `/api/v1`; `CanWriteProject`; passthrough; `no-ui`.
- `projects.members.add` — `POST /projects/{projectId}/members` → same path below `/api/v1`; `CanWriteProject`; passthrough; `no-ui`.
- `projects.members.update` — `PATCH /projects/{projectId}/members/{userId}` → same path below `/api/v1`; `CanWriteProject`; passthrough; `no-ui`.
- `projects.members.remove` — `DELETE /projects/{projectId}/members/{userId}` → same path below `/api/v1`; `CanWriteProject`; passthrough; `no-ui`.

## Reports

- `reports.time-cost` — `GET /reports/projects/{projectId}/time-cost` → same path below `/api/v1`; `CanRead`; passthrough; `no-ui`.

## Search

- `search.get` — `GET /search` → `GET /api/v1/search`; `CanRead`; passthrough; `no-ui`.

## Sprints

- `sprints.list` — `GET /projects/{projectId}/sprints` → same path below `/api/v1`; `CanRead`; specialized; `live-ui`.
- `sprints.create` — `POST /projects/{projectId}/sprints` → same path below `/api/v1`; `CanWriteProject`; specialized; `live-ui`.
- `sprints.detail` — `GET /projects/{projectId}/sprints/{sprintId}` → same path below `/api/v1`; `CanRead`; passthrough; `no-ui`.
- `sprints.update.put` — `PUT /projects/{projectId}/sprints/{sprintId}` → same path below `/api/v1`; `CanWriteProject`; passthrough; `no-ui`.
- `sprints.update.patch` — `PATCH /projects/{projectId}/sprints/{sprintId}` → same path below `/api/v1`; `CanWriteProject`; passthrough; `no-ui`.
- `sprints.delete` — `DELETE /projects/{projectId}/sprints/{sprintId}` → same path below `/api/v1`; `CanWriteProject`; passthrough; `no-ui`.

## Time entries

- `time-entries.create` — `POST /time-entries/work-packages/{workPackageId}` → same path below `/api/v1`; `CanWrite`; passthrough; `no-ui`.
- `time-entries.update` — `PATCH /time-entries/work-packages/{workPackageId}/{timeEntryId}` → same path below `/api/v1`; `CanWrite`; passthrough; `no-ui`.
- `time-entries.delete` — `DELETE /time-entries/work-packages/{workPackageId}/{timeEntryId}` → same path below `/api/v1`; `CanWrite`; passthrough; `no-ui`.
- `time-entries.by-work-item` — `GET /time-entries/work-packages/{workPackageId}` → same path below `/api/v1`; `CanRead`; passthrough; `no-ui`.
- `time-entries.by-project` — `GET /time-entries/projects/{projectId}` → same path below `/api/v1`; `CanRead`; passthrough; `no-ui`.
- `time-entries.by-actor` — `GET /time-entries/actors/{actorUserId}` → same path below `/api/v1`; `CanRead`; passthrough; `no-ui`.

## User management

- `users.list` — `GET /users` → `GET /api/v1/users`; `ManageUsers`; specialized; `live-ui` as the assignee picker. This is a contract mismatch for non-Admin writers.
- `users.detail` — `GET /users/{userId}` → same path below `/api/v1`; `ManageUsers`; passthrough; `no-ui`.
- `users.update` — `PUT /users/{userId}` → same path below `/api/v1`; `ManageUsers`; passthrough; `no-ui`.
- `users.delete` — `DELETE /users/{userId}` → same path below `/api/v1`; `ManageUsers`; passthrough; `no-ui`.
- `users.invite` — `POST /users/invite` → `POST /api/v1/users/invite`; `ManageUsers`; passthrough; `no-ui`.

## Wiki

- `wiki.create` — `POST /projects/{projectId}/wiki/pages` → same path below `/api/v1`; `CanWrite`; passthrough; `no-ui`.
- `wiki.list` — `GET /projects/{projectId}/wiki/pages` → same path below `/api/v1`; `CanRead`; passthrough; `no-ui`.
- `wiki.detail` — `GET /projects/{projectId}/wiki/pages/{slug}` → same path below `/api/v1`; `CanRead`; passthrough; `no-ui`.
- `wiki.update` — `PATCH /projects/{projectId}/wiki/pages/{slug}` → same path below `/api/v1`; `CanWrite`; passthrough; `no-ui`.

## Work items (`work-packages` in BE)

The frontend keeps the user-facing term `work-items`; the BFF maps it to `.NET /work-packages`.

- `work-items.create` — `POST /work-packages` → `POST /api/v1/work-items`; `CanWrite`; specialized; `live-ui`.
- `work-items.update.put` — `PUT /work-packages/{id}` → `PUT /api/v1/work-items/{workItemId}`; `CanWrite`; specialized; `adapter-only` alias.
- `work-items.update.patch` — `PATCH /work-packages/{id}` → `PATCH /api/v1/work-items/{workItemId}`; `CanWrite`; specialized; `live-ui`.
- `work-items.delete` — `DELETE /work-packages/{id}` → `DELETE /api/v1/work-items/{workItemId}`; `CanWriteProject`; specialized; `live-ui`.
- `work-items.list` — `GET /work-packages` → `GET /api/v1/work-items`; `CanRead`; specialized; `live-ui`.
- `work-items.detail` — `GET /work-packages/{id}` → `GET /api/v1/work-items/{workItemId}`; `CanRead`; specialized; `live-ui`.
- `work-items.comments.create` — `POST /work-packages/{id}/comments` → `POST /api/v1/work-items/{workItemId}/comments`; `CanWrite`; specialized; `live-ui`.
- `work-items.comments.update.put` — `PUT /work-packages/{id}/comments/{commentId}` → `PUT /api/v1/work-items/{workItemId}/comments/{commentId}`; `CanWrite`; passthrough; `no-ui`.
- `work-items.comments.update.patch` — `PATCH /work-packages/{id}/comments/{commentId}` → `PATCH /api/v1/work-items/{workItemId}/comments/{commentId}`; `CanWrite`; passthrough; `no-ui`.
- `work-items.comments.delete` — `DELETE /work-packages/{id}/comments/{commentId}` → `DELETE /api/v1/work-items/{workItemId}/comments/{commentId}`; `CanWrite`; passthrough; `no-ui`.
- `work-items.relations.add` — `POST /work-packages/{id}/relations` → `POST /api/v1/work-items/{workItemId}/relations`; `CanWriteProject`; specialized; `live-ui`.
- `work-items.relations.remove` — `DELETE /work-packages/{id}/relations/{relationId}` → `DELETE /api/v1/work-items/{workItemId}/relations/{relationId}`; `CanWriteProject`; passthrough; `no-ui`.
- `work-items.watchers.add` — `POST /work-packages/{id}/watchers` → `POST /api/v1/work-items/{workItemId}/watchers`; `CanWrite`; specialized; `live-ui`.
- `work-items.watchers.remove` — `DELETE /work-packages/{id}/watchers/{userId}` → `DELETE /api/v1/work-items/{workItemId}/watchers/{userId}`; `CanWrite`; passthrough; `no-ui`.
- `work-items.attachments.add` — `POST /work-packages/{id}/attachments` → `POST /api/v1/work-items/{workItemId}/attachments`; `CanWrite`; specialized; `live-ui` for linking metadata.
- `work-items.attachments.upload-url` — `POST /work-packages/{id}/attachments/upload-url` → `POST /api/v1/work-items/{workItemId}/attachments/upload-url`; `CanWrite`; passthrough; `ui-not-integrated`.
- `work-items.attachments.remove` — `DELETE /work-packages/{id}/attachments/{attachmentId}` → `DELETE /api/v1/work-items/{workItemId}/attachments/{attachmentId}`; `CanWrite`; passthrough; `no-ui`.
- `work-items.labels.add` — `POST /work-packages/{id}/labels` → `POST /api/v1/work-items/{workItemId}/labels`; `CanWrite`; passthrough; `no-ui`.
- `work-items.labels.remove` — `DELETE /work-packages/{id}/labels/{labelId}` → `DELETE /api/v1/work-items/{workItemId}/labels/{labelId}`; `CanWrite`; passthrough; `no-ui`.

## Recommended UI migration order

1. Resolve authorization/data blockers before expanding UI:
   - `/auth/me` must eventually expose identity and role for role-aware navigation and actions.
   - `GET /projects` is `CanWriteSystem` (Admin-only), while project pages are in the common shell.
   - `GET /users` is `ManageUsers` (Admin-only), but the work-item assignee picker calls it for all writers.
2. Connect existing static surfaces:
   - Agile board read/move APIs.
   - Backend navigation modules.
   - Attachment upload-url flow.
   - Replace static Calendar/Gantt data using work-item queries; BE has no dedicated Calendar/Gantt endpoints.
3. Complete existing domains:
   - Sprint detail/edit/delete and burndown.
   - Project membership management.
   - Work-item comment/relation/watcher/attachment removal and labels.
4. Add missing product modules:
   - Notifications and activity feed.
   - Global search.
   - Time entries, cost entries, and time-cost reporting.
   - Wiki.
   - Admin user detail/update/invite/delete.

## Backend gaps that FE must not invent

- No project create/update/delete endpoints.
- No read/list endpoints for work-item comments, relations, watchers, attachments, or labels; current detail only exposes counts/summary fields.
- No priority, status, or work-item type catalog endpoints. `/api/v1/priorities` is currently an explicit FE-only static catalog.
- No dedicated Calendar or Gantt endpoints.
- No Wiki delete endpoint.
- `UpdateWorkPackageRequest` uses nullable value types as patch presence checks. Sending `null` cannot currently clear assignee, sprint, parent, due date, or numeric estimate fields; BE treats those values as not supplied.
- `/auth/me` is still a TODO payload.
- Refresh requires both cookies and has the timing limitation documented in `auth-session-integration.md`.

These items remain backlog notes only. They are not emulated or guessed by the frontend.
