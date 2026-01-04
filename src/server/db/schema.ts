import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const lists = sqliteTable("lists", {
	id: text("id").primaryKey(),
	name: text("name"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const items = sqliteTable("items", {
	id: text("id").primaryKey(),
	listId: text("list_id")
		.notNull()
		.references(() => lists.id),
	comment: text("comment"),
	imageUrl: text("image_url"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	deletedAt: integer("deleted_at", { mode: "timestamp" }),
});
