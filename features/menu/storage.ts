import { eq } from "drizzle-orm";
import { db } from "../../server/db";
import {
  menuItems,
  type MenuItem,
  type InsertMenuItem,
} from "./schema";

export const menuStorage = {
  async getAllMenuItems(): Promise<MenuItem[]> {
    return await db
      .select()
      .from(menuItems)
      .orderBy(menuItems.category, menuItems.name);
  },

  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    const [item] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id));
    return item;
  },

  async getMenuItemByName(name: string): Promise<MenuItem | undefined> {
    const [item] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.name, name));
    return item;
  },

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  },

  async updateMenuItem(
    id: number,
    updates: Partial<MenuItem>,
  ): Promise<MenuItem> {
    const [updated] = await db
      .update(menuItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    return updated;
  },

  async upsertMenuItemByName(item: InsertMenuItem): Promise<MenuItem> {
    const existing = await this.getMenuItemByName(item.name);
    if (existing) {
      return this.updateMenuItem(existing.id, item as Partial<MenuItem>);
    }
    return this.createMenuItem(item);
  },

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  },
};
