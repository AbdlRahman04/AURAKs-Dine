import type { Express } from "express";
import Stripe from "stripe";
import { isAuthenticated } from "../../server/localAuth";
import { broadcastWs } from "../../server/wsBroadcast";
import { authStorage } from "../auth/storage";
import { menuStorage } from "../menu/storage";
import { ordersStorage } from "../orders/storage";
import { paymentsStorage } from "./storage";

function getStripe(): Stripe {
  const stripeSecretKey =
    process.env.TESTING_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error(
      "Missing required Stripe secret: STRIPE_SECRET_KEY or TESTING_STRIPE_SECRET_KEY",
    );
  }
  return new Stripe(stripeSecretKey, {
    // Match installed stripe package LatestApiVersion
    apiVersion: "2025-09-30.clover",
  });
}

let stripe: Stripe | null = null;

function stripeClient(): Stripe {
  if (!stripe) {
    stripe = getStripe();
    if (process.env.NODE_ENV !== "production") {
      const key =
        process.env.TESTING_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || "";
      console.log(
        "[Stripe] Using key starting with:",
        key.substring(0, 7),
        "...",
      );
    }
  }
  return stripe;
}

export function registerPaymentsRoutes(app: Express) {
  app.get("/api/payment-methods", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const methods = await paymentsStorage.getUserPaymentMethods(userId);
      res.json(methods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.post(
    "/api/payment-methods/setup",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const user = await authStorage.getUser(userId);

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        let customerId = user.stripeCustomerId;
        if (!customerId) {
          const customer = await stripeClient().customers.create({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
          });
          customerId = customer.id;
          await authStorage.updateUserStripeCustomerId(userId, customerId);
        }

        const setupIntent = await stripeClient().setupIntents.create({
          customer: customerId,
          payment_method_types: ["card"],
        });

        res.json({ clientSecret: setupIntent.client_secret });
      } catch (error) {
        console.error("Error creating setup intent:", error);
        res.status(500).json({ message: "Failed to create setup intent" });
      }
    },
  );

  app.post("/api/payment-methods", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { paymentMethodId } = req.body;

      if (!paymentMethodId) {
        return res
          .status(400)
          .json({ message: "Payment method ID is required" });
      }

      const user = await authStorage.getUser(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(400).json({ message: "Stripe customer not found" });
      }

      try {
        await stripeClient().paymentMethods.attach(paymentMethodId, {
          customer: user.stripeCustomerId,
        });
      } catch (error: any) {
        if (error.code !== "resource_already_owned") {
          throw error;
        }
      }

      const paymentMethod =
        await stripeClient().paymentMethods.retrieve(paymentMethodId);

      const existingPaymentMethods =
        await paymentsStorage.getUserPaymentMethods(userId);
      const isFirstCard = existingPaymentMethods.length === 0;

      const savedPaymentMethod = await paymentsStorage.addPaymentMethod({
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

  app.delete(
    "/api/payment-methods/:id",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const id = parseInt(req.params.id);

        const methods = await paymentsStorage.getUserPaymentMethods(userId);
        const paymentMethod = methods.find((pm) => pm.id === id);

        if (!paymentMethod) {
          return res.status(404).json({ message: "Payment method not found" });
        }

        await stripeClient().paymentMethods.detach(
          paymentMethod.stripePaymentMethodId,
        );
        await paymentsStorage.deletePaymentMethod(id, userId);

        res.json({ success: true });
      } catch (error: any) {
        console.error("Error deleting payment method:", error);
        if (error.message?.includes("not found or unauthorized")) {
          return res.status(404).json({ message: "Payment method not found" });
        }
        res.status(500).json({ message: "Failed to delete payment method" });
      }
    },
  );

  app.put(
    "/api/payment-methods/:id/default",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const id = parseInt(req.params.id);

        await paymentsStorage.setDefaultPaymentMethod(userId, id);

        res.json({ success: true });
      } catch (error: any) {
        console.error("Error setting default payment method:", error);
        if (error.message?.includes("not found or unauthorized")) {
          return res.status(404).json({ message: "Payment method not found" });
        }
        res
          .status(500)
          .json({ message: "Failed to set default payment method" });
      }
    },
  );

  app.post(
    "/api/create-payment-intent",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.id;
        const {
          items,
          pickupTime,
          specialInstructions,
          subtotal,
          tax,
          total,
        } = req.body;

        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        const paymentIntent = await stripeClient().paymentIntents.create({
          amount: Math.round(parseFloat(total) * 100),
          currency: "aed",
          metadata: {
            userId,
            orderNumber,
          },
        });

        const orderItemsData = await Promise.all(
          items.map(async (item: any) => {
            const menuItem = await menuStorage.getMenuItemById(item.menuItemId);
            if (!menuItem)
              throw new Error(`Menu item ${item.menuItemId} not found`);

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
            paymentMethod: "card",
            paymentIntentId: paymentIntent.id,
            paymentStatus: "pending",
          },
          orderItemsData,
        );

        broadcastWs({ type: "NEW_ORDER", orderId: order.id });

        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({
          message: "Error creating payment intent: " + error.message,
        });
      }
    },
  );
}
