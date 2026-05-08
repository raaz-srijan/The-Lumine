import type { NextFunction, Request, Response } from "express";
import { Role } from "../models/roleSchema.js";

/**
 * RBAC Middleware
 * Supports:
 * 1. Role-based check: rbac(["admin", "owner", "staff"])
 * 2. Permission-based check: rbac("read:inventory")
 */
export const rbac = (requirement: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoleName = req.user?.role?.toLowerCase();
      if (!userRoleName) {
        return res.status(403).json({
          success: false,
          message: "Access denied: No role assigned to user"
        });
      }

      if (userRoleName === "admin" || userRoleName === "owner") {
        return next();
      }

      // 2. Role-based check (Array of allowed roles)
      if (Array.isArray(requirement)) {
        if (requirement.map(r => r.toLowerCase()).includes(userRoleName)) {
          return next();
        }
        return res.status(403).json({
          success: false,
          message: `Access denied: Role '${userRoleName}' is not authorized for this resource`
        });
      }

      // 3. Permission-based check (Single string requirement)
      // Fetch the role from DB with populated permissions
      const roleDoc = await Role.findOne({ name: userRoleName }).populate("permissions");
      
      if (!roleDoc) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Role '${userRoleName}' not found in database. Please ensure database is seeded.`
        });
      }

      // Check if any of the role's permissions match the requirement
      const hasPermission = (roleDoc.permissions as any[]).some(
        (p) => p.name === requirement
      );

      if (hasPermission) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Access denied: Role '${userRoleName}' lacks the required permission: '${requirement}'`
      });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Internal server error during authorization",
        error: error.message
      });
    }
  };
};
