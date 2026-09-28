import type { Express } from "express";
import { isAuthenticated, isAdmin } from "../../server/localAuth";
import { sanitizeUser } from "../../server/sanitizeUser";
import { authStorage } from "./storage";
import { ordersStorage } from "../orders/storage";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { isPasswordResetEmailConfigured, sendPasswordResetEmail } from "./passwordResetEmail";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const RESET_REQUEST_WINDOW_MS = 60 * 1000;
const RESET_REQUEST_LIMIT = 5;
const resetRequests = new Map<string, { count: number; windowStartedAt: number }>();
const profileFields = new Set([
  "firstName",
  "lastName",
  "studentId",
  "phoneNumber",
  "preferredPickupLocation",
  "dietaryRestrictions",
  "allergies",
]);

function parseProfileUpdates(input: unknown): Partial<{
  firstName: string | null;
  lastName: string | null;
  studentId: string | null;
  phoneNumber: string | null;
  preferredPickupLocation: string | null;
  dietaryRestrictions: string[];
  allergies: string[];
}> | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const entries = Object.entries(input);
  if (entries.length === 0 || entries.some(([key]) => !profileFields.has(key))) return null;

  const updates: Record<string, string | string[] | null> = {};
  const stringLimits: Record<string, number> = {
    firstName: 100,
    lastName: 100,
    studentId: 10,
    phoneNumber: 32,
    preferredPickupLocation: 120,
  };
  for (const [key, value] of entries) {
    if (key in stringLimits) {
      if (typeof value !== "string" || value.length > stringLimits[key]) return null;
      updates[key] = value.trim();
      continue;
    }
    if (key === "dietaryRestrictions" || key === "allergies") {
      if (!Array.isArray(value) || value.length > 50 ||
          value.some((item) => typeof item !== "string" || item.length > 100)) return null;
      updates[key] = value.map((item: string) => item.trim()).filter(Boolean);
      continue;
    }
    return null;
  }
  return updates;
}

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function allowResetRequest(key: string): boolean {
  const now = Date.now();
  const previous = resetRequests.get(key);
  if (!previous || now - previous.windowStartedAt >= RESET_REQUEST_WINDOW_MS) {
    resetRequests.set(key, { count: 1, windowStartedAt: now });
    if (resetRequests.size > 5000) {
      resetRequests.forEach((value, entryKey) => {
        if (now - value.windowStartedAt >= RESET_REQUEST_WINDOW_MS) resetRequests.delete(entryKey);
      });
    }
    return true;
  }
  if (previous.count >= RESET_REQUEST_LIMIT) return false;
  previous.count += 1;
  return true;
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/forgot-password", async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    if (!allowResetRequest(req.ip || "unknown")) {
      return res.status(429).json({ message: "Please wait before requesting another reset link." });
    }
    if (!isPasswordResetEmailConfigured()) {
      return res.status(503).json({ message: "Password reset email is not configured." });
    }

    try {
      if (email && email.length <= 254) {
        const user = await authStorage.getUserByEmail(email);
        if (user?.password) {
          const token = randomBytes(32).toString("base64url");
          await authStorage.createPasswordResetToken(
            user.id,
            hashResetToken(token),
            new Date(Date.now() + RESET_TOKEN_TTL_MS),
          );
          try {
            await sendPasswordResetEmail(email, token);
          } catch (error) {
            // Keep the response the same for registered and unregistered emails.
            console.error("Password reset email delivery failed:", error instanceof Error ? error.message : "Unknown error");
          }
        }
      }
      res.json({ message: "If an account exists for that email, a reset link has been sent." });
    } catch (error) {
      console.error("Password reset request failed:", error instanceof Error ? error.message : "Unknown error");
      res.status(500).json({ message: "Could not send a reset link right now. Please try again later." });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, password } = req.body ?? {};
    if (typeof token !== "string" || typeof password !== "string" || password.length < 6 || password.length > 128) {
      return res.status(400).json({ message: "Enter a valid reset link and a password between 6 and 128 characters." });
    }
    try {
      const updated = await authStorage.resetPassword(
        hashResetToken(token),
        await bcrypt.hash(password, 10),
      );
      if (!updated) return res.status(400).json({ message: "This reset link is invalid or has expired." });
      res.json({ message: "Your password has been reset. You can now sign in." });
    } catch (error) {
      console.error("Password reset failed:", error instanceof Error ? error.message : "Unknown error");
      res.status(500).json({ message: "Could not reset your password right now. Please try again later." });
    }
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      res.json(sanitizeUser(req.user));
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updates = parseProfileUpdates(req.body);
      if (!updates) {
        return res.status(400).json({ message: "Invalid profile fields." });
      }
      const user = await authStorage.updateUserProfile(userId, updates);
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const allUsers = await authStorage.getAllUsersSafe();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch(
    "/api/admin/users/:id",
    isAuthenticated,
    isAdmin,
    async (req: any, res) => {
      try {
        const adminId = req.user.id;
        const { id } = req.params;
        const { role } = req.body;

        if (role !== "student" && role !== "admin") {
          return res
            .status(400)
            .json({ message: "Invalid role. Must be 'student' or 'admin'" });
        }

        const targetUser = await authStorage.getUser(id);
        if (!targetUser) {
          return res.status(404).json({ message: "User not found" });
        }

        if (targetUser.role === "admin" && role === "student") {
          return res.status(403).json({
            message:
              "Cannot demote admin users. Admins cannot remove admin privileges from other admins.",
          });
        }

        if (id === adminId && role === "student") {
          return res
            .status(403)
            .json({ message: "Cannot remove your own admin role" });
        }

        const previousRole = targetUser.role;
        const updatedUser = await authStorage.updateUserRole(id, role);

        await ordersStorage.createAuditLog({
          userId: adminId,
          action: "updated_user_role",
          entityType: "user",
          entityId: id,
          details: {
            previousRole,
            newRole: role,
            targetUserEmail: targetUser.email,
            targetUserName: `${targetUser.firstName} ${targetUser.lastName}`,
          },
        });

        res.json(sanitizeUser(updatedUser));
      } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Failed to update user role" });
      }
    },
  );
}
