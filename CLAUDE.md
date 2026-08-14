# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Working principles

- **Think before coding.** State assumptions. Make routine judgment calls yourself and note
  them; ask only when different interpretations would lead to materially different work. If
  a simpler path exists, say so and push back when warranted.
- **Surgical changes.** Match the surrounding style. Remove only the imports and symbols
  your change orphaned; leave unrelated dead code alone and mention it.
- **Goal-driven.** Turn each task into a verifiable outcome (e.g. "fix the bug" → write a
  failing test, then make it pass). For multi-step work, state a brief plan before starting.
- **English only** in code comments, console/log/error messages, AI-readable config
  (CLAUDE.md, etc.), and reader-facing docs (README and the like).

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
- One concern per file; split new code when a file exceeds ~300 lines. Don't split existing
  files unless asked.
- Extract a helper only when used in 3+ places; otherwise inline it.
- Delete dead code you create; never comment it out.

## Commits

```
<summary: imperative mood, ≤70 chars, no trailing period, no prefix tags (`feat:`, `fix:`)>

<motivation: one sentence, only when not evident from the diff>

- <change bullets: only for 2+ distinct changes>
```

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
- **`lefthook.yml`** — Git pre-commit hooks: Biome auto-fix (staged files) + `astro check`, runs in parallel
- **`.claude/skills/`** — Slash commands: `/db-migrate`, `/quality-check [--fix]`, `/new-component <Name> [ui|features]`
