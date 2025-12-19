# Lost Items

A modern web application built with **Astro**, **SolidJS**, and **Cloudflare Workers**. This project manages lost and found items, utilizing **Cloudflare D1** for the database and **R2** for image storage.

## 🛠️ Tech Stack

- **Framework:** [Astro](https://astro.build/)
- **UI Library:** [SolidJS](https://www.solidjs.com/)
- **API/Backend:** [Hono](https://hono.dev/)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/)
- **Storage:** [Cloudflare R2](https://developers.cloudflare.com/r2/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)

## 🚀 Getting Started

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
pnpm drizzle-kit migrate
# or (depending on your setup)
npx wrangler d1 execute lost-items-db --local --file=./migrations/0000_xxxx.sql
```

## 📦 Build & Deploy

Build the project for production:

```bash
pnpm build
```

Deploy to Cloudflare Workers:

```bash
pnpm run deploy # (If script exists, otherwise `npx wrangler deploy`)
```

## 📂 Project Structure

- `src/pages`: Astro pages and API routes.
- `src/components`: UI components (Astro & SolidJS).
- `src/lib`: Utility functions and database configuration.
- `drizzle/`: Database schema and migrations.
- `public/`: Static assets.

## 📝 Scripts

- `pnpm dev`: Start dev server.
- `pnpm build`: Build for production.
- `pnpm check`: Run Biome check.
