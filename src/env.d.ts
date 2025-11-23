/// <reference path="../.astro/types.d.ts" />

type Runtime = import("@astrojs/cloudflare").Runtime<
	import("./server/bindings").Bindings
>;

declare namespace App {
	interface Locals extends Runtime {}
}
