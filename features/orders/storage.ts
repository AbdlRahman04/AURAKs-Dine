import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "../../server/db";
import {
  orders,
  orderItems,
  auditLogs,
  type Order,
  type InsertOrderItem,
  type InsertAuditLog,
} from "./schema";
import type { OrderWithItems } from "@shared/schema";

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

  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    return Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      }),
    );
  },

  async getAllOrders(): Promise<OrderWithItems[]> {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    return Promise.all(
      allOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      }),
    );
  },

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
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
};
