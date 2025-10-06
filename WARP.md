# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI/shadcn-style components, TanStack React Query 5, Axios.
- Purpose: LMS Admin Dashboard with auth-gated UI, data fetching via React Query, and a mix of real backend calls and local mock APIs for development.

Environment and setup
- Dependencies: prefer npm (package-lock.json present).
  - Install: npm ci
- Env vars: create .env.local with at least:
  - NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
  - If unset, the app defaults to http://localhost:8000 for the Axios client.
- Backend API expectations (from README_AUTH.md):
  - POST /api/v1/user/login accepts email/password and optional mfa_code; returns access_token, refresh_token, expires_at, user, and optional mfa_required.
  - POST /api/v1/user/refresh exchanges refresh_token for a new access_token.
  - POST /api/v1/user/logout invalidates tokens (requires Authorization: Bearer <access_token> and refresh_token in body).

Common commands
- Start dev server: npm run dev
- Build: npm run build
  - Note: next.config.mjs is configured to ignore TypeScript and ESLint errors during build (typescript.ignoreBuildErrors and eslint.ignoreDuringBuilds are true).
- Start production server (after build): npm run start
- Lint: npm run lint
- Tests: no test scripts are configured in package.json.

High-level architecture
- App entry and providers
  - app/layout.tsx wraps the app with:
    - AuthProvider (lib/auth/auth-context.tsx) for session state, login/logout, and guarding routes.
    - QueryProvider (lib/providers/query-client-provider.tsx) that instantiates a per-session React Query client and (in dev) enables React Query Devtools.
  - app/page.tsx is a client component orchestrating the main shell: Sidebar + Header + a selected page from components/pages/*; it is wrapped with ProtectedRoute which redirects unauthenticated users to /login.

- Authentication
  - lib/auth/auth-context.tsx manages:
    - login(): calls NEXT_PUBLIC_BACKEND_URL/api/v1/user/login via axios; persists tokens and user to localStorage; handles MFA-required responses; enforces user.status === 'active'.
    - checkAuth(): restores session from localStorage on mount; clears invalid or inactive states.
    - logout(): calls NEXT_PUBLIC_BACKEND_URL/api/v1/user/logout, then clears localStorage and redirects to /login.
  - components/auth/protected-route.tsx: redirects to /login when not authenticated; shows a loading spinner while auth state initializes.

- Data fetching and API layers
  - Axios client (lib/api/client.ts):
    - baseURL: process.env.NEXT_PUBLIC_BACKEND_URL or http://localhost:8000.
    - Request interceptor attaches Authorization: Bearer <accessToken> from localStorage.
    - Response interceptor handles 401 by serializing refresh attempts, posting to /api/v1/user/refresh, updating storage and retrying the original request. On refresh failure, clears storage and redirects to /login?session=expired.
  - React Query integration:
    - Generic hooks in lib/api/hooks.ts (useApiQuery/useApiMutation/... with Error transform) and domain hooks in lib/api/services.ts (users, courses, enrollments, dashboard stats) with centralized queryKeys.
    - QueryProvider sets sensible defaults (staleTime, gcTime, retry) and disables refetch-on-focus.
  - Local mock APIs and fetch-based service:
    - app/api/* route handlers provide mock endpoints for quick UI demos (e.g., /api/users, /api/leaderboard, /api/enrollments, /api/quiz-attempts).
    - lib/api.ts provides an API facade used by many components/pages that mixes:
      - fetch('/api/...') calls to the local route handlers for users/leaderboard, etc.
      - in-memory mock-data for lessons/quizzes/media operations.
      - dynamic content endpoints for topics/levels/tags resolved from NEXT_PUBLIC_BACKEND_URL/api/v1/content with resilient payload extraction and fallback to mock data.
    - The axios-based client (lib/api/client.ts) is primarily for authenticated backend flows (e.g., auth) and is used by the React Query hooks layer for backend resources in lib/api/services.ts.

- UI composition
  - app/page.tsx selects the active view from components/pages/* modules (Dashboard, Courses, Media Library, Lessons, Topics, Levels, Tags, Quizzes, Submissions, Users, Leaderboard, Notifications, Settings placeholder).
  - components/ui/* contains a rich set of Radix/shadcn-style primitives (e.g., button, dialog, table, toaster, sidebar, form, calendar) used across pages.
  - Theming/fonts via Geist Sans/Mono in app/layout.tsx. Tailwind CSS is configured (postcss.config.mjs, styles, app/globals.css) with tailwindcss v4.

Key notes for agents
- Path aliases: "@/*" resolves to repo root (configured in tsconfig.json).
- Build behavior: next.config.mjs ignores TypeScript and ESLint errors at build time; do not assume CI will fail on type or lint errors.
- Images: next.config.mjs sets images.unoptimized = true.
- Environment
  - Without NEXT_PUBLIC_BACKEND_URL, axios defaults to http://localhost:8000. Ensure the backend implements the auth endpoints described above, or use the app/api/* mocks and the lib/api.ts facade when working on UI-only features.

References
- package.json scripts: build/dev/lint/start only; no tests defined.
- README_AUTH.md explains the expected auth contract and provides local testing steps for the auth flow.
