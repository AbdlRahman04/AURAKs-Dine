import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Supports both email/password and Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // Hashed password for email/password auth (null for Replit Auth users)
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  studentId: varchar("student_id", { length: 8 }).unique(), // FR-04: 8-digit student ID
  role: varchar("role", { length: 20 }).notNull().default('student'), // student or admin (FR-26: role-based access)
  preferredPickupLocation: varchar("preferred_pickup_location"), // FR-05: profile preferences
  phoneNumber: varchar("phone_number"), // FR-05: contact details
  dietaryRestrictions: text("dietary_restrictions").array(), // FR-05: dietary preferences (vegetarian, vegan, etc.)
  allergies: text("allergies").array(), // FR-05: allergen information
  stripeCustomerId: varchar("stripe_customer_id"), // FR-26: Stripe customer ID for saved payment methods
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Menu items table - FR-06 to FR-10
export const menuItems = pgTable("menu_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }), // Arabic name for bilingual support
  description: text("description"),
  descriptionAr: text("description_ar"), // Arabic description for bilingual support
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // breakfast, lunch, snacks, beverages
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true), // FR-09: real-time availability
  preparationTime: integer("preparation_time").notNull(), // in minutes
  isSpecial: boolean("is_special").notNull().default(false), // FR-32: daily specials
  specialPrice: decimal("special_price", { precision: 10, scale: 2 }), // promotional offer price
  nutritionalInfo: jsonb("nutritional_info"), // FR-10: {calories, protein, carbs, fats, fiber}
  allergens: text("allergens").array(), // FR-10: array of allergen strings
  dietaryTags: text("dietary_tags").array(), // FR-08: vegetarian, vegan, gluten-free, etc.
  sizeVariants: jsonb("size_variants"), // Size options: [{name: "Small", priceModifier: -2.00}, {name: "Medium", priceModifier: 0}, {name: "Large", priceModifier: 3.00}]
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
} as any);

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

// Orders table - FR-11 to FR-22
export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(), // FR-16: unique order number
  status: varchar("status", { length: 20 }).notNull().default('received'), // received, preparing, ready, completed, cancelled
  pickupTime: timestamp("pickup_time").notNull(), // FR-13: pickup time slot
  specialInstructions: text("special_instructions"), // FR-15: special instructions
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(), // FR-14: total with taxes
  paymentMethod: varchar("payment_method", { length: 20 }).notNull().default('card'), // card or cash
  paymentIntentId: varchar("payment_intent_id"), // Stripe payment intent ID (null for cash)
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default('pending'), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
} as any);

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order items table - FR-11: items with quantities and customization
export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: integer("menu_item_id").notNull().references(() => menuItems.id),
  menuItemName: varchar("menu_item_name", { length: 255 }).notNull(), // snapshot at order time
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(), // price at order time
  selectedSize: varchar("selected_size", { length: 50 }), // Selected size variant (Small/Medium/Large)
  customizations: text("customizations"), // FR-11: customization options
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export type InsertOrderItem = typeof orderItems.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;

// Favorites table - FR-44: save frequently ordered items
export const favorites = pgTable("favorites", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  menuItemId: integer("menu_item_id").notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertFavorite = typeof favorites.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;

// Admin audit log - NFR-28: log administrative actions
export const auditLogs = pgTable("audit_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(), // created_menu_item, updated_menu_item, etc.
  entityType: varchar("entity_type", { length: 50 }).notNull(), // menu_item, order, etc.
  entityId: varchar("entity_id", { length: 50 }),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;

// Customer feedback table - for menu suggestions and general feedback
export const feedback = pgTable("feedback", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  orderId: integer("order_id").references(() => orders.id, { onDelete: 'set null' }),
  category: varchar("category", { length: 50 }).notNull(), // food_quality, service, menu_suggestion, general
  message: text("message").notNull(),
  rating: integer("rating"), // 1-5 stars (optional)
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, reviewed, resolved, dismissed
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  status: true,
  adminResponse: true,
  createdAt: true,
  updatedAt: true,
} as any);

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// Payment methods table - FR-26: save payment methods for future use
export const paymentMethods = pgTable("payment_methods", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripePaymentMethodId: varchar("stripe_payment_method_id").notNull(), // Stripe payment method ID
  cardBrand: varchar("card_brand", { length: 50 }), // visa, mastercard, amex, etc.
  cardLast4: varchar("card_last4", { length: 4 }), // last 4 digits for display
  cardExpMonth: integer("card_exp_month"),
  cardExpYear: integer("card_exp_year"),
  isDefault: boolean("is_default").notNull().default(false), // default payment method
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;
export type PaymentMethod = typeof paymentMethods.$inferSelect;

// Define relations for better query performance
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

// Extended types for frontend with relations
export type OrderWithItems = Order & {
  items: (OrderItem & { menuItem?: MenuItem })[];
  user?: User;
};

export type MenuItemWithFavorite = MenuItem & {
  isFavorite?: boolean;
};
