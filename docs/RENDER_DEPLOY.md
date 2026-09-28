# Render Deployment Guide

Deploy QuickDineFlow from GitHub to Render (web service + Postgres).

## Architecture

- **Web service:** Node build (`npm run build`) + start (`npm run start`)
- **Database:** Render Postgres — connection string injected as `DATABASE_URL`
- Driver: standard `pg` (same as local). Neon serverless is only used if the URL contains `neon.tech`.

## Steps

1. Push this repo to GitHub.
2. In [Render](https://dashboard.render.com), create a **Blueprint** from `render.yaml` (or New → Blueprint).
3. Set manual env vars on the web service:
   - `STRIPE_SECRET_KEY`
   - `VITE_STRIPE_PUBLIC_KEY` (needed at **build** time for Vite)
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

## Environment variables

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Render Postgres (from blueprint) |
| `SESSION_SECRET` | Auto-generated in blueprint |
| `NODE_ENV` | `production` |
| `STRIPE_SECRET_KEY` | Manual |
| `VITE_STRIPE_PUBLIC_KEY` | Manual (build-time) |
| `PORT` | Set by Render |

## Notes

- Free Postgres may sleep; first request can be slow.
- Do not commit `.env` or `.env.local`.
- Before deploying the admin cost and analytics update, apply `migrations/20260927_admin_analytics_cost_snapshots.sql` to the Render database. It only adds nullable columns and leaves historical costs unknown. Do not use `db:push` if it prompts to truncate or otherwise modify unrelated data; resolve that schema drift separately.
- For other schema changes, run `npm run db:push` against the Render database (shell or local with Render URL temporarily — prefer shell).
