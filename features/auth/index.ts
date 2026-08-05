import type { Express } from "express";
import { registerAuthRoutes } from "./routes";

export function registerAuthFeature(app: Express) {
  registerAuthRoutes(app);
}

export * from "./schema";
export { authStorage } from "./storage";
