# Pulse Tasks

Pulse Tasks is a frontend-only task management application built with Next.js, React, TypeScript, Tailwind CSS, and a custom in-memory mock API persisted through `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Demo credentials:

- Username: `test`
- Password: `test123`

## Scripts

```bash
npm run dev
npm run lint
npm run test
npm run test:coverage
npm run build
```

## How the mocking works

- The app does not use a backend.
- All API calls go through `lib/mock-api.ts`.
- `mockApiFetch()` simulates REST endpoints with delayed `Response` objects:
  - `POST /login`
  - `GET /tasks`
  - `POST /tasks`
  - `PUT /tasks/:id`
  - `DELETE /tasks/:id`
- The mocked data is persisted with `localStorage` via `lib/storage.ts`, so session, theme, and tasks survive reloads.

## Project structure

```text
app/
  dashboard/page.tsx      Protected dashboard route
  layout.tsx              Root layout and provider wiring
  page.tsx                Login route
components/
  dashboard-screen.tsx    Dashboard UI and task board interactions
  login-screen.tsx        Login UI and mock auth flow
  task-card.tsx           Task presentation block
  task-form.tsx           Create/edit form with validation
lib/
  app-state.tsx           Client state management with Context API
  mock-api.ts             Mocked REST endpoints
  storage.ts              Persistent localStorage snapshot helpers
  constants.ts            Demo credentials, seed data, styles
  types.ts                Shared application types
```

## Libraries used

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Vitest
- React Testing Library

## Deployment

The project is ready for Vercel or Netlify deployment:

1. Push the repository to GitHub.
2. Import it into Vercel or Netlify.
3. Use the default Next.js build settings.

A live deployment URL is not included here because deployment access is not available in this workspace.

## Testing and coverage

- Unit tests use Vitest + React Testing Library.
- Coverage is configured for the application source files.
- The target is 100% coverage with zero lint errors.
