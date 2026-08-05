/**
 * Thin storage facade — delegates to feature storages.
 * Prefer importing from features/{name}/storage.ts in new code.
 */
import { authStorage } from "../features/auth/storage";
import { menuStorage } from "../features/menu/storage";
import { ordersStorage } from "../features/orders/storage";
import { favoritesStorage } from "../features/favorites/storage";
import { feedbackStorage } from "../features/feedback/storage";
import { paymentsStorage } from "../features/payments/storage";

export const storage = {
  ...authStorage,
  ...menuStorage,
  ...ordersStorage,
  ...favoritesStorage,
  ...feedbackStorage,
  ...paymentsStorage,
};
