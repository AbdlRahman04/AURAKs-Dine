# QuickDineFlow — Project Brief

**Owner:** QuickDineFlow project team
**Status:** Building / development
**Last updated:** 2026-09-27

## Problem

Students may need to wait in cafeteria queues to order and collect food. Cafeteria staff also need a reliable way to manage menu items, incoming orders, kitchen status, and customer feedback.

## Intended users

- **Primary user:** Students ordering cafeteria food.
- **Other users:** Administrators and kitchen staff managing menus and orders.
- **Context:** A web browser or installed Progressive Web App, generally before or during a cafeteria visit.

## Proposed solution

QuickDineFlow provides a student menu and cart, authenticated checkout and order history, favorites, feedback, and payment support. An admin interface provides menu management, order management, kitchen display, user management, and analytics.

## First release

### Must have

- Browse menu items and manage a cart.
- Register, log in, and manage a profile.
- Place and view orders.
- Allow administrators to manage menu items and order status.
- Provide local PostgreSQL development and Render PostgreSQL deployment paths.

### Later

- Additional payment and operational integrations.
- More advanced analytics and production hardening.

### Out of scope

- Storing real payment-card data.
- Committing secrets or real user data to the repository.
- Treating development test credentials as production credentials.

## Success measures

- A student can complete the menu-to-order flow locally.
- An administrator can see and update incoming orders.
- TypeScript checks, production builds, and smoke tests pass for supported changes.
- A new developer can set up the project by following `README.md`.

## Constraints and assumptions

- Node.js 18+ and PostgreSQL are available for local development.
- Stripe test keys are used during development.
- `DATABASE_URL` identifies the active database; local PostgreSQL is preferred for day-to-day development.
- Render is the documented deployment target.
