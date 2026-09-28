# QuickDineFlow Development Guide

Local-first workflow for building and testing features before deploying the frontend to Vercel and the API to Render.

## Stack

- **Runtime:** Node.js 20.19+ or 22.12+ (packages in `node_modules/` via `npm install`)
- **Database:** PostgreSQL (local for development, Neon Postgres for deployment)
- **ORM:** Drizzle (`shared/schema.ts` re-exports feature schemas)
- **Auth:** Email/password via Passport (`server/localAuth.ts`)

## Quick start (local)

```bash
npm install
# Create .env.local:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quickdineflow
# SESSION_SECRET=dev-secret
# STRIPE_SECRET_KEY=sk_test_...
# VITE_STRIPE_PUBLIC_KEY=pk_test_...

npm run db:setup-local-full
npm run dev
# In another terminal (server must be running):
npm run smoke
```

`.env.local` overrides `.env`. Keep all environment files private; production values belong in the deployment provider's secret configuration.

## Feature modules

Features live under `features/{name}/`:

| Path | Role |
| --- | --- |
| `schema.ts` | Drizzle tables for the feature. |
| `storage.ts` | Database access. |
| `routes.ts` | Express routes. |
| `index.ts` | `registerXFeature(app)`. |
| `pack/manifest.json` | Version and portability metadata, where applicable. |

Core infrastructure files:

- `server/index.ts`
- `server/config.ts`
- `server/db.ts`
- `server/database.ts`
- `server/registerFeatures.ts`

Register every new feature in `server/registerFeatures.ts`.

## Menu content packs

Promote menu content between environments without copying the entire database:

```bash
# On local (exports JSON and bumps features/menu/pack/manifest.json)
npm run pack:export -- menu

# On the target environment
npm run pack:import -- menu --file exports/menu-v1.0.0.json
```

Images under `client/public/menu-images/` are copied with a pack. Admin-uploaded menu images are converted to WebP and stored in PostgreSQL; pack export/import preserves those database-backed files.

Packs do not export users, passwords, sessions, live orders, or Stripe payment methods.

## Database commands

| Script | Purpose |
| --- | --- |
| `db:setup-local` | Create the local `quickdineflow` database. |
| `db:push` | Apply the Drizzle schema. |
| `db:seed` | Seed the configured administrator and menu data. |
| `db:setup` | Apply schema and seed the selected database. |
| `db:setup-local-full` | Create the local database, then apply schema and seed data. |

## Feature workflow

Keep feature-specific backend logic inside `features/<feature>/` and update shared schemas when a feature changes persisted data.

## Deploy

See [DEPLOYMENT.md](../DEPLOYMENT.md) for the overall deployment model and [RENDER_DEPLOY.md](RENDER_DEPLOY.md) for the backend service.
