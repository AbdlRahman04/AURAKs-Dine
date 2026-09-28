# QuickDineFlow Troubleshooting

## Application does not start

Confirm dependencies and environment configuration:

```bash
npm install
npm run check
```

Make sure `.env.local` exists and contains a valid `DATABASE_URL` and `SESSION_SECRET`. Start the application with:

```bash
npm run dev
```

If port `5000` is already in use, set another port in `.env.local`:

```env
PORT=5001
```

Then open `http://localhost:5001`.

## Database connection errors

Check that PostgreSQL is running and that the connection string points to the intended database:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/quickdineflow
```

Common causes:

- PostgreSQL is stopped;
- username or password is incorrect;
- the database does not exist;
- the connection string contains unescaped URL characters;
- a hosted database requires SSL or a pooled connection string.

For a new local database, run:

```bash
npm run db:setup-local-full
```

If the database already exists, run:

```bash
npm run db:setup
```

Do not manually create individual application tables unless the schema tools fail and the database has been reviewed first.

## Registration or login fails

1. Confirm the server is running.
2. Confirm the database schema has been applied.
3. Check the server terminal for the actual error.
4. Confirm the browser is calling the correct API origin.
5. Confirm cookies are enabled.

For the split deployment, verify:

- Vercel has `VITE_API_URL` set to the Render backend URL;
- Render has `FRONTEND_ORIGIN` set to the exact Vercel origin;
- authenticated requests send credentials;
- production cookies use HTTPS and `SameSite=None`.

## Admin access fails

Use the configured seed administrator or promote an existing user:

```bash
npm run make-admin -- your-email@example.com
```

Log out and log back in after changing the role so the session is refreshed. See [Admin Access](ADMIN_ACCESS.md).

## Health check fails after deployment

Open:

```text
https://your-backend.onrender.com/api/health
```

Then inspect Render logs for:

- missing environment variables;
- database connection failures;
- migration or seed errors;
- startup crashes.

The free Render service may sleep after inactivity. The first request after sleep can take longer than usual.

## Safe recovery process

1. Read the server logs before changing data.
2. Confirm the active `DATABASE_URL`.
3. Verify a database recovery option before schema changes.
4. Run `npm run db:push` only against the intended database.
5. Do not commit secrets while troubleshooting.
