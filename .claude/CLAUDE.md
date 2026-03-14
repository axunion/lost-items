# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server (workerd runtime via @astrojs/cloudflare)
pnpm build            # Build for production
pnpm preview          # Preview production build on local workerd
pnpm deploy           # Build + deploy to Cloudflare Workers

pnpm check            # Biome lint/format check (src/)
pnpm check:write      # Biome auto-fix

pnpm test             # Run unit tests (Vitest)
pnpm test -- src/server/routes/lists.test.ts  # Run a single test file
pnpm test:e2e         # Run e2e tests (Playwright, requires dev server)

pnpm db:generate      # Generate Drizzle migration from schema changes
pnpm db:migrate       # Apply migrations locally
pnpm db:migrate:prod  # Apply migrations to production D1
```

## Architecture

**Astro 6 SSR + Hono API on Cloudflare Workers.** Pages are server-rendered by Astro; interactive islands use SolidJS with `client:load`. The API is a standalone Hono app mounted at `/api` via a catch-all Astro route.

### Request flow

```
Browser → Astro SSR (pages/*.astro)     → D1 via Drizzle (server-side data fetching)
       → Hono API  (api/[...route].ts)  → D1 / R2 (client-side mutations)
```

### Cloudflare bindings access

Astro pages and the API route use `cloudflare:workers` to access bindings:

```typescript
import { env } from "cloudflare:workers";
import type { Bindings } from "~/server/bindings";
const db = createDb((env as Bindings).DB);
```

Bindings: `DB` (D1), `BUCKET` (R2), `ASSETS` (static files).

### Backend (src/server/)

- `index.ts` — Hono app entry, mounts route groups
- `routes/lists.ts` — CRUD for lists and items (POST items accepts multipart with image upload to R2, max 5MB)
- `routes/images.ts` — Serves images from R2 with 1-year cache
- `db/schema.ts` — Drizzle schema: `lists` and `items` tables. Items use soft delete (`deletedAt` column)
- `bindings.ts` — TypeScript type for Cloudflare bindings

### Frontend (src/components/)

- `ui/` — Reusable components built on Kobalte (headless) + cva for variants
- `features/` — Page-level SolidJS components (dashboard, register-page, item-list, etc.)
- `astro/` — Astro-only components (app-header)

Utility: `src/lib/utils.ts` exports `cn()` (clsx + tailwind-merge) and `formatDate()`. API client functions are in `src/lib/api.ts`.

### Styling

Tailwind CSS v4 with CSS-based config in `src/styles/global.css` (`@theme` block). No `tailwind.config.mjs` — all tokens defined via `--color-*` CSS custom properties.

### Testing

- **Unit tests** colocated with source (`*.test.ts(x)` next to the file they test)
- **E2E tests** in `tests/e2e/` — Playwright with Chromium against the dev server
- Route tests mock `createDb` and test Hono handlers directly
- Component tests use `@solidjs/testing-library`

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

1. `pnpm check` — Biome lint/format (auto-fix with `pnpm check:write`)
2. `pnpm test --run` — Unit tests (Vitest)
3. `pnpm build` — Production build succeeds

## Additional configuration

- **`.claude/rules/`** — Context-specific guidelines auto-loaded by glob pattern (e.g., frontend rules for `src/components/**`)
- **`.claude/settings.json`** — Permission allowlist for safe commands
