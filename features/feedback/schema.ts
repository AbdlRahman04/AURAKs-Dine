import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../auth/schema";
import { orders } from "../orders/schema";

export const feedback = pgTable("feedback", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  orderId: integer("order_id").references(() => orders.id, {
    onDelete: "set null",
  }),
  category: varchar("category", { length: 50 }).notNull(),
  message: text("message").notNull(),
  rating: integer("rating"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit(
  { id: true, status: true, adminResponse: true, createdAt: true, updatedAt: true } as any,
);

export type InsertFeedback = typeof feedback.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
