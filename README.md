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

### Render: recommended full-stack deployment

The repository includes [`render.yaml`](render.yaml), which provisions a Render web service and Render PostgreSQL database.

1. Push the repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), choose **New → Blueprint** and select the repository.
3. Confirm the services defined in `render.yaml`.
4. Add these environment variables to the Render web service:

   - `STRIPE_SECRET_KEY`
   - `VITE_STRIPE_PUBLIC_KEY` — required during the frontend build
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`

   Render supplies `DATABASE_URL` from the linked PostgreSQL database and generates `SESSION_SECRET` from the blueprint.

5. Deploy the service. The build and start commands are already configured:

   ```text
   npm install && npm run build
   npm run start
   ```

6. After the first deploy, open the Render service shell and initialize the database:

   ```bash
   npm run db:setup
   ```

7. Verify the deployed health endpoint:

   ```text
   https://<your-service>.onrender.com/api/health
   ```

For a deployment smoke test from your local machine:

```bash
SMOKE_TARGET=render SMOKE_BASE_URL=https://<your-service>.onrender.com npm run smoke
```

See [`docs/RENDER_DEPLOY.md`](docs/RENDER_DEPLOY.md) for Render-specific operational notes.

### Vercel: frontend-only option

The current repository is not configured for a complete Vercel deployment. The Express server starts a long-running process, uses server-side sessions, and supports WebSockets; the frontend also calls same-origin `/api` and `/ws` routes. There is no `vercel.json` or Vercel serverless adapter in the project.

To use Vercel, deploy the backend and database on Render (or another Node-compatible host) first, then adapt the frontend to use the backend URL and configure CORS, cookies, API routing, and WebSockets. After that adaptation, deploy the Vite frontend to Vercel with:

```bash
npm install
npm run build
```

For the current codebase, deploy the combined application to Render instead.

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
- [`docs/guides/DEVELOPMENT_GUIDE.md`](docs/guides/DEVELOPMENT_GUIDE.md) — development workflow
- [`docs/guides/ADMIN_ACCESS.md`](docs/guides/ADMIN_ACCESS.md) — admin access management
- [`SECURITY.md`](SECURITY.md) — security and privacy notes
