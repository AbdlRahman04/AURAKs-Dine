import { and, asc, count, eq, getTableColumns, ilike, or, type SQL } from "drizzle-orm";
import { db } from "../../server/db";
import {
  menuItems,
  type MenuItem,
  type InsertMenuItem,
} from "./schema";
import { orderItems } from "../orders/schema";

const { imageData: _imageData, unitCost: _unitCost, ...publicMenuItemColumns } = getTableColumns(menuItems);
const { imageData: _adminImageData, ...adminMenuItemColumns } = getTableColumns(menuItems);

export type MenuItemPublic = Omit<MenuItem, "imageData" | "unitCost">;
export type AdminMenuItem = Omit<MenuItem, "imageData">;
export type MenuItemWrite = Omit<InsertMenuItem, "imageData">;
export type MenuImageAction = "keep" | "upload" | "remove" | "url";

export type MenuQuery = {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  includeUnavailable?: boolean;
};

function imageEndpoint(id: number, version: Date) {
  return `/api/menu/${id}/image?v=${version.getTime()}`;
}

export const menuStorage = {
  async getAllMenuItems(): Promise<MenuItemPublic[]> {
    return await db
      .select(publicMenuItemColumns)
      .from(menuItems)
      .orderBy(menuItems.category, menuItems.name);
  },

  async getAllMenuItemsWithImages(): Promise<MenuItem[]> {
    return await db
      .select()
      .from(menuItems)
      .orderBy(menuItems.category, menuItems.name);
  },

  async getMenuItems({
    page,
    limit,
    search,
    category,
    includeUnavailable = false,
  }: MenuQuery) {
    const filters: SQL[] = [];

    if (!includeUnavailable) {
      filters.push(eq(menuItems.isAvailable, true));
    }

    if (category) {
      filters.push(eq(menuItems.category, category));
    }

    if (search) {
      const pattern = `%${search}%`;
      filters.push(
        or(
          ilike(menuItems.name, pattern),
          ilike(menuItems.nameAr, pattern),
          ilike(menuItems.description, pattern),
          ilike(menuItems.descriptionAr, pattern),
        )!,
      );
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;
    const [countResult] = await db
      .select({ value: count() })
      .from(menuItems)
      .where(whereClause);
    const rows = await db
      .select(includeUnavailable ? adminMenuItemColumns : publicMenuItemColumns)
      .from(menuItems)
      .where(whereClause)
      .orderBy(asc(menuItems.category), asc(menuItems.name))
      .limit(limit + 1)
      .offset((page - 1) * limit);

    return {
      items: rows.slice(0, limit),
      page,
      limit,
      hasMore: rows.length > limit,
      total: Number(countResult?.value ?? 0),
    };
  },

  async getMenuItemById(id: number): Promise<MenuItemPublic | undefined> {
    const [item] = await db
      .select(publicMenuItemColumns)
      .from(menuItems)
      .where(eq(menuItems.id, id));
    return item;
  },

  async getOrderMenuItemById(id: number): Promise<AdminMenuItem | undefined> {
    const [item] = await db
      .select(adminMenuItemColumns)
      .from(menuItems)
      .where(eq(menuItems.id, id));
    return item;
  },

  async getMenuItemByName(name: string): Promise<MenuItemPublic | undefined> {
    const [item] = await db
      .select(publicMenuItemColumns)
      .from(menuItems)
      .where(eq(menuItems.name, name));
    return item;
  },

  async getMenuImage(id: number): Promise<{ data: Buffer; updatedAt: Date | null } | undefined> {
    const [image] = await db
      .select({ imageData: menuItems.imageData, updatedAt: menuItems.updatedAt })
      .from(menuItems)
      .where(eq(menuItems.id, id));

    if (!image?.imageData) {
      return undefined;
    }

    return { data: image.imageData, updatedAt: image.updatedAt };
  },

  async createMenuItem(item: MenuItemWrite, image?: Buffer): Promise<MenuItemPublic> {
    const now = new Date();

    return await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(menuItems)
        .values({
          ...item,
          imageData: image ?? null,
          imageUrl: image ? null : item.imageUrl ?? null,
          updatedAt: now,
        })
        .returning({ id: menuItems.id });

      if (!created) {
        throw new Error("Menu item was not created");
      }

      if (image) {
        await tx
          .update(menuItems)
          .set({ imageUrl: imageEndpoint(created.id, now), updatedAt: now })
          .where(eq(menuItems.id, created.id));
      }

      const [result] = await tx
        .select(publicMenuItemColumns)
        .from(menuItems)
        .where(eq(menuItems.id, created.id));

      if (!result) {
        throw new Error("Created menu item could not be loaded");
      }

      return result;
    });
  },

  async updateMenuItem(
    id: number,
    updates: Partial<MenuItemWrite>,
    imageAction: MenuImageAction = "keep",
    image?: Buffer,
  ): Promise<MenuItemPublic | undefined> {
    const now = new Date();

    return await db.transaction(async (tx) => {
      const imageUpdates: Partial<typeof menuItems.$inferInsert> = {};

      if (imageAction === "upload") {
        if (!image) {
          throw new Error("An image file is required for imageAction=upload");
        }
        imageUpdates.imageData = image;
        imageUpdates.imageUrl = imageEndpoint(id, now);
      } else if (imageAction === "remove") {
        imageUpdates.imageData = null;
        imageUpdates.imageUrl = null;
      } else if (imageAction === "url") {
        imageUpdates.imageData = null;
        imageUpdates.imageUrl = updates.imageUrl ?? null;
      }

      const [updated] = await tx
        .update(menuItems)
        .set({
          ...updates,
          ...imageUpdates,
          updatedAt: now,
        })
        .where(eq(menuItems.id, id))
        .returning({ id: menuItems.id });

      if (!updated) {
        return undefined;
      }

      const [result] = await tx
        .select(publicMenuItemColumns)
        .from(menuItems)
        .where(eq(menuItems.id, id));

      return result;
    });
  },

  async upsertMenuItemByName(item: MenuItemWrite): Promise<MenuItemPublic> {
    const existing = await this.getMenuItemByName(item.name);
    if (existing) {
      const action: MenuImageAction = item.imageUrl ? "url" : "keep";
      const updated = await this.updateMenuItem(existing.id, item, action);
      if (!updated) {
        throw new Error(`Menu item ${existing.id} could not be updated`);
      }
      return updated;
    }
    return this.createMenuItem(item);
  },

  async deleteMenuItem(id: number): Promise<{ deleted: boolean; archived: boolean }> {
    // Keep menu items that appear in historical orders so analytics and receipts
    // retain their original references. They are hidden from the live menu instead.
    const [{ value: orderItemCount }] = await db
      .select({ value: count() })
      .from(orderItems)
      .where(eq(orderItems.menuItemId, id));

    if (orderItemCount > 0) {
      const [archived] = await db
        .update(menuItems)
        .set({
          isAvailable: false,
          isSpecial: false,
          specialPrice: null,
          updatedAt: new Date(),
        })
        .where(eq(menuItems.id, id))
        .returning({ id: menuItems.id });

      return { deleted: false, archived: Boolean(archived) };
    }

    const deleted = await db
      .delete(menuItems)
      .where(eq(menuItems.id, id))
      .returning({ id: menuItems.id });

    return { deleted: deleted.length > 0, archived: false };
  },
};
