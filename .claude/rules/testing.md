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

- Test files: `tests/e2e/*.spec.ts`
- Browser: Chromium only
- Prerequisite: dev server must be running via `pnpm dev`

Pattern:

```typescript
// Set up data via API → verify in UI
test("can create and view list", async ({ page }) => {
  // Setup
  await fetch("http://localhost:4321/api/lists", {
    method: "POST",
    body: JSON.stringify({ name: "Test List" }),
  });

  // UI verification
  await page.goto("/");
  await expect(page.getByText("Test List")).toBeVisible();
});
```

## General Conventions

- Call `vi.clearAllMocks()` in `beforeEach`
- Place test files alongside source files (`foo.ts` → `foo.test.ts`)
- E2E tests only in `tests/e2e/`
- Write test descriptions in English

## Dev Server Management

When starting a dev server for UI verification or E2E tests, always stop the process after verification is complete.

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
