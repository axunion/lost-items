# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Working principles

- **Think before coding.** State assumptions. If a simpler path exists, say so and push
  back when warranted.
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

**Structural vs. subjective correctness.** Structural correctness (API responses, state
transitions, soft-delete filtering) belongs in Vitest/Playwright and runs automatically as
part of verification. Subjective judgment ("does this look right", spacing, whether a status
color reads clearly per `DESIGN.md`) stays a human/live-check task — no script can reliably
judge it, and trying to force it (exhaustive automated browsing, screenshot-diffing without
real need) tends to be slow and still miss what a human would notice at a glance. Persist a
new regression test only for a durable, worth-protecting flow — ideally one with real
evidence it can break — not for a one-off "let me verify this change" check.

## Subagents

Beyond the built-in `Explore` (local code search) and `Plan` agents, this project defines
four read-only or test-only subagents in `.claude/agents/`: `researcher`, `reviewer`,
`tester`, and `inspector`. **None of them write implementation code — the main
conversation does, at every tier below.** A subagent's real product would be the working
tree rather than the summary it returns, and each retry would re-spawn it with no memory
of the code it just wrote; what these agents provide instead is a check from something
that didn't write the code, which survives that limitation fine.

Scale the response to the size and risk of the task:

- **Trivial** (one-line fixes, typos, config tweaks): implement directly, no agents.
- **Non-trivial but contained** (a self-contained change in one area): implement directly.
  Optionally run one research pass first — the built-in `Explore` to confirm an existing
  convention, or `researcher` when the change leans on an unfamiliar external API (Astro's
  Cloudflare adapter, Kobalte, Hono on Workers). Afterward, run `reviewer` and `tester` in
  parallel automatically, **without asking first** — both are read-only/test-only, so the
  cost of running them is low and they exist specifically to catch what a self-review
  misses.
- **Large, ambiguous, or high-risk** (spans many files, substantially touches
  `src/server/routes/`, `src/server/images.ts`, or `src/server/db/schema.ts`, or the task
  itself is genuinely ambiguous): propose that the user drive it with the built-in `/goal`
  command, with a completion condition that explicitly requires `reviewer` reporting no
  findings and `tester` passing — not just "implement X". Once set, repeat
  research (`Explore` + `researcher` in parallel) → implement → `reviewer` + `tester` in
  parallel across turns until the evaluator confirms the condition holds.

**Visual-verification gate** (a separate axis from the tiers above — applies whenever a
change touches rendered UI, regardless of tier):

- No rendered surface touched: skip, no browser involved.
- Small, isolated, single-property UI tweak: a quick manual glance at the running app is
  enough.
- Layout that can vary by viewport, a change spanning multiple components sharing styles,
  or chasing a reported visual bug: run `inspector`. Treat a fix as unverified until a
  re-run comes back clean.

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
- **`.claude/agents/`** — Subagent definitions (`researcher`, `reviewer`, `tester`, `inspector`); see "Subagents" above
