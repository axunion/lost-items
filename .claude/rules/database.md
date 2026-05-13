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

  // Dates as integer(mode: "timestamp") — Unix timestamps (seconds)
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),

  // Soft delete as nullable timestamp
  deletedAt: integer("deleted_at", { mode: "timestamp" }),

  // Foreign key reference
  listId: text("list_id")
    .notNull()
    .references(() => lists.id),
});
```

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

// Always filter by deletedAt is null in queries
const activeItems = await db
  .select()
  .from(items)
  .where(and(eq(items.listId, listId), isNull(items.deletedAt)));
```

## Migration Workflow

```bash
# 1. After schema changes, generate migration files
pnpm db:generate

# 2. Review the generated file (migrations/ directory)
# Check for unexpected DROP TABLE statements etc.

# 3. Apply locally
pnpm db:migrate

# 4. Applying to production requires explicit approval
pnpm db:migrate:prod
```

**Note**: Always review and confirm backups before running production migrations (`db:migrate:prod`).

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
