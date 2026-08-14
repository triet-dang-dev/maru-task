# Auth Session Integration with .NET Backend

This document records the authentication contract implemented in `maru-task-be` and the corresponding frontend mapping. The backend remains the source of truth; this integration does not add fields or authorization rules that the backend does not publish.

## Contract matrix

| .NET behavior                                                                            | Frontend mapping                                                                                          | State                             |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `POST /auth/login/web-app` with `{ email, password }`                                    | `POST /api/auth/login/web-app`; validates the input, forwards it, and relays HTTP-only cookies            | Mapped                            |
| `POST /auth/register` with `{ email, displayName, role }`, protected by `CanWriteSystem` | `POST /api/auth/register` plus `registerUser()` service; no public registration page is exposed           | Mapped adapter                    |
| `POST /auth/refresh`, with access and refresh tokens read only from cookies              | `POST /api/auth/refresh`; browser clients perform one shared refresh after parallel `401`s and retry once | Mapped                            |
| `POST /auth/logout`, protected by `CanRead`, with no body                                | `POST /api/auth/logout`; an expired access token is refreshed before one logout retry                     | Mapped                            |
| `GET /auth/me`, protected by `CanRead`                                                   | `GET /api/auth/me`; current `{ success: true, data: true }` is represented by a neutral shell identity    | Mapped to current limited payload |
| `GET /auth/oidc/entra/start`                                                             | `GET /api/auth/oidc/entra/start`; redirect is relayed without server-side following                       | Mapped                            |
| `GET /auth/oidc/entra/callback`                                                          | `GET /api/auth/oidc/entra/callback`; query, cookies, and post-login redirect are relayed                  | Mapped                            |

## Cookie boundary

The browser talks only to the same-origin Next.js BFF. The BFF sends `Cookie` and the browser `User-Agent` to .NET for auth and protected resource requests.

The current backend emits:

| Flow                    | Cookies                      | Backend path | Frontend handling                                                                   |
| ----------------------- | ---------------------------- | ------------ | ----------------------------------------------------------------------------------- |
| Email login and refresh | `jwt_token`, `refresh_token` | `/auth`      | Rewritten to `/` because browser-facing routes live under `/api/auth` and `/api/v1` |
| Entra callback          | `jwt_token`, `refresh_token` | `/`          | Preserved                                                                           |
| Logout                  | Both cookies expired         | `/auth`      | Relayed and also expired at `/`                                                     |

`HttpOnly` and `SameSite=Strict` are preserved. `Secure` is preserved in production and removed only for non-production HTTP localhost-style development, because secure cookies cannot be stored over HTTP. The backend currently sets access-cookie expiry to 61 minutes, refresh-cookie expiry to 7 days, and signs the JWT for 60 minutes.

No browser code stores or decodes either token. All implemented `/api/v1/**` BFF calls forward the session cookie to .NET.

## Refresh behavior

1. A feature request receives `401`.
2. The browser calls `POST /api/auth/refresh` without a body.
3. The BFF forwards both cookies to `.NET POST /auth/refresh`.
4. .NET validates the expired access-token JTI and refresh-token hash, revokes the old pair, creates a new pair, and emits rotated cookies.
5. The BFF rewrites the backend cookie path for its browser-facing boundary and relays the cookies.
6. Parallel failed requests share one refresh attempt and retry once after success.
7. Rejected refresh is normalized to `401` and both browser cookies are expired.

The frontend never expects an access token in JSON. This matches `LoginResponse`, whose token fields are marked `JsonIgnore` in the backend.

## Microsoft Entra behavior implemented by .NET

- Only provider key `entra` is accepted.
- Discovery and authorization endpoints must be HTTPS.
- Authorization Code flow uses state, nonce, PKCE `S256`, and a ten-minute, single-use persisted authorization state.
- Requested scopes are `openid profile email`.
- The ID token is validated for signature, issuer, audience, lifetime, and nonce.
- Identity lookup uses the `(issuer, subject)` pair.
- A linked active user receives the same local JWT/refresh-cookie session as email login.
- Optional JIT creates a `Developer` only when JIT is enabled, the email is verified, and its domain is allowlisted.
- An existing local account with the same email is rejected until explicit account linking exists.

Required deployment values outside this frontend repository:

- Azure redirect URI and `.NET OIDC_ENTRA_REDIRECT_URI`: `https://<frontend-origin>/api/auth/oidc/entra/callback`
- `.NET Oidc__PostLoginRedirectUrl`: `https://<frontend-origin>/home`
- `.NET OIDC_ENTRA_ISSUER`, `OIDC_ENTRA_CLIENT_ID`, `OIDC_ENTRA_CLIENT_SECRET`
- Optional `.NET OIDC_ENTRA_ALLOWED_EMAIL_DOMAINS` and `OIDC_ENTRA_ENABLE_JIT_PROVISIONING`
- Frontend `USE_MOCK_API=false` and `DOTNET_API_BASE_URL=<raw-backend-origin>`

The committed backend `.env.example` still uses legacy `AZURE_*` names; runtime code reads `OIDC_ENTRA_*`. The frontend documents the runtime names but does not modify the backend file.

## Authorization mapping

JWT role claims contain numeric role codes:

- `1`: Admin
- `2`: Project Manager
- `3`: Developer
- `4`: Viewer

Backend policies remain authoritative:

- `CanRead`: all four roles
- `CanWrite`: Admin, Project Manager, Developer
- `CanWriteProject` and `CanDelete`: Admin, Project Manager
- `CanWriteSystem`, `CanDeleteSystem`, and `ManageUsers`: Admin only

The frontend does not infer authorization from route names. It forwards the cookie and preserves backend `401`/`403` outcomes. Role-based UI hiding remains pending because `/auth/me` does not return the role.

## Backend behavior intentionally not invented in FE

- `/auth/me` does not provide `userId`, `displayName`, email, or role. The shell therefore shows `Signed in user` with no role.
- `POST /auth/register` generates a password but does not return or email it, and the created local user is not marked email-confirmed. The adapter exists for contract completeness, but there is no registration UI.
- Explicit local-account-to-Entra linking has no backend endpoint.
- Entra JIT depends on an `email_verified` claim; tenant behavior must be verified with a real test identity.
- The backend records the BFF connection IP unless deployment infrastructure supplies and processes trusted forwarded headers.
- Azure cancellation/error presentation is still the backend's generic callback error response.
- Refresh requires both cookies, but the access cookie is deleted by the browser after 61 minutes while the refresh cookie lasts 7 days. Consequently, the current backend can rotate an expired JWT only during the roughly one-minute interval between the JWT's 60-minute expiry and the access cookie's expiry; a session idle for longer must sign in again. FE cannot extend this safely without a backend contract that refreshes from the refresh cookie alone or publishes refresh timing metadata.
- Live email-login, refresh/logout, and Azure tenant verification require runtime credentials and were not executed in the repository-only test run.

## Verification checklist

1. Start FE with `USE_MOCK_API=false` and the raw .NET origin.
2. Confirm email login cookies appear at browser path `/`, even though .NET emits `/auth`.
3. Confirm Entra redirects through the frontend callback and lands on `/home`.
4. Within the backend's one-minute refresh window, confirm an expired access token causes exactly one refresh request and the original resource call succeeds after cookie rotation.
5. Confirm a revoked/expired refresh pair clears both browser cookies and redirects back to login.
6. Confirm Viewer receives `403` for writes while Admin/Project Manager/Developer follow backend policy.
7. Confirm logout revokes the backend session and removes both browser cookies.
