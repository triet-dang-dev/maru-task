# Implementation Plan: Enterprise Frontend Boilerplate

Status: Review draft
Spec: docs/specs/enterprise-frontend-boilerplate.md

## Overview

Create a production-ready Next.js App Router boilerplate with a feature-based architecture, MUI plus Tailwind design-system base, TanStack Query server-state layer, Axios refresh-token networking, Zustand client state, form primitives, advanced data table, error fallbacks, and quality gates.

## Architecture Decisions

- Use top-level `app`, `components`, `services`, `stores`, `utils`, and `types` folders to match the requested structure exactly.
- Use MUI v9 components as accessible primitives and Tailwind v4 utilities for local style overrides.
- Use CSS cascade layers instead of Tailwind prefixing: `mui` comes before `utilities`, making Tailwind overrides predictable.
- Use `@mui/material-nextjs/v16-appRouter` because the installed adapter exports a v16 App Router entrypoint.
- Keep `app/providers.tsx` as the only global client provider boundary, preserving Server Components by default.
- Use Axios with HTTP-only refresh cookie assumptions and in-memory access token support to avoid persisting sensitive tokens in browser storage.
- Use Vitest and Testing Library for fast component and utility verification.

## Dependency Graph

```text
package.json and config files
  |
  |-- TypeScript, ESLint, Prettier, Vitest
  |-- Tailwind, MUI, theme, global providers
  |     |
  |     |-- Base UI components
  |     |-- Error/loading/not-found UI
  |
  |-- Env validation and API client
  |     |
  |     |-- TanStack Query hooks and services
  |     |-- Feature modules
  |
  |-- Form schemas and shared types
        |
        |-- Form field wrappers
        |-- Sample feature page
```

## Task List

## Task 1: Bootstrap Next.js project files

**Description:** Create the root package metadata, Next.js app files, TypeScript config, import aliases, and base Git ignore rules.

**Acceptance criteria:**

- [ ] `package.json` includes all approved dependencies and scripts.
- [ ] `app/layout.tsx`, `app/page.tsx`, and `next.config.ts` exist.
- [ ] TypeScript strict mode and `@/*` alias are configured.

**Verification:**

- [ ] Run `corepack pnpm install`.
- [ ] Run `corepack pnpm typecheck`.

**Dependencies:** None

**Files likely touched:**

- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `.gitignore`
- `app/layout.tsx`
- `app/page.tsx`

**Estimated scope:** Medium

## Task 2: Configure quality tooling

**Description:** Add ESLint flat config, Prettier config, Vitest config, test setup, Husky prepare script, and lint-staged rules.

**Acceptance criteria:**

- [ ] ESLint uses Next.js and TanStack Query rules.
- [ ] Prettier formats TS, TSX, CSS, JSON, and Markdown.
- [ ] Vitest runs with jsdom and Testing Library matchers.

**Verification:**

- [ ] Run `corepack pnpm lint`.
- [ ] Run `corepack pnpm format:check`.
- [ ] Run `corepack pnpm test`.

**Dependencies:** Task 1

**Files likely touched:**

- `eslint.config.mjs`
- `prettier.config.mjs`
- `vitest.config.ts`
- `tests/setup.ts`
- `package.json`

**Estimated scope:** Medium

## Task 3: Wire Tailwind and MUI compatibility

**Description:** Configure Tailwind v4 PostCSS, MUI theme, App Router cache provider, and CSS layer order so Tailwind utilities override MUI default styles.

**Acceptance criteria:**

- [ ] `app/globals.css` declares `@layer theme, base, mui, components, utilities` before importing Tailwind.
- [ ] `AppRouterCacheProvider` uses `options={{ enableCssLayer: true }}`.
- [ ] MUI ThemeProvider is composed in a reusable provider.

**Verification:**

- [ ] Run `corepack pnpm build`.
- [ ] Manually confirm a Tailwind class can override a MUI component root style.

**Dependencies:** Task 1

**Files likely touched:**

- `postcss.config.mjs`
- `app/globals.css`
- `app/layout.tsx`
- `app/providers.tsx`
- `providers/MuiProvider.tsx`
- `theme/theme.ts`

**Estimated scope:** Medium

## Checkpoint: Foundation

- [ ] Install succeeds.
- [ ] Lint, format check, typecheck, and tests pass.
- [ ] Production build succeeds.
- [ ] Tailwind and MUI style ordering is verified.

## Task 4: Add shared utilities and environment validation

**Description:** Add `cn` class merging, Zod-backed environment validation, and shared API type foundations.

**Acceptance criteria:**

- [ ] `cn` merges conditional classes and resolves Tailwind conflicts.
- [ ] Env helper separates public and server-only variables.
- [ ] `.env.example` documents required and optional keys.

**Verification:**

- [ ] Run `corepack pnpm test`.
- [ ] Run `corepack pnpm typecheck`.

**Dependencies:** Task 1

**Files likely touched:**

- `utils/cn.ts`
- `utils/env.ts`
- `types/api.ts`
- `.env.example`

**Estimated scope:** Small

## Task 5: Add TanStack Query provider

**Description:** Create SSR-aware query client setup and compose it into app providers.

**Acceptance criteria:**

- [ ] Server renders receive a fresh QueryClient.
- [ ] Browser uses a stable QueryClient instance.
- [ ] Default query options include sane stale time and retry behavior.

**Verification:**

- [ ] Run `corepack pnpm test`.
- [ ] Run `corepack pnpm build`.

**Dependencies:** Tasks 1, 3

**Files likely touched:**

- `services/query/query-client.ts`
- `providers/QueryProvider.tsx`
- `app/providers.tsx`

**Estimated scope:** Small

## Task 6: Add Axios API client with refresh handling

**Description:** Implement the shared Axios client, request/response interceptors, normalized errors, and single-flight refresh token queue.

**Acceptance criteria:**

- [ ] Requests include timeout, base URL, credentials, and request ID.
- [ ] API errors are normalized into a typed application error.
- [ ] Parallel 401 responses trigger one refresh request and replay queued requests after success.

**Verification:**

- [ ] Add unit tests for success, normalized errors, refresh success, refresh failure, and queued replay.
- [ ] Run `corepack pnpm test`.

**Dependencies:** Task 4

**Files likely touched:**

- `services/api/api-client.ts`
- `services/api/api-error.ts`
- `services/api/auth-token.ts`
- `services/api/refresh-token.ts`
- `services/api/api-client.test.ts`

**Estimated scope:** Medium

## Task 7: Add app fallbacks and UI store

**Description:** Implement global error, route error, not-found, loading UI, and a small Zustand store for reusable UI state.

**Acceptance criteria:**

- [ ] `app/error.tsx` and `app/global-error.tsx` provide recoverable fallback UI.
- [ ] `app/not-found.tsx` provides a custom 404.
- [ ] Zustand store exposes typed UI state without overreaching into server state.

**Verification:**

- [ ] Run `corepack pnpm typecheck`.
- [ ] Run `corepack pnpm build`.

**Dependencies:** Tasks 3, 4

**Files likely touched:**

- `app/error.tsx`
- `app/global-error.tsx`
- `app/not-found.tsx`
- `app/loading.tsx`
- `stores/use-ui-store.ts`

**Estimated scope:** Medium

## Checkpoint: Platform Layer

- [ ] Query provider, MUI provider, Toast provider, and Axios client are composed.
- [ ] App-level fallbacks compile and render.
- [ ] Axios refresh tests pass.

## Task 8: Build Button, Modal, and Toast primitives

**Description:** Create accessible MUI wrappers for Button and Modal, plus a lightweight app toast utility backed by react-hot-toast.

**Acceptance criteria:**

- [ ] Button supports loading, solid, outline, ghost/text variants, icons, `className`, prop spread, and forwardRef.
- [ ] Modal wraps MUI Dialog with ergonomic open/close props.
- [ ] Toast can be called from reusable functions/hooks and renders through a provider.

**Verification:**

- [ ] Add component tests for loading/disabled state and modal close behavior.
- [ ] Run `corepack pnpm test`.

**Dependencies:** Tasks 3, 4, 7

**Files likely touched:**

- `components/ui/Button/Button.tsx`
- `components/ui/Button/index.ts`
- `components/ui/Modal/Modal.tsx`
- `components/ui/Modal/index.ts`
- `components/common/AppToast.tsx`

**Estimated scope:** Medium

## Task 9: Build form field primitives

**Description:** Create InputField, SelectBox, and CheckboxField as React Hook Form friendly MUI wrappers with automated error display.

**Acceptance criteria:**

- [ ] All fields support uncontrolled usage and Controller-based controlled usage.
- [ ] Error messages render consistently from RHF field state.
- [ ] Components forward refs, accept `className`, and spread relevant MUI props.

**Verification:**

- [ ] Add tests for label association, error display, and form integration.
- [ ] Run `corepack pnpm test`.

**Dependencies:** Tasks 3, 4

**Files likely touched:**

- `components/ui/InputField/InputField.tsx`
- `components/ui/SelectBox/SelectBox.tsx`
- `components/ui/CheckboxField/CheckboxField.tsx`
- `components/ui/*/index.ts`

**Estimated scope:** Medium

**Implementation status (2026-07-15):** Tasks 10-21 are complete. Component tests, the full test suite, lint, formatting, typecheck, and the production build pass.

## Task 10: Add IconButton primitive

**Description:** Add a public icon-only action primitive so toolbars, table actions, and dismiss controls share sizing, focus, loading, and accessibility behavior.

**Acceptance criteria:**

- [ ] IconButton supports semantic color and size variants, disabled/loading states, `className`, prop spread, and ref forwarding.
- [ ] Icon-only actions require an accessible name through `aria-label` or equivalent visible labeling.
- [ ] Focus, hover, active, and loading presentation uses shared theme tokens.

**Verification:**

- [ ] Add component tests for accessible naming, loading, disabled, and prop forwarding.
- [ ] Run `corepack pnpm test` and `corepack pnpm typecheck`.

**Dependencies:** Tasks 3, 4

**Files likely touched:**

- `components/ui/IconButton/IconButton.tsx`
- `components/ui/IconButton/IconButton.test.tsx`
- `components/ui/IconButton/index.ts`

**Estimated scope:** Small

## Task 11: Add ConfirmDialog primitive

**Description:** Add a focused confirmation flow for destructive or consequential actions by composing the existing Modal, Button, and IconButton primitives.

**Acceptance criteria:**

- [ ] ConfirmDialog supports confirm/cancel labels, destructive intent, async loading, error-safe retry, and disabled dismissal while confirming when requested.
- [ ] Initial focus, Escape behavior, cancel behavior, and focus restoration are predictable and accessible.
- [ ] Consumers can provide title, description, and optional supporting content without rebuilding dialog actions.

**Verification:**

- [ ] Add tests for confirm, cancel, loading, Escape, and focus restoration behavior.
- [ ] Run `corepack pnpm test` and `corepack pnpm typecheck`.

**Dependencies:** Tasks 8, 10

**Files likely touched:**

- `components/ui/ConfirmDialog/ConfirmDialog.tsx`
- `components/ui/ConfirmDialog/ConfirmDialog.test.tsx`
- `components/ui/ConfirmDialog/index.ts`

**Estimated scope:** Medium

## Task 12: Add DropdownMenu and ActionMenu primitives

**Description:** Add composable menu primitives for compact row actions, overflow actions, and toolbar commands without coupling menu content to a single feature.

**Acceptance criteria:**

- [ ] DropdownMenu exposes accessible trigger, content, item, separator, disabled, and destructive-item patterns.
- [ ] Keyboard navigation, Escape, click-away dismissal, focus return, and item selection follow expected menu behavior.
- [ ] ActionMenu provides a small convenience composition for common overflow-action use without duplicating DropdownMenu logic.

**Verification:**

- [ ] Add interaction tests for keyboard navigation, selection, disabled items, dismissal, and focus return.
- [ ] Run `corepack pnpm test` and `corepack pnpm typecheck`.

**Dependencies:** Tasks 3, 4, 10

**Files likely touched:**

- `components/ui/DropdownMenu/DropdownMenu.tsx`
- `components/ui/DropdownMenu/DropdownMenu.test.tsx`
- `components/ui/DropdownMenu/index.ts`

**Estimated scope:** Medium

## Task 13: Add Tabs primitive

**Description:** Add reusable tabs and tab panels for switching between related dashboard views while preserving accessible state and keyboard behavior.

**Acceptance criteria:**

- [ ] Tabs supports controlled and uncontrolled selection, disabled tabs, and stable tab-to-panel relationships.
- [ ] Arrow keys, Home, End, focus order, and ARIA attributes follow the tabs interaction pattern.
- [ ] Tabs accepts responsive styling and relevant MUI props without hiding the underlying composition model.

**Verification:**

- [ ] Add tests for selection, keyboard navigation, disabled tabs, and ARIA relationships.
- [ ] Run `corepack pnpm test` and `corepack pnpm typecheck`.

**Dependencies:** Tasks 3, 4

**Files likely touched:**

- `components/ui/Tabs/Tabs.tsx`
- `components/ui/Tabs/Tabs.test.tsx`
- `components/ui/Tabs/index.ts`

**Estimated scope:** Medium

## Task 14: Add Breadcrumbs primitive

**Description:** Add route-context breadcrumbs for nested dashboard pages with a consistent separator, current-page treatment, and overflow behavior.

**Acceptance criteria:**

- [ ] Breadcrumbs renders linked ancestors and a non-linked current item with `aria-current="page"`.
- [ ] Long paths support responsive collapsing while retaining accessible labels and full destination links.
- [ ] Separators are decorative and the component accepts `className` and relevant MUI props.

**Verification:**

- [ ] Add tests for links, current-page semantics, custom separators, and collapsed paths.
- [ ] Run `corepack pnpm test` and `corepack pnpm typecheck`.

**Dependencies:** Tasks 3, 4

**Files likely touched:**

- `components/ui/Breadcrumbs/Breadcrumbs.tsx`
- `components/ui/Breadcrumbs/Breadcrumbs.test.tsx`
- `components/ui/Breadcrumbs/index.ts`

**Estimated scope:** Small

## Task 15: Add RadioGroupField primitive

**Description:** Add a radio group field that follows the existing form wrapper contract for both uncontrolled forms and React Hook Form Controller usage.

**Acceptance criteria:**

- [ ] RadioGroupField supports typed options, disabled states, row/column layout, helper text, and validation errors.
- [ ] Uncontrolled and Controller-based usage preserve label, description, error, and group associations.
- [ ] The component accepts `className`, relevant MUI props, and forwards field behavior consistently with existing form primitives.

**Verification:**

- [ ] Add tests for selection, labels, validation errors, disabled options, and React Hook Form submission.
- [ ] Run `corepack pnpm test` and `corepack pnpm typecheck`.

**Dependencies:** Tasks 3, 4, 9

**Files likely touched:**

- `components/ui/RadioGroupField/RadioGroupField.tsx`
- `components/ui/RadioGroupField/RadioGroupField.test.tsx`
- `components/ui/RadioGroupField/index.ts`

**Estimated scope:** Medium

## Task 16: Add SwitchField primitive

**Description:** Add a switch field for immediate boolean settings while keeping checkbox semantics available for form acknowledgement and multi-select cases.

**Acceptance criteria:**

- [ ] SwitchField supports uncontrolled and React Hook Form Controller usage, checked/defaultChecked state, disabled state, helper text, and validation errors.
- [ ] Visible labels and descriptions are correctly associated with the switch and do not rely on color alone.
- [ ] The component accepts `className`, relevant MUI props, and consistent error presentation.

**Verification:**

- [ ] Add tests for toggling, controlled submission, labels, helper text, errors, and disabled behavior.
- [ ] Run `corepack pnpm test` and `corepack pnpm typecheck`.

**Dependencies:** Tasks 3, 4, 9

**Files likely touched:**

- `components/ui/SwitchField/SwitchField.tsx`
- `components/ui/SwitchField/SwitchField.test.tsx`
- `components/ui/SwitchField/index.ts`

**Estimated scope:** Medium

## Task 17: Add AutocompleteField and Combobox primitive

**Description:** Add a typed autocomplete field for searchable single- or multi-value selection, including asynchronous option loading and React Hook Form integration.

**Acceptance criteria:**

- [ ] AutocompleteField supports generic option types, label/equality resolvers, single and multiple selection, loading, empty, disabled, and clearable states.
- [ ] Uncontrolled and Controller-based usage display helper text and validation errors consistently.
- [ ] Keyboard navigation, option selection, listbox labeling, and focus behavior remain accessible.

**Verification:**

- [ ] Add tests for filtering, keyboard selection, single/multiple values, loading/empty states, validation, and React Hook Form submission.
- [ ] Run `corepack pnpm test` and `corepack pnpm typecheck`.

**Dependencies:** Tasks 3, 4, 9

**Files likely touched:**

- `components/ui/AutocompleteField/AutocompleteField.tsx`
- `components/ui/AutocompleteField/AutocompleteField.test.tsx`
- `components/ui/AutocompleteField/index.ts`

**Estimated scope:** Medium

## Task 18: Add InlineAlert primitive

**Description:** Add in-content feedback for persistent success, information, warning, and error messages that should not be presented as transient toast notifications.

**Acceptance criteria:**

- [ ] InlineAlert supports semantic tones plus optional title, supporting content, action, and dismiss behavior.
- [ ] Alert and status roles match urgency, dismiss controls have accessible names, and meaning is not conveyed by color alone.
- [ ] The component accepts `className`, relevant MUI props, and shared theme tokens.

**Verification:**

- [ ] Add tests for tone, roles, title/content, action, dismiss behavior, and prop forwarding.
- [ ] Run `corepack pnpm test` and `corepack pnpm typecheck`.

**Dependencies:** Tasks 3, 4, 10

**Files likely touched:**

- `components/ui/InlineAlert/InlineAlert.tsx`
- `components/ui/InlineAlert/InlineAlert.test.tsx`
- `components/ui/InlineAlert/index.ts`

**Estimated scope:** Small

## Task 19: Add reusable LoadingState primitive

**Description:** Add a shared loading-state boundary that announces progress and accepts composed MUI Skeleton content, with a useful line-skeleton fallback for simple cases.

**Acceptance criteria:**

- [ ] LoadingState exposes accessible busy/status semantics and supports a customizable loading label.
- [ ] Consumers can compose domain-appropriate skeleton layouts instead of being limited to one fixed card or table shape.
- [ ] Motion respects reduced-motion preferences and does not cause avoidable layout shifts.

**Verification:**

- [ ] Add tests for default/custom skeleton content, accessible status, busy state, and custom labels.
- [ ] Run `corepack pnpm test` and `corepack pnpm typecheck`.

**Dependencies:** Tasks 3, 4

**Files likely touched:**

- `components/ui/LoadingState/LoadingState.tsx`
- `components/ui/LoadingState/LoadingState.test.tsx`
- `components/ui/LoadingState/index.ts`

**Estimated scope:** Small

## Task 20: Add SectionCard primitive

**Description:** Add a standard content surface for dashboard sections with consistent title, description, header actions, body spacing, and optional footer composition.

**Acceptance criteria:**

- [ ] SectionCard supports semantic heading levels, optional description, header actions, body content, and footer content.
- [ ] Padding, border, radius, and responsive behavior use shared tokens while allowing focused `className` overrides.
- [ ] The component remains compositional and does not encode feature-specific loading, empty, or form logic.

**Verification:**

- [ ] Add tests for heading semantics, header actions, body/footer composition, and prop forwarding.
- [ ] Run `corepack pnpm test` and `corepack pnpm typecheck`.

**Dependencies:** Tasks 3, 4

**Files likely touched:**

- `components/ui/SectionCard/SectionCard.tsx`
- `components/ui/SectionCard/SectionCard.test.tsx`
- `components/ui/SectionCard/index.ts`

**Estimated scope:** Small

## Task 21: Add standalone Pagination primitive

**Description:** Add pagination for card grids, search results, and other collections that do not use DataTable.

**Acceptance criteria:**

- [ ] Pagination supports controlled page state, total page count, disabled state, sibling/boundary configuration, and change callbacks.
- [ ] Current-page and navigation controls have accessible labels and remain usable at narrow viewport widths.
- [ ] The wrapper accepts `className` and relevant MUI Pagination props without duplicating table-specific state.

**Verification:**

- [ ] Add tests for page changes, current-page semantics, disabled state, responsive configuration, and prop forwarding.
- [ ] Run `corepack pnpm test` and `corepack pnpm typecheck`.

**Dependencies:** Tasks 3, 4

**Files likely touched:**

- `components/ui/Pagination/Pagination.tsx`
- `components/ui/Pagination/Pagination.test.tsx`
- `components/ui/Pagination/index.ts`

**Estimated scope:** Small

## Task 22: Build DataTable primitive

**Description:** Create an advanced table that uses TanStack Table for logic and MUI Table for rendering.

**Acceptance criteria:**

- [ ] Supports sorting, global filtering, pagination, loading, error, and empty states.
- [ ] Accepts generic row data and column definitions.
- [ ] Uses MUI table components for accessible presentation and Tailwind for layout overrides.

**Verification:**

- [ ] Add tests for sorting, filtering, pagination, empty state, and loading state.
- [ ] Run `corepack pnpm test`.

**Dependencies:** Tasks 3, 4, 19, 21

**Files likely touched:**

- `components/ui/DataTable/DataTable.tsx`
- `components/ui/DataTable/types.ts`
- `components/ui/DataTable/index.ts`
- `components/ui/DataTable/DataTable.test.tsx`

**Estimated scope:** Medium

## Task 23: Add sample feature slice

**Description:** Add a small example feature page that demonstrates Zod validation, RHF form fields, TanStack Query, Toast, Modal, and DataTable without adding product-specific assumptions.

**Acceptance criteria:**

- [ ] Example feature uses feature-local schema, services, hooks, components, and types.
- [ ] Page demonstrates InputField and DataTable sample code requested by the user.
- [ ] Server/client boundaries remain explicit and minimal.

**Verification:**

- [ ] Run `corepack pnpm build`.
- [ ] Manual check: page renders, form validation appears, table pagination works.

**Dependencies:** Tasks 5, 8-22

**Files likely touched:**

- `features/example/types.ts`
- `features/example/schemas/*`
- `features/example/services/*`
- `features/example/hooks/*`
- `features/example/components/*`
- `app/page.tsx`

**Estimated scope:** Medium

## Checkpoint: UI System

- [ ] Base UI wrappers are complete.
- [ ] Form fields integrate with React Hook Form.
- [ ] IconButton, ConfirmDialog, DropdownMenu, Tabs, and Breadcrumbs cover common interaction and navigation patterns.
- [ ] RadioGroupField, SwitchField, and AutocompleteField cover common selection controls.
- [ ] InlineAlert, LoadingState, SectionCard, and standalone Pagination cover shared feedback, surface, and collection patterns.
- [ ] DataTable uses MUI rendering and TanStack Table state.
- [ ] Sample page demonstrates the requested component flexibility.

## Task 24: Add documentation and final verification

**Description:** Add README guidance covering architecture, scripts, environment variables, security assumptions, performance practices, and extension guidelines.

**Acceptance criteria:**

- [ ] README includes folder tree, setup commands, env management, and component standards.
- [ ] Performance guidance covers SSR/SSG defaults, image/font strategy, dynamic import boundaries, and Core Web Vitals targets.
- [ ] Security guidance covers env handling, token refresh assumptions, and client/server secret boundaries.

**Verification:**

- [ ] Run `corepack pnpm lint`.
- [ ] Run `corepack pnpm typecheck`.
- [ ] Run `corepack pnpm test`.
- [ ] Run `corepack pnpm build`.

**Dependencies:** Tasks 1-23

**Files likely touched:**

- `README.md`
- `docs/*`

**Estimated scope:** Small

## Checkpoint: Complete

- [ ] All success criteria in the spec are met.
- [ ] All required commands pass.
- [ ] No unresolved implementation TODOs remain.
- [ ] Final handoff lists changed files and verification results.

## Risks and Mitigations

| Risk                                                    | Impact | Mitigation                                                                          |
| ------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------- |
| MUI v9 and Tailwind v4 layer behavior changes           | High   | Use documented `enableCssLayer` and layer order; verify with an actual override.    |
| Auth refresh contract differs from the eventual backend | Medium | Keep refresh endpoint and token setters configurable; document assumptions clearly. |
| Too much client-side provider scope hurts RSC benefits  | Medium | Keep providers minimal and default route/page code to Server Components.            |
| Boilerplate becomes too opinionated                     | Medium | Keep sample feature generic and isolate optional patterns in `features/example`.    |
| Version pinning ages quickly                            | Medium | Pin exact versions in `package.json` and lockfile; document update workflow.        |

## Open Questions

- Confirm pnpm as the package manager.
- Confirm default refresh endpoint path.
- Confirm whether Storybook should be included now or deferred.
