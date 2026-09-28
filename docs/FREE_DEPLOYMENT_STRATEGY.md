# QuickDineFlow Free Deployment Strategy

## Target architecture

```text
Browser
  ↓
Vercel React frontend
  ↓ HTTPS API requests
Render Express backend
  ↓
Neon PostgreSQL
```

This setup keeps the existing full-stack application while using free hosting tiers for development, demonstrations, portfolio use, and small groups of users.

## Platform responsibilities

| Platform | Responsibility |
|---|---|
| Vercel | React/Vite frontend and static assets |
| Render | Express API, sessions, Stripe server logic, and WebSocket support |
| Neon | PostgreSQL database |

## Free-tier limitations

- The Render backend may sleep after inactivity.
- The first request after sleep may be slow.
- Neon has storage, compute, and connection limits.
- Free tiers are not intended for high traffic or guaranteed production uptime.
- Stripe must remain in test mode until production security and billing are approved.

## Required environment variables

### Vercel frontend

```ini
VITE_API_URL=https://your-backend.onrender.com
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Render backend

```ini
NODE_ENV=production
DATABASE_URL=<Neon pooled PostgreSQL URL>
SESSION_SECRET=<strong-random-secret>
FRONTEND_ORIGIN=https://your-frontend.vercel.app
APP_URL=https://your-frontend.vercel.app
STRIPE_SECRET_KEY=sk_test_...
ADMIN_EMAIL=<production-admin-email>
ADMIN_PASSWORD=<strong-password>
```

`VITE_STRIPE_PUBLIC_KEY` is public frontend configuration and belongs on Vercel. `STRIPE_SECRET_KEY`, `DATABASE_URL`, and `SESSION_SECRET` must remain on Render only.

## Phased implementation

### Phase 1: Separate frontend API configuration

- Find frontend requests that currently use same-origin `/api` paths.
- Add a shared API base URL using `import.meta.env.VITE_API_URL`.
- Preserve `/api` as the local development fallback.
- Ensure authenticated requests send credentials.

### Phase 2: Configure cross-origin backend access

- Add explicit CORS handling to Express.
- Allow the exact `FRONTEND_ORIGIN` in production.
- Allow localhost origins only during development.
- Configure production session cookies with HTTPS and `sameSite: "none"`.

### Phase 3: Create the Neon database

- Create a Neon PostgreSQL project.
- Copy its pooled connection string.
- Set it as `DATABASE_URL` on Render.
- Run the schema and seed setup only against the intended database:

```bash
npm run db:setup
```

### Phase 4: Deploy the backend to Render

Use:

```text
Build command: npm install && npm run build
Start command: npm run start
Health check: /api/health
```

Confirm the backend health endpoint works before deploying the frontend.

### Phase 5: Deploy the frontend to Vercel

Configure:

```text
Framework: Vite
Build command: npm run build
Output directory: dist
```

Set `VITE_API_URL` to the public Render backend URL and configure SPA fallback behavior for routes such as `/menu`, `/checkout`, and `/admin`.

### Phase 6: Validate the deployed application

Test:

- registration and login;
- session persistence after refresh;
- menu browsing and cart operations;
- checkout and order history;
- favorites and feedback;
- admin login and order management;
- health check and backend logs.

Run local validation before deployment:

```bash
npm run check
npm run build
npm run smoke
```

## Definition of done

The deployment is complete when:

- Vercel serves the React frontend;
- Render serves the Express API;
- Neon stores the PostgreSQL data;
- cross-origin authentication works;
- orders persist correctly;
- no secrets are committed or exposed;
- free-tier limitations are documented.

For detailed service instructions, see [DEPLOYMENT.md](../DEPLOYMENT.md) and [RENDER_DEPLOY.md](RENDER_DEPLOY.md).
