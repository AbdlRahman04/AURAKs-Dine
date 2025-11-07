import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./localAuth";
import { z } from "zod";
import { insertMenuItemSchema } from "@shared/schema";

const stripeSecretKey = process.env.TESTING_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY or TESTING_STRIPE_SECRET_KEY');
}

console.log('[Stripe] Using key starting with:', stripeSecretKey.substring(0, 7), '...');
console.log('[Stripe] Key type:', stripeSecretKey.startsWith('sk_') ? 'SECRET KEY' : 'PUBLISHABLE KEY (ERROR!)');

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-11-20.acacia",
});

// WebSocket clients map for real-time updates
const wsClients = new Set<WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updates = req.body;
      const user = await storage.updateUserProfile(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Payment methods routes - FR-26
  app.get('/api/payment-methods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const paymentMethods = await storage.getUserPaymentMethods(userId);
      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.post('/api/payment-methods/setup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        });
        customerId = customer.id;
        await storage.updateUserStripeCustomerId(userId, customerId);
      }

      // Create SetupIntent for saving payment method
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
      });

      res.json({ clientSecret: setupIntent.client_secret });
    } catch (error) {
      console.error("Error creating setup intent:", error);
      res.status(500).json({ message: "Failed to create setup intent" });
    }
  });

  app.post('/api/payment-methods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { paymentMethodId } = req.body;

      if (!paymentMethodId) {
        return res.status(400).json({ message: "Payment method ID is required" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(400).json({ message: "Stripe customer not found" });
      }

      // Attach payment method to Stripe customer (if not already attached via SetupIntent)
      try {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: user.stripeCustomerId,
        });
      } catch (error: any) {
        // If already attached (e.g., via SetupIntent confirmation), that's fine
        if (error.code !== 'resource_already_owned') {
          throw error;
        }
      }

      // Get payment method details from Stripe
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

      // Check if this is the user's first payment method - make it default
      const existingPaymentMethods = await storage.getUserPaymentMethods(userId);
      const isFirstCard = existingPaymentMethods.length === 0;

      // Save payment method to database
      const savedPaymentMethod = await storage.addPaymentMethod({
        userId,
        stripePaymentMethodId: paymentMethodId,
        cardBrand: paymentMethod.card?.brand || null,
        cardLast4: paymentMethod.card?.last4 || null,
        cardExpMonth: paymentMethod.card?.exp_month || null,
        cardExpYear: paymentMethod.card?.exp_year || null,
        isDefault: isFirstCard,
      });

      res.json(savedPaymentMethod);
    } catch (error) {
      console.error("Error saving payment method:", error);
      res.status(500).json({ message: "Failed to save payment method" });
    }
  });

  app.delete('/api/payment-methods/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);

      // Verify the payment method belongs to the user
      const paymentMethods = await storage.getUserPaymentMethods(userId);
      const paymentMethod = paymentMethods.find(pm => pm.id === id);

      if (!paymentMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }

      // Detach from Stripe
      await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);

      // Delete from database (this also handles promoting another card to default if needed)
      await storage.deletePaymentMethod(id, userId);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting payment method:", error);
      if (error.message?.includes('not found or unauthorized')) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      res.status(500).json({ message: "Failed to delete payment method" });
    }
  });

  app.put('/api/payment-methods/:id/default', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);

      await storage.setDefaultPaymentMethod(userId, id);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error setting default payment method:", error);
      if (error.message?.includes('not found or unauthorized')) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      res.status(500).json({ message: "Failed to set default payment method" });
    }
  });

  // Menu routes
  app.get('/api/menu', async (_req, res) => {
    try {
      const items = await storage.getAllMenuItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching menu:", error);
      res.status(500).json({ message: "Failed to fetch menu" });
    }
  });

  app.get('/api/menu/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getMenuItemById(id);
      if (!item) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching menu item:", error);
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });

  app.post('/api/menu', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validated = insertMenuItemSchema.parse(req.body);
      const item = await storage.createMenuItem(validated);
      
      await storage.createAuditLog({
        userId,
        action: 'created_menu_item',
        entityType: 'menu_item',
        entityId: item.id.toString(),
        details: { itemName: item.name },
      });

      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.patch('/api/menu/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const updates = req.body;
      const item = await storage.updateMenuItem(id, updates);
      
      await storage.createAuditLog({
        userId,
        action: 'updated_menu_item',
        entityType: 'menu_item',
        entityId: id.toString(),
        details: { updates },
      });

      res.json(item);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete('/api/menu/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteMenuItem(id);
      
      await storage.createAuditLog({
        userId,
        action: 'deleted_menu_item',
        entityType: 'menu_item',
        entityId: id.toString(),
        details: {},
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Favorites routes
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const favoriteIds = await storage.getUserFavorites(userId);
      res.json(favoriteIds);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.get('/api/favorites/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const items = await storage.getUserFavoriteItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching favorite items:", error);
      res.status(500).json({ message: "Failed to fetch favorite items" });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { menuItemId } = req.body;
      const favorite = await storage.addFavorite({ userId, menuItemId });
      res.json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites/:menuItemId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const menuItemId = parseInt(req.params.menuItemId);
      await storage.removeFavorite(userId, menuItemId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Feedback routes
  app.post('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { orderId, category, message, rating } = req.body;

      // Validate category
      const validCategories = ['food_quality', 'service', 'menu_suggestion', 'general'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: "Invalid feedback category" });
      }

      const feedbackData = {
        userId,
        orderId: orderId || null,
        category,
        message,
        rating: rating || null,
        status: 'pending',
      };

      const newFeedback = await storage.createFeedback(feedbackData);
      res.json(newFeedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  app.get('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      // Only admins can view all feedback
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const allFeedback = await storage.getAllFeedback();
      res.json(allFeedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.get('/api/feedback/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userFeedback = await storage.getUserFeedback(userId);
      res.json(userFeedback);
    } catch (error) {
      console.error("Error fetching user feedback:", error);
      res.status(500).json({ message: "Failed to fetch user feedback" });
    }
  });

  app.patch('/api/feedback/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      // Only admins can update feedback status
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedFeedback = await storage.updateFeedbackStatus(parseInt(id), status);
      res.json(updatedFeedback);
    } catch (error) {
      console.error("Error updating feedback status:", error);
      res.status(500).json({ message: "Failed to update feedback status" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      let orders;
      if (user?.role === 'admin') {
        orders = await storage.getAllOrders();
      } else {
        orders = await storage.getUserOrders(userId);
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if user owns this order or is admin
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (order.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch('/api/orders/:id/status', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const order = await storage.updateOrderStatus(id, status);
      
      await storage.createAuditLog({
        userId,
        action: 'updated_order_status',
        entityType: 'order',
        entityId: id.toString(),
        details: { newStatus: status },
      });

      // Broadcast status update via WebSocket
      const message = JSON.stringify({ type: 'ORDER_STATUS_UPDATE', orderId: id, status });
      wsClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });

      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.post('/api/orders/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (order.status !== 'received') {
        return res.status(400).json({ message: "Order cannot be cancelled" });
      }

      const cancelledOrder = await storage.cancelOrder(id);
      res.json(cancelledOrder);
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  // Cash payment route - create order without Stripe
  app.post('/api/orders/cash', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { items, pickupTime, specialInstructions, subtotal, tax, total } = req.body;

      // Create order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Create order items from cart
      const orderItemsData = await Promise.all(
        items.map(async (item: any) => {
          const menuItem = await storage.getMenuItemById(item.menuItemId);
          if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);

          // Calculate price with size modifier if applicable
          let unitPrice = parseFloat(menuItem.price);
          if (item.selectedSize && menuItem.sizeVariants) {
            const sizeVariants = menuItem.sizeVariants as Array<{ name: string; priceModifier: string }>;
            const selectedVariant = sizeVariants.find((v: any) => v.name === item.selectedSize);
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
        })
      );

      // Create order in database with cash payment method
      const order = await storage.createOrder(
        {
          userId,
          orderNumber,
          status: 'received',
          pickupTime: new Date(pickupTime),
          specialInstructions,
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          total: total.toFixed(2),
          paymentMethod: 'cash',
          paymentIntentId: null, // No Stripe payment for cash
          paymentStatus: 'pending', // Will be marked as completed when paid at pickup
        },
        orderItemsData
      );

      // Broadcast new order via WebSocket
      const message = JSON.stringify({ type: 'NEW_ORDER', orderId: order.id });
      wsClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });

      res.json({ success: true, orderNumber: order.orderNumber });
    } catch (error: any) {
      console.error("Error creating cash order:", error);
      res.status(500).json({ message: "Error creating cash order: " + error.message });
    }
  });

  // Stripe payment route
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { items, pickupTime, specialInstructions, subtotal, tax, total } = req.body;

      // Create order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(total) * 100), // Convert to fils (smallest unit of AED)
        currency: "aed",
        metadata: {
          userId,
          orderNumber,
        },
      });

      // Create order items from cart
      const orderItemsData = await Promise.all(
        items.map(async (item: any) => {
          const menuItem = await storage.getMenuItemById(item.menuItemId);
          if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);

          // Calculate price with size modifier if applicable
          let unitPrice = parseFloat(menuItem.price);
          if (item.selectedSize && menuItem.sizeVariants) {
            const sizeVariants = menuItem.sizeVariants as Array<{ name: string; priceModifier: string }>;
            const selectedVariant = sizeVariants.find((v: any) => v.name === item.selectedSize);
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
        })
      );

      // Create order in database
      const order = await storage.createOrder(
        {
          userId,
          orderNumber,
          status: 'received',
          pickupTime: new Date(pickupTime),
          specialInstructions,
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          total: total.toFixed(2),
          paymentMethod: 'card',
          paymentIntentId: paymentIntent.id,
          paymentStatus: 'pending',
        },
        orderItemsData
      );

      // Broadcast new order via WebSocket
      const message = JSON.stringify({ type: 'NEW_ORDER', orderId: order.id });
      wsClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Analytics routes
  app.get('/api/analytics/daily', isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const stats = await storage.getDailyStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      res.status(500).json({ message: "Failed to fetch daily stats" });
    }
  });

  app.get('/api/analytics/weekly', isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const stats = await storage.getWeeklyStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
      res.status(500).json({ message: "Failed to fetch weekly stats" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    wsClients.add(ws);

    ws.on('close', () => {
      wsClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    });
  });

  return httpServer;
}
