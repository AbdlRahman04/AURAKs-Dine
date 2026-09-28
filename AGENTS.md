# QuickDineFlow Agent Instructions

## Project overview

QuickDineFlow is a TypeScript full-stack application:

- `client/` contains the React/Vite frontend.
- `server/` contains the Express backend and application infrastructure.
- `features/` contains business modules such as `auth`, `menu`, `orders`, `payments`, `favorites`, and `feedback`.
- `shared/` contains schemas and types shared by the frontend and backend.
- `scripts/` contains database, smoke-test, and maintenance utilities.
- `docs/` contains project documentation.

Before making consequential architectural or security changes, read:

- `PROJECT_BRIEF.md` for product scope;
- `ARCHITECTURE.md` for component boundaries and request flow;
- `SECURITY.md` for authentication, secrets, and sensitive-data rules;
- `DEPLOYMENT.md` for local and Render deployment expectations.

## Project conventions

- Keep feature-specific backend logic inside `features/<feature>/`.
- Keep reusable frontend UI in `client/src/components/` and complete screens in `client/src/pages/`.
- Reuse existing shared schemas, utilities, contexts, and UI components before creating duplicates.
- Do not put secrets in source files or documentation. Never expose values from `.env` or `.env.local`.
- Do not edit generated output in `dist/` as part of normal source changes.
- Preserve the existing client/server/shared architecture unless the task explicitly requires restructuring.
- Keep database changes consistent across schema, storage, routes, seed data, and documentation.

## Validation requirements

Run the smallest relevant checks after making changes:

1. TypeScript or source changes: `npm run check`
2. Frontend, backend, or build configuration changes: `npm run build`
3. API, authentication, menu, order, payment, or database behavior changes: `npm run smoke`

If a command cannot run because required services or environment variables are unavailable, report the exact reason and do not claim that validation passed.

## Completion report

When finishing a task, summarize:

- files changed;
- behavior implemented or reviewed;
- validation commands run and their results;
- any checks that were skipped and why.
