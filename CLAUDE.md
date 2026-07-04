# CLAUDE.md

Guidance for Claude Code when working with this repository.
Keep this file in sync with `AGENTS.md` — edit both when changing either.

## Working principles

- **Think before coding.** State assumptions; if uncertain, ask. Surface multiple
  interpretations instead of silently picking one. Push back when a simpler path exists.
- **Simplest thing that works.** Write the minimum code that solves the stated problem —
  no speculative abstractions, flexibility, or error handling for impossible cases.
- **Surgical changes.** Every changed line should trace to the request. Don't refactor or
  reformat adjacent code that isn't broken; match the surrounding style. Remove only the
  imports your change orphaned; leave unrelated dead code and mention it.
- **Goal-driven.** Turn each task into a verifiable outcome (e.g. "fix the bug" → write a
  failing test, then make it pass). For multi-step work, state a brief plan with a
  verification check per step.
- **English only** in code comments, console/log/error messages, and AI-readable config
  (CLAUDE.md, AGENTS.md, etc.).

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
pnpm db:reset         # Clear local DB data and re-apply existing migrations (local only)
pnpm db:rebuild       # Nuke migration files + local DB and regenerate from current schema (local only, use after major schema rework)
```

## Architecture

**Astro 7 SSR + Hono API on Cloudflare Workers.** Pages are server-rendered by Astro; interactive islands use SolidJS with `client:load`. The API is a standalone Hono app mounted at `/api` via a catch-all Astro route.

### Request flow

```
Browser → Astro SSR (pages/*.astro)     → D1 via Drizzle (server-side data fetching)
       → Hono API  (api/[...route].ts)  → D1 / R2 (client-side mutations)
```

### mockDebugPlugin (astro.config.mjs)

A Vite plugin that stubs the `debug` npm package. Required because `debug` uses CJS `module.exports` which is unavailable in the workerd runtime. This is a workaround for a transitive dependency issue in the Astro ecosystem, not a project code concern.

## Code quality workflow

After making changes, verify in this order:

1. `pnpm check` — Biome lint/format + TypeScript type check (`astro check`); Biome auto-fix only with `pnpm fix`
2. `pnpm test --run` — Unit tests (Vitest)
3. `pnpm build` — Production build succeeds

Write tests before or alongside implementation — they are the success criteria. Test
observable outcomes and edge cases, not implementation details; keep each test
self-contained with no shared mutable state.

## Code structure

- Name variables, functions, and files to communicate intent.
- One concern per file; split when a file exceeds ~300 lines.
- Extract a helper only when used in 3+ places; otherwise inline it.
- Delete dead code you create; never comment it out.

## Commits

```
<one-line summary>

<Why: one sentence — motivation or problem>

- <change 1>
- <change 2>
```

- Summary: imperative mood, ≤70 chars, no trailing period, no prefix tags (`feat:`, `fix:`).
- Why line: include only when motivation isn't evident from the diff.
- Bullets: include only for 2+ distinct changes.
- Never commit secrets (`*.key`, `*.pem`, `credentials*`); never use `--no-verify` or `--amend`.

## Additional configuration

- **`DESIGN.md`** — Visual design specification: color palette (Trust Blue primary, amber/green
  status colors), typography, component sizing, layout, and elevation. Source of truth for all
  design decisions; `src/styles/global.css` implements these tokens — if they ever
  disagree, treat `DESIGN.md` as correct and fix the CSS.
- **`.claude/rules/`** — Context-specific guidelines auto-loaded by glob pattern:
  - `frontend.md` — SolidJS components, UI design system (`src/components/**`, `src/pages/**`)
  - `backend.md` — Hono API patterns, bindings, R2 (`src/server/**`)
  - `testing.md` — Unit/E2E test patterns (`src/**/*.test.*`, `tests/e2e/**`)
  - `database.md` — Drizzle schema, migrations, soft delete (`src/server/db/**`, `migrations/**`)
- **`.claude/settings.json`** — Shared config: MCP server enablement (`context7`)
- **`.mcp.json`** — MCP servers: `context7` (live docs lookup)
- **`lefthook.yml`** — Git pre-commit hooks: Biome auto-fix (staged files) + `astro check`, runs in parallel
- **`.claude/agents/`** — Custom agents: `@code-reviewer`, `@test-writer`, `@db-reviewer`
- **`.claude/skills/`** — Slash commands: `/db-migrate`, `/quality-check [--fix]`, `/new-component <Name> [ui|features]`
