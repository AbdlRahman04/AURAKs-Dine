# QuickDineFlow Free Deployment Strategy

**Status:** Proposed
**Deployment model:** Vercel + Render Free + Neon Free
**Application model:** Real React frontend, Express backend, and PostgreSQL database

## 1. Goal

Deploy QuickDineFlow with real authentication, orders, admin workflows, and PostgreSQL persistence while avoiding a paid hosting plan during initial development and demonstration.

This strategy keeps the existing full-stack application. It does not convert the project into a frontend-only prototype.

## 2. Target architecture

```text
Browser
  ↓
Vercel
  └── React/Vite frontend
          ↓ HTTPS API requests
Render Free Web Service
  └── Express backend
          ↓ private/external database connection
Neon Free PostgreSQL
```

## 3. Free-tier limitations

The deployment is intended for coursework, demonstrations, portfolio use, testing, and small groups of users.

Expected limitations include:

- Render may suspend or sleep the backend when inactive.
- The first request after inactivity may be slow.
- Neon storage, compute, and connection limits apply.
- Free services may not provide production-grade backups or uptime guarantees.
- Stripe must remain in test mode until a paid production-ready setup is approved.
- Free-tier terms and quotas can change; verify current provider limits before launch.

## 4. Required application changes

### 4.1 Frontend API base URL

The frontend must use a configurable API origin rather than assuming the frontend and backend share a domain.

Add the Vercel environment variable:

```ini
VITE_API_URL=https://your-backend.onrender.com
```

Centralize API URL handling in one frontend utility. Avoid hardcoding the Render URL in individual components.

The development fallback may remain:

```text
/api
```

when the frontend and backend are running together locally.

### 4.2 CORS

The Express backend must allow the deployed Vercel origin:

```text
https://your-frontend.vercel.app
```

The backend should allow credentials because the application uses authenticated sessions.

Recommended behavior:

- allow the configured production frontend origin;
- allow localhost origins only in development;
- reject unknown origins;
- do not use `*` with credentials.

### 4.3 Session cookies

Because the frontend and backend use different origins, production session cookies must support cross-site requests:

```ts
cookie: {
  secure: true,
  sameSite: "none",
}
```

The frontend request client must send credentials:

```ts
credentials: "include"
```

The exact cookie domain should be tested with the deployed Vercel and Render URLs. Do not set a broad cookie domain unless it is required and verified.

### 4.4 Build-time versus runtime secrets

Frontend variables are public after the Vite build. Only expose public values there.

Safe for Vercel frontend configuration:

```text
VITE_API_URL
VITE_STRIPE_PUBLIC_KEY
```

Never expose these in Vercel frontend variables:

```text
DATABASE_URL
SESSION_SECRET
STRIPE_SECRET_KEY
RESEND_API_KEY
```

Those belong only to the Render backend environment.

## 5. Phase-based implementation plan

### Phase 0: Preflight and branch setup

Create a deployment branch and verify the current project state.

Run:

```bash
npm run check
npm run build
```

Confirm that `.env`, `.env.local`, secrets, and local database credentials are not tracked by Git.

**Exit criteria:** the current application passes its existing checks and no secrets are committed.

### Phase 1: Separate frontend API configuration

Tasks:

1. Find all frontend `/api` requests.
2. Create a single API base URL utility.
3. Preserve `/api` as the local same-origin fallback.
4. Use `VITE_API_URL` when it exists.
5. Ensure requests that need sessions use `credentials: "include"`.

Suggested configuration behavior:

```ts
const API_BASE_URL = import.meta.env.VITE_API_URL || "";
```

**Exit criteria:** local development still works, and API requests can target a separate origin without component-specific URL changes.

### Phase 2: Harden Express for cross-origin deployment

Tasks:

1. Add explicit CORS configuration.
2. Read the allowed frontend origin from an environment variable.
3. Allow localhost only in development.
4. Configure credentials support.
5. Review session cookie settings for production HTTPS.
6. Confirm `/api/health` does not require authentication.

Suggested backend variable:

```ini
FRONTEND_ORIGIN=https://your-frontend.vercel.app
```

**Exit criteria:** a local frontend on a separate port can authenticate and call the backend successfully.

### Phase 3: Create Neon PostgreSQL

Tasks:

1. Create a Neon project and PostgreSQL database.
2. Copy the pooled connection string.
3. Keep the connection string out of Git.
4. Verify the connection locally using a temporary environment variable if needed.
5. Apply the schema only after confirming the target database.

Use:

```bash
npm run db:setup
```

Do not seed production-like credentials from a committed file. Use deployment-specific admin values.

**Exit criteria:** the application can connect to Neon and the schema/seed data is present.

### Phase 4: Deploy the Express backend to Render

Create a Render web service connected to the repository.

Configure:

```text
Build command: npm install && npm run build
Start command: npm run start
Health check: /api/health
```

Set backend variables:

```ini
NODE_ENV=production
DATABASE_URL=<Neon pooled connection string>
SESSION_SECRET=<strong random secret>
FRONTEND_ORIGIN=https://your-frontend.vercel.app
APP_URL=https://your-frontend.vercel.app
STRIPE_SECRET_KEY=<Stripe test secret>
RESEND_API_KEY=<optional>
PASSWORD_RESET_FROM_EMAIL=<optional>
ADMIN_EMAIL=<production admin email>
ADMIN_PASSWORD=<unique password of at least 12 characters>
```

Keep `VITE_STRIPE_PUBLIC_KEY` out of the backend unless the backend build specifically requires it. Configure it on Vercel for the frontend build.

**Exit criteria:** the Render URL returns a healthy response from `/api/health` and backend logs contain no startup/database errors.

### Phase 5: Deploy the React frontend to Vercel

Configure Vercel for the frontend build.

Recommended settings:

```text
Framework: Vite
Build command: npm run build
Output directory: dist
```

Set:

```ini
VITE_API_URL=https://your-backend.onrender.com
VITE_STRIPE_PUBLIC_KEY=<Stripe test public key>
```

Configure SPA fallback behavior so routes such as `/menu`, `/checkout`, and `/admin` load correctly on direct navigation.

**Exit criteria:** the Vercel site loads, static assets resolve, and browser requests reach the Render API.

### Phase 6: Cross-origin authentication and user-flow testing

Test from the deployed Vercel origin:

1. Register a user.
2. Log out and log in again.
3. Refresh the browser and confirm the session remains available.
4. Browse the menu.
5. Add items to the cart.
6. Complete the test checkout.
7. Confirm the order appears in order history.
8. Log in as the admin.
9. Update menu or order status.
10. Test feedback and favorites.

Use browser developer tools to confirm:

- API requests use the Render URL;
- cookies are sent on authenticated requests;
- CORS responses include the exact Vercel origin;
- no secret appears in frontend source or network responses.

**Exit criteria:** authentication and core user flows work across the two deployed origins.

### Phase 7: Production-readiness review

Before sharing the public URL:

- replace development admin credentials;
- use Stripe test keys only;
- configure a verified Resend sender if password resets are needed;
- confirm the Neon database is the intended target;
- verify logs do not expose secrets or passwords;
- document free-tier sleep behavior;
- verify a recovery/export process for important data;
- run the repository validation commands.

## 6. Validation commands

Run locally before deployment:

```bash
npm run check
npm run build
npm run smoke
```

Run the smoke test against the deployed backend or public application according to the script's supported target configuration.

If a check cannot run because the hosted database, secrets, or service is unavailable, record the exact reason instead of treating it as passed.

## 7. Rollback plan

If the split deployment fails:

1. Keep the existing source branch unchanged.
2. Disable the new Vercel deployment or point the domain back to the previous deployment.
3. Preserve the Neon database unless data corruption is confirmed.
4. Inspect Render logs and browser CORS/cookie errors.
5. Roll back application code separately from database changes.

Do not delete the database as a first troubleshooting step.

## 8. Definition of done

The free deployment is complete when:

- the frontend is live on Vercel;
- the backend is live on Render;
- PostgreSQL is live on Neon;
- `/api/health` responds successfully;
- frontend API requests use the configured backend URL;
- authentication cookies work across origins;
- orders persist in Neon;
- admin workflows work;
- Stripe remains in test mode;
- no secrets are committed or exposed;
- limitations of free-tier hosting are documented.

## 9. Long-term upgrade path

If usage increases, the architecture can remain the same:

- upgrade Render backend resources;
- upgrade Neon database resources;
- keep Vercel frontend deployment;
- add a custom domain;
- add monitoring and database backups;
- move Stripe from test to production only after security review.

This avoids rewriting the application when moving beyond free hosting.
