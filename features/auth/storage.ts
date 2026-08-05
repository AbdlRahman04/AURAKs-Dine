import { eq, desc, sql } from "drizzle-orm";
import { db } from "../../server/db";
import { users, type User, type UpsertUser } from "./schema";
import { sanitizeUser, sanitizeUsers, type SafeUser } from "../../server/sanitizeUser";

export const authStorage = {
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

  async updateUserProfile(id: string, updates: Partial<User>): Promise<User> {
    const { password: _p, ...safeUpdates } = updates as Partial<User> & {
      password?: string;
    };
    const [user] = await db
      .update(users)
      .set({ ...safeUpdates, updatedAt: new Date() })
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
