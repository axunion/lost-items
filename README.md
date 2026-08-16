# Lost Items

A web application for managing lost and found items. Create "rooms" to organize items by
location or event, share a registration URL with staff to collect found items, and share a
public URL with visitors to help them find their belongings.

## Features

- No account required
- URL-based sharing (registration, management, and public view URLs per room)
- Photo upload (up to 5MB)
- Soft-delete and restore items

## Pages and URLs

| Page | URL | Access |
|------|-----|--------|
| Dashboard | `/:token/dashboard` | Admin (`token` must equal `ADMIN_TOKEN`) |
| History | `/:token/history` | Admin |
| Register | `/:id/register` | Anyone with the room's admin `id` |
| Manage | `/:id/manage` | Anyone with the room's admin `id` |
| Room (public) | `/:publicId/room` | Anyone with the room's `publicId` |

There is no page at `/`; it 404s. Start at the Dashboard.

- **Dashboard**: create rooms, view the 3 most recent rooms.
- **History**: view all rooms, copy their URLs, rename or delete them.
- **Register**: add items with a photo and/or comment. Links to Manage.
- **Manage**: edit comments, soft-delete, and restore items.
- **Room**: read-only list of the room's active (non-deleted) items.

`id` (admin) and `publicId` (public) are separate values per room — the public URL cannot
be used to reach Register or Manage.

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
- **pnpm** v11+ (Package manager, bundles Wrangler as a dev dependency)

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.dev.vars` file with a secret token used to protect the Dashboard/History pages:

```
ADMIN_TOKEN=<any-secret-value>
```

### Database Setup

Run database migrations (required before first run):

```bash
pnpm db:migrate
```

### Development

```bash
pnpm dev
```

There is no page at `http://localhost:4321/` — start at
`http://localhost:4321/<ADMIN_TOKEN>/dashboard`, using the value you set above.

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

See `package.json` for the full list of scripts (build, lint, db management, etc.).
