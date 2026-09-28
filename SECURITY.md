# QuickDineFlow — Security and Privacy Notes

**Last reviewed:** 2026-09-27

## Data and trust boundaries

- **Data handled:** Account information, menu data, orders, feedback, session data, and payment-related records.
- **Trust boundaries:** Browser clients, Express API routes, PostgreSQL, Stripe, and the Render deployment environment.
- **Threats considered:** Unauthorized admin access, leaked credentials, untrusted request input, session misuse, and accidental exposure of sensitive logs or configuration.

## Access

- **Authentication:** Application authentication is implemented by the auth feature and server session/authentication infrastructure.
- **Password resets:** Reset credentials are random, expire after 30 minutes, and are single-use. PostgreSQL stores only their SHA-256 hashes. Reset links are delivered through Resend when `APP_URL`, `RESEND_API_KEY`, and `PASSWORD_RESET_FROM_EMAIL` are configured.
- **Authorization:** Admin-only behavior must be enforced on the server as well as represented by frontend route guards.
- **Profile updates:** The profile API accepts only the explicit user-editable fields; role, password, account IDs, and payment identifiers cannot be changed through that endpoint.
- **Administrative access:** Use a controlled admin account and change development test credentials before any real deployment.

## Secrets and sensitive data

- Store secrets in environment variables or the deployment provider's secret configuration.
- Never commit `.env`, `.env.local`, real Stripe keys, database passwords, or session secrets.
- Use Stripe test keys during development.
- Do not log passwords, session secrets, payment secrets, or full sensitive user records.
- Treat the test admin credentials in `README.md` as development-only and replace them before deployment.

## External input and dependencies

- Validate and authorize API input at the server boundary.
- Keep database lookups and writes parameterized through Drizzle; do not construct SQL from request strings.
- Keep database writes inside the relevant feature storage layer.
- Do not trust client-provided roles, prices, ownership, or payment status.
- Review dependency and configuration changes before deployment.

## Incident and recovery

- If a secret is exposed, rotate it immediately in the relevant environment and remove it from future commits.
- If unauthorized access or data corruption is suspected, stop using affected credentials, inspect logs, and restore from the deployment/database provider's recovery options.

## Open risks

- Production authentication, session settings, rate limiting, audit logging, backup/restore, and payment flows require a dedicated production security review.
