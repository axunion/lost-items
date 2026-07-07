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

### CSRF Guard

The API app applies `csrf()` from `hono/csrf` globally (`src/server/index.ts`). Mutating
requests (POST/PATCH/DELETE) are rejected with 403 unless the `origin` header matches the
site origin — this is why E2E tests and non-browser clients must set an explicit
`origin` header (see testing.md).

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

Use `{publicId}/{uuid}-{filename}` format for R2 object keys, via the shared
`buildImageKey` helper (`~/server/images`). The key is exposed in image URLs on the
public room page, so it must use the list's `publicId` — never the admin `id`, which
would let anyone with the public link derive the register URL:

```typescript
const key = buildImageKey(list.publicId, file.name);
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

- Storage: use `integer({ mode: "timestamp" })` in Drizzle schema — it stores as Unix seconds automatically
- Current time: `new Date()` (Drizzle converts it to seconds; do NOT use `Math.floor(Date.now() / 1000)`)
- Retrieval: returned as a number (Unix seconds); formatting is handled on the frontend
