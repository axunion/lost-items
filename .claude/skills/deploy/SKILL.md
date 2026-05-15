---
description: Deploy the app to Cloudflare Workers after running quality checks. Use this whenever the user wants to ship, release, go live, or push changes to production.
disable-model-invocation: true
allowed-tools:
  - Bash
---

Deploy to Cloudflare Workers after running quality checks.

Steps:
1. Run `pnpm check` — if it fails, stop and report the lint/format errors
2. Run `pnpm test --run` — if any tests fail, stop and report the failures
3. Check for unapplied production migrations by running `wrangler d1 migrations list lost-items-db --remote`. If any are pending, warn the user and ask whether to apply them first via `/db-migrate prod` before deploying.
4. Run `pnpm build && pnpm deploy` — deploy to Cloudflare Workers

If any step fails, abort immediately and report what failed. Do not proceed to the next step.
