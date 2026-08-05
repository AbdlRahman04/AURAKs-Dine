import type { Express } from "express";
import { isAuthenticated, isAdmin } from "../../server/localAuth";
import { sanitizeUser } from "../../server/sanitizeUser";
import { authStorage } from "./storage";
import { ordersStorage } from "../orders/storage";

export function registerAuthRoutes(app: Express) {
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
      const updates = req.body;
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
