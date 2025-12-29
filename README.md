# Lost Items

A simple web application for managing lost and found items. Perfect for events, venues, and facilities to collect and share lost item information.

## Overview

Lost Items allows you to create "rooms" to organize lost items by location or event. Share registration URLs with staff to collect found items, and share public URLs with visitors to help them find their belongings.

## Features

- **No account required** - Use immediately without sign-up
- **URL-based sharing** - Share registration and viewing URLs easily
- **Photo support** - Upload images of lost items (up to 5MB)
- **Simple interface** - Minimal, focused design

## How It Works

### 1. Create a Room

Enter a room name on the homepage (e.g., "2025 New Year Party", "3F Meeting Room") and create a new room. Each room manages lost items for a specific location or event.

### 2. Register Lost Items

Each room has a **Registration Page** URL. Share this with staff or finders. They can register items with:
- A photo (optional)
- A comment (optional)

### 3. View Lost Items

Each room has a **Public Page** URL. Share this with people who may have lost something. They can browse all registered items to find their belongings.

## Screens

| Screen | Description |
|--------|-------------|
| Dashboard | Create rooms, view all rooms |
| Room Manager | Manage room settings, copy URLs, rename, delete |
| Registration Page | Form to register lost items |
| Public Page | List of registered lost items |

## Use Case Example

**For event organizers:**

1. Create a room for your event
2. Share the "Registration Page" URL with staff
3. Staff register found items with photos
4. Share the "Public Page" URL with attendees (via QR code, etc.)
5. Attendees check if their lost item has been found

## Important Notes

- Anyone with the room URL can access and edit it
- Not suitable for sensitive or confidential use cases
- Maximum image size: 5MB per file

---

## Tech Stack

- **Framework:** [Astro](https://astro.build/)
- **UI Library:** [SolidJS](https://www.solidjs.com/)
- **API/Backend:** [Hono](https://hono.dev/)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/)
- **Storage:** [Cloudflare R2](https://developers.cloudflare.com/r2/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)

## Getting Started

### Prerequisites

- **Node.js** (v20+ recommended)
- **pnpm** (Package manager)
- **Wrangler** (Cloudflare CLI)

### Installation

```bash
pnpm install
```

### Development

Start the local development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:4321`.

### Database Setup

Run database migrations:

```bash
pnpm db:migrate
```

## Build & Deploy

Build the project for production:

```bash
pnpm build
```

Deploy to Cloudflare Workers:

```bash
pnpm deploy
```

## Project Structure

```
src/
├── pages/          # Astro pages and API routes
├── components/     # UI components (Astro & SolidJS)
├── server/         # Backend routes and database
└── lib/            # Utility functions
migrations/         # Database migrations
public/             # Static assets
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm deploy` | Build and deploy to Cloudflare |
| `pnpm db:migrate` | Run local database migrations |
| `pnpm db:migrate:prod` | Run production database migrations |
| `pnpm check` | Run Biome code check |
