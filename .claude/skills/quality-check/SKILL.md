---
description: Run lint, tests, and build check. Pass --fix to auto-fix lint issues.
disable-model-invocation: false
argument-hint: "[--fix]"
allowed-tools:
  - Bash
---

Run the full quality check pipeline.

If the argument is `--fix`, run `pnpm check:write` instead of `pnpm check` to auto-fix lint/format issues.

Steps:
1. Run `pnpm check` (or `pnpm check:write` if `--fix` was passed)
2. Run `pnpm test --run`
3. Run `pnpm build`

Report the results of each step. If any step fails, show the error output and suggest how to fix it.
