# QuickDineFlow — Deployment and Operations

## Environments

| Environment | Purpose | Location | Data rules |
|---|---|---|---|
| Local | Development and smoke testing | `localhost:5000` or separate Vite/API ports | Use local PostgreSQL and test data |
| Production | Deployed user traffic | Render service defined by `render.yaml` | Use production secrets and managed PostgreSQL |

## Prerequisites

- Node.js 18 or newer.
- PostgreSQL for local development or a Render PostgreSQL database.
- Required environment variables from `.env.example`.
- Stripe test keys for development; production keys only in protected deployment configuration.

## Deploy

1. Push the approved source changes to the repository.
2. Deploy using the Render Blueprint in `render.yaml`.
3. Configure `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLIC_KEY` in Render without committing their values.
4. To enable password reset emails, set `APP_URL` to the deployed public origin, add a Resend API key as `RESEND_API_KEY`, and set `PASSWORD_RESET_FROM_EMAIL` to a sender verified with Resend. Without these settings, password reset requests return a service unavailable response.
5. Confirm the service builds with `npm run build`.
6. Apply the database schema and seed data with `npm run db:setup` when appropriate.
7. Confirm the `/api/health` health check and key user flows.

## Monitor

- **Health check:** `/api/health`
- **Application logs:** Render service logs or the local development terminal.
- **Admin system health:** `/admin/monitoring` shows bounded, in-memory API latency/errors, browser page-load timings, and redacted incidents for the current server process. Samples clear when that process restarts and are not shared across multiple instances.
- **Validation:** `npm run check`, `npm run build`, and `npm run smoke`.

## Backup, restore, and rollback

- Use the database provider's backup and restore facilities; do not assume application source control is a database backup.
- Before schema changes, verify that a current database recovery option exists.
- Roll back application code through the deployment provider, then address any database migration compatibility issue separately.

## Related documentation

- `README.md` for local setup.
- `docs/RENDER_DEPLOY.md` for Render-specific instructions.
- `docs/database/` for database setup and operational notes.
