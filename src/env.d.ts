/// <reference path="../.astro/types.d.ts" />

import type { Runtime } from "@astrojs/cloudflare";

declare namespace App {
	interface Locals extends Runtime {}
}
