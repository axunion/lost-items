---
description: Unit test patterns for Hono routes and SolidJS components, E2E test conventions with Playwright
globs:
  - src/**/*.test.*
  - tests/e2e/**
  - vitest.config.ts
  - playwright.config.ts
---

# Testing Guidelines

## Route Tests (Hono)

Use `vi.hoisted` + `vi.mock` to mock the DB and test handlers directly via `route.request()`.

```typescript
// Pattern from lists.test.ts
const { mockDb } = vi.hoisted(() => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    // ... chainable methods
  };
  return { mockDb };
});

vi.mock("../db", () => ({
  createDb: vi.fn(() => mockDb),
}));

// Inside a test
const res = await route.request("/lists", { method: "GET" });
expect(res.status).toBe(200);
const body = await res.json();
```

Chainable mock creation pattern:

```typescript
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  execute: vi.fn().mockResolvedValue([]),
};
```

## Component Tests (SolidJS)

Use `@solidjs/testing-library`:

```typescript
import { render, screen } from "@solidjs/testing-library";
import { MyComponent } from "./MyComponent";

test("renders correctly", () => {
  render(() => <MyComponent title="Test" />);
  expect(screen.getByText("Test")).toBeInTheDocument();
});
```

## Utility Tests

Import functions directly and test them:

```typescript
import { formatDate } from "./utils";

test("formats date correctly", () => {
  expect(formatDate(1700000000)).toBe("2023/11/15");
});
```

## E2E Tests (Playwright)

Two spec files only — keep scope here, do not add UI-interaction-heavy flows:

- `tests/e2e/api-flow.spec.ts` — API-driven end-to-end: create room → register item → delete (soft) → restore → public read-only check
- `tests/e2e/ui-smoke.spec.ts` — SSR/routing smoke: dashboard renders, register/room pages are reachable, public page is read-only

Run with:

```bash
pnpm test:e2e                                    # all specs (webServer auto-starts pnpm dev)
pnpm test:e2e -- tests/e2e/api-flow.spec.ts      # single spec
pnpm test:e2e:headed                             # headed mode for local debugging
```

**Claude must NOT use MCP Playwright tools (`mcp__playwright__*`) to run or verify E2E tests.**
MCP-driven execution is slow (per-step round-trips) and non-reproducible (timing/state drift).
Always run E2E via `pnpm test:e2e` through Bash.

Pattern — API setup then SSR/UI assertion:

```typescript
test("...", async ({ page, request }) => {
  // Use Date.now()-process.pid for unique room names across parallel runs
  const roomName = `Test Room ${Date.now()}-${process.pid}`;

  // Mutating API calls require origin header (CSRF guard)
  await request.post(`/api/lists/${id}/items`, {
    multipart: { comment: "text" },
    headers: { origin: "http://localhost:4321" },
  });

  await page.goto(`/${id}/register`);
  await expect(page.getByTestId("item-card")).toBeVisible();
});
```

## General Conventions

- Call `vi.clearAllMocks()` in `beforeEach`
- Place test files alongside source files (`foo.ts` → `foo.test.ts`)
- E2E tests only in `tests/e2e/`
- Write test descriptions in English

## Dev Server Management

For UI verification with the `ui-verifier` agent, always stop the process after verification:

```bash
# Track PID on startup
pnpm dev &
DEV_PID=$!

# Stop after verification
kill $DEV_PID
# Or stop an already-running process
lsof -ti :4321 | xargs kill
```

- Any process started during a session must be stopped before the session ends
- Before starting, check for existing processes with `lsof -i :4321` to avoid running multiple instances
- For `pnpm test:e2e`, the `webServer` config handles dev server lifecycle automatically — no manual management needed
