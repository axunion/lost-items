import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import type { Bindings } from "./bindings";
import { imagesRoute } from "./routes/images";
import { listsRoute } from "./routes/lists";

const app = new Hono<{ Bindings: Bindings }>()
  .use(
    bodyLimit({
      // Headroom above the 5MB per-image cap (see lists.ts) for form field overhead.
      maxSize: 6 * 1024 * 1024,
      onError: (c) => c.json({ error: "Payload too large" }, 413),
    }),
  )
  .use(csrf())
  .route("/api/lists", listsRoute)
  .route("/api/images", imagesRoute);

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export type AppType = typeof app;
export default app;
