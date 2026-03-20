---
description: Unit test patterns for Hono routes and SolidJS components, E2E test conventions with Playwright
globs:
  - src/**/*.test.*
  - tests/e2e/**
  - vitest.config.ts
  - playwright.config.ts
---

# Testing Guidelines

## ルートテスト (Hono)

`vi.hoisted` + `vi.mock` でDBをモックし、`route.request()` でハンドラを直接テストします。

```typescript
// lists.test.ts のパターン
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

// テスト内
const res = await route.request("/lists", { method: "GET" });
expect(res.status).toBe(200);
const body = await res.json();
```

チェーン可能なモックの作成パターン:

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

## コンポーネントテスト (SolidJS)

`@solidjs/testing-library` を使います:

```typescript
import { render, screen } from "@solidjs/testing-library";
import { MyComponent } from "./MyComponent";

test("renders correctly", () => {
  render(() => <MyComponent title="Test" />);
  expect(screen.getByText("Test")).toBeInTheDocument();
});
```

## ユーティリティテスト

ロジックを持つ関数は直接インポートしてテストします:

```typescript
import { formatDate } from "./utils";

test("formats date correctly", () => {
  expect(formatDate(1700000000)).toBe("2023/11/15");
});
```

## E2E テスト (Playwright)

- テストファイル: `tests/e2e/*.spec.ts`
- ブラウザ: Chromium のみ
- 前提: `pnpm dev` でサーバーが起動していること

パターン:

```typescript
// APIでデータをセットアップ → UIで検証
test("can create and view list", async ({ page }) => {
  // セットアップ
  await fetch("http://localhost:4321/api/lists", {
    method: "POST",
    body: JSON.stringify({ name: "Test List" }),
  });

  // UI検証
  await page.goto("/");
  await expect(page.getByText("Test List")).toBeVisible();
});
```

## 共通規約

- `beforeEach` で `vi.clearAllMocks()` を呼ぶ
- テストファイルはソースと同じディレクトリに配置 (`foo.ts` → `foo.test.ts`)
- E2E のみ `tests/e2e/` に分離
- テストの説明は英語で記述
