import type { Express } from "express";
import { registerFavoritesRoutes } from "./routes";

export function registerFavoritesFeature(app: Express) {
  registerFavoritesRoutes(app);
}

export * from "./schema";
export { favoritesStorage } from "./storage";
