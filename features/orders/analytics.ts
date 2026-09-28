import { and, eq, gte, inArray, lt } from "drizzle-orm";
import { db } from "../../server/db";
import { feedback } from "../feedback/schema";
import { auditLogs, orderItems, orders } from "./schema";

export const REPORTING_TIME_ZONE = "Asia/Dubai";
const DAY_MS = 24 * 60 * 60 * 1000;
const DUBAI_OFFSET_MS = 4 * 60 * 60 * 1000;

export type AnalyticsRange = { startDate: string; endDate: string };

function isDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function dubaiDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORTING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dubaiMidnight(dateOnly: string) {
  return new Date(new Date(`${dateOnly}T00:00:00.000Z`).getTime() - DUBAI_OFFSET_MS);
}

function dateOnlyFromUtc(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function resolveAnalyticsRange(
  query: Record<string, unknown>,
  now = new Date(),
): AnalyticsRange {
  if (query.startDate !== undefined || query.endDate !== undefined) {
    if (!isDateOnly(query.startDate) || !isDateOnly(query.endDate)) {
      throw new Error("Provide valid startDate and endDate values in YYYY-MM-DD format.");
    }
    if (query.startDate > query.endDate) {
      throw new Error("startDate must be on or before endDate.");
    }
    return { startDate: query.startDate, endDate: query.endDate };
  }

  const today = dubaiDate(now);
  const range = query.range === "today" || query.range === "30days" ? query.range : "7days";
  const days = range === "today" ? 1 : range === "30days" ? 30 : 7;
  const start = new Date(`${today}T00:00:00.000Z`);
  start.setUTCDate(start.getUTCDate() - days + 1);
  return { startDate: dateOnlyFromUtc(start), endDate: today };
}

function dateBounds(range: AnalyticsRange) {
  const start = dubaiMidnight(range.startDate);
  const endExclusive = new Date(dubaiMidnight(range.endDate).getTime() + DAY_MS);
  return { start, endExclusive };
}

function previousRange(range: AnalyticsRange): AnalyticsRange {
  const { start, endExclusive } = dateBounds(range);
  const duration = endExclusive.getTime() - start.getTime();
  return {
    startDate: dateOnlyFromUtc(new Date(start.getTime() - duration + DUBAI_OFFSET_MS)),
    endDate: dateOnlyFromUtc(new Date(start.getTime() - DAY_MS + DUBAI_OFFSET_MS)),
  };
}

function zonedDayAndHour(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORTING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "00";
  return { day: `${part("year")}-${part("month")}-${part("day")}`, hour: Number(part("hour")) };
}

function percentageChange(current: number | null, previous: number | null) {
  if (current === null || previous === null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function calculateSummary(
  selectedOrders: typeof orders.$inferSelect[],
  selectedItems: typeof orderItems.$inferSelect[],
  serviceDurations: number[],
) {
  const orderCount = selectedOrders.length;
  const sales = selectedOrders.reduce((sum, order) => sum + Number(order.subtotal), 0);
  const knownCostItems = selectedItems.filter((item) => item.unitCostSnapshot !== null);
  const costsComplete = selectedItems.length === knownCostItems.length;
  const contribution = knownCostItems.reduce(
    (sum, item) => sum + (Number(item.unitPrice) - Number(item.unitCostSnapshot)) * item.quantity,
    0,
  );
  return {
    sales,
    orderCount,
    averageOrderValue: orderCount ? sales / orderCount : 0,
    cancelledOrders: 0,
    cancellationRate: 0,
    grossContribution: costsComplete ? contribution : null,
    contributionMargin: costsComplete && sales > 0 ? (contribution / sales) * 100 : null,
    costCoveragePercent: selectedItems.length ? (knownCostItems.length / selectedItems.length) * 100 : null,
    averageTurnaroundMinutes: serviceDurations.length
      ? serviceDurations.reduce((sum, duration) => sum + duration, 0) / serviceDurations.length
      : null,
    completedOrders: 0,
    unresolvedFeedback: 0,
    averageFeedbackRating: null as number | null,
  };
}

export async function getAnalyticsReport(range: AnalyticsRange) {
  const currentBounds = dateBounds(range);
  const priorRange = previousRange(range);
  const priorBounds = dateBounds(priorRange);

  const [allCurrentOrders, priorOrders, feedbackRows, priorFeedbackRows] = await Promise.all([
    db.select().from(orders).where(and(gte(orders.createdAt, currentBounds.start), lt(orders.createdAt, currentBounds.endExclusive))),
    db.select().from(orders).where(and(gte(orders.createdAt, priorBounds.start), lt(orders.createdAt, priorBounds.endExclusive))),
    db.select({ id: feedback.id, orderId: feedback.orderId, category: feedback.category, rating: feedback.rating, status: feedback.status, createdAt: feedback.createdAt })
      .from(feedback)
      .where(and(gte(feedback.createdAt, currentBounds.start), lt(feedback.createdAt, currentBounds.endExclusive))),
    db.select({ id: feedback.id, orderId: feedback.orderId, category: feedback.category, rating: feedback.rating, status: feedback.status, createdAt: feedback.createdAt })
      .from(feedback)
      .where(and(gte(feedback.createdAt, priorBounds.start), lt(feedback.createdAt, priorBounds.endExclusive))),
  ]);

  const currentOrders = allCurrentOrders.filter((order) => order.status !== "cancelled");
  const comparisonOrders = priorOrders.filter((order) => order.status !== "cancelled");
  allCurrentOrders.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  priorOrders.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  const allOrderIds = [...allCurrentOrders, ...priorOrders].map((order) => order.id);
  const allItems = allOrderIds.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, allOrderIds))
    : [];
  const currentOrderIds = new Set(allCurrentOrders.map((order) => order.id));
  const currentItems = allItems.filter((item) => currentOrderIds.has(item.orderId));
  const cancelledOrderIds = new Set(allCurrentOrders.filter((order) => order.status === "cancelled").map((order) => order.id));
  const currentItemsForSales = currentItems.filter((item) => !cancelledOrderIds.has(item.orderId));
  const previousOrderIds = new Set(priorOrders.filter((order) => order.status !== "cancelled").map((order) => order.id));
  const previousItems = allItems.filter((item) => previousOrderIds.has(item.orderId));
  const itemOrderIds = [...Array.from(currentOrderIds), ...priorOrders.map((order) => order.id)].map(String);
  const statusEvents = itemOrderIds.length
    ? await db.select().from(auditLogs).where(and(
        eq(auditLogs.entityType, "order"),
        eq(auditLogs.action, "updated_order_status"),
        inArray(auditLogs.entityId, itemOrderIds),
      ))
    : [];

  const statusByOrder = new Map<number, Array<{ status: string; at: Date }>>();
  for (const event of statusEvents) {
    const id = Number(event.entityId);
    const status = (event.details as { newStatus?: unknown } | null)?.newStatus;
    if (!Number.isInteger(id) || typeof status !== "string" || !event.createdAt) continue;
    const events = statusByOrder.get(id) ?? [];
    events.push({ status, at: event.createdAt });
    statusByOrder.set(id, events);
  }
  Array.from(statusByOrder.values()).forEach((events) => events.sort((a, b) => a.at.getTime() - b.at.getTime()));

  const getTurnaroundRows = (rangeOrders: typeof currentOrders) => rangeOrders.flatMap((order) => {
    const events = statusByOrder.get(order.id) ?? [];
    const ready = events.find((event) => event.status === "ready" || event.status === "completed");
    if (!ready || !order.createdAt) return [];
    return [{ orderNumber: order.orderNumber, createdAt: order.createdAt, readyAt: ready.at, minutes: Math.max(0, (ready.at.getTime() - order.createdAt.getTime()) / 60_000) }];
  });
  const turnaroundRows = getTurnaroundRows(currentOrders).sort((a, b) => b.readyAt.getTime() - a.readyAt.getTime());
  const priorTurnaroundRows = getTurnaroundRows(comparisonOrders);

  const daily = new Map<string, { date: string; orders: number; cancelledOrders: number; sales: number }>();
  const startDay = new Date(`${range.startDate}T00:00:00.000Z`);
  const endDay = new Date(`${range.endDate}T00:00:00.000Z`);
  for (let day = new Date(startDay); day <= endDay; day.setUTCDate(day.getUTCDate() + 1)) {
    const key = day.toISOString().slice(0, 10);
    daily.set(key, { date: key, orders: 0, cancelledOrders: 0, sales: 0 });
  }
  const hourly = Array.from({ length: 24 }, (_, hour) => ({ hour, orders: 0 }));
  for (const order of allCurrentOrders) {
    if (!order.createdAt) continue;
    const { day, hour } = zonedDayAndHour(order.createdAt);
    const dayRow = daily.get(day);
    if (dayRow) {
      if (order.status === "cancelled") dayRow.cancelledOrders++;
      else {
        dayRow.orders++;
        dayRow.sales += Number(order.subtotal);
      }
    }
    if (order.status !== "cancelled") hourly[hour].orders++;
  }

  const itemPerformance = new Map<string, {
    itemName: string; quantity: number; sales: number; knownCost: number;
    contribution: number; rows: number; costKnownRows: number;
  }>();
  const orderById = new Map(allCurrentOrders.map((order) => [order.id, order]));
  for (const item of currentItemsForSales) {
    const order = orderById.get(item.orderId);
    if (!order || order.status === "cancelled") continue;
    const key = `${item.menuItemId}:${item.menuItemName}`;
    const row = itemPerformance.get(key) ?? { itemName: item.menuItemName, quantity: 0, sales: 0, knownCost: 0, contribution: 0, rows: 0, costKnownRows: 0 };
    row.quantity += item.quantity;
    row.sales += Number(item.subtotal);
    row.rows++;
    if (item.unitCostSnapshot !== null) {
      const cost = Number(item.unitCostSnapshot) * item.quantity;
      row.knownCost += cost;
      row.contribution += Number(item.subtotal) - cost;
      row.costKnownRows++;
    }
    itemPerformance.set(key, row);
  }

  const statuses = new Map<string, number>();
  const payments = new Map<string, { method: string; status: string; orders: number; sales: number }>();
  for (const order of allCurrentOrders) {
    statuses.set(order.status, (statuses.get(order.status) ?? 0) + 1);
    const key = `${order.paymentMethod}:${order.paymentStatus}`;
    const row = payments.get(key) ?? { method: order.paymentMethod, status: order.paymentStatus, orders: 0, sales: 0 };
    row.orders++;
    if (order.status !== "cancelled") row.sales += Number(order.subtotal);
    payments.set(key, row);
  }

  const currentSummary = calculateSummary(currentOrders, currentItemsForSales, turnaroundRows.map((row) => row.minutes));
  const priorSummary = calculateSummary(comparisonOrders, previousItems, priorTurnaroundRows.map((row) => row.minutes));
  currentSummary.cancelledOrders = allCurrentOrders.filter((order) => order.status === "cancelled").length;
  priorSummary.cancelledOrders = priorOrders.filter((order) => order.status === "cancelled").length;
  currentSummary.cancellationRate = allCurrentOrders.length
    ? currentSummary.cancelledOrders / allCurrentOrders.length * 100
    : 0;
  priorSummary.cancellationRate = priorOrders.length
    ? priorSummary.cancelledOrders / priorOrders.length * 100
    : 0;
  currentSummary.completedOrders = statuses.get("completed") ?? 0;
  const priorCompletedOrders = priorOrders.filter((order) => order.status === "completed").length;
  priorSummary.completedOrders = priorCompletedOrders;
  currentSummary.unresolvedFeedback = feedbackRows.filter((row) => row.status === "pending" || row.status === "reviewed").length;
  priorSummary.unresolvedFeedback = priorFeedbackRows.filter((row) => row.status === "pending" || row.status === "reviewed").length;
  const ratedFeedback = feedbackRows.filter((row) => row.rating !== null);
  const priorRatedFeedback = priorFeedbackRows.filter((row) => row.rating !== null);
  currentSummary.averageFeedbackRating = ratedFeedback.length
    ? ratedFeedback.reduce((sum, row) => sum + Number(row.rating), 0) / ratedFeedback.length
    : null;
  priorSummary.averageFeedbackRating = priorRatedFeedback.length
    ? priorRatedFeedback.reduce((sum, row) => sum + Number(row.rating), 0) / priorRatedFeedback.length
    : null;
  const comparison = Object.fromEntries(
    Object.entries(currentSummary).map(([key, value]) => [key, { previous: priorSummary[key as keyof typeof priorSummary], changePercent: percentageChange(value, priorSummary[key as keyof typeof priorSummary]) }]),
  );
  const orderRows = allCurrentOrders.map((order) => ({
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    pickupTime: order.pickupTime,
    status: order.status,
    subtotal: Number(order.subtotal),
    tax: Number(order.tax),
    total: Number(order.total),
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
  }));
  const itemRows = currentItems.map((item) => {
    const order = orderById.get(item.orderId)!;
    return {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      orderStatus: order.status,
      itemName: item.menuItemName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineSales: Number(item.subtotal),
      unitCost: item.unitCostSnapshot === null ? null : Number(item.unitCostSnapshot),
      grossContribution: item.unitCostSnapshot === null ? null : Number(item.subtotal) - Number(item.unitCostSnapshot) * item.quantity,
      selectedSize: item.selectedSize,
    };
  });
  return {
    period: { ...range, timeZone: REPORTING_TIME_ZONE },
    comparisonPeriod: priorRange,
    summary: {
      ...currentSummary,
      cancellationRate: allCurrentOrders.length ? (currentSummary.cancelledOrders / allCurrentOrders.length) * 100 : 0,
      completedOrders: currentSummary.completedOrders,
      unresolvedFeedback: currentSummary.unresolvedFeedback,
      averageFeedbackRating: currentSummary.averageFeedbackRating,
      paymentStatusBreakdown: Array.from(payments.values()),
      statusBreakdown: Array.from(statuses, ([status, count]) => ({ status, count })),
    },
    comparison,
    dailyStats: Array.from(daily.values()),
    hourlyStats: hourly,
    itemPerformance: Array.from(itemPerformance.values()).map((item) => ({
      itemName: item.itemName,
      quantity: item.quantity,
      sales: item.sales,
      grossContribution: item.rows === item.costKnownRows ? item.contribution : null,
      contributionMargin: item.rows === item.costKnownRows && item.sales > 0 ? item.contribution / item.sales * 100 : null,
      costCoveragePercent: item.rows ? item.costKnownRows / item.rows * 100 : null,
    })).sort((a, b) => b.sales - a.sales),
    orders: orderRows,
    orderItems: itemRows,
    paymentStatus: Array.from(payments.values()),
    turnaround: turnaroundRows,
    feedback: feedbackRows.map((row) => ({
      feedbackId: row.id,
      orderId: row.orderId,
      category: row.category,
      rating: row.rating,
      status: row.status,
      createdAt: row.createdAt,
    })),
  };
}
