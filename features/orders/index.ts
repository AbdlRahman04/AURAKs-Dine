import type { Express } from "express";
import { registerOrdersRoutes } from "./routes";

export function registerOrdersFeature(app: Express) {
  registerOrdersRoutes(app);
}

export * from "./schema";
export { ordersStorage } from "./storage";
