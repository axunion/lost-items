---
description: Generate and apply Drizzle database migrations after schema changes. Use when the Drizzle schema has been updated and the database needs to be synced, or when applying existing unapplied migrations (e.g., after a git pull). Accepts optional argument: local (default) or prod.
disable-model-invocation: true
argument-hint: "[local|prod]"
allowed-tools:
  - Bash
  - Read
---

Generate and apply database migrations.

The argument specifies the target environment: `local` (default) or `prod`.

Steps:
1. Run `pnpm db:generate` to generate migration files from schema changes.
   - If the output indicates no schema changes (no new file created), skip to step 3 — the user may want to apply an already-generated migration.
2. List and read the newly generated migration file(s) in `migrations/` to show what will be applied.
3. Show the migration SQL and ask for confirmation before applying.
   - For `prod`, explicitly warn that this modifies the production database and require confirmation.
4. If target is `local` (or no argument): run `pnpm db:migrate`
5. If target is `prod`: run `pnpm db:migrate:prod`

**Important**: Never apply migrations without showing the SQL first. For `prod`, treat any `DROP` or `NOT NULL` operation as a blocker worth flagging.
