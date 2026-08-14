# Maru Task Frontend

Next.js frontend for Maru Task. It uses a same-origin Next.js BFF to communicate with the .NET backend.

## Requirements

- Node.js `>= 20.9.0`
- npm or pnpm

Use one package manager per working copy. The repository tracks `pnpm-lock.yaml`; keep `package-lock.json` only when your team uses npm.

## Getting started

```powershell
# Install dependencies
npm install
# or: corepack pnpm install

# Configure local environment
Copy-Item .env.example .env.local

# Start the app
npm run dev
# or: corepack pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

On macOS/Linux, create the environment file with `cp .env.example .env.local`.

## Environment

The default `.env.example` configuration uses the local backend at `http://localhost:5000` and mock API data in development.

| Variable                   | Purpose                                                    |
| -------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Browser API base URL.                                      |
| `DOTNET_API_BASE_URL`      | .NET backend origin.                                       |
| `USE_MOCK_API`             | Use BFF mock data locally.                                 |
| `MOCK_AUTH`                | Bypass authentication locally. Never enable in production. |

Only variables prefixed with `NEXT_PUBLIC_` are available in browser code.

## Commands

| Task               | npm                    | pnpm                         |
| ------------------ | ---------------------- | ---------------------------- |
| Development server | `npm run dev`          | `corepack pnpm dev`          |
| Build              | `npm run build`        | `corepack pnpm build`        |
| Lint               | `npm run lint`         | `corepack pnpm lint`         |
| Format check       | `npm run format:check` | `corepack pnpm format:check` |
| Type check         | `npm run typecheck`    | `corepack pnpm typecheck`    |
| Tests              | `npm test`             | `corepack pnpm test`         |
