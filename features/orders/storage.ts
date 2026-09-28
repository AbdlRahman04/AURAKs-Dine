import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "../../server/db";
import { users } from "../auth/schema";
import {
  orders,
  orderItems,
  auditLogs,
  type Order,
  type InsertOrderItem,
  type InsertAuditLog,
} from "./schema";
import type { OrderWithItems, PaginatedOrders } from "@shared/schema";

type NewOrder = typeof orders.$inferInsert;
type NewOrderItem = Omit<InsertOrderItem, "id" | "orderId">;

export const ordersStorage = {
  async createOrder(
    orderData: NewOrder,
    items: NewOrderItem[],
  ): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    const itemsWithOrderId = items.map((item) => ({
      ...item,
      orderId: order.id,
    }));
    await db.insert(orderItems).values(itemsWithOrderId);
    return order;
  },

  async getOrderById(id: number): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));
    return { ...order, items };
  },

  async getOrderByPaymentIntentId(paymentIntentId: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.paymentIntentId, paymentIntentId));
    return order;
  },

  async hasOrdersForUser(userId: string): Promise<boolean> {
    const [order] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.userId, userId))
      .limit(1);
    return Boolean(order);
  },

  async getUserOrders(userId: string, page = 1, limit = 50): Promise<PaginatedOrders> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit + 1)
      .offset((page - 1) * limit);

    return this.attachItems(userOrders, page, limit);
  },

  async getAllOrders(page = 1, limit = 50): Promise<PaginatedOrders> {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit + 1)
      .offset((page - 1) * limit);

    return this.attachItems(allOrders, page, limit);
  },

  async attachItems(
    sourceOrders: Order[],
    page: number,
    limit: number,
  ): Promise<PaginatedOrders> {
    const hasMore = sourceOrders.length > limit;
    const visibleOrders = sourceOrders.slice(0, limit);
    const orderIds = visibleOrders.map((order) => order.id);

    const itemRows = orderIds.length
      ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
      : [];
    const customerRows = orderIds.length
      ? await db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            preferredPickupLocation: users.preferredPickupLocation,
          })
          .from(users)
          .where(inArray(users.id, visibleOrders.map((order) => order.userId)))
      : [];
    const itemsByOrder = new Map<number, typeof itemRows>();
    for (const item of itemRows) {
      const existing = itemsByOrder.get(item.orderId) ?? [];
      existing.push(item);
      itemsByOrder.set(item.orderId, existing);
    }
    const customersById = new Map(customerRows.map((customer) => [customer.id, customer]));

    return {
      items: visibleOrders.map((order) => ({
        ...order,
        items: itemsByOrder.get(order.id) ?? [],
        customer: customersById.get(order.userId),
      })),
      page,
      limit,
      hasMore,
    };
  },

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  },

  async updatePendingCheckoutDetails(
    id: number,
    pickupTime: Date,
    specialInstructions: string | null,
  ): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ pickupTime, specialInstructions, updatedAt: new Date() })
      .where(
        and(
          eq(orders.id, id),
          eq(orders.paymentMethod, "card"),
          eq(orders.paymentStatus, "pending"),
        ),
      )
      .returning();
    return updated;
  },

  async updateOrderPaymentStatus(id: number, paymentStatus: string): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ paymentStatus, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  },

  async cancelOrder(id: number): Promise<Order> {
    const [cancelled] = await db
      .update(orders)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return cancelled;
  },

  async createAuditLog(log: InsertAuditLog): Promise<void> {
    await db.insert(auditLogs).values(log);
  },

  async getDailyStats(date?: Date) {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dailyOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startOfDay),
          sql`${orders.createdAt} <= ${endOfDay}`,
        ),
      );

    const totalOrders = dailyOrders.length;
    const totalRevenue = dailyOrders.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0,
    );

    return {
      date: targetDate,
      totalOrders,
      totalRevenue,
      orders: dailyOrders,
    };
  },

  async getWeeklyStats() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const weeklyOrders = await db
      .select()
      .from(orders)
      .where(gte(orders.createdAt, startDate));

    const totalOrders = weeklyOrders.length;
    const totalRevenue = weeklyOrders.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0,
    );

    return {
      startDate,
      endDate,
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      orders: weeklyOrders,
    };
  },

  async getAnalytics(range: "today" | "7days" | "30days" = "7days") {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (range === "today" ? 0 : range === "30days" ? 29 : 6));

    const rangeOrders = await db
      .select()
      .from(orders)
      .where(and(gte(orders.createdAt, startDate), sql`${orders.createdAt} <= ${now}`));
    const validOrders = rangeOrders.filter((order) => order.status !== "cancelled");
    const orderIds = validOrders.map((order) => order.id);
    const rangeItems = orderIds.length
      ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
      : [];

    const dayKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const label = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    const dailyMap = new Map<string, { date: string; totalOrders: number; totalRevenue: number }>();
    for (let date = new Date(startDate); date <= now; date.setDate(date.getDate() + 1)) {
      dailyMap.set(dayKey(date), { date: label(date), totalOrders: 0, totalRevenue: 0 });
    }
    for (const order of validOrders) {
      const key = dayKey(new Date(order.createdAt ?? now));
      const day = dailyMap.get(key);
      if (day) {
        day.totalOrders += 1;
        day.totalRevenue += Number(order.total);
      }
    }

    const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    const hourlyMap = new Map<number, number>();
    for (const order of validOrders) {
      const hour = new Date(order.createdAt ?? now).getHours();
      hourlyMap.set(hour, (hourlyMap.get(hour) ?? 0) + 1);
    }
    for (const item of rangeItems) {
      const current = itemMap.get(item.menuItemName) ?? { name: item.menuItemName, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += Number(item.subtotal);
      itemMap.set(item.menuItemName, current);
    }

    const totalRevenue = validOrders.reduce((sum, order) => sum + Number(order.total), 0);
    return {
      dailyStats: Array.from(dailyMap.values()).map((day) => ({
        ...day,
        averageOrderValue: day.totalOrders ? day.totalRevenue / day.totalOrders : 0,
      })),
      popularItems: Array.from(itemMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5),
      hourlyStats: Array.from(hourlyMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([hour, orderCount]) => ({
          hour: new Date(2000, 0, 1, hour).toLocaleTimeString("en-US", { hour: "numeric" }),
          orders: orderCount,
        })),
      totalRevenue,
      totalOrders: validOrders.length,
      averageOrderValue: validOrders.length ? totalRevenue / validOrders.length : 0,
    };
  },
};
