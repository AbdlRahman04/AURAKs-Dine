import type { Express } from "express";
import { registerFeedbackRoutes } from "./routes";

export function registerFeedbackFeature(app: Express) {
  registerFeedbackRoutes(app);
}

export * from "./schema";
export { feedbackStorage } from "./storage";
