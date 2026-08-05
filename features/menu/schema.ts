import {
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const menuItems = pgTable("menu_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  preparationTime: integer("preparation_time").notNull(),
  isSpecial: boolean("is_special").notNull().default(false),
  specialPrice: decimal("special_price", { precision: 10, scale: 2 }),
  nutritionalInfo: jsonb("nutritional_info"),
  allergens: text("allergens").array(),
  dietaryTags: text("dietary_tags").array(),
  sizeVariants: jsonb("size_variants"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { id: true, createdAt: true, updatedAt: true } as any,
);

export type InsertMenuItem = typeof menuItems.$inferInsert;
export type MenuItem = typeof menuItems.$inferSelect;
