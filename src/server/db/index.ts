import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const createDb = (d1: D1Database) => {
	// In development (local Miniflare), the connection to D1 sometimes fails with "fetch failed"
	if (import.meta.env.DEV) {
		d1 = wrapWithRetry(d1);
	}
	return drizzle(d1, { schema });
};

// Simple retry wrapper for D1 in development
function wrapWithRetry(d1: D1Database): D1Database {
	return new Proxy(d1, {
		get(target, prop, receiver) {
			const value = Reflect.get(target, prop, receiver);
			if (prop === "prepare" && typeof value === "function") {
				return function (this: D1Database, ...args: unknown[]) {
					const stmt = value.apply(this, args);
					return wrapStmtWithRetry(stmt);
				};
			}
			return value;
		},
	});
}

function wrapStmtWithRetry(stmt: D1PreparedStatement): D1PreparedStatement {
	return new Proxy(stmt, {
		get(target, prop, receiver) {
			const value = Reflect.get(target, prop, receiver);

			if (typeof value !== "function") {
				return value;
			}

			// 'bind' must be synchronous and return the statement for chaining
			if (prop === "bind") {
				return function (this: D1PreparedStatement, ...args: unknown[]) {
					const newStmt = value.apply(this, args);
					return wrapStmtWithRetry(newStmt);
				};
			}

			// Only wrap execution methods with retry logic
			const execMethods = ["first", "run", "all", "raw"];
			if (execMethods.includes(prop as string)) {
				return async function (this: D1PreparedStatement, ...args: unknown[]) {
					let lastError: unknown;
					for (let i = 0; i < 3; i++) {
						try {
							return await value.apply(this, args);
						} catch (e: unknown) {
							lastError = e;
							const msg = (e as Error)?.message || "";
							const causeMsg = ((e as Error)?.cause as Error)?.message || "";

							if (
								msg.includes("fetch failed") ||
								causeMsg.includes("fetch failed")
							) {
								await new Promise((r) => setTimeout(r, 100 * (i + 1)));
								continue;
							}
							throw e;
						}
					}
					throw lastError;
				};
			}

			return value;
		},
	});
}
