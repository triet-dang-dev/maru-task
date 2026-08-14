# Spec: Enterprise Frontend Boilerplate

Status: Review draft
Date: 2026-07-08
Repository: /Users/kadang/Documents/boilerplate-react

## Assumptions

1. This is a greenfield scaffold in an otherwise empty repository.
2. The package manager will be pnpm via Corepack, using the locally available pnpm 10.12.1.
3. Source folders will be top-level folders to match the requested `/app`, `/components`, `/hooks`, `/services`, `/stores`, `/utils`, and `/types` structure.
4. The app will default to Server Components, SSR, and SSG. Client Components will be used only for browser-only state, providers, form controls, and interactive UI.
5. Auth refresh handling stores neither access nor refresh tokens in browser storage. The backend owns both HTTP-only cookies and rotates them through its refresh endpoint.
6. Tailwind CSS v4 and MUI v9 compatibility will use CSS cascade layers, with the `mui` layer before the `utilities` layer so Tailwind utilities can override MUI defaults.
7. The first implementation will include a representative sample page, not a product-specific domain feature.

## Objective

Build an enterprise-grade Next.js frontend boilerplate that is scalable, performant, secure by default, and adaptable to modern web applications.

The boilerplate should give teams:

- A current Next.js App Router foundation with strong defaults for SSR, SSG, metadata, routing, and error fallbacks.
- A stable data layer with TanStack Query for server state, caching, retries, stale time, and SSR-aware client setup.
- A design-system base using MUI for accessible primitives and Tailwind CSS for local utility overrides.
- A secure networking layer with Axios request/response interceptors, timeout handling, normalized errors, and single-flight cookie-session refresh handling.
- Lightweight client state with Zustand.
- Form primitives that integrate React Hook Form and Zod with low re-render cost.
- Code quality automation through ESLint, Prettier, Husky, lint-staged, and focused tests.

## Tech Stack

Versions below were verified from the npm registry on 2026-07-08.

Runtime and framework:

- Node.js: >=20.9.0, matching current Next.js minimum.
- Next.js: 16.2.11
- React: 19.2.7
- React DOM: 19.2.7
- TypeScript: 7.0.2
- pnpm: 10.12.1

UI and styling:

- Tailwind CSS: 4.3.2
- @tailwindcss/postcss: 4.3.2
- MUI: @mui/material 9.2.0
- @mui/material-nextjs: 9.1.1
- Emotion: @emotion/react 11.14.0, @emotion/styled 11.14.1
- lucide-react: 1.23.0
- clsx: 2.1.1
- tailwind-merge: 3.6.0

State, data, forms, and API:

- @tanstack/react-query: 5.101.2
- @tanstack/react-table: 8.21.3
- axios: 1.18.1
- zustand: 5.0.14
- react-hook-form: 7.81.0
- @hookform/resolvers: 5.4.0
- zod: 4.4.3
- react-hot-toast: 2.6.0

Quality and tests:

- ESLint: 10.6.0
- eslint-config-next: 16.2.10
- @tanstack/eslint-plugin-query: 5.101.2
- Prettier: 3.9.4
- Husky: 9.1.7
- lint-staged: 17.0.8
- Vitest: 4.1.10
- jsdom: 29.1.1
- Testing Library React: 16.3.2
- Testing Library jest-dom: 6.9.1
- Testing Library user-event: 14.6.1

## Commands

Install:

```bash
corepack pnpm install
```

Development:

```bash
corepack pnpm dev
```

Production build:

```bash
corepack pnpm build
```

Production start:

```bash
corepack pnpm start
```

Lint:

```bash
corepack pnpm lint
```

Fix lint issues:

```bash
corepack pnpm lint:fix
```

Format:

```bash
corepack pnpm format
```

Check formatting:

```bash
corepack pnpm format:check
```

Type check:

```bash
corepack pnpm typecheck
```

Unit and component tests:

```bash
corepack pnpm test
```

Coverage:

```bash
corepack pnpm test:coverage
```

## Project Structure

```text
.
|-- app/
|   |-- error.tsx
|   |-- global-error.tsx
|   |-- globals.css
|   |-- layout.tsx
|   |-- loading.tsx
|   |-- not-found.tsx
|   |-- page.tsx
|   `-- providers.tsx
|-- components/
|   |-- common/
|   |   |-- AppToast.tsx
|   |   `-- EmptyState.tsx
|   `-- ui/
|       |-- Button/
|       |-- CheckboxField/
|       |-- DataTable/
|       |-- InputField/
|       |-- Modal/
|       `-- SelectBox/
|-- features/
|   `-- example/
|       |-- components/
|       |-- hooks/
|       |-- schemas/
|       |-- services/
|       `-- types.ts
|-- hooks/
|-- providers/
|   |-- MuiProvider.tsx
|   `-- QueryProvider.tsx
|-- services/
|   |-- api/
|   |   |-- api-client.ts
|   |   |-- api-error.ts
|   |   |-- auth-token.ts
|   |   `-- refresh-token.ts
|   `-- query/
|       `-- query-client.ts
|-- stores/
|   `-- use-ui-store.ts
|-- theme/
|   `-- theme.ts
|-- types/
|   |-- api.ts
|   `-- index.ts
|-- utils/
|   |-- cn.ts
|   `-- env.ts
|-- public/
|-- tests/
|   `-- setup.ts
|-- docs/
|-- .env.example
|-- .gitignore
|-- eslint.config.mjs
|-- next-env.d.ts
|-- next.config.ts
|-- package.json
|-- postcss.config.mjs
|-- prettier.config.mjs
|-- tsconfig.json
`-- vitest.config.ts
```

Feature modules own feature-specific components, hooks, schemas, services, and types. Top-level folders own reusable platform code.

## Proposed package.json

```json
{
  "name": "enterprise-frontend-boilerplate",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@10.12.1",
  "engines": {
    "node": ">=20.9.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier . --write",
    "format:check": "prettier . --check",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "prepare": "husky"
  },
  "dependencies": {
    "@emotion/react": "11.14.0",
    "@emotion/styled": "11.14.1",
    "@hookform/resolvers": "5.4.0",
    "@mui/material": "9.2.0",
    "@mui/material-nextjs": "9.1.1",
    "@tanstack/react-query": "5.101.2",
    "@tanstack/react-table": "8.21.3",
    "axios": "1.18.1",
    "clsx": "2.1.1",
    "lucide-react": "1.23.0",
    "next": "16.2.10",
    "react": "19.2.7",
    "react-dom": "19.2.7",
    "react-hook-form": "7.81.0",
    "react-hot-toast": "2.6.0",
    "tailwind-merge": "3.6.0",
    "zod": "4.4.3",
    "zustand": "5.0.14"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "4.3.2",
    "@tanstack/eslint-plugin-query": "5.101.2",
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "16.3.2",
    "@testing-library/user-event": "14.6.1",
    "@types/node": "26.1.1",
    "@types/react": "19.2.17",
    "@types/react-dom": "19.2.3",
    "eslint": "10.6.0",
    "eslint-config-next": "16.2.10",
    "husky": "9.1.7",
    "jsdom": "29.1.1",
    "lint-staged": "17.0.8",
    "postcss": "8.5.16",
    "prettier": "3.9.4",
    "tailwindcss": "4.3.2",
    "typescript": "7.0.2",
    "vitest": "4.1.10"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

## Core Configuration

MUI plus Tailwind CSS compatibility:

- `app/layout.tsx` uses `AppRouterCacheProvider` from `@mui/material-nextjs/v16-appRouter`.
- `AppRouterCacheProvider` receives `options={{ enableCssLayer: true }}` so generated MUI styles are wrapped in `@layer mui`.
- `app/globals.css` starts with:

```css
@layer theme, base, mui, components, utilities;
@import "tailwindcss";
```

- Base components accept `className` and `slotProps` so Tailwind utilities can target both roots and MUI interior slots.
- No Tailwind prefix is planned because cascade layers satisfy the override requirement more cleanly.

TanStack Query provider:

- `services/query/query-client.ts` exports a browser-stable query client and a server-per-request query client.
- Default stale time will be above zero to avoid immediate client refetch after SSR hydration.
- `app/providers.tsx` composes Query, MUI, and Toast providers in one client boundary.

Axios interceptors:

- `services/api/api-client.ts` creates a configured Axios instance with `baseURL`, `timeout`, JSON headers, `withCredentials`, and request IDs.
- Response interceptor normalizes API errors.
- 401 responses trigger a single-flight refresh queue so parallel failed requests wait for one refresh attempt.
- Failed refresh broadcasts session expiry and rejects queued requests; no browser-readable credentials are maintained.

Environment variables:

- `.env.example` documents public and server-only variables.
- Only `NEXT_PUBLIC_*` variables may be read by client components.
- Runtime secrets stay server-only.
- `.env*` files stay ignored except intentionally committed examples.

## Code Style

Components prefer composition, forward refs, explicit `className`, and prop spreading.

```tsx
import { forwardRef } from "react";
import MuiButton, { type ButtonProps as MuiButtonProps } from "@mui/material/Button";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/utils/cn";

type ButtonVariant = "solid" | "outline" | "ghost";

export interface ButtonProps extends Omit<MuiButtonProps, "variant"> {
  isLoading?: boolean;
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, className, disabled, isLoading = false, startIcon, variant = "solid", ...props },
    ref,
  ) => (
    <MuiButton
      ref={ref}
      disabled={disabled || isLoading}
      startIcon={isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : startIcon}
      className={cn(
        "min-h-10 rounded-md px-4 text-sm font-medium normal-case shadow-none",
        variant === "solid" && "bg-slate-950 text-white hover:bg-slate-800",
        variant === "outline" &&
          "border border-slate-300 bg-white text-slate-950 hover:bg-slate-50",
        variant === "ghost" && "bg-transparent text-slate-700 hover:bg-slate-100",
        className,
      )}
      {...props}
    >
      {children}
    </MuiButton>
  ),
);

Button.displayName = "Button";
```

## Testing Strategy

- Unit and component tests use Vitest, jsdom, and Testing Library.
- Tests live beside complex components where useful, or under `tests/` for shared test utilities.
- Base UI components receive smoke tests for rendering, disabled/loading states, and error display.
- Axios refresh handling receives unit tests for single-flight refresh and queued retry behavior.
- DataTable receives tests for sorting, filtering, pagination, and empty state rendering.
- Required verification before handoff: lint, typecheck, test, and production build.

## Boundaries

Always:

- Prefer Server Components and static rendering unless interactivity or request-time data requires a Client Component.
- Keep feature code inside `features/<feature>` and shared primitives inside top-level shared folders.
- Use MUI primitives for accessibility and Tailwind classes for local styling overrides.
- Expose `className`, forward refs, and spread relevant MUI/HTML props in reusable base UI.
- Validate environment variables with Zod before use.
- Run lint, typecheck, tests, and build before declaring the setup complete.

Ask first:

- Changing the token storage model away from HTTP-only refresh cookies.
- Adding another UI library, state library, router, or data-fetching library.
- Adding Storybook, Playwright, CI, Docker, or deployment provider config.
- Committing generated lockfiles after a package-manager change.

Never:

- Commit real `.env` secrets.
- Store refresh tokens in localStorage or sessionStorage.
- Disable TypeScript strictness, ESLint rules, or failing tests to make verification pass.
- Mix product-specific domain code into shared base components.

## Success Criteria

- The repository contains a working Next.js 16 App Router app with TypeScript and pnpm.
- `package.json` contains all mandatory and recommended dependencies with quality scripts.
- Tailwind utilities can override MUI styles without `!important`.
- TanStack Query provider is SSR-aware and available app-wide.
- Axios client has request/response interceptors, timeout handling, normalized errors, and automatic refresh queue handling.
- Zustand, React Hook Form, Zod, and react-hot-toast are wired and demonstrated.
- Base UI includes Button, InputField, SelectBox, CheckboxField, Modal, Toast, and DataTable.
- InputField demonstrates React Hook Form integration and automatic error rendering.
- DataTable combines MUI Table presentation with TanStack Table sorting, filtering, and pagination logic.
- App includes `error.tsx`, `global-error.tsx`, `not-found.tsx`, and loading fallback UI.
- `.env.example` and README guidance document secure environment variable handling.
- `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test`, and `corepack pnpm build` pass.

## Open Questions

1. Is pnpm acceptable as the default package manager?
2. Should the auth refresh endpoint default to `/auth/refresh` or another API path?
3. Should the first scaffold include Storybook, or stay lean with tests and sample pages only?

## References

- Next.js installation and current version: https://nextjs.org/docs/app/getting-started/installation
- Next.js project structure: https://nextjs.org/docs/app/getting-started/project-structure
- Next.js error conventions: https://nextjs.org/docs/app/api-reference/file-conventions/error
- Next.js not-found conventions: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
- Next.js environment variables: https://nextjs.org/docs/app/guides/environment-variables
- MUI Next.js integration: https://mui.com/material-ui/integrations/nextjs/
- MUI Tailwind CSS v4 integration: https://mui.com/material-ui/integrations/tailwindcss/tailwindcss-v4/
- TanStack Query advanced SSR: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
- TanStack Query installation: https://tanstack.com/query/latest/docs/framework/react/installation
- TanStack Table installation: https://tanstack.com/table/latest/docs/installation
