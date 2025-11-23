import { Hono } from "hono";
import { imagesRoute } from "./routes/images";
import { listsRoute } from "./routes/lists";

import type { Bindings } from "./bindings";

const app = new Hono<{ Bindings: Bindings }>()
	.route("/api/lists", listsRoute)
	.route("/api/images", imagesRoute);

export type AppType = typeof app;
export default app;
