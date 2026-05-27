# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server (workerd runtime via @astrojs/cloudflare)
pnpm build            # Build for production (verification only — deploy via CI)
pnpm preview          # Preview production build on local workerd

pnpm check            # Biome lint/format + astro check (TS type errors)
pnpm fix              # Biome auto-fix (format/lint only)

pnpm test             # Run unit tests (Vitest)
pnpm test -- src/server/routes/lists.test.ts  # Run a single test file
pnpm test:e2e         # Run e2e tests (Playwright, dev server auto-starts via webServer)
pnpm test:e2e:headed  # Same, with browser visible (debugging)

pnpm db:generate      # Generate Drizzle migration from schema changes
pnpm db:migrate       # Apply migrations locally
pnpm db:reset         # Delete migration history and regenerate from current schema (local only, data is lost)
```

## Architecture

**Astro 6 SSR + Hono API on Cloudflare Workers.** Pages are server-rendered by Astro; interactive islands use SolidJS with `client:load`. The API is a standalone Hono app mounted at `/api` via a catch-all Astro route.

### Request flow

```
Browser → Astro SSR (pages/*.astro)     → D1 via Drizzle (server-side data fetching)
       → Hono API  (api/[...route].ts)  → D1 / R2 (client-side mutations)
```

### mockDebugPlugin (astro.config.mjs)

A Vite plugin that stubs the `debug` npm package. Required because `debug` uses CJS `module.exports` which is unavailable in the workerd runtime. This is a workaround for a transitive dependency issue in the Astro ecosystem, not a project code concern.

## Commit message conventions

Use conventional prefixes with **English** message body:

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Formatting, no logic change
- **refactor**: Code restructure without behavior change
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **chore**: Build config, tooling, dependencies

## Code quality workflow

After making changes, verify in this order:

1. `pnpm check` — Biome lint/format + TypeScript type check (`astro check`); Biome auto-fix only with `pnpm fix`
2. `pnpm test --run` — Unit tests (Vitest)
3. `pnpm build` — Production build succeeds

## Additional configuration

- **`.claude/rules/`** — Context-specific guidelines auto-loaded by glob pattern:
  - `frontend.md` — SolidJS components, UI design system (`src/components/**`, `src/pages/**`)
  - `backend.md` — Hono API patterns, bindings, R2 (`src/server/**`)
  - `testing.md` — Unit/E2E test patterns (`src/**/*.test.*`, `tests/e2e/**`)
  - `database.md` — Drizzle schema, migrations, soft delete (`src/server/db/**`, `migrations/**`)
- **`.claude/settings.json`** — Shared config: sandbox (enabled + autoAllowBashIfSandboxed), deny list for destructive git/rm/credential ops, PostToolUse hook (Biome auto-fix on `src/**` edits)
- **`.mcp.json`** — MCP servers: `context7` (live docs lookup)
- **`.claude/agents/`** — Custom agents: `@code-reviewer`, `@test-writer`, `@db-reviewer`
- **`.claude/skills/`** — Slash commands: `/db-migrate`, `/db-reset`, `/quality-check [--fix]`, `/new-component <Name> [ui|features]`
