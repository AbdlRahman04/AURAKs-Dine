import type { Express } from "express";
import { z } from "zod";
import { isAuthenticated, isAdmin } from "../../server/localAuth";
import multer from "multer";
import {
  menuItemInputSchema,
  updateMenuItemSchema,
} from "./schema";
import { convertMenuImageToWebp, MenuImageError, menuImageUpload } from "./image";
import { menuStorage, type MenuImageAction, type MenuItemWrite } from "./storage";
import { ordersStorage } from "../orders/storage";

const DEFAULT_MENU_LIMIT = 24;
const MAX_MENU_LIMIT = 50;

function withMenuImageUpload(req: any, res: any, next: any) {
  menuImageUpload.single("image")(req, res, (error: unknown) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        message: "Image is too large. Choose an image smaller than 10 MB.",
        field: "image",
      });
    }

    return res.status(400).json({
      message: "The image upload could not be read. Please choose a valid image file.",
      field: "image",
    });
  });
}

function parseMenuPayload(req: any): {
  data: Record<string, unknown>;
  imageAction?: MenuImageAction;
} {
  const isMultipart = Boolean(req.is("multipart/form-data"));
  const rawData = isMultipart ? req.body?.data : req.body;
  let data: Record<string, unknown>;

  if (typeof rawData === "string") {
    try {
      data = JSON.parse(rawData) as Record<string, unknown>;
    } catch {
      throw new MenuImageError("Menu item data is not valid JSON.");
    }
  } else if (rawData && typeof rawData === "object") {
    data = { ...rawData };
  } else {
    throw new MenuImageError("Menu item data is required.");
  }

  const rawAction = isMultipart ? req.body?.imageAction : data.imageAction;
  delete data.imageAction;
  delete data.imageData;

  if (rawAction === undefined || rawAction === "") {
    return { data };
  }

  if (!['keep', 'upload', 'remove', 'url'].includes(String(rawAction))) {
    throw new MenuImageError("Image action must be keep, upload, remove, or url.");
  }

  return { data, imageAction: rawAction as MenuImageAction };
}

function resolveImageAction(
  parsedAction: MenuImageAction | undefined,
  data: Record<string, unknown>,
  hasFile: boolean,
): MenuImageAction {
  if (parsedAction) {
    return parsedAction;
  }
  if (hasFile) {
    return "upload";
  }
  if (Object.prototype.hasOwnProperty.call(data, "imageUrl")) {
    return "url";
  }
  return "keep";
}

function parseMenuQuery(req: any) {
  const pageValue = Number.parseInt(String(req.query.page ?? "1"), 10);
  const limitValue = Number.parseInt(
    String(req.query.limit ?? DEFAULT_MENU_LIMIT),
    10,
  );
  const category = typeof req.query.category === "string"
    ? req.query.category.trim()
    : "";
  const search = typeof req.query.search === "string"
    ? req.query.search.trim().slice(0, 100)
    : "";

  return {
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
    limit: Number.isFinite(limitValue)
      ? Math.min(Math.max(limitValue, 1), MAX_MENU_LIMIT)
      : DEFAULT_MENU_LIMIT,
    category: category && category.toLowerCase() !== "all" ? category : undefined,
    search: search || undefined,
  };
}

export function registerMenuRoutes(app: Express) {
  app.get("/api/menu", async (req, res) => {
    try {
      const items = await menuStorage.getMenuItems({
        ...parseMenuQuery(req),
        includeUnavailable: false,
      });
      res.json(items);
    } catch (error) {
      console.error("Error fetching menu:", error);
      res.status(500).json({ message: "Failed to fetch menu" });
    }
  });

  app.get("/api/admin/menu", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const items = await menuStorage.getMenuItems({
        ...parseMenuQuery(req),
        includeUnavailable: true,
      });
      res.json(items);
    } catch (error) {
      console.error("Error fetching admin menu:", error);
      res.status(500).json({ message: "Failed to fetch admin menu" });
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

  app.get("/api/menu/:id/image", async (req, res) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(id) || id < 1) {
        return res.status(404).json({ message: "Menu image not found" });
      }

      const image = await menuStorage.getMenuImage(id);
      if (!image) {
        return res.status(404).json({ message: "Menu image not found" });
      }

      const etag = `"${image.updatedAt?.getTime() ?? 0}-${image.data.length}"`;
      if (req.headers["if-none-match"] === etag) {
        return res.status(304).end();
      }

      res
        .status(200)
        .set({
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=86400",
          ETag: etag,
        })
        .send(image.data);
    } catch (error) {
      console.error("Error fetching menu image:", error);
      res.status(500).json({ message: "Failed to fetch menu image" });
    }
  });

  app.post(
    "/api/menu",
    isAuthenticated,
    isAdmin,
    withMenuImageUpload,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const request = parseMenuPayload(req);
        const validated = menuItemInputSchema.parse(request.data) as MenuItemWrite;
        const imageAction = resolveImageAction(
          request.imageAction,
          request.data,
          Boolean(req.file),
        );

        if (imageAction === "remove") {
          throw new MenuImageError("There is no image to remove from a new menu item.");
        }

        const image = imageAction === "upload"
          ? await convertMenuImageToWebp(req.file)
          : undefined;
        const item = await menuStorage.createMenuItem(validated, image);

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
      if (error instanceof MenuImageError) {
        return res.status(error.statusCode).json({ message: error.message, field: "image" });
      }
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
    },
  );

  app.patch(
    "/api/menu/:id",
    isAuthenticated,
    isAdmin,
    withMenuImageUpload,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const id = Number.parseInt(req.params.id, 10);
        if (!Number.isInteger(id) || id < 1) {
          return res.status(404).json({ message: "Menu item not found" });
        }

        const request = parseMenuPayload(req);
        const updates = updateMenuItemSchema.parse(request.data) as Partial<MenuItemWrite>;
        const imageAction = resolveImageAction(
          request.imageAction,
          request.data,
          Boolean(req.file),
        );
        const image = imageAction === "upload"
          ? await convertMenuImageToWebp(req.file)
          : undefined;
        const item = await menuStorage.updateMenuItem(id, updates, imageAction, image);

        if (!item) {
          return res.status(404).json({ message: "Menu item not found" });
        }

      await ordersStorage.createAuditLog({
        userId,
        action: "updated_menu_item",
        entityType: "menu_item",
        entityId: id.toString(),
          details: { updates, imageAction },
      });

        res.json(item);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ message: "Validation error", errors: error.errors });
        }
        if (error instanceof MenuImageError) {
          return res.status(error.statusCode).json({ message: error.message, field: "image" });
        }
        console.error("Error updating menu item:", error);
        res.status(500).json({ message: "Failed to update menu item" });
      }
    },
  );

  app.delete(
    "/api/menu/:id",
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const id = parseInt(req.params.id);
        const result = await menuStorage.deleteMenuItem(id);

        if (!result.deleted && !result.archived) {
          return res.status(404).json({ message: "Menu item not found" });
        }

        await ordersStorage.createAuditLog({
          userId,
          action: "deleted_menu_item",
          entityType: "menu_item",
          entityId: id.toString(),
          details: {},
        });

        res.json({
          success: true,
          archived: result.archived,
          message: result.archived
            ? "Menu item archived because it is part of historical orders"
            : "Menu item deleted",
        });
      } catch (error) {
        console.error("Error deleting menu item:", error);
        res.status(500).json({ message: "Failed to delete menu item" });
      }
    },
  );
}
