import { Hono } from "hono";
import type { Bindings } from "./bindings";
import { imagesRoute } from "./routes/images";
import { listsRoute } from "./routes/lists";

const app = new Hono<{ Bindings: Bindings }>()
	.route("/api/lists", listsRoute)
	.route("/api/images", imagesRoute);

app.onError((err, c) => {
	console.error(err);
	return c.json({ error: "Internal Server Error" }, 500);
});

export type AppType = typeof app;
export default app;
