import type { Express } from "express";
import { registerPaymentsRoutes } from "./routes";

export function registerPaymentsFeature(app: Express) {
  registerPaymentsRoutes(app);
}

export * from "./schema";
export { paymentsStorage } from "./storage";
