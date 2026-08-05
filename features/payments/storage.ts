import { and, desc, eq } from "drizzle-orm";
import { db } from "../../server/db";
import {
  paymentMethods,
  type PaymentMethod,
  type InsertPaymentMethod,
} from "./schema";

export const paymentsStorage = {
  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, userId))
      .orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.createdAt));
  },

  async addPaymentMethod(
    paymentMethodData: InsertPaymentMethod,
  ): Promise<PaymentMethod> {
    const [newPaymentMethod] = await db
      .insert(paymentMethods)
      .values(paymentMethodData)
      .returning();
    return newPaymentMethod;
  },

  async deletePaymentMethod(id: number, userId: string): Promise<void> {
    const [paymentMethod] = await db
      .select()
      .from(paymentMethods)
      .where(
        and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)),
      );

    if (!paymentMethod) {
      throw new Error("Payment method not found or unauthorized");
    }

    const wasDefault = paymentMethod.isDefault;
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));

    if (wasDefault) {
      const [nextPaymentMethod] = await db
        .select()
        .from(paymentMethods)
        .where(eq(paymentMethods.userId, userId))
        .orderBy(desc(paymentMethods.createdAt))
        .limit(1);

      if (nextPaymentMethod) {
        await db
          .update(paymentMethods)
          .set({ isDefault: true })
          .where(eq(paymentMethods.id, nextPaymentMethod.id));
      }
    }
  },

  async setDefaultPaymentMethod(
    userId: string,
    paymentMethodId: number,
  ): Promise<void> {
    const [existingPaymentMethod] = await db
      .select()
      .from(paymentMethods)
      .where(
        and(
          eq(paymentMethods.id, paymentMethodId),
          eq(paymentMethods.userId, userId),
        ),
      );

    if (!existingPaymentMethod) {
      throw new Error("Payment method not found or unauthorized");
    }

    await db
      .update(paymentMethods)
      .set({ isDefault: false })
      .where(eq(paymentMethods.userId, userId));

    await db
      .update(paymentMethods)
      .set({ isDefault: true })
      .where(eq(paymentMethods.id, paymentMethodId));
  },
};
