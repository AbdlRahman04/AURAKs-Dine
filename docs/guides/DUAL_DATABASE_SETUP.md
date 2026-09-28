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

Neon provides the pooled `DATABASE_URL` used by the Render web service. Follow the [Render backend deployment guide](../RENDER_DEPLOY.md) to configure the hosted database connection and deployment-only secrets.

Neon is also supported when its pooled PostgreSQL connection string is provided as `DATABASE_URL`. Do not put a hosted database connection string in a committed file.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run db:push` | Apply the current schema to the selected database. |
| `npm run db:seed` | Seed menu data and the configured administrator. |
| `npm run db:setup` | Apply the schema and seed the selected database. |
