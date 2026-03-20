---
description: Hono API patterns, Cloudflare bindings access, R2 storage conventions, and error response standards
globs:
  - src/server/**
  - src/pages/api/**
---

# Backend Guidelines

## Hono API パターン

### Bindings へのアクセス

Hono ルートでは `c.env` を使ってバインディングにアクセスします:

```typescript
import { createDb } from "~/server/db";
import type { Bindings } from "~/server/bindings";

// ルートハンドラ内
const db = createDb(c.env.DB);
const bucket = c.env.BUCKET;
```

Astro ページでは `cloudflare:workers` モジュールを使います:

```typescript
import { env } from "cloudflare:workers";
import type { Bindings } from "~/server/bindings";
const db = createDb((env as Bindings).DB);
```

### バリデーション

入力バリデーションには必ず `zValidator` を使用します:

```typescript
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

app.post(
  "/items",
  zValidator("json", z.object({ name: z.string().min(1) })),
  async (c) => {
    const { name } = c.req.valid("json");
    // ...
  }
);
```

### エラーレスポンス形式

エラーは常に `{ error: "message" }` の形式で返します:

```typescript
return c.json({ error: "List not found" }, 404);
return c.json({ error: "File too large" }, 400);
```

成功レスポンスでは直接オブジェクトを返します:

```typescript
return c.json({ id, name, createdAt });
```

## R2 ストレージ

### キー命名規則

R2 オブジェクトキーは `{listId}/{uuid}-{filename}` の形式を使います:

```typescript
const key = `${listId}/${crypto.randomUUID()}-${file.name}`;
await c.env.BUCKET.put(key, buffer, {
  httpMetadata: { contentType: file.type },
});
```

### ファイルアップロード検証

- 最大サイズ: 5MB (`5 * 1024 * 1024` bytes)
- 許可する Content-Type は受け取ったものをそのまま使用
- R2 キーはコントロールされた命名規則を使い、外部入力をキーに直接使わない

## ID 生成

UUID は `crypto.randomUUID()` を使います（Node.js の `uuid` パッケージ不使用）:

```typescript
const id = crypto.randomUUID();
```

## タイムスタンプ規約

- 保存: Unix タイムスタンプ（秒）を `integer` 型で格納
- 取得: そのまま数値として返す（フロントエンド側でフォーマット）
- 現在時刻: `Math.floor(Date.now() / 1000)`
