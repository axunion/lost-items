import type { AppType } from "./index";

type IsAny<T> = 0 extends 1 & T ? true : false;
type IsUnknown<T> = unknown extends T
	? T extends unknown
		? true
		: false
	: false;

const isAny: IsAny<AppType> = true;
const isUnknown: IsUnknown<AppType> = true;

// If AppType is Hono, this should error
import { hc } from "hono/client";

const client = hc<AppType>("http://localhost");
type ClientType = typeof client;

const isClientUnknown: IsUnknown<ClientType> = true;

import { Hono } from "hono";

const app2 = new Hono().get("/foo", (c) => c.text("foo"));
const client2 = hc<typeof app2>("http://localhost");
type Client2 = typeof client2;
const isClient2Unknown: IsUnknown<Client2> = true;

import type { imagesRoute } from "./routes/images";

type IR = typeof imagesRoute;
const isIRUnknown: IsUnknown<IR> = true;

import type { listsRoute } from "./routes/lists";

type LR = typeof listsRoute;
const isLRUnknown: IsUnknown<LR> = true;
