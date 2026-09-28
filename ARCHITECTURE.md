# QuickDineFlow — Architecture

**Last updated:** 2026-09-27

## Goals and design principles

- Keep the frontend, backend, shared types, and business features separated.
- Keep feature-specific backend behavior modular and independently understandable.
- Use the database as the source of truth for users, menu items, orders, feedback, favorites, and payment records.
- Make local development and deployment use the same application build with environment-specific configuration.

## System overview

QuickDineFlow is a TypeScript React/Vite and Express application. In integrated mode, Express serves the API and the built frontend. In separate development mode, Vite serves the frontend while Express serves API routes.

```text
Browser / PWA
    ↓
client/src pages, components, contexts, and React Query
    ↓ HTTP API
server/index.ts → server/routes.ts → feature routes
                                      ↓
                              feature storage
                                      ↓
                              PostgreSQL database
```

## Components

| Component | Responsibility | Owns data? | Talks to |
|---|---|---:|---|
| `client/` | Student and admin user interfaces | No | Express API |
| `server/` | HTTP server, configuration, authentication, database infrastructure | No | Client, feature modules, database, Stripe |
| `features/auth/` | Registration, login, user access, and authentication behavior | Users/auth records | Server, database |
| `features/menu/` | Menu browsing and menu administration | Menu records | Server, database |
| `features/orders/` | Cart checkout requests, order retrieval, and order status | Order records | Server, database |
| `features/favorites/` | User menu favorites | Favorite records | Server, database |
| `features/feedback/` | Customer feedback and administration | Feedback records | Server, database |
| `features/payments/` | Payment-related API and storage behavior | Payment records | Server, Stripe, database |
| `shared/` | Shared schemas and types | No | Client and server |

## Data

- **Main records:** users, menu items, orders, order items, favorites, feedback, audit logs, and payment methods.
- **Source of truth:** PostgreSQL through Drizzle ORM and the feature storage modules.
- **Retention/deletion:** Follow the current database and deployment documentation; do not add destructive deletion behavior without an explicit requirement.

## Identity and permissions

The application supports authenticated users and administrator access. Frontend routes use authentication and admin guards, while backend routes must enforce authorization independently. Frontend guards are not a security boundary by themselves.

## Configuration

- Local secrets and connection settings belong in `.env` or `.env.local` and must not be committed.
- `.env.example` documents expected variable names without real secret values.
- Hosted deployment configuration is documented in `DEPLOYMENT.md` and `docs/RENDER_DEPLOY.md`.
- `NODE_ENV`, `DATABASE_URL`, `SESSION_SECRET`, and Stripe keys differ by environment.

## Important trade-offs

- Feature modules keep business logic organized, but shared database changes may require updates across multiple feature schemas and storage layers.
- Integrated mode is simpler for deployment; separate mode is useful when frontend and backend development need independent processes.
- The current project is a development-oriented system and requires additional production security review before handling real users or payments.
