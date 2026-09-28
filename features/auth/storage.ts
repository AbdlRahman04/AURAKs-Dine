import { eq, desc, sql, and, gt } from "drizzle-orm";
import { db } from "../../server/db";
import { users, sessions, passwordResetTokens, type User, type UpsertUser } from "./schema";
import { sanitizeUser, sanitizeUsers, type SafeUser } from "../../server/sanitizeUser";

export const authStorage = {
  async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    await db.transaction(async (tx) => {
      await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
      await tx.insert(passwordResetTokens).values({ userId, tokenHash, expiresAt });
    });
  },

  async resetPassword(tokenHash: string, passwordHash: string): Promise<boolean> {
    return db.transaction(async (tx) => {
      const [token] = await tx
        .delete(passwordResetTokens)
        .where(and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          gt(passwordResetTokens.expiresAt, new Date()),
        ))
        .returning({ userId: passwordResetTokens.userId });

      if (!token) return false;

      await tx.update(users)
        .set({ password: passwordHash, updatedAt: new Date() })
        .where(eq(users.id, token.userId));
      await tx.delete(sessions)
        .where(sql`${sessions.sess}->'passport'->>'user' = ${token.userId}`);
      return true;
    });
  },

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  },

  async createUser(userData: UpsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(userData).returning();
      return user;
    } catch (error: any) {
      if (error?.code === "42P01") {
        throw new Error(
          'Database table "users" does not exist. Please run database migrations first.',
        );
      }
      if (error?.code === "23505") {
        throw new Error("Email or student ID already exists");
      }
      throw error;
    }
  },

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await db
      .select()
      .from(users)
      .where(sql`${users.email} = ${userData.email} OR ${users.id} = ${userData.id}`)
      .limit(1);

    if (existingUser.length > 0) {
      const [user] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(sql`${users.email} = ${userData.email} OR ${users.id} = ${userData.id}`)
        .returning();
      return user;
    }

    const [user] = await db.insert(users).values(userData).returning();
    return user;
  },

  async updateUserProfile(
    id: string,
    updates: Partial<Pick<User,
      | "firstName"
      | "lastName"
      | "studentId"
      | "phoneNumber"
      | "preferredPickupLocation"
      | "dietaryRestrictions"
      | "allergies"
    >>,
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  },

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  },

  async getAllUsersSafe(): Promise<SafeUser[]> {
    return sanitizeUsers(await this.getAllUsers());
  },

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  },

  async updateUserStripeCustomerId(
    userId: string,
    stripeCustomerId: string,
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  },
};

export { sanitizeUser };
