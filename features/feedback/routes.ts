import type { Express } from "express";
import { isAuthenticated } from "../../server/localAuth";
import { feedbackStorage } from "./storage";
import { authStorage } from "../auth/storage";

export function registerFeedbackRoutes(app: Express) {
  app.post("/api/feedback", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { orderId, category, message, rating } = req.body;

      const validCategories = [
        "food_quality",
        "service",
        "menu_suggestion",
        "general",
      ];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: "Invalid feedback category" });
      }

      const newFeedback = await feedbackStorage.createFeedback({
        userId,
        orderId: orderId || null,
        category,
        message,
        rating: rating || null,
      });
      res.json(newFeedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  app.get("/api/feedback", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await authStorage.getUser(userId);

      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const allFeedback = await feedbackStorage.getAllFeedback();
      res.json(allFeedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.get("/api/feedback/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userFeedback = await feedbackStorage.getUserFeedback(userId);
      res.json(userFeedback);
    } catch (error) {
      console.error("Error fetching user feedback:", error);
      res.status(500).json({ message: "Failed to fetch user feedback" });
    }
  });

  app.patch(
    "/api/feedback/:id/status",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const user = await authStorage.getUser(userId);

        if (user?.role !== "admin") {
          return res.status(403).json({ message: "Unauthorized" });
        }

        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["pending", "reviewed", "resolved", "dismissed"];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ message: "Invalid status" });
        }

        const updatedFeedback = await feedbackStorage.updateFeedbackStatus(
          parseInt(id),
          status,
        );
        res.json(updatedFeedback);
      } catch (error) {
        console.error("Error updating feedback status:", error);
        res.status(500).json({ message: "Failed to update feedback status" });
      }
    },
  );
}
