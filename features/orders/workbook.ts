import * as XLSX from "xlsx";
import type { getAnalyticsReport } from "./analytics";

type AnalyticsReport = Awaited<ReturnType<typeof getAnalyticsReport>>;
const EXCEL_MAX_DATA_ROWS = 1_048_575;

function safeCell(value: unknown) {
  if (typeof value !== "string") return value ?? "";
  return /^[\u0000-\u0020]*[=+\-@]/.test(value) ? `'${value}` : value;
}

function addTable(workbook: XLSX.WorkBook, name: string, rows: Record<string, unknown>[], columns: string[]) {
  const normalizedRows = rows.map((row) => Object.fromEntries(
    columns.map((column) => [column, safeCell(row[column])]),
  ));
  const pages = Math.max(1, Math.ceil(normalizedRows.length / EXCEL_MAX_DATA_ROWS));
  for (let page = 0; page < pages; page++) {
    const pageName = pages > 1 ? `${name} ${page + 1}` : name;
    const sheet = XLSX.utils.json_to_sheet(normalizedRows.slice(page * EXCEL_MAX_DATA_ROWS, (page + 1) * EXCEL_MAX_DATA_ROWS), { header: columns });
    if (!normalizedRows.length) XLSX.utils.sheet_add_aoa(sheet, [columns], { origin: "A1" });
    XLSX.utils.book_append_sheet(workbook, sheet, pageName.slice(0, 31));
  }
}

export function buildAnalyticsWorkbook(report: AnalyticsReport) {
  const workbook = XLSX.utils.book_new();
  const summary = report.summary;
  const comparison = report.comparison as Record<string, { previous: unknown; changePercent: number | null }>;
  const kpiRows = Object.entries(summary)
    .filter(([, value]) => typeof value === "number" || value === null)
    .map(([metric, value]) => ({
      metric,
      current: value,
      previous: comparison[metric]?.previous ?? "",
      changePercent: comparison[metric]?.changePercent ?? "",
      periodStart: report.period.startDate,
      periodEnd: report.period.endDate,
      comparisonStart: report.comparisonPeriod.startDate,
      comparisonEnd: report.comparisonPeriod.endDate,
      timeZone: report.period.timeZone,
    }));
  addTable(workbook, "KPI Summary", kpiRows, ["metric", "current", "previous", "changePercent", "periodStart", "periodEnd", "comparisonStart", "comparisonEnd", "timeZone"]);
  addTable(workbook, "Daily Trends", report.dailyStats, ["date", "orders", "cancelledOrders", "sales"]);
  addTable(workbook, "Hourly Demand", report.hourlyStats, ["hour", "orders"]);
  addTable(workbook, "Item Performance", report.itemPerformance, ["itemName", "quantity", "sales", "grossContribution", "contributionMargin", "costCoveragePercent"]);
  addTable(workbook, "Orders", report.orders, ["orderNumber", "createdAt", "pickupTime", "status", "subtotal", "tax", "total", "paymentMethod", "paymentStatus"]);
  addTable(workbook, "Order Items", report.orderItems, ["orderNumber", "orderDate", "orderStatus", "itemName", "quantity", "unitPrice", "lineSales", "unitCost", "grossContribution", "selectedSize"]);
  addTable(workbook, "Payment Status", report.paymentStatus, ["method", "status", "orders", "sales"]);
  addTable(workbook, "Turnaround", report.turnaround, ["orderNumber", "createdAt", "readyAt", "minutes"]);
  addTable(workbook, "Feedback", report.feedback, ["feedbackId", "orderId", "category", "rating", "status", "createdAt"]);
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}
