import { Hono } from "hono";
import type { Bindings } from "../bindings";

export const imagesRoute = new Hono<{ Bindings: Bindings }>()
    .get("/", (c) => c.text("hi"));
