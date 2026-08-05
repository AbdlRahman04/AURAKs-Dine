import { desc, eq } from "drizzle-orm";
import { db } from "../../server/db";
import {
  feedback,
  type Feedback,
  type InsertFeedback,
} from "./schema";

export const feedbackStorage = {
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();
    return newFeedback;
  },

  async getAllFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(desc(feedback.createdAt));
  },

  async getUserFeedback(userId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(desc(feedback.createdAt));
  },

  async updateFeedbackStatus(id: number, status: string): Promise<Feedback> {
    const [updatedFeedback] = await db
      .update(feedback)
      .set({ status, updatedAt: new Date() })
      .where(eq(feedback.id, id))
      .returning();
    return updatedFeedback;
  },
};
