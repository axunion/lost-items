---
description: Squash all migrations into a single clean file before release — deletes migration history and local data, then regenerates from the current schema. Use before a release to consolidate accumulated dev migrations. NEVER touches production.
argument-hint: ""
allowed-tools:
  - Bash
---

Squash all migrations into a single clean baseline before release.

All accumulated migration files are discarded and regenerated as one file from the current schema.
Local data is lost. **Production is never affected.**

Steps:
1. Warn the user:
   - All files in `migrations/` will be deleted
   - Local D1 data (`.wrangler/state/v3/d1`) will be deleted
   - Ask for confirmation before proceeding.
2. If confirmed, run `pnpm db:reset`:
   - Deletes `migrations/` and `.wrangler/state/v3/d1`
   - Runs `pnpm db:generate` to create a single `0000_*.sql` from the current schema
   - Runs `pnpm db:migrate` to apply it to a fresh local DB
3. Show the name of the generated migration file and confirm success.
4. If the user declines, abort with no changes.

**Important**: Never touch the remote database. Production migrations are applied via CI only.
