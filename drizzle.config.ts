import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

// ローカルのD1データベース（Wranglerが管理）のパスを取得
const getLocalD1DB = () => {
	const basePath = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
	if (fs.existsSync(basePath)) {
		const files = fs.readdirSync(basePath);
		const sqliteFile = files.find((f) => f.endsWith(".sqlite"));
		if (sqliteFile) return path.join(basePath, sqliteFile);
	}
	return undefined;
};

export default defineConfig({
	schema: "./src/server/db/schema.ts",
	out: "./migrations",
	dialect: "sqlite",
	dbCredentials: {
		url: `file:${getLocalD1DB() ?? "local.sqlite"}`,
	},
});
