# Repository Readiness Checklist

Use this checklist to prepare QuickDineFlow for a clean, reviewable GitHub push. Work through the phases in order. Preserve the current working changes; do not discard or overwrite them while organizing the repository.

## Phase 1 — Protect and inventory the current work

- [x] Review `git status --short` and identify every modified, untracked, and ignored file that relates to the current work.
- [x] Keep the current feature and design changes intact; do not reset, clean, or overwrite the working tree as a cleanup shortcut.
- [x] Separate application source, migrations, project documentation, generated output, local setup files, and personal IDE state.
- [x] Confirm `.env` and `.env.local` are ignored and not tracked. Check for credentials in files intended for GitHub without printing local secret files.
- [x] Decide which ignored documents are project deliverables and which are obsolete or personal before changing ignore rules.

**Current findings to resolve:** the working tree contains a large set of modified and untracked application changes; `.env` and `.env.local` are ignored; `.gitignore` excludes all of `Project Documentation/` and Markdown files directly inside `database/`. This means useful documents may be omitted from GitHub unless reviewed and intentionally relocated or unignored.

## Phase 2 — Settle the repository structure

- [x] Agree on one canonical home for project documentation under `docs/`.
- [x] Review `Project Documentation/FUNCTIONAL_REQUIREMENTS.md`, `PROJECT_DOCUMENTATION.md`, and `UML_DIAGRAMS.md` for accuracy, useful content, duplication, and outdated platform instructions.
- [x] Review `database/HOW_TO_USE_BOTH_DATABASES.md` and `database/VERIFICATION_CLASS_DIAGRAM_VS_SQL.md`; retain useful database references in `docs/database/` and update links that point to moved files. The verification document was not present in this checkout.
- [x] Keep source code in the existing `client/`, `server/`, `features/`, `shared/`, `scripts/`, and `migrations/` boundaries unless a concrete issue justifies a change.
- [x] Keep generated and machine-local content out of the committed tree (`node_modules/`, `dist/`, `.local/`, local environment files, and personal IDE state).
- [x] Remove or archive files only after checking whether they are referenced by source code, package scripts, deployment configuration, or documentation. No source or project asset was removed in this phase.

## Phase 3 — Make GitHub inclusion rules intentional

- [x] Review `.gitignore` rules one by one. Replace broad documentation exclusions with specific local-only paths where appropriate.
- [x] Confirm required source, migrations, assets, and maintained documentation are not accidentally ignored.
- [x] Confirm generated files, environment secrets, logs, editor state, and local database artifacts remain ignored.
- [x] Check the final candidate files with `git status --short` and `git check-ignore -v <path>` for any file that seems unexpectedly missing.
- [x] Inspect the final diff and staged-file list for credentials, personal data, temporary exports, and unrelated local configuration.

## Phase 4 — Make project documentation consistent

- [x] Update `README.md` so local setup, required environment variables, scripts, and deployment links match the current code.
- [x] Check `PROJECT_BRIEF.md`, `ARCHITECTURE.md`, `SECURITY.md`, and `DEPLOYMENT.md` against the implemented application and each other.
- [x] Reconcile implementation-status and setup guides with the current features; remove stale claims and broken paths.
- [x] Ensure development credentials are clearly labeled as examples and cannot be mistaken for production credentials.
- [x] Add a concise top-level repository map and links to the canonical setup, architecture, security, and deployment documents.

## Phase 5 — Validate a push-ready snapshot

- [x] Run `npm run check` and resolve relevant TypeScript errors.
- [x] Run `npm run build` and confirm the production build completes.
- [x] Run `npm run smoke` with the required local database, server, and environment configuration; record any exact blocker.
- [x] Review database/schema/migration changes together and confirm setup documentation describes how to apply them.
- [x] Review `git diff --check`, `git diff --stat`, and the full staged diff.
- [x] Prepare one staged release candidate. A commit and push remain a separate, explicit action.

**Ready-to-push acceptance:** all intended source and project documents are included; secrets, generated output, and local-only files are excluded; setup and deployment instructions match the code; required checks pass or have their precise blockers recorded; and the final diff is understandable as a set of related changes.

### Validation record — 2026-09-28

- [x] `npm run check` passed.
- [x] `npm run build` passed.
- [x] `npm run smoke` passed against a temporary local server on port `5001`.
- [x] Local Markdown links resolve, the staged diff has no whitespace errors, and the 99 staged files contain no common live-token or private-key signatures.

## Later phases — Product polish and portfolio deployment

Keep these separate from repository organization so the GitHub cleanup remains reviewable.

### Phase 6 — UI refinement

- [x] Choose the highest-impact student or staff flow based on observed usability issues.
- [x] Review responsive behavior, keyboard access, readable loading/error states, and English/Arabic RTL layout in that flow.
- [x] Make focused visual changes and review the resulting screens at mobile and desktop sizes.

**Implementation update — 2026-09-28:** The student menu → cart → checkout flow was selected as the highest-impact ordering journey. Translation, RTL-aware cart placement and directional UI, keyboard-safe menu-card controls, focus treatment, persistent checkout loading/error/retry feedback, and deferred card-payment loading are implemented. `npm run check`, `npm run build`, and `npm run smoke` passed. An interactive browser pass at 1440×900 and 375×812 verified the authenticated menu → cart → cash-checkout-review path without submitting an order; English desktop and English/Arabic mobile layouts had no horizontal page overflow. The mobile navigation was corrected to wrap all links rather than clip the final link. Enter, Tab, Escape, dialog focus return, validation alerts, retry recovery, and loading-status semantics were reviewed and corrected where needed. Card payment was not attempted because configured Stripe test keys were not supplied; that confirmation is recorded as skipped in the performance checklist.

### Phase 7 — Latency and performance

- [ ] Record the slow user actions and measure where time is spent before changing code.
- [ ] Measure client load, API response, database queries, and large lists separately where relevant.
- [ ] Make targeted changes, then compare measurements and confirm the main ordering flows still work.

**Implementation update — 2026-09-28:** The first-order eligibility check now uses authenticated `GET /api/orders/summary` with an indexed existence lookup instead of hydrating an orders page. Local API and `EXPLAIN (ANALYZE, BUFFERS)` measurements, including an isolated 120-item menu fixture that was removed after testing, are recorded in `docs/guides/ADMIN_UX_PERFORMANCE_CHECKLIST.md`. A current Chrome pass on the local app confirmed 20 menu cards, 17 lazy-loaded images out of 22 images, debounced search returning 3 chicken matches and restoring all 20 items, and no desktop DOM overflow. `npm run check`, `npm run build`, and `npm run smoke` passed. This is still not a controlled before/after browser benchmark: the pre-change baseline, cache-disabled desktop/mobile and Fast 3G runs, client render/resource timings, long tasks, Web Vitals, and cart-to-checkout timing remain pending, so keep Phase 7 open until those comparison and acceptance checks pass.

### Phase 8 — Portfolio deployment

- [ ] Select the public host and configure production secrets outside the repository.
- [ ] Deploy from the reviewed GitHub revision and initialize the production database using the documented process.
- [ ] Verify health, authentication, menu browsing, checkout/payment configuration, order updates, and admin access on the deployed site.
- [ ] Prepare a portfolio entry with a short product description, screenshots, feature summary, and a link to the live app and repository.
