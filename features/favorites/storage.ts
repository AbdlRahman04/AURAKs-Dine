import { and, eq } from "drizzle-orm";
import { db } from "../../server/db";
import { favorites, type Favorite, type InsertFavorite } from "./schema";
import { menuItems, type MenuItem } from "../menu/schema";

export const favoritesStorage = {
  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    return newFavorite;
  },

  async removeFavorite(userId: string, menuItemId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.menuItemId, menuItemId),
        ),
      );
  },

  async getUserFavorites(userId: string): Promise<number[]> {
    const userFavorites = await db
      .select({ menuItemId: favorites.menuItemId })
      .from(favorites)
      .where(eq(favorites.userId, userId));
    return userFavorites.map((f) => f.menuItemId);
  },

  async getUserFavoriteItems(userId: string): Promise<MenuItem[]> {
    const result = await db
      .select({ menuItem: menuItems })
      .from(favorites)
      .innerJoin(menuItems, eq(favorites.menuItemId, menuItems.id))
      .where(eq(favorites.userId, userId));
    return result.map((r) => r.menuItem);
  },
};
