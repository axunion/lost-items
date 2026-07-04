import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const lists = sqliteTable("lists", {
  id: text("id").primaryKey(),
  // Public, read-only identifier used in the shareable /:publicId/room URL.
  // Distinct from `id` (the admin token) so that possessing the public link
  // grants no access to the register page or the mutation API.
  publicId: text("public_id").notNull().unique(),
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
    imageKey: text("image_key"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [index("items_list_id_idx").on(table.listId)],
);
