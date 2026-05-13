---
description: Hono API patterns, Cloudflare bindings access, R2 storage conventions, and error response standards
globs:
  - src/server/**
  - src/pages/api/**
---

# Backend Guidelines

## Hono API Patterns

### Accessing Bindings

In Hono routes, access bindings via `c.env`:

```typescript
import { createDb } from "~/server/db";
import type { Bindings } from "~/server/bindings";

// Inside a route handler
const db = createDb(c.env.DB);
const bucket = c.env.BUCKET;
```

In Astro pages, use the `cloudflare:workers` module:

```typescript
import { env } from "cloudflare:workers";
import type { Bindings } from "~/server/bindings";
const db = createDb((env as Bindings).DB);
```

### Validation

Always use `zValidator` for input validation:

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

### Error Response Format

Always return errors in `{ error: "message" }` format:

```typescript
return c.json({ error: "List not found" }, 404);
return c.json({ error: "File too large" }, 400);
```

Return objects directly for success responses:

```typescript
return c.json({ id, name, createdAt });
```

## R2 Storage

### Key Naming Convention

Use `{listId}/{uuid}-{filename}` format for R2 object keys:

```typescript
const key = `${listId}/${crypto.randomUUID()}-${file.name}`;
await c.env.BUCKET.put(key, buffer, {
  httpMetadata: { contentType: file.type },
});
```

### File Upload Validation

- Max size: 5MB (`5 * 1024 * 1024` bytes)
- Pass through the received Content-Type as-is
- R2 keys must use a controlled naming convention — never use external input directly as a key

## ID Generation

Use `crypto.randomUUID()` for UUIDs (do not use the Node.js `uuid` package):

```typescript
const id = crypto.randomUUID();
```

## Timestamp Convention

- Storage: store as Unix timestamps (seconds) using `integer` type
- Retrieval: return as-is as a number (formatting is handled on the frontend)
- Current time: `Math.floor(Date.now() / 1000)`
