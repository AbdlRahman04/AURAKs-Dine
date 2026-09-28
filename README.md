# QuickDineFlow

QuickDineFlow is a full-stack cafeteria ordering app. Students can browse the menu, place orders, pay with Stripe, save favorites, and track order status. Staff can manage menu items, orders, feedback, and analytics from the admin dashboard.

The application uses React/Vite, Node.js/Express, PostgreSQL, Drizzle ORM, and Stripe.

## Repository layout

| Path | Purpose |
| --- | --- |
| `client/` | React/Vite application, pages, reusable UI, and static assets. |
| `server/` | Express startup, configuration, database, authentication, and shared infrastructure. |
| `features/` | Business modules for authentication, menu, orders, payments, favorites, and feedback. |
| `shared/` | Schemas and TypeScript types shared by the client and server. |
| `migrations/` | Versioned database migrations. |
| `scripts/` | Database setup, smoke checks, and maintenance commands. |
| `docs/` | Maintained setup, architecture, operations, and project documentation. |

See the [documentation index](docs/README.md) for the recommended reading order.

## Run locally with PostgreSQL

This is the recommended setup while developing QuickDineFlow. You need Node.js **20.19+** (or **22.12+**) and a local PostgreSQL server. Stripe keys are only needed to try Stripe payments.

### 1. Install dependencies

From the project folder:

```powershell
npm install
```

### 2. Create `.env.local`

Create a file named `.env.local` in the project root and add the following. Replace `YOUR_POSTGRES_PASSWORD` with the password for your local PostgreSQL `postgres` user.

```env
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/quickdineflow
SESSION_SECRET=replace-with-a-random-secret
ADMIN_EMAIL=admin@quickdine.com
ADMIN_PASSWORD=choose-a-local-admin-password
PORT=5000
```

Generate a random session secret with Node.js:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Paste the generated value after `SESSION_SECRET=`. `.env.local` is loaded automatically and overrides `.env`; keep it private and do not commit it. If your PostgreSQL username is not `postgres`, use that username in `DATABASE_URL`. If the password contains URL-reserved characters such as `@` or `#`, URL-encode those characters.

To test Stripe checkout, also add your Stripe **test** keys:

```env
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

You can get test keys from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys). The app can start without them, but Stripe payments will not work.

### 3. Create and initialize the database

Start the PostgreSQL service, then run:

```powershell
npm run db:setup-local-full
```

This creates the `quickdineflow` database if needed, applies the schema, and adds sample menu data and an admin account. The database creation step connects to the default `postgres` database, so the PostgreSQL user in `DATABASE_URL` must be allowed to create databases. If the database already exists, use `npm run db:setup` to apply the schema and seed data.

The seed script requires `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters. It will not create or reset an administrator when either value is missing.

### 4. Start QuickDineFlow

```powershell
npm run dev
```

Open [http://localhost:5000](http://localhost:5000). Keep this terminal open while using the app. If port 5000 is already in use, stop the other process or change `PORT` in `.env.local` and open the matching port in your browser.

To check the API, visit [http://localhost:5000/api/health](http://localhost:5000/api/health). To run the smoke check, leave the app running and use a second terminal:

```powershell
npm run smoke
```

`npm run dev:separate` is available for frontend/backend debugging, but most local development only needs `npm run dev`.

## Hosted deployment (later)

Local PostgreSQL is the primary development target. Set up hosted deployment after the local app and database workflows are working.

### Free split deployment: Vercel + Render + Neon

The recommended free deployment uses Vercel for the React frontend, Render for the Express API, and Neon for PostgreSQL. Follow [`DEPLOYMENT.md`](DEPLOYMENT.md) and [`docs/RENDER_DEPLOY.md`](docs/RENDER_DEPLOY.md) for deployment instructions.

1. Push the repository to GitHub.
2. Create a Render web service connected to the repository.
3. Configure the Neon pooled connection string as `DATABASE_URL`.
4. Add these environment variables to the Render web service:

   - `STRIPE_SECRET_KEY`
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `FRONTEND_ORIGIN`
   - `APP_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`

5. Deploy the service. The build and start commands are:

   ```text
   npm install && npm run build
   npm run start
   ```

6. After the first deploy, open the Render service shell and initialize the Neon database:

   ```bash
   npm run db:setup
   ```

7. Deploy the frontend to Vercel with these build-time variables:

   - `VITE_API_URL` — the Render service URL
   - `VITE_STRIPE_PUBLIC_KEY` — the Stripe publishable test key

8. Verify the deployed health endpoint:

   ```text
   https://<your-service>.onrender.com/api/health
   ```

For a deployment smoke test from your local machine:

```bash
SMOKE_TARGET=render SMOKE_BASE_URL=https://<your-service>.onrender.com npm run smoke
```

See [`docs/RENDER_DEPLOY.md`](docs/RENDER_DEPLOY.md) for Render-specific operational notes.

Vercel hosts only the frontend in this architecture. The Express API, sessions, WebSockets, and PostgreSQL access remain on the Render backend and Neon database. See [docs/RENDER_DEPLOY.md](docs/RENDER_DEPLOY.md) for the cross-origin cookie and CORS requirements.

## Useful commands

| Command | Purpose |
|---|---|
| `npm run dev` | Run the integrated development server |
| `npm run dev:separate` | Run Vite and Express separately |
| `npm run build` | Build the frontend and production server |
| `npm run start` | Start the production build |
| `npm run check` | Run the TypeScript compiler check |
| `npm run db:push` | Push the database schema |
| `npm run db:seed` | Seed or reset the admin and sample menu data |
| `npm run db:setup` | Push the schema and seed the database |
| `npm run db:setup-local-full` | Create the local database, push schema, and seed data |
| `npm run smoke` | Run health, menu, and admin-login smoke tests |
| `npm run make-admin -- <email>` | Promote an existing user to admin |

## Menu images

Place local menu images in `client/public/menu-images/`. Reference them in the admin form with paths such as `/menu-images/iced-latte.jpg`.

## Security notes

- Never commit `.env`, `.env.local`, database passwords, session secrets, or real Stripe keys.
- Use Stripe test keys for local development.
- Use a unique, strong admin password and session secret in deployed environments.
- Do not treat the seeded development admin credentials as production credentials.

## More documentation

- [`docs/README.md`](docs/README.md) — documentation index and maintained source of truth
- [`docs/REPOSITORY_READINESS_CHECKLIST.md`](docs/REPOSITORY_READINESS_CHECKLIST.md) — GitHub-readiness phases and completion checks

- [`DEPLOYMENT.md`](DEPLOYMENT.md) — deployment and operations overview
- [`docs/RENDER_DEPLOY.md`](docs/RENDER_DEPLOY.md) — Render deployment details
- [`docs/DEVELOPMENT_GUIDE.md`](docs/DEVELOPMENT_GUIDE.md) — development workflow
- [`docs/guides/ADMIN_ACCESS.md`](docs/guides/ADMIN_ACCESS.md) — admin access management
- [`SECURITY.md`](SECURITY.md) — security and privacy notes
