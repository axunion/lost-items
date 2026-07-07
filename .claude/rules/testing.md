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

`src/server/routes/lists.test.ts` is the reference implementation — follow its patterns.

Mock `createDb` with `vi.hoisted` + `vi.mock`, then test handlers directly via
`route.request(path, init, env)`. The DB mock is queue-based: enqueue return values
before the request, and each query dequeues in order.

```typescript
// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const createDbMock = vi.hoisted(() => vi.fn());

vi.mock("../db", () => ({
  createDb: createDbMock,
}));

import { listsRoute } from "./lists";

// setupDbMock() (see lists.test.ts) builds a thenable mock supporting:
//   (1) .select().from(...).where(...).get()   → resolves enqueueOne(val)
//   (2) await .select().from(...).where(...)   → resolves enqueueMany(arr)
//   (3) await .select().from(...).orderBy(...) → resolves enqueueMany(arr)
// plus insert/update/delete/batch spies for asserting mutations.

it("returns all lists", async () => {
  const { db, enqueueMany } = setupDbMock();
  createDbMock.mockReturnValue(db);
  enqueueMany([{ id: "a", name: "Alpha", createdAt: "2023-01-01T00:00:00.000Z" }]);

  const res = await listsRoute.request("/", { method: "GET" }, createEnv());

  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toEqual([...]);
});
```

- Routes are named exports (`listsRoute`, `imagesRoute`), not a default `app`.
- Pass bindings as the third argument to `route.request()` — `createEnv()` in
  `lists.test.ts` provides `DB` and a `BUCKET` with `put`/`delete` spies.
- Mark route test files with `// @vitest-environment node`.

## Component Tests (SolidJS)

Use `@solidjs/testing-library`:

```typescript
import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import MyComponent from "./my-component";

it("renders correctly", () => {
  render(() => <MyComponent title="Test" />);
  expect(screen.getByText("Test")).toBeInTheDocument();
});
```

Kobalte interaction caveat (see `history-list.test.tsx`): DropdownMenu opens via
`pointerDown` on the trigger, and menu items fire `onSelect` via `pointerUp` — plain
`click` events do not work.

## Utility Tests

Import functions directly and test them:

```typescript
import { describe, expect, it } from "vitest";
import { formatDate } from "./utils";

it("formats date correctly", () => {
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

Pattern — API setup then SSR/UI assertion:

```typescript
test("...", async ({ page, request }) => {
  // Use Date.now()-process.pid for unique room names across parallel runs
  const roomName = `Test Room ${Date.now()}-${process.pid}`;

  // Mutating API calls require origin header (hono/csrf guard — see backend.md)
  await request.post(`/api/lists/${id}/items`, {
    multipart: { comment: "text" },
    headers: { origin: "http://localhost:4321" },
  });

  await page.goto(`/${id}/register`);
  await expect(page.getByTestId("item-card")).toBeVisible();
});
```

## General Conventions

- Use `it` (not `test`) for unit test cases; call `vi.clearAllMocks()` in `beforeEach`
- Place test files alongside source files (`foo.ts` → `foo.test.ts`)
- E2E tests only in `tests/e2e/`
- Write test descriptions in English

## Dev Server Management

- Before starting a dev server, check for existing processes with `lsof -i :4321` to avoid running multiple instances
- Any process started during a session must be stopped before the session ends (`lsof -ti :4321 | xargs kill`)
- For `pnpm test:e2e`, the `webServer` config handles the dev server lifecycle automatically — no manual management needed
