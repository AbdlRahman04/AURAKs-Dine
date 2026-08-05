import type { Express } from "express";
import { registerMenuRoutes } from "./routes";

export function registerMenuFeature(app: Express) {
  registerMenuRoutes(app);
}

export * from "./schema";
export { menuStorage } from "./storage";
