import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "../auth/schema";
import { menuItems } from "../menu/schema";

export const favorites = pgTable("favorites", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  menuItemId: integer("menu_item_id")
    .notNull()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertFavorite = typeof favorites.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
