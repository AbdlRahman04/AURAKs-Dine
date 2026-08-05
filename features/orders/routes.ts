import type { Express } from "express";
import { isAuthenticated, isAdmin } from "../../server/localAuth";
import { broadcastWs } from "../../server/wsBroadcast";
import { authStorage } from "../auth/storage";
import { menuStorage } from "../menu/storage";
import { ordersStorage } from "./storage";

export function registerOrdersRoutes(app: Express) {
  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await authStorage.getUser(userId);

      const ordersList =
        user?.role === "admin"
          ? await ordersStorage.getAllOrders()
          : await ordersStorage.getUserOrders(userId);

      res.json(ordersList);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await ordersStorage.getOrderById(id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const userId = req.user.id;
      const user = await authStorage.getUser(userId);
      if (order.userId !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch(
    "/api/orders/:id/status",
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const id = parseInt(req.params.id);
        const { status } = req.body;

        const order = await ordersStorage.updateOrderStatus(id, status);

        await ordersStorage.createAuditLog({
          userId,
          action: "updated_order_status",
          entityType: "order",
          entityId: id.toString(),
          details: { newStatus: status },
        });

        broadcastWs({ type: "ORDER_STATUS_UPDATE", orderId: id, status });

        res.json(order);
      } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Failed to update order status" });
      }
    },
  );

  app.post("/api/orders/:id/cancel", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const order = await ordersStorage.getOrderById(id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (order.status !== "received") {
        return res.status(400).json({ message: "Order cannot be cancelled" });
      }

      const cancelledOrder = await ordersStorage.cancelOrder(id);
      res.json(cancelledOrder);
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  app.post("/api/orders/cash", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { items, pickupTime, specialInstructions, subtotal, tax, total } =
        req.body;

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const orderItemsData = await Promise.all(
        items.map(async (item: any) => {
          const menuItem = await menuStorage.getMenuItemById(item.menuItemId);
          if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);

          let unitPrice = parseFloat(menuItem.price);
          if (item.selectedSize && menuItem.sizeVariants) {
            const sizeVariants = menuItem.sizeVariants as Array<{
              name: string;
              priceModifier: string;
            }>;
            const selectedVariant = sizeVariants.find(
              (v) => v.name === item.selectedSize,
            );
            if (selectedVariant) {
              unitPrice += parseFloat(selectedVariant.priceModifier);
            }
          }

          return {
            menuItemId: item.menuItemId,
            menuItemName: menuItem.name,
            quantity: item.quantity,
            unitPrice: unitPrice.toFixed(2),
            selectedSize: item.selectedSize,
            customizations: item.customizations,
            subtotal: (unitPrice * item.quantity).toFixed(2),
          };
        }),
      );

      const order = await ordersStorage.createOrder(
        {
          userId,
          orderNumber,
          status: "received",
          pickupTime: new Date(pickupTime),
          specialInstructions,
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          total: total.toFixed(2),
          paymentMethod: "cash",
          paymentIntentId: null,
          paymentStatus: "pending",
        },
        orderItemsData,
      );

      broadcastWs({ type: "NEW_ORDER", orderId: order.id });

      res.json({ success: true, orderNumber: order.orderNumber });
    } catch (error: any) {
      console.error("Error creating cash order:", error);
      res
        .status(500)
        .json({ message: "Error creating cash order: " + error.message });
    }
  });

  app.get(
    "/api/analytics/daily",
    isAuthenticated,
    isAdmin,
    async (_req, res) => {
      try {
        const stats = await ordersStorage.getDailyStats();
        res.json(stats);
      } catch (error) {
        console.error("Error fetching daily stats:", error);
        res.status(500).json({ message: "Failed to fetch daily stats" });
      }
    },
  );

  app.get(
    "/api/analytics/weekly",
    isAuthenticated,
    isAdmin,
    async (_req, res) => {
      try {
        const stats = await ordersStorage.getWeeklyStats();
        res.json(stats);
      } catch (error) {
        console.error("Error fetching weekly stats:", error);
        res.status(500).json({ message: "Failed to fetch weekly stats" });
      }
    },
  );
}
