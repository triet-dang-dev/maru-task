# Wave 0 migration scaffold

## Source-to-target mapping

- `app/` owns routes, loaders, page-level composition, and BFF route handlers under `app/api/**/route.ts`.
- `features/` owns vertical slices such as `features/work-items/` with UI, service, schema, and types.
- `services/api/` remains the HTTP boundary convention for browser-safe error normalization and request IDs.
- `utils/env.server.ts` validates server-only BFF, auth, and .NET API configuration.
- `.NET 10` owns the production API contract; Next.js never calls Rails, API v3, HAL, or Turbo endpoints.

## BFF and auth design

- Browser requests use same-origin Next.js routes such as `/api/v1/work-items`.
- Next.js route handlers call the .NET API server-to-server using server-only environment variables.
- Authentication follows the implemented backend routes: email/password login at `POST /auth/login/web-app`, Microsoft Entra OIDC at `GET /auth/oidc/entra/start` and `GET /auth/oidc/entra/callback`, plus `refresh`, `logout`, and `me` under `/auth`.
- The same-origin auth BFF relays OIDC redirects and the backend `jwt_token`/`refresh_token` HTTP-only cookies. Browser code does not store or decode tokens.
- Email-login and refresh cookies emitted at backend path `/auth` are normalized to `/` at the browser-facing BFF boundary. A shared cookie-only refresh attempt retries concurrent `401` requests once.
- The current backend `/auth/me` response confirms authorization with `data: true` but does not publish user details. The shell uses a neutral identity until `userId`, `displayName`, and `role` are implemented by the backend.
- Every backend method/path contract is registered in `utils/backend-api-contracts.ts`. Specialized routes serve existing UI; the explicit allowlisted catch-all maps endpoints that have no UI yet. See `backend-api-coverage.md` for the exhaustive 73-contract coverage and backlog.

## Initial vertical slice inventory

- User journey: open a project and view a read-only list of work items.
- Legacy evidence: OpenProject project/work package list semantics, filters, sorting, empty states, and permission boundaries.
- Permissions: view-only access for users with read access to the project; unauthorized users receive a 403-style BFF result.
- Rules: the BFF validates the upstream response and returns a stable UI view model.
- Edge cases: empty project, inaccessible project, pagination, server error, and loading state.

## Implemented .NET work-package mapping

### Endpoint

- `GET /work-packages?ProjectId={projectId}&Take={take}&LastWorkPackageId={cursor}&CursorAction={next|previous}`
- `POST /work-packages`
- `GET /work-packages/{id}`
- `PUT|PATCH /work-packages/{id}` with every mutable field implemented by `UpdateWorkPackageRequest`

The .NET API returns an envelope shaped as `{ success, errorCode, data }`. The Next.js BFF validates and unwraps that envelope before returning the browser view model from `GET /api/v1/work-items`.

### Query parameters

- `ProjectId` (integer, optional; the current project UI supplies it)
- `Take` (integer from `1` to `100`, default `20`)
- `LastWorkPackageId` (positive integer cursor, optional)
- `CursorAction` (`next` or `previous`; `previous` requires a cursor)
- `Status`, `Assignee`, `SortBy`, `SortDir` (optional)

### Success response `200`

```json
{
  "items": [
    {
      "assignee": "Jamie Lee",
      "assigneeUserId": "7",
      "id": "101",
      "priority": "Normal",
      "projectId": "42",
      "projectName": "Migration",
      "subject": "Implement authentication shell",
      "status": "In Progress",
      "updatedAt": "2026-08-12T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

`type` is absent from the .NET work-package summary response and is therefore not rendered in the migrated list. The detail response does include `type`. See `backend-api-coverage.md` for all available .NET domains and UI gaps.

### Error responses

- `401`: `unauthorized`
- `403`: `forbidden`
- `409`: `concurrency_conflict`
- `422`: `validation_failed`
- `502`: `upstream_work_items_unavailable` when the .NET API cannot be reached

```json
{
  "error": "forbidden",
  "message": "You do not have permission to access work items.",
  "requestId": "uuid"
}
```

The BFF preserves the documented upstream status for `401`, `403`, `409`, and `422`, but never forwards upstream response bodies. It returns `502` for an unreachable upstream service and includes the generated `requestId` in both the response body and `X-Request-ID` header.

The current update DTO has no version token or ETag. A returned `409` is mapped to `concurrency_conflict`, but optimistic updates remain out of scope until .NET publishes a versioned concurrency contract.

## Notes

- No Rails, Ruby, API v3, HAL, or Turbo contracts are used in the target.
- The BFF is the only browser-facing integration boundary.
