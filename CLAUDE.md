# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Architecture

**Astro 7 SSR + Hono API on Cloudflare Workers.** Astro server-renders pages; interactive
islands are SolidJS (`client:load`). The API is a standalone Hono app mounted at `/api` via
the catch-all route `src/pages/api/[...route].ts`.

```
Browser → Astro SSR (pages/*.astro)     → D1 via Drizzle (server-side data fetching)
       → Hono API  (api/[...route].ts)  → D1 / R2 (client-side mutations)
```

`mockDebugPlugin` in `astro.config.mjs` stubs the `debug` package, whose CJS
`module.exports` is unavailable in workerd. It works around a transitive dependency of the
Astro ecosystem, not project code.

## Verification

After making changes, run in order:

1. `pnpm check` — Biome lint/format + `astro check` (auto-fix with `pnpm fix`)
2. `pnpm test --run` — Vitest unit tests
3. `pnpm build` — production build

Structural correctness (API responses, state transitions, soft-delete filtering) belongs in
Vitest/Playwright. Subjective judgment (spacing, whether a status color reads clearly per
`DESIGN.md`) stays a human/live check — automating it is slow and still misses what a human
sees at a glance. Persist a new regression test only for a durable flow worth protecting,
not for a one-off check of a single change.

## Subagents

`.claude/agents/` defines read-only or test-only `researcher`, `reviewer`, `tester`, and `inspector`, alongside the
built-in `Explore` and `Plan`. **None of them write implementation code — the main
conversation always does.** A subagent's retry re-spawns it with no memory of the code it
wrote; their value is a check from something that didn't write the code.

Scale to the task's size and risk:

- **Trivial** (one-line fixes, typos, config tweaks): implement directly, no agents.
- **Contained** (a self-contained change in one area): implement directly, optionally after
  one research pass (`Explore` for an existing convention, `researcher` for an unfamiliar
  external API such as Astro's Cloudflare adapter, Kobalte, or Hono on Workers). Then run
  `reviewer` and `tester` in parallel **without asking first** — they're read-only/test-only,
  so cheap to run.
- **Large, ambiguous, or high-risk** (spans many files, substantially touches
  `src/server/routes/`, `src/server/images.ts`, or `src/server/db/schema.ts`, or the task
  itself is genuinely ambiguous): propose the
  built-in `/goal` command with a completion condition requiring `reviewer` to report no
  findings and `tester` to pass. Then loop research (`Explore` + `researcher`) → implement →
  `reviewer` + `tester` until the condition holds.

**Visual verification** applies to any change touching rendered UI, regardless of tier:

- Small, isolated, single-property tweak: a quick manual glance at the running app.
- Viewport-dependent layout, styles shared across components, or a reported visual bug:
  run `inspector`; the fix is unverified until a re-run comes back clean.

## Additional configuration

- **`DESIGN.md`** — Visual design spec (palette, typography, sizing, layout, elevation).
  Its source-of-truth and sync rules live in `.claude/rules/frontend.md` §4 only.
- **`.claude/rules/`** — Guidelines auto-loaded by glob:
  - `frontend.md` — SolidJS components, UI design system (`src/components/**`, `src/pages/**`)
  - `backend.md` — Hono API patterns, bindings, R2 (`src/server/**`)
  - `testing.md` — Unit/E2E test patterns (`src/**/*.test.*`, `tests/e2e/**`)
  - `database.md` — Drizzle schema, migrations, soft delete (`src/server/db/**`, `migrations/**`)
- **`.claude/skills/`** — `/db-migrate`, `/quality-check [--fix]`, `/new-component <Name> [ui|features]`
- **`lefthook.yml`** — Pre-commit: Biome auto-fix on staged files + `pnpm check`, in parallel
