import type { Express } from "express";
import { isAuthenticated } from "../../server/localAuth";
import { favoritesStorage } from "./storage";

export function registerFavoritesRoutes(app: Express) {
  app.get("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const favoriteIds = await favoritesStorage.getUserFavorites(userId);
      res.json(favoriteIds);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.get("/api/favorites/items", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const items = await favoritesStorage.getUserFavoriteItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching favorite items:", error);
      res.status(500).json({ message: "Failed to fetch favorite items" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { menuItemId } = req.body;
      const favorite = await favoritesStorage.addFavorite({
        userId,
        menuItemId,
      });
      res.json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete(
    "/api/favorites/:menuItemId",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const menuItemId = parseInt(req.params.menuItemId);
        await favoritesStorage.removeFavorite(userId, menuItemId);
        res.json({ success: true });
      } catch (error) {
        console.error("Error removing favorite:", error);
        res.status(500).json({ message: "Failed to remove favorite" });
      }
    },
  );
}
