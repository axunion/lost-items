# Lost Items

A simple web application for managing lost and found items. Perfect for events, venues, and facilities to collect and share lost item information.

## Overview

Lost Items allows you to create "rooms" to organize lost items by location or event. Share registration URLs with staff to collect found items, and share public URLs with visitors to help them find their belongings.

## Features

- **No account required** - Use immediately without sign-up
- **URL-based sharing** - Share registration and viewing URLs easily
- **Photo support** - Upload images of lost items (up to 5MB)
- **Edit & delete items** - Modify comments or soft-delete items from the registration page
- **Simple interface** - Minimal, focused design

## How It Works

### 1. Create a Room

Open the Dashboard (`/:token/dashboard`, where `token` is the secret `ADMIN_TOKEN`), enter a room name (e.g., "2025 New Year Party", "3F Meeting Room"), and create a new room. Each room manages lost items for a specific location or event.

### 2. Register Lost Items

Each room has a **Registration Page** URL (`/:id/register`). Share this with staff or finders. They can:
- Register items with a photo and/or comment
- Edit comments on existing items
- Delete items (soft delete - items remain visible but grayed out)
- Restore deleted items

### 3. View Lost Items

Each room also has a separate, read-only **Public Page** URL (`/:publicId/room`). Share this with people who may have lost something. The `publicId` is distinct from the registration id, so this link never grants edit access.

## Screens

| Screen | Description |
|--------|-------------|
| Dashboard | Create rooms, view recent rooms (admin-only, requires `ADMIN_TOKEN` in the URL) |
| History | View all rooms, copy URLs, rename, delete (admin-only) |
| Registration Page | Register, edit, delete, and restore lost items (admin) |
| Public Page | View-only list of registered lost items |

## Use Case Example

**For event organizers:**

1. Create a room for your event
2. Share the "Registration Page" URL with staff
3. Staff register found items with photos
4. Share the "Public Page" URL with attendees (via QR code, etc.)
5. Attendees check if their lost item has been found

## Important Notes

- Anyone with the Registration Page URL can access and edit that room
- The Public Page URL is read-only and cannot be used to reach the Registration Page
- The Dashboard and History screens require the `ADMIN_TOKEN` secret in the URL
- Not suitable for sensitive or confidential use cases
- Maximum image size: 5MB per file

---

## Tech Stack

- **Framework:** [Astro 7](https://astro.build/) + [@astrojs/cloudflare v14](https://docs.astro.build/en/guides/deploy/cloudflare/)
- **UI Library:** [SolidJS](https://www.solidjs.com/)
- **Icons:** [Lucide](https://lucide.dev/) (lucide-solid, astro-icon)
- **API/Backend:** [Hono](https://hono.dev/)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/)
- **Storage:** [Cloudflare R2](https://developers.cloudflare.com/r2/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Styling:** CSS Modules + [LightningCSS](https://lightningcss.dev/)

## Getting Started

### Prerequisites

- **Node.js** v24+
- **pnpm** v11+ (Package manager)
- **Wrangler** (Cloudflare CLI)

### Installation

```bash
pnpm install
```

### Database Setup

Run database migrations (required before first run):

```bash
pnpm db:migrate
```

### Environment Variables

Create a `.dev.vars` file with a secret token used to protect the Dashboard/History pages:

```
ADMIN_TOKEN=<any-secret-value>
```

### Development

Start the local development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:4321`.

## Build

Build the project for production:

```bash
pnpm build
```

## Project Structure

```
src/
├── pages/          # Astro pages and API routes
├── components/     # UI components (Astro & SolidJS)
├── server/         # Backend routes and database
└── client/         # Client-side API calls and utility functions
migrations/         # Database migrations
public/             # Static assets
```

## Testing

```bash
pnpm test          # Run unit tests (Vitest)
pnpm test:e2e      # Run E2E tests (Playwright, dev server auto-starts)
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build on local workerd |
| `pnpm check` | Run Biome lint/format check |
| `pnpm fix` | Auto-fix lint/format issues |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:e2e` | Run E2E tests (Playwright) |
| `pnpm db:generate` | Generate Drizzle migration from schema changes |
| `pnpm db:migrate` | Apply migrations locally |
| `pnpm db:reset` | Clear local DB data and re-apply existing migrations (local only) |
| `pnpm db:rebuild` | Nuke migration files + local DB and regenerate from current schema (local only) |
