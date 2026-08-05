# QuickDineFlow Development Guide

Local-first workflow for building and testing features before deploying to Render.

## Stack

- **Runtime:** Node.js 18+ (packages in `node_modules/` via `npm install` — not a Python venv)
- **Database:** PostgreSQL (local for dev, Render Postgres for deploy)
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

`.env.local` overrides `.env`. Keep cloud credentials in `.env` if you want; local URL in `.env.local`.

## Feature modules (plug-and-play)

Features live under `features/{name}/`:

| Path | Role |
|------|------|
| `schema.ts` | Drizzle tables for this feature |
| `storage.ts` | DB access |
| `routes.ts` | Express routes |
| `index.ts` | `registerXFeature(app)` |
| `pack/manifest.json` | Version + portability metadata |

**Core files** (avoid editing unless the plan requires it):

- `server/index.ts`
- `server/config.ts`
- `server/db.ts`
- `server/database.ts`
- `server/registerFeatures.ts`

New features must be registered in `server/registerFeatures.ts`.

## Pack export / import (menu)

Promote menu content from local → staging without copying the whole database:

```bash
# On local (exports JSON + bumps features/menu/pack/manifest.json)
npm run pack:export -- menu

# On staging / against Render DATABASE_URL
npm run pack:import -- menu --file exports/menu-v1.0.0.json
```

Images under `client/public/menu-images/` are copied with the pack. Paths are stored in Postgres; binary files stay on disk.

**Not exported:** users/passwords, sessions, live orders, Stripe payment methods.

## Database commands

| Script | Purpose |
|--------|---------|
| `db:setup-local` | Create local `quickdineflow` database |
| `db:push` | Push schema via Drizzle |
| `db:seed` | Seed admin + menu (idempotent) |
| `db:setup` | push + seed (local or cloud URL) |
| `db:setup-local-full` | create DB + setup |

## AI feature workflow

Use the prompt in [FEATURE_DEVELOPMENT_PROMPT.md](./FEATURE_DEVELOPMENT_PROMPT.md).

## Deploy

See [RENDER_DEPLOY.md](./RENDER_DEPLOY.md).
