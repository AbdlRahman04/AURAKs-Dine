# Feature Development Prompt

Copy and paste into Cursor when updating or creating a feature.

---

Task: Update/create the "{FEATURE_NAME}" feature in QuickDineFlow.

Hard constraints

- Do NOT modify platform/core files unless the plan explicitly requires it.
  Core = `server/index.ts`, `server/config.ts`, `server/db.ts`, `server/database.ts`, `server/registerFeatures.ts`
- Work primarily inside `features/{FEATURE_NAME}/` (self-contained, importable/exportable).
- Persist data in PostgreSQL. Store static assets under `client/public/` (paths in DB, not binary in DB).
- Increment `features/{FEATURE_NAME}/pack/manifest.json` version when shipping packable changes.

Required workflow — follow in order

1. Plan first. Do not write any code until you've produced a clear plan of exactly what needs to be created/changed.
2. Review the codebase and the guides (`docs/DEVELOPMENT_GUIDE.md`, `docs/RENDER_DEPLOY.md`). Treat the guides as possibly outdated: verify every relevant statement against the actual code and call out discrepancies.
3. Do not assume anything. Validate schema/tables, file paths, storage mechanism, APIs, config, auth/access rules, and where the version is defined before implementing.
4. Implement only after the plan is confirmed against the code.

Completion criteria

- Feature registers via `registerFeatures` without breaking other features.
- Run `npm run smoke` confirming the app loads (and pack export/import if the feature supports packs).
- Confirm data is written to PostgreSQL, files go under `client/public/`, and `manifest.json` version was incremented when applicable.
