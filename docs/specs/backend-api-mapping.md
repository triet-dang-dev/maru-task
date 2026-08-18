# .NET API to Frontend Mapping

The exhaustive source of truth is [Backend API Coverage and Frontend UI Backlog](./backend-api-coverage.md). It inventories all 73 method/path contracts directly from `maru-task-be` controllers and records transport plus UI coverage for each endpoint.

## Frontend transport model

- Browser code calls only same-origin Next.js endpoints.
- Current UI domains keep specialized adapters under `app/api/v1/auth`, `app/api/v1/projects`, `app/api/v1/users`, and `app/api/v1/work-items` so external `.NET` envelopes are validated and mapped to stable browser view models.
- API contracts without a current UI use the allowlisted `app/api/v1/[...path]` route. The route resolves only method/path pairs in `utils/backend-api-contracts.ts`, forwards the HTTP-only session cookie, preserves query/body/status, and never accepts an arbitrary upstream URL.
- `.NET` remains authoritative for resource authorization and domain validation.
- `USE_MOCK_API=true` returns `501 mock_not_implemented` for passthrough-only contracts. Set it to `false` when exercising the real backend.

## Work-item terminology

The frontend exposes `/api/v1/work-items`; the BFF maps it to `.NET /work-packages`.

- List, create, detail, PATCH/PUT, and delete have specialized adapters.
- Create comment/relation/watcher/attachment actions have specialized adapters because the current detail UI uses them.
- Remaining work-package commands are allowlisted passthrough contracts and are recorded as UI backlog in the coverage document.
- The FE-only `/api/v1/priorities` static catalog remains until BE publishes priority/status/type catalog endpoints.

## Authentication

Authentication uses a specialized cookie-session boundary rather than the generic passthrough. See [Auth Session Integration](./auth-session-integration.md) for login, refresh, logout, `/me`, Entra OIDC, cookie-path normalization, and known backend constraints.
