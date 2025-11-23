import { hc } from "hono/client";
import type { AppType } from "../server";

// In SSR, we might need a full URL. For client-side navigation, relative URL works if proxied,
// but Astro API routes are on the same domain.
// However, `hc` needs to know the base URL structure.
// Since our API is at /api, and the app.route is mounted there via Astro catch-all,
// we need to point the client to the correct base.
// The Astro route is `src/pages/api/[...route].ts`, which mounts `app`.
// So `app.route("/lists")` becomes `/api/lists`.

const baseUrl = import.meta.env.SITE || "http://localhost:4321";
const client = hc<AppType>(baseUrl);

export const api = client.api;
