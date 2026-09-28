# Database Environments

QuickDineFlow supports local PostgreSQL for development and a managed PostgreSQL database for deployment. The database driver is selected from `DATABASE_URL`; no source change is required when switching environments.

## Local development

Create `.env.local` from the examples in [Local database setup](../database/DATABASE_SETUP.md). It should point to your local PostgreSQL database and must remain uncommitted.

```env
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/quickdineflow
```

Initialize it with:

```bash
npm run db:setup-local-full
```

## Deployment

Render provides `DATABASE_URL` to the web service defined in [`render.yaml`](../../render.yaml). Follow the [Render deployment guide](../RENDER_DEPLOY.md) to configure deployment-only secrets through Render.

Neon is also supported when its pooled PostgreSQL connection string is provided as `DATABASE_URL`. Do not put a hosted database connection string in a committed file.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run db:push` | Apply the current schema to the selected database. |
| `npm run db:seed` | Seed menu data and the configured administrator. |
| `npm run db:setup` | Apply the schema and seed the selected database. |
