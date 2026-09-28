# Render Deployment Guide

Deploy the QuickDineFlow Express backend to Render and connect it to Neon PostgreSQL.

## Architecture

- **Web service:** Node build (`npm run build`) + start (`npm run start`)
- **Database:** Neon PostgreSQL — pooled connection string configured as `DATABASE_URL`
- Driver: standard `pg` (same as local). Neon serverless is only used if the URL contains `neon.tech`.

## Steps

1. Push this repository to GitHub.
2. Create a Render web service connected to the repository.
3. Set the Neon pooled connection string and these environment variables on the web service:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `FRONTEND_ORIGIN`
   - `APP_URL`
   - `STRIPE_SECRET_KEY`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` (required before running the seed; use a unique password of at least 12 characters)
4. After first deploy, open the Render shell (or use a one-off job) and run:

   ```bash
   npm run db:setup
   ```

5. Promote local menu content (optional):

   ```bash
   npm run pack:import -- menu --file exports/menu-v1.0.0.json
   ```

6. Verify:

   ```bash
   SMOKE_TARGET=render SMOKE_BASE_URL=https://YOUR-SERVICE.onrender.com npm run smoke
   ```

7. Deploy the React frontend to Vercel with:
   - `VITE_API_URL=https://YOUR-SERVICE.onrender.com`
   - `VITE_STRIPE_PUBLIC_KEY=pk_test_...`

## Environment variables

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Neon pooled PostgreSQL connection string |
| `SESSION_SECRET` | Manually generated secret |
| `FRONTEND_ORIGIN` | Vercel frontend origin |
| `APP_URL` | Public Vercel frontend origin |
| `NODE_ENV` | `production` |
| `STRIPE_SECRET_KEY` | Manual |
| `PORT` | Set by Render |

Vercel-only build variables:

| Variable | Source |
|----------|--------|
| `VITE_API_URL` | Render backend URL |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable test key |

## Notes

- The free Render backend may sleep; the first request can be slow.
- Do not commit `.env` or `.env.local`.
- Before deploying the admin cost and analytics update, apply `migrations/20260927_admin_analytics_cost_snapshots.sql` to the Neon database. It only adds nullable columns and leaves historical costs unknown. Do not use `db:push` if it prompts to truncate or otherwise modify unrelated data; resolve that schema drift separately.
- For other schema changes, run `npm run db:push` against the intended Neon database, preferably from the Render shell.
