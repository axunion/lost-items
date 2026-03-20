---
description: Drizzle ORM schema conventions, soft delete patterns, and migration workflow for D1
globs:
  - src/server/db/**
  - migrations/**
  - drizzle.config.ts
---

# Database Guidelines

## Drizzle + D1 スキーマ規約

### 型マッピング

```typescript
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
  // UUID は text で格納
  id: text("id").primaryKey(),

  // 日時は integer(mode: "timestamp") で Unix タイムスタンプ（秒）
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),

  // ソフトデリートは nullable な timestamp
  deletedAt: integer("deleted_at", { mode: "timestamp" }),

  // 外部キー参照
  listId: text("list_id")
    .notNull()
    .references(() => lists.id),
});
```

### 命名規則

- テーブル名: `snake_case` の複数形 (`lists`, `items`)
- 列名: `snake_case` (`created_at`, `list_id`)
- TypeScript プロパティ: `camelCase` (Drizzle が自動マッピング)

## ソフトデリートパターン

削除は物理削除ではなく `deletedAt` を設定します:

```typescript
// 削除
await db
  .update(items)
  .set({ deletedAt: new Date() })
  .where(eq(items.id, itemId));

// 復元
await db
  .update(items)
  .set({ deletedAt: null })
  .where(eq(items.id, itemId));

// クエリ時は必ず deletedAt is null を条件に加える
const activeItems = await db
  .select()
  .from(items)
  .where(and(eq(items.listId, listId), isNull(items.deletedAt)));
```

## マイグレーションワークフロー

```bash
# 1. スキーマ変更後、マイグレーションファイルを生成
pnpm db:generate

# 2. 生成されたファイルを確認 (migrations/ ディレクトリ)
# 想定外の DROP TABLE 等がないかチェック

# 3. ローカルに適用
pnpm db:migrate

# 4. 本番への適用は明示的な承認が必要
pnpm db:migrate:prod
```

**注意**: 本番マイグレーション (`db:migrate:prod`) は必ず事前にレビューし、バックアップを確認してから実行します。

## `createDb` の使い分け

```typescript
// Hono ルート: c.env.DB を使用
import { createDb } from "~/server/db";
const db = createDb(c.env.DB);

// Astro ページ: cloudflare:workers の env を使用
import { env } from "cloudflare:workers";
import type { Bindings } from "~/server/bindings";
const db = createDb((env as Bindings).DB);
```
