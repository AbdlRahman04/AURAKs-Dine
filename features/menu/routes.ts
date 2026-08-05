import type { Express } from "express";
import { z } from "zod";
import { isAuthenticated, isAdmin } from "../../server/localAuth";
import { insertMenuItemSchema, type InsertMenuItem } from "./schema";
import { menuStorage } from "./storage";
import { ordersStorage } from "../orders/storage";

export function registerMenuRoutes(app: Express) {
  app.get("/api/menu", async (_req, res) => {
    try {
      const items = await menuStorage.getAllMenuItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching menu:", error);
      res.status(500).json({ message: "Failed to fetch menu" });
    }
  });

  app.get("/api/menu/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await menuStorage.getMenuItemById(id);
      if (!item) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching menu item:", error);
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });

  app.post("/api/menu", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validated = insertMenuItemSchema.parse(req.body) as InsertMenuItem;
      const item = await menuStorage.createMenuItem(validated);

      await ordersStorage.createAuditLog({
        userId,
        action: "created_menu_item",
        entityType: "menu_item",
        entityId: item.id.toString(),
        details: { itemName: item.name },
      });

      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.patch("/api/menu/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const updates = req.body;
      const item = await menuStorage.updateMenuItem(id, updates);

      await ordersStorage.createAuditLog({
        userId,
        action: "updated_menu_item",
        entityType: "menu_item",
        entityId: id.toString(),
        details: { updates },
      });

      res.json(item);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete(
    "/api/menu/:id",
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const id = parseInt(req.params.id);
        await menuStorage.deleteMenuItem(id);

        await ordersStorage.createAuditLog({
          userId,
          action: "deleted_menu_item",
          entityType: "menu_item",
          entityId: id.toString(),
          details: {},
        });

        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting menu item:", error);
        res.status(500).json({ message: "Failed to delete menu item" });
      }
    },
  );
}
