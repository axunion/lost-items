---
name: db-migrate
description: Generate, safety-review, and apply Drizzle database migrations to the local database after schema changes. Use when the Drizzle schema has been updated and the local database needs to be synced, or when applying existing unapplied migrations (e.g., after a git pull).
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
3. Review the SQL against the safety checklist below, then show the SQL together with any flagged issues and ask for confirmation before applying.
4. Run `pnpm db:migrate` to apply to the local database.

**Important**: Never apply migrations without showing the SQL first.

## Safety checklist (D1 / SQLite)

- **DROP TABLE / DROP COLUMN**: Irreversible on D1 — confirm data is either backed up or the column/table is provably unused
- **NOT NULL without DEFAULT**: Fails at migration time if existing rows have NULLs — check whether existing data must be backfilled
- **Column renames**: Drizzle generates `DROP COLUMN + ADD COLUMN` — this destroys existing data; flag unless handled manually
- **Foreign key changes**: Verify `ON DELETE` behavior is intentional (D1 enforces FK constraints when `PRAGMA foreign_keys = ON`)
- **Type changes**: SQLite is loosely typed, but changing `integer` ↔ `text` semantics can break application queries
- **Physical `DELETE` statements**: Deletion must use the soft delete pattern (`deletedAt`); a physical `DELETE` in a migration requires explicit justification
- **Timestamp columns**: Must use `integer` (Unix seconds) per project convention — not `text` or `datetime`
