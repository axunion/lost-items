/// <reference path="../.astro/types.d.ts" />

import type { Runtime } from "@astrojs/cloudflare";
import type { Bindings } from "~/server/bindings";

declare namespace App {
	interface Locals extends Runtime<Bindings> {}
}
