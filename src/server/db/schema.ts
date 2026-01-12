import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const lists = sqliteTable("lists", {
	id: text("id").primaryKey(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	name: text("name"),
});

export const items = sqliteTable(
	"items",
	{
		id: text("id").primaryKey(),
		listId: text("list_id")
			.notNull()
			.references(() => lists.id),
		comment: text("comment"),
		imageUrl: text("image_url"),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		deletedAt: integer("deleted_at", { mode: "timestamp" }),
	},
	(table) => [index("items_list_id_idx").on(table.listId)],
);
