import {
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../auth/schema";
import { menuItems } from "../menu/schema";

export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("received"),
  pickupTime: timestamp("pickup_time").notNull(),
  specialInstructions: text("special_instructions"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull().default("card"),
  paymentIntentId: varchar("payment_intent_id"),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("orders_user_created_idx").on(table.userId, table.createdAt),
  index("orders_status_created_idx").on(table.status, table.createdAt),
  index("orders_created_idx").on(table.createdAt),
]);

export const insertOrderSchema = createInsertSchema(orders).omit(
  { id: true, orderNumber: true, createdAt: true, updatedAt: true } as any,
);

export type InsertOrder = typeof orders.$inferInsert;
export type Order = typeof orders.$inferSelect;

export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: integer("menu_item_id")
    .notNull()
    .references(() => menuItems.id),
  menuItemName: varchar("menu_item_name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  unitCostSnapshot: decimal("unit_cost_snapshot", { precision: 10, scale: 2 }),
  selectedSize: varchar("selected_size", { length: 50 }),
  customizations: text("customizations"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
}, (table) => [
  index("order_items_order_id_idx").on(table.orderId),
]);

export type InsertOrderItem = typeof orderItems.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;

export const auditLogs = pgTable("audit_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 50 }),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
