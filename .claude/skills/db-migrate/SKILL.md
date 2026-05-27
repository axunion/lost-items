---
name: db-migrate
description: Generate and apply Drizzle database migrations to the local database after schema changes. Use when the Drizzle schema has been updated and the local database needs to be synced, or when applying existing unapplied migrations (e.g., after a git pull).
disable-model-invocation: true
allowed-tools:
  - Bash
  - Read
---

Generate and apply database migrations to the local database.

Steps:
1. Run `pnpm db:generate` to generate migration files from schema changes.
   - If the output indicates no schema changes (no new file created), skip to step 3 — the user may want to apply an already-generated migration.
2. List and read the newly generated migration file(s) in `migrations/` to show what will be applied.
3. Show the migration SQL and ask for confirmation before applying.
4. Run `pnpm db:migrate` to apply to the local database.

**Important**: Never apply migrations without showing the SQL first. Flag any `DROP` or `NOT NULL` operation as worth reviewing carefully.
