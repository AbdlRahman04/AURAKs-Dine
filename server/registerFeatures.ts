import type { Express } from "express";
import { registerAuthFeature } from "../features/auth";
import { registerMenuFeature } from "../features/menu";
import { registerFavoritesFeature } from "../features/favorites";
import { registerFeedbackFeature } from "../features/feedback";
import { registerOrdersFeature } from "../features/orders";
import { registerPaymentsFeature } from "../features/payments";

/**
 * Registers all plug-and-play feature modules on the Express app.
 * Core files (index, config, db, database) should not embed feature routes.
 */
export function registerFeatures(app: Express) {
  registerAuthFeature(app);
  registerMenuFeature(app);
  registerFavoritesFeature(app);
  registerFeedbackFeature(app);
  // cash order route before parameterized order routes is handled inside feature
  registerOrdersFeature(app);
  registerPaymentsFeature(app);
}
