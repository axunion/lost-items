# Overview

Notes that don't belong in code comments or `CLAUDE.md`: the why behind non-obvious
decisions, and things not yet decided. Anything derivable by reading the code (schema,
routes, component tree, build config) lives only in the code — see README.md for the
current routing table and tech stack, and `CLAUDE.md` / `.claude/rules/` for conventions.
Don't restate either here; if it drifts, fix it there, not by duplicating it in this file.

## Why this exists

A lost-and-found tracker for one-off events and facilities (festivals, conferences,
lobbies) where installing an account system for temporary staff isn't worth it. A "room"
is created per event/location; the unguessable room URL itself is the access control —
whoever holds a link can act on it. This trades security rigor for zero-friction setup,
which is the right trade for the target use case (short-lived, low-stakes lost items) but
would not be for anything higher-stakes.

## Non-obvious design rationale

- **`lists` are hard-deleted, `items` are soft-deleted.** Items need `deletedAt` so staff
  can restore a mis-deleted item. Lists don't get that treatment because deleting a list
  must also cascade-delete its items' R2 images — there's no "undo" story for that, so a
  soft-deleted list would leave you with an inconsistent restore (DB row back, images
  gone). Hard delete keeps the two in sync.

- **R2 image deletion happens before the D1 batch delete, outside any transaction**, when
  a list is deleted (`src/server/routes/lists.ts`). If the R2 deletes succeed and the D1
  batch then fails, the DB rows survive with dangling image references — an accepted
  inconsistency, chosen for simplicity over adding compensation/retry logic for what is
  expected to be a rare failure mode. Revisit if this ever shows up as a real support
  issue.

- **Admin `id` and public `publicId` are different values on purpose.** Any value that
  reaches the public room page (including image URLs, which embed the room ID) must be
  the `publicId` — using the admin `id` there would let a visitor derive the
  register/manage URLs from the public link. This is why R2 keys are namespaced by
  `publicId`, not `id`.

- **`ADMIN_TOKEN` gates Dashboard/History only** (which room existed at all); Register,
  Manage, and Room are protected solely by the unguessable per-room ID being hard to
  guess, not by the token. So the token controls *discovery* of rooms, not *access* to a
  room you already have a link to.

## Open questions / not yet decided

- **`AppType` (Hono RPC export in `src/server/index.ts`) is unused.** It was added as
  groundwork for typed client calls but nothing consumes it yet — `src/lib/api.ts` still
  hand-writes fetch wrappers. Decide whether to migrate or drop the export; don't treat
  its presence as evidence the migration is planned.
- **No shared zod schema file.** Validation schemas are inline per-route. Fine at the
  current size; worth extracting only if the same shape starts getting duplicated across
  routes.
- **R2/D1 delete-ordering inconsistency above** — acceptable for now, not yet decided
  whether it needs a fix.
