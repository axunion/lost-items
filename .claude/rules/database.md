---
description: Drizzle ORM schema conventions, soft delete patterns, and migration workflow for D1
globs:
  - src/server/db/**
  - migrations/**
  - drizzle.config.ts
---

# Database Guidelines

## Drizzle + D1 Schema Conventions

### Type Mapping

```typescript
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
  // UUID stored as text
  id: text("id").primaryKey(),

  // Dates use integer(mode: "timestamp") — Drizzle converts to/from Unix seconds automatically
  // Use new Date() to get the current time; do NOT use Math.floor(Date.now() / 1000)
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),

  // Soft delete as nullable timestamp
  deletedAt: integer("deleted_at", { mode: "timestamp" }),

  // Foreign key reference
  listId: text("list_id")
    .notNull()
    .references(() => lists.id),
});
```

### Query Safety

Use Drizzle's parameterized query builder (`.where(eq(...))`, `.values({...})`, etc.)
exclusively — never build SQL via raw string interpolation with user input, even with
Drizzle's `sql` tag.

### Naming Conventions

- Table names: plural `snake_case` (`lists`, `items`)
- Column names: `snake_case` (`created_at`, `list_id`)
- TypeScript properties: `camelCase` (auto-mapped by Drizzle)

## Soft Delete Pattern

Set `deletedAt` instead of physically deleting records:

```typescript
// Delete
await db
  .update(items)
  .set({ deletedAt: new Date() })
  .where(eq(items.id, itemId));

// Restore
await db
  .update(items)
  .set({ deletedAt: null })
  .where(eq(items.id, itemId));

// Public/read-only queries: always filter out deleted records
const activeItems = await db
  .select()
  .from(items)
  .where(and(eq(items.listId, listId), isNull(items.deletedAt)));

// Queries that need to show deleted items (e.g. restore UI): pass an explicit flag
// GET /api/lists/:id/items?includeDeleted=true
```

## Migration Workflow

```bash
# 1. After schema changes, generate migration files
pnpm db:generate

# 2. Review the generated file (migrations/ directory)
# Check for unexpected DROP TABLE statements etc.

# 3. Apply locally
pnpm db:migrate
```

Production migrations are applied via CI (GitHub Actions). Never run `wrangler d1 migrations apply --remote` directly from local.

## `createDb` Usage

```typescript
// Hono route: use c.env.DB
import { createDb } from "~/server/db";
const db = createDb(c.env.DB);

// Astro page: use env from cloudflare:workers
import { env } from "cloudflare:workers";
import type { Bindings } from "~/server/bindings";
const db = createDb((env as Bindings).DB);
```
