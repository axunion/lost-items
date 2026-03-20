---
description: Generate and apply Drizzle migrations. Accepts optional argument: local (default) or prod.
disable-model-invocation: true
argument-hint: "[local|prod]"
allowed-tools:
  - Bash
  - Read
  - Glob
---

Generate and apply database migrations.

The argument specifies the target environment: `local` (default) or `prod`.

Steps:
1. Run `pnpm db:generate` to generate migration files from schema changes
2. List and read the newly generated migration files in `migrations/` to show what will be applied
3. Ask for confirmation before applying (show the migration SQL)
4. If target is `local` (or no argument): run `pnpm db:migrate`
5. If target is `prod`: run `pnpm db:migrate:prod`

**Important**: Always show the migration content before applying. For `prod`, explicitly warn that this modifies the production database and require confirmation.
