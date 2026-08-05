/**
 * Shared schema entry point for Drizzle and app imports.
 * Table definitions live in features/{name}/schema.ts — this file re-exports them
 * and defines cross-feature relations.
 */
export {
  sessions,
  users,
  type UpsertUser,
  type User,
} from "../features/auth/schema";

export {
  menuItems,
  insertMenuItemSchema,
  type InsertMenuItem,
  type MenuItem,
} from "../features/menu/schema";

export {
  orders,
  orderItems,
  auditLogs,
  insertOrderSchema,
  type InsertOrder,
  type Order,
  type InsertOrderItem,
  type OrderItem,
  type InsertAuditLog,
  type AuditLog,
} from "../features/orders/schema";

export {
  favorites,
  type InsertFavorite,
  type Favorite,
} from "../features/favorites/schema";

export {
  feedback,
  insertFeedbackSchema,
  type InsertFeedback,
  type Feedback,
} from "../features/feedback/schema";

export {
  paymentMethods,
  type InsertPaymentMethod,
  type PaymentMethod,
} from "../features/payments/schema";

import { relations } from "drizzle-orm";
import { users, type User } from "../features/auth/schema";
import { menuItems, type MenuItem } from "../features/menu/schema";
import {
  orders,
  orderItems,
  auditLogs,
  type Order,
  type OrderItem,
} from "../features/orders/schema";
import { favorites } from "../features/favorites/schema";
import { feedback } from "../features/feedback/schema";
import { paymentMethods } from "../features/payments/schema";

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  favorites: many(favorites),
  auditLogs: many(auditLogs),
  feedback: many(feedback),
  paymentMethods: many(paymentMethods),
}));

export const menuItemsRelations = relations(menuItems, ({ many }) => ({
  orderItems: many(orderItems),
  favorites: many(favorites),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  menuItem: one(menuItems, {
    fields: [favorites.menuItemId],
    references: [menuItems.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));

export type OrderWithItems = Order & {
  items: (OrderItem & { menuItem?: MenuItem })[];
  user?: User;
};

export type MenuItemWithFavorite = MenuItem & {
  isFavorite?: boolean;
};
