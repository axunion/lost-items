---
description: Run the full quality check pipeline (Biome lint, Vitest unit tests, production build). Use before committing, when verifying changes are clean, or when the user asks to check, test, or validate the codebase. Pass --fix to auto-fix lint/format issues.
disable-model-invocation: false
argument-hint: "[--fix]"
allowed-tools:
  - Bash
---

Run the full quality check pipeline.

If the argument is `--fix`, run `pnpm fix` instead of `pnpm check` to auto-fix lint/format issues.

Steps:
1. Run `pnpm check` (or `pnpm fix` if `--fix` was passed)
2. Run `pnpm test --run`
3. Run `pnpm build`

Report the results of each step. If any step fails, show the error output and suggest how to fix it.
